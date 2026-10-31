import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePlayer } from "../context/PlayerContext.jsx";

export function MiniPlayer() {
  const router = useRouter();
  const { song, toggle, isPlaying, isBuffering } = usePlayer();

  if (!song) return null;

  const title = song.title || song.tittle || "Unknown Song";
  const artist = song.artist || "Unknown Artist";

  return (
    <Pressable onPress={() => router.push("/Player")}>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          height: 58,
          backgroundColor: "black",
          alignItems: "center",
          paddingHorizontal: 8,
        }}
      >
        <Image
          source={song.img ? { uri: song.img } : undefined}
          style={{
            width: 40,
            height: 40,
            marginHorizontal: 6,
            borderRadius: 5,
            backgroundColor: "#3C2A20",
          }}
        />

        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text
            style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={{ color: "#BDAA91", fontSize: 10 }}
            numberOfLines={1}
          >
            {artist}
          </Text>
        </View>

        <Pressable
          onPress={(event) => {
            event.stopPropagation?.();
            toggle();
          }}
          style={{ marginHorizontal: 10, padding: 6 }}
        >
          <Ionicons
            name={isBuffering ? "hourglass-outline" : isPlaying ? "pause" : "play"}
            size={28}
            color="#1DB954"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}