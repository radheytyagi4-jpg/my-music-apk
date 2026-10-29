import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Image } from "react-native";
import { useState, useEffect } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import Axios from "axios";
import { baseUrl } from "../../config.js";

export default function Search() {
  const { playSong } = usePlayer();
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (!search.trim()) {
      setSongs([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await Axios.get(`${baseUrl}/songs/search`, {
          params: { q: search },
        });
        setSongs(response.data.data);
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search music..."
        placeholderTextColor="#aaa"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ position: "absolute", top: 56, right: 45 }}>
        <Ionicons name="search" size={24} color="#aaa" />
      </View>

      {songs.length === 0 ? (
        <View>
          <Text style={styles.title}>Search Music</Text>
          <Text style={styles.subtitle}>Find your favourite songs and artists on Snoopy</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => playSong(songs, index)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
            >
              <Image source={{ uri: item.img }} style={{ width: 50, height: 50, borderRadius: 4 }} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }} numberOfLines={1}>{item.tittle}</Text>
                <Text style={{ color: "#aaa" }} numberOfLines={1}>{item.artist}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 30, },
  title: { color: "#1DB954", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#aaa", marginTop: 10 },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop:20,
    marginBottom: 30,
  },
}); 