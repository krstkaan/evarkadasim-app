import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';
import api from '../lib/api';
import CustomUserBottomBar from '../components/CustomUserBottomBar';
import ListingCard from '../components/ListingCard';
import Colors from '../constants/colors'; // ✅ Renk paleti

export default function HomeScreen() {
    const user = useSelector(state => state.user.user);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);

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

        const fetchListings = async () => {
            try {
                const response = await api.get('/listings');
                setListings(response.data);
            } catch (error) {
                console.log('İlanlar alınamadı:', error);
            } finally {
                setLoadingListings(false);
            }
        };

        fetchUser();
        fetchListings();
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

            {/* İçerik */}
            <View style={styles.welcomeCard}>
                {loadingListings ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {listings.map((item) => (
                            <ListingCard
                                key={item.id}
                                title={item.title}
                                description={item.description}
                                price={item.rent_price}
                                size={item.square_meters}
                                image={item.images?.[0]?.image_path}
                                onPress={() => navigation.navigate('ListingDetailScreen', { id: item.id })}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>

            <CustomUserBottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    pageBackground: {
        flex: 1,
        backgroundColor: Colors.secondary,
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
