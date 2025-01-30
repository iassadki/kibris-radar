import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RadarScreen = () => {
    const color = 'black';
    const size = 100; // Augmenter la taille des flèches

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Clignotants</Text>
            <View style={styles.arrowsContainer}>
                <MaterialCommunityIcons name="arrow-left-circle" color={color} size={size} style={styles.arrowLeft} />
                <MaterialCommunityIcons name="arrow-right-circle" color={color} size={size} style={styles.arrowRight} />
            </View>
            <View style={styles.distanceContainer}>
                <Text style={styles.pageTitle}>Distance obstacle avant</Text>
                <Text style={styles.text}>0 cm</Text>
            </View>
            <View style={styles.distanceContainer}>
                <Text style={styles.pageTitle}>Distance obstacle arriere</Text>
                <Text style={styles.text}>0 cm</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageTitle: {
        marginTop: 20, // Réduire la marge supérieure pour rapprocher le titre des clignotants
        marginLeft: 10,
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 5, // Réduire la marge verticale
        color: 'black',
        textAlign: 'center',
    },
    text: {
        marginLeft: 10,
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black',
        textAlign: 'center',
    },
    arrowsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%', // Ajuster la largeur pour centrer les flèches
        marginVertical: 20, // Ajouter une marge verticale pour espacer les sections
    },
    distanceContainer: {
        alignItems: 'center',
        marginVertical: 30, // Ajouter une marge verticale pour espacer les sections
    },
    arrowLeft: {
        marginHorizontal: 10, // Ajuster l'écart entre les flèches
    },
    arrowRight: {
        marginHorizontal: 10, // Ajuster l'écart entre les flèches
    },
});

export default RadarScreen;