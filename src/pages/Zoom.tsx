import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn, useLocalStorageState } from "@/lib/utils";
import zoomJSON from "@/assets/zoom.json";
import supabase from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
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

export default function Zoom() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useLocalStorageState("group", "");
  const [zoomState, setZoomState] = useState(0);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const scaleFactor = 400 / 575;
  useEffect(() => {
    async function getZoomState() {
      const { data, error } = await supabase
        .from("zest_state")
        .select()
        .eq("state", "zoom");
      if (error) {
        console.log(error);
        return;
      }
      setZoomState(data[0].value);
    }

    getZoomState();
  }, []);

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

  return (
    <div className="w-full h-full p-5 flex items-center justify-center flex-col gap-2">
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
      <div className="max-h-[400px] max-w-[400px] aspect-square flex items-center justify-center overflow-hidden mx-auto">
        <img
          src={zoomJSON["zoom"][zoomState]["url"]}
          className={cn(
            "h-full",
            "transition-transform duration-1000 ease-in-out object-contain"
          )}
          style={{
            transform: `scale(${
              zoomJSON["zoom"][zoomState]["scale"] * scaleFactor * 1.4
            })`,
            transformOrigin: `${
              zoomJSON["zoom"][zoomState]["X"] * scaleFactor
            }px ${zoomJSON["zoom"][zoomState]["Y"] * scaleFactor}px`,
          }}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="guess">What do you think this is?</Label>
        <Input type="text" id="guess" placeholder="Guess here" />
      </div>
      <Button>Submit</Button>
    </div>
  );
}
