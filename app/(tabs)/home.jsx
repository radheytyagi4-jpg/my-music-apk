import { View, Text, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import Axios from "axios";
import { SongCard } from "../../components/SongCard.jsx";
import { usePlayer } from "../../context/PlayerContext";
import { baseUrl } from "../../config.js";

export default function Home() {
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const loading = useRef(false);

  const loadMore = async () => {
    if (loading.current) return;
    loading.current = true;

    try {
      const queries = ["Arijit Singh", "Shreya Ghoshal", "Sonu Nigam", "Atif Aslam"];
      const query = queries[Math.floor(Math.random() * queries.length)];

      const res = await Axios.get(
        `${baseUrl}/songs/search`,
        { params: { q: query } }
      );

      const newSongs = res.data.data.map((s) => ({
        ...s,
        title: s.tittle || s.title,
        artist: s.artist || s.primary_artists,
        image: s.img || s.image,
        audioUrl: s.audioUrl || s.media_url,
      }));

      setSongs((prev) => {
        const ids = new Set(prev.map((s) => s.id));
        const artists = new Set(prev.map((s) => s.artist));
        const fresh = newSongs.filter(
          (s) => !ids.has(s.id) && !artists.has(s.artist)
        );
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
      <Text style={styles.heading}>Snoopy</Text>
      <SongCard songs={songs} onPlay={playSong} onEndReached={loadMore} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1DB954",
    paddingHorizontal: 20,
    paddingTop: 45,
  },
});
