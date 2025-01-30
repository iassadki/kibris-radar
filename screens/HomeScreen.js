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
            {/* <Text style={styles.pageTitle}>MQTT TEST</Text> */}
            {/* <Text style={styles.text}>MQTT is {mqttState.status}</Text> */}
            {/* <Text style={styles.text}>{mqttState.lastMessage}</Text> */}
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
        // marginTop: 40,
        marginLeft: 10,
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
    },
});

export default HomeScreen;