import {View, Text, Image, Pressable} from 'react-native';
import { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { usePlayer } from '../context/PlayerContext.jsx';


export function MiniPlayer(){
    const router = useRouter();
    const { song, toggle, isPlaying } = usePlayer();

    if(!song) return null;
    
    return(
        <Pressable onPress={() => router.push("/Player")}>    
        <View 
            style={{ flexDirection:'row',width: '100%', height: 50, backgroundColor: 'black', alignItems: 'center'}}>
                <Image source={{uri: song.img}} style={{width: 35, height: 35, margin:10}} />
                <View style={{flex:1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>{song.tittle}</Text>
                    <Text style={{color: 'white', fontSize: 8}}>{song.artist}</Text>
                </View>
                    <Pressable onPress={() => toggle()} style={{marginRight: 10}}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="white" />
                    </Pressable>

        </View>
        </Pressable>
    )
}

