// src/components/TeamChatbox.tsx
import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { FaSmile, FaPaperPlane } from "react-icons/fa";
import styles from "./Chatbox.module.css";

const apiKeyGemini = "AIzaSyC6WC7v6rYTZmKXe6uLyWo86xSb76vJqY8";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isUseful?: boolean;
  expiresAt?: Date;
}

interface TeamChatboxProps {
  teamId: string;
  playerName: string;
  onClose: () => void;
}

const TeamChatbox: React.FC<TeamChatboxProps> = ({ teamId, playerName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);

  const checkMessageUsefulness = async (text: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKeyGemini}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Is this message useful for team collaboration? Answer only 'YES' or 'NO': ${text}`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'NO';
      return answer.trim().toUpperCase() === 'YES';
    } catch (error) {
      console.error("Gemini API error:", error);
      return true;
    }
  };

  useEffect(() => {
    const checkExpiredMessages = async () => {
      const now = new Date();
      const expiredMessages = messages.filter(msg => 
        msg.expiresAt && msg.expiresAt <= now
      );

      for (const msg of expiredMessages) {
        try {
          await deleteDoc(doc(db, `teams/${teamId}/messages/${msg.id}`));
        } catch (error) {
          console.error("Error deleting message:", error);
        }
      }
    };

    const interval = setInterval(checkExpiredMessages, 30000);
    return () => clearInterval(interval);
  }, [messages, teamId]);

  useEffect(() => {
    if (!teamId) return;

    const messagesRef = collection(db, `teams/${teamId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp.toDate(),
          isUseful: data.isUseful,
          expiresAt: data.expiresAt?.toDate(),
        };
      });
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [teamId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, `teams/${teamId}/messages`);
      const docRef = await addDoc(messagesRef, {
        sender: playerName,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });

      const isUseful = await checkMessageUsefulness(newMessage.trim());
      const expiresAt = new Date(Date.now() + 120000);

      await updateDoc(doc(db, `teams/${teamId}/messages/${docRef.id}`), {
        isUseful,
        ...(!isUseful && { expiresAt })
      });

      setNewMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prevInput) => prevInput + emojiData.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((val) => !val);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).id !== "emoji-button"
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className={styles.chatbox} ref={chatboxRef}>
      <div className={styles.chatboxHeader}>
        <h2>Team Chat</h2>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close Chat">
          &times;
        </button>
      </div>
      <div className={styles.messages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.sender === playerName ? styles.sent : styles.received
            }`}
          >
            <div className={styles.messageContent}>
              <span className={styles.sender}>{message.sender}</span>
              <p>{message.text}</p>
              {!message.isUseful && message.expiresAt && (
                <span className={styles.timestamp}>
                  Deleting in: {Math.max(0, Math.round(
                    (message.expiresAt.getTime() - Date.now()) / 60000
                  ))} minutes
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showEmojiPicker && (
        <div className={styles.emojiPicker} ref={emojiPickerRef}>
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
      <div className={styles.chatInput}>
        <button
          id="emoji-button"
          className={styles.emojiButton}
          onClick={toggleEmojiPicker}
          aria-label="Toggle emoji picker"
        >
          <FaSmile />
        </button>
        <textarea
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        />
        <button onClick={sendMessage} className={styles.sendButton} aria-label="Send Message">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default TeamChatbox;