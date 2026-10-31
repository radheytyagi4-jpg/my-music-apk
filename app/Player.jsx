import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { usePlayer } from "../context/PlayerContext.jsx";

export default function Player() {
  const {
    song,
    toggle,
    isPlaying,
    isBuffering,
    playbackError,
    next,
    previous,
    position,
    duration,
    seek,
    shuffle,
    toggleShuffle,
  } = usePlayer();

  const router = useRouter();

  if (!song) return null;

  const title = song.title || song.tittle || "Unknown Song";
  const artist = song.artist || "Unknown Artist";

  const fmt = (s = 0) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111", padding: 24 }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="chevron-down" size={30} color="white" />
      </Pressable>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {song.img ? (
          <Image
            source={{ uri: song.img }}
            style={{ width: "70%", aspectRatio: 1, borderRadius: 8 }}
          />
        ) : (
          <View
            style={{
              width: "70%",
              aspectRatio: 1,
              borderRadius: 8,
              backgroundColor: "#3C2A20",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="musical-notes" size={64} color="#C7F464" />
          </View>
        )}

        <View style={{ alignSelf: "flex-start", marginTop: 24, marginLeft: 40 }}>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            {title}
          </Text>
          <Text style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
            {artist}
          </Text>
          {song.recommended && (
            <Text style={{ color: "#C7F464", fontSize: 11, marginTop: 4 }}>
              Recommended
            </Text>
          )}
        </View>
      </View>

      <Pressable onPress={toggleShuffle}>
        <Ionicons
          name="shuffle"
          size={28}
          color={shuffle ? "#C7F464" : "white"}
        />
      </Pressable>

      <View style={{ marginBottom: 5, marginTop: 10 }}>
        <Slider
          value={position}
          minimumValue={0}
          maximumValue={duration || 1}
          onSlidingComplete={seek}
          minimumTrackTintColor="#C7F464"
          maximumTrackTintColor="#555"
          thumbTintColor="#fff"
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#aaa", fontSize: 12 }}>{fmt(position)}</Text>
          <Text style={{ color: "#aaa", fontSize: 12 }}>{fmt(duration)}</Text>
        </View>
      </View>

      {playbackError ? (
        <Text style={{ color: "#ff8b8b", textAlign: "center", marginBottom: 10 }}>
          {playbackError}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <Pressable onPress={previous}>
          <Ionicons name="play-skip-back" size={36} color="white" />
        </Pressable>

        <Pressable
          onPress={toggle}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#C7F464",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isBuffering ? "hourglass-outline" : isPlaying ? "pause" : "play"}
            size={32}
            color="#3C2A20"
          />
        </Pressable>

        <Pressable onPress={next}>
          <Ionicons name="play-skip-forward" size={36} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
