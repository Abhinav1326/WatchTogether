"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { Copy, X } from "lucide-react";
import type { User } from "firebase/auth";

export default function RoomLob() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
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
    if (!user) return;
    await setDoc(doc(db, "rooms", roomId), {
      host: user.uid,
      createdAt: Date.now(),
    });
    setCreatedRoom(roomId); // open modal
  };

  // Join Room
  const handleJoinRoom = () => {
    if (joinCode.trim()) {
      router.push(`/screenshare/${joinCode.trim()}`);
    }
  };

  // Copy link
  const handleCopy = () => {
    const link = `${window.location.origin}/screenshare/${createdRoom}`;
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
      {/* 
       */}

       feature still in progress
    </div>
  );
}
