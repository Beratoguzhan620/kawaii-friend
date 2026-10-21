import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from "react-native-svg";

export type FriendKind = "mochi" | "tofu" | "bulut";
export type Mood = "happy" | "hungry" | "tired" | "bored";

type Props = {
  kind: FriendKind;
  mood: Mood;
  size?: number;
  label?: string;
};

// Original characters drawn for this app: a rice-cake blob, a tofu block and a cloud.
const BODY: Record<FriendKind, { fill: string; line: string }> = {
  mochi: { fill: "#F9D9C4", line: "#D9A27F" },
  tofu: { fill: "#CDEBDD", line: "#8DBFA6" },
  bulut: { fill: "#D6E6F5", line: "#94B4D4" },
};

const INK = "#3A2E36";
const CHEEK = "#F2A7B8";

function Body({ kind }: { kind: FriendKind }) {
  const { fill, line } = BODY[kind];
  const common = { fill, stroke: line, strokeWidth: 4 };
  if (kind === "tofu") return <Rect x={34} y={48} width={132} height={122} rx={38} {...common} />;
  if (kind === "bulut") {
    return (
      <Path
        d="M58 170 C30 170 18 150 22 132 C26 114 42 106 56 108 C56 80 78 60 104 62 C126 64 140 78 144 96 C164 92 182 108 180 130 C178 152 162 170 140 170 Z"
        {...common}
      />
    );
  }
  return <Path d="M100 40 C146 40 178 82 178 124 C178 158 146 174 100 174 C54 174 22 158 22 124 C22 82 54 40 100 40 Z" {...common} />;
}

function Face({ mood }: { mood: Mood }) {
  const eyes = (() => {
    switch (mood) {
      case "happy":
        return (
          <G stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
            <Path d="M68 116 Q78 104 88 116" />
            <Path d="M112 116 Q122 104 132 116" />
          </G>
        );
      case "hungry":
        return (
          <G>
            <Circle cx={78} cy={112} r={9} fill={INK} />
            <Circle cx={122} cy={112} r={9} fill={INK} />
            <Circle cx={81} cy={108} r={3} fill="#FFFFFF" />
            <Circle cx={125} cy={108} r={3} fill="#FFFFFF" />
          </G>
        );
      case "tired":
        return (
          <G stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
            <Path d="M68 114 Q78 122 88 114" />
            <Path d="M112 114 Q122 122 132 114" />
          </G>
        );
      case "bored":
        return (
          <G>
            <Path d="M66 106 L90 108" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <Path d="M110 108 L134 106" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <Circle cx={82} cy={116} r={6} fill={INK} />
            <Circle cx={126} cy={116} r={6} fill={INK} />
          </G>
        );
    }
  })();

  const mouth = (() => {
    switch (mood) {
      case "happy":
        return <Path d="M88 132 Q100 148 112 132 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
      case "hungry":
        return (
          <G>
            <Ellipse cx={100} cy={138} rx={9} ry={11} fill={INK} />
            <Path d="M116 136 Q120 146 116 150 Q112 146 116 136 Z" fill="#9CC5E8" />
          </G>
        );
      case "tired":
        return <Path d="M92 138 Q96 134 100 138 Q104 142 108 138" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />;
      case "bored":
        return <Path d="M90 140 L110 140" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
    }
  })();

  return (
    <G>
      <Ellipse cx={62} cy={132} rx={11} ry={7} fill={CHEEK} opacity={mood === "bored" ? 0.35 : 0.75} />
      <Ellipse cx={138} cy={132} rx={11} ry={7} fill={CHEEK} opacity={mood === "bored" ? 0.35 : 0.75} />
      {eyes}
      {mouth}
      {mood === "tired" && (
        <G fill={INK} opacity={0.7}>
          <SvgText x={150} y={58} fontSize={22} fontWeight="600">
            z
          </SvgText>
          <SvgText x={166} y={40} fontSize={16} fontWeight="600">
            z
          </SvgText>
        </G>
      )}
    </G>
  );
}

export function Friend({ kind, mood, size = 200, label }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image" accessibilityLabel={label}>
      <Ellipse cx={100} cy={182} rx={58} ry={8} fill="#000000" opacity={0.06} />
      <Body kind={kind} />
      <Face mood={mood} />
    </Svg>
  );
}
