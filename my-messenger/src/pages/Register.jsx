import { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: nickname });
      

      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        displayName: nickname,
        avatar: "",
        status: "online",
        typing: false,
        role: "user" // default role
      });

      toast.success("Registration successful!");
      navigate("/chat");
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
        <input className="border p-2 mb-2 w-full rounded" type="text" placeholder="Nickname" onChange={(e) => setNickname(e.target.value)} required />
        <input className="border p-2 mb-2 w-full rounded" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input className="border p-2 mb-4 w-full rounded" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full">Sign Up</button>
        <p className="text-sm mt-3 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
