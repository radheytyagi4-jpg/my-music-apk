
import {
  Text,
  View,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";

export function SongCard() {
  const music = [
    {
      id: "1",
      title: "Sunset Vibes",
      artist: "Artist 1",
      img: require("../assets/dan-begel-X2IppAGHlMQ-unsplash.jpg"),
    },
    {
      id: "2",
      title: "Midnight Dreams",
      artist: "Artist 2",
      img: require("../assets/fabio-sasso-Gi-HkcQRyfE-unsplash.jpg"),
    },
    {
      id: "3",
      title: "Lost in Music",
      artist: "Artist 3",
      img: require("../assets/insung-yoon-PJLdikFrvT8-unsplash.jpg"),
    },
    {
      id: "4",
      title: "Golden Hour",
      artist: "Artist 4",
      img: require("../assets/dan-begel-X2IppAGHlMQ-unsplash.jpg"),
    },
    {
      id: "5",
      title: "Dreamscape",
      artist: "Artist 5",
      img: require("../assets/fabio-sasso-Gi-HkcQRyfE-unsplash.jpg"),
    },
    {
      id: "6",
      title: "Ocean Eyes",
      artist: "Artist 6",
      img: require("../assets/insung-yoon-PJLdikFrvT8-unsplash.jpg"),
    },
    {
      id: "7",
      title: "Night Drive",
      artist: "Artist 7",
      img: require("../assets/dan-begel-X2IppAGHlMQ-unsplash.jpg"),
    },
    {
      id: "8",
      title: "Better Days",
      artist: "Artist 8",
      img: require("../assets/fabio-sasso-Gi-HkcQRyfE-unsplash.jpg"),
    },
    {
      id: "9",
      title: "Slow Motion",
      artist: "Artist 9",
      img: require("../assets/insung-yoon-PJLdikFrvT8-unsplash.jpg"),
    },
    {
      id: "10",
      title: "After Hours",
      artist: "Artist 10",
      img: require("../assets/dan-begel-X2IppAGHlMQ-unsplash.jpg"),
    },
  ];

  return (
    <FlatList
      data={music}
      numColumns={2}
      keyExtractor={(song) => song.id}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: song }) => (
        <View style={styles.card}>
          <Image
            source={song.img}
            style={styles.cover}
            resizeMode="cover"
          />

          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {song.artist}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  card: {
    width: "48%",
    backgroundColor: "#3C2A20",
    borderRadius: 14,
    overflow: "hidden",
  },

  cover: {
    width: "100%",
    height: 100
  },

  details: {
    paddingHorizontal: 11,
    paddingVertical: 12,
  },

  title: {
    color: "#F7F1E3",
    fontSize: 15,
    fontWeight: "700",
  },

  artist: {
    color: "#C7F464",
    fontSize: 12,
    marginTop: 5,
  },
});
