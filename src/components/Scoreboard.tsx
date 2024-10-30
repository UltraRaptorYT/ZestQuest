import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";

export default function Scoreboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

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
      return data;
    }

    async function getLeaderboard() {
      let teamName = await getTeamName();
      if (!teamName) {
        return "ERROR";
      }
      const { data, error } = await supabase.from("zest_score").select();
      if (error) {
        console.log(error);
        return error;
      }
      for await (let score of data) {
        if (
          "score" in
          teamName.filter((e) => {
            return e.letter == score.team_id;
          })[0]
        ) {
          teamName.filter((e) => {
            return e.letter == score.team_id;
          })[0].score += score.score;
        } else {
          teamName.filter((e) => {
            return e.letter == score.team_id;
          })[0].score = score.score;
        }
      }
      console.log(teamName);
      let newData = teamName.map((e) => {
        if (!("score" in e)) {
          e.score = 0;
        }
        return e;
      });
      newData.sort((a, b) => b.score - a.score);
      setLeaderboard(newData);
    }
    getLeaderboard();
    const channels = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zest_score" },
        async (payload) => {
          console.log("Change received!", payload);
          await getLeaderboard();
        }
      )
      .subscribe();
  }, []);

  return (
    <div className="max-w-xl mx-auto h-full flex flex-col justify-start items-center">
      <div>
        <h1 className="text-3xl p-5 text-center flex flex-col gap-2 font-bold">
          <span>ZestQuest 2024</span>
        </h1>
        <div className="flex justify-center items-stretch h-[190px]">
          <div className="p-0 h-full flex">
            <div
              className="bg-[#dc3c3c] trapShadow w-[104px] h-[75px] mt-auto flex flex-col justify-center items-center relative"
              id="second"
            >
              {leaderboard[1] && (
                <>
                  <img
                    src={leaderboard[1].selfie}
                    className="aspect-square w-14 absolute -top-[calc(3.5rem+10px)] border-4 border-[#adc3d1] rounded-full"
                  />
                  <p className="font-bold text-sm name text-black">
                    {leaderboard[1].team_name}
                  </p>
                  <p className="font-bold text-[#adc3d1] points text-sm">
                    {leaderboard[1].score}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="p-0 h-full flex">
            <div
              className="bg-[#fa5353] trapShadow w-[104px] mt-auto  flex flex-col justify-center items-center relative h-[100px]"
              id="first"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/1586/1586967.png"
                className="w-1/3 aspect-square absolute -top-[calc(3.5rem+30px)]"
              />
              {leaderboard[0] && (
                <>
                  <img
                    src={leaderboard[0].selfie}
                    className="aspect-square w-14 absolute -top-[calc(3.5rem+10px)] border-4 border-[#fcd012] rounded-full"
                  />
                  <p className="font-bold text-sm name text-black">
                    {leaderboard[0].team_name}
                  </p>
                  <p className="font-bold text-[#fcd012] points text-sm">
                    {leaderboard[0].score}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="p-0 h-full flex">
            <div
              className="bg-[#dc3c3c] trapShadow w-[104px] h-[55px] mt-auto flex flex-col justify-center items-center relative"
              id="third"
            >
              {leaderboard[2] && (
                <>
                  <img
                    src={leaderboard[2].selfie}
                    className="aspect-square w-14 absolute -top-[calc(3.5rem+10px)] border-4 border-[#fbac74] rounded-full"
                  />
                  <p className="font-bold text-sm name text-black">
                    {leaderboard[2].team_name}
                  </p>
                  <p className="font-bold text-[#fbac74] points text-sm">
                    {leaderboard[2].score}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#dee2e6] dark:bg-[#23282d] h-[calc(100svh-116px-190px)] w-full rounded-3xl overflow-y-auto p-5 px-7 flex-col flex gap-4">
        {leaderboard.slice(3).map((e, idx) => {
          return (
            <div className="p-0 h-full flex">
              <div className="flex gap-3 items-center w-full">
                <span className="font-bold text-[#7c7c7c] dark:text-[#cacaca] w-7">
                  {idx + 4}
                </span>
                <img
                  src={e.selfie}
                  className="aspect-square w-12 rounded-full"
                />
                <span className="max-w-32 w-min text-left break-words whitespace-normal">
                  {e.team_name}
                </span>
                <span className="ml-auto text-base">{e.score}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
