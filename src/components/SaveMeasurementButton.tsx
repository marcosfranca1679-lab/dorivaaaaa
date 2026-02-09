import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useSavedMeasurements, SavedMeasurement } from "@/contexts/SavedMeasurementsContext";
import { toast } from "sonner";

interface SaveMeasurementButtonProps {
  measurement: Omit<SavedMeasurement, "id" | "timestamp">;
}

const SaveMeasurementButton = ({ measurement }: SaveMeasurementButtonProps) => {
  const { addMeasurement } = useSavedMeasurements();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    addMeasurement(measurement);
    setSaved(true);
    toast.success("Medida salva na lista!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      onClick={handleSave}
      className={`group flex items-center justify-center gap-2 w-full py-3 px-6
        font-semibold rounded-2xl shadow-md transition-all duration-300
        ${saved
          ? "bg-emerald-600 text-white"
          : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 hover:shadow-lg"
        }`}
    >
      {saved ? (
        <>
          <Check className="w-5 h-5" />
          <span>Medida Salva!</span>
        </>
      ) : (
        <>
          <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>Salvar na Lista</span>
        </>
      )}
    </button>
  );
};

export default SaveMeasurementButton;
