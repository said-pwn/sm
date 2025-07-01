import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

export default function PrivateChat() {
  const { userId } = useParams(); // 👈 ID собеседника
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const currentUid = auth.currentUser?.uid;
  const chatId = [currentUid, userId].sort().join("_");

  useEffect(() => {
    const q = query(
      collection(db, "privateChats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsub;
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    await addDoc(collection(db, "privateChats", chatId, "messages"), {
      text: newMsg,
      uid: currentUid,
      createdAt: serverTimestamp()
    });

    setNewMsg("");
  };

  if (!currentUid) return <div className="p-10">Пользователь не авторизован</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Приватный чат</h1>

      <div className="h-96 overflow-y-auto border rounded p-2 space-y-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-2 rounded ${
              msg.uid === currentUid ? "bg-blue-100 ml-auto text-right" : "bg-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Введите сообщение"
        />
        <button className="bg-blue-500 text-white px-4 rounded">➤</button>
      </form>
    </div>
  );
}
