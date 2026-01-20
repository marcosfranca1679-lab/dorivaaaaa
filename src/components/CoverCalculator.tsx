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
        type: "Tampa de Gaveta",
        sideGap: 0.2, // folga lateral (cada lado)
        topGap: 0.2,
        bottomGap: 0.2,
        betweenGap: 0.4
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
        bottomExtra: hasPassingHandle ? bottomExtra : undefined,
        sideGap: 0.2,
        topGap: 0.2,
        bottomGap: 0.2,
        betweenGap: 0.4
      };
    }
  };

  const result = calculateDimensions();

  // Visual distribution component for Tampas (vertical stacking)
  const renderTampaVisualization = () => {
    if (!result) return null;
    
    const items = [];
    
    // Top gap
    items.push(
      <div key="top-gap" className="flex items-center justify-center">
        <div className="h-3 w-full bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center">
          <span className="text-[10px] text-amber-700 font-medium">0,2 cm</span>
        </div>
      </div>
    );
    
    for (let i = 0; i < quantityValue; i++) {
      // Tampa
      items.push(
        <div key={`tampa-${i}`} className="flex items-center gap-2">
          <div className="w-2 bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center self-stretch">
            <span className="text-[8px] text-amber-700 font-medium writing-vertical">0,2</span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-primary/20 to-primary/30 border-2 border-primary/50 rounded-lg p-3 text-center">
            <div className="font-bold text-foreground text-sm">Tampa {i + 1}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {result.width.toFixed(2)} x {result.height.toFixed(2)} cm
            </div>
          </div>
          <div className="w-2 bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center self-stretch">
            <span className="text-[8px] text-amber-700 font-medium writing-vertical">0,2</span>
          </div>
        </div>
      );
      
      // Gap between tampas (except after last one)
      if (i < quantityValue - 1) {
        items.push(
          <div key={`gap-${i}`} className="flex items-center justify-center">
            <div className="h-4 w-full bg-amber-300/50 border border-dashed border-amber-500 rounded flex items-center justify-center">
              <span className="text-[10px] text-amber-800 font-medium">0,4 cm</span>
            </div>
          </div>
        );
      }
    }
    
    // Bottom gap
    items.push(
      <div key="bottom-gap" className="flex items-center justify-center">
        <div className="h-3 w-full bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center">
          <span className="text-[10px] text-amber-700 font-medium">0,2 cm</span>
        </div>
      </div>
    );
    
    return (
      <div className="bg-secondary/20 rounded-xl p-4 border border-border/30">
        <h4 className="text-sm font-semibold text-foreground mb-3 text-center">Distribuição Visual</h4>
        <div className="bg-card/50 rounded-lg p-3 border-2 border-border/50">
          <div className="text-xs text-center text-muted-foreground mb-2">
            Vão: {heightValue} x {widthValue} cm
          </div>
          <div className="space-y-1">
            {items}
          </div>
        </div>
        <div className="flex items-center gap-4 justify-center mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/30 border border-primary/50 rounded"></div>
            <span className="text-muted-foreground">Tampa</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-200/50 border border-amber-400 rounded"></div>
            <span className="text-muted-foreground">Folga</span>
          </div>
        </div>
      </div>
    );
  };

  // Visual distribution component for Portas (horizontal layout)
  const renderPortaVisualization = () => {
    if (!result) return null;
    
    return (
      <div className="bg-secondary/20 rounded-xl p-4 border border-border/30">
        <h4 className="text-sm font-semibold text-foreground mb-3 text-center">Distribuição Visual</h4>
        <div className="bg-card/50 rounded-lg p-3 border-2 border-border/50">
          <div className="text-xs text-center text-muted-foreground mb-2">
            Vão: {heightValue} x {widthValue} cm
          </div>
          
          {/* Top gap for height */}
          <div className="flex items-center justify-center mb-1">
            <div className="h-3 w-full bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center">
              <span className="text-[10px] text-amber-700 font-medium">0,2 cm (altura)</span>
            </div>
          </div>
          
          {/* Horizontal doors layout */}
          <div className="flex items-stretch gap-1 min-h-[100px]">
            {/* Left gap */}
            <div className="w-4 bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center">
              <span className="text-[8px] text-amber-700 font-medium writing-vertical">0,2</span>
            </div>
            
            {Array.from({ length: quantityValue }).map((_, i) => (
              <div key={i} className="contents">
                {/* Porta */}
                <div className="flex-1 bg-gradient-to-b from-primary/20 to-primary/30 border-2 border-primary/50 rounded-lg p-2 flex flex-col items-center justify-center min-w-[60px]">
                  <div className="font-bold text-foreground text-xs">Porta {i + 1}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 text-center">
                    {result.width.toFixed(2)} x {result.height.toFixed(2)} cm
                  </div>
                  {hasPassingHandle && (
                    <div className="text-[9px] text-accent mt-1">+1cm ↓</div>
                  )}
                </div>
                
                {/* Gap between doors */}
                {i < quantityValue - 1 && (
                  <div className="w-5 bg-amber-300/50 border border-dashed border-amber-500 rounded flex items-center justify-center">
                    <span className="text-[8px] text-amber-800 font-medium writing-vertical">0,4</span>
                  </div>
                )}
              </div>
            ))}
            
            {/* Right gap */}
            <div className="w-4 bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center">
              <span className="text-[8px] text-amber-700 font-medium writing-vertical">0,2</span>
            </div>
          </div>
          
          {/* Bottom gap for height */}
          <div className="flex items-center justify-center mt-1">
            <div className="h-3 w-full bg-amber-200/50 border border-dashed border-amber-400 rounded flex items-center justify-center">
              <span className="text-[10px] text-amber-700 font-medium">0,2 cm (altura)</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 justify-center mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/30 border border-primary/50 rounded"></div>
            <span className="text-muted-foreground">Porta</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-200/50 border border-amber-400 rounded"></div>
            <span className="text-muted-foreground">Folga</span>
          </div>
        </div>
      </div>
    );
  };

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

  // Visual content for download
  const getVisualDownloadContent = () => {
    if (!result) return null;

    if (coverType === "tampa") {
      const items = [];
      items.push(
        <div key="top-gap" className="h-3 w-full bg-amber-200 border border-amber-400 rounded flex items-center justify-center">
          <span className="text-[9px] text-amber-800">0,2 cm</span>
        </div>
      );
      
      for (let i = 0; i < quantityValue; i++) {
        items.push(
          <div key={`tampa-${i}`} className="flex items-center gap-1">
            <div className="w-2 bg-amber-200 border border-amber-400 rounded self-stretch"></div>
            <div className="flex-1 bg-primary/20 border-2 border-primary/50 rounded p-2 text-center">
              <div className="font-bold text-xs">Tampa {i + 1}</div>
              <div className="text-[10px] text-muted-foreground">{result.width.toFixed(2)} x {result.height.toFixed(2)} cm</div>
            </div>
            <div className="w-2 bg-amber-200 border border-amber-400 rounded self-stretch"></div>
          </div>
        );
        
        if (i < quantityValue - 1) {
          items.push(
            <div key={`gap-${i}`} className="h-4 w-full bg-amber-300 border border-amber-500 rounded flex items-center justify-center">
              <span className="text-[9px] text-amber-800">0,4 cm</span>
            </div>
          );
        }
      }
      
      items.push(
        <div key="bottom-gap" className="h-3 w-full bg-amber-200 border border-amber-400 rounded flex items-center justify-center">
          <span className="text-[9px] text-amber-800">0,2 cm</span>
        </div>
      );
      
      return (
        <div className="space-y-1 p-2 bg-card rounded-lg border">
          <div className="text-xs text-center mb-2">Vão: {heightValue} x {widthValue} cm</div>
          {items}
        </div>
      );
    } else {
      return (
        <div className="p-2 bg-card rounded-lg border">
          <div className="text-xs text-center mb-2">Vão: {heightValue} x {widthValue} cm</div>
          <div className="flex items-stretch gap-1 min-h-[80px]">
            <div className="w-3 bg-amber-200 border border-amber-400 rounded"></div>
            {Array.from({ length: quantityValue }).map((_, i) => (
              <div key={i} className="contents">
                <div className="flex-1 bg-primary/20 border-2 border-primary/50 rounded p-1 flex flex-col items-center justify-center min-w-[50px]">
                  <div className="font-bold text-[10px]">Porta {i + 1}</div>
                  <div className="text-[8px] text-muted-foreground">{result.width.toFixed(2)} x {result.height.toFixed(2)}</div>
                  {hasPassingHandle && <div className="text-[8px] text-accent">+1cm ↓</div>}
                </div>
                {i < quantityValue - 1 && (
                  <div className="w-4 bg-amber-300 border border-amber-500 rounded"></div>
                )}
              </div>
            ))}
            <div className="w-3 bg-amber-200 border border-amber-400 rounded"></div>
          </div>
        </div>
      );
    }
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
            
            {/* Visual Distribution */}
            {coverType === "tampa" ? renderTampaVisualization() : renderPortaVisualization()}
            
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
                
                {/* Visual in download */}
                {getVisualDownloadContent()}
                
                <div className="space-y-2 mt-4">
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
