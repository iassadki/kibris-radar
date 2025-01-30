import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import client, { mqttState } from '../services/mqtt_service.js';
import Button from '../components/Button.js';

const HomeScreen = () => {
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
            <Text style={styles.pageTitle}>Fauteils disponibles</Text>
            <View style={styles.squareContainer}>
                <View style={styles.square}>
                    <Text style={styles.squareText}>Disponible 1</Text>
                </View>
                <View style={styles.square}>
                    <Text style={styles.squareText}>Disponible 2</Text>
                </View>
            </View>
            <Text style={styles.pageTitle}>Fauteils pris</Text>
            <View style={styles.squareContainer}>
                <View style={styles.square}>
                    <Text style={styles.squareText}>Pris 1</Text>
                </View>
                <View style={styles.square}>
                    <Text style={styles.squareText}>Pris 2</Text>
                </View>
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
    square: {
        width: 100,
        height: 100,
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