import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  const toggleRole = async (uid, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", uid), { role: newRole });
    setUsers(u => u.map(user =>
      user.id === uid ? { ...user, role: newRole } : user
    ));
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">🛠 Админка</h1>
        <ul className="space-y-4">
          {users.map(u => (
            <li key={u.id} className="flex justify-between items-center p-4 bg-gray-100 rounded">
              <span>{u.displayName} — <em>{u.role}</em></span>
              <button
                onClick={() => toggleRole(u.id, u.role)}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {u.role === "admin" ? "Снять админа" : "Сделать админом"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
