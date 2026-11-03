
import {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";

import TrackPlayer, {
  Event,
  PlaybackState,
  PlayerCommand,
  usePlaybackState,
  useIsPlaying,
  useProgress,
} from "@rntp/player";

import Axios from "axios";
import { getUserId } from "../utils/session";
import { baseUrl } from "../config.js";

const PlayerContext = createContext(null);

const randomLetters = ["a", "x", "m", "dj", "lo", "sa", "re"];

// Prevent setupPlayer from being called more than once.
let playerSetupComplete = false;


// -------------------- SONG NORMALIZATION --------------------

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


// Convert Snoopy song data into V5 MediaItem format.
const toTrack = (song) => ({
  mediaId: String(song.id),
  url: song.audioUrl,
  title: song.title || song.tittle || "Unknown Song",
  artist: song.artist || "Unknown Artist",
  artworkUrl: song.img || undefined,
});


// -------------------- RECENT HISTORY --------------------

const saveRecent = async (song) => {
  try {
    const userId = await getUserId();

    if (!userId) return;

    await Axios.post(`${baseUrl}/recent`, {
      userId,
      song,
    });
  } catch (error) {
    console.log(
      "Save recent error:",
      error.response?.data || error.message
    );
  }
};

const saveSearched = async (song) => {
  try{
    const userId = await getUserId;
    if(!userId) return;

    await Axios.post(`${baseUrl}/searched`, {
      userId,
      song,
    });
  } catch (error) {
    console.log(
      "Save searched error:",
      error.response?.data || error.message
    );
  }
};

// -------------------- SHUFFLE HELPERS --------------------

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

  songs.forEach((song) => {
    const key = song.artist || "unknown";

    if (!groups[key]) groups[key] = [];

    groups[key].push(song);
  });

  const placed = [];

  Object.values(groups).forEach((group) => {
    const shuffled = fisherYates(group);

    const offset = Math.random() / shuffled.length;

    shuffled.forEach((song, i) => {
      placed.push({
        song,
        pos:
          i / shuffled.length +
          offset +
          (Math.random() * 0.2) / shuffled.length,
      });
    });
  });

  return placed
    .sort((a, b) => a.pos - b.pos)
    .map((item) => item.song);
};


// -------------------- RECOMMENDATIONS --------------------

