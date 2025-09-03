"use client";
// ...existing code...
import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import socket from "@/utils/socket";
import YouTube from "react-youtube";

// ...existing code...

// socket is initialized in src/utils/socket.ts and uses env or Render URL

// ...existing code...

// ...existing code...

export default function RoomPage() {
  const { id } = useParams(); // id is the dynamic route param
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [roomUsernames, setRoomUsernames] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{user: string, text: string}[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const playerRef = useRef<any>(null);
  const [videoId, setVideoId] = useState("");
  const [showInput, setShowInput] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for room_users event to get all usernames in the room
  useEffect(() => {
    socket.on("room_users", (usernames: string[]) => {
      setRoomUsernames(usernames);
    });
    return () => {
      socket.off("room_users");
    };
  }, []);
  // Fetch Firestore username for logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        getDoc(doc(db, "users", user.uid)).then(userDoc => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.username || "Anonymous");
          } else {
            setUserName("Anonymous");
          }
        });
      } else {
        setUserId(null);
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);
  const ignoreSocketRef = useRef(false);

  useEffect(() => {
    socket.emit("join_room", id);

    // Listen for video sync events
    const handlePlay = ({ currentTime }: any) => {
      if (!playerRef.current) return;
      ignoreSocketRef.current = true;
      playerRef.current.seekTo(currentTime, true);
      playerRef.current.playVideo();
      setTimeout(() => { ignoreSocketRef.current = false; }, 500);
    };
    const handlePause = ({ currentTime }: any) => {
      if (!playerRef.current) return;
      ignoreSocketRef.current = true;
      playerRef.current.seekTo(currentTime, true);
      playerRef.current.pauseVideo();
      setTimeout(() => { ignoreSocketRef.current = false; }, 500);
    };
    const handleSeek = ({ currentTime }: any) => {
      if (!playerRef.current) return;
      ignoreSocketRef.current = true;
      playerRef.current.seekTo(currentTime, true);
      setTimeout(() => { ignoreSocketRef.current = false; }, 500);
    };
    const handleUrlChange = ({ url }: any) => {
      const vid = extractVideoId(url);
      if (vid) {
        setVideoId(vid);
        setShowInput(false);
      }
    };

    socket.on("video_play", handlePlay);
    socket.on("video_pause", handlePause);
    socket.on("video_seek", handleSeek);
    socket.on("video_url_change", handleUrlChange);
    return () => {
      socket.off("video_play", handlePlay);
      socket.off("video_pause", handlePause);
      socket.off("video_seek", handleSeek);
      socket.off("video_url_change", handleUrlChange);
    };
  }, [id]);
  useEffect(() => {
    if (userName && id) {
      socket.emit("join_room", { roomId: id, username: userName });
    }

    const syncHandler = ({ action, time, videoId: vid }: any) => {
      if (!playerRef.current) {
        return;
      }
      ignoreSocketRef.current = true;
      switch (action) {
        case "play":
          playerRef.current.seekTo(time, true);
          playerRef.current.playVideo();
          break;
        case "pause":
          playerRef.current.pauseVideo();
          break;
        case "seek":
          playerRef.current.seekTo(time, true);
          break;
      }
      setTimeout(() => { ignoreSocketRef.current = false; }, 500);
    };

    socket.on("sync_state", syncHandler);
    return () => {
      socket.off("sync_state", syncHandler);
    };
  }, [id, userName]);

  // Chat socket logic
  useEffect(() => {
    const handleChatMessage = (msg: {user: string, text: string}) => {
      setMessages(prev => [...prev, msg]);
    };
    const handleChatHistory = (history: {user: string, text: string}[]) => {
      setMessages(history);
    };
    socket.on("chat_message", handleChatMessage);
    socket.on("room_chat_history", handleChatHistory);
    return () => {
      socket.off("chat_message", handleChatMessage);
      socket.off("room_chat_history", handleChatHistory);
    };
  }, []);

  const sendMessage = () => {
    if (chatInput.trim()) {
      const msg = { user: userName || "Anonymous", text: chatInput };
      socket.emit("chat_message", msg);
      setChatInput(""); // Don't add locally, will be received from server
    }
  };

  // Helper to extract YouTube video ID from URL
  const extractVideoId = (url: any) => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const handleSetVideo = () => {
    const vid = extractVideoId(inputUrl);
    if (vid) {
      setVideoId(vid);
      setShowInput(false);
      // Broadcast URL change to others
      socket.emit("video_url_change", { roomId: id, url: inputUrl });
    } else {
      alert("Invalid YouTube URL");
    }
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const handlePlay = () => {
    if (!playerRef.current || ignoreSocketRef.current) return;
    const time = playerRef.current.getCurrentTime();
    socket.emit("video_play", { roomId: id, currentTime: time });
  };

  const handlePause = () => {
    if (!playerRef.current || ignoreSocketRef.current) return;
    const time = playerRef.current.getCurrentTime();
    socket.emit("video_pause", { roomId: id, currentTime: time });
  };

  const handleSeek = () => {
    if (!playerRef.current || ignoreSocketRef.current) return;
    const time = playerRef.current.getCurrentTime();
    socket.emit("video_seek", { roomId: id, currentTime: time });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden text-white pt-20">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-tr from-[#1e3c72] via-[#2a5298] to-[#f441a5] bg-[length:400%_400%]" style={{ filter: 'blur(0px)' }} />
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 -z-10 bg-white/10 backdrop-blur-2xl" />
      <div className="w-full max-w-7xl px-2 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-center">
        {/* Left: 8/12 - Paste link and video */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="md:col-span-8 col-span-12 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6 w-full">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
              className="mb-6 text-lg font-semibold px-6 py-2 rounded-xl bg-white/20 shadow-lg backdrop-blur-md border border-white/20 w-full text-center">
              <span className="font-mono text-xl text-indigo-200">Room Code: {id}</span>
            </motion.div>
            {videoId && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full flex justify-center mb-6">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white/10 backdrop-blur-xl w-full flex justify-center">
                  <div className="w-full" style={{ maxWidth: '900px' }}>
                    <YouTube
                      videoId={videoId}
                      opts={{
                        width: '100%',
                        height: typeof window !== 'undefined' && window.innerWidth < 640 ? '180' : typeof window !== 'undefined' && window.innerWidth < 1024 ? '240' : '320',
                        playerVars: { autoplay: 0 }
                      }}
                      onReady={onReady}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onStateChange={(e) => {
                        if (e.data === 1) handlePlay();
                        if (e.data === 2) handlePause();
                        if (e.data === 3) handleSeek();
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <input
              type="text"
              className="p-3 rounded-xl text-black w-full max-w-lg mb-3 border-2 border-indigo-300 focus:border-pink-400 outline-none shadow-lg"
              placeholder="Paste YouTube video link here"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-pink-500 via-indigo-500 to-blue-500 hover:from-indigo-500 hover:to-pink-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 w-full max-w-lg"
              onClick={handleSetVideo}
            >
              Set Video
            </button>
          </div>
        </motion.div>
        {/* Right: 4/12 - Vertical chatbox */}
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="md:col-span-4 col-span-12 flex flex-col h-full">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-indigo-400/30 via-pink-200/20 to-blue-200/20 rounded-3xl p-3 md:p-6 shadow-2xl w-full flex flex-col h-full min-h-[260px] md:min-h-[320px] max-h-[400px] md:max-h-[500px] border-2 border-white/20 backdrop-blur-xl">
            {/* Room code removed from chatbox */}
            <div className="h-56 md:h-64 overflow-y-auto mb-2 flex flex-col gap-2 pr-2 hide-scrollbar">
              {messages.map((msg, idx) => {
                const isOwn = msg.user === userName;
                return (
                  <div key={idx} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} w-full`}>
                    <span
                      className={`text-xs font-medium mb-1 ${
                        isOwn
                          ? 'text-blue-300 text-right pr-2'
                          : 'text-pink-300 text-left pl-2'
                      }`}
                      style={{ letterSpacing: '0.02em' }}
                    >
                      {msg.user}
                    </span>
                    <motion.div
                      initial={{ x: isOwn ? 40 : -40, opacity: 0, scale: 0.95 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
                      className={`text-sm px-3 py-2 rounded-xl shadow-md border border-white/10 flex items-center gap-2 max-w-[80%] ${
                        isOwn
                          ? 'ml-auto bg-gradient-to-r from-blue-500/40 via-indigo-400/30 to-pink-400/20 text-right justify-end'
                          : 'mr-auto bg-gradient-to-r from-indigo-500/30 via-pink-400/20 to-blue-400/20 text-left justify-start'
                      }`}
                      style={{
                        boxShadow: '0 2px 12px 0 rgba(80, 0, 120, 0.10)',
                      }}
                    >
                      <span className="text-white animate-fade-in">{msg.text}</span>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
              className="flex flex-col xs:flex-row gap-2 mt-auto w-full">
              <motion.input
                type="text"
                className="p-3 rounded-xl text-black w-full xs:w-auto flex-1 border-2 border-indigo-300 focus:border-pink-400 outline-none shadow-lg transition-all duration-300 min-w-0"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                whileFocus={{ scale: 1.03, boxShadow: '0 0 0 2px #f441a5' }}
              />
              <motion.button
                className="bg-gradient-to-r from-pink-500 via-indigo-500 to-blue-500 hover:from-indigo-500 hover:to-pink-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 w-full xs:w-auto"
                onClick={sendMessage}
                whileHover={{ scale: 1.08, background: 'linear-gradient(90deg,#2a5298,#f441a5)' }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </motion.div>
            {/* Custom CSS for gradient text and fade-in animation */}
            <style jsx>{`
              .hide-scrollbar {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .animate-gradient-text {
                background: linear-gradient(90deg, #f441a5, #2a5298, #2a5298, #f441a5);
                background-size: 200% 200%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradientMove 2s linear infinite;
              }
              @keyframes gradientMove {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
              }
              .animate-fade-in {
                animation: fadeIn 0.7s ease;
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
