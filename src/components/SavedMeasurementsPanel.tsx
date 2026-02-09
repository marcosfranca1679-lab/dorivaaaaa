import { ClipboardList, Trash2, X, ImageDown } from "lucide-react";
import { useSavedMeasurements } from "@/contexts/SavedMeasurementsContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import logoDoriva from "@/assets/logo-doriva.png";
import bannerMarceneiro from "@/assets/banner-marceneiro.jpg";

const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else reject(new Error('No ctx'));
      } catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error('Failed'));
    img.src = url;
  });
};

const SavedMeasurementsPanel = () => {
  const { measurements, removeMeasurement, clearMeasurements } = useSavedMeasurements();
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState("");
  const [bannerBase64, setBannerBase64] = useState("");

  useEffect(() => {
    Promise.all([imageToBase64(logoDoriva), imageToBase64(bannerMarceneiro)])
      .then(([logo, banner]) => { setLogoBase64(logo); setBannerBase64(banner); })
      .catch(() => {});
  }, []);

  const handleDownloadAll = async () => {
    if (!captureRef.current || measurements.length === 0) return;
    setIsCapturing(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        logging: false,
        useCORS: false,
        allowTaint: true,
        imageTimeout: 0,
      });
      const link = document.createElement("a");
      link.download = `medidas-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Imagem com todas as medidas baixada!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsCapturing(false);
    }
  };

  const typeColors: Record<string, string> = {
    "Gaveta": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "Sapateira": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "Ripado": "bg-green-500/20 text-green-300 border-green-500/30",
    "Rodapé": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    "Prateleira": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "Tampa": "bg-pink-500/20 text-pink-300 border-pink-500/30",
    "Porta": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };

  const getTypeColor = (type: string) => typeColors[type] || "bg-white/10 text-white/70 border-white/20";

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent
          text-primary-foreground shadow-xl flex items-center justify-center
          hover:scale-110 transition-transform duration-200"
      >
        <ClipboardList className="w-6 h-6" />
        {measurements.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
            {measurements.length}
          </span>
        )}
      </button>

      {/* Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Medidas Salvas
                </h2>
                <p className="text-xs text-muted-foreground">{measurements.length} medida(s)</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {measurements.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma medida salva</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Use "Salvar na Lista" nas calculadoras
                  </p>
                </div>
              ) : (
                <>
                  {measurements.map((m) => (
                    <div key={m.id} className="bg-secondary/30 rounded-2xl p-4 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeColor(m.type)}`}>
                            {m.type}
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1">{m.label}</p>
                        </div>
                        <button
                          onClick={() => removeMeasurement(m.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {m.results.map((r, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{r.label}</span>
                            <span className={r.highlight ? "font-bold text-primary" : "text-foreground"}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Actions */}
                  <div className="space-y-2 pt-4">
                    <button
                      onClick={handleDownloadAll}
                      disabled={isCapturing}
                      className="group flex items-center justify-center gap-2 w-full py-4 px-6
                        bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary
                        text-primary-foreground font-semibold rounded-2xl shadow-lg
                        hover:shadow-xl hover:shadow-primary/25 transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ImageDown className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span>{isCapturing ? "Gerando..." : "Baixar Todas como Imagem"}</span>
                    </button>
                    <button
                      onClick={() => { clearMeasurements(); toast.success("Lista limpa!"); }}
                      className="flex items-center justify-center gap-2 w-full py-3 px-6
                        bg-destructive/10 hover:bg-destructive/20 text-destructive
                        font-medium rounded-2xl transition-all border border-destructive/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Limpar Tudo</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden capture element for image download */}
      <div
        ref={captureRef}
        className={isCapturing ? "block fixed left-[-9999px] top-0" : "hidden"}
        style={{ width: "700px" }}
      >
        <div className="bg-gradient-to-br from-[#1a1a2e] via-[#252542] to-[#2d2d44] rounded-3xl overflow-hidden shadow-2xl">
          {/* Banner */}
          <div className="relative h-32">
            <img src={bannerBase64 || bannerMarceneiro} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#1a1a2e]" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
              <img src={logoBase64 || logoDoriva} alt="Doriva" className="h-14 drop-shadow-lg" />
              <div className="text-right">
                <p className="text-white/90 text-sm font-semibold drop-shadow">Lista de Medidas</p>
                <p className="text-white/70 text-xs drop-shadow">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* All measurements */}
          <div className="p-6 space-y-4">
            {measurements.map((m, idx) => (
              <div key={m.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400 font-bold text-lg">#{idx + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeColor(m.type)}`}>
                    {m.type}
                  </span>
                  <span className="text-white font-semibold text-sm">{m.label}</span>
                </div>

                {/* Inputs row */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {m.inputs.map((inp, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-2">
                      <p className="text-white/50 text-[10px]">{inp.label}</p>
                      <p className="text-white text-xs font-semibold">{inp.value}</p>
                    </div>
                  ))}
                </div>

                {/* Results row */}
                <div className="grid grid-cols-2 gap-2">
                  {m.results.map((r, i) => (
                    <div key={i} className={`rounded-lg p-2 ${r.highlight ? "bg-amber-500/20" : "bg-white/5"}`}>
                      <p className="text-white/50 text-[10px]">{r.label}</p>
                      <p className={`text-xs font-bold ${r.highlight ? "text-amber-400" : "text-white"}`}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-amber-500/30 text-center">
              <p className="text-amber-400 font-semibold">Doriva Móveis Sob Medida</p>
              <p className="text-white/50 text-xs mt-1">
                {measurements.length} medida(s) • Calculadora desenvolvida por William
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedMeasurementsPanel;