const fetchRecommendations = async (
  sourceSongs,
  excludeIds,
  count
) => {
  const picks = fisherYates(sourceSongs).slice(0, 3);

  const found = [];

  for (const song of picks) {
    const artist = (song.artist || "").split(",")[0].trim();

    if (!artist) continue;

    try {
      const res = await Axios.get(`${baseUrl}/songs/search`, {
        params: { q: artist },
      });

      (res.data.data || []).forEach((rawSong) => {
        const normalized = normalizeSong(rawSong);

        const id = normalized?.id;

        if (
          normalized?.audioUrl &&
          !excludeIds.has(id) &&
          !found.some((item) => String(item.id) === id)
        ) {
          found.push({
            ...normalized,
            recommended: true,
          });
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


// -------------------- PLAYER PROVIDER --------------------

export function PlayerProvider({ children }) {
  const playbackState = usePlaybackState();
  const isPlaying = useIsPlaying();
  const progress = useProgress();

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);

  const [shuffle, setShuffle] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  const queueRef = useRef([]);
  const indexRef = useRef(-1);

  const isLoadingNext = useRef(false);
  const shuffleRef = useRef(true);
  const originalRef = useRef([]);

  const sessionRef = useRef(0);
  const playedRef = useRef(new Set());

  const nextRef = useRef(null);

  const song = queue[index] || null;

  // Keep JS queue and React state synchronized.
  const commitQueue = (newQueue) => {
    queueRef.current = newQueue;
    setQueue(newQueue);
  };


  // -------------------- PLAYER SETUP --------------------

  useEffect(() => {
    if (playerSetupComplete) {
      setIsPlayerReady(true);
      return;
    }

    try {
      TrackPlayer.setupPlayer({
        contentType: "music",
        handleAudioBecomingNoisy: true,
        android: {
          wakeMode: "network",
        },
      });

      TrackPlayer.setCommands({
        capabilities: [
          PlayerCommand.PlayPause,
          PlayerCommand.Next,
          PlayerCommand.Previous,
          PlayerCommand.Stop,
        ],
      });

      playerSetupComplete = true;

      setIsPlayerReady(true);

      console.log("Snoopy Track Player ready!");
    } catch (error) {
      playerSetupComplete = false;

      setPlaybackError(
        error?.message || "Player setup failed"
      );

      console.log("TrackPlayer setup error:", error);
    }
  }, []);


  // -------------------- START PLAYBACK --------------------

  const startPlayback = (list, selectedIndex = 0) => {
    if (!isPlayerReady) {
      console.log("TrackPlayer is not ready yet.");
      return;
    }

    const normalizedList = list
      .map(normalizeSong)
      .filter((item) => item?.audioUrl);

    const selectedSong = normalizedList[selectedIndex];

    if (!selectedSong) {
      console.log("Cannot play song: audio URL is missing.");
      return;
    }

    try {
      commitQueue(normalizedList);

      indexRef.current = selectedIndex;
      setIndex(selectedIndex);

      setPlaybackError(null);

      TrackPlayer.setMediaItems(
        normalizedList.map(toTrack),
        selectedIndex
      );

      TrackPlayer.play();

      playedRef.current.add(String(selectedSong.id));

      saveRecent(selectedSong);
    } catch (error) {
      setPlaybackError(
        error?.message || "Could not start playback"
      );

      console.log("Audio playback error:", error);
    }
  };


  // -------------------- PLAY SONG --------------------

  const playSong = (songsOrSong, requestedIndex = 0) => {
    const isPlaylist = Array.isArray(songsOrSong);

    const rawList = (
      isPlaylist ? songsOrSong : [songsOrSong]
    )
      .filter(Boolean)
      .map(normalizeSong);

    const requestedSong = rawList[requestedIndex];

    if (!requestedSong?.audioUrl) {
      console.log(
        "Cannot play song: audio URL is missing",
        requestedSong
      );
      return;
    }

    const selectedIndex = rawList
      .slice(0, requestedIndex)
      .filter((item) => item?.audioUrl).length;

    const list = rawList.filter((item) => item?.audioUrl);

    originalRef.current = list;

    if (shuffleRef.current) {
      const first = list[selectedIndex];

      const rest = smartShuffle(
        list.filter((_, i) => i !== selectedIndex)
      );

      startPlayback([first, ...rest], 0);

      injectRecommendations(list);
    } else {
      sessionRef.current++;

      startPlayback(list, selectedIndex);
    }
  };


  // -------------------- SHUFFLE TOGGLE --------------------

  const toggleShuffle = () => {
    const turningOn = !shuffleRef.current;

    shuffleRef.current = turningOn;

    setShuffle(turningOn);

    const currentQueue = queueRef.current;
    const currentIndex = indexRef.current;
    const currentSong = currentQueue[currentIndex];

    if (!currentSong) return;

    if (turningOn) {
      const base = currentQueue.filter(
        (item) => !item.recommended
      );

      originalRef.current = base;

      const rest = smartShuffle(
        base.filter(
          (item) => item.id !== currentSong.id
        )
      );

      startPlayback([currentSong, ...rest], 0);

      injectRecommendations(base);
    } else {
      sessionRef.current++;

      const original = originalRef.current;

      const at = original.findIndex(
        (item) => item.id === currentSong.id
      );

      if (at === -1) {
        startPlayback([currentSong, ...original], 0);
      } else {
        startPlayback(original, at);
      }
    }
  };


  // -------------------- INJECT RECOMMENDATIONS --------------------

  const injectRecommendations = async (baseList) => {
    const session = ++sessionRef.current;

    const exclude = new Set(
      baseList.map((item) => String(item.id))
    );

    const count = Math.min(
      5,
      Math.max(1, Math.floor(baseList.length / 3))
    );

    const recs = await fetchRecommendations(
      baseList,
      exclude,
      count
    );

    if (
      !recs.length ||
      session !== sessionRef.current ||
      !shuffleRef.current
    ) {
      return;
    }

    const updatedQueue = [...queueRef.current];

    recs.forEach((item, k) => {
      const at = Math.min(
        indexRef.current + 3 + k * 4,
        updatedQueue.length
      );

      updatedQueue.splice(at, 0, item);

      TrackPlayer.insertMediaItems(at, [toTrack(item)]);
    });

    commitQueue(updatedQueue);
  };


  // -------------------- PLAY / PAUSE --------------------

  const toggle = () => {
    if (!isPlayerReady) return;

    if (isPlaying) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };


  // -------------------- FETCH FRESH SONGS --------------------

  const fetchFreshSongs = async (currentSong, currentQueue) => {
    const seen = new Set([
      ...playedRef.current,
      ...currentQueue.map((item) => String(item.id)),
    ]);

    try {
      const response = await Axios.get(
        `${baseUrl}/songs/discover`,
        {
          params: { count: 12 },
        }
      );

      const fresh = (response.data.data || [])
        .map(normalizeSong)
        .filter(
          (item) =>
            item?.audioUrl &&
            !seen.has(String(item.id))
        );

      if (fresh.length > 0) {
        return smartShuffle(fresh);
      }
    } catch (error) {
      console.log(
        "Discover error:",
        error.response?.data || error.message
      );
    }

    const firstArtist = (item) =>
      (item?.artist || "").split(",")[0].trim();

    const artists = currentQueue
      .map(firstArtist)
      .filter(Boolean);

    const randomArtist =
      artists.length > 0
        ? artists[Math.floor(Math.random() * artists.length)]
        : "";

    const queries = [
      firstArtist(currentSong),
      randomArtist,
      getRandomQuery(currentSong),
    ].filter(Boolean);

    for (const query of queries) {
      try {
        const response = await Axios.get(
          `${baseUrl}/songs/search`,
          {
            params: { q: query },
          }
        );

        const fresh = (response.data.data || [])
          .map(normalizeSong)
          .filter(
            (item) =>
              item?.audioUrl &&
              !seen.has(String(item.id))
          );

        if (fresh.length > 0) {
          return smartShuffle(fresh);
        }
      } catch (error) {
        console.log(
          "Fresh songs error:",
          error.response?.data || error.message
        );
      }
    }

    return [];
  };


  // -------------------- NEXT SONG --------------------

  const next = async () => {
    const currentQueue = queueRef.current;
    const currentIndex = indexRef.current;

    if (currentIndex < currentQueue.length - 1) {
      TrackPlayer.skipToNext();
      return;
    }

    const currentSong = currentQueue[currentIndex];

    if (!currentSong || isLoadingNext.current) return;

    isLoadingNext.current = true;

    try {
      const fresh = await fetchFreshSongs(
        currentSong,
        currentQueue
      );

      if (fresh.length > 0) {
        const newQueue = [...currentQueue, ...fresh];

        const nextIndex = currentQueue.length;

        commitQueue(newQueue);

        TrackPlayer.addMediaItems(
          fresh.map(toTrack)
        );

        indexRef.current = nextIndex;
        setIndex(nextIndex);

        TrackPlayer.skipToNext();
        TrackPlayer.play();

        fresh.forEach((item) => {
          playedRef.current.add(String(item.id));
        });
      }
    } catch (error) {
      console.log("Next song error:", error);
    } finally {
      isLoadingNext.current = false;
    }
  };


  // -------------------- PREVIOUS SONG --------------------

  const previous = () => {
    if (indexRef.current > 0) {
      TrackPlayer.skipToPrevious();
    }
  };


  // -------------------- SEEK --------------------

  const seek = (seconds) => {
    TrackPlayer.seekTo(seconds);
  };


  // Keep the latest next function available to the event listener.
  nextRef.current = next;


  // -------------------- TRACK PLAYER EVENTS --------------------

  useEffect(() => {
    if (!isPlayerReady) return;

    const transitionListener = TrackPlayer.addEventListener(
      Event.MediaItemTransition,
      ({ index: newIndex }) => {
        indexRef.current = newIndex;
        setIndex(newIndex);
      }
    );

    const stateListener = TrackPlayer.addEventListener(
      Event.PlaybackStateChanged,
      ({ state }) => {
        if (state === PlaybackState.Ended) {
          nextRef.current?.();
        }
      }
    );

    const errorListener = TrackPlayer.addEventListener(
      Event.PlaybackError,
      ({ code, message }) => {
        const errorMessage = `${code}: ${message}`;

        setPlaybackError(errorMessage);

        console.log("Playback error:", errorMessage);
      }
    );

    return () => {
      transitionListener.remove();
      stateListener.remove();
      errorListener.remove();
    };
  }, [isPlayerReady]);


  // -------------------- PLAYER STATUS --------------------

  const isBuffering =
    playbackState === PlaybackState.Buffering;


  return (
    <PlayerContext.Provider
      value={{
        song,

        isPlaying,
        isBuffering,
        playbackError,

        position: progress.position,
        duration: progress.duration,

        shuffle,

        playSong,
        toggle,
        toggleShuffle,
        next,
        previous,
        seek,
        saveSearched
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}


// -------------------- CUSTOM HOOK --------------------

export const usePlayer = () => useContext(PlayerContext);
