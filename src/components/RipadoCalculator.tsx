import { useState, useMemo } from "react";
import { Ruler, LayoutGrid, Link2 } from "lucide-react";
import DownloadImageButton from "./DownloadImageButton";
import SaveMeasurementButton from "./SaveMeasurementButton";

interface RipadoMeasurements {
  espacoRipados: number;
  espacoVaos: number;
  quantidadeVaos: number;
  larguraVao: number;
}

const RipadoCalculator = () => {
  const [quantidadeRipados, setQuantidadeRipados] = useState<string>("");
  const [larguraRipado, setLarguraRipado] = useState<string>("");
  const [tamanhoTotal, setTamanhoTotal] = useState<string>("");
  const [emendaAtivada, setEmendaAtivada] = useState<boolean>(false);

  const measurements = useMemo<RipadoMeasurements | null>(() => {
    const quantidade = parseInt(quantidadeRipados);
    const largura = parseFloat(larguraRipado);
    const total = parseFloat(tamanhoTotal);

    if (isNaN(quantidade) || isNaN(largura) || isNaN(total) || quantidade < 2) {
      return null;
    }

    // Com emenda: última ripa fica metade para fora
    // Espaço ocupado pelos ripados (última ripa conta só metade se emenda ativada)
    const espacoRipados = emendaAtivada
      ? (quantidade - 1) * largura + (largura / 2)
      : quantidade * largura;

    // Quantidade de vãos = ripados - 1
    const quantidadeVaos = quantidade - 1;

    // Espaço restante para os vãos
    const espacoVaos = total - espacoRipados;

    // Largura de cada vão
    const larguraVao = espacoVaos / quantidadeVaos;

    return {
      espacoRipados,
      espacoVaos,
      quantidadeVaos,
      larguraVao,
    };
  }, [quantidadeRipados, larguraRipado, tamanhoTotal, emendaAtivada]);

  const hasResults = measurements !== null;
  const hasError = measurements && measurements.larguraVao < 0;

  const downloadContent = useMemo(() => {
    if (!measurements) return "";
    
    const date = new Date().toLocaleDateString("pt-BR");
    return `CALCULADORA DE RIPADOS - Doriva Móveis
Data: ${date}

=== DADOS DE ENTRADA ===
Tamanho Total: ${tamanhoTotal} cm
Quantidade de Ripados: ${quantidadeRipados}
Largura de Cada Ripado: ${larguraRipado} cm
Emenda Ativada: ${emendaAtivada ? "Sim" : "Não"}

=== RESULTADOS ===
Espaço ocupado pelos ripados: ${measurements.espacoRipados.toFixed(2)} cm
Espaço para os vãos: ${measurements.espacoVaos.toFixed(2)} cm
Quantidade de vãos: ${measurements.quantidadeVaos}
LARGURA DE CADA VÃO: ${measurements.larguraVao.toFixed(2)} cm
`;
  }, [measurements, tamanhoTotal, quantidadeRipados, larguraRipado, emendaAtivada]);

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          Dados do Ripado
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Tamanho Total da Peça (cm)
            </label>
            <input
              type="number"
              value={tamanhoTotal}
              onChange={(e) => setTamanhoTotal(e.target.value)}
              placeholder="Ex: 155"
              className="input-wood w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Quantidade de Ripados
              </label>
              <input
                type="number"
                value={quantidadeRipados}
                onChange={(e) => setQuantidadeRipados(e.target.value)}
                placeholder="Ex: 4"
                min="2"
                className="input-wood w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Largura de Cada Ripado (cm)
              </label>
              <input
                type="number"
                value={larguraRipado}
                onChange={(e) => setLarguraRipado(e.target.value)}
                placeholder="Ex: 3"
                step="0.1"
                className="input-wood w-full"
              />
            </div>
          </div>

          {/* Toggle Emenda */}
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
              emendaAtivada
                ? 'bg-primary/10 border-primary/50'
                : 'bg-secondary/30 border-border/30 hover:bg-secondary/50'
            }`}
            onClick={() => setEmendaAtivada(!emendaAtivada)}
          >
            <div className="flex items-center gap-3">
              <Link2 className={`w-5 h-5 ${emendaAtivada ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className={`font-medium ${emendaAtivada ? 'text-primary' : 'text-foreground'}`}>
                  Emenda de Ripado
                </p>
                <p className="text-xs text-muted-foreground">
                  Última ripa com metade para continuação
                </p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              emendaAtivada ? 'border-primary bg-primary' : 'border-muted-foreground'
            }`}>
              {emendaAtivada && <div className="w-3 h-3 rounded-full bg-primary-foreground" />}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasResults && (
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-border/50 animate-scale-in">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            Resultado
          </h2>

          {hasError ? (
            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/30">
              <p className="text-destructive font-medium">
                Erro: Os ripados ocupam mais espaço que o disponível!
              </p>
              <p className="text-sm text-destructive/80 mt-1">
                Reduza a quantidade ou largura dos ripados.
              </p>
            </div>
          ) : (
            <>
              {/* Discount Info */}
              <div className="p-4 bg-accent/10 rounded-2xl border border-accent/30 mb-4">
                <h3 className="text-sm font-semibold text-accent mb-2">📋 Cálculo Aplicado</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Quantidade de vãos:</strong> {measurements.quantidadeVaos} (ripados - 1)</li>
                  <li>• <strong>Espaço ripados:</strong> {emendaAtivada ? `(${quantidadeRipados} - 1) × ${larguraRipado} + (${larguraRipado} ÷ 2)` : `${quantidadeRipados} × ${larguraRipado}`} = {measurements.espacoRipados.toFixed(2)} cm</li>
                  <li>• <strong>Espaço vãos:</strong> {tamanhoTotal} - {measurements.espacoRipados.toFixed(2)} = {measurements.espacoVaos.toFixed(2)} cm</li>
                  <li>• <strong>Largura vão:</strong> {measurements.espacoVaos.toFixed(2)} ÷ {measurements.quantidadeVaos} = {measurements.larguraVao.toFixed(2)} cm</li>
                  {emendaAtivada && <li>• <strong>Emenda:</strong> Última ripa com metade ({(parseFloat(larguraRipado) / 2).toFixed(1)} cm)</li>}
                </ul>
              </div>

              {/* Main Result */}
              <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/30 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Largura de Cada Vão</p>
                <p className="text-4xl font-bold text-primary">
                  {measurements.larguraVao.toFixed(2)} <span className="text-lg">cm</span>
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-secondary/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Espaço Ripados</p>
                  <p className="font-semibold text-foreground">
                    {measurements.espacoRipados.toFixed(2)} cm
                  </p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Espaço Vãos</p>
                  <p className="font-semibold text-foreground">
                    {measurements.espacoVaos.toFixed(2)} cm
                  </p>
                </div>
              </div>

              {/* Visual Distribution */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Distribuição Visual
                </h3>
                <div className="bg-secondary/20 rounded-xl p-3 overflow-x-auto">
                  <div className="flex items-center h-12 min-w-fit">
                    {Array.from({ length: parseInt(quantidadeRipados) || 0 }).map((_, index) => {
                      const isLast = index === parseInt(quantidadeRipados) - 1;
                      const quantidade = parseInt(quantidadeRipados);
                      const largura = parseFloat(larguraRipado);
                      const total = parseFloat(tamanhoTotal);
                      
                      // Calcular proporções para visualização
                      const ripaWidthReal = emendaAtivada && isLast ? largura / 2 : largura;
                      const ripaWidthPercent = (ripaWidthReal / total) * 100;
                      const vaoWidthPercent = (measurements.larguraVao / total) * 100;
                      
                      return (
                        <div key={index} className="flex items-center h-full shrink-0">
                          {/* Ripado */}
                          <div 
                            className={`h-full bg-primary/70 rounded flex items-center justify-center ${
                              emendaAtivada && isLast ? 'border-r-2 border-dashed border-primary' : ''
                            }`}
                            style={{ 
                              width: `${Math.max(ripaWidthPercent * 2, 20)}px`,
                              minWidth: '20px'
                            }}
                          >
                            <span className="text-[9px] text-primary-foreground font-bold">R{index + 1}</span>
                          </div>
                          {/* Vão (não após o último) */}
                          {index < quantidade - 1 && (
                            <div 
                              className="h-3/4 bg-accent/40 rounded flex items-center justify-center border border-accent/60"
                              style={{ 
                                width: `${Math.max(vaoWidthPercent * 2, 16)}px`,
                                minWidth: '16px'
                              }}
                            >
                              <span className="text-[8px] text-foreground/70">V</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-primary/70 rounded"></div>
                    <span>Ripado ({larguraRipado} cm)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-accent/40 rounded border border-accent/60"></div>
                    <span>Vão ({measurements.larguraVao.toFixed(2)} cm)</span>
                  </div>
                </div>
                
                {emendaAtivada && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    * Última ripa com metade ({(parseFloat(larguraRipado) / 2).toFixed(1)} cm) para emenda
                  </p>
                )}
              </div>

              <DownloadImageButton
                filename={`ripados-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}`}
                title="Cálculo de Ripados"
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Tamanho Total</p>
                      <p className="text-white font-bold">{tamanhoTotal} cm</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/60 text-xs">Ripados</p>
                      <p className="text-white font-bold">{quantidadeRipados} un</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/60 text-xs">Largura do Ripado</p>
                    <p className="text-white font-bold">{larguraRipado} cm {emendaAtivada ? "(com emenda)" : ""}</p>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <p className="text-amber-400 font-semibold mb-2">Resultados:</p>
                    <div className="space-y-2">
                      <div className="bg-amber-500/20 rounded-lg p-3">
                        <p className="text-white/60 text-xs">Largura de Cada Vão</p>
                        <p className="text-amber-400 font-bold text-xl">{measurements.larguraVao.toFixed(2)} cm</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-white/60 text-xs">Espaço Ripados</p>
                          <p className="text-white font-semibold">{measurements.espacoRipados.toFixed(2)} cm</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-white/60 text-xs">Espaço Vãos</p>
                          <p className="text-white font-semibold">{measurements.espacoVaos.toFixed(2)} cm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DownloadImageButton>

              <SaveMeasurementButton
                measurement={{
                  type: "Ripado",
                  label: `${quantidadeRipados} ripados - ${tamanhoTotal} cm`,
                  inputs: [
                    { label: "Tamanho Total", value: `${tamanhoTotal} cm` },
                    { label: "Qtd Ripados", value: `${quantidadeRipados}` },
                    { label: "Largura Ripado", value: `${larguraRipado} cm` },
                  ],
                  results: [
                    { label: "Largura de Cada Vão", value: `${measurements.larguraVao.toFixed(2)} cm`, highlight: true },
                    { label: "Espaço Ripados", value: `${measurements.espacoRipados.toFixed(2)} cm` },
                    { label: "Espaço Vãos", value: `${measurements.espacoVaos.toFixed(2)} cm` },
                  ],
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RipadoCalculator;
