import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me');
                setUser(response.data);
            } catch (error) {
                console.log('Kullanıcı bilgisi alınamadı:', error);
                await AsyncStorage.removeItem('authToken');
                navigation.replace('Login');
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            // ignore logout error
        } finally {
            await AsyncStorage.removeItem('authToken');
            navigation.replace('Login');
        }
    };

    if (!user) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#171790" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hoş geldin, {user.name}</Text>
            <Text style={styles.subtitle}>{user.email}</Text>

            <View style={{ marginTop: 40 }}>
                <Button title="Çıkış Yap" onPress={handleLogout} color="#d92632" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#171790'
    },
    subtitle: {
        fontSize: 16,
        color: '#555'
    }
});
