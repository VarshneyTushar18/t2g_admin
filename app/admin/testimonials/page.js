"use client";

import { useEffect, useState } from "react";
import useTestimonials from "./hooks/useTestimonials";
import TestimonialTable from "./components/TestimonialTable";
import TestimonialModal from "./components/TestimonialModal";
import { api } from "@/lib/api";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "./services/testimonialService";

import "./styles/testimonials.css";

const emptyForm = {
  name: "",
  stars: 5,
  text: "",
  position: "",
  companyName: "",
  link: "",
  is_active: true,
  avatar: null,
  companyLogo: null,
};

export default function TestimonialsPage() {
  const { items, loading, error, reload } = useTestimonials();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingEditId, setPendingEditId] = useState(null);

  useEffect(() => {
    if (!pendingEditId) return;

    async function fetchAndOpen() {
      try {
        const item = await api.get(`/api/testimonials/${pendingEditId}`);

        setForm({
          name:        item.name        || "",
          stars:       item.stars       || 5,
          text:        item.text        || "",
          position:    item.position    || "",
          companyName: item.companyName || "",
          link:        item.link        || "",
          is_active:
            item.status === "active" ||
            item.status === true     ||
            item.status === 1,
          avatar:      item.avatar      || null,
          companyLogo: item.companyLogo || null,
        });

        setEditingId(pendingEditId);
        setShowModal(true);
      } catch (err) {
        console.error(err);
        alert("Unable to load testimonial");
      } finally {
        setPendingEditId(null);
      }
    }

    fetchAndOpen();
  }, [pendingEditId]);

  useEffect(() => {
    if (loading) return;

    let table;
    let $;

    async function init() {
      $ = (await import("jquery")).default;
      window.jQuery = $;

      await import("datatables.net-dt");
      await import("datatables.net-responsive");

      if ($.fn.dataTable.isDataTable("#testimonialTable")) {
        $("#testimonialTable").DataTable().destroy();
      }

      table = $("#testimonialTable").DataTable({
        responsive: true,
        pageLength: 10,
        columnDefs: [{ orderable: false, targets: -1 }],
      });

      $(document)
        .off("click", ".edit-btn")
        .on("click", ".edit-btn", function (e) {
          e.preventDefault();
          e.stopPropagation();
          const id = $(this).attr("data-id");
          if (id) setPendingEditId(id);
        });

      $(document)
        .off("click", ".delete-btn")
        .on("click", ".delete-btn", function (e) {
          e.preventDefault();
          e.stopPropagation();
          const id = $(this).attr("data-id");
          if (id) handleDelete(id);
        });
    }

    init();

    return () => {
      if (table) table.destroy();
      if (typeof window !== "undefined" && window.jQuery) {
        window.jQuery(document).off("click", ".edit-btn");
        window.jQuery(document).off("click", ".delete-btn");
      }
    };
  }, [loading, items]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateTestimonial(editingId, form);
      } else {
        await createTestimonial(form);
      }
      await reload();
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save testimonial.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      await reload();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete testimonial.");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <>
      <div className="tp">
        <div className="tp-header">
          <div className="tp-header-left">
            <h1 className="tp-title">Testimonials</h1>
            <p className="tp-subtitle">Manage client reviews and social proof</p>
          </div>
          <button className="btn-add" onClick={openCreate}>
            <span>+</span> Add Testimonial
          </button>
        </div>

        <div className="tp-card">
          <div className="tp-card-head">
            <span>All Testimonials</span>
            {!loading && !error && (
              <span className="tp-count">{items.length} total</span>
            )}
          </div>

          {loading && (
            <div className="tp-state">
              <div className="tp-spinner" />
              <p>Loading testimonials…</p>
            </div>
          )}

          {error && (
            <div className="tp-state tp-state--error">
              <span>⚠</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="tp-body">
              <TestimonialTable items={items} />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TestimonialModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </>
  );
}