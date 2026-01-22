import { useState, useEffect } from "react";
import { Download, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error("Installation failed:", error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  // Don't show if already installed or no prompt available
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm">
        <Check className="w-4 h-4" />
        <span>App Instalado</span>
      </div>
    );
  }

  if (!deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="group flex items-center gap-2 px-4 py-2
        bg-gradient-to-r from-primary to-primary/80 
        hover:from-primary/90 hover:to-primary
        text-primary-foreground font-semibold rounded-xl shadow-lg
        hover:shadow-xl hover:shadow-primary/25
        transition-all duration-300 transform hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      <Download className="w-4 h-4 transition-transform group-hover:scale-110" />
      <span>{isInstalling ? "Instalando..." : "Instalar App"}</span>
    </button>
  );
};

export default InstallAppButton;
