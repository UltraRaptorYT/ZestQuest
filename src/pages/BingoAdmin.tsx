import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { GroupType } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BingoAdminProps = {
  hideAdmin?: string;
};

export default function BingoAdmin({ hideAdmin = "false" }: BingoAdminProps) {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [bingoDisabled, setBingoDisabled] = useState<boolean>(false);

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
    getTeamName();
  }, []);

  async function updateFrozenState() {
    const { error } = await supabase
      .from("zest_state")
      .update({ value: !bingoDisabled, time_updated: new Date() })
      .eq("state", "bingoDisabled")
      .select();
    setBingoDisabled((prev) => !prev);
    if (error) {
      console.log(error);
      return;
    }
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "fixed bottom-3 right-3",
          hideAdmin == "false" ? "opacity-100" : "opacity-0"
        )}
      >
        <Button onClick={() => updateFrozenState()}>
          {bingoDisabled ? "Start" : "Stop"} Bingo
        </Button>
      </div>
      {JSON.stringify(groups)}
    </div>
  );
}
