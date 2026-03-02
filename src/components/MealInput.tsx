"use client";

import { useState, useRef, useCallback } from "react";

interface MealInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

export default function MealInput({ onSubmit, loading }: MealInputProps) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const initializedRef = useRef(false);

  const initVoice = useCallback(() => {
    if (initializedRef.current) return !!recognitionRef.current;
    initializedRef.current = true;

    const SR = typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

    if (SR) {
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? prev + " " + transcript : transcript));
        setListening(false);
      };

      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
      return true;
    }
    return false;
  }, []);

  function toggleVoice() {
    if (!initVoice()) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim() && !loading) {
      onSubmit(text.trim());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. "2 eggs, toast with butter, and a glass of milk"'
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        <button
          type="button"
          onClick={toggleVoice}
          className={`absolute right-3 top-3 p-1.5 rounded-lg transition ${
            listening
              ? "bg-red-600 text-white animate-pulse"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>
      </div>
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Parsing..." : "Log Meal"}
      </button>
    </form>
  );
}
