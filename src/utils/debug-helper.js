"use client"

// Yeni bir debug yardımcı dosyası
import { ref, get } from "firebase/database"
import { db } from "../firebaseConfig"

// Firebase veritabanı yapısını kontrol etmek için yardımcı fonksiyon
export const checkDatabaseStructure = async (userId) => {
    try {

        // Kullanıcı status'unu kontrol et
        const userStatusRef = ref(db, `users/${userId}/status`)
        const statusSnapshot = await get(userStatusRef)


        // Kullanıcı ana verisini kontrol et
        const userRef = ref(db, `users/${userId}`)
        const userSnapshot = await get(userRef)

        console.log(`User ${userId} full data:`, userSnapshot.val())

        return {
            statusExists: statusSnapshot.exists(),
            statusData: statusSnapshot.val(),
            userData: userSnapshot.val(),
        }
    } catch (error) {
        console.error("Error checking database structure:", error)
        return {
            error: error.message,
        }
    }
}

// Bu fonksiyonu ChatScreen'de çağırabilirsiniz:
// useEffect(() => {
//   if (targetUserId) {
//     checkDatabaseStructure(targetUserId)
//   }
// }, [targetUserId])
