"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Alert,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import api from "../lib/api"
import Colors from "../constants/colors"
import { Feather } from "@expo/vector-icons"
import CustomUserBottomBar from "../components/CustomUserBottomBar"
import { AntDesign } from "@expo/vector-icons"
import { BASE_URL } from "../constants/config"

// Define the dropdowns we need to fetch
const DROPDOWN_ENDPOINTS = {
    roommateGenders: "/dropdowns/roommate-genders",
    ageRanges: "/dropdowns/age-ranges",
    houseTypes: "/dropdowns/house-types",
    furnitureStatuses: "/dropdowns/furniture-statuses",
    heatingTypes: "/dropdowns/heating-types",
    buildingAges: "/dropdowns/building-ages",
}

const { width: screenWidth } = Dimensions.get("window")
const IMAGE_HEIGHT = 250

export default function ListingDetailScreen() {
    const route = useRoute()
    const navigation = useNavigation()
    const { id } = route.params

    const [listing, setListing] = useState(null)
    const [dropdownData, setDropdownData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeSlide, setActiveSlide] = useState(0)
    const imageSliderRef = useRef(null)
    const [isFavorite, setIsFavorite] = useState(false)

    const handleStartChat = async () => {
        try {
            if (!currentListing || !currentListing.user) {
                Alert.alert("Hata", "İlan sahibi bilgisi bulunamadı.")
                return
            }

            // İlan sahibinin ID'sini al
            const targetUserId = currentListing.user.id

            const res = await api.post("/chat/start", {
                target_user_id: targetUserId,
                listing_id: currentListing.id,
            })

            const roomId = res.data.room_id

            // ChatScreen'e geçerken targetUserId'yi de gönder
            navigation.navigate("ChatScreen", {
                roomId: roomId,
                targetUserId: targetUserId, // Bu satır eklendi!
                targetUserName: currentListing.user.name,
            })

            console.log("Chat started with user ID:", targetUserId, "Room ID:", roomId)
        } catch (err) {
            console.error("Sohbet başlatılamadı:", err.response?.data || err.message)
            Alert.alert("Hata", "Sohbet başlatılırken bir sorun oluştu.")
        }
    }

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true)
            setError(null)
            try {
                const listingPromise = api.get(`/listings/${id}`)
                const dropdownPromises = Object.entries(DROPDOWN_ENDPOINTS).map(async ([key, endpoint]) => {
                    const response = await api.get(endpoint)
                    return { key, data: response.data }
                })

                const [listingResponse, ...dropdownResponsesResolved] = await Promise.all([listingPromise, ...dropdownPromises])

                setListing(listingResponse.data)

                const fetchedDropdowns = dropdownResponsesResolved.reduce((acc, curr) => {
                    acc[curr.key] = curr.data
                    return acc
                }, {})
                setDropdownData(fetchedDropdowns)
            } catch (err) {
                console.error("Veri alınamadı:", err.response ? err.response.data : err.message)
                setError("İlan veya detaylar yüklenirken bir hata oluştu.")
            } finally {
                setLoading(false)
            }
        }

        fetchAllData()
    }, [id])

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const res = await api.get(`/favorites/check`, {
                    params: { listing_id: id },
                })
                setIsFavorite(res.data.favorited)
            } catch (err) {
                console.error("Favori kontrolü başarısız:", err.response?.data || err.message)
            }
        }

        checkFavoriteStatus()
    }, [id])

    const getLabelById = useCallback(
        (dropdownKey, itemId) => {
            if (!dropdownData || !dropdownData[dropdownKey] || !itemId) {
                return "-"
            }
            const items = dropdownData[dropdownKey]
            if (!Array.isArray(items)) {
                console.warn(`Dropdown items for key "${dropdownKey}" is not an array:`, items)
                return "-"
            }
            const item = items.find((d) => d.id === itemId)
            return item ? item.label : "-"
        },
        [dropdownData],
    )

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x
        const currentIndex = Math.round(contentOffsetX / screenWidth)
        if (currentIndex !== activeSlide) {
            setActiveSlide(currentIndex)
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    const currentListing = listing

    if (error || !currentListing) {
        return (
            <View style={styles.center}>
                <Text style={{ color: Colors.danger, textAlign: "center" }}>
                    {error || "İlan bulunamadı veya yüklenemedi."}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: Colors.primary }}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const toggleFavorite = async () => {
        try {
            const res = await api.post("/favorites/toggle", {
                listing_id: id,
            })
            setIsFavorite(res.data.favorited)
            console.log(`Yeni favori durumu: ${res.data.favorited}`)
        } catch (err) {
            console.error("Favori işlemi başarısız:", err.response?.data || err.message)
        }
    }

    const handleApplyForRoommate = async () => {
        try {
            const res = await api.post("/roommate-requests", {
                listing_id: currentListing.id,
            });

            Alert.alert("Başarılı", "Ev arkadaşlığı başvurusu gönderildi.");
        } catch (err) {
            if (err.response?.status === 409) {
                Alert.alert("Zaten Başvuruldu", "Bu ilana zaten başvuru yaptınız.");
            } else {
                console.error("Başvuru hatası:", err.response?.data || err.message);
                Alert.alert("Hata", "Başvuru gönderilirken bir hata oluştu.");
            }
        }
    };

    return (
        <View style={styles.container} statusbarStyle="dark-content">
            <StatusBar backgroundColor={Colors.background} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>İlan Detayı</Text>
                <Text style={styles.headerSubtitle}>{currentListing.title}</Text>
            </View>
            <View style={styles.detailCard}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {currentListing.images && currentListing.images.length > 0 ? (
                        <View style={styles.sliderContainerStyle}>
                            <TouchableOpacity style={styles.favoriteIconContainer} onPress={toggleFavorite}>
                                <AntDesign name={isFavorite ? "heart" : "hearto"} size={26} color={isFavorite ? "red" : "white"} />
                            </TouchableOpacity>
                            <ScrollView
                                ref={imageSliderRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={handleScroll}
                                scrollEventThrottle={16}
                                style={{ height: IMAGE_HEIGHT }}
                            >
                                {currentListing.images.map((image, index) => (

                                    <Image
                                        source={{ uri: `${BASE_URL}/storage/${item.images[0].image_path}` }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                            {currentListing.images.length > 1 && (
                                <View style={styles.paginationContainer}>
                                    {currentListing.images.map((_, index) => (
                                        <TouchableOpacity
                                            key={`dot-${index}`}
                                            onPress={() => {
                                                imageSliderRef.current?.scrollTo({ x: screenWidth * index, animated: true })
                                                setActiveSlide(index)
                                            }}
                                        >
                                            <View style={[styles.paginationDot, activeSlide === index ? styles.paginationDotActive : {}]} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={[styles.mainImagePlaceholder, { height: IMAGE_HEIGHT }]}>
                            <Text style={styles.noImageText}>Görsel Yok</Text>
                        </View>
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
                                                ? { uri: currentListing.user.profile_photo_url }
                                                : require("../../assets/images/default-avatar.png")
                                        }
                                        style={styles.ownerImage}
                                    />
                                    <View>
                                        <Text style={styles.ownerName}>{currentListing.user.name}</Text>
                                        <Text style={styles.ownerType}>İlan Sahibi</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.contactButton} onPress={handleStartChat}>
                                    <Text style={styles.contactButtonText}>İletişime Geç</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.contactButton,]}
                            onPress={handleApplyForRoommate}
                        >
                            <Text style={styles.contactButtonText}>Ev Arkadaşı Olarak Başvur</Text>
                        </TouchableOpacity>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Açıklama</Text>
                            <Text style={styles.description}>{currentListing.description}</Text>
                        </View>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Detaylar</Text>
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Isınma Tipi</Text>
                                    <Text style={styles.detailValue}>{getLabelById("heatingTypes", currentListing.heating_type_id)}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Eşya Durumu</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById("furnitureStatuses", currentListing.furniture_status_id)}
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Ev Tipi</Text>
                                    <Text style={styles.detailValue}>{getLabelById("houseTypes", currentListing.house_type_id)}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Bina Yaşı</Text>
                                    <Text style={styles.detailValue}>{getLabelById("buildingAges", currentListing.building_age_id)}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Tercih Edilen Cinsiyet</Text>
                                    <Text style={styles.detailValue}>
                                        {getLabelById("roommateGenders", currentListing.roommate_gender_id)}
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Tercih Edilen Yaş Aralığı</Text>
                                    <Text style={styles.detailValue}>{getLabelById("ageRanges", currentListing.age_range_id)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <CustomUserBottomBar />
        </View>
    )
}

const styles = StyleSheet.create({
    pageBackground: {
        flex: 1,
        backgroundColor: Colors.secondary,
        paddingBottom: 20, // CustomUserBottomBar yüksekliği kadar padding gerekebilir
    },
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
        fontWeight: "bold",
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.black,
        marginTop: 2,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    detailCard: {
        backgroundColor: Colors.white,
        flex: 1, // Sayfanın geri kalanını kaplaması için
        borderTopLeftRadius: 20, // Header ile uyumlu olması için
        borderTopRightRadius: 20, // Header ile uyumlu olması için
    },
    // Resim Kaydırıcı Stilleri
    sliderContainerStyle: {
        height: IMAGE_HEIGHT,
        width: "100%", // Genişlik ekran genişliği kadar olacak (ScrollView içindeki resimler screenWidth alacak)
        position: "relative", // Pagination dot'ların pozisyonlanması için
        backgroundColor: Colors.lightGray, // Resimler yüklenene kadar veya boşlukta görünecek renk
    },
    sliderImage: {
        width: screenWidth, // Her bir resim ekran genişliğinde
        height: IMAGE_HEIGHT,
        resizeMode: "cover", // Resmin boyutlandırma şekli
    },
    mainImagePlaceholder: {
        // Resim olmadığında gösterilecek alan için stil
        width: "100%",
        // height: IMAGE_HEIGHT, // Yükseklik global değişkenden alınacak
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightGray,
    },
    noImageText: {
        color: Colors.gray,
        fontSize: 16,
    },
    paginationContainer: {
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Daha görünür bir renk
        marginHorizontal: 5,
        padding: 5, // Dokunma alanını büyütmek için (görsel boyutu etkilemez)
    },
    paginationDotActive: {
        backgroundColor: Colors.primary, // Aktif nokta için farklı renk
        width: 10, // Aktif noktayı biraz daha büyük yap
        height: 10,
        borderRadius: 5,
    },
    // Mevcut stiller devam ediyor
    detailContent: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 15,
    },
    priceInfoContainer: {
        flexDirection: "row",
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
    },
    infoValue: {
        fontWeight: "bold",
        fontSize: 16,
        color: Colors.primary,
        marginLeft: 8,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: Colors.gray,
        lineHeight: 22,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    detailItem: {
        width: "48%",
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
        fontWeight: "bold",
        color: Colors.primary,
    },
    ownerCard: {
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ownerInfo: {
        flexDirection: "row",
        alignItems: "center",
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
        fontWeight: "bold",
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
        fontWeight: "bold",
        fontSize: 14,
    },
    favoriteIconContainer: {
        position: "absolute",
        top: 15, // Header'dan biraz aşağıda dursun
        right: 15,
        backgroundColor: "rgba(0,0,0,0.4)",
        borderRadius: 20,
        padding: 6,
        zIndex: 10,
    },
})
