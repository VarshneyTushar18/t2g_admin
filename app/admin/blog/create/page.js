"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import BlogEditorShell from "../components/BlogEditorShell";
import BlogForm from "../components/BlogForm";
import { createBlogPost, getCategories } from "../services/blogService";
import { createEmptyForm } from "../lib/formDefaults";

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, loading: authLoading, canView, canAdd, isReadOnly } = useAuth();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog") || !canAdd("blog") || isReadOnly("blog")) {
      router.replace("/admin/blog");
      return;
    }
    setForm(createEmptyForm(user));
  }, [authLoading, canView, canAdd, isReadOnly, router, user]);

  useEffect(() => {
    if (authLoading || !canView("blog")) return;
    getCategories()
      .then(setCategories)
      .catch((err) => console.error("Categories fetch error:", err));
  }, [authLoading, canView]);

  const handleSubmit = async (payload) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await createBlogPost(payload);
      router.push("/admin/blog?created=1");
    } catch (err) {
      alert(err.message || "Failed to create blog post");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !form) {
    return (
      <BlogEditorShell title="Add blog post">
        <p>Loading…</p>
      </BlogEditorShell>
    );
  }

  return (
    <BlogEditorShell
      title="Add blog post"
      subtitle="Write content, set SEO, and publish to the live site."
    >
      <BlogForm
        form={form}
        setForm={setForm}
        categories={categories}
        onSubmit={handleSubmit}
        submitting={submitting}
        editingId={null}
        onCancel={() => router.push("/admin/blog")}
      />
    </BlogEditorShell>
  );
}
