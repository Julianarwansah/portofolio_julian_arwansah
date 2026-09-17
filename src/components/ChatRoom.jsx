import { useState, useEffect, useRef } from "react";
import { auth, loginWithGoogle, loginWithGoogleRedirect, logout, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

// Must stay in sync with the text size cap in firestore.rules.
const MAX_MESSAGE_LENGTH = 300;
const MESSAGE_LIMIT = 50;

function Avatar({ photoURL, name, className }) {
  if (photoURL) {
    return <img src={photoURL} alt="" className={className} loading="lazy" decoding="async" />;
  }

  return (
    <div aria-hidden="true" className={`${className} flex items-center justify-center bg-zinc-800 text-white font-black text-xs uppercase`}>
      {(name || "?").charAt(0)}
    </div>
  );
}

export default function ChatRoom() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(MESSAGE_LIMIT)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs.reverse());
      },
      () => {
        setSendError("Unable to load messages. Please refresh the page.");
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await loginWithGoogle();

    setIsLoggingIn(false);
    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const handleRedirectLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    // The page navigates away, so there is no state to reset afterwards.
    await loginWithGoogleRedirect();
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();
    if (!text || isSending || !user) return;

    setIsSending(true);
    setSendError(null);

    try {
      await addDoc(collection(db, "messages"), {
        text: text.slice(0, MAX_MESSAGE_LENGTH),
        uid: user.uid,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp()
      });
      setMessage("");
    } catch {
      setSendError("Message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-room-inner bg-zinc-950 p-6 rounded-lg w-full">
      <h2 className="text-2xl font-black text-center mb-6 text-white tracking-tight uppercase flex items-center justify-center gap-2">
        💬 Live Chat Room
      </h2>

      {user && (
        <div className="flex justify-between items-center mb-6 border-b-3 border-black pb-4">
          <div className="flex items-center gap-3">
            <Avatar
              photoURL={user.photoURL}
              name={user.displayName}
              className="w-10 h-10 rounded-md border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-shrink-0"
            />
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

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Chat messages"
        className="chat-messages-container h-80 overflow-y-auto border-3 border-black p-4 rounded-md bg-[#0c0c0e] mb-6 space-y-4 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 font-bold">
            <p className="text-lg">No messages yet.</p>
            <p className="text-sm font-mono uppercase tracking-wider text-[#ffe600] mt-1">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.uid === user?.uid ? "justify-end" : "justify-start"}`}
            >
              {msg.uid !== user?.uid && (
                <Avatar
                  photoURL={msg.photoURL}
                  name={msg.displayName}
                  className="w-8 h-8 rounded-md border-2 border-black flex-shrink-0"
                />
              )}
              <div
                className={`p-3 rounded-md border-2 border-black shadow-[3px_3px_0px_#000000] max-w-[75%] ${msg.uid === user?.uid
                  ? "bg-[#00e5ff] text-black"
                  : "chat-bubble-incoming bg-zinc-900 text-white"
                  }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70 mb-1">
                  {msg.displayName || "Guest"}
                </div>
                <div className="font-semibold text-sm sm:text-base break-words">{msg.text}</div>
              </div>
              {msg.uid === user?.uid && (
                <Avatar
                  photoURL={msg.photoURL}
                  name={msg.displayName}
                  className="w-8 h-8 rounded-md border-2 border-black flex-shrink-0"
                />
              )}
            </div>
          ))
        )}
      </div>

      {sendError && (
        <p role="alert" className="mb-4 bg-red-950/40 border-3 border-red-600 text-red-200 px-4 py-3 rounded-md text-sm font-bold shadow-[4px_4px_0px_#000]">
          {sendError}
        </p>
      )}

      {user ? (
        <form onSubmit={sendMessage} className="w-full">
          <label htmlFor="chat-message" className="sr-only">Message</label>
          <div className="flex gap-3 flex-wrap sm:flex-nowrap w-full">
            <input
              id="chat-message"
              name="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              autoComplete="off"
              placeholder="Type a message..."
              className="chat-input-text flex-1 min-w-0 p-3 rounded-md bg-zinc-900 text-white border-3 border-black focus-visible:border-[#ffe600] font-semibold shadow-[2px_2px_0px_#000]"
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="neo-btn-yellow p-3 px-6 rounded-md w-full sm:w-auto font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {loginError && (
            <div role="alert" className="w-full max-w-md bg-red-950/40 border-3 border-red-600 text-red-200 px-4 py-3 rounded-md text-sm font-bold shadow-[4px_4px_0px_#000]">
              <p className="font-extrabold text-red-400">❌ Login failed</p>
              <p className="font-mono text-xs mt-1">{loginError}</p>
            </div>
          )}

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
                  alt=""
                  width="20"
                  height="20"
                  className="w-5 h-5"
                />
                Login with Google
              </>
            )}
          </button>

          {loginError && loginError.includes('Popup') && (
            <button
              onClick={handleRedirectLogin}
              disabled={isLoggingIn}
              className="text-sm font-bold text-[#00e5ff] hover:text-[#5ce1e6] underline cursor-pointer disabled:opacity-50"
            >
              Try the redirect method instead
            </button>
          )}

          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Log in to join the conversation</p>
        </div>
      )}
    </div>
  );
}
