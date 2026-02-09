import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DownloadImageButton from "./DownloadImageButton";
import SaveMeasurementButton from "./SaveMeasurementButton";

type MaterialType = "mdf" | "madeira";

const BaseboardCalculator = () => {
  const [depth, setDepth] = useState("");
  const [length, setLength] = useState("");
  const [material, setMaterial] = useState<MaterialType>("mdf");
  const [wallBaseboard, setWallBaseboard] = useState(false);

  const [resultDepth, setResultDepth] = useState<number | null>(null);
  const [resultLength, setResultLength] = useState<number | null>(null);

  useEffect(() => {
    const depthValue = parseFloat(depth);
    const lengthValue = parseFloat(length);

    if (!isNaN(depthValue) && depthValue > 0) {
      let depthDiscount = 0;

      if (material === "mdf") {
        depthDiscount = 8.5; // 8.5 cm for MDF
      } else {
        depthDiscount = 7; // 7 cm for wood
        if (wallBaseboard) {
          depthDiscount = 8; // 8 cm if wall baseboard option is active
        }
      }

      setResultDepth(Math.max(0, depthValue - depthDiscount));
    } else {
      setResultDepth(null);
    }

    if (!isNaN(lengthValue) && lengthValue > 0) {
      // 3mm from each side = 6mm = 0.6cm
      setResultLength(Math.max(0, lengthValue - 0.6));
    } else {
      setResultLength(null);
    }
  }, [depth, length, material, wallBaseboard]);

  // Reset wall baseboard when switching to MDF
  useEffect(() => {
    if (material === "mdf") {
      setWallBaseboard(false);
    }
  }, [material]);

  const hasResults = resultDepth !== null || resultLength !== null;

  const downloadContent = `CALCULADORA DE RODAPÉ - Doriva Móveis
Data: ${new Date().toLocaleDateString("pt-BR")}

=== DADOS DE ENTRADA ===
Material: ${material === "mdf" ? "MDF" : "Madeira"}
Profundidade do Móvel: ${depth} cm
Comprimento do Móvel: ${length} cm
${material === "madeira" ? `Rodapé de Parede: ${wallBaseboard ? "Sim" : "Não"}` : ""}

=== RESULTADOS ===
${resultDepth !== null ? `Profundidade Final: ${resultDepth.toFixed(1)} cm` : ""}
${resultLength !== null ? `Comprimento Final: ${resultLength.toFixed(1)} cm` : ""}
`;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm">
          R
        </span>
        Calculadora de Rodapé
      </h2>

      <div className="space-y-5">
        {/* Material Type */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Tipo de Material</Label>
          <Select value={material} onValueChange={(value: MaterialType) => setMaterial(value)}>
            <SelectTrigger className="wood-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mdf">MDF</SelectItem>
              <SelectItem value="madeira">Madeira</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Depth */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Profundidade do Móvel (cm)</Label>
          <Input
            type="number"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            placeholder="Ex: 60"
            className="wood-input"
            min="0"
            step="0.1"
          />
          <p className="text-xs text-muted-foreground">
            {material === "mdf"
              ? "Desconto de 8,5 cm para MDF"
              : wallBaseboard
                ? "Desconto de 8 cm (7 cm + 1 cm para parede)"
                : "Desconto de 7 cm para madeira"}
          </p>
        </div>

        {/* Length */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Comprimento do Móvel (cm)</Label>
          <Input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="Ex: 120"
            className="wood-input"
            min="0"
            step="0.1"
          />
          <p className="text-xs text-muted-foreground">
            Desconto de 3 mm de cada lado (total 6 mm)
          </p>
        </div>

        {/* Wall Baseboard Option - Only for Wood */}
        {material === "madeira" && (
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
            <Label className="text-foreground font-medium cursor-pointer">
              Rodapé de Parede
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Adiciona 1 cm extra ao desconto
              </p>
            </Label>
            <Switch
              checked={wallBaseboard}
              onCheckedChange={setWallBaseboard}
            />
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resultados</h3>
            <div className="grid grid-cols-2 gap-4">
              {resultDepth !== null && (
                <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Profundidade Final</p>
                  <p className="text-2xl font-bold text-primary">
                    {resultDepth.toFixed(1)} <span className="text-sm">cm</span>
                  </p>
                </div>
              )}
              {resultLength !== null && (
                <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl border border-accent/30">
                  <p className="text-xs text-muted-foreground mb-1">Comprimento Final</p>
                  <p className="text-2xl font-bold text-accent">
                    {resultLength.toFixed(1)} <span className="text-sm">cm</span>
                  </p>
                </div>
              )}
            </div>

            <DownloadImageButton
              filename={`rodape-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}`}
              title="Cálculo de Rodapé"
            >
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Material</p>
                  <p className="text-white font-bold">{material === "mdf" ? "MDF" : "Madeira"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Profundidade</p>
                    <p className="text-white font-bold">{depth} cm</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Comprimento</p>
                    <p className="text-white font-bold">{length} cm</p>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <p className="text-amber-400 font-semibold mb-2">Resultados:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {resultDepth !== null && (
                      <div className="bg-amber-500/20 rounded-lg p-3">
                        <p className="text-white/60 text-xs">Profundidade Final</p>
                        <p className="text-amber-400 font-bold text-lg">{resultDepth.toFixed(1)} cm</p>
                      </div>
                    )}
                    {resultLength !== null && (
                      <div className="bg-emerald-500/20 rounded-lg p-3">
                        <p className="text-white/60 text-xs">Comprimento Final</p>
                        <p className="text-emerald-400 font-bold text-lg">{resultLength.toFixed(1)} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DownloadImageButton>

            <SaveMeasurementButton
              measurement={{
                type: "Rodapé",
                label: `${material === "mdf" ? "MDF" : "Madeira"} - ${depth}×${length} cm`,
                inputs: [
                  { label: "Material", value: material === "mdf" ? "MDF" : "Madeira" },
                  { label: "Profundidade", value: `${depth} cm` },
                  { label: "Comprimento", value: `${length} cm` },
                ],
                results: [
                  ...(resultDepth !== null ? [{ label: "Profundidade Final", value: `${resultDepth.toFixed(1)} cm`, highlight: true }] : []),
                  ...(resultLength !== null ? [{ label: "Comprimento Final", value: `${resultLength.toFixed(1)} cm`, highlight: true }] : []),
                ],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseboardCalculator;
