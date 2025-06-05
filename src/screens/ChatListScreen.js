"use client"

import { useEffect, useState } from "react"
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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import api from "../lib/api"
import Colors from "../constants/colors"
import { useNavigation } from "@react-navigation/native"
import { FontAwesome } from "@expo/vector-icons"
import CustomUserBottomBar from "../components/CustomUserBottomBar"
import { TabView, SceneMap, TabBar } from "react-native-tab-view"

const { width } = Dimensions.get("window")

export default function ChatListScreen() {
    const layout = Dimensions.get("window")

    const [index, setIndex] = useState(0)
    const [routes, setRoutes] = useState([
        { key: "chats", title: "Sohbetler (0)" },
        { key: "requests", title: "İstekler (0)" },
    ])


    const [rooms, setRooms] = useState([])
    const [loadingRooms, setLoadingRooms] = useState(true)

    const [requests, setRequests] = useState([])
    const [loadingRequests, setLoadingRequests] = useState(true)

    const navigation = useNavigation()

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await api.get("/chat/my-rooms")
                const list = res.data.rooms || []
                setRooms(list)
                setRoutes((prev) => [
                    { ...prev[0], title: `Sohbetler (${list.length})` },
                    prev[1],
                ])
            } catch (err) {
                console.error("Sohbet odaları alınamadı:", err.response?.data || err.message)
            } finally {
                setLoadingRooms(false)
            }
        }
        fetchRooms()
    }, [])

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get("/roommate-requests/incoming")
                const list = res.data || []
                setRequests(list)
                setRoutes((prev) => [
                    prev[0],
                    { ...prev[1], title: `İstekler (${list.length})` },
                ])
            } catch (err) {
                console.error("İstekler alınamadı:", err.response?.data || err.message)
            } finally {
                setLoadingRequests(false)
            }
        }
        fetchRequests()
    }, [])

    const renderChatItem = ({ item }) => {
        const isUser1 = item.user_1_id === item.current_user_id
        const otherUser = isUser1 ? item.user2 : item.user1
        const targetUserId = isUser1 ? item.user_2_id : item.user_1_id

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate("ChatScreen", {
                        roomId: item.id,
                        targetUserId: targetUserId,
                        targetUserName: otherUser?.name || "Kullanıcı",
                    })
                }
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={
                            otherUser?.profile_photo_url
                                ? { uri: otherUser.profile_photo_url }
                                : require("../../assets/images/default-avatar.png")
                        }
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        {otherUser?.name || "Kullanıcı"}
                    </Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        Sohbete gitmek için dokunun
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    const handleDecision = async (requestId, action) => {
        try {
            await api.post(`/roommate-requests/${requestId}/decide`, { action })
            setRequests((prev) => prev.filter((r) => r.id !== requestId))
        } catch (err) {
            console.error("İstek işlenemedi:", err.response?.data || err.message)
        }
    }

    const renderRequestItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image
                    source={
                        item.user?.profile_photo_url
                            ? { uri: item.user.profile_photo_url }
                            : require("../../assets/images/default-avatar.png")
                    }
                    style={styles.image}
                />
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.user?.name || "Kullanıcı"}</Text>
                <Text style={styles.lastMessage}>{item.listing?.title} ilanına başvurdu</Text>
                <View style={{ flexDirection: "row", marginTop: 8, gap: 10 }}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: Colors.success }]}
                        onPress={() => handleDecision(item.id, "accepted")}
                    >
                        <Text style={styles.buttonText}>Kabul Et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: Colors.danger }]}
                        onPress={() => handleDecision(item.id, "rejected")}
                    >
                        <Text style={styles.buttonText}>Reddet</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

    const ChatRoute = () =>
        loadingRooms ? (
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
                renderItem={renderChatItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        )

    const RequestRoute = () =>
        loadingRequests ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        ) : requests.length === 0 ? (
            <View style={styles.emptyContainer}>
                <FontAwesome name="user-plus" size={60} color={Colors.secondary} />
                <Text style={styles.emptyTitle}>Henüz istek yok</Text>
                <Text style={styles.emptySubtitle}>Ev arkadaşlığı istekleri burada görünecek.</Text>
            </View>
        ) : (
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRequestItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        )

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
            <TabView
                navigationState={{ index, routes }}
                renderScene={SceneMap({
                    chats: ChatRoute,
                    requests: RequestRoute,
                })}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        renderLabel={({ route, focused }) => {
                            let title = ""
                            if (route.key === "chats") title = `Sohbetler (${rooms.length})`
                            if (route.key === "requests") title = `İstekler (${requests.length})`

                            return (
                                <Text
                                    style={{
                                        color: Colors.white,
                                        fontWeight: focused ? "bold" : "600",
                                        fontSize: 18,
                                    }}
                                >
                                    {title}
                                </Text>
                            )
                        }}
                        indicatorStyle={{ backgroundColor: Colors.primary, height: 3 }}
                        style={{ backgroundColor: Colors.secondary }}
                    />
                )}
            />
            <CustomUserBottomBar />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        marginBottom: 16,
        borderRadius: 15,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
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
        overflow: "hidden",
        marginRight: 12,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.textLight,
    },
    button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        marginTop: -50,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.primary,
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: "center",
        marginBottom: 30,
    },
    listContent: {
        paddingTop: 16,
        paddingBottom: 100,
    },
})
