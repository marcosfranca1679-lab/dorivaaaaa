import { useState, useRef } from "react";
import { StickyNote, ImageDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import logoDoriva from "@/assets/logo-doriva.png";

const NotesDialog = () => {
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!notes.trim()) {
      toast.error("Escreva uma anotação primeiro!");
      return;
    }

    if (!captureRef.current) return;

    setIsCapturing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `anotacao-doriva-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Anotação salva como imagem!");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <>
      <div
        ref={captureRef}
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
              <p className="text-white/60 text-sm">Anotações</p>
              <p className="text-white/40 text-xs">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-amber-400" />
            Minhas Anotações
          </h2>
          
          <div className="bg-white/5 rounded-xl p-4 min-h-[200px]">
            <p className="text-white whitespace-pre-wrap">{notes}</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">Doriva Móveis Sob Medida</p>
            <p className="text-white/40 text-xs">Calculadora desenvolvida por William</p>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full
              bg-gradient-to-r from-amber-500 to-orange-500
              text-white shadow-lg shadow-amber-500/30
              hover:shadow-xl hover:shadow-amber-500/40
              hover:scale-110 transition-all duration-300
              animate-pulse hover:animate-none"
          >
            <StickyNote className="w-6 h-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <StickyNote className="w-5 h-5 text-amber-500" />
              Anotações
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Escreva suas anotações aqui..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] resize-none bg-background border-border text-foreground"
            />
            
            <button
              onClick={handleDownload}
              disabled={isCapturing || !notes.trim()}
              className="group flex items-center justify-center gap-2 w-full py-3 px-4
                bg-gradient-to-r from-amber-500 to-orange-500
                hover:from-amber-600 hover:to-orange-600
                text-white font-semibold rounded-xl shadow-lg
                hover:shadow-xl transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageDown className="w-5 h-5" />
              <span>{isCapturing ? "Gerando..." : "Baixar como Imagem"}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesDialog;
