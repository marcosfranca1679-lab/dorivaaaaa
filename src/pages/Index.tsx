import { useCallback, useState } from "react";
import { Calculator, Footprints, LayoutGrid, RectangleHorizontal, Layers } from "lucide-react";
import DrawerCalculator from "@/components/DrawerCalculator";
import ShoerackCalculator from "@/components/ShoerackCalculator";
import RipadoCalculator from "@/components/RipadoCalculator";
import BaseboardCalculator from "@/components/BaseboardCalculator";
import ShelfCalculator from "@/components/ShelfCalculator";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="mb-4">
            <div className="w-64 md:w-80 mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                Doriva Móveis
              </h1>
              <p className="text-sm text-muted-foreground">Sob Medida</p>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 tracking-tight">
            Calculadora Marcenaria
          </h2>
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
      </div>
    </div>
  );
};

export default Index;
