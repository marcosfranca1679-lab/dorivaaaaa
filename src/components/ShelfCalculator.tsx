import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DownloadImageButton from "./DownloadImageButton";

const ShelfCalculator = () => {
  const [depth, setDepth] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [openingHeight, setOpeningHeight] = useState<string>("");
  const [mdfThickness, setMdfThickness] = useState<string>("15");
  const [shelfCount, setShelfCount] = useState<string>("");
  const [isThickened, setIsThickened] = useState(false);
  const [showPiton, setShowPiton] = useState(false);

  const calculateResults = () => {
    const depthNum = parseFloat(depth) || 0;
    const widthNum = parseFloat(width) || 0;
    const heightNum = parseFloat(openingHeight) || 0;
    const thicknessNum = parseFloat(mdfThickness) || 0;
    const countNum = parseInt(shelfCount) || 0;

    if (depthNum <= 0 || widthNum <= 0 || heightNum <= 0 || countNum <= 0) {
      return null;
    }

    // Profundidade final = profundidade - 5mm
    const finalDepth = depthNum - 0.5; // em cm (5mm = 0.5cm)

    // Largura final = largura - 1mm
    const finalWidth = widthNum - 0.1; // em cm (1mm = 0.1cm)

    // Espessura em cm
    const thicknessCm = thicknessNum / 10;

    // Se engrossada, espessura dobra
    const effectiveThickness = isThickened ? thicknessCm * 2 : thicknessCm;

    // Soma total da espessura das prateleiras
    const totalShelfThickness = countNum * effectiveThickness;

    // Altura disponível para vãos
    const availableHeight = heightNum - totalShelfThickness;

    // Quantidade de vãos = prateleiras + 1
    const gapCount = countNum + 1;

    // Altura de cada vão
    const gapHeight = availableHeight / gapCount;

    // Medida do pitão: 
    // - Sem engrossamento: igual à altura do vão
    // - Com engrossamento: altura do vão + espessura simples (porque a prateleira dobrada ocupa mais)
    const pitonMeasure = isThickened ? gapHeight + thicknessCm : gapHeight;

    return {
      finalDepth: finalDepth.toFixed(2),
      finalWidth: finalWidth.toFixed(2),
      totalShelfThickness: totalShelfThickness.toFixed(2),
      availableHeight: availableHeight.toFixed(2),
      gapCount,
      gapHeight: gapHeight.toFixed(2),
      pitonMeasure: pitonMeasure.toFixed(2),
      effectiveThickness: effectiveThickness.toFixed(2),
    };
  };

  const results = calculateResults();

  const downloadContent = results ? `CALCULADORA DE PRATELEIRAS - Doriva Móveis
Data: ${new Date().toLocaleDateString("pt-BR")}

=== DADOS DE ENTRADA ===
Profundidade: ${depth} cm
Largura: ${width} cm
Altura do Vão: ${openingHeight} cm
Espessura do MDF: ${mdfThickness} mm
Quantidade de Prateleiras: ${shelfCount}
Prateleira Engrossada: ${isThickened ? "Sim" : "Não"}

=== RESULTADOS ===
Profundidade Final: ${results.finalDepth} cm
Largura Final: ${results.finalWidth} cm
Espessura Efetiva: ${results.effectiveThickness} cm
Altura de Cada Vão: ${results.gapHeight} cm
${showPiton ? `Medida do Pitão: ${results.pitonMeasure} cm` : ""}
` : "";

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            📏 Dados do Móvel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depth" className="text-foreground font-medium">
                Profundidade (cm)
              </Label>
              <Input
                id="depth"
                type="number"
                step="0.1"
                placeholder="Ex: 50"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="input-wood"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width" className="text-foreground font-medium">
                Largura (cm)
              </Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                placeholder="Ex: 80"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="input-wood"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingHeight" className="text-foreground font-medium">
                Altura do Vão (cm)
              </Label>
              <Input
                id="openingHeight"
                type="number"
                step="0.1"
                placeholder="Ex: 200"
                value={openingHeight}
                onChange={(e) => setOpeningHeight(e.target.value)}
                className="input-wood"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shelfCount" className="text-foreground font-medium">
                Quantidade de Prateleiras
              </Label>
              <Input
                id="shelfCount"
                type="number"
                min="1"
                placeholder="Ex: 4"
                value={shelfCount}
                onChange={(e) => setShelfCount(e.target.value)}
                className="input-wood"
              />
            </div>
          </div>

          {/* MDF Thickness */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Espessura do MDF (mm)</Label>
            <div className="grid grid-cols-3 gap-2">
              {["15", "18", "25"].map((thickness) => (
                <button
                  key={thickness}
                  onClick={() => setMdfThickness(thickness)}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    mdfThickness === thickness
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {thickness} mm
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
              <Label className="text-foreground font-medium cursor-pointer">
                Prateleira Engrossada
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Dobra a espessura do MDF
                </p>
              </Label>
              <Switch
                checked={isThickened}
                onCheckedChange={setIsThickened}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
              <Label className="text-foreground font-medium cursor-pointer">
                Mostrar Medida do Pitão
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Para prateleiras com suporte
                </p>
              </Label>
              <Switch
                checked={showPiton}
                onCheckedChange={setShowPiton}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="border-border/30 bg-card/80 backdrop-blur-sm shadow-2xl animate-scale-in">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              📐 Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discount Info */}
            <div className="p-4 bg-accent/10 rounded-2xl border border-accent/30">
              <h3 className="text-sm font-semibold text-accent mb-2">📋 Descontos Aplicados</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Profundidade:</strong> -0,5 cm (5 mm de folga)</li>
                <li>• <strong>Largura:</strong> -0,1 cm (1 mm de folga)</li>
                <li>• <strong>Espessura efetiva:</strong> {results.effectiveThickness} cm {isThickened ? "(engrossada - dobrada)" : ""}</li>
                <li>• <strong>Quantidade de vãos:</strong> {results.gapCount} (prateleiras + 1)</li>
                {showPiton && <li>• <strong>Pitão:</strong> Altura do vão + espessura efetiva ({results.effectiveThickness} cm)</li>}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 rounded-2xl">
                <p className="text-xs text-muted-foreground mb-1">Profundidade Final</p>
                <p className="text-xl font-bold text-foreground">
                  {results.finalDepth} <span className="text-sm font-normal">cm</span>
                </p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-2xl">
                <p className="text-xs text-muted-foreground mb-1">Largura Final</p>
                <p className="text-xl font-bold text-foreground">
                  {results.finalWidth} <span className="text-sm font-normal">cm</span>
                </p>
              </div>
            </div>

            {/* Main Result */}
            <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/30">
              <p className="text-sm text-muted-foreground mb-1">Altura de Cada Vão</p>
              <p className="text-4xl font-bold text-primary">
                {results.gapHeight} <span className="text-lg">cm</span>
              </p>
            </div>

            {showPiton && (
              <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl border border-accent/30">
                <p className="text-xs text-muted-foreground mb-1">Medida do Pitão</p>
                <p className="text-2xl font-bold text-accent">
                  {results.pitonMeasure} <span className="text-sm">cm</span>
                </p>
              </div>
            )}

            {/* Visual Distribution */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Distribuição Visual
              </h3>
              <div className="space-y-1">
                {Array.from({ length: parseInt(shelfCount) + 1 || 1 }).map((_, index) => (
                  <div key={`gap-${index}`}>
                    {/* Gap */}
                    <div className="h-6 bg-secondary/30 rounded flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">
                        Vão {index + 1}: {results.gapHeight} cm
                      </span>
                    </div>
                    {/* Shelf */}
                    {index < parseInt(shelfCount) && (
                      <div 
                        className="bg-gradient-to-r from-primary/40 to-primary/30 rounded flex items-center justify-center mt-1"
                        style={{ height: `${Math.max(8, parseFloat(results.effectiveThickness) * 6)}px` }}
                      >
                        <span className="text-[8px] text-primary-foreground font-medium">
                          Prateleira {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DownloadImageButton
              filename={`prateleiras-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}`}
              title="Cálculo de Prateleiras"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Profundidade</p>
                    <p className="text-white font-bold">{depth} cm</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Largura</p>
                    <p className="text-white font-bold">{width} cm</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Altura do Vão</p>
                    <p className="text-white font-bold">{openingHeight} cm</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Prateleiras</p>
                    <p className="text-white font-bold">{shelfCount} un</p>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <p className="text-amber-400 font-semibold mb-2">Resultados:</p>
                  <div className="space-y-2">
                    <div className="bg-amber-500/20 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Medidas Finais</p>
                      <p className="text-amber-400 font-bold">{results.finalDepth} × {results.finalWidth} cm</p>
                    </div>
                    <div className="bg-amber-500/20 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Altura de Cada Vão</p>
                      <p className="text-amber-400 font-bold text-lg">{results.gapHeight} cm</p>
                    </div>
                    {showPiton && (
                      <div className="bg-emerald-500/20 rounded-lg p-3">
                        <p className="text-white/60 text-xs">Medida do Pitão</p>
                        <p className="text-emerald-400 font-bold">{results.pitonMeasure} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DownloadImageButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShelfCalculator;
