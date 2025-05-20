import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../lib/api';
import Colors from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import CustomUserBottomBar from '../components/CustomUserBottomBar';

// Define the dropdowns we need to fetch
const DROPDOWN_ENDPOINTS = {
    roommateGenders: '/dropdowns/roommate-genders',
    ageRanges: '/dropdowns/age-ranges',
    houseTypes: '/dropdowns/house-types',
    furnitureStatuses: '/dropdowns/furniture-statuses',
    heatingTypes: '/dropdowns/heating-types',
    buildingAges: '/dropdowns/building-ages',
};

export default function ListingDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params;

    const [listing, setListing] = useState(null);
    const [dropdownData, setDropdownData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const listingPromise = api.get(`/listings/${id}`);
                const dropdownPromises = Object.entries(DROPDOWN_ENDPOINTS).map(
                    async ([key, endpoint]) => {
                        const response = await api.get(endpoint);
                        return { key, data: response.data };
                    }
                );

                const [listingResponse, ...dropdownResponsesResolved] = await Promise.all([
                    listingPromise,
                    ...dropdownPromises,
                ]);

                // The response for /listings/{id} should be a single object.
                // If it's an array (like your initial example for /listings), adjust if needed.
                // Based on your "Listing details: {..." log, listingResponse.data is the object.
                setListing(listingResponse.data);
                // console.log('Fetched Listing Data:', listingResponse.data); // For debugging

                const fetchedDropdowns = dropdownResponsesResolved.reduce((acc, curr) => {
                    acc[curr.key] = curr.data;
                    return acc;
                }, {});
                setDropdownData(fetchedDropdowns);
                // console.log('Fetched Dropdown Data:', fetchedDropdowns); // For debugging

            } catch (err) {
                console.error('Veri alınamadı:', err.response ? err.response.data : err.message);
                setError('İlan veya detaylar yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    // Helper function to get label by ID
    // Now uses item.label
    const getLabelById = useCallback((dropdownKey, itemId) => {
        if (!dropdownData || !dropdownData[dropdownKey] || !itemId) {
            return "-";
        }
        const items = dropdownData[dropdownKey];
        if (!Array.isArray(items)) { // Add a check to ensure items is an array
            console.warn(`Dropdown items for key "${dropdownKey}" is not an array:`, items);
            return "-";
        }
        const item = items.find(d => d.id === itemId);
        return item ? item.label : "-"; // **** CRITICAL CHANGE HERE: item.label ****
    }, [dropdownData]);


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Use currentListing directly as 'listing' state should be the object itself
    // based on your log and standard API behavior for /resource/{id}
    const currentListing = listing;

    if (error || !currentListing) {
        return (
            <View style={styles.center}>
                <Text style={{ color: Colors.danger, textAlign: 'center' }}>
                    {error || 'İlan bulunamadı veya yüklenemedi.'}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: Colors.primary }}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // You can log currentListing here to confirm its structure before rendering
    // console.log('Listing details for rendering:', currentListing);


    return (
        <View style={styles.pageBackground}>
            <View style={styles.detailCard}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {currentListing.images && currentListing.images.length > 0 && (
                        <Image
                            // Assuming your API base URL is already handled by the `api` instance
                            // and image_path is relative to the storage/public directory.
                            source={{ uri: `http://192.168.1.111:8000/storage/${currentListing.images[0].image_path}` }}
                            style={styles.mainImage}
                        />
                    )}

                    <View style={styles.detailContent}>
                        <Text style={styles.title}>{currentListing.title}</Text>

                        <View style={styles.priceInfoContainer}>
                            <View style={styles.infoItem}>
                                <Feather name="dollar-sign" size={18} color={Colors.primary} />
                                <Text style={styles.infoValue}>{currentListing.rent_price}₺</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Feather name="grid" size={18} color={Colors.primary} />
                                <Text style={styles.infoValue}>{currentListing.square_meters} m²</Text>
                            </View>
                        </View>
                        {currentListing.user && (
                            <View style={styles.ownerCard}>
                                <View style={styles.ownerInfo}>
                                    <Image
                                        source={
                                            currentListing.user.profile_photo_url
                                                ? { uri: currentListing.user.profile_photo_url } // This URL should be absolute
                                                : require('../../assets/images/default-avatar.png')
                                        }
                                        style={styles.ownerImage}
                                    />
                                    <View>
                                        <Text style={styles.ownerName}>{currentListing.user.name}</Text>
                                        <Text style={styles.ownerType}>İlan Sahibi</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.contactButton}
                                    onPress={() => navigation.navigate('MessageScreen', { userId: currentListing.user.id })}
                                >
                                    <Text style={styles.contactButtonText}>İletişime Geç</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Açıklama</Text>
                            <Text style={styles.description}>{currentListing.description}</Text>
                        </View>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Detaylar</Text>
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Isınma Tipi</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById('heatingTypes', currentListing.heating_type_id)}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Eşya Durumu</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById('furnitureStatuses', currentListing.furniture_status_id)}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Ev Tipi</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById('houseTypes', currentListing.house_type_id)}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Bina Yaşı</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById('buildingAges', currentListing.building_age_id)}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Tercih Edilen Cinsiyet</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById('roommateGenders', currentListing.roommate_gender_id)}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Tercih Edilen Yaş Aralığı</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById('ageRanges', currentListing.age_range_id)}
                                    </Text>
                                </View>
                            </View>
                        </View>


                    </View>
                </ScrollView>
            </View>

            <CustomUserBottomBar />
        </View>
    );
}

// Styles remain the same
const styles = StyleSheet.create({
    pageBackground: {
        flex: 1,
        backgroundColor: Colors.secondary,
        paddingBottom: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    detailCard: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    mainImage: {
        width: '100%',
        height: 250,
    },
    detailContent: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 15,
    },
    priceInfoContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    infoValue: {
        fontWeight: 'bold',
        fontSize: 16,
        color: Colors.primary,
        marginLeft: 8,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: Colors.gray,
        lineHeight: 22,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailItem: {
        width: '48%',
        backgroundColor: Colors.lightGray,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.gray,
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    ownerCard: {
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ownerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    ownerType: {
        fontSize: 13,
        color: Colors.gray,
    },
    contactButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    contactButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
});