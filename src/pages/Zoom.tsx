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
  const scaleFactor = 250 / 575;
  const [imgState, setImgState] = useState(0);
  const [isZoomed, setIsZoomed] = useState(true);
  const [guess, setGuess] = useState("");

  useEffect(() => {
    zoomJSON["zoom"].forEach((e) => {
      fetch(e.url);
      return e;
    });
  }, []);

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

  useEffect(() => {
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zest_state" },
        async (payload) => {
          console.log("Change received!", payload);
          await getZoomState();
        }
      )
      .subscribe();
    getZoomState();
  }, []);

  useEffect(() => {
    setImgState(Math.floor((zoomState - 1) / 2));
    setIsZoomed(zoomState % 2 == 1);
  }, [zoomState]);

  useEffect(() => {
    if (isZoomed) {
    }
  }, [isZoomed]);

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

  async function submitAnswers() {
    if (!value) {
      alert("Please select a group you are submitting for.");
      return;
    }
    if (!isZoomed) {
      alert("What u doing?");
      return;
    }
    if (!guess) {
      alert("Please enter your guess!");
      return;
    }
    console.log(guess);
    const { error } = await supabase
      .from("zest_zoom")
      .insert({ team_id: value, zoom: imgState, guess: guess });
    if (error) {
      console.log(error);
      return;
    }
    setGuess("");
    return;
  }

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
      {zoomState == 0 ? (
        <div className="max-h-[250px] max-w-[250px] aspect-square flex items-center justify-center overflow-hidden mx-auto relative">
          <img
            src="https://hlzsmadaanjcpyjghntc.supabase.co/storage/v1/object/public/zest/ZoomInZoomOut.png?t=2024-11-02T03%3A51%3A48.308Z"
            className="h-full object-contain"
          />
          <div className="absolute text-2xl top-[18rem]">Are you Ready?</div>
        </div>
      ) : (
        <div className="max-h-[250px] max-w-[250px] aspect-square flex items-center justify-center overflow-hidden mx-auto">
          <img
            src={
              zoomJSON["zoom"][imgState] && zoomJSON["zoom"][imgState]["url"]
            }
            className={cn(
              "h-full object-contain",
              !isZoomed ? "transition-transform duration-1000 ease-in-out " : ""
            )}
            style={{
              transform: `scale(${
                isZoomed
                  ? zoomJSON["zoom"][imgState] &&
                    zoomJSON["zoom"][imgState]["scale"] * scaleFactor * 2.3
                  : 1
              })`,
              transformOrigin: `${
                zoomJSON["zoom"][imgState] &&
                zoomJSON["zoom"][imgState]["X"] * scaleFactor
              }px ${
                zoomJSON["zoom"][imgState] &&
                zoomJSON["zoom"][imgState]["Y"] * scaleFactor
              }px`,
            }}
          />
        </div>
      )}
      <div
        className={cn(
          zoomState == 0 ? "opacity-0" : "opacity-100",
          "flex flex-col gap-2 items-center justify-center"
        )}
      >
        <div className={"grid w-full max-w-sm items-center gap-1.5"}>
          <Label htmlFor="guess">What do you think this is?</Label>
          <Input
            type="text"
            id="guess"
            placeholder="Guess here"
            disabled={!isZoomed}
            value={guess}
            onInput={(e) => {
              setGuess((e.target as HTMLInputElement).value);
            }}
          />
        </div>
        <Button onClick={() => submitAnswers()} disabled={!isZoomed}>
          Submit
        </Button>
      </div>
    </div>
  );
}
