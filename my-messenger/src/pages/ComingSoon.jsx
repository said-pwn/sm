// Page404.jsx — Красивая 404 страница с тематической гифкой и контактами
import React from "react";
import { Link } from "react-router-dom";
import { FaReact, FaGithub, FaTelegramPlane } from "react-icons/fa";

const Page404 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-black flex flex-col items-center justify-center px-6 py-12 font-sans">
<img
   src="https://media.giphy.com/media/YQitE4YNQNahy/giphy.gif"
  alt="Under construction sign"
  className="w-64 mb-6 rounded-lg shadow-md"
/>

      <h1 className="text-4xl font-bold mb-3 text-center">Страница в разработке</h1>
      <p className="text-center max-w-xl mb-4">
        Разработчик готовит эту страницу к запуску. Благодарю за терпение! Следите за обновлениями в разделе 
        <Link
                to="/news"
                className=" underline text-blue-600 hover:text-blue-800 transition font-medium pl-1" 
              >
                News
              </Link>.
      </p>


      <Link
        to="/feed"
        className="px-6 py-3 bg-black rounded-lg text-white font-medium transition mb-10 "
      >
        Вернуться на главную
      </Link>

       <div className="flex space-x-6 text-2xl text-black/90">
        <a href="https://t.me/sddffhf1" target="_blank" rel="noreferrer" className="hover:text-white">
          <FaTelegramPlane />
        </a>
        <a href="https://github.com/said-pwn" target="_blank" rel="noreferrer" className="hover:text-white">
          <FaGithub />
        </a>
      </div>
    </div>
  );
};

export default Page404;