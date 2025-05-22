import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { ref, set } from 'firebase/database';
import { db } from '../firebaseConfig';

export default function FirebaseTestComponent() {
  const sendTestMessage = async () => {
    try {
      await set(ref(db, 'test/mesaj1'), {
        mesaj: 'Merhaba Firebase!',
        timestamp: new Date().toISOString(),
      });
      Alert.alert('Başarılı', 'Firebase\'e mesaj gönderildi.');
    } catch (err) {
      console.error('Firebase hatası:', err);
      Alert.alert('Hata', 'Mesaj gönderilemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Test Mesaj Gönder" onPress={sendTestMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 20,
  },
});
