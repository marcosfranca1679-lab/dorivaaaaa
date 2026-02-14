import { useState, useMemo, useCallback, useEffect } from "react";
import { Ruler, Plus, Trash2, AlertTriangle, CheckCircle, Grid3X3, Scissors } from "lucide-react";
import DownloadImageButton from "./DownloadImageButton";
import SaveMeasurementButton from "./SaveMeasurementButton";
import { useAppActions } from "@/contexts/AppActionsContext";
import { toast } from "sonner";

interface CutPiece {
  id: string;
  width: number;
  height: number;
  quantity: number;
  label: string;
  qtyStr: string;
}

interface PlacedPiece {
  piece: CutPiece;
  x: number;
  y: number;
  rotated: boolean;
  index: number;
}

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CutLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Guillotine bin packing — optimized for table saw (straight cuts only)
// Uses Best Area Fit + smart split to maximize sheet utilization
const packWithStrategy = (
  expanded: { piece: CutPiece; index: number }[],
  sheetW: number,
  sheetH: number,
  splitMode: "longer" | "shorter" | "area" | "horizontal" | "vertical" = "longer"
): { placed: PlacedPiece[]; overflow: PlacedPiece[]; cutLines: CutLine[] } => {
  const freeRects: FreeRect[] = [{ x: 0, y: 0, w: sheetW, h: sheetH }];
  const placed: PlacedPiece[] = [];
  const overflow: PlacedPiece[] = [];
  const cutLines: CutLine[] = [];

  const tryFit = (pw: number, ph: number, rect: FreeRect): number => {
    if (pw > rect.w || ph > rect.h) return Infinity;
    // Best Short Side Fit: minimize the shortest leftover side
    return Math.min(rect.w - pw, rect.h - ph);
  };

  for (const { piece, index } of expanded) {
    let bestRectIdx = -1;
    let bestRotated = false;
    let bestScore = Infinity;

    for (let ri = 0; ri < freeRects.length; ri++) {
      const rect = freeRects[ri];

      // Normal orientation
      const scoreN = tryFit(piece.width, piece.height, rect);
      if (scoreN < bestScore) {
        bestScore = scoreN;
        bestRectIdx = ri;
        bestRotated = false;
      }

      // Rotated 90°
      const scoreR = tryFit(piece.height, piece.width, rect);
      if (scoreR < bestScore) {
        bestScore = scoreR;
        bestRectIdx = ri;
        bestRotated = true;
      }
    }

    if (bestRectIdx === -1) {
      overflow.push({ piece, x: 0, y: 0, rotated: false, index });
      continue;
    }

    const rect = freeRects[bestRectIdx];
    const pw = bestRotated ? piece.height : piece.width;
    const ph = bestRotated ? piece.width : piece.height;

    placed.push({ piece, x: rect.x, y: rect.y, rotated: bestRotated, index });

    const rightW = rect.w - pw;
    const bottomH = rect.h - ph;

    freeRects.splice(bestRectIdx, 1);

    // Decide split direction based on mode — always straight cuts
    let splitHorizontally: boolean;
    if (rightW <= 0 && bottomH <= 0) {
      continue; // Perfect fit
    } else if (rightW <= 0) {
      splitHorizontally = true;
    } else if (bottomH <= 0) {
      splitHorizontally = false;
    } else {
      // Choose split to maximize the larger remaining rectangle
      switch (splitMode) {
        case "horizontal":
          splitHorizontally = true;
          break;
        case "vertical":
          splitHorizontally = false;
          break;
        case "shorter":
          // Split along shorter remainder → keeps bigger piece intact
          splitHorizontally = bottomH <= rightW;
          break;
        case "area": {
          // Split to maximize the area of the larger remaining piece
          const hArea = Math.max(rect.w * bottomH, rightW * ph);
          const vArea = Math.max(pw * bottomH, rightW * rect.h);
          splitHorizontally = hArea >= vArea;
          break;
        }
        case "longer":
        default:
          // Split along the longer side of the free rect → keeps long strips
          splitHorizontally = rect.w >= rect.h;
          break;
      }
    }

    if (splitHorizontally) {
      // Horizontal cut across full width at y + ph
      cutLines.push({ x1: rect.x, y1: rect.y + ph, x2: rect.x + rect.w, y2: rect.y + ph });
      if (rightW > 0) {
        // Vertical cut in the top strip
        cutLines.push({ x1: rect.x + pw, y1: rect.y, x2: rect.x + pw, y2: rect.y + ph });
        freeRects.push({ x: rect.x + pw, y: rect.y, w: rightW, h: ph });
      }
      if (bottomH > 0) {
        freeRects.push({ x: rect.x, y: rect.y + ph, w: rect.w, h: bottomH });
      }
    } else {
      // Vertical cut across full height at x + pw
      cutLines.push({ x1: rect.x + pw, y1: rect.y, x2: rect.x + pw, y2: rect.y + rect.h });
      if (bottomH > 0) {
        // Horizontal cut in the left strip
        cutLines.push({ x1: rect.x, y1: rect.y + ph, x2: rect.x + pw, y2: rect.y + ph });
        freeRects.push({ x: rect.x, y: rect.y + ph, w: pw, h: bottomH });
      }
      if (rightW > 0) {
        freeRects.push({ x: rect.x + pw, y: rect.y, w: rightW, h: rect.h });
      }
    }

    // Sort free rects: prefer smaller areas for tighter packing
    freeRects.sort((a, b) => a.w * a.h - b.w * b.h);
  }

  return { placed, overflow, cutLines };
};

