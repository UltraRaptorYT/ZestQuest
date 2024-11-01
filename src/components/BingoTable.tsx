import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { BingoAnimalsType } from "@/types";
import { cn } from "@/lib/utils";

type BingoTableType = {
  isDisabled: boolean;
  onComplete: (complete: boolean) => void;
  selectedAnimals: Record<string, number | null>;
  handleSelect: (key: string, value: number) => void;
};

export default function BingoTable({
  isDisabled = true,
  onComplete,
  selectedAnimals,
  handleSelect,
}: BingoTableType) {
  const [marked, setMarked] = useState<number[]>([]);
  const fakeBoard = Array.from({ length: 25 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const [bingoAnimalList, setBingoAnimalList] = useState<BingoAnimalsType[]>(
    []
  );

  useEffect(() => {
    async function getBingoAnimals() {
      const { data, error } = await supabase
        .from("zest_bingo_list")
        .select()
        .order("animal");
      if (error) {
        console.log(error);
        return;
      }
      setBingoAnimalList(data);
    }
    getBingoAnimals();
  }, []);

  useEffect(() => {
    const allSelected = Object.values(selectedAnimals).every(
      (value) => value !== null
    );
    onComplete(allSelected);
    console.log(selectedAnimals, "hi");
  }, [selectedAnimals, onComplete]);

  async function getBingo() {
    const { data, error } = await supabase.from("zest_bingo").select();
    if (error) {
      console.log(error);
      return;
    }
    console.log(data);
    setMarked(data.map((e) => e.animal_id));
  }

  // useEffect(() => {
  //   if (marked.length) {
  //     bingoSolver(selectedAnimals, marked);
  //   }
  // }, [marked]);

  useEffect(() => {
    getBingo();
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zest_bingo" },
        async (payload) => {
          console.log("Change received!", payload);
          await getBingo();
        }
      )
      .subscribe();
  }, []);

  return (
    <div className="max-h-[500px] max-w-full grid grid-cols-5 grid-rows-5 justify-center items-center align-center justify-self-center py-2 aspect-square">
      {fakeBoard.map((letter, idx) => {
        const availableAnimals = bingoAnimalList.filter(
          (animal) =>
            !Object.values(selectedAnimals).includes(animal.id) ||
            selectedAnimals[letter] === animal.id
        );

        return (
          <div className="relative w-full h-full" key={"animal" + idx}>
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-2xl pointer-events-none",
                marked.includes(
                  String(selectedAnimals[letter]) == "null"
                    ? 0
                    : selectedAnimals[letter] || 0
                ) && isDisabled
                  ? "opacity-100"
                  : "opacity-0"
              )}
            >
              ❌
            </div>
            <Select
              key={letter}
              disabled={isDisabled}
              value={
                String(selectedAnimals[letter]) == "null"
                  ? undefined
                  : String(selectedAnimals[letter])
              }
              onValueChange={(value) => handleSelect(letter, Number(value))}
            >
              <SelectTrigger
                className={cn(
                  "w-full h-full text-3xl text-center justify-center disabled:opacity-75 disabled:pointer-events-none",
                  marked.includes(
                    String(selectedAnimals[letter]) == "null"
                      ? 0
                      : selectedAnimals[letter] || 0
                  ) && isDisabled
                    ? "bg-white"
                    : "bg-transparent"
                )}
              >
                <SelectValue placeholder={letter} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="text-2xl">
                  {availableAnimals.map((animal) => (
                    <SelectItem
                      key={animal.id}
                      className="text-2xl text-center"
                      value={String(animal.id)}
                    >
                      {animal.logo}&nbsp;
                      <span className="text-base">{animal.animal}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
