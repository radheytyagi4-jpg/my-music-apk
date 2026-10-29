import { View, Text, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import Axios from "axios";
import { getUserId } from "../../utils/session";
import { usePlayer } from "../../context/PlayerContext";
import { baseUrl } from "../../config.js";

export default function Recent() {
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const userId = await getUserId();
          if (!userId) return;
          const res = await Axios.get( `${baseUrl}/recent`, { params: { userId, } });
          setSongs(res.data.data);
        } catch (error) {
          console.log(error.response?.data || error.message);
        }
      })();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recently Played</Text>
      {songs.length === 0 ? (
        <Text style={styles.subtitle}>Your Snoopy history will appear here.</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 130 }}
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
  container: { flex: 1, backgroundColor: "#121212", padding: 24, paddingTop: 40 },
  title: { color: "#1DB954", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#aaa", marginTop: 10 },
});