const packPieces = (
  pieces: CutPiece[],
  sheetW: number,
  sheetH: number
): { placed: PlacedPiece[]; overflow: PlacedPiece[]; cutLines: CutLine[] } => {
  const expanded: { piece: CutPiece; index: number }[] = [];
  pieces.forEach((p) => {
    for (let i = 0; i < p.quantity; i++) {
      expanded.push({ piece: p, index: i });
    }
  });

  // Sorting strategies
  const sortStrategies: ((a: { piece: CutPiece }, b: { piece: CutPiece }) => number)[] = [
    (a, b) => b.piece.width * b.piece.height - a.piece.width * a.piece.height, // Area
    (a, b) => Math.max(b.piece.width, b.piece.height) - Math.max(a.piece.width, a.piece.height), // Max side
    (a, b) => b.piece.height - a.piece.height || b.piece.width - a.piece.width, // Height
    (a, b) => b.piece.width - a.piece.width || b.piece.height - a.piece.height, // Width
    (a, b) => (b.piece.width + b.piece.height) - (a.piece.width + a.piece.height), // Perimeter
  ];

  // Split modes to try
  const splitModes: ("longer" | "shorter" | "area" | "horizontal" | "vertical")[] = [
    "longer", "shorter", "area", "horizontal", "vertical",
  ];

  let bestResult: ReturnType<typeof packWithStrategy> | null = null;
  let bestScore = -1;

  // Try all combinations of sort × split × orientation
  for (const sortFn of sortStrategies) {
    const sorted = [...expanded].sort(sortFn);
    for (const splitMode of splitModes) {
      // Try normal orientation
      const res1 = packWithStrategy(sorted, sheetW, sheetH, splitMode);
      const score1 = res1.placed.length * 1000000 + res1.placed.reduce((s, p) => s + p.piece.width * p.piece.height, 0);
      if (score1 > bestScore) { bestScore = score1; bestResult = res1; }

      // Try swapped sheet orientation (then remap coords back)
      if (sheetW !== sheetH) {
        const res2 = packWithStrategy(sorted, sheetH, sheetW, splitMode);
        const score2 = res2.placed.length * 1000000 + res2.placed.reduce((s, p) => s + p.piece.width * p.piece.height, 0);
        if (score2 > bestScore) {
          bestScore = score2;
          // Remap: swap x↔y coordinates and rotations so it fits original sheet
          bestResult = {
            placed: res2.placed.map(p => ({
              ...p,
              x: p.y,
              y: p.x,
              rotated: !p.rotated,
            })),
            overflow: res2.overflow,
            cutLines: res2.cutLines.map(l => ({ x1: l.y1, y1: l.x1, x2: l.y2, y2: l.x2 })),
          };
        }
      }
    }
  }

  return bestResult!;
};

