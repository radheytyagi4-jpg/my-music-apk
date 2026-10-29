import { Text, View, Image, FlatList, Pressable, StyleSheet } from "react-native";

export function SongCard({ songs, onPlay, onEndReached }) {
  return (
    <FlatList
      data={songs}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      numColumns={2}
      keyExtractor={(song) => song.id}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: song, index }) => (
        <Pressable style={styles.card} onPress={() => onPlay(songs, index)}>
          <Image source={{ uri: song.img }} style={styles.cover} resizeMode="cover" />
          <View style={styles.details}>
            <Text style={styles.tittle} numberOfLines={1}>{song.tittle}</Text>
            <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 130 },
  row: { justifyContent: "space-between", marginBottom: 16 },
  card: { width: "48%", backgroundColor: "#152114", borderRadius: 14, overflow: "hidden" },
  cover: { width: "100%", height: 100 },
  details: { paddingHorizontal: 11, paddingVertical: 12 },
  tittle: { color: "#F7F1E3", fontSize: 15, fontWeight: "700" },
  artist: { color: "#C7F464", fontSize: 12, marginTop: 5 },
});