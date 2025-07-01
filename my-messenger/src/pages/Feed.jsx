import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";

export default function Feed() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const navigate = useNavigate();

  const uploadToImgbb = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(
      "https://api.imgbb.com/1/upload?key=2093b4686774bf79ba1019f59082ae4b",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    return data.data.url;
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setUploading(true);
    let imageURL = null;
    if (image) imageURL = await uploadToImgbb(image);

    if (editingPostId) {
      await updateDoc(doc(db, "posts", editingPostId), {
        text,
        imageURL,
        editedAt: serverTimestamp(),
      });
      setEditingPostId(null);
    } else {
      await addDoc(collection(db, "posts"), {
        text,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        imageURL,
        likes: [],
      });
    }

    setText("");
    setImage(null);
    setUploading(false);
  };

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const rawPosts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const usersSnap = await getDocs(collection(db, "users"));
      const usersMap = {};
      usersSnap.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });

      const enriched = await Promise.all(
        rawPosts.map(async (post) => {
          const user = usersMap[post.uid] || {};
          const commentsSnap = await getDocs(
            collection(db, "posts", post.id, "comments")
          );
          const comments = commentsSnap.docs.map((doc) => doc.data());
          return {
            ...post,
            displayName: user.displayName || "Без имени",
            photoURL: user.photoURL || "https://via.placeholder.com/40",
            comments,
          };
        })
      );

      setPosts(enriched);
    });

    return unsub;
  }, []);

  const toggleLike = async (post) => {
    const postRef = doc(db, "posts", post.id);
    const likesArray = Array.isArray(post.likes) ? post.likes : [];
    const userId = auth.currentUser.uid;
    const isLiked = likesArray.includes(userId);
    const updatedLikes = isLiked
      ? likesArray.filter((id) => id !== userId)
      : [...likesArray, userId];

    await updateDoc(postRef, { likes: updatedLikes });
  };

  const handleDelete = async (postId) => {
    if (confirm("Удалить пост?")) {
      await deleteDoc(doc(db, "posts", postId));
    }
  };

  const handleComment = async (postId) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    const commentRef = collection(db, "posts", postId, "comments");
    await addDoc(commentRef, {
      text: commentText,
      uid: auth.currentUser.uid,
      photoURL: auth.currentUser.photoURL || "",
      displayName: auth.currentUser.displayName || "Аноним",
      createdAt: serverTimestamp(),
    });

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#121212] text-white py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-gradient">
            <div className="text-3xl font-bold mb-6 text-center text-gradient"><FaCamera /> Лента</div>
          </h1>

          <form onSubmit={handlePost} className="mb-6 space-y-3">
            <textarea
              placeholder="О чём вы думаете?"
              className="w-full bg-[#1e1e1e] border border-[#333] text-white p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows="3"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-sm text-gray-300"
            />
            <div className="flex items-center gap-2">{posts.length}  постов</div>
            <button
              disabled={uploading}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
            >
              {editingPostId ? "💾 Сохранить" : uploading ? "Загрузка..." : "Опубликовать"}
            </button>
          </form>

          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked =
                Array.isArray(post.likes) &&
                post.likes.includes(auth.currentUser.uid);
              const isOwner = post.uid === auth.currentUser.uid;

              return (
                <div
                  key={post.id}
                  className="bg-[#1a1a1a] p-5 rounded-lg shadow space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={post.photoURL}
                      alt="аватар"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                    {/* <p className="font-semibold text-white cursor-pointer hover:underline" onClick={() => navigate(`/profile/${post.uid}`)}>
  {post.displayName}
</p> */}
                      <p className="font-semibold text-white cursor-pointer hover:underline" onClick={() => navigate(`/profile/${post.uid}`)}>
                        {post.displayName}
                        
                      </p>
                      {post.editedAt && (
                          <span className="ml-2 text-xs text-gray-400">
                            (изменено)
                          </span>
                        )}
                      
                      <p className="text-xs text-gray-400">
                        {post.createdAt?.toDate().toLocaleString() || "только что"}
                      </p>
                      
                    </div>
                  </div>

                  <p className="text-white">{post.text}</p>

                  {post.imageURL && (
                    <img
                      src={post.imageURL}
                      alt="пост"
                      className="rounded-lg max-h-[500px] w-full object-cover"
                    />
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <button onClick={() => toggleLike(post)}>
                      ❤️ {post.likes?.length || 0} лайков
                    </button>
                    <span>💬 {post.comments?.length || 0} комментариев</span>

                    {isOwner && (
                      <div className="space-x-3">
                        <button
                          onClick={() => {
                            setText(post.text);
                            setEditingPostId(post.id);
                          }}
                          className="text-violet-400"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-400"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mt-2">
                    {post.comments?.map((comment, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <img
                          src={comment.photoURL || "https://via.placeholder.com/30"}
                          className="w-8 h-8 rounded-full object-cover"
                          alt="аватар"
                        />
                        <div className="bg-[#2a2a2a] rounded px-3 py-2 w-full">
                          <p className="font-semibold">{comment.displayName}</p>
                          <p>{comment.text}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-2">
                      <input
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder="Добавить комментарий..."
                        className="flex-1 bg-[#2a2a2a] text-white border border-[#444] p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="text-violet-400 text-sm"
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
