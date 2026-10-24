
import {
  Text,
  View,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";

export function SongCard() {
const music = [
  { id: "1",  title: "Blinding Lights", artist: "The Weeknd",                   img: "https://picsum.photos/seed/blinding/600/600" },
  { id: "2",  title: "Shape of You",    artist: "Ed Sheeran",                   img: "https://picsum.photos/seed/shape/600/600" },
  { id: "3",  title: "Someone Like You",artist: "Adele",                        img: "https://picsum.photos/seed/someone/600/600" },
  { id: "4",  title: "Believer",        artist: "Imagine Dragons",              img: "https://picsum.photos/seed/believer/600/600" },
  { id: "5",  title: "Levitating",      artist: "Dua Lipa",                     img: "https://picsum.photos/seed/levitating/600/600" },
  { id: "6",  title: "Perfect",         artist: "Ed Sheeran",                   img: "https://picsum.photos/seed/perfect/600/600" },
  { id: "7",  title: "Stay",            artist: "The Kid LAROI, Justin Bieber", img: "https://picsum.photos/seed/stay/600/600" },
  { id: "8",  title: "As It Was",       artist: "Harry Styles",                 img: "https://picsum.photos/seed/asitwas/600/600" },
  { id: "9",  title: "Cold Heart",      artist: "Elton John, Dua Lipa",         img: "https://picsum.photos/seed/coldheart/600/600" },
  { id: "10", title: "Counting Stars",  artist: "OneRepublic",                  img: "https://picsum.photos/seed/stars/600/600" },
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
