import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';
import api from '../lib/api';
import CustomUserBottomBar from '../components/CustomUserBottomBar';
import ListingCard from '../components/ListingCard';
import Colors from '../constants/colors';
import { Feather, AntDesign } from '@expo/vector-icons';

export default function HomeScreen() {
    const user = useSelector(state => state.user.user);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [canGiveFeedback, setCanGiveFeedback] = useState(true);
    const [nextFeedbackTime, setNextFeedbackTime] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me');
                console.log('=== KULLANICI BİLGİSİ ===');
                console.log('Tam response:', JSON.stringify(response.data, null, 2));

                if (response.data.roommate) {
                    console.log('=== ROOMMATE BİLGİSİ ===');
                    console.log('Roommate objesi:', JSON.stringify(response.data.roommate, null, 2));
                    console.log('listing_id var mı?:', response.data.roommate.listing_id ? 'EVET' : 'HAYIR');
                    console.log('profile_photo_url var mı?:', response.data.roommate.profile_photo_url ? 'EVET' : 'HAYIR');

                    // Feedback durumunu kontrol et
                    checkFeedbackStatus(response.data.roommate.id, response.data.roommate.listing_id);
                }

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

    // Feedback durumunu kontrol et
    const checkFeedbackStatus = async (toUserId, listingId) => {
        try {
            // Test amaçlı feedback göndermeyi dene
            const testResponse = await api.post('/match-feedbacks', {
                to_user_id: toUserId,
                listing_id: listingId,
                communication_score: 1,
                sharing_score: 1,
                overall_score: 1,
                would_live_again: true,
                comment: 'test'
            });

            // Eğer başarılı olursa, test verisini sil (bu kısım backend'de implement edilmeli)
            setCanGiveFeedback(true);

        } catch (error) {
            if (error.response?.status === 409) {
                // Bugün zaten feedback verilmiş
                setCanGiveFeedback(false);
                calculateNextFeedbackTime();
            } else {
                // Başka bir hata
                setCanGiveFeedback(true);
            }
        }
    };

    // Sonraki feedback zamanını hesapla
    const calculateNextFeedbackTime = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Yarının başlangıcı

        setNextFeedbackTime(tomorrow);
    };

    // Kalan zamanı hesapla
    const getTimeUntilNextFeedback = () => {
        if (!nextFeedbackTime) return '';

        const now = new Date();
        const diff = nextFeedbackTime - now;

        if (diff <= 0) {
            setCanGiveFeedback(true);
            setNextFeedbackTime(null);
            return '';
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}s ${minutes}d`;
        } else {
            return `${minutes}d`;
        }
    };

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

    const handleEndFriendship = () => {
        Alert.alert(
            "Arkadaşlığı Sonlandır",
            "Bu ev arkadaşlığını sonlandırmak istediğinize emin misiniz?",
            [
                {
                    text: "İptal",
                    style: "cancel"
                },
                {
                    text: "Sonlandır",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // API çağrısı burada yapılacak
                            // await api.post('/end-friendship', { roommate_id: user.roommate.id });

                            // Başarılı sonlandırma sonrası kullanıcı bilgilerini güncelle
                            const response = await api.get('/me');
                            dispatch(setUser(response.data));

                            Alert.alert("Başarılı", "Ev arkadaşlığı sonlandırıldı.");
                        } catch (error) {
                            Alert.alert("Hata", "Arkadaşlık sonlandırılamadı. Lütfen tekrar deneyin.");
                        }
                    }
                }
            ]
        );
    };

    const handleFeedbackPress = () => {
        if (!canGiveFeedback) {
            const timeLeft = getTimeUntilNextFeedback();
            Alert.alert(
                "Değerlendirme Sınırı",
                `Bugün zaten değerlendirme yaptınız. Sonraki değerlendirme için ${timeLeft} bekleyin.`
            );
            return;
        }

        console.log('=== FEEDBACK BUTONU BASILDI ===');
        console.log('User roommate:', JSON.stringify(user.roommate, null, 2));

        // Gerekli bilgileri kontrol et
        if (!user.roommate) {
            Alert.alert("Hata", "Ev arkadaşı bilgisi bulunamadı.");
            return;
        }

        if (!user.roommate.id) {
            Alert.alert("Hata", "Ev arkadaşı ID bilgisi bulunamadı.");
            return;
        }

        const listingId = user.roommate.listing_id;
        console.log('Backend\'den gelen listing_id:', listingId);

        if (!listingId) {
            Alert.alert(
                "Backend Güncellemesi Gerekli",
                `listing_id hala gelmiyor. Backend'de me() fonksiyonunu güncellediniz mi?\n\nMevcut roommate objesi:\n${JSON.stringify(user.roommate, null, 2)}`,
                [
                    {
                        text: "Tamam",
                        onPress: () => {
                            console.log('Backend güncellemesi gerekiyor!');
                        }
                    }
                ]
            );
            return;
        }

        console.log('✅ Tüm parametreler hazır:');
        console.log('- toUserId:', user.roommate.id);
        console.log('- listingId:', listingId);

        // Her şey tamam, feedback ekranına git
        navigation.navigate('MatchFeedbackScreen', {
            toUserId: user.roommate.id,
            listingId: listingId
        });
    };

    // Feedback buton metnini belirle
    const getFeedbackButtonText = () => {
        if (canGiveFeedback) {
            return 'Değerlendir';
        } else {
            const timeLeft = getTimeUntilNextFeedback();
            return timeLeft ? `${timeLeft} sonra` : 'Değerlendir';
        }
    };

    // Feedback buton stilini belirle
    const getFeedbackButtonStyle = () => {
        if (canGiveFeedback) {
            return [styles.actionButton, styles.primaryActionButton];
        } else {
            return [styles.actionButton, styles.disabledActionButton];
        }
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
                <TouchableOpacity
                    onPress={() => navigation.navigate('ChatListScreen')}
                    style={styles.messageButton}
                >
                    <Feather name="message-circle" size={26} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* İçerik */}
            <View style={styles.welcomeCard}>
                {user?.roommate ? (
                    <View style={styles.friendshipContainer}>
                        <View style={styles.friendshipCard}>
                            <View style={styles.friendshipHeader}>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={
                                            user.roommate.profile_photo_url
                                                ? { uri: user.roommate.profile_photo_url }
                                                : require('../../assets/images/default-avatar.png')
                                        }
                                        style={styles.avatar}
                                    />
                                </View>
                                <View style={styles.friendshipBadge}>
                                    <AntDesign name="heart" size={12} color={Colors.white} />
                                </View>
                            </View>

                            <View style={styles.friendshipContent}>
                                <Text style={styles.friendshipTitle}>
                                    Ev Arkadaşlığı
                                </Text>
                                <Text style={styles.friendshipName}>
                                    {user.roommate.full_name}
                                </Text>

                                <View style={styles.durationContainer}>
                                    <AntDesign name="calendar" size={16} color={Colors.primary} />
                                    <Text style={styles.durationText}>
                                        {getFriendshipDuration(user.roommate.started_at)} birliktesiniz
                                    </Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.actionContainer}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.dangerActionButton]}
                                        onPress={handleEndFriendship}
                                    >
                                        <AntDesign name="disconnect" size={18} color={Colors.white} />
                                        <Text style={styles.dangerActionText}>Arkadaşlığı Sonlandır</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={getFeedbackButtonStyle()}
                                        onPress={handleFeedbackPress}
                                        disabled={!canGiveFeedback}
                                    >
                                        <AntDesign
                                            name={canGiveFeedback ? "star" : "clockcircle"}
                                            size={18}
                                            color={canGiveFeedback ? Colors.white : Colors.textLight}
                                        />
                                        <Text style={canGiveFeedback ? styles.primaryActionText : styles.disabledActionText}>
                                            {getFeedbackButtonText()}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
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
    messageButton: {
        padding: 8,
    },
    welcomeCard: {
        backgroundColor: Colors.white,
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -10,
        flex: 1,
    },
    friendshipContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    friendshipCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    friendshipHeader: {
        backgroundColor: Colors.primaryLight,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarContainer: {
        position: 'absolute',
        bottom: -30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: Colors.white,
        backgroundColor: Colors.white,
    },
    friendshipBadge: {
        position: 'absolute',
        bottom: -10,
        right: 20,
        backgroundColor: Colors.success,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    friendshipContent: {
        paddingTop: 35,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    friendshipTitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 4,
    },
    friendshipName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: 12,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 16,
    },
    durationText: {
        fontSize: 13,
        color: Colors.textDark,
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        width: '100%',
        marginBottom: 16,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        flex: 1,
        marginHorizontal: 5,
    },
    primaryActionButton: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    dangerActionButton: {
        backgroundColor: Colors.danger,
        borderColor: Colors.danger,
    },
    disabledActionButton: {
        backgroundColor: Colors.lightGray,
        borderColor: Colors.borderLight,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.primary,
        marginLeft: 6,
    },
    primaryActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.white,
        marginLeft: 6,
    },
    dangerActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.white,
        marginLeft: 6,
    },
    disabledActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textLight,
        marginLeft: 6,
    },
});