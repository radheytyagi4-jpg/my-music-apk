import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getMyPlaylists,
  createPlaylist,
  addSongToPlaylist,
  errorMessage,
} from "../utils/playlistApi";

export function AddToPlaylist({ visible, song, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

  const songId = song ? String(song.id) : null;

  useEffect(() => {
    if (!visible || !songId) return;

    let active = true;

    setMessage("");
    setNewName("");
    setLoading(true);

    getMyPlaylists(songId)
      .then((data) => {
        if (active) setPlaylists(data.owned || []);
      })
      .catch((error) => {
        if (active) setMessage(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [visible, songId]);

  const markAdded = (id) =>
    setPlaylists((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, hasSong: true, songCount: item.songCount + 1 }
          : item
      )
    );

  const addTo = async (playlist) => {
    if (busyId || playlist.hasSong) return;

    setBusyId(playlist._id);
    setMessage("");

    try {
      const result = await addSongToPlaylist(playlist._id, song);

      if (result.added) {
        markAdded(playlist._id);
        setMessage(`Added to ${playlist.name}`);
      } else {
        setPlaylists((prev) =>
          prev.map((item) =>
            item._id === playlist._id ? { ...item, hasSong: true } : item
          )
        );
        setMessage(`Already in ${playlist.name}`);
      }
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const createAndAdd = async () => {
    const name = newName.trim();

    if (!name || creating) return;

    setCreating(true);
    setMessage("");

    try {
      const playlist = await createPlaylist({ name });
      await addSongToPlaylist(playlist._id, song);

      setPlaylists((prev) => [
        {
          _id: playlist._id,
          name: playlist.name,
          songCount: 1,
          hasSong: true,
        },
        ...prev,
      ]);
      setNewName("");
      setMessage(`Added to ${playlist.name}`);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Add to playlist</Text>
            <Text style={styles.songName} numberOfLines={1}>
              {song?.tittle || song?.title || ""}
            </Text>
          </View>

          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.newRow}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="New playlist name"
            placeholderTextColor="#888"
            style={styles.input}
            maxLength={60}
            returnKeyType="done"
            onSubmitEditing={createAndAdd}
          />

          <Pressable
            onPress={createAndAdd}
            disabled={!newName.trim() || creating}
            style={[
              styles.createButton,
              (!newName.trim() || creating) && { opacity: 0.4 },
            ]}
          >
            {creating ? (
              <ActivityIndicator color="#111" size="small" />
            ) : (
              <Text style={styles.createText}>Create</Text>
            )}
          </Pressable>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {loading ? (
          <ActivityIndicator color="#1DB954" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item._id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.empty}>
                You have no playlists yet. Create one above.
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => addTo(item)}>
                <View style={styles.rowIcon}>
                  <Ionicons name="musical-notes" size={20} color="#1DB954" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.rowSub}>{item.songCount} songs</Text>
                </View>

                {busyId === item._id ? (
                  <ActivityIndicator color="#1DB954" size="small" />
                ) : (
                  <Ionicons
                    name={item.hasSong ? "checkmark-circle" : "add-circle-outline"}
                    size={26}
                    color={item.hasSong ? "#1DB954" : "#fff"}
                  />
                )}
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: "#181818",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    maxHeight: "75%",
    minHeight: 320,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  songName: { color: "#aaa", fontSize: 13, marginTop: 2 },
  newRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: "#262626",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButton: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    marginLeft: 10,
  },
  createText: { color: "#111", fontWeight: "bold" },
  message: { color: "#1DB954", marginVertical: 8 },
  empty: { color: "#aaa", marginTop: 20, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: { color: "#fff", fontWeight: "bold" },
  rowSub: { color: "#aaa", fontSize: 12, marginTop: 2 },
});
