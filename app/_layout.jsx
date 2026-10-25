import { Stack } from "expo-router";
import { PlayerProvider } from "../context/PlayerContext";

export default function RootLayout() {
  return (
    <PlayerProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="Player" options={{ presentation: "modal" }} />
    </Stack>
    </PlayerProvider>
  );
}