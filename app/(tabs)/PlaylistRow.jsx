import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const VISIBILITY = {
  private: { label: "Private", icon: "lock-closed-outline" },
  unlisted: { label: "Unlisted", icon: "link-outline" },
  public: { label: "Public", icon: "globe-outline" },
};

export function VisibilityChips({ value, onChange }) {
  return (
    <View style={styles.chips}>
      {Object.entries(VISIBILITY).map(([key, meta]) => {
        const active = value === key;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Ionicons
              name={meta.icon}
              size={14}
              color={active ? "#111" : "#ddd"}
            />
            <Text style={[styles.chipText, active && { color: "#111" }]}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PlaylistRow({ item, onPress, showOwner }) {
  const meta = VISIBILITY[item.visibility];

  return (
    <Pressable style={styles.row} onPress={onPress}>
      {item.cover ? (
        <Image source={{ uri: item.cover }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverEmpty]}>
          <Ionicons name="musical-notes" size={24} color="#1DB954" />
        </View>
      )}

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.sub} numberOfLines={1}>
          {item.songCount} {item.songCount === 1 ? "song" : "songs"}
          {showOwner && item.ownerName ? ` · by ${item.ownerName}` : ""}
          {item.followerCount ? ` · ${item.followerCount} saved` : ""}
        </Text>
      </View>

      {meta && !showOwner ? (
        <Ionicons name={meta.icon} size={16} color="#888" />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cover: { width: 54, height: 54, borderRadius: 6, backgroundColor: "#3C2A20" },
  coverEmpty: { alignItems: "center", justifyContent: "center" },
  name: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  sub: { color: "#aaa", fontSize: 12, marginTop: 3 },
  chips: { flexDirection: "row", marginVertical: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#262626",
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#1DB954" },
  chipText: { color: "#ddd", marginLeft: 6, fontSize: 13 },
});
