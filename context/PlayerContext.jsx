import { createContext, useEffect, useState, useContext } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio"

const PlayerContext = createContext(null);

export function PlayerProvider({children}){
    const player = useAudioPlayer(null);
    const status = useAudioPlayerStatus(player);
    const [queue, setQueue] = useState([]);
    const [index, setIndex] = useState(-1);

    const song = queue[index];

    const playSong = (list, i)=> {
        setQueue(list);
        setIndex(i);
        player.replace({uri: lsit[i].audioUrl})
        player.play();
    };

    const toggle = () => ( status.playing ? "pause" : "play");
    const next = () => {
         if( index < queue.length -1 ){
             playSong(queue, index + 1)
             }
        }
    const previous = () => {
        if( index > 0 ){
            playSong(queue, index -1)
        }
    };

    useEffect(()=>{
        if(status.didJustFinish) next();
    },[ status.didJustFinish])

    return (
        <PlayerContext.Provider
        value={{song, isPlaying: status.playing, toggle, next, previous}}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);