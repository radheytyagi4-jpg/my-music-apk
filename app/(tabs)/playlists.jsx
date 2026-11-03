import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PlaylistRow, VisibilityChips } from "../../components/PlaylistRow";
import {
  getMyPlaylists,
  browsePlaylists,
  createPlaylist,
  errorMessage,
} from "../../utils/playlistApi";

export default function Playlists() {
  const router = useRouter();

  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState({ owned: [], followed: [] });
  const [mineLoading, setMineLoading] = useState(true);
  const [mineError, setMineError] = useState("");

  const [query, setQuery] = useState("");
  const [browse, setBrowse] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const open = (id) =>
    router.push({ pathname: "/playlist", params: { id: String(id) } });

  const loadMine = useCallback(async () => {
    try {
      setMineError("");
      setMine(await getMyPlaylists());
    } catch (error) {
      setMineError(errorMessage(error));
    } finally {
      setMineLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMine();
    }, [loadMine])
  );

  useEffect(() => {
    if (tab !== "browse") return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setBrowseLoading(true);
      setBrowseError("");

      try {
        const data = await browsePlaylists(query.trim());
        if (!cancelled) setBrowse(data);
      } catch (error) {
        if (!cancelled) setBrowseError(errorMessage(error));
      } finally {
        if (!cancelled) setBrowseLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, query]);

  const closeCreate = () => {
    setShowCreate(false);
    setName("");
    setVisibility("private");
    setCreateError("");
  };

  const submitCreate = async () => {
    const trimmed = name.trim();

    if (!trimmed || creating) return;

    setCreating(true);
    setCreateError("");

    try {
      const playlist = await createPlaylist({ name: trimmed, visibility });
      closeCreate();
      await loadMine();
      open(playlist._id);
    } catch (error) {
      setCreateError(errorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const sections = [
    { title: "Created by you", data: mine.owned },
    { title: "Saved playlists", data: mine.followed },
  ].filter((section) => section.data.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>

        <Pressable style={styles.addButton} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={26} color="#111" />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {[
          ["mine", "My playlists"],
          ["browse", "Browse"],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === key && { color: "#111" }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "mine" ? (
        mineLoading ? (
          <ActivityIndicator color="#1DB954" style={{ marginTop: 30 }} />
        ) : mineError ? (
          <Text style={styles.subtitle}>{mineError}</Text>
        ) : sections.length === 0 ? (
          <Text style={styles.subtitle}>
            No playlists yet. Tap + to create your first one.
          </Text>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item._id}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: 130 }}
            renderSectionHeader={({ section }) => (
              <Text style={styles.section}>{section.title}</Text>
            )}
            renderItem={({ item, section }) => (
              <PlaylistRow
                item={item}
                showOwner={section.title === "Saved playlists"}
                onPress={() => open(item._id)}
              />
            )}
          />
        )
      ) : (
        <View style={{ flex: 1 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search public playlists..."
            placeholderTextColor="#888"
            style={styles.input}
          />

          {browseLoading ? (
            <ActivityIndicator color="#1DB954" style={{ marginTop: 20 }} />
          ) : browseError ? (
            <Text style={styles.subtitle}>{browseError}</Text>
          ) : (
            <FlatList
              data={browse}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 130 }}
              ListEmptyComponent={
                <Text style={styles.subtitle}>
                  {query.trim()
                    ? `No public playlists match "${query.trim()}".`
                    : "No public playlists yet. Make one public to see it here."}
                </Text>
              }
              renderItem={({ item }) => (
                <PlaylistRow item={item} showOwner onPress={() => open(item._id)} />
              )}
            />
          )}
        </View>
      )}

      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={closeCreate}
      >
        <Pressable style={styles.backdrop} onPress={closeCreate} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>New playlist</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor="#888"
            style={styles.input}
            maxLength={60}
            autoFocus
          />

          <Text style={styles.label}>Who can see it?</Text>
          <VisibilityChips value={visibility} onChange={setVisibility} />

          <Text style={styles.hint}>
            {visibility === "private"
              ? "Only you can open it."
              : visibility === "unlisted"
                ? "Anyone with the link can open it. It won't appear in Browse."
                : "Anyone can find it in Browse and save it."}
          </Text>

          {createError ? <Text style={styles.error}>{createError}</Text> : null}

          <Pressable
            onPress={submitCreate}
            disabled={!name.trim() || creating}
            style={[
              styles.primary,
              (!name.trim() || creating) && { opacity: 0.4 },
            ]}
          >
            {creating ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text style={styles.primaryText}>Create playlist</Text>
            )}
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
    padding: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: "#1DB954", fontSize: 28, fontWeight: "bold" },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: { flexDirection: "row", marginVertical: 18 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#262626",
    marginRight: 10,
  },
  tabActive: { backgroundColor: "#1DB954" },
  tabText: { color: "#ddd", fontWeight: "600" },
  section: { color: "#fff", fontSize: 18, fontWeight: "bold", marginVertical: 12 },
  subtitle: { color: "#aaa", marginTop: 10 },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: "#181818",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
  },
  sheetTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 14 },
  label: { color: "#ddd", fontWeight: "600" },
  hint: { color: "#888", fontSize: 12, marginBottom: 14 },
  error: { color: "#ff8b8b", marginBottom: 10 },
  primary: {
    backgroundColor: "#1DB954",
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: "center",
  },
  primaryText: { color: "#111", fontWeight: "bold", fontSize: 15 },
});
