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
	const SCREEN_WIDTH = Dimensions.get("window").width;
	const SCREEN_HEIGHT = Dimensions.get("window").height * 0.6; // -250 เพื่อทำให้ไม่ตกลงไปด้านล่าง
	// const initialPositions: Position[] = Array.from(

	// 	{ length: 9 },
	// 	(_, index) => ({
	// 		x: 50 + index * 30,
	// 		y: 100 + index * 30,
	// 	})
	// );
	const initialPositions: Position[] = [
		{ x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.1 }, // padindex 0 (L1)
		{ x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.1 }, // padindex 1 (R1)
		{ x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.3 }, // padindex 2 (L2)
		{ x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.3 }, // padindex 3 (R2)
		{ x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.5 }, // padindex 4 (L3)
		{ x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.5 }, // padindex 5 (R3)
		{ x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.7 }, // padindex 6 (L4)
		{ x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.7 }, // padindex 7 (R4)
	];

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
