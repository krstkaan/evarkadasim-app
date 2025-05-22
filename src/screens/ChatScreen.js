import React, { useEffect, useState, useRef } from 'react';
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
    SafeAreaView,
} from 'react-native';
import { db } from '../firebaseConfig';
import { ref, onChildAdded, push, set } from 'firebase/database';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import Colors from '../constants/colors';

export default function ChatScreen({ route }) {
    const { roomId, targetUserName } = route.params;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.user.user);
    const flatListRef = useRef(null);
    const navigation = useNavigation();

    // currentUser'ı user yüklendikten sonra tanımlayın
    const currentUser = user ? { _id: user.id, name: user.name } : null;

    useEffect(() => {
        const chatRef = ref(db, `chats/${roomId}`);
        const listener = onChildAdded(chatRef, (snapshot) => {
            const msg = snapshot.val();
            setMessages((prevMessages) => {
                const exists = prevMessages.some((m) => m._id === msg._id);
                if (exists) {
                    return prevMessages;
                }
                return [...prevMessages, msg];
            });
            setLoading(false);
        });

        // If no messages after a timeout, stop loading indicator
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => {
            listener();
            clearTimeout(timer);
        };
    }, [roomId]);

    // Yeni mesaj geldiğinde en alta kaydır
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !currentUser) return;
        const now = new Date();

        const messageRef = push(ref(db, `chats/${roomId}`));
        const message = {
            _id: messageRef.key,
            text: input,
            createdAt: now.toISOString(),
            user: currentUser,
        };

        await set(messageRef, message);

        try {
            await api.post('/chat/messages', {
                room_id: roomId,
                text: message.text,
                sent_at: message.createdAt,
            });
        } catch (err) {
            console.error('Laravel mesaj hatası:', err.response?.data || err.message);
        }

        setInput('');
    };

    const formatTime = (isoDate) => {
        const d = new Date(isoDate);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoDate) => {
        const d = new Date(isoDate);
        return d.toLocaleDateString();
    };

    // Mesajları tarihe göre gruplama
    const groupedMessages = messages.reduce((acc, msg) => {
        const msgDate = formatDate(msg.createdAt);
        const lastGroup = acc.length > 0 ? acc[acc.length - 1] : null;

        if (!lastGroup || lastGroup.type !== 'date' || lastGroup.date !== msgDate) {
            if (acc.length === 0 || (lastGroup && lastGroup.date !== msgDate && lastGroup.type === 'message')) {
                const lastMessage = acc.length > 0 && acc[acc.length - 1].type === 'message' ? acc[acc.length - 1] : null;
                if (!lastMessage || formatDate(lastMessage.createdAt) !== msgDate) {
                    acc.push({ type: 'date', date: msgDate, _id: `date-${msgDate}` });
                }
            }
        }
        acc.push({ type: 'message', ...msg });
        return acc;
    }, []);

    const renderItem = ({ item }) => {
        if (item.type === 'date') {
            return <Text style={styles.dateSeparator}>{item.date}</Text>;
        }

        const isMine = currentUser && item.user._id === currentUser._id;
        return (
            <View
                style={[
                    styles.message,
                    isMine ? styles.myMessage : styles.otherMessage,
                ]}
            >
                <Text style={isMine ? styles.myMessageText : styles.otherMessageText}>
                    {item.text}
                </Text>
                <Text style={isMine ? styles.myTimestamp : styles.otherTimestamp}>
                    {formatTime(item.createdAt)}
                </Text>
            </View>
        );
    };

    if (!user) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.pageBackground}>
                {/* Üst bar */}
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{targetUserName || 'Sohbet'}</Text>
                    <View style={styles.placeholderIcon} />
                </View>

                {/* İçerik */}
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
                                    onChangeText={setInput}
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
        alignItems: 'center',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
        textAlign: 'center',
    },
    placeholderIcon: {
        width: 24, // Same width as the back button icon for balance
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
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: Colors.primary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 0,
    },
    otherMessage: {
        backgroundColor: Colors.borderLight,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 0,
    },
    // Ayrı metin stilleri oluşturuldu
    myMessageText: {
        fontSize: 15,
        color: Colors.white, // Kendi mesajlarım için beyaz metin
    },
    otherMessageText: {
        fontSize: 15,
        color: Colors.textDark, // Diğer mesajlar için koyu metin
    },
    // Ayrı zaman damgası stilleri
    myTimestamp: {
        fontSize: 10,
        color: Colors.white,
        opacity: 0.8,
        textAlign: 'right',
        marginTop: 5,
    },
    otherTimestamp: {
        fontSize: 10,
        color: Colors.textLight,
        opacity: 0.8,
        textAlign: 'right',
        marginTop: 5,
    },
    dateSeparator: {
        alignSelf: 'center',
        backgroundColor: Colors.secondary,
        color: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        fontSize: 12,
        marginVertical: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
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
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
});