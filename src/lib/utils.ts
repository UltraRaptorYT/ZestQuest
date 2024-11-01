import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export function bingoSolver(
  board: Record<string, number | null>,
  selections: number[]
) {
  // Define the board keys from A to Y
  const keys = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
  ];

  // Initialize a marked board where `true` represents a marked cell
  const marked: Record<string, boolean> = {};
  keys.forEach((key) => (marked[key] = selections.includes(board[key] || 0)));

  // Helper function to check if all cells in a line are marked
  const allMarked = (cells: string[]): boolean =>
    cells.every((key) => marked[key]);

  // Initialize bingo count
  let bingoCount = 0;

  // Check rows for bingos
  for (let row = 0; row < 5; row++) {
    const rowKeys = keys.slice(row * 5, row * 5 + 5);
    if (allMarked(rowKeys)) {
      bingoCount++;
    }
  }

  // Check columns for bingos
  for (let col = 0; col < 5; col++) {
    const columnKeys = [
      keys[col],
      keys[col + 5],
      keys[col + 10],
      keys[col + 15],
      keys[col + 20],
    ];
    if (allMarked(columnKeys)) {
      bingoCount++;
    }
  }

  // Check diagonals for bingos
  const diagonal1 = [keys[0], keys[6], keys[12], keys[18], keys[24]]; // top-left to bottom-right
  const diagonal2 = [keys[4], keys[8], keys[12], keys[16], keys[20]]; // top-right to bottom-left

  if (allMarked(diagonal1)) {
    bingoCount++;
  }
  if (allMarked(diagonal2)) {
    bingoCount++;
  }

  // Return total count of bingos
  return bingoCount;
}
