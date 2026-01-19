import { Download } from "lucide-react";
import { toast } from "sonner";

interface DownloadButtonProps {
  filename: string;
  content: string;
}

const DownloadButton = ({ filename, content }: DownloadButtonProps) => {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Arquivo baixado com sucesso!");
  };

  return (
    <button
      onClick={handleDownload}
      className="group flex items-center justify-center gap-2 w-full py-4 px-6 mt-4
        bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary
        text-primary-foreground font-semibold rounded-2xl shadow-lg
        hover:shadow-xl hover:shadow-primary/25
        transition-all duration-300 transform hover:-translate-y-0.5"
    >
      <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span>Baixar Resultados</span>
    </button>
  );
};

export default DownloadButton;
