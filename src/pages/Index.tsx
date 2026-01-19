import { useCallback, useState } from "react";
import { Calculator, Footprints, LayoutGrid, RectangleHorizontal, Layers } from "lucide-react";
import DrawerCalculator from "@/components/DrawerCalculator";
import ShoerackCalculator from "@/components/ShoerackCalculator";
import RipadoCalculator from "@/components/RipadoCalculator";
import BaseboardCalculator from "@/components/BaseboardCalculator";
import ShelfCalculator from "@/components/ShelfCalculator";
import NotesDialog from "@/components/NotesDialog";
import logoDoriva from "@/assets/logo-doriva.png";

type CalculatorType = "gaveta" | "sapateira" | "ripado" | "rodape" | "prateleira";

const Index = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("gaveta");

  const switchCalculator = useCallback(
    (next: CalculatorType) => {
      try {
        (document.activeElement as HTMLElement | null)?.blur?.();
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true,
          })
        );
      } catch {
        // ignore
      }
      setActiveCalculator(next);
    },
    [setActiveCalculator]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 wood-pattern">
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="mb-6">
            <img 
              src={logoDoriva} 
              alt="Doriva Móveis Sob Medida" 
              className="w-56 md:w-72 mx-auto drop-shadow-lg"
            />
          </div>
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full border border-primary/20">
            <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-wide">
              Calculadora de Marcenaria
            </h2>
          </div>
        </header>

        {/* Calculator Selector */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-border/50 mb-6 animate-scale-in">
          <div className="grid grid-cols-5 gap-1 md:gap-2">
            <button
              onClick={() => switchCalculator("gaveta")}
              className={`p-2 md:p-4 rounded-2xl transition-all duration-300 font-semibold flex flex-col items-center justify-center gap-1 ${
                activeCalculator === "gaveta"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02]"
                  : "bg-background/50 text-muted-foreground hover:bg-secondary/50 hover:scale-[1.01]"
              }`}
            >
              <Calculator className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm">Gavetas</span>
            </button>
            <button
              onClick={() => switchCalculator("sapateira")}
              className={`p-2 md:p-4 rounded-2xl transition-all duration-300 font-semibold flex flex-col items-center justify-center gap-1 ${
                activeCalculator === "sapateira"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02]"
                  : "bg-background/50 text-muted-foreground hover:bg-secondary/50 hover:scale-[1.01]"
              }`}
            >
              <Footprints className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm">Sapateiras</span>
            </button>
            <button
              onClick={() => switchCalculator("ripado")}
              className={`p-2 md:p-4 rounded-2xl transition-all duration-300 font-semibold flex flex-col items-center justify-center gap-1 ${
                activeCalculator === "ripado"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02]"
                  : "bg-background/50 text-muted-foreground hover:bg-secondary/50 hover:scale-[1.01]"
              }`}
            >
              <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm">Ripados</span>
            </button>
            <button
              onClick={() => switchCalculator("rodape")}
              className={`p-2 md:p-4 rounded-2xl transition-all duration-300 font-semibold flex flex-col items-center justify-center gap-1 ${
                activeCalculator === "rodape"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02]"
                  : "bg-background/50 text-muted-foreground hover:bg-secondary/50 hover:scale-[1.01]"
              }`}
            >
              <RectangleHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm">Rodapés</span>
            </button>
            <button
              onClick={() => switchCalculator("prateleira")}
              className={`p-2 md:p-4 rounded-2xl transition-all duration-300 font-semibold flex flex-col items-center justify-center gap-1 ${
                activeCalculator === "prateleira"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02]"
                  : "bg-background/50 text-muted-foreground hover:bg-secondary/50 hover:scale-[1.01]"
              }`}
            >
              <Layers className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm">Prateleiras</span>
            </button>
          </div>
        </div>

        {/* Active Calculator */}
        <div className="animate-fade-in">
          {activeCalculator === "gaveta" && <DrawerCalculator />}
          {activeCalculator === "sapateira" && <ShoerackCalculator />}
          {activeCalculator === "ripado" && <RipadoCalculator />}
          {activeCalculator === "rodape" && <BaseboardCalculator />}
          {activeCalculator === "prateleira" && <ShelfCalculator />}
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-border/30 text-center">
          <p className="text-lg font-semibold text-foreground">Doriva Móveis Sob Medida</p>
          <p className="text-sm text-muted-foreground mt-1">Calculadora desenvolvida por William</p>
        </footer>
      </div>
      
      {/* Notes Button */}
      <NotesDialog />
    </div>
  );
};

export default Index;
