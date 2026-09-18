"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as agentApi from "../services/blog20Service";
import "../blog-2.0.css";

export default function Blog20AgentPage() {
  const router = useRouter();
  const { loading: authLoading, canView } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agentReady, setAgentReady] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog_2_0")) {
      router.replace("/admin");
      return;
    }
    init();
  }, [authLoading, canView, router]);

  const init = async () => {
    setLoading(true);
    setError("");
    try {
      const status = await agentApi.getAgentStatus();
      setAgentReady(status?.configured);
      const list = await agentApi.listThreads();
      setThreads(list);
      // Only Blog-2.0 threads (agent_type blog_2_0) — never Tech2Globe Blog chats
      if (list[0]?.id) {
        await selectThread(list[0].id);
      }
    } catch (err) {
      setError(err.message || "Failed to load agent");
    } finally {
      setLoading(false);
    }
  };

  const selectThread = useCallback(async (threadId) => {
    setActiveThreadId(threadId);
    setError("");
    try {
      const msgs = await agentApi.getMessages(threadId);
      setMessages(msgs);
    } catch (err) {
      setError(err.message || "Failed to load messages");
    }
  }, []);

  const newChat = async () => {
    setError("");
    try {
      const thread = await agentApi.createThread("Blog-2.0 chat");
      setThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setMessages([]);
    } catch (err) {
      setError(err.message || "Could not start chat");
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    try {
      let threadId = activeThreadId;
      if (!threadId) {
        const thread = await agentApi.createThread("Blog-2.0 chat");
        threadId = thread.id;
        setActiveThreadId(threadId);
        setThreads((prev) => [thread, ...prev]);
      }
      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, role: "user", content: text },
      ]);
      const res = await agentApi.sendMessage(threadId, text);
      const msgs = await agentApi.getMessages(threadId);
      setMessages(msgs);
      if (res?.output) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      setError(err.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading || loading) {
    return <div className="b20-page"><p>Loading Blog Agent…</p></div>;
  }

  return (
    <div className="b20-page">
      <div className="b20-hero">
        <h1>Blog Agent</h1>
        <p>
          Bright CRM only — separate from Tech2Globe Blog. Drafts save for MailerLite
          website (not tech2globe.com). Chats here are isolated from the main Blog Agent.
        </p>
      </div>

      {agentReady === false && (
        <div className="b20-alert err">
          AI not configured. Ask super admin to set API keys in Connect → AI Integrations.
        </div>
      )}
      {error && <div className="b20-alert err">{error}</div>}

      <div className="b20-agent-wrap">
        <div className="b20-thread-list">
          <button type="button" className="b20-btn b20-btn-primary" onClick={newChat} style={{ width: "100%", marginBottom: "0.75rem" }}>
            New chat
          </button>
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectThread(t.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.5rem",
                marginBottom: "0.35rem",
                border: "1px solid",
                borderColor: t.id === activeThreadId ? "#7c3aed" : "#e2e8f0",
                borderRadius: "8px",
                background: t.id === activeThreadId ? "#f5f3ff" : "#fff",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              {(t.title || "Chat").slice(0, 40)}
            </button>
          ))}
        </div>

        <div className="b20-chat">
          <div className="b20-messages">
            {messages.length === 0 && (
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                Ask for a blog post — e.g. &quot;Write a draft about CRM automation for
                small businesses&quot;
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`b20-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="b20-chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Blog-2.0 agent…"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              type="button"
              className="b20-btn b20-btn-primary"
              onClick={send}
              disabled={sending || !input.trim()}
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
