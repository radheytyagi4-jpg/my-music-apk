import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import Axios from "axios";
import { baseUrl } from "../../config.js";

export default function Search() {
  const { playSong } = usePlayer();
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setSongs([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await Axios.get(`${baseUrl}/songs/search`, {
          params: { q: query },
          timeout: 20000,
        });

        if (cancelled) return;

        const seen = new Set();
        const unique = (response.data.data || []).filter((song) => {
          const id = String(song.id);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });

        setSongs(unique);
      } catch (err) {
        if (cancelled) return;
        setSongs([]);
        setError("Could not load songs. Check your connection and try again.");
        console.log(err.response?.data || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const hasQuery = search.trim().length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search music..."
        placeholderTextColor="#aaa"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      <View style={{ position: "absolute", top: 58, right: 45 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#1DB954" />
        ) : (
          <Ionicons name="search" size={24} color="#aaa" />
        )}
      </View>

      {!hasQuery ? (
        <View>
          <Text style={styles.title}>Search Music</Text>
          <Text style={styles.subtitle}>
            Find your favourite songs and artists on Snoopy
          </Text>
        </View>
      ) : error ? (
        <Text style={styles.subtitle}>{error}</Text>
      ) : songs.length === 0 && !loading ? (
        <Text style={styles.subtitle}>No songs found for "{search.trim()}"</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => playSong([item], 0)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Image
                source={item.img ? { uri: item.img } : undefined}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 4,
                  backgroundColor: "#3C2A20",
                }}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "bold" }}
                  numberOfLines={1}
                >
                  {item.title || item.tittle || item.song || "Unknown Song"}
                </Text>
                <Text style={{ color: "#aaa" }} numberOfLines={1}>
                  {item.artist || item.primary_artists || "Unknown Artist"}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 30 },
  title: { color: "#1DB954", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#aaa", marginTop: 10 },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
});
