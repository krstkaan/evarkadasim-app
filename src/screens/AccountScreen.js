import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import api from '../lib/api';
import CustomUserBottomBar from '../components/CustomUserBottomBar';
import { clearUser } from '../store/slices/userSlice';
import Colors from '../constants/colors';


export default function AccountScreen() {
    const user = useSelector(state => state.user.user);
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) { }
        await AsyncStorage.removeItem('authToken');
        dispatch(clearUser());
    };

    return (
        <View style={styles.container}>
            {/* Header alanı */}
            <View style={styles.header}>
                <Image
                    source={
                        user?.profile_photo_url
                            ? { uri: user.profile_photo_url }
                            : require('../../assets/images/default-avatar.png')
                    }
                    style={styles.avatar}
                />
                <Text style={styles.name}>{user?.name || 'Kullanıcı'}</Text>
            </View>

            {/* Menü Elemanları */}
            <View style={styles.menu}>
                <MenuItem icon="edit" label="Profili Düzenle" onPress={() => navigation.navigate('EditProfileScreen')} />
                <MenuItem icon="home" label="İlanlarım" onPress={() => { }} />
                <MenuItem icon="hearto" label="Favorilerim" onPress={() => { }} />
                <MenuItem icon="setting" label="Ayarlar" onPress={() => { }} />
                <MenuItem icon="logout" label="Çıkış Yap" onPress={handleLogout} isDanger />
            </View>

            <CustomUserBottomBar />
        </View>
    );
}

const MenuItem = ({ icon, label, onPress, isDanger = false }) => (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
        <AntDesign name={icon} size={20} color={isDanger ? Colors.danger : Colors.primary} />
        <Text style={[styles.menuText, isDanger && { color: Colors.danger }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    header: {
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        paddingVertical: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.white,
        backgroundColor: Colors.white,
    },
    name: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    menu: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    menuText: {
        fontSize: 16,
        marginLeft: 15,
        color: Colors.primary,
        fontWeight: '500',
    },
});

