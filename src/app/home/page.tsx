"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, Monitor, MessageCircle, Phone, LogOut } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
      } else {
        setUsername(auth.currentUser.email || "User");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Framer Motion variants for entry animations
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16"
      style={{
        background: "linear-gradient(to right, #00dbde, #fc00ff)",
      }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          Welcome, {username}! 🎉
        </h1>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 px-5 py-2 text-white font-semibold shadow hover:opacity-90 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {/* Watch Together */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ scale: 1.08 }}
          className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg border border-white/30 flex flex-col items-center text-center cursor-pointer hover:shadow-2xl transition"
          onClick={() => router.push("/room")}
        >
          <Video className="w-12 h-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-semibold text-white">Watch Together</h2>
          <p className="text-gray-200 text-sm mt-2">
            Sync YouTube or share your screen to watch movies together.
          </p>
        </motion.div>

        {/* Screen Share */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.08 }}
          className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg border border-white/30 flex flex-col items-center text-center cursor-pointer hover:shadow-2xl transition"
          onClick={() => router.push("/screenshare")}
        >
          <Monitor className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-white">Screen Share</h2>
          <p className="text-gray-200 text-sm mt-2">
            Share your screen in realtime using WebRTC.
          </p>
        </motion.div>

        {/* Chat */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.08 }}
          className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg border border-white/30 flex flex-col items-center text-center cursor-pointer hover:shadow-2xl transition"
        >
          <MessageCircle className="w-12 h-12 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold text-white">Chat</h2>
          <p className="text-gray-200 text-sm mt-2">
            Send realtime messages with your partner.
          </p>
        </motion.div>

        {/* Call */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.08 }}
          className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg border border-white/30 flex flex-col items-center text-center cursor-pointer hover:shadow-2xl transition"
        >
          <Phone className="w-12 h-12 text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold text-white">Call</h2>
          <p className="text-gray-200 text-sm mt-2">
            Voice or video call directly in the browser.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
