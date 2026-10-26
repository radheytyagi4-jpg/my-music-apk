import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react'
import { saveUserId } from "../utils/session";
import { TextInput, Image, useWindowDimensions } from 'react-native'
import { Text, View, StyleSheet, Pressable } from 'react-native'

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("")
    const [error, setError] = useState(null);
    const { width, height } = useWindowDimensions();

    const api = axios.create({
        baseURL: 'http://localhost:4000/api/v1',
        headers: {
            "Content-Type": "application/json"
        }
    });

    const router = useRouter();

    async function handleRegister() {
        try {
            const response = await api.post("/users/register", {
                name,
                email,
            });

            console.log(response.data);

            await saveUserId(response.data.data.id);
            router.replace("/home");
        } catch (error) {
            console.log(error.response?.data || error.message);
            setError(error.response?.data?.message || error.message || "Registration failed");
        }
    }
    return (
        <View style={[styles.container, { width, height }]}>
            <Image
                source={require('../assets/register-bg.png')}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width,
                    height,
                    resizeMode: 'cover'
                }}
            />
            <Text style={{
                marginBottom: 20, fontSize: 28,
                fontWeight: "bold", color: '#1DB954'
            }}>Register Now</Text>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder='Name' value={name} onChangeText={(name) => setName(name)} />
                <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={(email) => setEmail(email)} />
                <Pressable style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed
                ]} onPress={handleRegister}><Text style={{ color: '#fff' }}>Register</Text></Pressable>
                {error ? (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
                ) : null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#111',
        overflow: 'hidden'
    },
    form: {
        borderColor: "#1DB954",
        borderWidth: 1,
        padding: 17,
        borderRadius: 5,
        backgroundColor: 'rgba(10, 30, 15, 0.75)'
    },
    input: {
        backgroundColor: "#f7f1e3d8",
        color: '#111',
        fontSize: 15,
        padding: 10,
        borderRadius: 5,
        margin: 5
    },
    button: {
        padding: 10,
        width: 70,
        borderRadius: 5,
        margin: 5,
        marginLeft: 60,
        backgroundColor: '#1c4d18'
    },
    buttonPressed: {
    backgroundColor: '#1a8540', 
    transform: [{ scale: 0.95 }], 
    opacity: 0.85
},
})
export default Register