"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    experience: "",
    positions: "",
    location: "",
    salary: "",
    qualification: "",
    skills: "",
    responsibilities: "",
    status: "active",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Fetch job ──────────────────────────────────────
  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) return;

        const res = await fetch(
          `${API}/api/career/admin/jobs/${id}`,   // ✅ admin route
          { credentials: "include" }
        );

        const data = await res.json();
     

        const job = data?.data?.[0] || data?.data || data?.job || data;

        if (job && job.id) {
          setForm({
            title:           job.title           ?? "",
            experience:      job.experience       ?? "",
            positions:       job.positions        ?? "",
            location:        job.location         ?? "",
            salary:          job.salary           ?? "",
            qualification:   job.qualification    ?? "",
            skills:          job.skills           ?? "",
            responsibilities:job.responsibilities ?? "",
            status:          job.status           ?? "active",
          });
        }
      } catch (err) {
        console.error("Fetch job error:", err);
      }

      setLoading(false);
    };

    fetchJob();
  }, [id]);

  // ── Update job ─────────────────────────────────────
  const updateJob = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        `${API}/api/career/admin/jobs/${id}`,     // ✅ fixed: was missing /admin/
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Job updated successfully");
        router.push("/admin/career/jobs");
      } else {
        alert(data.error || "Failed to update job");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }

    setSaving(false);
  };

  return (
    <>
      <style>{`
        .jp {
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px 16px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .jp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .jp-title {
          font-size: 26px;
          font-weight: 800;
          color: #1a1a2e;
        }
        .jp-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 16px rgba(0,0,0,.07);
          overflow: hidden;
        }
        .jp-card-head {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: #2dd4a0;
          border-radius: 50%;
          box-shadow: 0 0 6px #2dd4a0;
        }
        .jp-body { padding: 24px; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group.full { grid-column: 1 / -1; }
        label {
          font-size: 12px;
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        input, textarea, select {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 14px;
          outline: none;
          transition: border .2s, box-shadow .2s;
        }
        input:focus, textarea:focus, select:focus {
          border-color: #4f8ef7;
          box-shadow: 0 0 0 3px rgba(79,142,247,.12);
        }
        textarea { resize: vertical; min-height: 110px; }
        .actions {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn {
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-primary { background: #4f8ef7; color: #fff; }
        .btn-primary:hover { background: #3c76d8; }
        .btn-secondary { background: #e8ecf0; }
        .btn-secondary:hover { background: #dfe3e8; }
        .state { padding: 60px; text-align: center; color: #888; }
        .badge-active   { background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .badge-inactive { background: #fee2e2; color: #991b1b; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        @media(max-width:768px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="jp">
        <div className="jp-header">
          <h1 className="jp-title">Edit Job</h1>
          {!loading && (
            <span className={form.status === "active" ? "badge-active" : "badge-inactive"}>
              {form.status === "active" ? "● Active" : "● Inactive"}
            </span>
          )}
        </div>

        <div className="jp-card">
          <div className="jp-card-head">
            <div className="live-dot"></div>
            Update Job Details
          </div>

          <div className="jp-body">
            {loading ? (
              <div className="state">Loading job...</div>
            ) : (
              <form onSubmit={updateJob}>
                <div className="form-grid">

                  <div className="form-group">
                    <label>Job Title *</label>
                    <input name="title" value={form.title} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Experience (years)</label>
                    <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Number of Positions</label>
                    <input name="positions" type="number" min="1" value={form.positions} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input name="location" value={form.location} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Salary</label>
                    <input name="salary" value={form.salary} onChange={handleChange} />
                  </div>

                  <div className="form-group full">
                    <label>Qualification</label>
                    <input name="qualification" value={form.qualification} onChange={handleChange} />
                  </div>

                  <div className="form-group full">
                    <label>Skills / Requirements</label>
                    <textarea name="skills" value={form.skills} onChange={handleChange} />
                  </div>

                  <div className="form-group full">
                    <label>Responsibilities / Job Profile</label>
                    <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} />
                  </div>

                </div>

                <div className="actions">
                  <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Updating..." : "Update Job"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}