import { useState } from "react";
import { Wheel } from "react-custom-roulette";

const data = [{ option: "0" }, { option: "1" }, { option: "2" }];

export default () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    alert(prizeNumber);
    setMustSpin(false);
    return;
  };

  return (
    <>
      <div onClick={handleSpinClick}>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={handleStopSpinning}
        />
      </div>
    </>
  );
};
