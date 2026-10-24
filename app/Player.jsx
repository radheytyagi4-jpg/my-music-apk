import { View, Text, Image, Pressable } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Player() {
  const { img, tittle, artist } = useLocalSearchParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#111", padding: 24 }}>
      <Pressable onPress={() => router.back()} >
        <Ionicons name="chevron-down" size={30} color="white" />
      </Pressable>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={{ uri: img }}
          style={{ width: "100%", aspectRatio: 1, borderRadius: 8 }}
        />
        <View style={{ alignSelf: "flex-start", marginTop: 24 }}>
          <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>{tittle}</Text>
          <Text style={{ color: "#aaa", fontSize: 14, marginTop: 4 }}>{artist}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginBottom: 40 }}>
        <Ionicons name="play-skip-back" size={36} color="white" />
        <Pressable
          onPress={() => setIsPlaying(!isPlaying)}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "white", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="black" />
        </Pressable>
        <Ionicons name="play-skip-forward" size={36} color="white" />
      </View>
    </View>
  );
}