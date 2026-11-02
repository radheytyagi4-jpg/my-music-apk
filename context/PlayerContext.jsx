import {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
} from "react-native-track-player";
import Axios from "axios";
import { getUserId } from "../utils/session";
import { baseUrl } from "../config.js";

const PlayerContext = createContext(null);

const randomLetters = ["a", "x", "m", "dj", "lo", "sa", "re"];

const normalizeSong = (song) => {
  if (!song) return null;

  const title =
    song.title ||
    song.tittle ||
    song.song ||
    song.name ||
    song.song_name ||
    "Unknown Song";

  const artistValue =
    song.artist ||
    song.primary_artists ||
    song.singers ||
    song.primaryArtists ||
    "Unknown Artist";

  return {
    ...song,
    id: String(song.id ?? song.songid ?? title),
    title,
    tittle: title,
    artist: Array.isArray(artistValue)
      ? artistValue.join(", ")
      : artistValue,
    img: song.img || song.image || null,
    audioUrl: song.audioUrl || song.media_url || null,
  };
};

const getRandomQuery = (song) => {
  const title = song?.title || song?.tittle || "";
  const random =
    randomLetters[Math.floor(Math.random() * randomLetters.length)];
  return `${random} ${title}`.trim();
};

const saveRecent = async (song) => {
  try {
    const userId = await getUserId();
    if (!userId) return;

    await Axios.post(`${baseUrl}/recent`, {
      userId,
      song,
    });
  } catch (error) {
    console.log("Save recent error:", error.response?.data || error.message);
  }
};

