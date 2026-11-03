import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { usePlayer } from "../../context/PlayerContext";
import { getUserId } from "../../utils/session";
import { Ionicons } from "@expo/vector-icons";
import Axios from "axios";
import { baseUrl } from "../../config.js";
import { AddToPlaylist } from "../../components/AddToPlaylist";

const saveSearched = async (song) => {
  try {
    const userId = await getUserId();
    if (!userId) return;

    await Axios.post(`${baseUrl}/searched`, { userId, song });
  } catch (error) {
    console.log("Save searched error:", error.response?.data || error.message);
  }
};

const loadSearched = async () => {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    const res = await Axios.get(`${baseUrl}/searched`, { params: { userId } });
    return res.data.data || [];
  } catch (error) {
    console.log("Load searched error:", error.response?.data || error.message);
    return [];
  }
};

const SongRow = ({ item, onPress, onAdd, highlight }) => (
  <Pressable
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
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
        style={{ color: highlight ? "#1DB954" : "#fff", fontWeight: "bold" }}
        numberOfLines={1}
      >
        {item.tittle || item.song || "Unknown Song"}
      </Text>
      <Text style={{ color: "#aaa" }} numberOfLines={1}>
        {item.artist || item.primary_artists || "Unknown Artist"}
      </Text>
    </View>
    {onAdd ? (
      <Pressable onPress={onAdd} hitSlop={10} style={{ padding: 6 }}>
        <Ionicons name="add-circle-outline" size={26} color="#fff" />
      </Pressable>
    ) : null}
  </Pressable>
);

export default function Search() {
  const { playSong } = usePlayer();
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedSongs, setSearchedSongs] = useState([]);
  const [addTarget, setAddTarget] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSearched().then((list) => {
        if (active) setSearchedSongs(list);
      });
      return () => {
        active = false;
      };
    }, [])
  );

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

  const onPickResult = (item) => {
    Keyboard.dismiss();
    playSong([item], 0);
    saveSearched(item);
    setSearchedSongs((prev) => [
      item,
      ...prev.filter((s) => String(s.id) !== String(item.id)),
    ].slice(0, 20));
  };

  let content;

  if (!hasQuery) {
    content = (
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Search Music</Text>
        {searchedSongs.length > 0 ? (
          <>
            <Text style={styles.section}>Recent searches</Text>
            <FlatList
              data={searchedSongs}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 130 }}
              renderItem={({ item, index }) => (
                <SongRow
                  item={item}
                  onPress={() => playSong(searchedSongs, index)}
                  onAdd={() => setAddTarget(item)}
                />
              )}
            />
          </>
        ) : (
          <Text style={styles.subtitle}>
            Find your favourite songs and artists on Snoopy
          </Text>
        )}
      </View>
    );
  } else if (error) {
    content = <Text style={styles.subtitle}>{error}</Text>;
  } else if (songs.length === 0 && !loading) {
    content = (
      <Text style={styles.subtitle}>No songs found for "{search.trim()}"</Text>
    );
  } else {
    content = (
      <FlatList
        data={songs}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <SongRow
            item={item}
            highlight
            onPress={() => onPickResult(item)}
            onAdd={() => setAddTarget(item)}
          />
        )}
      />
    );
  }

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

      {content}

      <AddToPlaylist
        visible={!!addTarget}
        song={addTarget}
        onClose={() => setAddTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 30 },
  title: { color: "#1DB954", fontSize: 28, fontWeight: "bold" },
  section: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 20 },
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