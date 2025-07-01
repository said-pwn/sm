import React, { useEffect, useState } from "react";
import { auth, db, rtdb } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDocs,
  setDoc,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ref as rtdbRef, onValue } from "firebase/database";
import Navbar from "../components/Navbar";

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const currentUid = auth.currentUser.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUid);
      setUsers(data);

      // статус каждого юзера
      data.forEach(user => {
        const statusRef = rtdbRef(rtdb, `/status/${user.uid}`);
        onValue(statusRef, (snap) => {
          setUserStatuses(prev => ({
            ...prev,
            [user.uid]: snap.val()?.state || "offline"
          }));
        });
      });
    };

    fetchUsers();
  }, [currentUid]);

  useEffect(() => {
    if (!selectedUser) return;

    const getOrCreateChat = async () => {
      const participants = [currentUid, selectedUser.uid].sort();
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participants", "==", participants));
      const snapshot = await getDocs(q);

      let chatId;
      if (!snapshot.empty) {
        chatId = snapshot.docs[0].id;
      } else {
        const docRef = await addDoc(chatsRef, {
          participants,
          createdAt: serverTimestamp(),
        });
        chatId = docRef.id;
      }

      const msgQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc")
      );

      return onSnapshot(msgQuery, (snap) => {
        setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    };

    const unsubPromise = getOrCreateChat();
    return () => {
      unsubPromise.then((unsub) => unsub && unsub());
    };
  }, [selectedUser, currentUid]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser) return;

    const participants = [currentUid, selectedUser.uid].sort();
    const q = query(collection(db, "chats"), where("participants", "==", participants));
    const snapshot = await getDocs(q);
    let chatId = snapshot.docs[0]?.id;

    if (!chatId) return;

    const msgRef = collection(db, "chats", chatId, "messages");
    await addDoc(msgRef, {
      text: newMsg,
      uid: currentUid,
      createdAt: serverTimestamp(),
    });
    setNewMsg("");
  };

  return (
    <>
    <Navbar/>
       <div className="flex h-screen">
    
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Контакты</h2>
        {users.map(user => {
          const isOnline = userStatuses[user.uid] === "online";
          return (
            <div
              key={user.uid}
              onClick={() => setSelectedUser(user)}
              className={`cursor-pointer p-2 rounded mb-2 ${
                selectedUser?.uid === user.uid ? "bg-blue-400 text-white" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={user.photoURL || "https://via.placeholder.com/40"}
                    className="w-10 h-10 rounded-full"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                </div>
                <span>{user.displayName || "Без имени"}</span>
              </div>
            </div>
          );
        })}
        <button onClick={() => signOut(auth)} className="mt-4 underline text-sm text-red-600">
          Выйти
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="bg-blue-600 text-white p-4">
              <h1 className="text-lg">
                Чат с {selectedUser.displayName || "пользователем"}
              </h1>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-md ${
                    msg.uid === currentUid ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <img
                    src={
                      msg.uid === currentUid
                        ? auth.currentUser.photoURL || "https://via.placeholder.com/40"
                        : selectedUser.photoURL || "https://via.placeholder.com/40"
                    }
                    className="w-10 h-10 rounded-full object-cover border"
                    alt="аватар"
                  />
                  <div
                    className={`p-3 rounded-lg shadow ${
                      msg.uid === currentUid
                        ? "bg-blue-500 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Сообщение..."
                className="flex-1 border p-2 rounded"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Выберите пользователя для начала чата
          </div>
        )}
      </div>
    </div>
    </>
   
  );
}
