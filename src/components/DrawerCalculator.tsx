import { useState, useMemo } from "react";
import { Ruler, Square, Layers, Package, Minus, Plus } from "lucide-react";
import DownloadImageButton from "./DownloadImageButton";

type SlideType = "oculta" | "telescopica";

const SLIDE_SIZES = [25, 30, 35, 40, 45, 50, 55, 60];

interface DrawerMeasurements {
  frontBack: { width: number; height: number; quantity: number };
  side: { width: number; height: number; quantity: number };
  alturaLateral: number;
  alturaGaveta: number;
}

const DrawerCalculator = () => {
  const [vaoLargura, setVaoLargura] = useState<string>("");
  const [vaoAltura, setVaoAltura] = useState<string>("");
  const [profundidade, setProfundidade] = useState<string>("");
  const [tamanhoCorre, setTamanhoCorre] = useState<number>(35);
  const [slideType, setSlideType] = useState<SlideType>("oculta");
  const [comRebaixo, setComRebaixo] = useState<boolean>(false);
  const [comPuxadorCanoa, setComPuxadorCanoa] = useState<boolean>(false);
  const [quantidadeGavetas, setQuantidadeGavetas] = useState<number>(1);

  const measurements = useMemo<DrawerMeasurements | null>(() => {
    const largura = parseFloat(vaoLargura);
    const altura = parseFloat(vaoAltura);

    if (isNaN(largura) || isNaN(altura) || quantidadeGavetas < 1) {
      return null;
    }

    // Desconto da largura baseado no tipo de corrediça e rebaixo
    let desconto = 0;
    if (slideType === "oculta") {
      desconto = comRebaixo ? 2.1 : 4;
    } else {
      desconto = 5.7;
    }

    // Largura da frente/traseira
    const larguraFrenteTraseira = largura - desconto;

    // Altura disponível menos os vãos de 3cm
    // Cada gaveta tem um vão abaixo dela (gaveta + vão, gaveta + vão, ...)
    const totalVaos = quantidadeGavetas * 3;
    const alturaDisponivel = altura - totalVaos;

    // Altura de cada lateral (gaveta)
    const alturaLateral = alturaDisponivel / quantidadeGavetas;

    // Altura da frente/traseira: lateral - 2.5 (e -2 se puxador canoa)
    let alturaFrenteTraseira = alturaLateral - 2.5;
    if (comPuxadorCanoa) {
      alturaFrenteTraseira -= 2;
    }

    return {
      frontBack: {
        width: Math.max(0, larguraFrenteTraseira),
        height: Math.max(0, alturaFrenteTraseira),
        quantity: quantidadeGavetas * 2,
      },
      side: {
        width: tamanhoCorre,
        height: Math.max(0, alturaLateral),
        quantity: quantidadeGavetas * 2,
      },
      alturaLateral: Math.max(0, alturaLateral),
      alturaGaveta: Math.max(0, alturaFrenteTraseira),
    };
  }, [vaoLargura, vaoAltura, tamanhoCorre, quantidadeGavetas, slideType, comRebaixo, comPuxadorCanoa]);

  const hasResults = measurements !== null;

  const downloadContent = useMemo(() => {
    if (!measurements) return "";
    
    const date = new Date().toLocaleDateString("pt-BR");
    return `CALCULADORA DE GAVETAS - Doriva Móveis
Data: ${date}

=== MEDIDAS DO VÃO ===
Largura: ${vaoLargura} cm
Altura: ${vaoAltura} cm
Profundidade: ${profundidade || "N/A"} cm

=== CONFIGURAÇÃO ===
Quantidade de Gavetas: ${quantidadeGavetas}
Corrediça: ${slideType === "oculta" ? "Oculta" : "Telescópica"} - ${tamanhoCorre}cm
${slideType === "oculta" ? `Rebaixo: ${comRebaixo ? "Sim" : "Não"}` : ""}
Puxador Canoa: ${comPuxadorCanoa ? "Sim" : "Não"}

=== MEDIDAS DE CORTE ===
FRENTE/TRASEIRA (${measurements.frontBack.quantity} peças):
  Largura: ${measurements.frontBack.width.toFixed(1)} cm
  Altura: ${measurements.frontBack.height.toFixed(1)} cm

LATERAL (${measurements.side.quantity} peças):
  Largura: ${measurements.side.width} cm
  Altura: ${measurements.side.height.toFixed(1)} cm
`;
  }, [measurements, vaoLargura, vaoAltura, profundidade, quantidadeGavetas, slideType, tamanhoCorre, comRebaixo, comPuxadorCanoa]);

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
              placeholder="Ex: 40"
              className="input-wood w-full"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Profundidade (cm)
          </label>
          <input
            type="number"
            value={profundidade}
            onChange={(e) => setProfundidade(e.target.value)}
            placeholder="Ex: 45"
            className="input-wood w-full"
          />
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Quantidade de Gavetas
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantidadeGavetas(Math.max(1, quantidadeGavetas - 1))}
              className="w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-3xl font-bold text-foreground w-16 text-center">
              {quantidadeGavetas}
            </span>
            <button
              onClick={() => setQuantidadeGavetas(quantidadeGavetas + 1)}
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
              onClick={() => {
                setSlideType("oculta");
                setComRebaixo(false);
              }}
              className={`p-4 rounded-2xl font-semibold transition-all ${
                slideType === "oculta"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Oculta
            </button>
            <button
              onClick={() => {
                setSlideType("telescopica");
                setComRebaixo(false);
              }}
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

        {/* Toggle Options */}
        <div className="space-y-3">
          {slideType === "oculta" && (
            <div
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                comRebaixo
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-secondary/30 border-border/30 hover:bg-secondary/50'
              }`}
              onClick={() => setComRebaixo(!comRebaixo)}
            >
              <div>
                <p className={`font-medium ${comRebaixo ? 'text-primary' : 'text-foreground'}`}>
                  Gaveta com Rebaixo
                </p>
                <p className="text-xs text-muted-foreground">
                  Desconto de 2,1 cm na largura
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                comRebaixo ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {comRebaixo && <div className="w-3 h-3 rounded-full bg-primary-foreground" />}
              </div>
            </div>
          )}

          <div
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
              comPuxadorCanoa
                ? 'bg-primary/10 border-primary/50'
                : 'bg-secondary/30 border-border/30 hover:bg-secondary/50'
            }`}
            onClick={() => setComPuxadorCanoa(!comPuxadorCanoa)}
          >
            <div>
              <p className={`font-medium ${comPuxadorCanoa ? 'text-primary' : 'text-foreground'}`}>
                Puxador Canoa
              </p>
              <p className="text-xs text-muted-foreground">
                Desconto de 2 cm na altura da frente
              </p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              comPuxadorCanoa ? 'border-primary bg-primary' : 'border-muted-foreground'
            }`}>
              {comPuxadorCanoa && <div className="w-3 h-3 rounded-full bg-primary-foreground" />}
            </div>
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
              <li>• <strong>Largura Frente/Traseira:</strong> {slideType === "oculta" ? (comRebaixo ? "-2,1 cm (oculta com rebaixo)" : "-4 cm (oculta)") : "-5,7 cm (telescópica)"}</li>
              <li>• <strong>Altura Frente/Traseira:</strong> -2,5 cm da lateral{comPuxadorCanoa ? " -2 cm (puxador canoa)" : ""}</li>
              <li>• <strong>Vão entre gavetas:</strong> 3 cm por gaveta</li>
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
              Distribuição Visual (Gaveta → Vão)
            </h3>
            <div className="space-y-1">
              {Array.from({ length: quantidadeGavetas }).map((_, index) => (
                <div key={index}>
                  {/* Drawer */}
                  <div 
                    className="bg-gradient-to-r from-primary/30 to-primary/20 rounded-lg border border-primary/30 flex items-center justify-center"
                    style={{ height: `${Math.max(24, measurements.alturaLateral * 1.5)}px` }}
                  >
                    <span className="text-xs font-medium text-primary">
                      Gaveta {index + 1} - {measurements.alturaLateral.toFixed(1)} cm
                    </span>
                  </div>
                  {/* Gap after each drawer */}
                  <div className="h-3 bg-border/50 rounded-full flex items-center justify-center mt-1">
                    <span className="text-[10px] text-muted-foreground">Vão {index + 1} - 3 cm</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {quantidadeGavetas} gaveta{quantidadeGavetas > 1 ? 's' : ''} + {quantidadeGavetas} vão{quantidadeGavetas > 1 ? 's' : ''} = {quantidadeGavetas * 3} cm de vãos
            </p>
          </div>

          <DownloadImageButton
            filename={`gavetas-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}`}
            title="Cálculo de Gavetas"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Largura do Vão</p>
                  <p className="text-white font-bold">{vaoLargura} cm</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Altura do Vão</p>
                  <p className="text-white font-bold">{vaoAltura} cm</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/60 text-xs">Configuração</p>
                <p className="text-white text-sm">{quantidadeGavetas} gaveta(s) • {slideType === "oculta" ? "Oculta" : "Telescópica"} {tamanhoCorre}cm</p>
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
        </div>
      )}
    </div>
  );
};

export default DrawerCalculator;
