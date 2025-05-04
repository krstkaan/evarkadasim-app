// AppStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileTestScreen from '../screens/ProfileTestScreen';
import CharacterTestScreen from '../screens/CharacterTestScreen';
import AccountScreen from '../screens/AccountScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CreateAdvertisementScreen from '../screens/CreateAdvertisementScreen';
import Colors from '../constants/colors';
const Stack = createNativeStackNavigator();

export default function AppStack({ initialRoute = 'HomePage' }) {
    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomePage" component={HomeScreen} />
            <Stack.Screen name="ProfileTest" component={ProfileTestScreen} />
            <Stack.Screen name="CharacterTest" component={CharacterTestScreen} />
            <Stack.Screen name="AccountScreen" component={AccountScreen} />
            <Stack.Screen name="CreateAdvertisementScreen" component={CreateAdvertisementScreen} />
            <Stack.Screen
                name="EditProfileScreen"
                component={EditProfileScreen}
                options={{
                    title: 'Profili Düzenle',
                    headerShown: true, // <<< Bunu ekle
                    headerBackTitleVisible: false,
                    headerTintColor: Colors.primary,
                }}
            />
        </Stack.Navigator>
    );
}
