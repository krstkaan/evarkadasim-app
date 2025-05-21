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
    Dimensions
} from 'react-native';
import api from '../lib/api';
import Colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; // Assuming you're using Expo

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await api.get('/favorites');
                setFavorites(res.data.favorites);
            } catch (err) {
                console.error('Favoriler alınamadı:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ListingDetailScreen', { id: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.images[0] }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.favoriteIcon}>
                    <FontAwesome name="heart" size={20} color={Colors.danger} />
                </View>
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                </Text>
                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <FontAwesome name="expand" size={14} color={Colors.primary} style={styles.metaIcon} />
                        <Text style={styles.metaText}>{item.square_meters} m²</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <FontAwesome name="money" size={14} color={Colors.success} style={styles.metaIcon} />
                        <Text style={styles.priceText}>{item.rent_price}₺</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome name="heart-o" size={60} color={Colors.secondary} />
            <Text style={styles.emptyTitle}>Favori Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
                Henüz favori listenize ekleme yapmadınız.
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('HomePage')}
                activeOpacity={0.8}
            >
                <Text style={styles.browseButtonText}>İlanları Keşfet</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background}/>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Favorilerim</Text>
                <Text style={styles.headerSubtitle}>
                    {favorites.length > 0
                        ? `${favorites.length} favori ilan`
                        : 'Favori ilanınız bulunmuyor'}
                </Text>
            </View>

            {favorites.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        color: Colors.black,
        marginTop: 2,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        marginBottom: 16,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: Colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 180,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        padding: 15,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        marginRight: 5,
    },
    metaText: {
        fontSize: 14,
        color: Colors.textLight,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.success,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary,
    },
    loadingText: {
        marginTop: 10,
        color: Colors.primary,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
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
    browseButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: Colors.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    browseButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});