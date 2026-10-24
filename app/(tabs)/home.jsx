
import { View, Text, StyleSheet } from "react-native";
import { SongCard } from "../../components/SongCard.jsx";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Home</Text>
      <SongCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1DB954",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
});
