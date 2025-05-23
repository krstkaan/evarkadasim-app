"use client"

import { useState, useEffect, useRef } from "react"
import { ref, set, onValue } from "firebase/database"
import { db } from "../firebaseConfig"

// Yazıyor... durumunu yönetmek için hook
export const useTyping = (roomId, userId) => {
    const [isTyping, setIsTyping] = useState(false)
    const [otherUserTyping, setOtherUserTyping] = useState(false)
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        if (!roomId || !userId) return

        console.log("Setting up typing listener for room:", roomId, "user:", userId)

        // Karşı kullanıcının yazıyor durumunu dinle
        const typingRef = ref(db, `typing/${roomId}`)
        const typingListener = onValue(typingRef, (snapshot) => {
            if (snapshot.exists()) {
                const typingData = snapshot.val()
                console.log("Typing data received:", typingData)
                console.log("Current user ID:", userId)

                // Eğer başka bir kullanıcı yazıyorsa (kendi ID'mizi hariç tut)
                const otherUsersTyping = Object.keys(typingData).filter((key) => {
                    // String karşılaştırması yap (Firebase'de key'ler string olarak saklanır)
                    const keyStr = String(key)
                    const userIdStr = String(userId)
                    const isOtherUser = keyStr !== userIdStr
                    const isTyping = typingData[key] === true

                    console.log(`Checking user ${keyStr}: isOtherUser=${isOtherUser}, isTyping=${isTyping}`)

                    return isOtherUser && isTyping
                })

                const otherUserTypingStatus = otherUsersTyping.length > 0
                console.log("Other users typing:", otherUsersTyping, "Status:", otherUserTypingStatus)

                setOtherUserTyping(otherUserTypingStatus)
            } else {
                console.log("No typing data found")
                setOtherUserTyping(false)
            }
        })

        return () => {
            // Dinleyiciyi temizle
            typingListener()

            // Odadan ayrılırken yazma durumunu temizle
            const userTypingRef = ref(db, `typing/${roomId}/${userId}`)
            set(userTypingRef, false)
        }
    }, [roomId, userId])

    // Kullanıcı yazıyor durumunu güncelle
    const setUserTyping = (typing) => {
        if (!roomId || !userId) return

        console.log(`Setting user ${userId} typing status to:`, typing)

        // Önceki timeout'u temizle
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        const userTypingRef = ref(db, `typing/${roomId}/${userId}`)
        set(userTypingRef, typing)
        setIsTyping(typing)

        // Eğer yazıyorsa, 3 saniye sonra otomatik olarak durumu false yap
        if (typing) {
            typingTimeoutRef.current = setTimeout(() => {
                console.log(`Auto-clearing typing status for user ${userId}`)
                set(userTypingRef, false)
                setIsTyping(false)
            }, 3000) // 5 saniyeden 3 saniyeye düşürdüm
        }
    }

    return { isTyping, otherUserTyping, setUserTyping }
}
