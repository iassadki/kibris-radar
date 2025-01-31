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
    const [frontDistance, setFrontDistance] = useState('');
    const [backDistance, setBackDistance] = useState('');
    const [pression, setPression] = useState('');
    const soundRef = useRef(null); // Référence pour stocker l'objet son
    const [currentRate, setCurrentRate] = useState(1); // État pour suivre la vitesse actuelle du son


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
                if (!soundRef.current) {
                    const { sound } = await Audio.Sound.createAsync(
                        require('../assets/audios/IshakLong.wav'),
                        { isLooping: true }
                    );
                    soundRef.current = sound;
                    await sound.setRateAsync(rate, true);
                    await sound.playAsync();
                } else {
                    if (currentRate !== rate) {
                        await soundRef.current.setRateAsync(rate, true);
                        setCurrentRate(rate);
                    }
                }
            } catch (error) {
                console.error("Erreur de lecture audio:", error);
            }
        };

        if (mqttState.frontDistance < 5 || mqttState.backDistance < 5) {
            playSound(2); // Jouer en accéléré si distance < 5 cm
        } else if (mqttState.frontDistance < 15 || mqttState.backDistance < 15) {
            playSound(1); // Jouer normalement si distance entre 5 et 15 cm
        } else {
            if (soundRef.current) {
                soundRef.current.stopAsync();
                soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        }

        return () => {
            if (soundRef.current) {
                soundRef.current.stopAsync();
                soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        };
    }, [mqttState.frontDistance, mqttState.backDistance]);

    // Pour la pression
    useEffect(() => {
        if (pression > 0) {
            console.log("La fauteuil est pris")
        } else if (pression <= 0) {
            console.log("La fauteuil est de nouveau disponible")
        }
    }, [pression]);


    // Clignotants
    const [clignotantDroit, setClignotantDroit] = useState(false);
    const [clignotantGauche, setClignotantGauche] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);

    // 
    const onLeftPress = () => {
        setClignotantDroit(false); // Désactive le droit si actif
        setClignotantGauche(!clignotantGauche); // Toggle le gauche
        console.log('Clignotant gauche:', !clignotantGauche ? 'activé' : 'désactivé');
    };

    const onRightPress = () => {
        setClignotantGauche(false); // Désactive le gauche si actif
        setClignotantDroit(!clignotantDroit); // Toggle le droit
        console.log('Clignotant droit:', !clignotantDroit ? 'activé' : 'désactivé');
    };

    // Lancement du bruit lors du clic du clignotant droit
    // Effet pour gérer le clignotement et le son
    useEffect(() => {
        let interval;
        if (clignotantDroit || clignotantGauche) {
            interval = setInterval(() => {
                setIsBlinking(prev => !prev);
                console.log('ISHAK'); // Ajout du son ici
            }, 500);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
                setIsBlinking(false);
            }
        };
    }, [clignotantDroit, clignotantGauche]);

    // Supprimez l'autre useEffect pour le son car nous l'avons intégré ci-dessus

    // Modifiez la fonction getArrowColor pour utiliser un vert foncé quand actif
    const getArrowColor = (side) => {
        if ((side === 'left' && clignotantGauche) || (side === 'right' && clignotantDroit)) {
            return isBlinking ? '#004d00' : '#00ff00'; // Alterne entre vert foncé et vert clair
        }
        return 'black';
    };

    useEffect(() => {
        if (pression > 0) {
            console.log("La fauteuil est pris")
        } else if (pression <= 0) {
            console.log("La fauteuil est de nouveau disponible")
        }
    }, [pression]);


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

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
            <Button title={`MQTT is ${mqttState.status}`} />

            <Text style={styles.pageTitle}>Clignotants</Text>
            <View style={styles.arrowsContainer}>
                <View style={styles.column}>
                    <TouchableOpacity onPress={onLeftPress}>
                        <MaterialCommunityIcons
                            name="arrow-left-circle"
                            color={getArrowColor('left')}
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
                            color={getArrowColor('right')}
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
