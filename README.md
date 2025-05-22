# 🏠 Roomiefies - Ev Arkadaşı Bulma Uygulaması

Roomiefies, kullanıcıların karakter testine göre sınıflandırıldığı ve bu sınıfa uygun ev arkadaşı ilanlarını görebildiği mobil bir uygulamadır. Laravel tabanlı backend ile JWT kimlik doğrulaması sağlanmakta, React Native (Expo) ile modern bir frontend deneyimi sunulmaktadır.

---

## 🚀 Özellikler

### ✅ Yapılanlar
- 📝 **Kayıt Ol / Giriş Yap:** JWT tabanlı kimlik doğrulama ile Laravel backend entegrasyonu.
- 🧠 **Karakter Testi ile Profil Sınıflandırması:** Kullanıcıdan alınan bilgiler doğrultusunda bir karakter testi uygulanır ve kullanıcı uygun sınıfa atanır.
- 🏠 **İlan Oluşturma:** Kullanıcılar ev ilanı oluşturabilir; başlık, açıklama, fiyat, m², ev tipi, eşya durumu gibi detaylar girilebilir.
- 📸 **İlana Görsel Yükleme:** Her ilan için 1 ila 3 adet görsel yüklenebilir.
- 📄 **İlan Listeleme:** Kullanıcı, sistemdeki ilanları görüntüleyebilir.
- ✏️ **İlan Düzenleme:** Kullanıcı, ilanını düzenleyebilir.
- ❤️ **İlan Favorileme:** Kullanıcılar ilanları favorilerine ekleyebilir.
- 📁 **Favori İlanları Görüntüleme:** Kullanıcının favorilere eklediği ilanlar listelenebilir.
- ✏️ **Profil Düzenleme:** Doğum tarihi, cinsiyet ve profil fotoğrafı düzenlenebilir.

### 🔧 Yapılacaklar
- 🧬 **Eşleşme Sistemi:** Karakter sınıflarına göre ilanların görünürlüğünü filtreleyecek bir eşleşme algoritması geliştirilecek.
- 🔄 **Dinamik Listeleme:** Kullanıcının sınıfına ve eşleşme skoruna göre ilan listesi güncellenecek.
- 💬 **Sohbet Özelliği:** İlan detay ekranında ilan sahibi ile mesajlaşmayı mümkün kılacak bir gerçek zamanlı sohbet sistemi eklenecek.
- 📊 **Ev Arkadaşlığı Geri Bildirim Sistemi:** Eşleşme sonrası başlayan ev arkadaşlığı sürecinde periyodik olarak geri bildirimler alınacak ve algoritma bu verilerle geliştirilecek.

---

## 🛠️ Teknolojiler

- **Frontend:** React Native (Expo), Axios, React Navigation, AsyncStorage
- **Backend:** Laravel 12
- 
---

## ⚙️ Kurulum

Projeyi lokal ortamda çalıştırmak için:

```bash
# Repo'yu klonlayın
git clone https://github.com/krstkaan/evarkadasim-app.git
cd frontend-repo

# Gerekli paketleri yükleyin
npm install

# Uygulamayı başlatın
npx expo start
