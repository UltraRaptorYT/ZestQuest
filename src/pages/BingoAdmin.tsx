import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { GroupType } from "@/types";
import { Button } from "@/components/ui/button";
import { cn, bingoSolver } from "@/lib/utils";
import { BingoAnimalsType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wheel } from "react-custom-roulette";

type BingoAdminProps = {
  hideAdmin?: string;
};

interface WheelData {
  option?: string;
  image?: ImageProps;
  style?: StyleType; // Optional
  optionSize?: number; // Optional
}

interface ImageProps {
  uri: string;
  offsetX?: number; // Optional
  offsetY?: number; // Optional
  sizeMultiplier?: number; // Optional
  landscape?: boolean; // Optional
}

interface StyleType {
  backgroundColor?: string; // Optional
  textColor?: string; // Optional
  fontFamily?: string; // Optional
  fontSize?: number; // Optional
  fontWeight?: number | string; // Optional
  fontStyle?: string; // Optional
}

export default function BingoAdmin({ hideAdmin = "false" }: BingoAdminProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [bingoDisabled, setBingoDisabled] = useState<boolean>(false);
  const [bingoAnimalList, setBingoAnimalList] = useState<BingoAnimalsType[]>(
    []
  );
  const [selectedGroup, setSelectedGroup] = useState<string>();
  const [selectedGroupList, setSelectedGroupList] = useState<string[]>([]);
  const [wheelData, setWheelData] = useState<WheelData[]>([]);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const handleSpinClick = () => {
    if (!mustSpin) {
      setSelectedGroup(undefined);
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

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

    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zest_bingo" },
        async (payload) => {
          console.log("Change received!", payload);
          if (payload.eventType == "DELETE") {
            setSelectedGroup(undefined);
            setSelectedGroupList([]);
            setSelectedAnimals([]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zest_team" },
        async (payload) => {
          console.log("Change received!", payload);
          if (payload.eventType == "UPDATE") {
            getTeamName();
          }
        }
      )
      .subscribe();
    console.log(selectedAnimals);
  }, []);

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
      return {
        value: e.letter,
        label: e.team_name,
        color: e.color,
        bingo: e.bingo,
      };
    });
    setGroups(group);
    return data;
  }

  useEffect(() => {
    getTeamName();
    getBingoState();
  }, []);

  async function getBingoState() {
    const { data, error } = await supabase
      .from("zest_state")
      .select()
      .eq("state", "bingoDisabled");
    if (error) {
      console.log(error);
      return;
    }
    if (data.length) {
      setBingoDisabled(data[0].value == "true");
    }
  }

  async function updateBingoState() {
    const { error } = await supabase
      .from("zest_state")
      .update({ value: !bingoDisabled, time_updated: new Date() })
      .eq("state", "bingoDisabled")
      .select();
    getTeamName();
    setBingoDisabled((prev) => !prev);
    if (error) {
      console.log(error);
      return;
    }
  }

  async function addWheelData() {
    if (groups.length) {
      console.log(groups);
      let changeWhite: string[] = ["T", "D", "M", "E"];
      let data: WheelData[] = groups
        .map((e) => {
          return {
            option: e.label,
            style: {
              backgroundColor: e.color,
              textColor: changeWhite.includes(e.value) ? "white" : "black",
            },
          };
        })
        .filter((e) => !selectedGroupList.includes(e.option?.charAt(0) || ""));
      console.log("hi123", selectedGroupList);
      setWheelData(data);
    }
  }

  useEffect(() => {
    addWheelData();
  }, [selectedGroupList]);

  async function getCrossedOut() {
    const { data, error } = await supabase.from("zest_bingo").select();
    if (error) {
      console.log(error);
      return;
    }
    let groupList = data.map((e) => e.team_id);
    const lastGroupStart =
      groupList.length % groups.length === 0
        ? groupList.length - groups.length
        : groupList.length - (groupList.length % groups.length);

    const lastGroup = groupList.slice(lastGroupStart);
    console.log(lastGroup, "HI");
    setSelectedGroupList(lastGroup);
    setSelectedAnimals(data.map((e) => e.animal_id));
    console.log(data);
    return data;
  }

  useEffect(() => {
    getCrossedOut();
  }, [groups]);

  async function removeGroupAfterSpinning() {
    setSelectedGroup(wheelData[prizeNumber].option);
    alert(wheelData[prizeNumber].option);
  }

  async function crossOutBingo(animal_id: number) {
    if (!selectedGroup) {
      alert("Must Select Team before Choosing Animal");
      return;
    }
    setSelectedAnimals((prev) => [...prev, animal_id]);
    let team_id = groups.filter((e) => e.label == selectedGroup)[0].value;
    setSelectedGroupList((prev) => [...prev, selectedGroup.charAt(0) || ""]);
    if (selectedGroupList.length >= groups.length - 1) {
      setSelectedGroupList([]);
    }
    const { error } = await supabase
      .from("zest_bingo")
      .insert({ team_id: team_id, animal_id: animal_id });
    setOpenDialog(false);
    if (error) {
      console.log(error);
      return;
    }
  }

  useEffect(() => {
    if (!openDialog) {
      setSelectedGroup(undefined);
    }
  }, [openDialog]);

  useEffect(() => {
    async function handleCheckBingo() {
      for (let group of groups) {
        if (!group.bingo) continue;
        const numSolve = bingoSolver(group.bingo, selectedAnimals);
        console.log(group.label, group.bingo, selectedAnimals);
        console.log(group.label, "Checking", numSolve);
        if (numSolve >= 1) {
          alert(group.label + " Wins!");
        }
      }
    }

    if (selectedAnimals.length > 0) {
      handleCheckBingo();
    }
  }, [selectedAnimals, groups]);

  async function clearBingo() {
    const data = await getCrossedOut();
    let idList = data?.map((e) => e.id);
    const { error } = await supabase
      .from("zest_bingo")
      .delete()
      .in("id", idList || []);
    if (error) {
      console.log(error);
      return;
    }
  }

  async function resetTeamBoard(value: string) {
    const { error } = await supabase
      .from("zest_team")
      .update({
        bingo: Object.fromEntries(
          Array.from({ length: 25 }, (_, i) => [
            String.fromCharCode(65 + i),
            null,
          ])
        ),
      })
      .eq("letter", value);
    if (error) {
      console.log(error);
      return;
    }
  }

  async function resetBoards() {
    let isConfirmed = confirm("Are you sure?");
    if (!isConfirmed) {
      return;
    }
    for await (let group of groups) {
      console.log(group);
      await resetTeamBoard(group.value);
    }
    alert("COMPLETED");
    getTeamName();
  }

  async function clearBingoAnimals() {
    let isConfirmed = confirm("Are you sure?");
    if (!isConfirmed) {
      return;
    }

    const { error } = await supabase
      .from("zest_bingo")
      .delete()
      .in("animal_id", selectedAnimals);
    if (error) {
      console.log(error);
      return;
    }
    alert("COMPLETED");
  }

  return (
    <div className="w-full h-full">
      <div
        className={cn(
          "fixed bottom-3 right-3 grid grid-cols-2 gap-3",
          hideAdmin == "false" ? "opacity-100" : "opacity-0"
        )}
      >
        <Button
          variant={"destructive"}
          disabled={!bingoDisabled}
          onClick={() => resetBoards()}
        >
          Reset Boards
        </Button>
        <Button
          variant={"outline"}
          disabled={!bingoDisabled}
          onClick={() => clearBingoAnimals()}
        >
          Clear Bingo
        </Button>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant={"secondary"} disabled={!bingoDisabled}>
              Wheel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Spin Wheel</DialogTitle>
              <DialogDescription className="flex gap-4">
                <div onClick={handleSpinClick} className="w-fit relative">
                  <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={wheelData}
                    onStopSpinning={async () => {
                      setMustSpin(false);
                      await removeGroupAfterSpinning();
                    }}
                    spinDuration={0.5}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-around">
                    <p className="text-lg text-center">
                      Selecting Team: {selectedGroup}
                    </p>
                    <Button onClick={() => clearBingo()}>Reset</Button>
                  </div>
                  <div className="grid grid-cols-7 grid-rows-5 h-full">
                    {bingoAnimalList.map((e) => {
                      return (
                        <Button
                          disabled={selectedAnimals.includes(e.id)}
                          className="text-4xl h-full w-full"
                          variant={
                            selectedAnimals.includes(e.id)
                              ? "outline"
                              : "secondary"
                          }
                          onClick={() => {
                            crossOutBingo(e.id);
                          }}
                          key={"animal" + e.id}
                        >
                          {e.logo}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Button onClick={() => updateBingoState()}>
          {bingoDisabled ? "Start" : "Stop"} Bingo
        </Button>
      </div>

      <div className={"grid grid-cols-6 w-full h-full gap-3"}>
        {groups.map((e, i) => {
          console.log(e.bingo && Object.values(e.bingo).filter((e) => e));
          return (
            <div
              className="flex flex-col items-center justify-center w-fit mx-auto"
              key={e.label + i}
            >
              <p className={`font-bold text-sm`}>{e.label}</p>
              {e.bingo &&
              Object.values(e.bingo).filter((e) => e).length >= 25 &&
              bingoDisabled ? (
                <div
                  className={
                    "grid grid-cols-5 grid-rows-5 justify-center items-center align-center justify-self-center aspect-square h-full"
                  }
                >
                  {e.bingo &&
                    Object.values(e.bingo).map((e, i) => {
                      return (
                        <div
                          className={cn(
                            "border border-black dark:border-white w-full h-full flex items-center justify-center relative",
                            e && selectedAnimals.includes(e)
                              ? "dark:bg-white bg-black"
                              : "bg-transparent",
                            bingoDisabled ? "opacity-100" : "opacity-0"
                          )}
                          key={i}
                        >
                          <div className="text-3xl">
                            {bingoAnimalList.filter((animal) => {
                              return animal.id == e;
                            })[0] &&
                              bingoAnimalList.filter((animal) => {
                                return animal.id == e;
                              })[0].logo}
                          </div>
                          <div
                            className={cn(
                              "absolute",
                              e && selectedAnimals.includes(e)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          >
                            <span>❌</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : e.bingo &&
                Object.values(e.bingo).filter((e) => e).length >= 25 &&
                !bingoDisabled ? (
                <div className="flex justify-center items-center h-full text-3xl">
                  DONE!
                </div>
              ) : (
                <div></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
