import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';
import api from '../lib/api';
import CustomUserBottomBar from '../components/CustomUserBottomBar';

export default function HomeScreen() {
    const user = useSelector(state => state.user.user);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me');
                dispatch(setUser(response.data)); // ✅ Redux'a kullanıcıyı at
            } catch (error) {
                console.log('Kullanıcı bilgisi alınamadı:', error);
                await AsyncStorage.removeItem('authToken');
                dispatch(clearUser());
                navigation.replace('Login');
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            // loglanabilir
        } finally {
            await AsyncStorage.removeItem('authToken');
            dispatch(clearUser()); // ✅ bu tetiklenince RootNavigation otomatik AuthStack'e döner
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

            <CustomUserBottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#171790',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
    },
});
