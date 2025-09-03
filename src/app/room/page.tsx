"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { Copy, X } from "lucide-react";

export default function RoomLobby() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [createdRoom, setCreatedRoom] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Create Room
  const handleCreateRoom = async () => {
    const roomId = nanoid(8); // short unique ID
    await setDoc(doc(db, "rooms", roomId), {
      host: user.uid,
      createdAt: Date.now(),
    });
    setCreatedRoom(roomId); // open modal
  };

  // Join Room
  const handleJoinRoom = () => {
    if (joinCode.trim()) {
      router.push(`/room/${joinCode.trim()}`);
    }
  };

  // Copy link
  const handleCopy = () => {
    const link = `${window.location.origin}/room/${createdRoom}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{
        background: "linear-gradient(to right, #00dbde, #fc00ff)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">
          🎬 Watch Together
        </h1>

        {/* Create Room */}
        <button
          onClick={handleCreateRoom}
          className="w-full mb-6 rounded-xl bg-gradient-to-r from-green-400 to-emerald-600 px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Create Room
        </button>

        {/* Join Room */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Enter Room Code..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-white placeholder-gray-300 outline-none border border-white/20 focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleJoinRoom}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition"
          >
            Join
          </button>
        </div>
      </motion.div>

      {/* Popup Modal */}
      <AnimatePresence>
        {createdRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-xl p-6 text-center relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setCreatedRoom(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-white mb-4">
                🎉 Room Created!
              </h2>
              <p className="text-gray-200 mb-2">
                Share this code or link with your partner:
              </p>

              {/* Room Code */}
              <div className="bg-black/30 text-white text-lg font-mono px-4 py-2 rounded-lg mb-4">
                {createdRoom}
              </div>

              {/* Shareable Link */}
              <div className="flex items-center justify-between bg-black/30 text-white px-4 py-2 rounded-lg">
                <span className="truncate">
                  {`${window.location.origin}/room/${createdRoom}`}
                </span>
                <button
                  onClick={handleCopy}
                  className="ml-3 text-white hover:text-gray-300"
                >
                  <Copy size={20} />
                </button>
              </div>
              {copied && (
                <p className="text-green-300 mt-2 text-sm">Copied! ✅</p>
              )}

              {/* Go to Room Button */}
              <button
                onClick={() => router.push(`/room/${createdRoom}`)}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition"
              >
                Go to Room
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
