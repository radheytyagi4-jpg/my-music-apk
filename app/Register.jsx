import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react'
import { TextInput } from 'react-native'
import { Text, View, StyleSheet, Pressable } from 'react-native'

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("")
    const [error, setError] = useState(null);

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

            // Navigate to Home after successful registration
            router.replace("/home");
        } catch (error) {
            console.log(error.response?.data || error.message);
            setError(error.response?.data?.message || error.message || "Registration failed");
        }
    }
    return (
        <View style={styles.container}>
            <Text style={{
                marginBottom: 20, fontSize: 28,
                fontWeight: "bold", color: '#2F5D50'
            }}>Register Now</Text>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder='Name' value={name} onChangeText={(name) => setName(name)} />
                <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={(email) => setEmail(email)} />
                <Pressable style={styles.button} onPress={() => handleRegister(name, email)}><Text style={{ color: '#fff' }}>Register</Text></Pressable>
                {error ? (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
                ) : null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, width: 'screen', height: 'screen',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F7F1E3'
    },
    form: {
        borderColor: "#000",
        borderWidth: 1,
        padding: 17,
        borderRadius: 5,
        backgroundColor: '#2F5D50'

    },
    input: {
        backgroundColor: "#F7F1E3",
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
        backgroundColor: '#7A5230'
    }
})
export default Register
