import { StyleSheet, View, Keyboard, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import BarItem from './BarItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomUserBottomBar = () => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const navigationState = useNavigationState((state) => state);
    const currentRouteName = navigationState?.routes[navigationState.index]?.name;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    const hideBottomBarRoutes = ['İşlemlerim', 'ProductDetails'];

    if (isKeyboardVisible || hideBottomBarRoutes.includes(currentRouteName)) {
        return null;
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
            <BarItem
                itemText="Ana Sayfa"
                itemLink="HomePage"
                itemIcon="home"
                isActive={currentRouteName === 'HomePage'}
            />
            <BarItem
                itemText="İlan Ver"
                itemLink="CreateListingScreen"
                itemIcon="plus-circle"
                isActive={currentRouteName === 'CreateListingScreen'}
            />
            <BarItem
                itemText="Hesabım"
                itemLink="AccountScreen"
                itemIcon="user"
                isActive={currentRouteName === 'AccountScreen'}
            />
        </View>
    );
};

export default CustomUserBottomBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 8,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: 'lightgrey',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 100,
    },
});
