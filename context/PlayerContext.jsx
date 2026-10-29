import { createContext, useEffect, useState, useContext } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio"
import Axios from "axios";
import { getUserId } from "../utils/session";
import { baseurl } from "../config.js"

const saveRecent = async (song) => {
    try {
        const userId = await getUserId();
        if (!userId) return;
        await Axios.post( baseurl , { userId, song });
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
    const next = async () => {
        if (index < queue.length - 1) {
            playSong(queue, index + 1);
            return;
        }

        if (!song) return;

        const related = await fetchRelatedSongs(song);

        if (related.length > 0) {
            const shuffled = related.sort(() => Math.random() - 0.5);
            playSong(shuffled, 0);
        }
    };
    const previous = () => {
        if (index > 0) {
            playSong(queue, index - 1)
        }
    };

    useEffect(() => {
        if (status.didJustFinish) next();
    }, [status.didJustFinish])

    const fetchRelatedSongs = async (song) => {
        try {
            const getRandomQuery = (song) => {
                const title = song?.tittle || song?.title || "";

                const randomLetters = ["a", "x", "m", "dj", "lo", "sa", "re"];

                const random =
                    randomLetters[Math.floor(Math.random() * randomLetters.length)];

                return `${random} ${title}`;
            };
            const response = await Axios.get(
                "http://localhost:4000/api/v1/songs/search",
                {
                    params: { q: getRandomQuery(song) }
                }
            );

            const songs = response.data.data || [];

            const currentTitle = song.tittle?.toLowerCase().trim();

            const differentSongs = songs.filter(
                (item) =>
                    item.audioUrl &&
                    item.tittle?.toLowerCase().trim() !== currentTitle
            );


            return differentSongs.sort(() => Math.random() - 0.5);
        } catch (error) {
            console.log("Related songs error:", error.message);
            return [];
        }
    };

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