
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

  // Keep a synchronous copy for duplicate checking.
  const songsRef = useRef([]);

  // Prevent simultaneous API requests.
  const loading = useRef(false);

  // Prevent repeating search queries until all have been used.
  const usedQueries = useRef(new Set());

  // Get a query that hasn't recently been used.
  const getRandomQuery = () => {
    let availableQueries = queries.filter(
      (query) => !usedQueries.current.has(query)
    );

    // Reset when all queries have been used.
    if (availableQueries.length === 0) {
      usedQueries.current.clear();
      availableQueries = [...queries];
    }

    const selected =
      availableQueries[
        Math.floor(Math.random() * availableQueries.length)
      ];

    usedQueries.current.add(selected);

    return selected;
  };

  // Normalize each API song.
  const normalizeSong = (song, query, index) => {
    const title = String(
      song.title ||
      song.tittle ||
      song.song ||
      song.name ||
      "Unknown Song"
    );

    const rawArtist =
      song.artist ||
      song.primary_artists ||
      song.singers ||
      "Unknown Artist";

    const artist = Array.isArray(rawArtist)
      ? rawArtist.join(", ")
      : String(rawArtist);

    const audioUrl =
      song.audioUrl ||
      song.media_url ||
      song.url ||
      null;

    const image =
      song.img ||
      song.image ||
      song.thumbnail ||
      song.image_url ||
      null;

    const id = String(
      song.id ??
      song.songid ??
      song.mediaId ??
      audioUrl ??
      `${title}-${artist}`
    );

    return {
      ...song,
      id,
      title,
      tittle: title,
      artist,
      img: image,
      audioUrl,
    };
  };

  // Search API with 502 retry protection.
  const fetchSongs = async (query) => {
    let response;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await axios.get(
          `${baseUrl}/songs/search`,
          {
            params: { q: query },
            timeout: 20000,
          }
        );

        break;
      } catch (error) {
        if (
          error.response?.status !== 502 ||
          attempt === 2
        ) {
          throw error;
        }

        console.log(
          `502 error. Retry ${attempt + 1}/2`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 2500)
        );
      }
    }

    if (!response) {
      throw new Error("Search API returned no response");
    }

    const payload = response.data;

    // Support different API response shapes.
    const rawSongs = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.songs)
        ? payload.songs
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
            ? payload
            : [];

    return rawSongs
      .filter(
        (song) => song && typeof song === "object"
      )
      .map((song, index) =>
        normalizeSong(song, query, index)
      )
      .filter(
        (song) =>
          typeof song.audioUrl === "string" &&
          song.audioUrl.trim().length > 0
      );
  };

  // Main loading function.
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
      // For pagination, search multiple artists/categories
      // until we find enough songs or use three queries.
      const maxQueries = mode === "more" ? 3 : 1;

      const existingIds = new Set(
        mode === "more"
          ? songsRef.current.map((song) => String(song.id))
          : []
      );

      const collectedSongs = [];
      const collectedIds = new Set();

      for (let attempt = 0; attempt < maxQueries; attempt++) {
        const query = getRandomQuery();

        console.log("Searching:", query);

        const results = await fetchSongs(query);

        console.log("Playable results:", results.length);

        for (const song of results) {
          const id = String(song.id);

          if (
            existingIds.has(id) ||
            collectedIds.has(id)
          ) {
            continue;
          }

          collectedIds.add(id);
          collectedSongs.push(song);
        }

        // Stop once we have enough new songs.
        if (
          mode !== "more" ||
          collectedSongs.length >= 8
        ) {
          break;
        }
      }

      console.log(
        "Total new songs found:",
        collectedSongs.length
      );

      if (mode === "initial" || mode === "refresh") {
        songsRef.current = collectedSongs;
        setSongs(collectedSongs);
      } else if (collectedSongs.length > 0) {
        const updatedSongs = [
          ...songsRef.current,
          ...collectedSongs,
        ];

        songsRef.current = updatedSongs;
        setSongs(updatedSongs);
      }

      if (
        mode === "more" &&
        collectedSongs.length === 0
      ) {
        console.log(
          "No new songs found. Try loading again."
        );
      }
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

  // Initial Home loading.
  useEffect(() => {
    loadSongs("initial");
  }, []);

  // Play selected song.
  const handlePlay = (song) => {
    playSong(song);
  };

  // Home header.
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
        disabled={refreshing || loadingMore}
      >
        {refreshing ? (
          <ActivityIndicator
            color="#1DB954"
            size="small"
          />
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
