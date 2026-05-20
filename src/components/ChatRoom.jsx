import { useState, useEffect } from "react";
import { auth, loginWithGoogle, loginWithGoogleRedirect, logout, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

export default function ChatRoom() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Cek login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Ambil pesan real-time (tidak perlu login untuk melihat)
  useEffect(() => {
    console.log("Setting up Firestore listener...");
    console.log("Database instance:", db);

    // Query messages - bisa diakses tanpa login
    const q = query(collection(db, "messages"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log("✅ Firestore snapshot received:", snapshot.docs.length, "messages");
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Message data:", data);
          return { id: doc.id, ...data };
        });
        // Sort manually by createdAt
        msgs.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return a.createdAt.seconds - b.createdAt.seconds;
        });
        setMessages(msgs);
        console.log("Messages state updated with", msgs.length, "messages");
      },
      (error) => {
        console.error("❌ Firestore error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // If it's a permission error, show it clearly
        if (error.code === 'permission-denied') {
          console.error("🔒 PERMISSION DENIED - Check Firestore Security Rules!");
          console.error("You need to allow read access to 'messages' collection");
        }
      }
    );
    return () => {
      console.log("Cleaning up Firestore listener");
      unsub();
    };
  }, []); // Tidak bergantung pada user, jadi pesan bisa dimuat tanpa login

  // Handle login with popup
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await loginWithGoogle();

    if (!result.success) {
      setLoginError(result.error);
      setIsLoggingIn(false);
    } else {
      setIsLoggingIn(false);
    }
  };

  // Handle login with redirect (fallback)
  const handleRedirectLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    await loginWithGoogleRedirect();
    // Note: Page will redirect, so no need to set loading to false
  };

  // Kirim pesan
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: message,
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp()
    });
    setMessage("");
  };

  return (
    <div className="bg-zinc-950 p-6 rounded-lg w-full">
      <h2 className="text-2xl font-black text-center mb-6 text-white tracking-tight uppercase flex items-center justify-center gap-2">
        💬 Live Chat Room
      </h2>

      {/* Header user */}
      {user && (
        <div className="flex justify-between items-center mb-6 border-b-3 border-black pb-4">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-md border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
            <span className="text-white font-bold">{user.displayName}</span>
          </div>
          <button
            onClick={logout}
            className="bg-[#ff007f] hover:bg-[#ff2299] text-white border-2 border-black font-black p-1.5 px-4 rounded-md shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] transition-all cursor-pointer text-xs uppercase"
          >
            Logout
          </button>
        </div>
      )}

      {/* Area pesan */}
      <div className="h-80 overflow-y-auto border-3 border-black p-4 rounded-md bg-[#0c0c0e] mb-6 space-y-4 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-bold">
            <p className="text-lg">Belum ada pesan.</p>
            <p className="text-sm font-mono uppercase tracking-wider text-[#ffe600] mt-1">Jadilah yang pertama mengirim pesan!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.uid === user?.uid ? "justify-end" : "justify-start"}`}
            >
              {msg.uid !== user?.uid && (
                <img
                  src={msg.photoURL || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="w-8 h-8 rounded-md border-2 border-black flex-shrink-0"
                />
              )}
              <div
                className={`p-3 rounded-md border-2 border-black shadow-[3px_3px_0px_#000000] max-w-[75%] ${msg.uid === user?.uid
                  ? "bg-[#00e5ff] text-black"
                  : "bg-zinc-900 text-white"
                  }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70 mb-1">{msg.displayName}</div>
                <div className="font-semibold text-sm sm:text-base">{msg.text}</div>
              </div>
              {msg.uid === user?.uid && (
                <img
                  src={msg.photoURL || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="w-8 h-8 rounded-md border-2 border-black flex-shrink-0"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Form login / kirim pesan */}
      {user ? (
        <form onSubmit={sendMessage} className="flex gap-3 flex-wrap sm:flex-nowrap w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 min-w-0 p-3 rounded-md bg-zinc-900 text-white border-3 border-black focus:outline-none focus:border-[#ffe600] font-semibold shadow-[2px_2px_0px_#000]"
          />
          <button
            type="submit"
            className="neo-btn-yellow p-3 px-6 rounded-md w-full sm:w-auto font-bold uppercase"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {/* Error message */}
          {loginError && (
            <div className="w-full max-w-md bg-red-950/40 border-3 border-red-600 text-red-200 px-4 py-3 rounded-md text-sm font-bold shadow-[4px_4px_0px_#000]">
              <p className="font-extrabold text-red-400">❌ Login Gagal</p>
              <p className="font-mono text-xs mt-1">{loginError}</p>
            </div>
          )}

          {/* Primary login button (popup) */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-3 bg-white text-gray-800 px-6 py-2.5 rounded-md border-3 border-black font-extrabold shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase text-sm"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-3 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                Login with Google
              </>
            )}
          </button>

          {/* Fallback redirect button */}
          {loginError && loginError.includes('Popup') && (
            <button
              onClick={handleRedirectLogin}
              disabled={isLoggingIn}
              className="text-sm font-bold text-[#00e5ff] hover:text-[#5ce1e6] underline cursor-pointer disabled:opacity-50"
            >
              Coba dengan metode redirect
            </button>
          )}

          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Login untuk bergabung dalam percakapan</p>
        </div>
      )}
    </div>
  );
}
