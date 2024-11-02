import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn, useLocalStorageState } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GroupType } from "@/types";

export default function AddScore({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useLocalStorageState("group", "");
  const [score, setScore] = useState(0);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const buttons = [-1, 1, -5, 5, -10, 10, -50, 50];

  async function getCurrentPoints() {
    console.log(value);
    const { data, error } = await supabase
      .from("zest_score")
      .select()
      .eq("team_id", value);
    if (error) {
      console.log(error);
      return error;
    }
    let score = 0;
    score = await data
      .map((e) => {
        return e.score;
      })
      .reduce((partialSum, a) => partialSum + a, 0);
    console.log(score);
    setScore(score);
  }

  useEffect(() => {
    if (!open && value) {
      getCurrentPoints();
    }
  }, [open, value]);

  useEffect(() => {
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zest_score" },
        async (payload) => {
          console.log("Change received!", payload);
          if (
            ("team_id" in payload.new && payload.new.team_id == value) ||
            payload.eventType == "DELETE"
          ) {
            await getCurrentPoints();
          }
        }
      )
      .subscribe();
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

  async function changeScore(scoreToAdd: number) {
    if (!value) {
      alert("Please select a group you are submitting for.");
      return;
    }
    const { error } = await supabase.from("zest_score").insert({
      team_id: value,
      score: scoreToAdd,
      isAdmin: isAdmin,
    });
    if (error) {
      console.log(error);
      return error;
    }
    setScore((prevScore) => prevScore + scoreToAdd);
    await getCurrentPoints();
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
      <div className="text-xl pt-6 pb-3">
        Current Points: <span className="font-bold">{score}</span>
      </div>
      <div className="grid grid-cols-2 gap-5 p-5 h-full ">
        {buttons.map((e) => {
          return (
            <Button
              variant="secondary"
              className="text-3xl aspect-[3/2] w-full h-full"
              onClick={() => changeScore(e)}
              key={e}
            >
              {(e >= 0 ? "+" : "") + e}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
