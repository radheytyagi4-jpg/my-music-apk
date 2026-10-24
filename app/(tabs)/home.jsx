import {Text, View} from 'react-native'
import {SongCard} from '../../components/SongCard.jsx'

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Home</Text>
        <SongCard style={styles.card}/>
    </View>
  )
}

const styles = {
  container: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
    padding: 20,
  },
  card: {
    margin:20,
    padding: 10,
  },
}