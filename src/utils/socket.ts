import { io } from "socket.io-client";

// Prefer env var in Vercel; fall back to Render URL for local/dev
const SOCKET_URL =
	process.env.NEXT_PUBLIC_SOCKET_URL || "https://watchtogether-server-4co9.onrender.com";

const socket = io(SOCKET_URL, {
	// WebSocket first; fallback to polling if needed
	transports: ["websocket", "polling"],
	withCredentials: false,
});

export default socket;