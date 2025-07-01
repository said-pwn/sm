import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import { FaHeart, FaRegClock, FaMoon, FaSun } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [text, setText] = useState("");
  const [role, setRole] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [theme, setTheme] = useState("light");
  const [visibleCount, setVisibleCount] = useState(5);

  // Добавим состояние для файла и загрузки
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Получаем роль текущего пользователя
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "users")), (snap) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setRole(null);
        return;
      }
      const me = snap.docs.find((d) => d.id === currentUser.uid)?.data();
      setRole(me?.role || null);
    });
    return unsub;
  }, []);

  // Загружаем новости из Firestore
  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNews(data);
    });
    return unsub;
  }, []);

  // Фильтрация новостей по поиску и дате
  const filteredNews = news
    .filter((item) => {
      const searchText = `${item.title} ${item.summary} ${item.text}`.toLowerCase();
      return searchText.includes(searchTerm.toLowerCase());
    })
    .filter((item) => {
      if (filter === "all") return true;
      const now = new Date();
      const created = item.createdAt ? item.createdAt.toDate() : new Date(0);
      const diffMs = now - created;
      if (filter === "day") return diffMs < 24 * 60 * 60 * 1000;
      if (filter === "week") return diffMs < 7 * 24 * 60 * 60 * 1000;
      if (filter === "month") return diffMs < 30 * 24 * 60 * 60 * 1000;
      return true;
    })
    .slice(0, visibleCount);


  const uploadToImgBB = async (file) => {
    const apiKey = "2093b4686774bf79ba1019f59082ae4b  "; 
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error("Ошибка загрузки изображения на ImgBB");
    }
  };

  // Публикация новости с картинкой
  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !text.trim()) return;

    setUploading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadToImgBB(imageFile);
      }

      await addDoc(collection(db, "news"), {
        title: title.trim(),
        summary: summary.trim(),
        text: text.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        likes: [],
      });

      // Очистка полей
      setTitle("");
      setSummary("");
      setText("");
      setImageFile(null);
    } catch (error) {
      console.error("Ошибка при добавлении новости:", error);
      alert("Ошибка при добавлении новости: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Лайк/дизлайк новости
  const toggleLike = async (item) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const liked = item.likes.includes(userId);
    const updatedLikes = liked
      ? item.likes.filter((id) => id !== userId)
      : [...item.likes, userId];
    try {
      await updateDoc(doc(db, "news", item.id), { likes: updatedLikes });
    } catch (error) {
      console.error("Ошибка при обновлении лайков:", error);
    }
  };

  // Раскрытие/сворачивание полного текста новости
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Форматирование даты из Firestore Timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
  };

  // Переключение темы (светлая/тёмная)
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen py-12 px-6 flex flex-col items-center transition-colors duration-500 ${
          theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-900 text-gray-100"
        }`}
      >
        <header className="max-w-4xl w-full mb-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4">Новости сайта</h1>
          <p className="text-lg text-gray-600 mb-6">
            Последние важные обновления и свежие события — оставайтесь в курсе всего, что происходит на сайте.
          </p>

          <div className="flex justify-center items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-4 py-2 rounded-md border focus:outline-none focus:ring-2 ${
                theme === "light"
                  ? "border-gray-300 focus:ring-indigo-500"
                  : "border-gray-700 focus:ring-indigo-400 bg-gray-800"
              }`}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-2 rounded-md border focus:outline-none focus:ring-2 ${
                theme === "light"
                  ? "border-gray-300 focus:ring-indigo-500"
                  : "border-gray-700 focus:ring-indigo-400 bg-gray-800"
              }`}
            >
              <option value="all">Все</option>
              <option value="day">За сутки</option>
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
            </select>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
              aria-label="Переключить тему"
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>
          </div>
        </header>

        {role === "admin" && (
          <form
            onSubmit={handlePost}
            className={`max-w-4xl w-full mb-12 rounded-lg p-6 shadow-md ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
          >
            <input
              type="text"
              placeholder="Заголовок новости"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mb-4 w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                theme === "light"
                  ? "border-gray-300 focus:ring-indigo-500"
                  : "border-gray-700 focus:ring-indigo-400 bg-gray-700 text-white"
              }`}
              required
              maxLength={100}
            />
            <input
              type="text"
              placeholder="Краткое описание (анонс)"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className={`mb-4 w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                theme === "light"
                  ? "border-gray-300 focus:ring-indigo-500"
                  : "border-gray-700 focus:ring-indigo-400 bg-gray-700 text-white"
              }`}
              required
              maxLength={150}
            />
            <textarea
              rows={4}
              maxLength={280}
              placeholder="Полный текст новости"
              className={`w-full p-4 border rounded-md resize-none focus:outline-none focus:ring-2 ${
                theme === "light"
                  ? "border-gray-300 focus:ring-indigo-500"
                  : "border-gray-700 focus:ring-indigo-400 bg-gray-700 text-white"
              }`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />

            <label
              htmlFor="imageUpload"
              className="block mb-2 font-semibold mt-4 text-gray-700 dark:text-gray-300"
            >
              Добавить изображение (не обязательно)
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={uploading}
              className={`w-full mb-4 ${
                theme === "light"
                  ? "text-gray-900"
                  : "text-gray-200 bg-gray-700"
              }`}
            />

            <button
              type="submit"
              disabled={
                !title.trim() ||
                !summary.trim() ||
                !text.trim() ||
                uploading
              }
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Загрузка..." : "Опубликовать"}
            </button>
          </form>
        )}

        <section className="max-w-4xl w-full space-y-10">
          {filteredNews.length === 0 && (
            <p className="text-center italic">Нет новостей по вашему запросу</p>
          )}

          <AnimatePresence>
            {filteredNews.map((item) => {
              const liked = auth.currentUser
                ? item.likes.includes(auth.currentUser.uid)
                : false;
              const isExpanded = expandedIds.has(item.id);

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  layout
                  className={`rounded-lg p-6 shadow-md cursor-default transition-shadow hover:shadow-lg ${
                    theme === "light" ? "bg-white" : "bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm space-x-2 text-gray-500">
                      <FaRegClock />
                      <time dateTime={item.createdAt?.toDate().toISOString()}>
                        {formatDate(item.createdAt)}
                      </time>
                    </div>
                    <button
                      onClick={() => toggleLike(item)}
                      aria-label="Поставить лайк новости"
                      className={`flex items-center gap-2 transition-colors duration-300 ${
                        liked
                          ? "text-red-500 hover:text-red-600"
                          : theme === "light"
                          ? "text-gray-400 hover:text-gray-600"
                          : "text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <FaHeart />
                      <span className="font-semibold">{item.likes.length}</span>
                    </button>
                  </div>

                  <h2
                    className={`text-2xl font-extrabold mb-2 ${
                      theme === "light" ? "text-gray-900" : "text-gray-100"
                    }`}
                  >
                    {item.title}
                  </h2>

                  <p
                    className={`text-lg mb-3 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    {item.summary}
                  </p>

                  {/* Картинка новости */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full max-h-96 object-cover rounded-md mb-4"
                    />
                  )}

                  <p
                    className={`leading-relaxed transition-max-height duration-500 overflow-hidden ${
                      isExpanded ? "max-h-96" : "max-h-20"
                    } ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    {item.text}
                  </p>

                  {item.text.length > 100 && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={`mt-3 font-semibold ${
                        theme === "light"
                          ? "text-indigo-600 hover:text-indigo-700"
                          : "text-indigo-400 hover:text-indigo-500"
                      }`}
                    >
                      {isExpanded ? "Скрыть" : "Читать далее"}
                    </button>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {filteredNews.length < news.length && (
            <button
              onClick={() => setVisibleCount((v) => v + 5)}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-md transition"
            >
              Показать ещё
            </button>
          )}
        </section>
      </div>
    </>
  );
}
