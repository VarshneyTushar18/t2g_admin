"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JobsAdminPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);
  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/career/admin/jobs`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setJobs(data.data);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const deleteJob = async (id) => {
    if (!confirm("Delete this job?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/career/admin/jobs/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchJobs();
  };

  return (
    <>
      <style>{`

      .jp{
        min-height:100vh;
        background:#f0f2f5;
        padding:20px 16px;
        font-family:'Segoe UI',system-ui,sans-serif;
      }

      .jp-header{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:20px;
        flex-wrap:wrap;
        gap:10px;
      }

      .jp-title{
        font-size:26px;
        font-weight:800;
        color:#1a1a2e;
      }

      .jp-btn{
        background:#4f8ef7;
        color:#fff;
        border:none;
        padding:8px 14px;
        border-radius:8px;
        font-size:13px;
        font-weight:700;
        cursor:pointer;
      }

      .jp-btn:hover{
        background:#3a73d6;
      }

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
        padding:16px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        font-size:13px;
      }

      thead th{
        background:#f8f9fb;
        text-transform:uppercase;
        font-size:11px;
        letter-spacing:.7px;
        padding:12px;
        color:#666;
        border-bottom:2px solid #eee;
      }

      tbody td{
        padding:12px;
        border-bottom:1px solid #f1f1f1;
      }

      tbody tr:hover{
        background:#f7f9ff;
      }

      .actions{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
      }

      .btn{
        padding:5px 10px;
        font-size:12px;
        border-radius:6px;
        border:none;
        cursor:pointer;
      }

      .btn-view{ background:#e8f0fe; color:#4f8ef7;}
      .btn-edit{ background:#e6faf4; color:#16a37f;}
      .btn-delete{ background:#fde8e8; color:#e74c3c;}

      .job-details{
        background:#fafbff;
        padding:16px;
      }

      .job-details table{
        width:100%;
      }

      .job-details th{
        width:200px;
        text-align:left;
        font-size:12px;
        color:#666;
      }

      .job-details td{
        font-size:13px;
      }

      .state{
        padding:50px;
        text-align:center;
        color:#888;
      }

      `}</style>

      <div className="jp">

        {/* Header */}

        <div className="jp-header">
          <h1 className="jp-title">Jobs Dashboard</h1>

          <button
            className="jp-btn"
            onClick={() => router.push("/admin/career/jobs/create")}
          >
            + Create Job
          </button>
        </div>

        {/* Card */}

        <div className="jp-card">

          <div className="jp-card-head">
            <div className="live-dot" />
            All Job Listings
          </div>

          <div className="jp-body">

            {loading && <div className="state">Loading jobs...</div>}

            {!loading && jobs.length === 0 && (
              <div className="state">No jobs found</div>
            )}

            {!loading && jobs.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Experience</th>
                    <th>Positions</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {jobs.map((job) => (
                    <>

                      <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.experience}</td>
                        <td>{job.positions}</td>
                        <td>{job.location}</td>

                        <td>
                          <div className="actions">

                            <button
                              className="btn btn-view"
                              onClick={() =>
                                setOpenRow(openRow === job.id ? null : job.id)
                              }
                            >
                              View
                            </button>

                            <button
                              className="btn btn-edit"
                              onClick={() =>
                                router.push(`/admin/career/jobs/edit/${job.id}`)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-delete"
                              onClick={() => deleteJob(job.id)}
                            >
                              Delete
                            </button>

                          </div>
                        </td>
                      </tr>

                      {openRow === job.id && (
                        <tr>
                          <td colSpan="5">

                            <div className="job-details">

                              <table>
                                <tbody>

                                  <tr>
                                    <th>Location</th>
                                    <td>{job.location}</td>
                                  </tr>

                                  <tr>
                                    <th>Qualification</th>
                                    <td>{job.qualification}</td>
                                  </tr>

                                  <tr>
                                    <th>Salary</th>
                                    <td>{job.salary}</td>
                                  </tr>

                                  <tr>
                                    <th>Skills</th>
                                    <td>{job.skills}</td>
                                  </tr>

                                  <tr>
                                    <th>Responsibilities</th>
                                    <td>{job.responsibilities}</td>
                                  </tr>

                                </tbody>
                              </table>

                            </div>

                          </td>
                        </tr>
                      )}

                    </>
                  ))}

                </tbody>
              </table>
            )}

          </div>

        </div>

      </div>
    </>
  );
}