import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { getUserId } from "../utils/session.js";

export default function Index() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    getUserId()
      .then((id) => setTarget(id ? "/home" : "/Register"))
      .catch(() => setTarget("/Register"));
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, backgroundColor: "#111", justifyContent: "center" }}>
        <ActivityIndicator color="#1DB954" />
      </View>
    );
  }

  return <Redirect href={target} />;
}