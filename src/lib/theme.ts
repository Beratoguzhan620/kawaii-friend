import { useColorScheme } from "nativewind";

// Colours for props that cannot take a className (icons, placeholders, tab bar).
export const palette = {
  light: {
    bg: "#FBF6F3",
    surface: "#FFFFFF",
    border: "#EEDFD9",
    ink: "#2B2330",
    muted: "#76696F",
    primary: "#B5536F",
    accent: "#D9849B",
    onPrimary: "#FFFFFF",
  },
  dark: {
    bg: "#151316",
    surface: "#1E1B1F",
    border: "#363036",
    ink: "#F1EBEE",
    muted: "#AFA3A9",
    primary: "#E8A3B6",
    accent: "#E8A3B6",
    onPrimary: "#2B2330",
  },
} as const;

export type Palette = (typeof palette)[keyof typeof palette];

export function useTheme() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  return { dark, colors: dark ? palette.dark : palette.light };
}
