import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from '../components/Button.js';
import client, { mqttState } from '../backend/receive.js';

const RadarScreen = () => {
    const color = 'black';
    const size = 100;

    const [status, setStatus] = useState('');

    useEffect(() => {
        if (client === 'connected') {
            setStatus('MQTT is ready !');
        } else if (client === 'disconnected') {
            setStatus('MQTT is not ready !');
        }
    }, [status]);

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

    const [frontDistance, setFrontDistance] = useState('');
    const [backDistance, setBackDistance] = useState('');

    // Fonction pour déterminer la couleur de fond basée sur la distance
    const getBackgroundColor = () => {
        // On vérifie les distances avant et arrière et on retourne la couleur appropriée
        const front = frontDistancesList;
        const back = backDistancesList;

        // On compare les distances. On doit retrouver la plus faible distance entre frontDistanceList et backDistanceList
        const minFront = Math.min(...front);
        const minBack = Math.min(...back);

        // On retourne la couleur en fonction de la distance minimale
        if (minFront <= 5 || minBack <= 5) {
            return 'red';
        } else if (minFront <= 15 || minBack <= 15) {
            return 'orange';
        } else if (minFront <= 30 || minBack <= 30) {
            return 'green';
        } else {
            return 'white';
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
            <Text style={styles.text}>{frontDistancesList[3]} cm</Text>
            <Text style={styles.pageTitle}>Distance obstacle arrière</Text>
            <Text style={styles.text}>{backDistancesList[2]} cm</Text>
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
