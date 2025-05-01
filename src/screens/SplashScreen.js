import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');

                if (!token) {
                    navigation.replace('Onboarding');
                    return;
                }

                // Token varsa kullanıcı verisini al
                const response = await api.get('/me');
                const user = response.data;

                if (user?.id) {
                    if (!user.character_test_done) {
                        navigation.replace('CharacterTest'); // ✅ Test yapılmadıysa test ekranına yönlendir
                    } else {
                        navigation.replace('Home'); // ✅ Test yapıldıysa Home
                    }
                } else {
                    navigation.replace('Login');
                }
            } catch (error) {
                console.log('Splash hata:', error.response?.data || error.message);
                navigation.replace('Login');
            }
        };

        checkAuth();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Roomiefies</Text>
            <ActivityIndicator size="large" color="#171790" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#171790'
    }
});
