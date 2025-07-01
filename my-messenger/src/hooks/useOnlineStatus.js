import { useEffect } from "react";
import { auth, rtdb } from "../firebase";
import { onDisconnect, ref, set } from "firebase/database";

export function useOnlineStatus() {
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userStatusRef = ref(rtdb, `status/${uid}`);

    const isOnlineForDatabase = {
      state: "online",
      lastChanged: Date.now(),
    };

    const isOfflineForDatabase = {
      state: "offline",
      lastChanged: Date.now(),
    };

    // Устанавливаем offline при отключении
    onDisconnect(userStatusRef).set(isOfflineForDatabase).then(() => {
      // Устанавливаем онлайн
      set(userStatusRef, isOnlineForDatabase);
    });

    // Когда компонент размонтируется — ставим оффлайн
    return () => {
      set(userStatusRef, isOfflineForDatabase);
    };
  }, []);
}
