import {View, Text, Image, Pressable} from 'react-native';
import { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';


export function MiniPlayer({img, tittle, artist}){
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(false);
    return(
        <Pressable onPress={() => router.push({pathname: "/Player", params:{img, tittle, artist}})}>    
        <View 
            style={{ flexDirection:'row',width: '100%', height: 50, backgroundColor: 'black', alignItems: 'center'}}>
                <Image source={{uri: img}} style={{width: 35, height: 35, margin:10}} />
                <View style={{flex:1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>{tittle}</Text>
                    <Text style={{color: 'white', fontSize: 10}}>{artist}</Text>
                </View>
                    <Pressable onPress={() => setIsPlaying(!isPlaying)} style={{marginRight: 10}}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="white" />
                    </Pressable>

        </View>
        </Pressable>
    )
}

