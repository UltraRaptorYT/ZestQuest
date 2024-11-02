import { useState, useEffect } from "react";
import zoomJSON from "@/assets/zoom.json";
import supabase from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ZoomAdmin({
  hideAdmin = "false",
}: {
  hideAdmin: string;
}) {
  const [imgState, setImgState] = useState(0);
  const [isZoomed, setIsZoomed] = useState(true);
  const [zoomState, setZoomState] = useState(0);
  const [numOfResponse, setNumOfResponse] = useState(0);
  const max = 32;
  useEffect(() => {
    zoomJSON["zoom"].forEach((e) => {
      fetch(e.url);
      return e;
    });
  }, []);
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
      setZoomState(Number(data[0].value));
    }

    getZoomState();
  }, []);

  useEffect(() => {
    setImgState(Math.floor((zoomState - 1) / 2));
    setIsZoomed(zoomState % 2 == 1);
    updateZoomState();
  }, [zoomState]);

  async function updateZoomState() {
    const { error } = await supabase
      .from("zest_state")
      .update({ value: zoomState })
      .eq("state", "zoom");
    if (error) {
      console.log(error);
      return;
    }
  }

  async function decrementZoomState() {
    setZoomState((prev) => {
      if (prev - 1 <= 0) {
        return 0;
      } else {
        return Number(prev) - 1;
      }
    });
  }

  async function incrementZoomState() {
    setZoomState((prev) => {
      if (Number(prev) + 1 > max) {
        return Number(prev);
      } else {
        return Number(prev) + 1;
      }
    });
  }

  async function resetZoomState() {
    setZoomState(0);
  }

  async function checkNumberResponse() {
    const { data, error } = await supabase
      .from("zest_zoom")
      .select()
      .eq("zoom", imgState);
    if (error) {
      console.log(error);
      return;
    }
    let existGroups: any[] = [];
    let uniqueData = data
      .map((e) => {
        if (!existGroups.includes(e.team_id)) {
          existGroups.push(e.team_id);
          return e;
        }
      })
      .filter((e) => e);
    console.log(uniqueData);
    setNumOfResponse(uniqueData.length);
  }

  useEffect(() => {
    supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zest_zoom" },
        async (payload) => {
          console.log("Change received!", payload);
          await checkNumberResponse();
        }
      )
      .subscribe();
    checkNumberResponse();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1
        className={cn(
          "text-xl text-center flex  justify-around",
          zoomState == 0 ? "opacity-0" : "opacity-100"
        )}
      >
        <span>What is this?</span>
        <span>Response: {numOfResponse}/17</span>
      </h1>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={() => decrementZoomState()} disabled={zoomState <= 0}>
          <ChevronLeft />
        </Button>
        {zoomState == 0 ? (
          <div className="max-h-[575px] max-w-[575px] aspect-square flex items-center justify-center overflow-hidden mx-auto relative">
            <img
              src="https://hlzsmadaanjcpyjghntc.supabase.co/storage/v1/object/public/zest/ZoomInZoomOut.png?t=2024-11-02T03%3A51%3A48.308Z"
              className="h-full object-contain"
            />
            <div className="absolute text-3xl top-[25rem]">Are you Ready?</div>
          </div>
        ) : (
          <div className="max-h-[575px] max-w-[575px] aspect-square flex items-center justify-center overflow-hidden mx-auto">
            <img
              src={
                zoomJSON["zoom"][imgState] && zoomJSON["zoom"][imgState]["url"]
              }
              className={cn(
                "h-full object-contain",
                !isZoomed
                  ? "transition-transform duration-1000 ease-in-out "
                  : ""
              )}
              style={{
                transform: `scale(${
                  isZoomed
                    ? zoomJSON["zoom"][imgState] &&
                      zoomJSON["zoom"][imgState]["scale"]
                    : 1
                })`,
                transformOrigin: `${
                  zoomJSON["zoom"][imgState] && zoomJSON["zoom"][imgState]["X"]
                }px ${
                  zoomJSON["zoom"][imgState] && zoomJSON["zoom"][imgState]["Y"]
                }px`,
              }}
            />
          </div>
        )}
        <Button
          onClick={() => incrementZoomState()}
          disabled={zoomState >= max}
        >
          <ChevronRight />
        </Button>
      </div>
      <div
        className={cn(
          "fixed bottom-3 right-3 flex gap-3",
          hideAdmin == "false" ? "opacity-100" : "opacity-0"
        )}
      >
        <Button variant={"secondary"} onClick={() => resetZoomState()}>
          Reset
        </Button>
      </div>
    </div>
  );
}
