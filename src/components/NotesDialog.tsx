import { useState, useRef, useEffect } from "react";
import { FileText, Ruler, ImageDown, Plus, Trash2, Phone, Mail, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import logoDoriva from "@/assets/logo-doriva.png";
import bannerMarceneiro from "@/assets/banner-marceneiro.jpg";

// Convert image URL to base64 for offline support
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
};

interface BudgetItem {
  id: string;
  description: string;
  value: string;
}

interface MeasurementItem {
  id: string;
  name: string;
  value: string;
}

const NotesDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState("budget");
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [bannerBase64, setBannerBase64] = useState<string>("");
  
  // Pre-convert images to base64 on mount for offline support
  useEffect(() => {
    imageToBase64(logoDoriva).then(setLogoBase64).catch(console.error);
    imageToBase64(bannerMarceneiro).then(setBannerBase64).catch(console.error);
  }, []);
  
  // Budget state
  const [budgetClient, setBudgetClient] = useState({ name: "", phone: "", email: "" });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: "1", description: "", value: "" }
  ]);
  
  // Measurements state
  const [measureClient, setMeasureClient] = useState({ name: "", phone: "", email: "" });
  const [measureItems, setMeasureItems] = useState<MeasurementItem[]>([
    { id: "1", name: "", value: "" }
  ]);

  const budgetCaptureRef = useRef<HTMLDivElement>(null);
  const measureCaptureRef = useRef<HTMLDivElement>(null);

  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, { id: Date.now().toString(), description: "", value: "" }]);
  };

  const removeBudgetItem = (id: string) => {
    if (budgetItems.length > 1) {
      setBudgetItems(budgetItems.filter(item => item.id !== id));
    }
  };

  const updateBudgetItem = (id: string, field: "description" | "value", value: string) => {
    setBudgetItems(budgetItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addMeasureItem = () => {
    setMeasureItems([...measureItems, { id: Date.now().toString(), name: "", value: "" }]);
  };

  const removeMeasureItem = (id: string) => {
    if (measureItems.length > 1) {
      setMeasureItems(measureItems.filter(item => item.id !== id));
    }
  };

  const updateMeasureItem = (id: string, field: "name" | "value", value: string) => {
    setMeasureItems(measureItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDownloadBudget = async () => {
    if (!budgetClient.name.trim()) {
      toast.error("Preencha o nome do cliente!");
      return;
    }

    if (!budgetCaptureRef.current) return;
    setIsCapturing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(budgetCaptureRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement("a");
      link.download = `orcamento-${budgetClient.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Orçamento salvo como imagem!");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadMeasures = async () => {
    if (!measureClient.name.trim()) {
      toast.error("Preencha o nome do cliente!");
      return;
    }

    if (!measureCaptureRef.current) return;
    setIsCapturing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(measureCaptureRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement("a");
      link.download = `medidas-${measureClient.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Lista de medidas salva como imagem!");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsCapturing(false);
    }
  };

  const calculateTotal = () => {
    return budgetItems.reduce((total, item) => {
      const value = parseFloat(item.value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      return total + value;
    }, 0);
  };

  return (
    <>
      {/* Hidden Budget Capture Element */}
      <div
        ref={budgetCaptureRef}
        className={isCapturing && activeTab === "budget" ? "block fixed left-[-9999px] top-0" : "hidden"}
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
                <h1 className="text-xl font-bold text-amber-400 drop-shadow">ORÇAMENTO</h1>
                <p className="text-white/70 text-xs drop-shadow">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Client Info */}
            <div className="bg-white/5 rounded-2xl p-5 mb-5 border border-white/10">
              <h3 className="text-amber-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-amber-400/70" />
                  <span className="text-white">{budgetClient.name || "—"}</span>
                </div>
                {budgetClient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-amber-400/70" />
                    <span className="text-white">{budgetClient.phone}</span>
                  </div>
                )}
                {budgetClient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amber-400/70" />
                    <span className="text-white">{budgetClient.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Items */}
            <div className="bg-white/5 rounded-2xl p-5 mb-5 border border-white/10">
              <h3 className="text-amber-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Itens do Orçamento
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_120px] gap-3 pb-2 border-b border-white/10">
                  <span className="text-white/60 text-sm font-medium">Descrição</span>
                  <span className="text-white/60 text-sm font-medium text-right">Valor</span>
                </div>
                {budgetItems.filter(item => item.description || item.value).map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[1fr_120px] gap-3 py-2 border-b border-white/5">
                    <span className="text-white">{item.description || `Item ${index + 1}`}</span>
                    <span className="text-emerald-400 font-semibold text-right">
                      {item.value ? `R$ ${item.value}` : "—"}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_120px] gap-3 pt-3 border-t-2 border-amber-500/30">
                  <span className="text-white font-bold text-lg">TOTAL</span>
                  <span className="text-amber-400 font-bold text-lg text-right">
                    R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-amber-500/30 text-center">
              <p className="text-amber-400 font-semibold">Doriva Móveis Sob Medida</p>
              <p className="text-white/50 text-xs mt-1">Qualidade e precisão em cada detalhe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Measurements Capture Element */}
      <div
        ref={measureCaptureRef}
        className={isCapturing && activeTab === "measures" ? "block fixed left-[-9999px] top-0" : "hidden"}
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
                <h1 className="text-xl font-bold text-amber-400 drop-shadow">LISTA DE MEDIDAS</h1>
                <p className="text-white/70 text-xs drop-shadow">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Client Info */}
            <div className="bg-white/5 rounded-2xl p-5 mb-5 border border-white/10">
              <h3 className="text-amber-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-amber-400/70" />
                  <span className="text-white">{measureClient.name || "—"}</span>
                </div>
                {measureClient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-amber-400/70" />
                    <span className="text-white">{measureClient.phone}</span>
                  </div>
                )}
                {measureClient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amber-400/70" />
                    <span className="text-white">{measureClient.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Measurement Items */}
            <div className="bg-white/5 rounded-2xl p-5 mb-5 border border-white/10">
              <h3 className="text-amber-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Medidas
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_150px] gap-3 pb-2 border-b border-white/10">
                  <span className="text-white/60 text-sm font-medium">Nome</span>
                  <span className="text-white/60 text-sm font-medium text-right">Medida</span>
                </div>
                {measureItems.filter(item => item.name || item.value).map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[1fr_150px] gap-3 py-2 border-b border-white/5">
                    <span className="text-white">{item.name || `Medida ${index + 1}`}</span>
                    <span className="text-emerald-400 font-semibold text-right font-mono">
                      {item.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-amber-500/30 text-center">
              <p className="text-amber-400 font-semibold">Doriva Móveis Sob Medida</p>
              <p className="text-white/50 text-xs mt-1">Qualidade e precisão em cada detalhe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Trigger Button */}
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
            <FileText className="w-6 h-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl">
              Documentos
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Orçamento
              </TabsTrigger>
              <TabsTrigger value="measures" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Medidas
              </TabsTrigger>
            </TabsList>

            {/* Budget Tab */}
            <TabsContent value="budget" className="space-y-4">
              {/* Client Info */}
              <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  Dados do Cliente
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="budget-name" className="text-xs text-muted-foreground">Nome *</Label>
                    <Input
                      id="budget-name"
                      placeholder="Nome do cliente"
                      value={budgetClient.name}
                      onChange={(e) => setBudgetClient({ ...budgetClient, name: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="budget-phone" className="text-xs text-muted-foreground">Telefone</Label>
                      <Input
                        id="budget-phone"
                        placeholder="(00) 00000-0000"
                        value={budgetClient.phone}
                        onChange={(e) => setBudgetClient({ ...budgetClient, phone: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget-email" className="text-xs text-muted-foreground">E-mail</Label>
                      <Input
                        id="budget-email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={budgetClient.email}
                        onChange={(e) => setBudgetClient({ ...budgetClient, email: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Itens do Orçamento
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {budgetItems.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Descrição ${index + 1}`}
                        value={item.description}
                        onChange={(e) => updateBudgetItem(item.id, "description", e.target.value)}
                        className="flex-1 bg-background"
                      />
                      <Input
                        placeholder="R$ 0,00"
                        value={item.value}
                        onChange={(e) => updateBudgetItem(item.id, "value", e.target.value)}
                        className="w-28 bg-background"
                      />
                      <button
                        onClick={() => removeBudgetItem(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        disabled={budgetItems.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addBudgetItem}
                  className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar item
                </button>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="text-lg font-bold text-amber-500">
                  R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadBudget}
                disabled={isCapturing || !budgetClient.name.trim()}
                className="group flex items-center justify-center gap-2 w-full py-3 px-4
                  bg-gradient-to-r from-amber-500 to-orange-500
                  hover:from-amber-600 hover:to-orange-600
                  text-white font-semibold rounded-xl shadow-lg
                  hover:shadow-xl transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageDown className="w-5 h-5" />
                <span>{isCapturing ? "Gerando..." : "Baixar Orçamento"}</span>
              </button>
            </TabsContent>

            {/* Measurements Tab */}
            <TabsContent value="measures" className="space-y-4">
              {/* Client Info */}
              <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  Dados do Cliente
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="measure-name" className="text-xs text-muted-foreground">Nome *</Label>
                    <Input
                      id="measure-name"
                      placeholder="Nome do cliente"
                      value={measureClient.name}
                      onChange={(e) => setMeasureClient({ ...measureClient, name: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="measure-phone" className="text-xs text-muted-foreground">Telefone</Label>
                      <Input
                        id="measure-phone"
                        placeholder="(00) 00000-0000"
                        value={measureClient.phone}
                        onChange={(e) => setMeasureClient({ ...measureClient, phone: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="measure-email" className="text-xs text-muted-foreground">E-mail</Label>
                      <Input
                        id="measure-email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={measureClient.email}
                        onChange={(e) => setMeasureClient({ ...measureClient, email: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurement Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-amber-500" />
                  Lista de Medidas
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {measureItems.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Nome da medida ${index + 1}`}
                        value={item.name}
                        onChange={(e) => updateMeasureItem(item.id, "name", e.target.value)}
                        className="flex-1 bg-background"
                      />
                      <Input
                        placeholder="Ex: 120 x 60 cm"
                        value={item.value}
                        onChange={(e) => updateMeasureItem(item.id, "value", e.target.value)}
                        className="w-36 bg-background"
                      />
                      <button
                        onClick={() => removeMeasureItem(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        disabled={measureItems.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMeasureItem}
                  className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar medida
                </button>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadMeasures}
                disabled={isCapturing || !measureClient.name.trim()}
                className="group flex items-center justify-center gap-2 w-full py-3 px-4
                  bg-gradient-to-r from-amber-500 to-orange-500
                  hover:from-amber-600 hover:to-orange-600
                  text-white font-semibold rounded-xl shadow-lg
                  hover:shadow-xl transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageDown className="w-5 h-5" />
                <span>{isCapturing ? "Gerando..." : "Baixar Lista de Medidas"}</span>
              </button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesDialog;
