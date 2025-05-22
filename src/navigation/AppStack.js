// AppStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileTestScreen from '../screens/ProfileTestScreen';
import CharacterTestScreen from '../screens/CharacterTestScreen';
import AccountScreen from '../screens/AccountScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import Colors from '../constants/colors';
import FavoritesScreen from '../screens/MyFavoritesScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatListScreen from '../screens/ChatListScreen';

const Stack = createNativeStackNavigator();

export default function AppStack({ initialRoute = 'HomePage' }) {
    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomePage" component={HomeScreen} />
            <Stack.Screen name="ProfileTest" component={ProfileTestScreen} />
            <Stack.Screen name="CharacterTest" component={CharacterTestScreen} />
            <Stack.Screen name="AccountScreen" component={AccountScreen} />
            <Stack.Screen name="CreateListingScreen" component={CreateListingScreen} />
            <Stack.Screen
                name="ListingDetailScreen"
                component={ListingDetailScreen}
                options={{
                    title: 'İlan Detayı',
                    headerShown: false, // <<< Bunu ekle
                    headerBackTitleVisible: false,
                    headerTintColor: Colors.primary,
                }}
            />
            <Stack.Screen
                name="EditProfileScreen"
                component={EditProfileScreen}
                options={{
                    title: 'Profili Düzenle',
                    headerShown: false, // <<< Bunu ekle
                    headerBackTitleVisible: false,
                    headerTintColor: Colors.primary,
                }}
            />
            <Stack.Screen
                name="MyFavoritesScreen"
                component={FavoritesScreen}
                options={{
                    title: 'Favorilerim',
                    headerShown: false, // <<< Bunu ekle
                    headerBackTitleVisible: false,
                    headerTintColor: Colors.primary,
                }}
            />
            <Stack.Screen
                name="MyListingsScreen"
                component={MyListingsScreen}
                options={{
                    title: 'İlanlarım',
                    headerShown: false, // <<< Bunu ekle
                    headerBackTitleVisible: false,
                    headerTintColor: Colors.primary,
                }}
            />
            <Stack.Screen
                name="ChatScreen"
                component={ChatScreen}
                options={{
                    title: 'Mesajlar',
                    headerShown: false, // <<< Bunu ekle
                    headerBackTitleVisible: false,
                    headerTintColor: Colors.primary,
                }}
            />
            <Stack.Screen
                name="ChatListScreen"
                component={ChatListScreen}
                options={{
                    title: 'Mesajlar',
                    headerShown: false, // <<< Bunu ekle
                    headerBackTitleVisible: false,
                    headerTintColor: Colors.primary,
                }}
            />
        </Stack.Navigator>
    );
}
