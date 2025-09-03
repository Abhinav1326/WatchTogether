"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/home");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignup = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Save user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        email,
        createdAt: serverTimestamp(),
      });

      router.push("/home");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Signup failed");
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const user = userCred.user;

      // Save user details in Firestore (if not already)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: user.displayName || "",
        email: user.email,
        createdAt: serverTimestamp(),
      }, { merge: true });

      router.push("/home");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Signup failed");
      }
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-200 via-slate-300 to-slate-600">
      <div className="w-96 rounded-2xl bg-white/20 p-8 shadow-xl backdrop-blur-2xl border border-white/30">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 drop-shadow">
          Sign Up
        </h1>

        {error && <p className="mb-3 text-red-500 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full rounded-xl bg-white/30 p-3 text-gray-900 placeholder-gray-700 outline-none focus:ring-2 focus:ring-indigo-300"
        />

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
          onClick={handleSignup}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 px-4 py-3 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Sign Up
        </button>

        <button
          onClick={handleGoogleSignup}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 px-4 py-3 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Sign up with Google
        </button>

        <p className="mt-4 text-center text-gray-900">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-700 font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
