import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from '../components/Button.js';
import client, { mqttState } from '../services/mqtt_service.js';

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

    return (
        <View style={styles.container}>
            <Button title={`MQTT is ${mqttState.status}`} />

            <Text style={styles.pageTitle}>Clignotants</Text>
            <View style={styles.arrowsContainer}>
                <View style={styles.column}>
                    <MaterialCommunityIcons name="arrow-left-circle" color={color} size={size} style={styles.arrowLeft} />
                </View>
                <View style={styles.column} />
                <View style={styles.column}>
                    <MaterialCommunityIcons name="arrow-right-circle" color={color} size={size} style={styles.arrowRight} />
                </View>
            </View>
            {/* <View style={styles.distanceContainer}> */}
                <Text style={styles.pageTitle}>Distance obstacle avant</Text>
                <Text style={styles.text}>0 cm</Text>
            {/* </View> */}
            {/* <View style={styles.distanceContainer}> */}
                <Text style={styles.pageTitle}>Distance obstacle arrière</Text>
                <Text style={styles.text}>0 cm</Text>
            {/* </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 10,
    },

    // pageTitle: {
    //     marginTop: 20, // Réduire la marge supérieure pour rapprocher le titre des clignotants
    //     marginLeft: 10,
    //     fontSize: 25,
    //     fontWeight: 'bold',
    //     marginVertical: 5, // Réduire la marge verticale
    //     color: 'black',
    //     textAlign: 'center',
    // },

    pageTitle: {
        marginTop: 40,
        marginLeft: 10,
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },

    // text: {
    //     marginLeft: 10,
    //     fontSize: 20,
    //     fontWeight: 'bold',
    //     marginVertical: 10,
    //     color: 'black',
    //     textAlign: 'center',
    // },

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
        width: '100%', // Ajuster la largeur pour centrer les flèches
        marginVertical: 20, // Ajouter une marge verticale pour espacer les sections
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    distanceContainer: {
        alignItems: 'center',
        marginVertical: 30, // Ajouter une marge verticale pour espacer les sections
    },
    arrowLeft: {
        marginLeft: 20, // Aligner à gauche
    },
    arrowRight: {
        marginRight: 20, // Aligner à droite
    },
});

export default RadarScreen;