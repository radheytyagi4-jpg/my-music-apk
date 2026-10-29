import {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import Axios from "axios";
import { getUserId } from "../utils/session";
import { baseUrl } from "../config.js";

const PlayerContext = createContext(null);

const randomLetters = ["a", "x", "m", "dj", "lo", "sa", "re"];

const getRandomQuery = (song) => {
  const title = song?.tittle || song?.title || "";
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

export function PlayerProvider({ children }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);

  const song = queue[index];
  const isLoadingNext = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch((error) => {
      console.log("Audio mode error:", error);
    });
  }, []);

  const playSong = (list, i) => {
    if (!list?.[i]?.audioUrl) return;

    const selectedSong = list[i];

    setQueue(list);
    setIndex(i);

    player.replace({ uri: selectedSong.audioUrl });

    // player.setActiveForLockScreen(true, {
    //   title: selectedSong.title || selectedSong.tittle || "Unknown Song",
    //   artist: selectedSong.artist || "Unknown Artist",
    //   artworkUrl: selectedSong.image || selectedSong.img,
    // });

    player.play();
    saveRecent(selectedSong);
  };

  const toggle = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const fetchRelatedSongs = async (currentSong) => {
    try {
      const response = await Axios.get(`${baseUrl}/songs/search`, {
        params: { q: getRandomQuery(currentSong) },
      });

      const results = response.data.data || [];

      return results.filter(
        (item) =>
          item.audioUrl &&
          String(item.id) !== String(currentSong?.id)
      );
    } catch (error) {
      console.log(
        "Related songs error:",
        error.response?.data || error.message
      );
      return [];
    }
  };

  const next = async () => {
    if (index < queue.length - 1) {
      playSong(queue, index + 1);
      return;
    }

    if (!song || isLoadingNext.current) return;

    isLoadingNext.current = true;

    try {
      const relatedSongs = await fetchRelatedSongs(song);

      if (relatedSongs.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * relatedSongs.length
        );

        playSong(relatedSongs, randomIndex);
      }
    } finally {
      isLoadingNext.current = false;
    }
  };

  const previous = () => {
    if (index > 0) {
      playSong(queue, index - 1);
    }
  };

  const seek = (seconds) => {
    player.seekTo(seconds);
  };

  useEffect(() => {
    if (status.didJustFinish) {
      next();
    }
  }, [status.didJustFinish]);

  return (
    <PlayerContext.Provider
      value={{
        song,
        isPlaying: status.playing,
        position: status.currentTime,
        duration: status.duration,
        playSong,
        toggle,
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