import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

export type CalculatorType = "gaveta" | "sapateira" | "ripado" | "rodape" | "prateleira" | "vaos" | "mdf";

export interface MDFPiece {
  width: number;
  height: number;
  quantity: number;
  label: string;
}

interface AppActionsContextType {
  // Send pieces to MDF calculator
  sendToMDF: (pieces: MDFPiece[]) => void;
  pendingMDFPieces: MDFPiece[] | null;
  clearPendingMDFPieces: () => void;

  // Edit saved measurement
  editMeasurement: (calculatorType: CalculatorType, rawData: Record<string, any>) => void;
  pendingEdit: { calculatorType: CalculatorType; rawData: Record<string, any> } | null;
  clearPendingEdit: () => void;

  // Register tab switcher from Index
  registerSwitchFn: (fn: (type: CalculatorType) => void) => void;
}

const AppActionsContext = createContext<AppActionsContextType | null>(null);

export const useAppActions = () => {
  const ctx = useContext(AppActionsContext);
  if (!ctx) throw new Error("useAppActions must be used within AppActionsProvider");
  return ctx;
};

export const AppActionsProvider = ({ children }: { children: ReactNode }) => {
  const [pendingMDFPieces, setPendingMDFPieces] = useState<MDFPiece[] | null>(null);
  const [pendingEdit, setPendingEdit] = useState<{ calculatorType: CalculatorType; rawData: Record<string, any> } | null>(null);
  const switchFnRef = useRef<((type: CalculatorType) => void) | null>(null);

  const registerSwitchFn = useCallback((fn: (type: CalculatorType) => void) => {
    switchFnRef.current = fn;
  }, []);

  const sendToMDF = useCallback((pieces: MDFPiece[]) => {
    setPendingMDFPieces(pieces);
    switchFnRef.current?.("mdf");
  }, []);

  const clearPendingMDFPieces = useCallback(() => setPendingMDFPieces(null), []);

  const editMeasurement = useCallback((calculatorType: CalculatorType, rawData: Record<string, any>) => {
    setPendingEdit({ calculatorType, rawData });
    switchFnRef.current?.(calculatorType);
  }, []);

  const clearPendingEdit = useCallback(() => setPendingEdit(null), []);

  return (
    <AppActionsContext.Provider value={{
      sendToMDF, pendingMDFPieces, clearPendingMDFPieces,
      editMeasurement, pendingEdit, clearPendingEdit,
      registerSwitchFn,
    }}>
      {children}
    </AppActionsContext.Provider>
  );
};
