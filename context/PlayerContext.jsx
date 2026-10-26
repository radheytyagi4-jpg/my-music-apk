import { createContext, useEffect, useState, useContext } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio"
import Axios from "axios";
import { getUserId } from "../utils/session";

const saveRecent = async (song) => {
  try {
    const userId = await getUserId();
    if (!userId) return;
    await Axios.post("http://localhost:4000/api/v1/recent", { userId, song });
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
};

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
    const player = useAudioPlayer(null);
    const status = useAudioPlayerStatus(player);
    const [queue, setQueue] = useState([]);
    const [index, setIndex] = useState(-1);
    const seek = (seconds) => player.seekTo(seconds)

    const song = queue[index];

    const playSong = (list, i) => {
        setQueue(list);
        setIndex(i);
        player.replace({ uri: list[i].audioUrl })
        player.play();
          saveRecent(list[i]);
    };

    const toggle = () => (status.playing ? player.pause() : player.play());
    const next = () => {
        if (index < queue.length - 1) {
            playSong(queue, index + 1)
        }
    }
    const previous = () => {
        if (index > 0) {
            playSong(queue, index - 1)
        }
    };

    useEffect(() => {
        if (status.didJustFinish) next();
    }, [status.didJustFinish])

    return (
        <PlayerContext.Provider
            value={{
                song,
                isPlaying: status.playing,
                position: status.currentTime,
                duration: status.duration,
                playSong, toggle, next, previous, seek,
            }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);