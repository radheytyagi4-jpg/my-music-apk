import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Modal,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "../../context/PlayerContext";
import { VISIBILITY, VisibilityChips } from "../../components/PlaylistRow";
import {
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
  followPlaylist,
  unfollowPlaylist,
  toPlayableSongs,
  errorMessage,
} from "../../utils/playlistApi";

export default function PlaylistDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { playSong } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState("private");
  const [editError, setEditError] = useState("");

  const load = useCallback(async () => {
    if (!id) {
      setError("Playlist not found");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setPlaylist(await getPlaylist(id));
    } catch (err) {
      setPlaylist(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/playlists");
    }
  };

  const songs = playlist ? toPlayableSongs(playlist.songs) : [];

  const play = (index = 0) => {
    if (songs.length === 0) return;
    playSong(songs, index);
  };

  const toggleFollow = async () => {
    if (busy || !playlist) return;

    setBusy(true);

    try {
      if (playlist.isFollowing) {
        await unfollowPlaylist(id);
      } else {
        await followPlaylist(id);
      }

      await load();
    } catch (err) {
      Alert.alert("Could not update", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!playlist) return;

    if (playlist.visibility === "private") {
      Alert.alert(
        "This playlist is private",
        "Change it to Unlisted or Public from Edit to share it."
      );
      return;
    }

    const link = Linking.createURL("/playlist", { queryParams: { id } });

    try {
      await Share.share({
        message: `Listen to "${playlist.name}" on Snoopy: ${link}`,
      });
    } catch (err) {
      console.log("Share error:", err?.message);
    }
  };

  const openEdit = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || "");
    setEditVisibility(playlist.visibility);
    setEditError("");
    setShowEdit(true);
  };

  const saveEdit = async () => {
    const name = editName.trim();

    if (!name || busy) return;

    setBusy(true);
    setEditError("");

    try {
      await updatePlaylist(id, {
        name,
        description: editDescription.trim(),
        visibility: editVisibility,
      });
      setShowEdit(false);
      await load();
    } catch (err) {
      setEditError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete playlist?",
      `"${playlist.name}" will be removed for everyone who saved it.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlaylist(id);
              setShowEdit(false);
              goBack();
            } catch (err) {
              setEditError(errorMessage(err));
            }
          },
        },
      ]
    );
  };

  const removeSong = async (songId) => {
    const previous = playlist;

    setPlaylist({
      ...playlist,
      songs: playlist.songs.filter((item) => item.songId !== songId),
    });

    try {
      await removeSongFromPlaylist(id, songId);
    } catch (err) {
      setPlaylist(previous);
      Alert.alert("Could not remove song", errorMessage(err));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color="#1DB954" size="large" />
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.subtitle}>{error || "Playlist not found"}</Text>
      </View>
    );
  }

  const visibility = VISIBILITY[playlist.visibility];
  const cover = playlist.songs[0]?.img;

  const Header = (
    <View>
      <Pressable onPress={goBack} hitSlop={10}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </Pressable>

      <View style={styles.hero}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverEmpty]}>
            <Ionicons name="musical-notes" size={56} color="#1DB954" />
          </View>
        )}

        <Text style={styles.title} numberOfLines={2}>
          {playlist.name}
        </Text>

        {playlist.description ? (
          <Text style={styles.description}>{playlist.description}</Text>
        ) : null}

        <Text style={styles.meta}>
          {playlist.isOwner ? "You" : playlist.ownerName || "Someone"} ·{" "}
          {playlist.songs.length}{" "}
          {playlist.songs.length === 1 ? "song" : "songs"}
          {playlist.followerCount ? ` · ${playlist.followerCount} saved` : ""}
        </Text>

        <View style={styles.badge}>
          <Ionicons name={visibility.icon} size={13} color="#ddd" />
          <Text style={styles.badgeText}>{visibility.label}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.playButton, songs.length === 0 && { opacity: 0.4 }]}
          onPress={() => play(0)}
          disabled={songs.length === 0}
        >
          <Ionicons name="play" size={22} color="#111" />
          <Text style={styles.playText}>Play</Text>
        </Pressable>

        {playlist.isOwner ? (
          <Pressable style={styles.iconButton} onPress={openEdit}>
            <Ionicons name="create-outline" size={22} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.followButton, playlist.isFollowing && styles.following]}
            onPress={toggleFollow}
            disabled={busy}
          >
            <Text style={styles.followText}>
              {playlist.isFollowing ? "Saved" : "Save"}
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.iconButton} onPress={share}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={playlist.songs}
        keyExtractor={(item) => item.songId}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingBottom: 130 }}
        ListEmptyComponent={
          <Text style={styles.subtitle}>
            {playlist.isOwner
              ? "This playlist is empty. Use the + button on a song in Search or the player to add songs."
              : "This playlist has no songs yet."}
          </Text>
        }
        renderItem={({ item, index }) => (
          <Pressable style={styles.songRow} onPress={() => play(index)}>
            {item.img ? (
              <Image source={{ uri: item.img }} style={styles.songImage} />
            ) : (
              <View style={[styles.songImage, styles.coverEmpty]}>
                <Ionicons name="musical-note" size={20} color="#1DB954" />
              </View>
            )}

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.tittle}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>

            {playlist.isOwner ? (
              <Pressable onPress={() => removeSong(item.songId)} hitSlop={10}>
                <Ionicons name="close-circle-outline" size={24} color="#888" />
              </Pressable>
            ) : null}
          </Pressable>
        )}
      />

      <Modal
        visible={showEdit}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEdit(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowEdit(false)} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Edit playlist</Text>

          <TextInput
            value={editName}
            onChangeText={setEditName}
            placeholder="Playlist name"
            placeholderTextColor="#888"
            style={styles.input}
            maxLength={60}
          />

          <TextInput
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Description (optional)"
            placeholderTextColor="#888"
            style={styles.input}
            maxLength={200}
          />

          <Text style={styles.label}>Who can see it?</Text>
          <VisibilityChips value={editVisibility} onChange={setEditVisibility} />

          {editVisibility === "private" && playlist.followerCount > 0 ? (
            <Text style={styles.warning}>
              Making it private removes it from {playlist.followerCount} saved
              {playlist.followerCount === 1 ? " library" : " libraries"}.
            </Text>
          ) : null}

          {editError ? <Text style={styles.error}>{editError}</Text> : null}

          <Pressable
            onPress={saveEdit}
            disabled={!editName.trim() || busy}
            style={[
              styles.primary,
              (!editName.trim() || busy) && { opacity: 0.4 },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text style={styles.primaryText}>Save changes</Text>
            )}
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={confirmDelete}>
            <Text style={styles.deleteText}>Delete playlist</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  subtitle: { color: "#aaa", marginTop: 16 },
  hero: { alignItems: "center", marginTop: 8 },
  cover: { width: 180, height: 180, borderRadius: 8, backgroundColor: "#3C2A20" },
  coverEmpty: { alignItems: "center", justifyContent: "center" },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  description: { color: "#bbb", marginTop: 6, textAlign: "center" },
  meta: { color: "#aaa", marginTop: 8, fontSize: 13 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeText: { color: "#ddd", fontSize: 12, marginLeft: 5 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1DB954",
    paddingHorizontal: 26,
    paddingVertical: 11,
    borderRadius: 26,
  },
  playText: { color: "#111", fontWeight: "bold", fontSize: 15, marginLeft: 6 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  followButton: {
    borderWidth: 1,
    borderColor: "#1DB954",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginLeft: 12,
  },
  following: { backgroundColor: "#1DB95433" },
  followText: { color: "#1DB954", fontWeight: "bold" },
  songRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  songImage: { width: 50, height: 50, borderRadius: 4, backgroundColor: "#3C2A20" },
  songTitle: { color: "#fff", fontWeight: "bold" },
  songArtist: { color: "#aaa", marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: "#181818",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
  },
  sheetTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 14 },
  input: {
    backgroundColor: "#262626",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: { color: "#ddd", fontWeight: "600" },
  warning: { color: "#e0b341", fontSize: 12, marginBottom: 10 },
  error: { color: "#ff8b8b", marginBottom: 10 },
  primary: {
    backgroundColor: "#1DB954",
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: "center",
  },
  primaryText: { color: "#111", fontWeight: "bold", fontSize: 15 },
  deleteButton: { alignItems: "center", paddingVertical: 14, marginTop: 6 },
  deleteText: { color: "#ff6b6b", fontWeight: "600" },
});
