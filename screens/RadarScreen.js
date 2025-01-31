import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Audio } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from '../components/Button.js';
import client, { mqttState } from '../backend/receive.js';

const RadarScreen = () => {
    const color = 'black';
    const size = 100;

    // Récupérations de valeurs depuis le backend
    const [status, setStatus] = useState('');
    const [frontDistance, setFrontDistance] = useState('');
    const [backDistance, setBackDistance] = useState('');
    const [pression, setPression] = useState('');

    // Statut de la connexion MQTT
    useEffect(() => {
        if (client === 'connected') {
            setStatus('MQTT is ready !');
        } else if (client === 'disconnected') {
            setStatus('MQTT is not ready !');
        }
    }, [status]);

    // Distances
    useEffect(() => {
        const interval = setInterval(() => {
            setFrontDistance(mqttState.frontDistance);
            setBackDistance(mqttState.backDistance);
            setPression(mqttState.pression);
        }, 1000); // Mettre à jour toutes les secondes

        return () => clearInterval(interval); // Nettoyer l'intervalle à la fin
    }, [mqttState.lastMessage]);

    // Clignotants
    const [clignotant, setClignotant] = useState('off');

    const onLeftPress = () => {
        setClignotant(clignotant === 'left' ? 'off' : 'left');
        console.log('Clignotant gauche');
    };

    const onRightPress = () => {
        setClignotant(clignotant === 'right' ? 'off' : 'right');
        console.log('Clignotant droit');
    };

    const [frontDistancesList, setFrontDistancesList] = useState([0, 5, 15, 30]);
    const [backDistancesList, setBackDistancesList] = useState([0, 5, 15, 30]);

    // Changement de couleur de fond basé sur la distance
    const getBackgroundColor = () => {
        // Fonction pour déterminer la couleur de fond (container) basée sur la distance
        if (mqttState.frontDistance < 5 || mqttState.backDistance < 5) {
            return 'red';
        } else if (mqttState.frontDistance < 15 || mqttState.backDistance < 15) {
            return 'orange';
        } else if (mqttState.frontDistance < 30 || mqttState.backDistance < 30) {
            return 'yellow';
        } else {
            return 'green';
        }
    };

    // Lancement d'un audio si la distance est inférieur ou égal à 15 cm
    useEffect(() => {
        const playSound = async () => {
            if (mqttState.frontDistance <= 15 || mqttState.backDistance <= 15) {
                console.log('Audio alerte');
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/audios/IshakLong.wav'),
                    { shouldPlay: true }
                );
                await sound.playAsync();
            }
        };

        playSound();
    }, [mqttState.frontDistance, mqttState.backDistance]);

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
            <Button title={`MQTT is ${mqttState.status}`} />

            <Text style={styles.pageTitle}>Clignotants</Text>
            <View style={styles.arrowsContainer}>
                <View style={styles.column}>
                    <TouchableOpacity onPress={onLeftPress}>
                        <MaterialCommunityIcons
                            name="arrow-left-circle"
                            color={color}
                            size={size}
                            style={styles.arrowLeft}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.column} />
                <View style={styles.column}>
                    <TouchableOpacity onPress={onRightPress}>
                        <MaterialCommunityIcons
                            name="arrow-right-circle"
                            color={color}
                            size={size}
                            style={styles.arrowRight}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.pageTitle}>Distance obstacle avant</Text>
            <Text style={styles.text}>{mqttState.frontDistance} cm</Text>
            <Text style={styles.pageTitle}>Distance obstacle arrière</Text>
            <Text style={styles.text}>{mqttState.backDistance} cm</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontSize: 50,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },
    arrowsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    arrowLeft: {
        marginLeft: 20,
    },
    arrowRight: {
        marginRight: 20,
    },
});

export default RadarScreen;
