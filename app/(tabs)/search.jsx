
import { View, Text, StyleSheet, TextInput, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Image } from "react-native";
import Axios from "axios";

export default function Search() {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (!search.trim()) {
      setSongs([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await Axios.get(`http://localhost:4000/api/v1/songs/search?q=${search}`)
        setSongs(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.log(error.response?.data);
      }
    }, 500);

    return () => clearTimeout(timer);
  }
    , [search]);

  const toMiniPlayer = () => {};


  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search music..."
        placeholderTextColor="#aaa"
        style={styles.input}
        onChangeText={(text) => { setSearch(text); }}
      />
      <Pressable
        style={{ position: "absolute", top: 30, right: 35 }}
        onPress={() => { searchSong() }}
      >
        <Ionicons name="search" size={24} color="#aaa" />
      </Pressable>
      {
        !songs.length > 0 ?
          <View>
            <Text style={styles.title}>Search Music</Text>
            <Text style={styles.subtitle}>
              Find your favourite songs and artists.
            </Text>
          </View> :
          <Pressable
          onPress={console.log("chalra hoo madrchodd")}
          >
          <FlatList
            data={songs}
            keyExtactor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <Image source={{ uri: item.img }} style={{ width: 50, height: 50, borderRadius: 4 }} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }} numberOfLines={1}>{item.tittle}</Text>
                  <Text style={{ color: "#aaa" }} numberOfLines={1}>{item.artist}</Text>
                </View>
              </View>
            )}
          />
          </Pressable>
          }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#121212",
    padding: 24,
    // justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#aaa",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 40,
  }
});

