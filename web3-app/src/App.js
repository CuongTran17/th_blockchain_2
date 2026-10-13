import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Header from "./components/Header";
import Home from "./views/Home";
import Proposal from "./views/Proposal";
import { isWallectConnected, getInfo, getProposals } from "./Blockchain.services";
import { useGlobalState } from "./store";

const App = () => {
  const [account] = useGlobalState("connectedAccount");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const connected = await isWallectConnected();
        if (connected) {
          await getInfo();
          await getProposals();
        }
      } catch (error) {
        if (active) setError(error.message || "Không thể đọc dữ liệu DAO.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#212936] dark:text-gray-300">
      <Header />
      {loading ? <p className="p-8">Loading DAO...</p> : error ? (
        <p role="alert" className="p-8 text-red-500">{error}</p>
      ) : !account ? <p className="p-8">Please connect your wallet to use the DAO.</p> : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proposal/:id" element={<Proposal />} />
          <Route path="*" element={<p className="p-8">Page not found.</p>} />
        </Routes>
      )}
      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
};

export default App;
