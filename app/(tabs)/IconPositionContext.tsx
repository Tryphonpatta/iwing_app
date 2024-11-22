// IconPositionContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

type Position = { x: number; y: number };
type IconPositionContextType = {
  positions: Position[];
  setPosition: (index: number, position: Position) => void;
};

const IconPositionContext = createContext<IconPositionContextType | undefined>(
  undefined
);

export const IconPositionProvider = ({ children }: { children: ReactNode }) => {
  const initialPositions: Position[] = Array.from(
    { length: 9 },
    (_, index) => ({
      x: 50 * (index + 1),
      y: 100 * (index + 1),
    })
  );

  const [positions, setPositions] = useState<Position[]>(initialPositions);

  const setPosition = (index: number, position: Position) => {
    setPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = position;
      return newPositions;
    });
  };

  return (
    <IconPositionContext.Provider value={{ positions, setPosition }}>
      {children}
    </IconPositionContext.Provider>
  );
};

export const useIconPosition = () => {
  const context = useContext(IconPositionContext);
  if (!context)
    throw new Error("useIconPosition must be used within IconPositionProvider");
  return context;
};
