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
  const [deletingThreadId, setDeletingThreadId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isNewChat = activeThreadId == null;

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
      setActiveThreadId(null);
      setMessages([]);
    } catch (err) {
      setError(err.message || "Failed to load agent");
    } finally {
      setLoading(false);
    }
  };

  const refreshThreads = async () => {
    try {
      const list = await agentApi.listThreads();
      setThreads(list);
    } catch {
      /* ignore */
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

  const newChat = () => {
    setError("");
    setActiveThreadId(null);
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const deleteThread = async (thread) => {
    const title = (thread.title || "Untitled chat").slice(0, 60);
    const ok = window.confirm(`Delete this chat?\n\n"${title}"`);
    if (!ok) return;

    setDeletingThreadId(thread.id);
    setError("");
    try {
      await agentApi.deleteThread(thread.id);
      setThreads((prev) => prev.filter((t) => t.id !== thread.id));
      if (activeThreadId === thread.id) {
        newChat();
      }
    } catch (err) {
      setError(err.message || "Failed to delete chat");
    } finally {
      setDeletingThreadId(null);
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
        const thread = await agentApi.createThread();
        threadId = thread.id;
        setActiveThreadId(threadId);
        setThreads((prev) => [thread, ...prev]);
      }
      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, role: "user", content: text },
      ]);
      await agentApi.sendMessage(threadId, text);
      const msgs = await agentApi.getMessages(threadId);
      setMessages(msgs);
      await refreshThreads();
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Send failed");
      if (activeThreadId) {
        try {
          const msgs = await agentApi.getMessages(activeThreadId);
          setMessages(msgs);
        } catch {
          /* ignore */
        }
      }
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
          Bright CRM only — separate from Tech2Globe Blog. Describe a topic and the agent
          writes the draft and sends the approval email automatically.
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
          <button
            type="button"
            className={`b20-btn b20-btn-primary b20-new-chat-btn${isNewChat ? " active" : ""}`}
            onClick={newChat}
          >
            New chat
          </button>
          {threads.map((t) => (
            <div
              key={t.id}
              className={`b20-thread-row${t.id === activeThreadId ? " active" : ""}`}
            >
              <button
                type="button"
                className="b20-thread-item"
                onClick={() => selectThread(t.id)}
                disabled={deletingThreadId === t.id}
              >
                {(t.title || "Untitled chat").slice(0, 48)}
              </button>
              <button
                type="button"
                className="b20-thread-delete"
                title="Delete chat"
                aria-label={`Delete chat ${t.title || "Untitled"}`}
                disabled={deletingThreadId === t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(t);
                }}
              >
                {deletingThreadId === t.id ? "…" : "×"}
              </button>
            </div>
          ))}
        </div>

        <div className="b20-chat">
          <div className="b20-messages">
            {messages.length === 0 && (
              <div className="b20-chat-welcome">
                <h2>What blog should I write?</h2>
                <p>
                  Give a topic in one message — title, audience, and keyword are optional.
                  I&apos;ll write the draft and trigger the approval email.
                </p>
                <div className="b20-chat-suggestions">
                  {[
                    "Write about agentic CRM for small construction teams",
                    "Draft: How CRM automation saves time on site visits",
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      className="b20-chat-suggestion"
                      onClick={() => setInput(sample)}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
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
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the blog you want…"
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
