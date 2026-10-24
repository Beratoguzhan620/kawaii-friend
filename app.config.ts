import type { ConfigContext, ExpoConfig } from "expo/config";

// EXPO_BASE_URL serves the web build from a sub-path, e.g. /kawaii-friend on GitHub Pages.
export default ({ config }: ConfigContext): ExpoConfig => {
  const baseUrl = process.env.EXPO_BASE_URL;
  return {
    ...config,
    name: config.name ?? "Kawaii Friend",
    slug: config.slug ?? "kawaii-friend",
    ...(baseUrl ? { experiments: { ...config.experiments, baseUrl } } : {}),
  };
};
