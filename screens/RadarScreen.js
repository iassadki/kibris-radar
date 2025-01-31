import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from '../components/Button.js';
import client, { mqttState } from '../backend/receive.js';
import { Audio } from 'expo-av';


const RadarScreen = () => {
    const color = 'black';
    const size = 100;

    // Récupérations de valeurs depuis le backend
    const [status, setStatus] = useState('');
    const [frontDistance, setFrontDistance] = useState(0);
    const [backDistance, setBackDistance] = useState(0);
    const soundRefDistance = useRef(null); // Référence pour stocker l'objet son
    const [currentRate, setCurrentRate] = useState(1); // Vitesse actuelle du son


    // Statut de la connexion MQTT
    useEffect(() => {
        if (client === 'connected') {
            setStatus('MQTT is ready !');
        } else if (client === 'disconnected') {
            setStatus('MQTT is not ready !');
        }
    }, [status]);

    // Gestion du son en fonction de la distance
    useEffect(() => {
        const playSound = async (rate) => {
            try {
                if (!soundRefDistance.current) {
                    const { sound } = await Audio.Sound.createAsync(
                        require('../assets/audios/IshakLong.wav'),
                        { isLooping: true }
                    );
                    soundRefDistance.current = sound;
                    await sound.setRateAsync(rate, true);
                    await sound.playAsync();
                } else {
                    if (currentRate !== rate) {
                        await soundRefDistance.current.setRateAsync(rate, true);
                        setCurrentRate(rate);
                    }
                }
            } catch (error) {
                console.error("Erreur de lecture audio:", error);
            }
        };

        if (mqttState.frontDistance < 3 || mqttState.backDistance < 3) {
            playSound(2); // Jouer en accéléré si distance < 5 cm
        } else if (mqttState.frontDistance < 8 || mqttState.backDistance < 8) {
            playSound(1); // Jouer normalement si distance entre 5 et 15 cm
        } else {
            if (soundRefDistance.current) {
                soundRefDistance.current.stopAsync();
                soundRefDistance.current.unloadAsync();
                soundRefDistance.current = null;
            }
        }

        return () => {
            if (soundRefDistance.current) {
                soundRefDistance.current.stopAsync();
                soundRefDistance.current.unloadAsync();
                soundRefDistance.current = null;
            }
        };
    }, [mqttState.frontDistance, mqttState.backDistance]);

    // Clignotants
    const [clignotantDroit, setClignotantDroit] = useState(false);
    const [clignotantGauche, setClignotantGauche] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const soundRefCligno = useRef(null);

    const onLeftPress = () => {
        const newState = !clignotantGauche;
        setClignotantDroit(false); // Désactive le droit si actif
        setClignotantGauche(newState); // Toggle le gauche

        // Publish MQTT message based on new state
        if (newState) {
            client.publish("13a20041642063/ledG", "1");
            console.log('MQTT: Left turn signal ON - Published "1" to 13a20041642063/ledG');
        } else {
            client.publish("13a20041642063/ledG", "0");
            console.log('MQTT: Left turn signal OFF - Published "0" to 13a20041642063/ledG');
        }
        console.log('Clignotant gauche:', newState ? 'activé' : 'désactivé');
    };

    const onRightPress = () => {
        const newState = !clignotantDroit;
        setClignotantGauche(false); // Désactive le gauche si actif
        setClignotantDroit(newState); // Toggle le droit

        // Publish MQTT message based on new state
        if (newState) {
            client.publish("13a20041642063/ledD", "1");
            console.log('MQTT: Right turn signal ON - Published "1" to 13a20041642063/ledD');
        } else {
            client.publish("13a20041642063/ledD", "0");
            console.log('MQTT: Right turn signal OFF - Published "0" to 13a20041642063/ledD');
        }
        console.log('Clignotant droit:', newState ? 'activé' : 'désactivé');
    };

    useEffect(() => {
        let interval;
        const playSound = async () => {
            try {
                if (!soundRefCligno.current) {
                    const { sound } = await Audio.Sound.createAsync(
                        require('../assets/audios/clignotant.wav')
                    );
                    soundRefCligno.current = sound;
                }
                await soundRefCligno.current.replayAsync();
            } catch (error) {
                console.log('Failed to play sound', error);
            }
        };

        if (clignotantDroit || clignotantGauche) {
            interval = setInterval(() => {
                setIsBlinking(prev => !prev);
                playSound();
            }, 450); // Intervalle de clignotement
        } else {
            clearInterval(interval);
            setIsBlinking(false);
        }

        return () => {
            clearInterval(interval);
            if (soundRefCligno.current) {
                soundRefCligno.current.unloadAsync();
                soundRefCligno.current = null;
            }
        };
    }, [clignotantDroit, clignotantGauche]);


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

    useEffect(() => {
        const interval = setInterval(() => {
            setFrontDistance(mqttState.frontDistance);
            setBackDistance(mqttState.backDistance);
        }, 500); // Rafraîchit les données toutes les 500ms

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
            <Button title={`MQTT is ${mqttState.status}`} />

            <Text style={styles.pageTitle}>Clignotants</Text>
            <View style={styles.arrowsContainer}>
                <View style={styles.column}>
                    <TouchableOpacity onPress={onLeftPress}>
                        <MaterialCommunityIcons
                            name="arrow-left-circle"
                            color={clignotantGauche === 'left' ? 'green' : color}
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
                            color={clignotantDroit === 'right' ? 'green' : color}
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
        color: "black",
    },
    arrowRight: {
        marginRight: 20,
        color: "black",
    },
});

export default RadarScreen;
