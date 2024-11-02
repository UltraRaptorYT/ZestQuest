import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ZoomCreator() {
  const [imgSrc, setImgSrc] = useState(3);
  const [isZoomedIn, setIsZoomedIn] = useState(true);
  const [scale, setScale] = useState(15);
  const [x, setX] = useState(155); // x-coordinate in px for transform origin
  const [y, setY] = useState(195); // y-coordinate in px for transform origin

  const handleZoomToggle = () => {
    setIsZoomedIn((prev) => !prev);
  };

  const handleXChange = (e: any) => {
    setX(e.target.value);
  };

  const handleYChange = (e: any) => {
    setY(e.target.value);
  };

  const handleScaleChange = (e: any) => {
    setScale(e.target.value);
  };

  return (
    <div className="w-full h-full p-5 flex items-center gap-3  justify-center">
      <div className="h-[575px] w-[575px] aspect-square flex items-center justify-center overflow-hidden">
        <img
          src={`https://hlzsmadaanjcpyjghntc.supabase.co/storage/v1/object/public/zest/photo_${imgSrc}_2024-11-01_23-58-24.jpg`}
          className={cn(
            "h-full",
            "transition-transform duration-1000 ease-in-out object-contain"
          )}
          style={{
            transform: isZoomedIn ? `scale(${scale})` : `scale(1)`,
            transformOrigin: `${x}px ${y}px`,
          }}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={handleZoomToggle}>
          Zoom {isZoomedIn ? "Out" : "In"}
        </Button>
      </div>
      <div className="mt-4 flex gap-2 items-center flex-col">
        <label>
          Img:
          <input
            type="number"
            value={imgSrc}
            onChange={(e) => setImgSrc(Number(e.target.value))}
            className="border p-1 ml-2 w-20 text-black"
            placeholder="Scale in %"
          />
        </label>
        <label>
          Scale:
          <input
            type="number"
            value={scale}
            onChange={handleScaleChange}
            className="border p-1 ml-2 w-20 text-black"
            placeholder="Scale in %"
          />
        </label>
        <label>
          X:
          <input
            type="number"
            value={x}
            onChange={handleXChange}
            className="border p-1 ml-2 w-20 text-black"
            placeholder="X in px"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            value={y}
            onChange={handleYChange}
            className="border p-1 ml-2 w-20 text-black"
            placeholder="Y in px"
          />
        </label>
      </div>
    </div>
  );
}
