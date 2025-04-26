// src/components/Chatbox.jsx

import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import Picker from "emoji-picker-react";
import { FaSmile, FaPaperPlane } from "react-icons/fa";
import styles from "./Chatbox.module.css"; // Import CSS module

const Chatbox = ({ roomId, playerName, onClose }) => { // Accept onClose prop
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const chatboxRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, `rooms/${roomId}/messages`);
      await addDoc(messagesRef, {
        sender: playerName,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((val) => !val);
  };

  const handleKeyPress = (e) => {
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
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.id !== "emoji-button"
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
        <h2>Chat</h2>
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
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showEmojiPicker && (
        <div className={styles.emojiPicker} ref={emojiPickerRef}>
          <Picker onEmojiClick={onEmojiClick} disableAutoFocus={true} />
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

export default Chatbox;
