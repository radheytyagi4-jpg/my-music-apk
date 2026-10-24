
import { View, Text, StyleSheet } from "react-native";

export default function Recent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recently Played</Text>
      <Text style={styles.subtitle}>
        Your listening history will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#aaa",
    marginTop: 10,
  },
});
