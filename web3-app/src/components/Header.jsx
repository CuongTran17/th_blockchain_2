import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdLightMode } from "react-icons/md";
import { FaMoon } from "react-icons/fa";
import { toast } from "react-toastify";
import { truncate, useGlobalState } from "../store";
import { connectWallet } from "../Blockchain.services";

const Header = () => {
  const [connectedAccount] = useGlobalState("connectedAccount");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") === "light" ? "light" : "dark"
  );
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleConnect = async () => {
    setConnecting(true);

    try {
      await connectWallet();
    } catch (error) {
      toast.error(error.message || "Không thể kết nối ví.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#212936]">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="https://haitrieu.com/wp-content/uploads/2021/10/Logo-Hoc-Vien-Cong-Nghe-Buu-Chinh-Vien-Thong-PTITSimple-635x807.png"
            alt="PTIT"
            className="w-8 h-10 object-contain"
          />
          <span className="font-bold text-xl">PTIT Dominion</span>
        </Link>

        <div className="flex items-center space-x-5">
          <button
            type="button"
            aria-label="Đổi giao diện sáng tối"
            className="text-blue-500"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            {theme === "dark" ? <MdLightMode /> : <FaMoon />}
          </button>

          {connectedAccount ? (
            <span className="border border-blue-500 text-blue-500 rounded-full px-4 py-2 text-xs">
              {truncate(connectedAccount, 4, 4, 11)}
            </span>
          ) : (
            <button
              type="button"
              disabled={connecting}
              onClick={handleConnect}
              className="border border-blue-500 text-blue-500 rounded-full px-4 py-2 text-xs disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;