import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';

import AppStack from './AppStack';
import AuthStack from './AuthStack';
import SplashScreen from '../screens/SplashScreen';
import { setUser, clearUser } from '../store/slices/userSlice';

export default function RootNavigation() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await api.get('/me');
                dispatch(setUser(response.data));
            } catch (error) {
                await AsyncStorage.removeItem('authToken');
                dispatch(clearUser());
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) return <SplashScreen />;

    return (
        <NavigationContainer>
            {user ? (
                user.character_test_done ? (
                    <AppStack initialRoute="HomePage" />
                ) : (
                    <AppStack initialRoute="CharacterTest" />
                )
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
}
