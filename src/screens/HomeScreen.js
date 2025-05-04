import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';
import api from '../lib/api';
import CustomUserBottomBar from '../components/CustomUserBottomBar';
import Colors from '../constants/colors'; // ✅ Renk paleti

export default function HomeScreen() {
    const user = useSelector(state => state.user.user);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me');
                dispatch(setUser(response.data));
            } catch (error) {
                console.log('Kullanıcı bilgisi alınamadı:', error);
                await AsyncStorage.removeItem('authToken');
                dispatch(clearUser());
                navigation.replace('Login');
            }
        };

        fetchUser();
    }, []);

    if (!user) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.pageBackground}>
            {/* Üst bar */}
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.logoText}>Roomiefies</Text>
                    <Text style={styles.sloganText}>Karakterine uygun ev arkadaşını bul</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AccountScreen')}>
                    <Image
                        source={
                            user?.profile_photo_url
                                ? { uri: user.profile_photo_url }
                                : require('../../assets/images/default-avatar.png')
                        }
                        style={styles.profilePic}
                    />
                </TouchableOpacity>
            </View>

            {/* Ana içerik alanı */}
            <View style={styles.welcomeCard}>
                {/* Buraya öneriler, duyurular vs. eklenecek */}
            </View>

            <CustomUserBottomBar />
        </View>
    );

}

const styles = StyleSheet.create({
    pageBackground: {
        flex: 1,
        backgroundColor: Colors.secondary, // ← Arka plan tamamlayıcı rengi
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTop: {
        backgroundColor: Colors.secondary,
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
    },
    sloganText: {
        fontSize: 13,
        color: Colors.white,
        marginTop: 2,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.white,
    },
    welcomeCard: {
        backgroundColor: Colors.white,
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -10,
        flex: 1,
    },
});