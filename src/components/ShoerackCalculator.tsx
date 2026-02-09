import { useState, useMemo } from "react";
import { Ruler, Square, Layers, Package, Minus, Plus } from "lucide-react";
import DownloadImageButton from "./DownloadImageButton";
import SaveMeasurementButton from "./SaveMeasurementButton";

type SlideType = "oculta" | "telescopica";

const SLIDE_SIZES = [25, 30, 35, 40, 45, 50, 55, 60];

interface ShoerackMeasurements {
  frontBack: { width: number; height: number; quantity: number };
  side: { width: number; height: number; quantity: number };
}

const ShoerackCalculator = () => {
  const [vaoLargura, setVaoLargura] = useState<string>("");
  const [vaoAltura, setVaoAltura] = useState<string>("");
  const [profundidade, setProfundidade] = useState<string>("");
  const [tamanhoCorre, setTamanhoCorre] = useState<number>(35);
  const [slideType, setSlideType] = useState<SlideType>("oculta");
  const [quantidadeSapateiras, setQuantidadeSapateiras] = useState<number>(1);
  const [alturaLateralFixa, setAlturaLateralFixa] = useState<string>("6");

  const measurements = useMemo<ShoerackMeasurements | null>(() => {
    const largura = parseFloat(vaoLargura);
    const alturaLateral = parseFloat(alturaLateralFixa);

    if (isNaN(largura) || isNaN(alturaLateral) || quantidadeSapateiras < 1) {
      return null;
    }

    // Desconto da largura baseado no tipo de corrediça
    const desconto = slideType === "oculta" ? 4 : 5.7;

    // Altura da frente/traseira: altura lateral - 2cm
    const alturaFrenteTraseira = alturaLateral - 2;

    // Largura da frente/traseira: largura do vão - desconto
    const larguraFrenteTraseira = largura - desconto;

    return {
      frontBack: {
        width: Math.max(0, larguraFrenteTraseira),
        height: Math.max(0, alturaFrenteTraseira),
        quantity: quantidadeSapateiras * 2,
      },
      side: {
        width: tamanhoCorre,
        height: Math.max(0, alturaLateral),
        quantity: quantidadeSapateiras * 2,
      },
    };
  }, [vaoLargura, alturaLateralFixa, tamanhoCorre, quantidadeSapateiras, slideType]);

  const hasResults = measurements !== null;

  const downloadContent = useMemo(() => {
    if (!measurements) return "";
    
    const date = new Date().toLocaleDateString("pt-BR");
    return `CALCULADORA DE SAPATEIRAS - Doriva Móveis
Data: ${date}

=== MEDIDAS DO VÃO ===
Largura: ${vaoLargura} cm
Altura: ${vaoAltura} cm
Profundidade: ${profundidade || "N/A"} cm

=== CONFIGURAÇÃO ===
Quantidade de Sapateiras: ${quantidadeSapateiras}
Altura da Lateral: ${alturaLateralFixa} cm
Corrediça: ${slideType === "oculta" ? "Oculta" : "Telescópica"} - ${tamanhoCorre}cm

=== MEDIDAS DE CORTE ===
FRENTE/TRASEIRA (${measurements.frontBack.quantity} peças):
  Largura: ${measurements.frontBack.width.toFixed(1)} cm
  Altura: ${measurements.frontBack.height.toFixed(1)} cm

LATERAL (${measurements.side.quantity} peças):
  Largura: ${measurements.side.width} cm
  Altura: ${measurements.side.height.toFixed(1)} cm
`;
  }, [measurements, vaoLargura, vaoAltura, profundidade, quantidadeSapateiras, alturaLateralFixa, slideType, tamanhoCorre]);

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" />
          Medidas do Vão
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Largura do Vão (cm)
            </label>
            <input
              type="number"
              value={vaoLargura}
              onChange={(e) => setVaoLargura(e.target.value)}
              placeholder="Ex: 50"
              className="input-wood w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Altura do Vão (cm)
            </label>
            <input
              type="number"
              value={vaoAltura}
              onChange={(e) => setVaoAltura(e.target.value)}
              placeholder="Ex: 15"
              className="input-wood w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Profundidade (cm)
            </label>
            <input
              type="number"
              value={profundidade}
              onChange={(e) => setProfundidade(e.target.value)}
              placeholder="Ex: 40"
              className="input-wood w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Altura da Lateral (cm)
            </label>
            <input
              type="number"
              value={alturaLateralFixa}
              onChange={(e) => setAlturaLateralFixa(e.target.value)}
              placeholder="Ex: 6"
              className="input-wood w-full"
            />
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Quantidade de Sapateiras
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantidadeSapateiras(Math.max(1, quantidadeSapateiras - 1))}
              className="w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-3xl font-bold text-foreground w-16 text-center">
              {quantidadeSapateiras}
            </span>
            <button
              onClick={() => setQuantidadeSapateiras(quantidadeSapateiras + 1)}
              className="w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Tamanho da Corrediça (cm)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SLIDE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setTamanhoCorre(size)}
                className={`p-3 rounded-xl font-medium transition-all ${
                  tamanhoCorre === size
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Slide Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Tipo de Corrediça
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSlideType("oculta")}
              className={`p-4 rounded-2xl font-semibold transition-all ${
                slideType === "oculta"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Oculta
            </button>
            <button
              onClick={() => setSlideType("telescopica")}
              className={`p-4 rounded-2xl font-semibold transition-all ${
                slideType === "telescopica"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Telescópica
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasResults && (
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Square className="w-5 h-5 text-primary" />
            Medidas de Corte
          </h2>

          {/* Discount Info */}
          <div className="p-4 bg-accent/10 rounded-2xl border border-accent/30 mb-4">
            <h3 className="text-sm font-semibold text-accent mb-2">📋 Descontos Aplicados</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Largura Frente/Traseira:</strong> {slideType === "oculta" ? "-4 cm (oculta)" : "-5,7 cm (telescópica)"}</li>
              <li>• <strong>Altura Frente/Traseira:</strong> -2 cm da altura da lateral</li>
            </ul>
          </div>

          <div className="space-y-4">
            {/* Front/Back */}
            <div className="p-4 bg-secondary/30 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Frente / Traseira</span>
                <span className="text-sm text-muted-foreground">
                  {measurements.frontBack.quantity} peças
                </span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <span className="font-bold text-primary">
                  {measurements.frontBack.width.toFixed(1)}
                </span>
                <span className="text-muted-foreground">×</span>
                <span className="font-bold text-primary">
                  {measurements.frontBack.height.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>

            {/* Side */}
            <div className="p-4 bg-secondary/30 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Lateral</span>
                <span className="text-sm text-muted-foreground">
                  {measurements.side.quantity} peças
                </span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <span className="font-bold text-primary">
                  {measurements.side.width}
                </span>
                <span className="text-muted-foreground">×</span>
                <span className="font-bold text-primary">
                  {measurements.side.height.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
          </div>

          {/* Visual Distribution */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Distribuição Visual
            </h3>
            <div className="space-y-2">
              {Array.from({ length: quantidadeSapateiras }).map((_, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-primary/30 to-primary/20 rounded-lg border border-primary/30 p-3 flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-primary">
                    Sapateira {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DownloadImageButton
            filename={`sapateiras-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}`}
            title="Cálculo de Sapateiras"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Largura do Vão</p>
                  <p className="text-white font-bold">{vaoLargura} cm</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Altura da Lateral</p>
                  <p className="text-white font-bold">{alturaLateralFixa} cm</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/60 text-xs">Configuração</p>
                <p className="text-white text-sm">{quantidadeSapateiras} sapateira(s) • {slideType === "oculta" ? "Oculta" : "Telescópica"} {tamanhoCorre}cm</p>
              </div>
              <div className="border-t border-white/20 pt-3">
                <p className="text-amber-400 font-semibold mb-2">Medidas de Corte:</p>
                <div className="space-y-2">
                  <div className="bg-amber-500/20 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Frente/Traseira ({measurements.frontBack.quantity} peças)</p>
                    <p className="text-amber-400 font-bold text-lg">{measurements.frontBack.width.toFixed(1)} × {measurements.frontBack.height.toFixed(1)} cm</p>
                  </div>
                  <div className="bg-amber-500/20 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Lateral ({measurements.side.quantity} peças)</p>
                    <p className="text-amber-400 font-bold text-lg">{measurements.side.width} × {measurements.side.height.toFixed(1)} cm</p>
                  </div>
                </div>
              </div>
            </div>
          </DownloadImageButton>

          <SaveMeasurementButton
            measurement={{
              type: "Sapateira",
              label: `${quantidadeSapateiras} sapateira(s) - ${slideType === "oculta" ? "Oculta" : "Telescópica"} ${tamanhoCorre}cm`,
              inputs: [
                { label: "Largura do Vão", value: `${vaoLargura} cm` },
                { label: "Altura Lateral", value: `${alturaLateralFixa} cm` },
                { label: "Corrediça", value: `${slideType === "oculta" ? "Oculta" : "Telescópica"} ${tamanhoCorre}cm` },
              ],
              results: [
                { label: "Frente/Traseira", value: `${measurements.frontBack.width.toFixed(1)} × ${measurements.frontBack.height.toFixed(1)} cm (${measurements.frontBack.quantity} pç)`, highlight: true },
                { label: "Lateral", value: `${measurements.side.width} × ${measurements.side.height.toFixed(1)} cm (${measurements.side.quantity} pç)`, highlight: true },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ShoerackCalculator;
