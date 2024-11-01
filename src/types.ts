export type GroupType = {
  value: string;
  label: string;
  color: string;
  bingo?: Record<string, number | null>;
};

export type BingoAnimalsType = {
  id: number;
  logo: string;
  animal: string;
  created_at: Date;
};
