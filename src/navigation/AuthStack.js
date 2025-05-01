import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

    useEffect(() => {
        const check = async () => {
            const value = await AsyncStorage.getItem('hasSeenOnboarding');
            setHasSeenOnboarding(value === 'true');
        };
        check();
    }, []);

    if (hasSeenOnboarding === null) return null; // loading için opsiyonel loader eklenebilir

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!hasSeenOnboarding ? (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : null}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}
