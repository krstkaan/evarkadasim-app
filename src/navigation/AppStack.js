// AppStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CharacterTestScreen from '../screens/CharacterTestScreen';
import AccountScreen from '../screens/AccountScreen';

const Stack = createNativeStackNavigator();

export default function AppStack({ initialRoute = 'HomePage' }) {
    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomePage" component={HomeScreen} />
            <Stack.Screen name="CharacterTest" component={CharacterTestScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
        </Stack.Navigator>
    );
}
