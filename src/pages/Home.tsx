import AddScore from "@/components/AddScore";
import Scoreboard from "@/components/Scoreboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="max-w-xl mx-auto h-full flex flex-col justify-start items-center p-5">
      <Tabs defaultValue="score" className="w-full h-full flex flex-col">
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
          <Scoreboard />
        </TabsContent>
        <TabsContent value="bingo" className="h-full">
          <Scoreboard />
        </TabsContent>
        <TabsContent value="zoom" className="h-full">
          <Scoreboard />
        </TabsContent>
        <TabsContent value="shop" className="h-full">
          <Scoreboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
