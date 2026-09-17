"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ReadOnlyBanner from "../../components/ReadOnlyBanner";
import BlogEditorShell from "../components/BlogEditorShell";
import * as agentApi from "../services/blogAgentService";
import { getBlogPost, getBlogPosts } from "../services/blogService";

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

function postsFromMessage(m) {
  const fromTool = m?.tool_output?.posts;
  if (Array.isArray(fromTool) && fromTool.length) return fromTool;

  const content = String(m?.content || "");
  const slugMatch = content.match(/blogs\/([a-z0-9-]+)/i);
  const statusMatch = content.match(/\b(draft|pending|publish|published)\b/i);
  let status = statusMatch ? statusMatch[1].toLowerCase() : "draft";
  if (status === "published") status = "publish";

  // Prefer explicit id: 123 / id #123 / Post ID 123
  const idMatch =
    content.match(/\bid[:\s#]*(\d{1,10})\b/i) ||
    content.match(/\bpost\s*id[:\s#]*(\d{1,10})\b/i) ||
    content.match(/\((\d{1,10})\)\s*(?:created|saved|draft)/i);

  if (idMatch) {
    return [
      {
        id: Number(idMatch[1]),
        slug: slugMatch?.[1] || null,
        status,
        title: null,
        url: slugMatch
          ? `https://www.tech2globe.com/blogs/${slugMatch[1]}`
          : null,
      },
    ];
  }

  // Slug-only fallback — Preview will resolve id via admin list search
  if (slugMatch?.[1]) {
    return [
      {
        id: null,
        slug: slugMatch[1],
        status,
        title: null,
        url: `https://www.tech2globe.com/blogs/${slugMatch[1]}`,
      },
    ];
  }

  return [];
}

const IMPROVE_PROMPT_BASE =
  "Please improve the last blog post you created. Fix formatting so no raw ** or * asterisks show on the live page. Keep clear H2 sections and short paragraphs. Use update_blog_post with the existing post id — do not create a duplicate.";

function snapMixPercent(value, fallback = 70) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(100, Math.max(0, n)) / 5) * 5;
}

function buildImprovePrompt(humanizePercent) {
  const human = snapMixPercent(humanizePercent, 70);
  const ai = 100 - human;
  return `${IMPROVE_PROMPT_BASE} Rewrite to exactly ${human}% humanized / ${ai}% AI-structured voice: contractions, varied sentence length, concrete examples, no ChatGPT phrases (delve, digital landscape, furthermore, in conclusion).`;
}
export default function BlogAgentPage() {
  const router = useRouter();
  const { loading: authLoading, canView, canAdd, canEdit, isReadOnly, user } =
    useAuth();

  const [threads, setThreads] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [agentReady, setAgentReady] = useState(null);
  const [agentModel, setAgentModel] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelines, setGuidelines] = useState("");
  const [guidelinesDraft, setGuidelinesDraft] = useState("");
  const [humanizePercent, setHumanizePercent] = useState(70);
  const [humanizeDraft, setHumanizeDraft] = useState(70);
  const [savingGuidelines, setSavingGuidelines] = useState(false);
  const [savingMix, setSavingMix] = useState(false);
  const [feedbackByMsg, setFeedbackByMsg] = useState({});
  const [feedbackBusy, setFeedbackBusy] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewPost, setPreviewPost] = useState(null);

  const messagesEndRef = useRef(null);
  const startedFreshRef = useRef(false);
  const canPublish = canAdd("blog") && !isReadOnly("blog");
  const canEditGuidelines = canEdit("blog") && !isReadOnly("blog");

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog")) router.replace("/admin");
  }, [authLoading, canView, router]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const openThreadTab = useCallback((thread) => {
    if (!thread?.id) return;
    setOpenTabs((prev) => {
      if (prev.some((t) => t.id === thread.id)) return prev;
      return [thread, ...prev].slice(0, 8);
    });
    setActiveThreadId(thread.id);
  }, []);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    setError("");
    try {
      const list = await agentApi.listThreads();
      setThreads(list);
    } catch (err) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoadingThreads(false);
    }
  }, []);

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
    agentApi.getAgentStatus().then((s) => {
      setAgentReady(s.configured);
      setAgentModel(s.model || "");
    }).catch(() => setAgentReady(false));
    loadThreads();
    if (!startedFreshRef.current) {
      startedFreshRef.current = true;
      setActiveThreadId(null);
      setMessages([]);
      setOpenTabs([]);
    }
    agentApi.getGuidelines().then(async (g) => {
      setGuidelines(g?.content || "");
      setGuidelinesDraft(g?.content || "");
      setHumanizePercent(70);
      setHumanizeDraft(70);
      const saved = snapMixPercent(g?.humanize_percent, 70);
      if (saved !== 70 && canEdit("blog") && !isReadOnly("blog")) {
        try {
          await agentApi.updateGuidelines({ humanizePercent: 70 });
        } catch {
          /* ignore */
        }
      }
    }).catch(() => {});
  }, [authLoading, canView, loadThreads]);

  useEffect(() => {
    if (activeThreadId) loadMessages(activeThreadId);
    else setMessages([]);
  }, [activeThreadId, loadMessages]);

  const handleNewChat = () => {
    setError("");
    setActiveThreadId(null);
    setMessages([]);
    setInput("");
  };

  const closeTab = (threadId, e) => {
    e?.stopPropagation();
    setOpenTabs((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
      setMessages([]);
    }
  };

  const sendText = async (text, { clearInput = false } = {}) => {
    const trimmed = String(text || "").trim();
    if (!trimmed || sending) return;

    setError("");
    setSending(true);
    if (clearInput) setInput("");

    let threadId = activeThreadId;
    try {
      if (!threadId) {
        const thread = await agentApi.createThread(trimmed.slice(0, 60));
        threadId = thread.id;
        setThreads((prev) => [thread, ...prev]);
        openThreadTab(thread);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-u-${Date.now()}`,
          role: "user",
          content: trimmed,
          created_at: new Date().toISOString(),
        },
      ]);
      scrollToBottom();

      const result = await agentApi.sendMessage(threadId, trimmed);
      const apiPosts = Array.isArray(result.posts) ? result.posts : [];
      const assistant = {
        ...result.assistant,
        tool_output: {
          ...(result.assistant?.tool_output || {}),
          posts:
            apiPosts.length > 0
              ? apiPosts
              : result.assistant?.tool_output?.posts || [],
        },
      };
      setMessages((prev) => [
        ...prev.filter((m) => !String(m.id).startsWith("tmp-u-")),
        {
          id: `u-${Date.now()}`,
          role: "user",
          content: trimmed,
          created_at: new Date().toISOString(),
        },
        assistant,
      ]);
      loadThreads();
      scrollToBottom();

      const previewTarget = apiPosts[0] || postsFromMessage(assistant)[0];
      if (previewTarget?.id || previewTarget?.slug) {
        openPreview(previewTarget);
      }    } catch (err) {
      setError(err.message || "Agent failed");
      if (threadId) loadMessages(threadId);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    await sendText(input, { clearInput: true });
  };

  const handleFeedback = async (messageId, rating) => {
    if (!activeThreadId || !messageId) {
      setError("Open a saved chat message before giving feedback.");
      return;
    }
    if (String(messageId).startsWith("tmp-") || String(messageId).startsWith("u-")) {
      setError("Wait for the reply to finish saving, then try feedback again.");
      return;
    }
    if (feedbackBusy[messageId] || feedbackByMsg[messageId]) return;

    setFeedbackBusy((prev) => ({ ...prev, [messageId]: true }));
    setError("");
    try {
      await agentApi.sendFeedback(activeThreadId, {
        messageId,
        rating: Number(rating),
        comment:
          rating === -1
            ? "User marked Bad — rewrite with better blog formatting"
            : "User marked Good",
      });
      setFeedbackByMsg((prev) => ({ ...prev, [messageId]: rating }));

      if (rating === -1) {
        await sendText(buildImprovePrompt(humanizePercent));
      }
    } catch (err) {
      setError(err.message || "Feedback failed");
    } finally {
      setFeedbackBusy((prev) => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
    }
  };

  const openPreview = async (postMeta) => {
    if (!postMeta?.id && !postMeta?.slug) return;
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewPost(null);
    try {
      let postId = postMeta.id;
      if (!postId && postMeta.slug) {
        const { items } = await getBlogPosts({
          search: postMeta.slug,
          limit: 10,
        });
        const match =
          (items || []).find((p) => p.slug === postMeta.slug) ||
          (items || [])[0];
        postId = match?.id;
      }
      if (!postId) throw new Error("Post not found for preview");
      const post = await getBlogPost(postId);
      if (!post) throw new Error("Post not found");
      setPreviewPost(post);
    } catch (err) {
      setPreviewError(err.message || "Could not load preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewPost(null);
    setPreviewError("");
  };

  const handleSaveGuidelines = async () => {
    setSavingGuidelines(true);
    try {
      const g = await agentApi.updateGuidelines({
        content: guidelinesDraft,
        humanizePercent: 70,
      });
      setGuidelines(g.content);
      setGuidelinesDraft(g.content);
      setHumanizePercent(70);
      setHumanizeDraft(70);
    } catch (err) {
      setError(err.message || "Could not save guidelines");
    } finally {
      setSavingGuidelines(false);
    }
  };

  const handleSaveMix = async () => {
    if (!canEditGuidelines) return;
    setSavingMix(true);
    setError("");
    try {
      const g = await agentApi.updateGuidelines({
        humanizePercent: snapMixPercent(humanizeDraft, 70),
      });
      const human = snapMixPercent(g?.humanize_percent, humanizeDraft);
      setHumanizePercent(human);
      setHumanizeDraft(human);
      if (g?.content != null) {
        setGuidelines(g.content);
      }
    } catch (err) {
      setError(err.message || "Could not save content mix");
    } finally {
      setSavingMix(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await agentApi.deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setOpenTabs((prev) => prev.filter((t) => t.id !== threadId));
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
        .ba-tabs {
          display: flex;
          gap: 6px;
          padding: 8px 12px 0;
          overflow-x: auto;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .ba-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          max-width: 180px;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #fff;
          font-size: 12px;
          cursor: pointer;
          color: #475569;
        }
        .ba-tab.active {
          background: #fff;
          color: #1e40af;
          font-weight: 700;
          border-color: #bfdbfe;
        }
        .ba-tab-close {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
        }
        .ba-fresh {
          padding: 8px 16px;
          font-size: 12px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          background: #fff;
        }
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
          flex-wrap: wrap;
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
        .ba-fb-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .ba-fb-btn.active-good {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }
        .ba-fb-btn.active-bad {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #991b1b;
        }
        .ba-fb-btn.preview {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
          font-weight: 600;
        }
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
        .ba-mix-card {
          margin-bottom: 16px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }
        .ba-mix-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ba-mix-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .ba-mix-values {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .ba-mix-values span.ai {
          color: #4f46e5;
        }
        .ba-mix-values span.human {
          color: #047857;
        }
        .ba-mix-slider {
          width: 100%;
          margin-top: 12px;
          accent-color: #4f46e5;
        }
        .ba-mix-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 11px;
          color: #94a3b8;
        }
        .ba-mix-hint {
          margin: 8px 0 0;
          font-size: 12px;
          color: #64748b;
          line-height: 1.4;
        }
        .ba-mix-actions {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .ba-mix-presets {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .ba-mix-preset {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #475569;
          cursor: pointer;
        }
        .ba-mix-preset.active {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #eef2ff;
        }
        .ba-mix-preset:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ba-del-thread {
          float: right;
          font-size: 11px;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
        }
        .ba-preview-overlay {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 16px;
        }
        .ba-preview-shell {
          width: min(920px, 100%);
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        .ba-preview-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .ba-preview-bar h3 {
          margin: 0;
          font-size: 14px;
          color: #0f172a;
        }
        .ba-preview-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .ba-preview-actions button, .ba-preview-actions a {
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #334155;
          cursor: pointer;
          text-decoration: none;
          font-weight: 600;
        }
        .ba-preview-body {
          flex: 1;
          overflow-y: auto;
          background: #f1f5f9;
          padding: 24px 16px 40px;
        }
        .ba-article {
          max-width: 720px;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          padding: 28px 28px 40px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .ba-article-cover {
          width: 100%;
          max-height: 360px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 22px;
        }
        .ba-article-title {
          margin: 0 0 10px;
          font-size: 34px;
          line-height: 1.2;
          color: #0f172a;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .ba-article-meta {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 24px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .ba-article-content {
          font-size: 17px;
          line-height: 1.75;
          color: #1e293b;
        }
        .ba-article-content h1,
        .ba-article-content h2,
        .ba-article-content h3,
        .ba-article-content h4 {
          color: #0f172a;
          line-height: 1.3;
          margin: 1.6em 0 0.55em;
          font-weight: 700;
        }
        .ba-article-content h2 { font-size: 1.45em; }
        .ba-article-content h3 { font-size: 1.2em; }
        .ba-article-content p { margin: 0 0 1.05em; }
        .ba-article-content ul, .ba-article-content ol {
          margin: 0 0 1.1em;
          padding-left: 1.35em;
        }
        .ba-article-content li { margin-bottom: 0.4em; }
        .ba-article-content strong { font-weight: 700; color: #0f172a; }
        .ba-article-content a { color: #2563eb; }
        .ba-article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 12px 0;
        }
        .ba-article-content blockquote {
          margin: 1.2em 0;
          padding: 10px 16px;
          border-left: 3px solid #cbd5e1;
          color: #475569;
          background: #f8fafc;
        }
        .ba-article-content code {
          background: #f1f5f9;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.9em;
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

      <div className="ba-mix-card">
        <div className="ba-mix-head">
          <div className="ba-mix-title">Content mix</div>
          <div className="ba-mix-values">
            <span className="ai">AI 30%</span>
            {" · "}
            <span className="human">Humanize 70%</span>
          </div>
        </div>
        <p className="ba-mix-hint" style={{ marginTop: 10 }}>
          Fixed mix: <strong>AI 30%</strong> · <strong>Humanize 70%</strong> on every draft and rewrite.
        </p>
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
              disabled={
                savingGuidelines || guidelinesDraft === guidelines
              }
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
              + New chat
            </button>
          </div>
          <div className="ba-thread-list">
            {loadingThreads && <p style={{ padding: 12, fontSize: 13 }}>Loading…</p>}
            {!loadingThreads && threads.length === 0 && (
              <p style={{ padding: 12, fontSize: 13, color: "#64748b" }}>
                No saved chats yet. Start typing in a new chat.
              </p>
            )}
            {threads.map((t) => (
              <div key={t.id} style={{ position: "relative" }}>
                <button
                  type="button"
                  className={`ba-thread ${activeThreadId === t.id ? "active" : ""}`}
                  onClick={() => openThreadTab(t)}
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
          <div className="ba-tabs">
            <button
              type="button"
              className={`ba-tab ${!activeThreadId ? "active" : ""}`}
              onClick={handleNewChat}
            >
              New chat
            </button>
            {openTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`ba-tab ${activeThreadId === t.id ? "active" : ""}`}
                onClick={() => setActiveThreadId(t.id)}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.title || "Chat"}
                </span>
                <span
                  className="ba-tab-close"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => closeTab(t.id, e)}
                  onKeyDown={(e) => e.key === "Enter" && closeTab(t.id, e)}
                >
                  ×
                </span>
              </button>
            ))}
          </div>
          <div className="ba-fresh">
            {activeThreadId
              ? "Viewing a saved chat — open New chat anytime for a fresh session."
              : "Fresh chat — like ChatGPT, each page visit starts blank. History stays in the left sidebar."}
          </div>
          <div className="ba-status">
            <span>
              {user?.email && <>Signed in as {user.email} · </>}
              {canPublish ? (
                <span className="ba-badge ok">Can publish</span>
              ) : (
                <span className="ba-badge draft">Draft only</span>
              )}
              {agentModel ? (
                <span className="ba-badge draft" style={{ marginLeft: 6 }}>{agentModel}</span>
              ) : null}
            </span>
            <span>
              {agentReady === false && (
                <span className="ba-badge warn">
                  Agent offline — set key in Connect → AI Integrations
                </span>
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
                    &quot;I want a blog about Amazon PPC&quot;
                  </p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    The agent asks a few simple questions first, shows a short plan, then writes after you say <strong>yes</strong> or <strong>write it</strong>.
                  </p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    Say <strong>just write it</strong> to skip questions. After create, Preview opens automatically.
                  </p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    👍 Good saves feedback. 👎 Bad asks the agent to rewrite and improve the post.
                  </p>
                </div>
              </div>
            )}
            {messages.map((m) => {
              const posts = m.role === "assistant" ? postsFromMessage(m) : [];
              const rated = feedbackByMsg[m.id];
              const busy = Boolean(feedbackBusy[m.id]);
              return (
                <div key={m.id} className={`ba-msg ${m.role}`}>
                  {m.content}
                  {m.role === "assistant" && (
                    <div className="ba-msg-actions">
                      {posts.map((p) => (
                        <button
                          key={`preview-${p.id || p.slug}`}
                          type="button"
                          className="ba-fb-btn preview"
                          onClick={() => openPreview(p)}
                        >
                          Preview page
                        </button>
                      ))}
                      {(posts[0]?.id || posts[0]?.slug) && posts[0]?.id ? (
                        <a
                          className="ba-fb-btn"
                          href={`/admin/blog/edit/${posts[0].id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                        >
                          Open editor
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className={`ba-fb-btn ${rated === 1 ? "active-good" : ""}`}
                        disabled={busy || Boolean(rated) || sending}
                        onClick={() => handleFeedback(m.id, 1)}
                      >
                        {rated === 1 ? "✓ Good" : "👍 Good"}
                      </button>
                      <button
                        type="button"
                        className={`ba-fb-btn ${rated === -1 ? "active-bad" : ""}`}
                        disabled={busy || Boolean(rated) || sending}
                        onClick={() => handleFeedback(m.id, -1)}
                      >
                        {busy && rated !== 1 ? "Improving…" : rated === -1 ? "✓ Bad · rewriting" : "👎 Bad"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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

      {previewOpen && (
        <div className="ba-preview-overlay" role="dialog" aria-modal="true">
          <div className="ba-preview-shell">
            <div className="ba-preview-bar">
              <h3>
                Full page preview
                {previewPost?.status ? (
                  <span className="ba-badge draft" style={{ marginLeft: 8 }}>
                    {previewPost.status}
                  </span>
                ) : null}
              </h3>
              <div className="ba-preview-actions">
                {previewPost?.id && (
                  <a href={`/admin/blog/edit/${previewPost.id}`} target="_blank" rel="noreferrer">
                    Edit draft
                  </a>
                )}
                {previewPost?.slug && previewPost?.status === "publish" && (
                  <a
                    href={`https://www.tech2globe.com/blogs/${previewPost.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live URL
                  </a>
                )}
                <button type="button" onClick={closePreview}>
                  Close
                </button>
              </div>
            </div>
            <div className="ba-preview-body">
              {previewLoading && <p style={{ textAlign: "center", color: "#64748b" }}>Loading preview…</p>}
              {previewError && (
                <p style={{ textAlign: "center", color: "#b91c1c" }}>{previewError}</p>
              )}
              {!previewLoading && !previewError && previewPost && (
                <article className="ba-article">
                  {previewPost.featured_image ? (
                    <img
                      className="ba-article-cover"
                      src={previewPost.featured_image}
                      alt={previewPost.title || "Cover"}
                    />
                  ) : null}
                  <h1 className="ba-article-title">{previewPost.title}</h1>
                  <div className="ba-article-meta">
                    <span>{previewPost.author || "Tech2Globe"}</span>
                    {previewPost.date && <span>· {formatTime(previewPost.date)}</span>}
                    {previewPost.slug && <span>· /blogs/{previewPost.slug}</span>}
                  </div>
                  <div
                    className="ba-article-content"
                    dangerouslySetInnerHTML={{ __html: previewPost.content || "" }}
                  />
                </article>
              )}
            </div>
          </div>
        </div>
      )}
    </BlogEditorShell>
  );
}
