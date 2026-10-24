// import jpg from "../assets"
import { Text, View, Image, ScrollView } from 'react-native'

export function SongCard() {

  const music = [{ title: 'Song 1', artist: 'Artist 1', img:require("../assets/dan-begel-X2IppAGHlMQ-unsplash.jpg") }, { title: 'Song 2', artist: 'Artist 2', img:require("../assets/fabio-sasso-Gi-HkcQRyfE-unsplash.jpg") }, { title: 'Song 3', artist: 'Artist 3', img:require("../assests/insung-yoon-PJLdikFrvT8-unsplash.jpg") }]

    return (
      <ScrollView 
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}
        >
          {music.map((song)=>(
            <View key={song.title} style={{ width: '48%', marginBottom: 10, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden' }}>
              <Image source={song.img} style={{ width: '100%', height: 150 }} />
              <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{song.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{song.artist}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
    )
  }
