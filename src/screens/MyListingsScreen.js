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
    Dimensions,
    Alert
} from 'react-native';
import api from '../lib/api';
import Colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MyListingsScreen() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        setLoading(true); // Ensure loading is true at the start of fetching
        try {
            const res = await api.get('/listings/me');
            let newMyListings = []; // Default to an empty array

            if (Array.isArray(res.data)) {
                // Case 1: API response is directly an array of listings (matches your sample JSON)
                newMyListings = res.data;
            } else if (res.data && Array.isArray(res.data.listings)) {
                // Case 2: API response is an object with a 'listings' array (matches original code's assumption)
                newMyListings = res.data.listings;
            } else {
                // Case 3: API response is not in an expected format, or it's a valid but empty/non-array response
                // Log a warning if the data exists but isn't in an expected structure
                if (res.data !== null && res.data !== undefined && typeof res.data !== 'string' && !Array.isArray(res.data)) {
                     console.warn(
                        'MyListingsScreen: API response for /listings/me was not in a recognized format. Expected an array or an object with a "listings" property (array). Received:',
                        res.data
                    );
                }
                // newMyListings remains [], which is a safe default for list data
            }
            setListings(newMyListings);
        } catch (err) {
            console.error('İlanlar alınamadı:', err.response?.data || err.message);
            // In case of an error, set listings to an empty array to ensure UI consistency
            // and prevent rendering with potentially corrupted or undefined state from a previous fetch.
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteListing = async (id) => {
        Alert.alert(
            "İlanı Sil",
            "Bu ilanı silmek istediğinizden emin misiniz?",
            [
                {
                    text: "İptal",
                    style: "cancel"
                },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        // No need to set loading(true) here if fetchMyListings does it
                        try {
                            await api.delete(`/listings/${id}`);
                            fetchMyListings(); // This will set loading and update list
                        } catch (err) {
                            console.error('İlan silinemedi:', err.response?.data || err.message);
                            Alert.alert('Hata', 'İlan silinirken bir sorun oluştu.');
                            setLoading(false); // Ensure loading is false if fetchMyListings is not called or fails before setting it
                        }
                        // No finally { setLoading(false) } here, as fetchMyListings handles it.
                    }
                }
            ]
        );
    };

    const handleEditListing = (item) => {
        navigation.navigate('EditListingScreen', { listing: item });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => navigation.navigate('ListingDetailScreen', { id: item.id })}
                activeOpacity={0.8}
            >
                {item.images?.[0]?.image_path ? (
                    <Image
                        source={{ uri: `http://192.168.1.111:8000/storage/${item.images[0].image_path}` }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#333' }}>Görsel Yok</Text>
                    </View>
                )}
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                        {/* Consider if 'approved' status should also be 'Aktif' */}
                        {item.status === 'active' || item.status === 'approved' ? 'Aktif' : 'Pasif'}
                    </Text>
                </View>
            </TouchableOpacity>

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

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditListing(item)}
                    >
                        <FontAwesome name="edit" size={18} color={Colors.primary} />
                        <Text style={styles.actionText}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteListing(item.id)}
                    >
                        <FontAwesome name="trash" size={18} color={Colors.danger} />
                        <Text style={[styles.actionText, styles.deleteText]}>Sil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome name="list-alt" size={60} color={Colors.secondary} />
            <Text style={styles.emptyTitle}>İlan Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
                Henüz oluşturduğunuz bir ilan bulunmuyor.
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('CreateListingScreen')}
                activeOpacity={0.8}
            >
                <Text style={styles.browseButtonText}>İlan Oluştur</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>İlanlarınız yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>İlanlarım</Text>
                <Text style={styles.headerSubtitle}>
                    {/* This check is now safe because listings is guaranteed to be an array */}
                    {listings.length > 0
                        ? `${listings.length} ilan bulunuyor`
                        : 'Henüz ilanınız bulunmuyor'}
                </Text>
            </View>

            <View style={styles.addButtonContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateListingScreen')}
                >
                    <FontAwesome name="plus" size={16} color={Colors.white} style={styles.addIcon} />
                    <Text style={styles.addButtonText}>Yeni İlan Ekle</Text>
                </TouchableOpacity>
            </View>

            {/* This check is also safe now */}
            {listings.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={listings} // listings is guaranteed to be an array
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
        backgroundColor: Colors.secondary, // Assuming Colors.secondary is dark for white text
        paddingTop: 20, // Adjust if using SafeAreaView or custom header
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
        color: Colors.white, // Changed from Colors.black for better contrast on Colors.secondary
        opacity: 0.9,      // Slightly less prominent than title
        marginTop: 2,
    },
    addButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    addButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2, // Add some shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    addIcon: {
        marginRight: 5,
    },
    addButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 16, // Apply horizontal padding to the content container
        paddingTop: 8,
        paddingBottom: 16, // Add padding at the bottom
    },
    card: {
        backgroundColor: Colors.cardBackground, // Ensure Colors.cardBackground is defined
        marginBottom: 16,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: Colors.textDark, // Ensure Colors.textDark is defined
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 180, // Fixed height for images
    },
    image: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 20, // More pill-like
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    statusText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    info: {
        padding: 15,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.textDark, // Ensure Colors.textDark is defined
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 12,
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
        color: Colors.textLight, // Ensure Colors.textLight is defined
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.success, // Ensure Colors.success is defined
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Use space-around for more spacing if needed
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight, // Ensure Colors.borderLight is defined
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Colors.backgroundLight, // Ensure Colors.backgroundLight is defined
        flex: 1, // Make buttons take equal space
        marginHorizontal: 4, // Add some space between buttons
    },
    deleteButton: {
        backgroundColor: Colors.dangerLight, // Ensure Colors.dangerLight is defined
    },
    actionText: {
        marginLeft: 6,
        fontWeight: '500',
        color: Colors.primary,
    },
    deleteText: {
        color: Colors.danger, // Ensure Colors.danger is defined
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
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
        marginTop: -50, // Adjust to pull it up a bit if header is large
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
        borderRadius: 25, // Pill-shaped button
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