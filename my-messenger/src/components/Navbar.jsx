import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
      <nav className="flex space-x-6 items-center flex-wrap">
        <Link to="/coming-soon" className="hover:underline whitespace-nowrap">
          Чат
        </Link>

        <Link
          to="/feed"
          className="hover:underline flex items-center whitespace-nowrap"
        >
          Посты
          <span className="ml-1 px-1 py-0.2 text-[7px] sm:text-xs font-semibold rounded-full bg-red-600 text-white select-none">
            NEW
          </span>
        </Link>

        <Link to="/news" className="hover:underline whitespace-nowrap">
          Новости
        </Link>

        <Link to="/coming-soon" className="hover:underline whitespace-nowrap">
          Профиль
        </Link>
        <Link to="*" className="hover:underline whitespace-nowrap">
          Обновления
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => signOut(auth)}
          className="text-sm underline whitespace-nowrap"
        >
          Выйти
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
