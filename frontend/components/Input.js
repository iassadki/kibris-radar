import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const Input = (props) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 50,
        paddingLeft: 10,
    },
});

export default Input;