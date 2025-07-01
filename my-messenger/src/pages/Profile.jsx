import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";

export default function Profile() {
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(true);

  const userRef = doc(db, "users", auth.currentUser.uid);

  useEffect(() => {
    const fetchUserData = async () => {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNickname(data.displayName || "");
        setPhotoURL(data.photoURL || "");
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const uploadToImgbb = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("https://api.imgbb.com/1/upload?key=2093b4686774bf79ba1019f59082ae4b", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.data.url;
  };

  const handleSave = async () => {
    let avatarURL = photoURL;

    if (avatar) {
      avatarURL = await uploadToImgbb(avatar);
    }

    await updateDoc(userRef, {
      displayName: nickname,
      photoURL: avatarURL,
    });
    setPhotoURL(avatarURL);
    alert("Профиль обновлён ✔️");
  };

  if (loading) return <div className="p-10 text-center">Загрузка профиля...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl">
      <h1 className="text-2xl font-bold text-center mb-4">👤 Профиль</h1>

      <div className="flex flex-col items-center">
        <img
          src={photoURL || "https://via.placeholder.com/150"}
          alt="Аватар"
          className="w-32 h-32 rounded-full object-cover border-2 border-blue-500 mb-4"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files[0])}
          className="mb-4"
        />

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Ваш никнейм"
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          💾 Сохранить изменения
        </button>
      </div>
    </div>
  );
}
