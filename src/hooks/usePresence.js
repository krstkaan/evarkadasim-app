"use client"

import { useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import { ref, set, onValue, onDisconnect, serverTimestamp } from "firebase/database"
import { db } from "../firebaseConfig"

export const usePresence = (userId) => {
    const appState = useRef(AppState.currentState)
    const [isOnline, setIsOnline] = useState(true)
    const userStatusRef = useRef(null)

    useEffect(() => {
        if (!userId) return

        // Kullanıcının status referansını oluştur
        userStatusRef.current = ref(db, `users/${userId}/status`)

        // Uygulama başladığında online yap
        updateOnlineStatus(true)

        // App state değişikliklerini dinle
        const subscription = AppState.addEventListener("change", handleAppStateChange)

        // Component unmount olduğunda temizle
        return () => {
            subscription?.remove()
            updateOnlineStatus(false)
        }
    }, [userId])

    const updateOnlineStatus = (online) => {
        if (!userId || !userStatusRef.current) return

        const statusData = {
            online: online,
            lastSeen: serverTimestamp(),
        }

        // Veritabanında status'u güncelle
        set(userStatusRef.current, statusData).catch((error) => {
            console.error("Status update error:", error)
        })

        setIsOnline(online)

        // Online olduğunda disconnect handler'ı ayarla
        if (online) {
            onDisconnect(userStatusRef.current).set({
                online: false,
                lastSeen: serverTimestamp(),
            })
        }
    }

    const handleAppStateChange = (nextAppState) => {
        if (appState.current.match(/inactive|background/) && nextAppState === "active") {
            // App ön plana geçti
            updateOnlineStatus(true)
        } else if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
            // App arka plana geçti
            updateOnlineStatus(false)
        }
        appState.current = nextAppState
    }

    // Manuel status kontrolü
    const setOnlineStatus = (online) => {
        updateOnlineStatus(online)
    }

    return { isOnline, setOnlineStatus }
}

// Kullanıcı durumunu dinlemek için hook
export const useUserStatus = (userId) => {
    const [userStatus, setUserStatus] = useState({ isOnline: false, lastSeen: null })

    useEffect(() => {
        if (!userId) return

        const userStatusRef = ref(db, `users/${userId}/status`)

        const statusListener = onValue(
            userStatusRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const status = snapshot.val()
                    setUserStatus({
                        isOnline: status.online || false,
                        lastSeen: status.lastSeen || null,
                    })
                } else {
                    setUserStatus({
                        isOnline: false,
                        lastSeen: null,
                    })
                }
            },
            (error) => {
                console.error(`Error listening to user ${userId} status:`, error)
            },
        )

        return () => {
            statusListener()
        }
    }, [userId])

    return userStatus
}
