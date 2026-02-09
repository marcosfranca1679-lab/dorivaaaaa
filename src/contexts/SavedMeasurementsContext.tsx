import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export interface SavedMeasurement {
  id: string;
  type: string;
  label: string;
  inputs: { label: string; value: string }[];
  results: { label: string; value: string; highlight?: boolean }[];
  timestamp: string;
}

const STORAGE_KEY = "doriva-saved-measurements";

const loadFromStorage = (): SavedMeasurement[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (measurements: SavedMeasurement[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
  } catch { /* storage full */ }
};

interface SavedMeasurementsContextType {
  measurements: SavedMeasurement[];
  addMeasurement: (measurement: Omit<SavedMeasurement, "id" | "timestamp">) => void;
  removeMeasurement: (id: string) => void;
  clearMeasurements: () => void;
}

const SavedMeasurementsContext = createContext<SavedMeasurementsContextType | null>(null);

export const useSavedMeasurements = () => {
  const ctx = useContext(SavedMeasurementsContext);
  if (!ctx) throw new Error("useSavedMeasurements must be used within provider");
  return ctx;
};

export const SavedMeasurementsProvider = ({ children }: { children: ReactNode }) => {
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(measurements);
  }, [measurements]);

  const addMeasurement = useCallback((m: Omit<SavedMeasurement, "id" | "timestamp">) => {
    setMeasurements(prev => [...prev, {
      ...m,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const clearMeasurements = useCallback(() => setMeasurements([]), []);

  return (
    <SavedMeasurementsContext.Provider value={{ measurements, addMeasurement, removeMeasurement, clearMeasurements }}>
      {children}
    </SavedMeasurementsContext.Provider>
  );
};
