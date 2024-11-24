// IconPositionContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Dimensions } from "react-native";

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
			x: 50 + index * 30,
			y: 100 + index * 30,
		})
	);

	const SCREEN_WIDTH = Dimensions.get("window").width;
	const SCREEN_HEIGHT = Dimensions.get("window").height - 250;

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
