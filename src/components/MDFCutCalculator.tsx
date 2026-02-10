import { useState, useMemo, useCallback } from "react";
import { Ruler, Plus, Trash2, AlertTriangle, CheckCircle, Grid3X3 } from "lucide-react";
import DownloadImageButton from "./DownloadImageButton";
import SaveMeasurementButton from "./SaveMeasurementButton";

interface CutPiece {
  id: string;
  width: number;
  height: number;
  quantity: number;
  label: string;
  qtyStr: string; // string for controlled input
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

// Guillotine bin packing - much better utilization than shelf-based
const packPieces = (
  pieces: CutPiece[],
  sheetW: number,
  sheetH: number
): { placed: PlacedPiece[]; overflow: PlacedPiece[] } => {
  const expanded: { piece: CutPiece; index: number }[] = [];
  pieces.forEach((p) => {
    for (let i = 0; i < p.quantity; i++) {
      expanded.push({ piece: p, index: i });
    }
  });

  // Sort by area descending for better packing
  expanded.sort((a, b) => {
    const areaB = b.piece.width * b.piece.height;
    const areaA = a.piece.width * a.piece.height;
    if (areaB !== areaA) return areaB - areaA;
    return Math.max(b.piece.width, b.piece.height) - Math.max(a.piece.width, a.piece.height);
  });

  const freeRects: FreeRect[] = [{ x: 0, y: 0, w: sheetW, h: sheetH }];
  const placed: PlacedPiece[] = [];
  const overflow: PlacedPiece[] = [];

  for (const { piece, index } of expanded) {
    let bestRectIdx = -1;
    let bestRotated = false;
    let bestScore = Infinity;

    for (let ri = 0; ri < freeRects.length; ri++) {
      const rect = freeRects[ri];

      // Try normal orientation
      if (piece.width <= rect.w && piece.height <= rect.h) {
        // Best short side fit
        const score = Math.min(rect.w - piece.width, rect.h - piece.height);
        if (score < bestScore) {
          bestScore = score;
          bestRectIdx = ri;
          bestRotated = false;
        }
      }

      // Try rotated
      if (piece.height <= rect.w && piece.width <= rect.h) {
        const score = Math.min(rect.w - piece.height, rect.h - piece.width);
        if (score < bestScore) {
          bestScore = score;
          bestRectIdx = ri;
          bestRotated = true;
        }
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

    // Split remaining space (guillotine split - choose shorter leftover axis)
    freeRects.splice(bestRectIdx, 1);

    const rightW = rect.w - pw;
    const bottomH = rect.h - ph;

    if (rightW > 0 && bottomH > 0) {
      // Split along shorter leftover to minimize waste
      if (rightW < bottomH) {
        // Horizontal split
        if (rightW > 0) freeRects.push({ x: rect.x + pw, y: rect.y, w: rightW, h: ph });
        if (bottomH > 0) freeRects.push({ x: rect.x, y: rect.y + ph, w: rect.w, h: bottomH });
      } else {
        // Vertical split
        if (bottomH > 0) freeRects.push({ x: rect.x, y: rect.y + ph, w: pw, h: bottomH });
        if (rightW > 0) freeRects.push({ x: rect.x + pw, y: rect.y, w: rightW, h: rect.h });
      }
    } else if (rightW > 0) {
      freeRects.push({ x: rect.x + pw, y: rect.y, w: rightW, h: rect.h });
    } else if (bottomH > 0) {
      freeRects.push({ x: rect.x, y: rect.y + ph, w: rect.w, h: bottomH });
    }

    // Sort free rects by area ascending for best fit
    freeRects.sort((a, b) => a.w * a.h - b.w * b.h);
  }

  return { placed, overflow };
};

const COLORS = [
  "hsl(20, 55%, 30%)",
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

const MDFCutCalculator = () => {
  const [sheetWidth, setSheetWidth] = useState<string>("275");
  const [sheetHeight, setSheetHeight] = useState<string>("185");
  const [pieces, setPieces] = useState<CutPiece[]>([
    { id: crypto.randomUUID(), width: 0, height: 0, quantity: 1, label: "", qtyStr: "1" },
  ]);

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
    const usedArea = result.placed.reduce((sum, p) => {
      return sum + p.piece.width * p.piece.height;
    }, 0);
    const wasteArea = sheetArea - usedArea;
    const wastePercent = (wasteArea / sheetArea) * 100;
    const totalPieces = validPieces.reduce((s, p) => s + p.quantity, 0);
    return { sheetArea, usedArea, wasteArea, wastePercent, totalPieces };
  }, [result, sw, sh, validPieces, hasSheet]);

  const hasResults = result !== null && stats !== null;

  // Visual scale
  const maxVisualWidth = 340;
  const scale = hasSheet ? Math.min(maxVisualWidth / sw, 400 / sh) : 1;

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
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Largura da Chapa (cm)
            </label>
            <input
              type="number"
              value={sheetWidth}
              onChange={(e) => setSheetWidth(e.target.value)}
              placeholder="275"
              className="input-wood w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Altura da Chapa (cm)
            </label>
            <input
              type="number"
              value={sheetHeight}
              onChange={(e) => setSheetHeight(e.target.value)}
              placeholder="185"
              className="input-wood w-full"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Padrão: 275 × 185 cm
        </p>
      </div>

      {/* Pieces list */}
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" />
          Peças para Cortar
        </h2>

        <div className="space-y-4">
          {pieces.map((piece, idx) => (
            <div
              key={piece.id}
              className="p-4 bg-secondary/30 rounded-2xl border border-border/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getColor(piece.id, pieces) }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    Peça {idx + 1}
                  </span>
                </div>
                {pieces.length > 1 && (
                  <button
                    onClick={() => removePiece(piece.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={piece.label}
                  onChange={(e) => updatePiece(piece.id, "label", e.target.value)}
                  placeholder="Nome da peça (opcional)"
                  className="input-wood w-full !py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Largura (cm)
                  </label>
                  <input
                    type="number"
                    value={piece.width || ""}
                    onChange={(e) =>
                      updatePiece(piece.id, "width", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="input-wood w-full !py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={piece.height || ""}
                    onChange={(e) =>
                      updatePiece(piece.id, "height", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="input-wood w-full !py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Qtd
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={piece.quantity}
                    onChange={(e) =>
                      updatePiece(
                        piece.id,
                        "quantity",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="input-wood w-full !py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addPiece}
          className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-primary/40 text-primary font-semibold
                     hover:bg-primary/5 hover:border-primary/60 transition-all flex items-center justify-center gap-2"
        >
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
              <p className="text-lg font-bold text-primary">
                {(100 - stats.wastePercent).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Desperdício</p>
              <p className={`text-lg font-bold ${stats.wastePercent > 30 ? "text-destructive" : "text-muted-foreground"}`}>
                {stats.wastePercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Overflow warning */}
          {result.overflow.length > 0 && (
            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/30 mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  {result.overflow.length} peça(s) não couberam na chapa!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Essas peças excedem o tamanho da chapa ou não há espaço suficiente. Considere usar outra chapa.
                </p>
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
              <p className="text-sm font-semibold text-primary">
                Todas as peças cabem na chapa!
              </p>
            </div>
          )}

          {/* Visual distribution */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Distribuição Visual
            </h3>
            <div className="flex justify-center overflow-x-auto pb-2">
              <div
                className="relative border-2 border-foreground/30 rounded-lg bg-secondary/20"
                style={{
                  width: sw * scale,
                  height: sh * scale,
                }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: `${50 * scale}px ${50 * scale}px`,
                  }}
                />

                {result.placed.map((p, i) => {
                  const pw = p.rotated ? p.piece.height : p.piece.width;
                  const ph = p.rotated ? p.piece.width : p.piece.height;
                  const color = getColor(p.piece.id, validPieces);
                  const pieceIdx = pieces.findIndex((pc) => pc.id === p.piece.id) + 1;

                  return (
                    <div
                      key={i}
                      className="absolute border border-foreground/20 flex items-center justify-center overflow-hidden"
                      style={{
                        left: p.x * scale,
                        top: p.y * scale,
                        width: pw * scale,
                        height: ph * scale,
                        backgroundColor: color,
                        opacity: 0.8,
                      }}
                      title={`${p.piece.label || `Peça ${pieceIdx}`}: ${p.piece.width}×${p.piece.height} cm${p.rotated ? " (girada)" : ""}`}
                    >
                      {pw * scale > 28 && ph * scale > 16 && (
                        <span className="text-[9px] md:text-[10px] font-bold text-white text-center leading-tight drop-shadow-md px-0.5">
                          {pieceIdx}
                          {p.rotated && " ↻"}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Sheet dimensions labels */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-medium">
                  {sw} cm
                </div>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 writing-vertical text-[10px] text-muted-foreground font-medium">
                  {sh} cm
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Legenda</h3>
            <div className="grid grid-cols-1 gap-2">
              {validPieces.map((piece, idx) => (
                <div
                  key={piece.id}
                  className="flex items-center gap-3 p-2 bg-secondary/20 rounded-xl text-sm"
                >
                  <div
                    className="w-5 h-5 rounded shrink-0"
                    style={{ backgroundColor: getColor(piece.id, validPieces), opacity: 0.8 }}
                  />
                  <span className="font-medium text-foreground">
                    {piece.label || `Peça ${idx + 1}`}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    {piece.width} × {piece.height} cm × {piece.quantity}
                  </span>
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
                      <span className="text-amber-400 font-bold text-sm">
                        {p.width}×{p.height} cm ×{p.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {result.overflow.length > 0 && (
                <div className="bg-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 font-semibold text-sm">
                    ⚠️ {result.overflow.length} peça(s) não couberam!
                  </p>
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
