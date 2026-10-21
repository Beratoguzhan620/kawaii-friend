import { Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

type Props = { label: string; value: number; color: string; track: string; testID?: string };

/** A labelled 0–100 bar. Drawn with SVG so the width can follow the value without inline styles. */
export function StatBar({ label, value, color, track, testID }: Props) {
  const shown = Math.round(value);
  return (
    <View
      className="gap-1.5"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      testID={testID}
    >
      <View className="flex-row items-baseline justify-between">
        <Text className="font-medium text-sm text-ink dark:text-night-ink">{label}</Text>
        <Text className="font-mono text-xs text-muted dark:text-night-muted">{shown}/100</Text>
      </View>
      <Svg width="100%" height={12}>
        <Rect x={0} y={0} width="100%" height={12} rx={6} fill={track} />
        {shown > 0 && <Rect x={0} y={0} width={`${Math.max(shown, 4)}%`} height={12} rx={6} fill={color} />}
      </Svg>
    </View>
  );
}
