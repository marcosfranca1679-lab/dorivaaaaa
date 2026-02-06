import { ImageDown } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useRef, useState, ReactNode, useEffect } from "react";
import logoDoriva from "@/assets/logo-doriva.png";
import bannerMarceneiro from "@/assets/banner-marceneiro.jpg";

interface DownloadImageButtonProps {
  filename: string;
  children: ReactNode;
  title?: string;
}

// Check if URL is external
const isExternalUrl = (url: string): boolean => {
  if (url.startsWith("data:") || url.startsWith("blob:")) return false;
  try {
    return new URL(url, window.location.origin).origin !== window.location.origin;
  } catch {
    return false;
  }
};

// Convert image URL to base64 for offline support
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Only set crossOrigin for external URLs
    if (isExternalUrl(url)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

const DownloadImageButton = ({ filename, children, title }: DownloadImageButtonProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [bannerBase64, setBannerBase64] = useState<string>("");
  const [imagesReady, setImagesReady] = useState(false);

  // Pre-convert images to base64 on mount for offline support
  useEffect(() => {
    const loadImages = async () => {
      try {
        const [logo, banner] = await Promise.all([
          imageToBase64(logoDoriva),
          imageToBase64(bannerMarceneiro)
        ]);
        setLogoBase64(logo);
        setBannerBase64(banner);
        setImagesReady(true);
      } catch (err) {
        console.error("Error loading images:", err);
        // Even if conversion fails, mark as ready to use original URLs
        setImagesReady(true);
      }
    };
    loadImages();
  }, []);

  // Wait for all images in the capture element to load
  const waitForImages = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
      });
    });
    await Promise.all(promises);
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    setIsCapturing(true);
    
    try {
      // Wait for state update and DOM render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Wait for all images to load
      await waitForImages(contentRef.current);
      
      // Additional delay for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        logging: false,
        useCORS: false,
        allowTaint: true,
        imageTimeout: 0,
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
        style={{ width: "700px" }}
      >
        <div className="bg-gradient-to-br from-[#1a1a2e] via-[#252542] to-[#2d2d44] rounded-3xl overflow-hidden shadow-2xl">
          {/* Banner Image with Logo Overlay */}
          <div className="relative h-32">
            <img 
              src={bannerBase64 || bannerMarceneiro} 
              alt="Banner Marcenaria" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#1a1a2e]" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
              <img 
                src={logoBase64 || logoDoriva} 
                alt="Doriva Móveis" 
                className="h-14 drop-shadow-lg"
              />
              <div className="text-right">
                <p className="text-white/90 text-sm font-semibold drop-shadow">Calculadora de Marcenaria</p>
                <p className="text-white/70 text-xs drop-shadow">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {title && (
              <h2 className="text-xl font-bold text-amber-400 mb-4 text-center">{title}</h2>
            )}
            
            <div className="text-white">
              {children}
            </div>
            
            <div className="mt-6 pt-4 border-t border-amber-500/30 text-center">
              <p className="text-amber-400 font-semibold">Doriva Móveis Sob Medida</p>
              <p className="text-white/50 text-xs mt-1">Calculadora desenvolvida por William</p>
            </div>
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
