// SplashScreen.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import logo from '../../assets/images/roomiefiesLogo.png';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>Roomiefies</Text>
            <ActivityIndicator size="large" color="#171790" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    logo: { width: 150, height: 150, resizeMode: 'contain', marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#171790' },
});
