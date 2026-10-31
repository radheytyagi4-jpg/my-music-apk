import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

export function SongCard({
  songs = [],
  onPlay,
  onEndReached,
  refreshing,
  onRefresh,
  loadingMore,
  initialLoading,
  header,
}) {
  return (
    <FlatList
      style={styles.list}
      data={songs}
      numColumns={2}
      keyExtractor={(song) => String(song.id)}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#C7F464"
          colors={["#C7F464"]}
          progressBackgroundColor="#3C2A20"
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.empty}>
          {initialLoading ? (
            <ActivityIndicator color="#C7F464" size="large" />
          ) : (
            <Text style={styles.emptyText}>
              No songs found. Try refreshing.
            </Text>
          )}
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            color="#C7F464"
            size="small"
            style={styles.footer}
          />
        ) : null
      }
      renderItem={({ item: song }) => (
        <Pressable
          style={({ pressed }) => [
            styles.card,
            pressed && styles.pressed,
          ]}
          onPress={() => onPlay?.(song)}
          disabled={!song.audioUrl && !song.media_url}
        >
          {song.img || song.image ? (
            <Image
              source={{ uri: song.img || song.image }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>♪</Text>
            </View>
          )}

          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {song.tittle || song.title || song.song || "Unknown Song"}
            </Text>

            <Text style={styles.artist} numberOfLines={1}>
              {song.artist || song.primary_artists || "Unknown Artist"}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "#111",
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    width: "48%",
    backgroundColor: "#3C2A20",
    borderRadius: 13,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.75,
  },
  cover: {
    width: "100%",
    height: 120,
  },
  placeholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#7A5230",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 45,
    color: "#C7F464",
  },
  details: {
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  title: {
    color: "#F7F1E3",
    fontSize: 15,
    fontWeight: "bold",
  },
  artist: {
    color: "#C7F464",
    fontSize: 12,
    marginTop: 5,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#F7F1E3",
    fontSize: 14,
  },
  footer: {
    padding: 20,
  },
});
