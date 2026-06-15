"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import BlogEditorShell from "../../components/BlogEditorShell";
import BlogForm from "../../components/BlogForm";
import { getBlogPost, getCategories, updateBlogPost } from "../../services/blogService";
import { postToForm } from "../../lib/formDefaults";

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams();
  const { loading: authLoading, canView, canEdit, isReadOnly } = useAuth();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog") || !canEdit("blog") || isReadOnly("blog")) {
      router.replace("/admin/blog");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [post, cats] = await Promise.all([
          getBlogPost(id),
          getCategories(),
        ]);
        if (cancelled) return;
        if (!post) {
          setLoadError("Post not found.");
          return;
        }
        setForm(postToForm(post));
        setCategories(cats);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Failed to load post");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, canView, canEdit, isReadOnly, id, router]);

  const handleSubmit = async (payload) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await updateBlogPost(id, payload);
      router.push("/admin/blog?updated=1");
    } catch (err) {
      alert(err.message || "Failed to update blog post");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <BlogEditorShell title="Edit blog post">
        <p>Loading…</p>
      </BlogEditorShell>
    );
  }

  if (loadError || !form) {
    return (
      <BlogEditorShell title="Edit blog post">
        <p style={{ color: "#dc2626" }}>{loadError || "Post not found."}</p>
      </BlogEditorShell>
    );
  }

  return (
    <BlogEditorShell
      title="Edit blog post"
      subtitle={form.title || "Update content and SEO settings."}
    >
      <BlogForm
        form={form}
        setForm={setForm}
        categories={categories}
        onSubmit={handleSubmit}
        submitting={submitting}
        editingId={id}
        onCancel={() => router.push("/admin/blog")}
      />
    </BlogEditorShell>
  );
}
