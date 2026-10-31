
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

import { SongCard } from "../../components/SongCard.jsx";
import { usePlayer } from "../../context/PlayerContext";
import { baseUrl } from "../../config.js";

const queries = [
  "Arijit Singh",
  "Shreya Ghoshal",
  "Sonu Nigam",
  "KK",
  "Atif Aslam",
  "Mohit Chauhan",
  "Jubin Nautiyal",
  "Armaan Malik",
  "Vishal Mishra",
  "Pritam",
  "Ar Rahman",
  "Shankar Mahadevan",
  "Sunidhi Chauhan",
  "Neha Kakkar",
  "Darshan Raval",
  "B Praak",
  "Sachet Tandon",
  "Ankit Tiwari",
  "Palak Muchhal",
  "Rahat Fateh Ali Khan",
  "Karan Aujla",
  "Diljit Dosanjh",
  "Sidhu Moose Wala",
  "AP Dhillon",
  "Shubh",
  "Badshah",
  "Yo Yo Honey Singh",
  "Guru Randhawa",
  "Babbu Maan",
  "Gurdas Maan",
  "Amrinder Gill",
  "Jass Manak",
  "Garry Sandhu",
  "Parmish Verma",
  "Ranjit Bawa",
  "Ninja",
  "Sartaj Virk",
  "Talwiinder",
  "Dandha Nyoliwala",
  "Mankirt Aulakh",
  "Jordan Sandhu",
  "Harrdy Sandhu",
  "Prem Dhillon",
  "Anuv Jain",
  "Prateek Kuhad",
  "Ritviz",
  "The Local Train",
  "When Chai Met Toast",
  "Taba Chake",
  "Achint",
  "Aditya Rikhari",
  "The Yellow Diary",
  "Mitraz",
  "Raghav Meattle",
  "Zaeden",
  "King",
  "MC Stan",
  "Divine",
  "Emiway Bantai",
  "KR$NA",
  "Seedhe Maut",
  "Raftaar",
  "Ikka",
  "Fotty Seven",
  "The Weeknd",
  "Ed Sheeran",
  "Adele",
  "Imagine Dragons",
  "Dua Lipa",
  "Harry Styles",
  "Taylor Swift",
  "Billie Eilish",
  "Coldplay",
  "Bruno Mars",
  "Post Malone",
  "Rihanna",
  "Drake",
  "Ariana Grande",
  "Maroon 5",
  "Linkin Park",
  "Eminem",
  "Sia",
  "Shawn Mendes",
  "Charlie Puth",
  "Lana Del Rey",
  "Arctic Monkeys",
  "Olivia Rodrigo",
  "Sam Smith",
  "Justin Bieber",
  "Selena Gomez",
  "Katy Perry",
  "Lady Gaga",
  "Kendrick Lamar",
  "The Chainsmokers",
  "Calvin Harris",
  "Avicii",
  "Alan Walker",
  "Doja Cat",
  "SZA",
  "Travis Scott",
  "Khalid",
  "Lewis Capaldi",
  "Camila Cabello",
  "Justin Timberlake",
  "The Neighbourhood",
  "OneRepublic",
  "Shakira",
  "Beyonce",
  "John Mayer",
  "Lauv",
  "Tate McRae",
  "Frank Ocean",
  "Tyler The Creator",
  "rap",
  "hip hop",
  "bollywood",
  "punjabi",
  "indie",
  "romantic songs",
  "lofi",
  "sad songs",
  "pop music",
  "workout music",
  "EDM",
  "90s Bollywood",
];

export default function Home() {
  const { playSong } = usePlayer();

  const [songs, setSongs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loading = useRef(false);
  const lastQuery = useRef("");

  const getRandomQuery = () => {
    const availableQueries = queries.filter(
      (query) => query !== lastQuery.current
    );

    const selected =
      availableQueries[
        Math.floor(Math.random() * availableQueries.length)
      ];

    lastQuery.current = selected;
    return selected;
  };

  const loadSongs = async (mode = "more") => {
    if (loading.current) return;

    loading.current = true;

    if (mode === "refresh") {
      setRefreshing(true);
    } else if (mode === "initial") {
      setInitialLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const query = getRandomQuery();

      const response = await axios.get(
        `${baseUrl}/songs/search`,
        {
          params: { q: query },
        }
      );

      const newSongs = (response.data?.data || [])
        .map((song, index) => ({
          ...song,
          id: String(song.id || `${query}-${index}`),
          title: song.title || song.song || "Unknown Song",
          artist:
            song.artist ||
            song.primary_artists ||
            "Unknown Artist",
          img: song.img || song.image || null,
          audioUrl: song.audioUrl || song.media_url || null,
        }))
        .filter((song) => song.audioUrl);

      setSongs((previous) => {
        if (mode === "refresh" || mode === "initial") {
          return newSongs;
        }

        const existingIds = new Set(
          previous.map((song) => song.id)
        );

        const freshSongs = newSongs.filter(
          (song) => !existingIds.has(song.id)
        );

        return [...previous, ...freshSongs];
      });
    } catch (error) {
      console.log(
        "Song loading error:",
        error.response?.data || error.message
      );
    } finally {
      loading.current = false;
      setRefreshing(false);
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadSongs("initial");
  }, []);

  const handlePlay = (song) => {
    playSong(song);
  };

  const Header = (
    <View style={styles.header}>
      <View>
        <Text style={styles.heading}>Snoopy</Text>
        <Text style={styles.subtitle}>
          Discover your music
        </Text>
      </View>

      <Pressable
        style={styles.refreshButton}
        onPress={() => loadSongs("refresh")}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color="#1DB954" size="small" />
        ) : (
          <Ionicons
            name="refresh"
            size={23}
            color="#1DB954"
          />
        )}
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <SongCard
        songs={songs}
        onPlay={handlePlay}
        onEndReached={() => loadSongs("more")}
        refreshing={refreshing}
        onRefresh={() => loadSongs("refresh")}
        loadingMore={loadingMore}
        initialLoading={initialLoading}
        header={Header}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1DB954",
  },

  subtitle: {
    fontSize: 13,
    color: "#BDAA91",
    marginTop: 4,
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3C2A20",
    borderWidth: 1,
    borderColor: "#7A5230",
    justifyContent: "center",
    alignItems: "center",
  },
});