const fisherYates = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const smartShuffle = (songs) => {
  const groups = {};
  songs.forEach((s) => {
    const key = s.artist || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  const placed = [];
  Object.values(groups).forEach((group) => {
    const g = fisherYates(group);
    const offset = Math.random() / g.length;
    g.forEach((s, i) => {
      placed.push({
        s,
        pos: i / g.length + offset + (Math.random() * 0.2) / g.length,
      });
    });
  });

  return placed.sort((a, b) => a.pos - b.pos).map((p) => p.s);
};

const fetchRecommendations = async (sourceSongs, excludeIds, count) => {
  const picks = fisherYates(sourceSongs).slice(0, 3);
  const found = [];

  for (const s of picks) {
    const artist = (s.artist || "").split(",")[0].trim();
    if (!artist) continue;

    try {
      const res = await Axios.get(`${baseUrl}/songs/search`, {
        params: { q: artist },
      });

      (res.data.data || []).forEach((r) => {
        const normalized = normalizeSong(r);
        const id = normalized?.id;

        if (
          normalized?.audioUrl &&
          !excludeIds.has(id) &&
          !found.some((f) => String(f.id) === id)
        ) {
          found.push({ ...normalized, recommended: true });
        }
      });
    } catch (error) {
      console.log(
        "Recommendation error:",
        error.response?.data || error.message
      );
    }
  }

  return fisherYates(found).slice(0, count);
};

// Convert your song object to TrackPlayer format
const toTrack = (song) => ({
  id: song.id,
  url: song.audioUrl,
  title: song.title || song.tittle || "Unknown Song",
  artist: song.artist || "Unknown Artist",
  artwork: song.img || undefined,
});

export function PlayerProvider({ children }) {
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const song = queue[index];
  const isLoadingNext = useRef(false);

  const shuffleRef = useRef(false);
  const originalRef = useRef([]);
  const indexRef = useRef(-1);
  const sessionRef = useRef(0);
  const playedRef = useRef(new Set());

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
            TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
            TrackPlayer.CAPABILITY_STOP,
          ],
          compactCapabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          ],
        });

        if (isMounted) {
          setIsPlayerReady(true);
        }
      } catch (e) {
        console.log("TrackPlayer setup error:", e);
      }
    };

    setup();

    return () => {
      isMounted = false;
    };
  }, []);

  const startPlayback = async (list, i) => {
    if (!isPlayerReady) return;

    const normalizedList = list.map(normalizeSong);
    const selectedSong = normalizedList[i];

    if (!selectedSong?.audioUrl) {
      console.log("Cannot play song: audio URL is missing", selectedSong);
      return;
    }

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(normalizedList.map(toTrack));
      await TrackPlayer.skip(i);
      await TrackPlayer.play();
    } catch (error) {
      console.log("Audio playback error:", error);
      return;
    }

    playedRef.current.add(String(selectedSong.id));
    setQueue(normalizedList);
    setIndex(i);
    saveRecent(selectedSong);
  };

  const injectRecommendations = async (baseList) => {
    const session = ++sessionRef.current;
    const exclude = new Set(baseList.map((s) => String(s.id)));
    const count = Math.min(5, Math.max(1, Math.floor(baseList.length / 3)));

    const recs = await fetchRecommendations(baseList, exclude, count);

    if (!recs.length || session !== sessionRef.current || !shuffleRef.current) {
      return;
    }

    setQueue((prev) => {
      const out = [...prev];
      recs.forEach((r, k) => {
        const at = Math.min(indexRef.current + 3 + k * 4, out.length);
        out.splice(at, 0, r);
      });
      return out;
    });
  };

  const playSong = (songsOrSong, requestedIndex = 0) => {
    const isPlaylist = Array.isArray(songsOrSong);
    const list = (isPlaylist ? songsOrSong : [songsOrSong])
      .filter(Boolean)
      .map(normalizeSong);
    const selectedIndex = isPlaylist ? requestedIndex : 0;

    if (!list[selectedIndex]?.audioUrl) {
      console.log("Cannot play song: audio URL is missing", list[selectedIndex]);
      return;
    }

    originalRef.current = list;

    if (shuffleRef.current) {
      const first = list[selectedIndex];
      const rest = smartShuffle(
        list.filter((_, k) => k !== selectedIndex)
      );
      startPlayback([first, ...rest], 0);
      injectRecommendations(list);
    } else {
      sessionRef.current++;
      startPlayback(list, selectedIndex);
    }
  };

  const toggleShuffle = () => {
    const turningOn = !shuffleRef.current;
    shuffleRef.current = turningOn;
    setShuffle(turningOn);

    if (!song) return;

    if (turningOn) {
      const base = queue.filter((s) => !s.recommended);
      originalRef.current = base;

      const rest = smartShuffle(base.filter((s) => s.id !== song.id));
      setQueue([song, ...rest]);
      setIndex(0);
      injectRecommendations(base);
    } else {
      sessionRef.current++;
      const original = originalRef.current;
      const at = original.findIndex((s) => s.id === song.id);

      if (at === -1) {
        setQueue([song, ...original]);
        setIndex(0);
      } else {
        setQueue(original);
        setIndex(at);
      }
    }
  };

  const toggle = async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const fetchFreshSongs = async (currentSong, currentQueue) => {
    const seen = new Set([
      ...playedRef.current,
      ...currentQueue.map((s) => String(s.id)),
    ]);

    try {
      const response = await Axios.get(`${baseUrl}/songs/discover`, {
        params: { count: 12 },
      });

      const fresh = (response.data.data || [])
        .map(normalizeSong)
        .filter((item) => item?.audioUrl && !seen.has(String(item.id)));

      if (fresh.length > 0) return smartShuffle(fresh);
    } catch (error) {
      console.log(
        "Discover error:",
        error.response?.data || error.message
      );
    }

    const firstArtist = (s) => (s?.artist || "").split(",")[0].trim();
    const artists = currentQueue.map(firstArtist).filter(Boolean);
    const randomArtist = artists[Math.floor(Math.random() * artists.length)];

    const queries = [
      firstArtist(currentSong),
      randomArtist,
      getRandomQuery(currentSong),
    ].filter(Boolean);

    for (const q of queries) {
      try {
        const response = await Axios.get(`${baseUrl}/songs/search`, {
          params: { q },
        });

        const fresh = (response.data.data || [])
          .map(normalizeSong)
          .filter((item) => item?.audioUrl && !seen.has(String(item.id)));

        if (fresh.length > 0) return smartShuffle(fresh);
      } catch (error) {
        console.log(
          "Fresh songs error:",
          error.response?.data || error.message
        );
      }
    }

    return [];
  };

  const next = async () => {
    if (index < queue.length - 1) {
      await TrackPlayer.skipToNext();
      setIndex((prev) => prev + 1);
      return;
    }

    if (!song || isLoadingNext.current) return;

    isLoadingNext.current = true;

    try {
      const fresh = await fetchFreshSongs(song, queue);

      if (fresh.length > 0) {
        const newQueue = [...queue, ...fresh];
        setQueue(newQueue);
        await TrackPlayer.add(fresh.map(toTrack));
        await TrackPlayer.skipToNext();
        setIndex(queue.length);
      }
    } finally {
      isLoadingNext.current = false;
    }
  };

  const previous = async () => {
    if (index > 0) {
      await TrackPlayer.skipToPrevious();
      setIndex((prev) => prev - 1);
    }
  };

  const seek = async (seconds) => {
    await TrackPlayer.seekTo(seconds);
  };

  // Auto next when track ends
  useEffect(() => {
    const listener = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      () => {
        next();
      }
    );

    return () => listener.remove();
  }, [index, queue]);

  const isPlaying = playbackState.state === State.Playing;
  const isBuffering =
    playbackState.state === State.Buffering ||
    playbackState.state === State.Connecting;

  return (
    <PlayerContext.Provider
      value={{
        song,
        isPlaying,
        isBuffering,
        playbackError: null,
        position: progress.position,
        duration: progress.duration,
        shuffle,
        playSong,
        toggle,
        toggleShuffle,
        next,
        previous,
        seek,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);