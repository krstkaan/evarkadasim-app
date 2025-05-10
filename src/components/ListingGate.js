import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../lib/api';
import Colors from '../constants/colors';
import CustomUserBottomBar from './CustomUserBottomBar';

export default function ListingGate({ navigation, children }) {
    const [myListing, setMyListing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyListing = async () => {
            try {
                const res = await api.get('/listings/me');
                const data = res.data;
                setMyListing(data?.id ? data : null);
            } catch (error) {
                console.error('İlan kontrol hatası:', error);
                Alert.alert('Hata', 'İlan kontrolü başarısız.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyListing();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : myListing ? (
                <View style={{ flex: 1, padding: 20, paddingTop: 40 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 10 }}>
                        Zaten bir ilanınız var.
                    </Text>
                    <Text style={{ fontSize: 14, marginBottom: 20 }}>
                        Dilerseniz mevcut ilanınızı görüntüleyebilir, düzenleyebilir veya yayından kaldırabilirsiniz.
                    </Text>

                    <TouchableOpacity
                        style={{ backgroundColor: Colors.primary, padding: 15, borderRadius: 10, marginBottom: 10 }}
                        onPress={() => navigation.navigate('MyListingDetails')}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>İlanı Görüntüle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ backgroundColor: Colors.secondary, padding: 15, borderRadius: 10, marginBottom: 10 }}
                        onPress={() => navigation.navigate('EditListing', { id: myListing.id })}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ backgroundColor: '#999', padding: 15, borderRadius: 10 }}
                        onPress={async () => {
                            try {
                                await api.delete(`/listings/${myListing.id}`);
                                setMyListing(null);
                            } catch (e) {
                                Alert.alert('Hata', 'İlan silinemedi.');
                            }
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Yayından Kaldır</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                children
            )}

            {/* Her durumda alt bar */}
            <CustomUserBottomBar navigation={navigation} />
        </View>
    );
}

