import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import DownloadImageButton from "./DownloadImageButton";

type CoverType = "tampa" | "porta";

const CoverCalculator = () => {
  const [coverType, setCoverType] = useState<CoverType>("tampa");
  const [totalHeight, setTotalHeight] = useState("");
  const [totalWidth, setTotalWidth] = useState("");
  const [quantity, setQuantity] = useState("");
  const [hasPassingHandle, setHasPassingHandle] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const heightValue = parseFloat(totalHeight) || 0;
  const widthValue = parseFloat(totalWidth) || 0;
  const quantityValue = parseInt(quantity) || 0;

  // Calculate cover dimensions
  const calculateDimensions = () => {
    if (heightValue <= 0 || widthValue <= 0 || quantityValue <= 0) {
      return null;
    }

    if (coverType === "tampa") {
      // Tampa de gaveta logic
      // Largura: desconta 0,4 cm da largura total
      const coverWidth = widthValue - 0.4;

      // Altura: 0,2 início + 0,4 para cada encontro + 0,2 final
      // Encontros = quantidade - 1
      const encounters = quantityValue - 1;
      const totalHeightDiscount = 0.2 + (encounters * 0.4) + 0.2;
      const remainingHeight = heightValue - totalHeightDiscount;
      const coverHeight = remainingHeight / quantityValue;

      return {
        width: coverWidth,
        height: coverHeight,
        type: "Tampa de Gaveta"
      };
    } else {
      // Porta logic
      // Altura: desconta 0,4 cm da altura total
      let coverHeight = heightValue - 0.4;

      // Largura: 0,2 início + 0,4 para cada encontro + 0,2 final
      const encounters = quantityValue - 1;
      const totalWidthDiscount = 0.2 + (encounters * 0.4) + 0.2;
      const remainingWidth = widthValue - totalWidthDiscount;
      const coverWidth = remainingWidth / quantityValue;

      // Puxador passante: desconta 0,2 na altura e adiciona 1 cm embaixo
      let bottomExtra = 0;
      if (hasPassingHandle) {
        coverHeight = coverHeight - 0.2;
        bottomExtra = 1;
      }

      return {
        width: coverWidth,
        height: coverHeight,
        type: "Porta",
        bottomExtra: hasPassingHandle ? bottomExtra : undefined
      };
    }
  };

  const result = calculateDimensions();

  const getResultContent = () => {
    if (!result) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl">
          <span className="text-muted-foreground font-medium">Tipo:</span>
          <span className="font-bold text-foreground">{result.type}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl">
          <span className="text-muted-foreground font-medium">Quantidade:</span>
          <span className="font-bold text-foreground">{quantityValue}</span>
        </div>
        <Separator className="bg-border/50" />
        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl border border-primary/20">
          <span className="text-foreground font-medium">Largura:</span>
          <span className="font-bold text-primary text-lg">{result.width.toFixed(2)} cm</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl border border-primary/20">
          <span className="text-foreground font-medium">Altura:</span>
          <span className="font-bold text-primary text-lg">{result.height.toFixed(2)} cm</span>
        </div>
        {result.bottomExtra !== undefined && (
          <div className="flex justify-between items-center p-3 bg-accent/20 rounded-xl border border-accent/30">
            <span className="text-foreground font-medium">Acréscimo inferior (puxador):</span>
            <span className="font-bold text-accent text-lg">+{result.bottomExtra.toFixed(1)} cm</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-2 border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-2xl">
          <button
            onClick={() => {
              setCoverType("tampa");
              setHasPassingHandle(false);
            }}
            className={`p-3 rounded-xl transition-all duration-300 font-semibold ${
              coverType === "tampa"
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            Tampas de Gaveta
          </button>
          <button
            onClick={() => setCoverType("porta")}
            className={`p-3 rounded-xl transition-all duration-300 font-semibold ${
              coverType === "porta"
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            Portas
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalHeight" className="text-foreground font-medium">
                Altura do vão (cm)
              </Label>
              <Input
                id="totalHeight"
                type="number"
                step="0.1"
                placeholder="Ex: 60"
                value={totalHeight}
                onChange={(e) => setTotalHeight(e.target.value)}
                className="input-wood"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalWidth" className="text-foreground font-medium">
                Largura do vão (cm)
              </Label>
              <Input
                id="totalWidth"
                type="number"
                step="0.1"
                placeholder="Ex: 40"
                value={totalWidth}
                onChange={(e) => setTotalWidth(e.target.value)}
                className="input-wood"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-foreground font-medium">
              Quantidade de {coverType === "tampa" ? "gavetas" : "portas"}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Ex: 3"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-wood"
            />
          </div>

          {/* Passing Handle Option - Only for Doors */}
          {coverType === "porta" && (
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/30">
              <div className="space-y-1">
                <Label htmlFor="passingHandle" className="text-foreground font-medium cursor-pointer">
                  Puxador Passante
                </Label>
                <p className="text-xs text-muted-foreground">
                  Desconta 0,2cm na altura e adiciona 1cm embaixo
                </p>
              </div>
              <Switch
                id="passingHandle"
                checked={hasPassingHandle}
                onCheckedChange={setHasPassingHandle}
              />
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <>
            <Separator className="bg-border/50" />
            
            <div ref={resultRef} className="space-y-4">
              <h3 className="text-lg font-bold text-foreground text-center">
                Medidas para Corte
              </h3>
              {getResultContent()}
            </div>

            <DownloadImageButton
              filename={`${coverType === "tampa" ? "tampas-gaveta" : "portas"}-${quantityValue}un`}
            >
              <div className="space-y-4 p-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-foreground">
                    {coverType === "tampa" ? "Tampas de Gaveta" : "Portas"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Vão: {heightValue} x {widthValue} cm
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="font-bold">{quantityValue}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-medium">Largura:</span>
                    <span className="font-bold text-primary text-lg">{result.width.toFixed(2)} cm</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-medium">Altura:</span>
                    <span className="font-bold text-primary text-lg">{result.height.toFixed(2)} cm</span>
                  </div>
                  {result.bottomExtra !== undefined && (
                    <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg border border-accent/30">
                      <span className="font-medium">Acréscimo inferior:</span>
                      <span className="font-bold text-accent">+{result.bottomExtra.toFixed(1)} cm</span>
                    </div>
                  )}
                  {hasPassingHandle && coverType === "porta" && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      ✓ Com puxador passante
                    </div>
                  )}
                </div>
              </div>
            </DownloadImageButton>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CoverCalculator;
