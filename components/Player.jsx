import {View, Text, Image} from 'react-native';
import { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";

export function VerticalPlayer({img, title, artist}){
    const [isPlaying, setIsPlaying] = useState(false);
    return(
        <View 
            style={{ flexDirection:'row',width: '100%', height: 50, backgroundColor: 'black', alignItems: 'center'}}>
                <Image source={{uri: img}} style={{width: 35, height: 35, margin:10}} />
                <View style={{flex:1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>{title}</Text>
                    <Text style={{color: 'white', fontSize: 10}}>{artist}</Text>
                </View>
                <View 
                    style={{margin: 10}}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="white" onPress={() => setIsPlaying(!isPlaying)} />
                    </View>

        </View>
    )
}

export function horizontalPlayer(){
    return
}