const COLORS = [
  "hsl(20, 55%, 35%)",
  "hsl(28, 65%, 48%)",
  "hsl(200, 50%, 45%)",
  "hsl(150, 45%, 40%)",
  "hsl(280, 40%, 50%)",
  "hsl(350, 50%, 50%)",
  "hsl(45, 60%, 50%)",
  "hsl(170, 50%, 40%)",
];

const getColor = (pieceId: string, allPieces: CutPiece[]) => {
  const idx = allPieces.findIndex((p) => p.id === pieceId);
  return COLORS[idx % COLORS.length];
};

// Deduplicate cut lines (avoid drawing same line twice)
const deduplicateLines = (lines: CutLine[]): CutLine[] => {
  const seen = new Set<string>();
  return lines.filter((l) => {
    const key = `${l.x1.toFixed(1)},${l.y1.toFixed(1)},${l.x2.toFixed(1)},${l.y2.toFixed(1)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const VisualCutMap = ({
  placed,
  cutLines,
  sw,
  sh,
  scale,
  pieces,
  validPieces,
  forDownload = false,
  showCutLines = false,
}: {
  placed: PlacedPiece[];
  cutLines: CutLine[];
  sw: number;
  sh: number;
  scale: number;
  pieces: CutPiece[];
  validPieces: CutPiece[];
  forDownload?: boolean;
  showCutLines?: boolean;
}) => {
  const borderCol = forDownload ? "rgba(255,255,255,0.6)" : "hsl(var(--foreground) / 0.5)";
  const bgCol = forDownload ? "rgba(200,180,150,0.15)" : "hsl(var(--secondary) / 0.15)";

  return (
    <div
      className="relative"
      style={{
        width: sw * scale,
        height: sh * scale,
        border: `2px solid ${borderCol}`,
        background: bgCol,
      }}
    >
      {/* Background - MDF color */}
      <div className="absolute inset-0" style={{
        background: forDownload
          ? "linear-gradient(135deg, rgba(210,180,140,0.2), rgba(180,150,110,0.15))"
          : "linear-gradient(135deg, hsl(30 30% 75% / 0.15), hsl(30 20% 60% / 0.1))",
      }} />

      {/* Grid every 50cm */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: forDownload
            ? `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`
            : `linear-gradient(hsl(var(--foreground) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.06) 1px, transparent 1px)`,
          backgroundSize: `${50 * scale}px ${50 * scale}px`,
        }}
      />

      {/* Placed pieces with solid borders */}
      {placed.map((p, i) => {
        const pw = p.rotated ? p.piece.height : p.piece.width;
        const ph = p.rotated ? p.piece.width : p.piece.height;
        const color = getColor(p.piece.id, validPieces);
        const pieceIdx = pieces.findIndex((pc) => pc.id === p.piece.id) + 1;
        const pxW = pw * scale;
        const pxH = ph * scale;
        const showLabel = pxW > 20 && pxH > 14;
        const showDims = pxW > 35 && pxH > 26;

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: p.x * scale,
              top: p.y * scale,
              width: pxW,
              height: pxH,
              backgroundColor: color,
              border: forDownload ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid hsl(var(--foreground) / 0.35)",
              boxSizing: "border-box",
            }}
            title={`${p.piece.label || `Peça ${pieceIdx}`}: ${pw}×${ph} cm${p.rotated ? " (girada)" : ""}`}
          >
            {showLabel && (
              <span
                className="font-bold leading-none text-center"
                style={{
                  fontSize: Math.max(7, Math.min(11, pxW / 5)),
                  color: "white",
                  textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                }}
              >
                {p.piece.label || `P${pieceIdx}`}
                {p.rotated && " ↻"}
              </span>
            )}
            {showDims && (
              <span
                className="leading-none mt-0.5 text-center"
                style={{
                  fontSize: Math.max(6, Math.min(9, pxW / 6)),
                  color: "rgba(255,255,255,0.9)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                }}
              >
                {pw}×{ph}
              </span>
            )}
          </div>
        );
      })}

      {/* Red cut lines (SVG overlay) */}
      {showCutLines && cutLines.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={sw * scale}
          height={sh * scale}
          style={{ zIndex: 10 }}
        >
          {deduplicateLines(cutLines).map((line, i) => (
            <line
              key={i}
              x1={line.x1 * scale}
              y1={line.y1 * scale}
              x2={line.x2 * scale}
              y2={line.y2 * scale}
              stroke="red"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              opacity={0.85}
            />
          ))}
        </svg>
      )}

      {/* Dimension labels */}
      {!forDownload && (
        <>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-semibold whitespace-nowrap">
            ← {sw} cm →
          </div>
          <div
            className="absolute top-1/2 -left-6 -translate-y-1/2 text-[10px] text-muted-foreground font-semibold"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg) translateX(50%)" }}
          >
            ← {sh} cm →
          </div>
        </>
      )}

      {/* Download-only labels */}
      {forDownload && (
        <>
          <div style={{ position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, whiteSpace: "nowrap" }}>
            ← {sw} cm →
          </div>
          <div style={{ position: "absolute", top: "50%", left: -18, transform: "rotate(180deg) translateX(50%)", writingMode: "vertical-rl" as const, fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
            ← {sh} cm →
          </div>
        </>
      )}
    </div>
  );
};

const MDFCutCalculator = () => {
  const [sheetWidth, setSheetWidth] = useState<string>("275");
  const [sheetHeight, setSheetHeight] = useState<string>("185");
  const [pieces, setPieces] = useState<CutPiece[]>([
    { id: crypto.randomUUID(), width: 0, height: 0, quantity: 1, label: "", qtyStr: "1" },
  ]);
  const [showCutLines, setShowCutLines] = useState(false);

  const { pendingMDFPieces, clearPendingMDFPieces } = useAppActions();

  // Receive pieces from other calculators
  useEffect(() => {
    if (pendingMDFPieces && pendingMDFPieces.length > 0) {
      const newPieces: CutPiece[] = pendingMDFPieces.map(p => ({
        id: crypto.randomUUID(),
        width: p.width,
        height: p.height,
        quantity: p.quantity,
        label: p.label,
        qtyStr: String(p.quantity),
      }));
      setPieces(prev => {
        // If only default empty piece, replace
        if (prev.length === 1 && prev[0].width === 0 && prev[0].height === 0) {
          return newPieces;
        }
        return [...prev, ...newPieces];
      });
      clearPendingMDFPieces();
      toast.success(`${pendingMDFPieces.length} tipo(s) de peça adicionado(s)!`);
    }
  }, [pendingMDFPieces, clearPendingMDFPieces]);

  const addPiece = useCallback(() => {
    setPieces((prev) => [
      ...prev,
      { id: crypto.randomUUID(), width: 0, height: 0, quantity: 1, label: "", qtyStr: "1" },
    ]);
  }, []);

  const removePiece = useCallback((id: string) => {
    setPieces((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
  }, []);

  const updatePiece = useCallback((id: string, field: keyof CutPiece, value: string | number) => {
    setPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }, []);

  const validPieces = useMemo(
    () => pieces.filter((p) => p.width > 0 && p.height > 0 && p.quantity > 0),
    [pieces]
  );

  const sw = parseFloat(sheetWidth) || 0;
  const sh = parseFloat(sheetHeight) || 0;
  const hasSheet = sw > 0 && sh > 0;

  const result = useMemo(() => {
    if (!hasSheet || validPieces.length === 0) return null;
    return packPieces(validPieces, sw, sh);
  }, [validPieces, sw, sh, hasSheet]);

  const stats = useMemo(() => {
    if (!result || !hasSheet) return null;
    const sheetArea = sw * sh;
    const usedArea = result.placed.reduce((sum, p) => sum + p.piece.width * p.piece.height, 0);
    const wasteArea = sheetArea - usedArea;
    const wastePercent = (wasteArea / sheetArea) * 100;
    const totalPieces = validPieces.reduce((s, p) => s + p.quantity, 0);
    return { sheetArea, usedArea, wasteArea, wastePercent, totalPieces };
  }, [result, sw, sh, validPieces, hasSheet]);

  const hasResults = result !== null && stats !== null;

  const maxVisualWidth = 360;
  const scale = hasSheet ? Math.min(maxVisualWidth / sw, 500 / sh) : 1;

  return (
    <div className="space-y-6">
      {/* Sheet dimensions */}
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          Chapa de MDF
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Largura (cm)</label>
            <input type="number" value={sheetWidth} onChange={(e) => setSheetWidth(e.target.value)} placeholder="275" className="input-wood w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Altura (cm)</label>
            <input type="number" value={sheetHeight} onChange={(e) => setSheetHeight(e.target.value)} placeholder="185" className="input-wood w-full" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">Padrão: 275 × 185 cm</p>
      </div>

      {/* Pieces list */}
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" />
          Peças para Cortar
        </h2>
        <div className="space-y-4">
          {pieces.map((piece, idx) => (
            <div key={piece.id} className="p-4 bg-secondary/30 rounded-2xl border border-border/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getColor(piece.id, pieces) }} />
                  <span className="text-sm font-semibold text-foreground">Peça {idx + 1}</span>
                </div>
                {pieces.length > 1 && (
                  <button onClick={() => removePiece(piece.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <input type="text" value={piece.label} onChange={(e) => updatePiece(piece.id, "label", e.target.value)} placeholder="Nome da peça (opcional)" className="input-wood w-full !py-2 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Largura (cm)</label>
                  <input type="number" value={piece.width || ""} onChange={(e) => updatePiece(piece.id, "width", parseFloat(e.target.value) || 0)} placeholder="0" className="input-wood w-full !py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Altura (cm)</label>
                  <input type="number" value={piece.height || ""} onChange={(e) => updatePiece(piece.id, "height", parseFloat(e.target.value) || 0)} placeholder="0" className="input-wood w-full !py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Qtd</label>
                  <input
                    type="number"
                    min={1}
                    value={piece.qtyStr}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const num = parseInt(raw) || 0;
                      setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, qtyStr: raw, quantity: Math.max(0, num) } : p));
                    }}
                    onBlur={() => {
                      if (!piece.qtyStr || piece.quantity < 1) {
                        setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, qtyStr: "1", quantity: 1 } : p));
                      }
                    }}
                    className="input-wood w-full !py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPiece} className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-primary/40 text-primary font-semibold hover:bg-primary/5 hover:border-primary/60 transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Peça
        </button>
      </div>

      {/* Results */}
      {hasResults && (
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Plano de Corte
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-secondary/30 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Peças</p>
              <p className="text-lg font-bold text-foreground">{stats.totalPieces}</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Aproveitamento</p>
              <p className="text-lg font-bold text-primary">{(100 - stats.wastePercent).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Desperdício</p>
              <p className={`text-lg font-bold ${stats.wastePercent > 30 ? "text-destructive" : "text-muted-foreground"}`}>
                {stats.wastePercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {result.overflow.length > 0 && (
            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/30 mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">{result.overflow.length} peça(s) não couberam!</p>
                <p className="text-xs text-muted-foreground mt-1">Considere usar outra chapa.</p>
                <ul className="mt-2 space-y-1">
                  {result.overflow.map((o, i) => (
                    <li key={i} className="text-xs text-destructive">
                      • {o.piece.label || `Peça ${pieces.findIndex((p) => p.id === o.piece.id) + 1}`}: {o.piece.width} × {o.piece.height} cm
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {result.placed.length > 0 && result.overflow.length === 0 && (
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/30 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-primary">Todas as peças cabem na chapa!</p>
            </div>
          )}

          {/* Visual distribution */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                📐 Distribuição Visual — Serra de Mesa
              </h3>
              <button
                onClick={() => setShowCutLines((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  showCutLines
                    ? "bg-destructive/15 text-destructive border border-destructive/30"
                    : "bg-secondary/50 text-muted-foreground border border-border/50 hover:bg-secondary"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                {showCutLines ? "Linhas ON" : "Linhas OFF"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              {showCutLines ? "Linhas vermelhas = cortes retos para serra de mesa" : "As bordas entre as peças indicam onde cortar"}
            </p>
            <div className="flex justify-center overflow-x-auto pb-6 pt-2 pl-8">
              <VisualCutMap
                placed={result.placed}
                cutLines={result.cutLines}
                sw={sw}
                sh={sh}
                scale={scale}
                pieces={pieces}
                validPieces={validPieces}
                showCutLines={showCutLines}
              />
            </div>
          </div>

          {/* Cut list */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">📏 Lista de Cortes</h3>
            <div className="space-y-1.5">
              {result.placed.map((p, i) => {
                const pw = p.rotated ? p.piece.height : p.piece.width;
                const ph = p.rotated ? p.piece.width : p.piece.height;
                const pieceIdx = pieces.findIndex((pc) => pc.id === p.piece.id) + 1;
                const color = getColor(p.piece.id, validPieces);
                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg text-xs">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color, opacity: 0.85 }} />
                    <span className="font-semibold text-foreground min-w-[60px]">{p.piece.label || `Peça ${pieceIdx}`}</span>
                    <span className="text-primary font-bold">{pw} × {ph} cm</span>
                    {p.rotated && <span className="text-muted-foreground text-[10px]">(girada 90°)</span>}
                    <span className="text-muted-foreground ml-auto text-[10px]">pos: {p.x},{p.y}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Legenda</h3>
            <div className="grid grid-cols-1 gap-2">
              {validPieces.map((piece, idx) => (
                <div key={piece.id} className="flex items-center gap-3 p-2 bg-secondary/20 rounded-xl text-sm">
                  <div className="w-5 h-5 rounded shrink-0" style={{ backgroundColor: getColor(piece.id, validPieces), opacity: 0.8 }} />
                  <span className="font-medium text-foreground">{piece.label || `Peça ${idx + 1}`}</span>
                  <span className="text-muted-foreground ml-auto">{piece.width} × {piece.height} cm × {piece.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download */}
          <DownloadImageButton
            filename={`cortes-mdf-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}`}
            title="Plano de Corte MDF"
          >
            <div className="space-y-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/60 text-xs">Chapa</p>
                <p className="text-white font-bold">{sw} × {sh} cm</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/60 text-xs">Peças</p>
                  <p className="text-white font-bold">{stats.totalPieces}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/60 text-xs">Aproveitamento</p>
                  <p className="text-amber-400 font-bold">{(100 - stats.wastePercent).toFixed(1)}%</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/60 text-xs">Desperdício</p>
                  <p className="text-white font-bold">{stats.wastePercent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="border-t border-white/20 pt-3">
                <p className="text-amber-400 font-semibold mb-2">Peças:</p>
                <div className="space-y-1">
                  {validPieces.map((p, i) => (
                    <div key={p.id} className="bg-amber-500/20 rounded-lg p-2 flex justify-between">
                      <span className="text-white text-sm">{p.label || `Peça ${i + 1}`}</span>
                      <span className="text-amber-400 font-bold text-sm">{p.width}×{p.height} cm ×{p.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Visual in download */}
              <div className="border-t border-white/20 pt-3 mt-2">
                <p className="text-amber-400 font-semibold mb-1">Distribuição Visual:</p>
                <p className="text-white/50 text-[10px] mb-2">Bordas indicam os cortes</p>
                <div className="flex justify-center">
                  <VisualCutMap
                    placed={result.placed}
                    cutLines={result.cutLines}
                    sw={sw}
                    sh={sh}
                    scale={Math.min(620 / sw, 400 / sh)}
                    pieces={pieces}
                    validPieces={validPieces}
                    forDownload
                    showCutLines={showCutLines}
                  />
                </div>
              </div>
              {result.overflow.length > 0 && (
                <div className="bg-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 font-semibold text-sm">⚠️ {result.overflow.length} peça(s) não couberam!</p>
                </div>
              )}
            </div>
          </DownloadImageButton>

          <SaveMeasurementButton
            measurement={{
              type: "Corte MDF",
              label: `${stats.totalPieces} peça(s) em chapa ${sw}×${sh} - Aproveitamento ${(100 - stats.wastePercent).toFixed(1)}%`,
              inputs: [
                { label: "Chapa", value: `${sw} × ${sh} cm` },
                ...validPieces.map((p, i) => ({
                  label: p.label || `Peça ${i + 1}`,
                  value: `${p.width} × ${p.height} cm × ${p.quantity}`,
                })),
              ],
              results: [
                { label: "Aproveitamento", value: `${(100 - stats.wastePercent).toFixed(1)}%`, highlight: true },
                { label: "Desperdício", value: `${stats.wastePercent.toFixed(1)}%` },
                { label: "Total de peças", value: `${stats.totalPieces}` },
                ...(result.overflow.length > 0
                  ? [{ label: "Não couberam", value: `${result.overflow.length} peça(s)`, highlight: true }]
                  : []),
              ],
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MDFCutCalculator;
