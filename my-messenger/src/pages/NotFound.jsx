// Page404.jsx — Красивая 404 страница с тематической гифкой и контактами
import React from "react";
import { Link } from "react-router-dom";
import { FaReact, FaGithub, FaTelegramPlane } from "react-icons/fa";

const Page404 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] to-[#161b22] text-white flex flex-col items-center justify-center px-6 py-12 font-sans">
 <img
  src="https://media.giphy.com/media/9J7tdYltWyXIY/giphy.gif"
  alt="Astronaut lost in space"
  className="w-72 mb-6 rounded-lg shadow-lg"
/>

      <h1 className="text-5xl font-extrabold mb-4 text-white text-center">404 — Страница не найдена</h1>
      <p className="text-center max-w-xl text-gray-400 mb-6">
        Возможно, вы ввели неправильный адрес или эта страница была <span className="text-red-500">удалена</span>. Пожалуйста, проверьте URL или вернитесь на главную страницу.
      </p>

      

      <Link
        to="/feed"
        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-medium transition"
      >
        Вернуться на главную
      </Link>

      <div className="mt-10 flex space-x-6 text-2xl text-cyan-400">
        <a href="https://t.me/sddffhf1" target="_blank" rel="noreferrer" className="hover:text-cyan-300">
          <FaTelegramPlane />
        </a>
        <a href="https://github.com/said-pwn" target="_blank" rel="noreferrer" className="hover:text-cyan-300">
          <FaGithub />
        </a>
      </div>
    </div>
  );
};

export default Page404;