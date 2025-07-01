import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function ChatList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = [];
      snap.forEach((doc) => {
        if (doc.id !== auth.currentUser.uid) {
          list.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(list);
    });
    return unsub;
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">💬 Выберите пользователя</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <Link
            to={`/chat/${user.id}`}
            key={user.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-white shadow hover:bg-blue-100 transition"
          >
            <img
              src={user.photoURL || "https://via.placeholder.com/40"}
              alt="аватар"
              className="w-10 h-10 rounded-full object-cover border"
            />
            <span className="font-medium">{user.displayName || "Без имени"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
