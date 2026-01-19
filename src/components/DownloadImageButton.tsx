import { ImageDown } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useRef, useState, ReactNode } from "react";
import logoDoriva from "@/assets/logo-doriva.png";

interface DownloadImageButtonProps {
  filename: string;
  children: ReactNode;
  title?: string;
}

const DownloadImageButton = ({ filename, children, title }: DownloadImageButtonProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    setIsCapturing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Imagem baixada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={contentRef}
        className={isCapturing ? "block fixed left-[-9999px] top-0" : "hidden"}
        style={{ width: "600px" }}
      >
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <img 
              src={logoDoriva} 
              alt="Doriva Móveis" 
              className="h-12"
            />
            <div className="text-right">
              <p className="text-white/60 text-sm">Calculadora de Marcenaria</p>
              <p className="text-white/40 text-xs">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          
          {title && (
            <h2 className="text-xl font-bold text-white mb-4 text-center">{title}</h2>
          )}
          
          <div className="text-white">
            {children}
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">Doriva Móveis Sob Medida</p>
            <p className="text-white/40 text-xs">Calculadora desenvolvida por William</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isCapturing}
        className="group flex items-center justify-center gap-2 w-full py-4 px-6
          bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary
          text-primary-foreground font-semibold rounded-2xl shadow-lg
          hover:shadow-xl hover:shadow-primary/25
          transition-all duration-300 transform hover:-translate-y-0.5
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ImageDown className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span>{isCapturing ? "Gerando..." : "Baixar como Imagem"}</span>
      </button>
    </div>
  );
};

export default DownloadImageButton;
