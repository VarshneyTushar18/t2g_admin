"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/app/config";

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    experience: "",
    positions: "",
    location: "",
    salary: "",
    qualification: "",
    skills: "",
    responsibilities: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/career/admin/jobs"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Job Created Successfully");
        router.push("/admin/career/jobs");
      } else {
        alert("Error creating job");
      }
    } catch (error) {
      alert("Error creating job");
    }

    setLoading(false);
  }

  return (
    <>
      <style>{`

      .jp {
        min-height:100vh;
        background:#f0f2f5;
        padding:20px 16px;
        font-family:'Segoe UI',system-ui,sans-serif;
      }

      /* HEADER */

      .jp-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:20px;
        flex-wrap:wrap;
      }

      .jp-title{
        font-size:26px;
        font-weight:800;
        color:#1a1a2e;
      }

      .jp-badge{
        background:#4f8ef7;
        color:#fff;
        font-size:12px;
        font-weight:700;
        padding:4px 12px;
        border-radius:20px;
      }

      /* CARD */

      .jp-card{
        background:#fff;
        border-radius:14px;
        box-shadow:0 2px 16px rgba(0,0,0,.07);
        overflow:hidden;
      }

      .jp-card-head{
        padding:16px 20px;
        border-bottom:1px solid #eee;
        font-weight:700;
        font-size:14px;
        display:flex;
        align-items:center;
        gap:8px;
      }

      .live-dot{
        width:8px;
        height:8px;
        background:#2dd4a0;
        border-radius:50%;
        box-shadow:0 0 6px #2dd4a0;
      }

      .jp-body{
        padding:24px;
      }

      /* FORM */

      .form-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:18px;
      }

      .form-group{
        display:flex;
        flex-direction:column;
        gap:6px;
      }

      .form-group.full{
        grid-column:1 / -1;
      }

      label{
        font-size:12px;
        font-weight:700;
        color:#666;
        text-transform:uppercase;
        letter-spacing:.5px;
      }

      input, textarea{
        border:1px solid #ddd;
        border-radius:8px;
        padding:9px 12px;
        font-size:14px;
        outline:none;
        transition:border .2s, box-shadow .2s;
      }

      input:focus, textarea:focus{
        border-color:#4f8ef7;
        box-shadow:0 0 0 3px rgba(79,142,247,.12);
      }

      textarea{
        resize:vertical;
        min-height:110px;
      }

      /* ACTIONS */

      .form-actions{
        margin-top:24px;
        display:flex;
        justify-content:flex-end;
      }

      .btn{
        border:none;
        padding:10px 18px;
        border-radius:8px;
        font-size:14px;
        font-weight:700;
        cursor:pointer;
      }

      .btn-primary{
        background:#4f8ef7;
        color:#fff;
      }

      .btn-primary:hover{
        background:#3c76d8;
      }

      .btn-primary:disabled{
        opacity:.6;
        cursor:not-allowed;
      }

      /* RESPONSIVE */

      @media(max-width:768px){
        .form-grid{
          grid-template-columns:1fr;
        }

        .jp-body{
          padding:16px;
        }
      }

      `}</style>

      <div className="jp">

        {/* Header */}

        <div className="jp-header">
          <h1 className="jp-title">Create Job</h1>
          <span className="jp-badge">Admin</span>
        </div>

        {/* Card */}

        <div className="jp-card">

          <div className="jp-card-head">
            <div className="live-dot"></div>
            Job Details
          </div>

          <div className="jp-body">

            <form onSubmit={submit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Experience</label>
                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="2 - 5 Years"
                  />
                </div>

                <div className="form-group">
                  <label>Positions</label>
                  <input
                    type="number"
                    name="positions"
                    value={form.positions}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="New York"
                  />
                </div>

                <div className="form-group">
                  <label>Salary</label>
                  <input
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="$50k - $70k"
                  />
                </div>

                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="Bachelor Degree"
                  />
                </div>

                <div className="form-group full">
                  <label>Required Skills</label>
                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>

                <div className="form-group full">
                  <label>Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    value={form.responsibilities}
                    onChange={handleChange}
                    placeholder="Develop scalable applications..."
                  />
                </div>

              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Job"}
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>
    </>
  );
}