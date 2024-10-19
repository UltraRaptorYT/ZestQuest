import ReactWordcloud, { Optional, Options } from "react-wordcloud";

const words = [
  {
    text: "told",
    value: 64,
  },
  {
    text: "mistake",
    value: 11,
  },
  {
    text: "thought",
    value: 16,
  },
  {
    text: "bad",
    value: 17,
  },
];

const options: Optional<Options> = {
  rotations: 2,
  rotationAngles: [0, 0],
  scale: "sqrt",
  spiral: "archimedean",
  fontSizes: [30, 75],
  // deterministic: true,
  fontFamily: "Inter",
  // padding: -10,
  randomSeed: "ZestQuest",
  fontWeight: "bold",
  // colors: ["i"],
};

export default function Home() {
  return (
    <div>
      <ReactWordcloud words={words} options={options} />
    </div>
  );
}
