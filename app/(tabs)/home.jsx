import { View, Text, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import Axios from "axios";
import { SongCard } from "../../components/SongCard.jsx";
import { usePlayer } from "../../context/PlayerContext";

export default function Home() {
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const loading = useRef(false);

  const loadMore = async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const res = await Axios.get("http://localhost:4000/api/v1/songs/discover", {
        params: { count: 12 },
      });
      setSongs((prev) => {
        const ids = new Set(prev.map((s) => s.id));
        const artists = new Set(prev.map((s) => s.artist));
        const fresh = res.data.data.filter((s) => !ids.has(s.id) && !artists.has(s.artist));
        return [...prev, ...fresh];
      });
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      loading.current = false;
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Home</Text>
      <SongCard songs={songs} onPlay={playSong} onEndReached={loadMore} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  heading: { fontSize: 24, fontWeight: "bold", color: "#1DB954", paddingHorizontal: 16, paddingTop: 20 },
});