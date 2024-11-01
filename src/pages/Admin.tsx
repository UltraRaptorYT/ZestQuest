import React, { useState, useEffect } from "react";
import AddScore from "@/components/AddScore";
import Scoreboard from "@/components/Scoreboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, useLocalStorageState } from "@/lib/utils";

export default function Admin() {
  const [currentTab, setCurrentTab] = useLocalStorageState("tab", "score");
  const [hideAdmin, setHideAdmin] = useLocalStorageState("hideAdmin", "false");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(event.key);
    if (event.key === "`") {
      setHideAdmin((prev) => String(!(prev == "true")));
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="max-w-xl mx-auto h-full flex flex-col justify-start items-center p-5"
    >
      <div
        className={cn(
          "fixed top-3 left-3",
          hideAdmin == "false" ? "opacity-100" : "opacity-0"
        )}
      >
        Admin View
      </div>
      <Tabs
        onValueChange={(value) => setCurrentTab(value)}
        defaultValue={currentTab}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="flex items-center justify-center flex-wrap h-fit space-y-1">
          <TabsTrigger value="score">Add Score</TabsTrigger>
          <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
          <TabsTrigger value="bingo">Bingo</TabsTrigger>
          <TabsTrigger value="zoom">Zoom In Zoom Out</TabsTrigger>
          <TabsTrigger value="shop">Shopping</TabsTrigger>
        </TabsList>
        <TabsContent value="score" className="h-full">
          <AddScore />
        </TabsContent>
        <TabsContent value="scoreboard" className="h-full">
          <Scoreboard isAdmin={true} hideAdmin={hideAdmin} />
        </TabsContent>
        <TabsContent value="bingo" className="h-full">
          {/* <Scoreboard /> */}
        </TabsContent>
        <TabsContent value="zoom" className="h-full">
          {/* <Scoreboard /> */}
        </TabsContent>
        <TabsContent value="shop" className="h-full">
          {/* <Scoreboard /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
