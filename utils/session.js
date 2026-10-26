import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveUserId = (id) => AsyncStorage.setItem("userId", String(id));
export const getUserId = () => AsyncStorage.getItem("userId");