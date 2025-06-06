import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';
import api from '../lib/api';
import CustomUserBottomBar from '../components/CustomUserBottomBar';
import ListingCard from '../components/ListingCard';
import Colors from '../constants/colors';
import { Feather } from '@expo/vector-icons';

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

    const getFriendshipDuration = (startDateStr) => {
        const startDate = new Date(startDateStr);
        const now = new Date();
        const diffTime = Math.abs(now - startDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Bugün';
        if (diffDays === 1) return 'Dünden beri';
        if (diffDays < 30) return `${diffDays} gündür`;
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths} aydır`;
    };

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
                <TouchableOpacity onPress={() => navigation.navigate('ChatListScreen')}>
                    <Feather name="message-circle" size={26} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* İçerik */}
            <View style={styles.welcomeCard}>
                {user?.roommate ? (
                    <View style={styles.friendBox}>
                        <Text style={styles.friendText}>
                            {user.roommate.full_name} ile arkadaşsınız 🎉
                        </Text>
                        <Text style={styles.friendSubText}>
                            {getFriendshipDuration(user.roommate.started_at)} beri
                        </Text>
                    </View>
                ) : loadingListings ? (
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
                                score={item.match_score}
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
        paddingBottom: 30,
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
    friendBox: {
        alignItems: 'center',
        marginTop: 40,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 15,
        backgroundColor: Colors.grayFaded,
    },
    friendText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    friendSubText: {
        fontSize: 14,
        color: Colors.gray,
        marginTop: 5,
    },
});
