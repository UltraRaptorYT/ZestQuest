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

type BingoTableType = {
  isDisabled: boolean;
  onComplete: (complete: boolean) => void;
  selectedAnimals: Record<string, number | null>;
  handleSelect: (key: string, value: number) => void;
};

export default function BingoTable({
  isDisabled = false,
  onComplete,
  selectedAnimals,
  handleSelect,
}: BingoTableType) {
  const fakeBoard = [
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
  }, [selectedAnimals, onComplete]);

  return (
    <div className="max-h-[500px] max-w-full grid grid-cols-5 grid-rows-5 justify-center items-center align-center justify-self-center py-2 aspect-square">
      {fakeBoard.map((letter) => {
        const availableAnimals = bingoAnimalList.filter(
          (animal) =>
            !Object.values(selectedAnimals).includes(animal.id) ||
            selectedAnimals[letter] === animal.id
        );

        return (
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
            <SelectTrigger className="w-full h-full text-3xl text-center justify-center">
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
        );
      })}
    </div>
  );
}
