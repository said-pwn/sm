import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import Feed from "./pages/Feed";
import PrivateChat from "./components/PrivateChat";
import ChatList from "./components/ChatList";
import News from "./pages/News";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import ComingSoon from "./pages/ComingSoon";
 import AdminLogin from "./pages/AdminLogin";
//  import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminrRoute";



function App() {
  const [user, loading] = useAuthState(auth);
  useOnlineStatus(user); 

  useEffect(() => {
    const setUserOnline = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          online: true,
        });

        const handleBeforeUnload = async () => {
          await updateDoc(userRef, {
            online: false,
            lastSeen: serverTimestamp(),
          });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        
        return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };
      }
    };

    setUserOnline();
  }, [user]);

  if (loading) return <p className="text-center p-10">Загрузка...</p>;

  return (    
      <Router>
   
      <Routes>
      
        {!user ? (
          <>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
            {/* <Route path="/admin" element={<Navigate to="/adm-log" />} /> */}
          </>
        ) : (
          <>
            <Route path="/chat" element={<Chat />} />
            {/* <Route path="*" element={<Navigate to="/not" />} /> */}
            <Route path="/profile/:uid" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/news" element={<News />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/" element={<ChatList />} />
            <Route path="/chat/:userId" element={<PrivateChat />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* <Route path="/adm-log" element={<Navigate to="/admin" />} /> */}
            <Route path="/admin" element={<AdminRoute />} />
            
            {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
         

          </>
        )}
      </Routes>
 
    </Router>

    
  );
}

export default App;
