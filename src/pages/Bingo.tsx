import { useEffect, useState } from "react";
import BingoTable from "@/components/BingoTable";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, useLocalStorageState } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { GroupType } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Bingo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useLocalStorageState("group", "");
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [bingoDisabled, setBingoDisabled] = useState<boolean>(false);
  const [isBoardComplete, setIsBoardComplete] = useState(false);

  // Initialize selectedAnimals state
  const [selectedAnimals, setSelectedAnimals] = useState<
    Record<string, number | null>
  >(
    Object.fromEntries(
      [
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
      ].map((letter) => [letter, null])
    )
  );

  useEffect(() => {
    async function getTeamName() {
      const { data, error } = await supabase
        .from("zest_team")
        .select("*")
        .order("letter", { ascending: true });
      if (error) {
        console.log(error);
        return;
      }
      let group = data.map((e) => {
        return { value: e.letter, label: e.team_name, color: e.color };
      });
      setGroups(group);
      return data;
    }
    getTeamName();
  }, []);

  useEffect(() => {
    async function getBoard() {
      const { data, error } = await supabase
        .from("zest_team")
        .select()
        .eq("letter", value);
      if (error) {
        console.log(error);
        return;
      }
      if (data[0].bingo) {
        setSelectedAnimals(data[0].bingo);
      } else {
        setSelectedAnimals(
          Object.fromEntries(
            [
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
            ].map((letter) => [letter, null])
          )
        );
      }
    }

    getBoard();
  }, [value]);

  // Update selected animal in state
  const handleSelect = (key: string, value: number) => {
    setSelectedAnimals((prev) => ({ ...prev, [key]: value }));
  };

  async function submitBingoBoard() {
    if (!isBoardComplete) {
      alert("Please complete the board before submitting.");
      return;
    }
    if (!value) {
      alert("Please select a group you are submitting for.");
      return;
    }
    // Submit logic here
    console.log("Board submitted:", selectedAnimals);
    const { error } = await supabase
      .from("zest_team")
      .update({ bingo: selectedAnimals })
      .eq("letter", value);

    if (error) {
      console.log(error);
      return;
    }
  }

  return (
    <div className="w-full mx-auto h-full flex flex-col justify-start items-center">
      <div className="flex flex-col gap-2 w-full">
        <p>Group Name</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value
                ? groups.find((group) => group.value === value)?.label
                : "Select group..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search group..." />
              <CommandList>
                <CommandEmpty>No group found.</CommandEmpty>
                <CommandGroup>
                  {groups.map((group) => (
                    <CommandItem
                      key={group.value}
                      value={group.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                      // className={"bg-" + group.color}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === group.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {group.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <BingoTable
        isDisabled={bingoDisabled}
        onComplete={setIsBoardComplete}
        selectedAnimals={selectedAnimals}
        handleSelect={handleSelect}
      />
      <Button
        className="mx-auto pt-2"
        disabled={bingoDisabled || !isBoardComplete}
        onClick={submitBingoBoard}
      >
        Submit
      </Button>
    </div>
  );
}
