import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button.js';
import Input from '../components/Input.js';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        // Liste de comptes fictifs
        const accounts = [
            { username: "ilias", password: "ilias", role: "gerant" },
            { username: "yanis", password: "yanis", role: "patient" },
            { username: "tumay", password: "tumay", role: "patient" }
        ];

        console.log("Users list:", accounts);

        const user = accounts.find(account => account.username === username && account.password === password);
        console.log("User found:", user);

        if (user) {
            await AsyncStorage.setItem('loggedInUser', JSON.stringify(user)); // Stocke l'utilisateur
            console.log("User stored in AsyncStorage:", user);
            navigation.navigate('Home'); // Redirige vers la page Home
        } else {
            Alert.alert("Erreur", "Nom d'utilisateur ou mot de passe incorrect");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <Input
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <Input
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default LoginScreen;
