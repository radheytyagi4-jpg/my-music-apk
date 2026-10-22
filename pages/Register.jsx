
import { useState } from 'react'
import { TextInput } from 'react-native'
import { Text, View, StyleSheet, Pressable } from 'react-native'

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("")

    function handleRegister(){

        if(name == "" || email == ""){
            alert("fill the all requirments")
        }

        console.log("Name : " , name, ",", "Email :", email)
        setEmail("")
        setName("")
    }
    return (
        <View style={styles.container}>
            <Text style={{marginBottom:20, fontWeight:700, fontSize:20,}}>Register Now</Text>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder='Name' value={name} onChange={(e)=>{setName(e.target.value)}} />
                <TextInput style={styles.input} placeholder='Email' value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
                <Pressable style={styles.button} onPress={()=>handleRegister()}>Register</Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, width: 'screen', height: 'screen',
        justifyContent: 'center', alignItems: 'center'
    },
    form:{
         borderColor: "#000",
        borderWidth: 1,
        padding:17,
        borderRadius:5

    },
    input: {
        backgroundColor: "#3225",
        color: '#fff',
        fontSize: 15,
        padding: 10,
        borderRadius: 5,
        margin: 5
    },
    button:{
        padding: 10,
        width:70,
        borderRadius: 5,
        margin: 5,
        marginLeft:60,
        backgroundColor:'rgba(11, 13, 14, 0.47)'
    }
})
export default Register
