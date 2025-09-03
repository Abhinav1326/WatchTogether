"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
  <nav className="fixed top-4 left-1/2 z-50 w-[100%] max-w-7xl -translate-x-1/2 rounded-2xl border border-white/20 bg-white/30 backdrop-blur-lg shadow-lg">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Left Side: App Name */}
        <Link
          href="/home"
          className="text-white font-bold text-2xl tracking-wide drop-shadow-sm"
        >
          Watch&Fun!
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-white font-medium">
          <Link href="/home" className="hover:opacity-80 transition">
            Home
          </Link>
          <Link href="/help" className="hover:opacity-80 transition">
            Help
          </Link>
          <Link href="/about" className="hover:opacity-80 transition">
            About
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || "/profile.png"}
                alt="profile"
                className="w-10 h-10 rounded-full border border-white/30 shadow-md cursor-pointer"
                onClick={handleLogout}
                title="Click to logout"
              />
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-white/20 px-4 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center gap-4 py-6 border-t border-white/20 bg-white/30 backdrop-blur-xl rounded-b-2xl">
          <Link
            href="/home"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/help"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            Help
          </Link>
          <Link
            href="/about"
            className="hover:opacity-80 transition"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>

          {user ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={user.photoURL || "/profile.png"}
                alt="profile"
                className="w-12 h-12 rounded-full border border-white/30 shadow-md"
                onClick={handleLogout}
              />
              <button
                onClick={handleLogout}
                className="text-sm bg-white/20 px-3 py-1 rounded-lg border border-white/30 hover:bg-white/30 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-white/20 px-4 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
