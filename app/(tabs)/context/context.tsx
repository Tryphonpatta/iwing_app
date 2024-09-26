// MyContext.tsx
import { Module } from "@/util/buttonType";
import React, { createContext, useState, ReactNode, useContext } from "react";

// Define the shape of the context value
interface ModuleContextType {
  module: Module[];
  setModule: React.Dispatch<React.SetStateAction<Module[]>>;
}

// Create the context
const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

// Create a provider component
export const ModuleContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [module, setModule] = useState<Module[]>([]);

  return (
    <ModuleContext.Provider value={{ module, setModule }}>
      {children}
    </ModuleContext.Provider>
  );
};

// Create a custom hook to easily use the context
export const useModuleContext = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return context;
};
