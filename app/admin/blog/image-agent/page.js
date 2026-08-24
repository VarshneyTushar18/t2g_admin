"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ReadOnlyBanner from "../../components/ReadOnlyBanner";
import BlogEditorShell from "../components/BlogEditorShell";
import * as agentApi from "../services/blogAgentService";

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function BlogAgentPage() {
  const router = useRouter();
  const { loading: authLoading, canView, canAdd, canEdit, isReadOnly, user } =
    useAuth();

  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [agentReady, setAgentReady] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelines, setGuidelines] = useState("");
  const [guidelinesDraft, setGuidelinesDraft] = useState("");
  const [savingGuidelines, setSavingGuidelines] = useState(false);

  const messagesEndRef = useRef(null);
  const canPublish = canAdd("blog") && !isReadOnly("blog");
  const canEditGuidelines = canEdit("blog") && !isReadOnly("blog");

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog")) router.replace("/admin");
  }, [authLoading, canView, router]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    setError("");
    try {
      const list = await agentApi.listThreads();
      setThreads(list);
      if (!activeThreadId && list.length > 0) {
        setActiveThreadId(list[0].id);
      }
    } catch (err) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoadingThreads(false);
    }
  }, [activeThreadId]);

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const list = await agentApi.getMessages(threadId);
      setMessages(list);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    if (authLoading || !canView("blog")) return;
    agentApi.getAgentStatus().then((s) => setAgentReady(s.configured)).catch(() => setAgentReady(false));
    loadThreads();
    agentApi.getGuidelines().then((g) => {
      setGuidelines(g?.content || "");
      setGuidelinesDraft(g?.content || "");
    }).catch(() => {});
  }, [authLoading, canView, loadThreads]);

  useEffect(() => {
    if (activeThreadId) loadMessages(activeThreadId);
  }, [activeThreadId, loadMessages]);

  const handleNewChat = async () => {
    setError("");
    try {
      const thread = await agentApi.createThread();
      setThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setMessages([]);
    } catch (err) {
      setError(err.message || "Could not start new chat");
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setSending(true);
    setInput("");

    let threadId = activeThreadId;
    try {
      if (!threadId) {
        const thread = await agentApi.createThread(text.slice(0, 60));
        threadId = thread.id;
        setThreads((prev) => [thread, ...prev]);
        setActiveThreadId(threadId);
      }

      setMessages((prev) => [
        ...prev,
        { id: `tmp-u-${Date.now()}`, role: "user", content: text, created_at: new Date().toISOString() },
      ]);
      scrollToBottom();

      const result = await agentApi.sendMessage(threadId, text);
      setMessages((prev) => [
        ...prev.filter((m) => !String(m.id).startsWith("tmp-u-")),
        { id: `u-${Date.now()}`, role: "user", content: text, created_at: new Date().toISOString() },
        result.assistant,
      ]);
      loadThreads();
      scrollToBottom();
    } catch (err) {
      setError(err.message || "Agent failed");
      if (threadId) loadMessages(threadId);
    } finally {
      setSending(false);
    }
  };

  const handleFeedback = async (messageId, rating) => {
    if (!activeThreadId) return;
    try {
      await agentApi.sendFeedback(activeThreadId, { messageId, rating });
    } catch (err) {
      setError(err.message || "Feedback failed");
    }
  };

  const handleSaveGuidelines = async () => {
    setSavingGuidelines(true);
    try {
      const g = await agentApi.updateGuidelines(guidelinesDraft);
      setGuidelines(g.content);
      setGuidelinesDraft(g.content);
    } catch (err) {
      setError(err.message || "Could not save guidelines");
    } finally {
      setSavingGuidelines(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await agentApi.deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  if (authLoading || !canView("blog")) {
    return (
      <BlogEditorShell title="Blog Agent">
        <p>Loading…</p>
      </BlogEditorShell>
    );
  }

  return (
    <BlogEditorShell
      title="Blog Agent"
      subtitle="Chat with AI to draft and publish blog posts. Conversations are saved so the agent learns from your feedback over time."
    >
      <style>{`
        .ba-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 0;
          min-height: 520px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .ba-layout { grid-template-columns: 1fr; }
          .ba-sidebar { max-height: 200px; border-right: none !important; border-bottom: 1px solid #e2e8f0; }
        }
        .ba-sidebar {
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }
        .ba-sidebar-head {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .ba-new-btn {
          width: 100%;
          padding: 10px 12px;
          background: #16a37f;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }
        .ba-new-btn:hover { background: #128f6f; }
        .ba-thread-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .ba-thread {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          margin-bottom: 4px;
          border: none;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          font-size: 13px;
        }
        .ba-thread:hover { background: #e2e8f0; }
        .ba-thread.active { background: #dbeafe; color: #1e40af; font-weight: 600; }
        .ba-thread-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ba-thread-meta { font-size: 11px; color: #64748b; margin-top: 2px; }
        .ba-main { display: flex; flex-direction: column; background: #fff; min-height: 480px; }
        .ba-status {
          padding: 10px 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ba-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }
        .ba-badge.ok { background: #dcfce7; color: #166534; }
        .ba-badge.warn { background: #fef3c7; color: #92400e; }
        .ba-badge.draft { background: #e0e7ff; color: #3730a3; }
        .ba-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ba-msg {
          max-width: 85%;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .ba-msg.user {
          align-self: flex-end;
          background: #2563eb;
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .ba-msg.assistant {
          align-self: flex-start;
          background: #f1f5f9;
          color: #0f172a;
          border-bottom-left-radius: 4px;
        }
        .ba-msg-actions {
          margin-top: 8px;
          display: flex;
          gap: 6px;
        }
        .ba-fb-btn {
          font-size: 12px;
          padding: 4px 8px;
          border: 1px solid #cbd5e1;
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
        }
        .ba-fb-btn:hover { background: #f8fafc; }
        .ba-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
          padding: 24px;
        }
        .ba-input-row {
          padding: 12px 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
        }
        .ba-input {
          flex: 1;
          padding: 12px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          resize: none;
          min-height: 44px;
          max-height: 120px;
          font-family: inherit;
        }
        .ba-send {
          padding: 0 20px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          align-self: flex-end;
          height: 44px;
        }
        .ba-send:disabled { opacity: 0.5; cursor: not-allowed; }
        .ba-error {
          margin-bottom: 12px;
          padding: 10px 14px;
          background: #fef2f2;
          color: #b91c1c;
          border-radius: 8px;
          font-size: 13px;
        }
        .ba-guidelines-toggle {
          font-size: 13px;
          color: #4f46e5;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .ba-guidelines-panel {
          margin-bottom: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .ba-guidelines-panel textarea {
          width: 100%;
          min-height: 120px;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          margin-top: 8px;
        }
        .ba-del-thread {
          float: right;
          font-size: 11px;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>

      {isReadOnly("blog") && <ReadOnlyBanner moduleKey="blog" />}

      {error && <div className="ba-error">{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="ba-guidelines-toggle"
          onClick={() => setShowGuidelines((v) => !v)}
        >
          {showGuidelines ? "Hide" : "Show"} brand guidelines
        </button>
      </div>

      {showGuidelines && (
        <div className="ba-guidelines-panel">
          <strong>Brand brain</strong>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            The agent reads this on every run. Update when you want it to remember new rules.
          </p>
          <textarea
            value={guidelinesDraft}
            onChange={(e) => setGuidelinesDraft(e.target.value)}
            readOnly={!canEditGuidelines}
          />
          {canEditGuidelines && (
            <button
              type="button"
              className="ba-new-btn"
              style={{ marginTop: 8, width: "auto", padding: "8px 16px" }}
              onClick={handleSaveGuidelines}
              disabled={savingGuidelines || guidelinesDraft === guidelines}
            >
              {savingGuidelines ? "Saving…" : "Save guidelines"}
            </button>
          )}
        </div>
      )}

      <div className="ba-layout">
        <aside className="ba-sidebar">
          <div className="ba-sidebar-head">
            <button type="button" className="ba-new-btn" onClick={handleNewChat}>
              + New conversation
            </button>
          </div>
          <div className="ba-thread-list">
            {loadingThreads && <p style={{ padding: 12, fontSize: 13 }}>Loading…</p>}
            {!loadingThreads && threads.length === 0 && (
              <p style={{ padding: 12, fontSize: 13, color: "#64748b" }}>
                No conversations yet. Start a new chat.
              </p>
            )}
            {threads.map((t) => (
              <div key={t.id} style={{ position: "relative" }}>
                <button
                  type="button"
                  className={`ba-thread ${activeThreadId === t.id ? "active" : ""}`}
                  onClick={() => setActiveThreadId(t.id)}
                >
                  <div className="ba-thread-title">{t.title || "New conversation"}</div>
                  <div className="ba-thread-meta">{formatTime(t.updated_at)}</div>
                </button>
                <button
                  type="button"
                  className="ba-del-thread"
                  title="Delete"
                  onClick={() => handleDeleteThread(t.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="ba-main">
          <div className="ba-status">
            <span>
              {user?.email && <>Signed in as {user.email} · </>}
              {canPublish ? (
                <span className="ba-badge ok">Can publish</span>
              ) : (
                <span className="ba-badge draft">Draft only</span>
              )}
            </span>
            <span>
              {agentReady === false && (
                <span className="ba-badge warn">Agent offline — set OPENROUTER_API_KEY on server</span>
              )}
              {agentReady === true && (
                <span className="ba-badge ok">Agent ready</span>
              )}
            </span>
          </div>

          <div className="ba-messages">
            {loadingMessages && <p style={{ color: "#64748b" }}>Loading messages…</p>}
            {!loadingMessages && messages.length === 0 && (
              <div className="ba-empty">
                <div>
                  <p><strong>Try asking:</strong></p>
                  <p style={{ marginTop: 8 }}>
                    &quot;Write a blog about Amazon PPC best practices, author Tarun, with images&quot;
                  </p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    Cover + in-article images are added automatically. You can also paste an image URL.
                  </p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    The agent remembers this conversation and learns from your 👍/👎 feedback.
                  </p>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`ba-msg ${m.role}`}>
                {m.content}
                {m.role === "assistant" && (
                  <div className="ba-msg-actions">
                    <button type="button" className="ba-fb-btn" onClick={() => handleFeedback(m.id, 1)}>
                      👍 Good
                    </button>
                    <button type="button" className="ba-fb-btn" onClick={() => handleFeedback(m.id, -1)}>
                      👎 Improve
                    </button>
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="ba-msg assistant">Thinking…</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ba-input-row" onSubmit={handleSend}>
            <textarea
              className="ba-input"
              placeholder={
                canPublish
                  ? 'e.g. "Publish a blog about Shopify SEO tips, author Tarun"'
                  : 'e.g. "Draft a blog about Shopify SEO tips"'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending || agentReady === false}
              rows={1}
            />
            <button
              type="submit"
              className="ba-send"
              disabled={sending || !input.trim() || agentReady === false}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </BlogEditorShell>
  );
}
