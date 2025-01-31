import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import client, { mqttState } from '../backend/receive.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button.js';

const HomeScreen = () => {
    const [status, setStatus] = useState('');
    const [user, setUser] = useState(null);
    const [pression, setPression] = useState(0); // Initialisez la pression avec une valeur par défaut

    useEffect(() => {
        if (client === 'connected') {
            setStatus('MQTT is ready !');
        } else if (client === 'disconnected') {
            setStatus('MQTT is not ready !');
        }
    }, [status]);

    useEffect(() => {
        const getUser = async () => {
            const storedUser = await AsyncStorage.getItem('loggedInUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };
        getUser();
    }, []);

    // Effet pour afficher la valeur de pression dans la console
    useEffect(() => {
        console.log('mqttState:', mqttState);  // Log la structure de mqttState
        if (mqttState && mqttState.pression !== undefined) {
            setPression(mqttState.pression);
            console.log('PRESSION HOMESCREEN:', mqttState.pression);
        }
    }, [mqttState]);

    // Vérification toutes les 0.5 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            if (mqttState && mqttState.pression !== undefined) {
                setPression(mqttState.pression);
                console.log('Updated PRESSURE:', mqttState.pression);
            }
        }, 500); // 500 ms = 0.5 secondes

        return () => clearInterval(interval); // Nettoyage de l'intervalle à la destruction du composant
    }, [mqttState]);

    // Render only if user is available
    if (!user) {
        return (
            <View style={styles.container}>
                <Text>Loading user...</Text>
            </View>
        );
    }

    // Liste de deux fauteuils avec un status (disponible ou pris)
    const wheelchair = [
        { id: 1, status: pression > 0 ? 'unavailable' : 'available', pression },
    ];

    return (
        <View style={styles.container}>
            <Button title={`MQTT is ${mqttState.status}`} />
            <Text style={styles.pageTitle}>{`Bienvenue ${user.username}, ${user.role}`}</Text>

            <Text style={styles.pageTitle}>Fauteuils disponibles</Text>
            <View style={styles.squareContainer}>
                {wheelchair.filter(wheelchair => wheelchair.status === 'available').length > 0 ? (
                    wheelchair.filter(wheelchair => wheelchair.status === 'available').map((wheelchair, index) => (
                        <View style={styles.square} key={index}>
                            <Text style={styles.squareText}>{`Wheelchair ${wheelchair.id}`}</Text>
                            {/* <Text style={styles.squareText}>{`Pres. ${wheelchair.pression}`}</Text> */}
                            {/* <Text style={styles.squareText}>{`${wheelchair.status}`}</Text> */}
                        </View>
                    ))
                ) : (
                    <View style={styles.rectangleFullWidth}>
                        <Text style={styles.squareText}>Pas de fauteuil pris</Text>
                    </View>
                )}
            </View>

            {user?.role === "gerant" && (
                <>
                    <Text style={styles.pageTitle}>Fauteuils pris</Text>
                    <View style={styles.squareContainer}>
                        {wheelchair.filter(wheelchair => wheelchair.status === 'unavailable').length > 0 ? (
                            wheelchair.filter(wheelchair => wheelchair.status === 'unavailable').map((wheelchair, index) => (
                                <View style={styles.square} key={index}>
                                    <Text style={styles.squareText}>{`Wheelchair ${wheelchair.id}`}</Text>
                                    {/* <Text style={styles.squareText}>{`Pres. ${wheelchair.pression}`}</Text> */}
                                    {/* <Text style={styles.squareText}>{`${wheelchair.status}`}</Text> */}
                                </View>
                            ))
                        ) : (
                            <View style={styles.rectangleFullWidth}>
                                <Text style={styles.squareText}>Pas de fauteuil pris</Text>
                            </View>
                        )}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 10,
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
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },
    squareContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginVertical: 10,
        marginLeft: 10,
    },
    rectangleFullWidth: {
        width: '100%',
        height: 100,
        borderRadius: 5,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
    },
    square: {
        width: 100,
        height: 100,
        borderRadius: 5,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    squareText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default HomeScreen;
