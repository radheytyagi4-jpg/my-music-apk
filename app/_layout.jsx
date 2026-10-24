import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="Player" options={{ presentation: "modal" }} />
    </Stack>
  );
}