import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import api from '../lib/api';
import Colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import CustomUserBottomBar from '../components/CustomUserBottomBar';

const { width } = Dimensions.get('window');

export default function ChatListScreen() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await api.get('/chat/my-rooms');
                setRooms(res.data.rooms || []);
            } catch (err) {
                console.error('Sohbet odaları alınamadı:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const renderItem = ({ item }) => {
        const isUser1 = item.user_1_id === item.current_user_id;
        const otherUser = isUser1 ? item.user2 : item.user1;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate('ChatScreen', {
                        roomId: item.id,
                        targetUserName: otherUser?.name || 'Kullanıcı',
                    })
                }
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={
                            otherUser?.profile_photo_url
                                ? { uri: otherUser.profile_photo_url }
                                : require('../../assets/images/default-avatar.png')
                        }
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {otherUser?.name || 'Kullanıcı'}
                    </Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        Sohbete gitmek için dokunun
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sohbetlerim</Text>
                <Text style={styles.headerSubtitle}>
                    {rooms.length > 0 ? `${rooms.length} aktif sohbet` : 'Sohbet bulunmuyor'}
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : rooms.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FontAwesome name="comments" size={60} color={Colors.secondary} />
                    <Text style={styles.emptyTitle}>Henüz sohbet yok</Text>
                    <Text style={styles.emptySubtitle}>İlanlar üzerinden yeni sohbetler başlatabilirsin.</Text>
                </View>
            ) : (
                <FlatList
                    data={rooms}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <CustomUserBottomBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        backgroundColor: Colors.secondary,
        paddingTop: 20,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.white,
        opacity: 0.9,
        marginTop: 2,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        marginBottom: 16,
        borderRadius: 15,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        padding: 12,
        shadowColor: Colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        marginRight: 12,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.textLight,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingTop: 16,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: -50,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 30,
    },
});
