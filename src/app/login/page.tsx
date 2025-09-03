"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/home");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Login failed");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/home");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-200 via-slate-300 to-slate-600">
      <div className="w-96 rounded-2xl bg-white/20 p-8 shadow-xl backdrop-blur-2xl border border-white/30">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 drop-shadow">
          Login
        </h1>

        {error && <p className="mb-3 text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/30 p-3 text-gray-900 placeholder-gray-700 outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/30 p-3 text-gray-900 placeholder-gray-700 outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 px-4 py-3 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Sign In
        </button>

        <button
          onClick={handleGoogleLogin}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 px-4 py-3 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-gray-900">
          Don’t have an account?{" "}
          <a href="/signup" className="text-indigo-700 font-medium hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
