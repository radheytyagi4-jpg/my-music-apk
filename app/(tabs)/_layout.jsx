import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MiniPlayer } from "../../components/MiniPlayer";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#1DB954",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: "#121212",
            borderTopColor: "#282828",
            height: 65,
            paddingTop: 8,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recent"
          options={{
            title: "Recent",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 65 }}>
      <MiniPlayer/>
      </View>
    </View>
  );
}