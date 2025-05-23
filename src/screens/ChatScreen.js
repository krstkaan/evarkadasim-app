"use client"

import { useEffect, useState, useRef } from "react"
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native"
import { db } from "../firebaseConfig"
import { ref, onChildAdded, push, set, get } from "firebase/database"
import { useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import api from "../lib/api"
import Colors from "../constants/colors"
import { usePresence, useUserStatus } from "../hooks/usePresence"
import { useTyping } from "../hooks/useTyping"

export default function ChatScreen({ route }) {
    const { roomId, targetUserName, targetUserId: routeTargetUserId } = route.params || {}
    const [targetUserId, setTargetUserId] = useState(routeTargetUserId || null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(true)
    const user = useSelector((state) => state.user.user)
    const flatListRef = useRef(null)
    const navigation = useNavigation()
    const lastTypingUpdateRef = useRef(0)

    // currentUser'ı user yüklendikten sonra tanımlayın
    const currentUser = user ? { _id: user.id, name: user.name } : null

    // Eğer route'dan targetUserId gelmemişse, alternatif yöntemlerle bul
    useEffect(() => {
        // Eğer zaten targetUserId varsa, bir şey yapma
        if (targetUserId || !roomId || !currentUser) return

        const findTargetUserId = async () => {
            try {
                // Mesajlardan bul
                const chatRef = ref(db, `chats/${roomId}`)
                const chatSnapshot = await get(chatRef)

                if (chatSnapshot.exists()) {
                    const messages = chatSnapshot.val()
                    const messageKeys = Object.keys(messages)

                    for (const messageKey of messageKeys) {
                        const message = messages[messageKey]
                        if (message.user && message.user._id !== currentUser._id) {
                            setTargetUserId(message.user._id)
                            return
                        }
                    }
                }
            } catch (error) {
                console.error("Error finding target user ID:", error)
            }
        }

        findTargetUserId()
    }, [roomId, currentUser, targetUserId])

    // Custom hook'ları kullan
    const { isOnline } = usePresence(currentUser?._id)
    const targetUserStatus = useUserStatus(targetUserId)
    const { otherUserTyping, setUserTyping } = useTyping(roomId, currentUser?._id)

    // Debug için
    useEffect(() => {
        console.log("ChatScreen - Current user ID:", currentUser?._id)
        console.log("ChatScreen - Target user ID:", targetUserId)
        console.log("ChatScreen - Other user typing:", otherUserTyping)
    }, [currentUser?._id, targetUserId, otherUserTyping])

    useEffect(() => {
        if (!currentUser || !roomId) return

        const chatRef = ref(db, `chats/${roomId}`)
        const listener = onChildAdded(chatRef, (snapshot) => {
            const msg = snapshot.val()
            setMessages((prevMessages) => {
                const exists = prevMessages.some((m) => m._id === msg._id)
                if (exists) {
                    return prevMessages
                }
                return [...prevMessages, msg]
            })
            if (msg.user._id !== currentUser._id && msg.seen === false) {
                const msgRef = ref(db, `chats/${roomId}/${msg._id}`)
                set(msgRef, { ...msg, seen: true })
            }
            setLoading(false)
        })

        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => {
            listener()
            clearTimeout(timer)
        }
    }, [roomId, currentUser])

    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true })
        }
    }, [messages])

    // Input değiştiğinde yazıyor durumunu güncelle
    const handleInputChange = (text) => {
        setInput(text)

        // Performans için throttling uygula (her 500ms'de bir güncelle)
        const now = Date.now()
        if (now - lastTypingUpdateRef.current > 500) {
            setUserTyping(text.length > 0)
            lastTypingUpdateRef.current = now
        }
    }

    // Input focus kaybettiğinde yazıyor durumunu kapat
    const handleInputBlur = () => {
        setUserTyping(false)
    }

    const sendMessage = async () => {
        if (!input.trim() || !currentUser || !roomId) return
        const now = new Date()

        // Mesaj gönderildiğinde yazıyor durumunu kapat
        setUserTyping(false)

        const messageRef = push(ref(db, `chats/${roomId}`))
        const message = {
            _id: messageRef.key,
            text: input,
            createdAt: now.toISOString(),
            user: currentUser,
            seen: false,
        }

        await set(messageRef, message)

        try {
            await api.post("/chat/messages", {
                room_id: roomId,
                text: message.text,
                sent_at: message.createdAt,
            })
        } catch (err) {
            console.error("Laravel mesaj hatası:", err.response?.data || err.message)
        }

        setInput("")
    }

    const formatTime = (isoDate) => {
        const d = new Date(isoDate)
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const formatDate = (isoDate) => {
        const d = new Date(isoDate)
        return d.toLocaleDateString()
    }

    const formatLastSeen = (timestamp) => {
        if (!timestamp) return ""

        const now = new Date()
        const lastSeenDate = new Date(timestamp)
        const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))

        if (diffInMinutes < 1) {
            return "Az önce görüldü"
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} dakika önce görüldü`
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60)
            return `${hours} saat önce görüldü`
        } else {
            const days = Math.floor(diffInMinutes / 1440)
            return `${days} gün önce görüldü`
        }
    }

    const getStatusText = () => {
        if (!targetUserId) {
            return "Durum bilgisi alınamıyor"
        }

        if (otherUserTyping) {
            return "Yazıyor..."
        } else if (targetUserStatus.isOnline) {
            return "Çevrimiçi"
        } else if (targetUserStatus.lastSeen) {
            return formatLastSeen(targetUserStatus.lastSeen)
        }
        return "Çevrimdışı"
    }

    const groupedMessages = messages.reduce((acc, msg) => {
        const msgDate = formatDate(msg.createdAt)
        const lastGroup = acc.length > 0 ? acc[acc.length - 1] : null

        if (!lastGroup || lastGroup.type !== "date" || lastGroup.date !== msgDate) {
            if (acc.length === 0 || (lastGroup && lastGroup.date !== msgDate && lastGroup.type === "message")) {
                const lastMessage = acc.length > 0 && acc[acc.length - 1].type === "message" ? acc[acc.length - 1] : null
                if (!lastMessage || formatDate(lastMessage.createdAt) !== msgDate) {
                    acc.push({ type: "date", date: msgDate, _id: `date-${msgDate}` })
                }
            }
        }
        acc.push({ type: "message", ...msg })
        return acc
    }, [])

    const renderItem = ({ item, index }) => {
        if (item.type === "date") {
            return <Text style={styles.dateSeparator}>{item.date}</Text>
        }

        const isMine = currentUser && item.user._id === currentUser._id

        const isLastMineMessage =
            isMine &&
            item.seen &&
            !groupedMessages.slice(index + 1).some((m) => m.type === "message" && m.user._id === currentUser._id)

        return (
            <View style={{ marginBottom: isLastMineMessage ? 20 : 10 }}>
                <View style={[styles.message, isMine ? styles.myMessage : styles.otherMessage]}>
                    <Text style={isMine ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
                    <Text style={isMine ? styles.myTimestamp : styles.otherTimestamp}>{formatTime(item.createdAt)}</Text>
                </View>
                {isLastMineMessage && <Text style={styles.seenText}>Görüldü</Text>}
            </View>
        )
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View style={styles.pageBackground}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{targetUserName || "Sohbet"}</Text>
                        <View style={styles.statusContainer}>
                            {targetUserStatus.isOnline && !otherUserTyping && <View style={styles.onlineIndicator} />}
                            {otherUserTyping && <View style={styles.typingIndicator} />}
                            <Text style={styles.statusText}>{getStatusText()}</Text>
                        </View>
                    </View>
                    <View style={styles.placeholderIcon} />
                </View>

                <View style={styles.chatContainer}>
                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <>
                            <FlatList
                                ref={flatListRef}
                                style={{ flex: 1 }}
                                data={groupedMessages}
                                keyExtractor={(item) => item._id.toString()}
                                renderItem={renderItem}
                                contentContainerStyle={styles.chat}
                                keyboardShouldPersistTaps="handled"
                            />

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mesaj yaz..."
                                    value={input}
                                    onChangeText={handleInputChange}
                                    onBlur={handleInputBlur}
                                    returnKeyType="send"
                                    onSubmitEditing={sendMessage}
                                />
                                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                                    <Feather name="send" size={20} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    pageBackground: {
        flex: 1,
        backgroundColor: Colors.secondary,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTop: {
        backgroundColor: Colors.secondary,
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButton: {
        padding: 5,
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.white,
        textAlign: "center",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4CAF50",
        marginRight: 5,
    },
    typingIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FFC107", // Sarı renk
        marginRight: 5,
    },
    statusText: {
        fontSize: 12,
        color: Colors.white,
        opacity: 0.8,
    },
    placeholderIcon: {
        width: 24,
    },
    chatContainer: {
        backgroundColor: Colors.white,
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flex: 1,
    },
    chat: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        flexGrow: 1,
    },
    message: {
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        maxWidth: "80%",
    },
    myMessage: {
        backgroundColor: Colors.primary,
        alignSelf: "flex-end",
        borderBottomRightRadius: 0,
    },
    otherMessage: {
        backgroundColor: Colors.borderLight,
        alignSelf: "flex-start",
        borderBottomLeftRadius: 0,
    },
    myMessageText: {
        fontSize: 15,
        color: Colors.white,
    },
    otherMessageText: {
        fontSize: 15,
        color: Colors.textDark,
    },
    myTimestamp: {
        fontSize: 10,
        color: Colors.white,
        opacity: 0.8,
        textAlign: "right",
        marginTop: 5,
    },
    otherTimestamp: {
        fontSize: 10,
        color: Colors.textLight,
        opacity: 0.8,
        textAlign: "right",
        marginTop: 5,
    },
    dateSeparator: {
        alignSelf: "center",
        backgroundColor: Colors.secondary,
        color: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        fontSize: 12,
        marginVertical: 15,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.white,
        alignItems: "center",
    },
    input: {
        flex: 1,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: Colors.white,
    },
    sendButton: {
        backgroundColor: Colors.primary,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    seenText: {
        fontSize: 11,
        color: Colors.textLight,
        textAlign: "right",
        marginRight: 10,
        marginTop: 2,
    },
})
