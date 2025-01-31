import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Button from '../components/Button.js';
import client, { mqttState } from '../backend/receive.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
    const [status, setStatus] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (client === 'connected') {
            setStatus('MQTT is ready !');
        } else if (client === 'disconnected') {
            setStatus('MQTT is not ready !');
        }
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('loggedInUser');
        navigation.replace('Login');
    };

    if (user === null) {
        return (
            <View style={styles.container}>
                <Text>Loading user...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Button title={`MQTT is ${mqttState.status}`} />
                <Text style={styles.pageTitle}>{`Bienvenue ${user.username}, ${user.role}`}</Text>

                {user?.role === "gerant" ? (
                    <Text style={styles.text}>{`${user.username} s'est pris un obstacle à HEURE`}</Text>
                ) : user?.role === "patient" ? (
                    <View style={styles.squareContainer}>
                        <View style={styles.square}>
                            <Text style={styles.squareText}>Fauteuils disponibles</Text>
                            {/* <Image source={require('../assets/fauteuil.svg')} /> */}
                        </View>
                    </View>
                ) : (
                    <>
                        <Text style={styles.pageTitle}>Accès restreint</Text>
                        <Text style={styles.text}>Veuillez vous connecter.</Text>
                    </>
                )}
            </ScrollView>

            {/* Bouton de déconnexion fixé en bas */}
            <View style={styles.logoutContainer}>
                <Button title="Déconnexion" onPress={handleLogout} style={styles.logoutButton} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 10,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    pageTitle: {
        marginTop: 40,
        marginLeft: 10,
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },
    text: {
        marginLeft: 10,
        fontSize: 20,
        marginVertical: 10,
        color: 'black',
    },
    squareContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    square: {
        width: '90%',
        height: 100,
        borderRadius: 10,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
    },
    squareText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    logoutContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    logoutButton: {
        backgroundColor: '#c71836',
        width: '90%',
    },
});

export default ProfileScreen;
