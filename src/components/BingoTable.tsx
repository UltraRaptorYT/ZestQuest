import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function BingoTable(board: string[], marked: string[]) {
  useEffect(() => {
    async function getBingoAnimals() {}
  }, []);

  return (
    <div className=" w-full grid grid-cols-5 grid-rows-5 justify-center items-center align-center justify-self-center">
      <Select disabled={false}>
        <SelectTrigger className="w-full h-full text-5xl text-center justify-center">
          <SelectValue placeholder="A" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup className="text-5xl">
            <SelectItem className="text-3xl" value="apple">
              🐌
            </SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex justify-center items-center aspect-square w-full text-5xl">
        🐌
      </div>
      <div className="flex justify-center items-center aspect-square  w-full">
        🐌
      </div>
      <div className="flex justify-center items-center aspect-square  w-full">
        🐌
      </div>
      <div className="flex justify-center items-center aspect-square  w-full">
        🐌
      </div>
      <div className="flex justify-center items-center aspect-square  w-full">
        🐌
      </div>
    </div>
  );
}
