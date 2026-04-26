import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const COLORS = {
  bg: "#0f1117",
  card: "#1a1d27",
  border: "#2a2d3e",
  accent: "#4f8ef7",
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
  text: "#e2e8f0",
  muted: "#64748b",
};

const STATUSES = ["ACTIVE", "INACTIVE", "PER_DIEM", "HIDDEN"];

const emptyForm = {
  companyID: "",
  name: "",
  status: "ACTIVE",
  capability: "",
  limitations: "",
  unavailable: "",
};

function StatusBadge({ status }) {
  const color =
    status === "ACTIVE" ? COLORS.green :
    status === "PER_DIEM" ? COLORS.yellow :
    COLORS.red;
  return (
    <span style={{
      backgroundColor: color + "22",
      color,
      border: `1px solid ${color}`,
      borderRadius: "999px",
      padding: "2px 10px",
      fontSize: "0.75rem",
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "#00000099",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "14px",
        padding: "2rem",
        width: "100%",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "none", border: "none",
            color: COLORS.muted, fontSize: "1.4rem", cursor: "pointer",
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmployeeForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial || emptyForm);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    // Parse JSON fields
    try {
      const payload = {
        ...form,
        companyID: parseInt(form.companyID),
        capability: JSON.parse(form.capability || "{}"),
        limitations: JSON.parse(form.limitations || "{}"),
        unavailable: JSON.parse(form.unavailable || "{}"),
      };
      onSubmit(payload);
    } catch {
      alert("Capability, Limitations, and Unavailable must be valid JSON.\nExample: {\"skills\": [\"welding\"]}");
    }
  }

  const inputStyle = {
    width: "100%",
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    color: COLORS.text,
    padding: "0.6rem 0.75rem",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    marginTop: "0.4rem",
  };

  const labelStyle = {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 600,
    display: "block",
    marginTop: "1rem",
  };

  return (
    <div>
      <label style={labelStyle}>Name</label>
      <input style={inputStyle} value={form.name}
        onChange={e => set("name", e.target.value)} placeholder="Full name" />

      <label style={labelStyle}>Company ID</label>
      <input style={inputStyle} value={form.companyID} type="number"
        onChange={e => set("companyID", e.target.value)} placeholder="e.g. 1" />

      <label style={labelStyle}>Status</label>
      <select style={inputStyle} value={form.status}
        onChange={e => set("status", e.target.value)}>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <label style={labelStyle}>Capability (JSON)</label>
      <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
        value={form.capability}
        onChange={e => set("capability", e.target.value)}
        placeholder='{"skills": ["welding", "driving"]}' />

      <label style={labelStyle}>Limitations (JSON)</label>
      <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
        value={form.limitations}
        onChange={e => set("limitations", e.target.value)}
        placeholder='{"restrictions": ["no heights"]}' />

      <label style={labelStyle}>Unavailable (JSON)</label>
      <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
        value={form.unavailable}
        onChange={e => set("unavailable", e.target.value)}
        placeholder='{"dates": ["2026-05-01"]}' />

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <button onClick={handleSubmit} disabled={loading} style={{
          flex: 1,
          backgroundColor: COLORS.accent,
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "0.7rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} style={{
          flex: 1,
          backgroundColor: "transparent",
          color: COLORS.text,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "8px",
          padding: "0.7rem",
          fontWeight: 600,
          cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function EmployeeCard({ employee, onEdit, onDelete }) {
  return (
    <div style={{
      backgroundColor: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "10px",
      padding: "1rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600, color: COLORS.text }}>{employee.name}</div>
          <div style={{ fontSize: "0.8rem", color: COLORS.muted, marginTop: "2px" }}>
            ID: {employee.employeeID} · Company: {employee.companyID}
          </div>
        </div>
        <StatusBadge status={employee.status} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button onClick={() => onEdit(employee)} style={{
          flex: 1,
          backgroundColor: COLORS.accent + "22",
          color: COLORS.accent,
          border: `1px solid ${COLORS.accent}44`,
          borderRadius: "6px",
          padding: "0.4rem",
          fontSize: "0.8rem",
          cursor: "pointer",
          fontWeight: 600,
        }}>
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(employee.employeeID)} style={{
          flex: 1,
          backgroundColor: COLORS.red + "22",
          color: COLORS.red,
          border: `1px solid ${COLORS.red}44`,
          borderRadius: "6px",
          padding: "0.4rem",
          fontSize: "0.8rem",
          cursor: "pointer",
          fontWeight: 600,
        }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({ employee, index }) {
  return (
    <div style={{
      backgroundColor: COLORS.card,
      border: `1px solid ${COLORS.accent}44`,
      borderLeft: `4px solid ${COLORS.accent}`,
      borderRadius: "10px",
      padding: "1.2rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    }}>
      <div style={{
        backgroundColor: COLORS.accent,
        color: "#fff",
        borderRadius: "50%",
        width: "28px", height: "28px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
      }}>
        {index + 1}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: COLORS.text }}>
          {employee.name || `Employee #${employee.employeeID}`}
        </div>
        <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>
          ID: {employee.employeeID}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [employees, setEmployees] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [reasoning, setReasoning] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  async function fetchEmployees() {
    setLoadingEmployees(true);
    try {
      const res = await axios.get(`${API}/data`);
      setEmployees(res.data);
      setError("");
    } catch {
      setError("Could not fetch employees. Is app-core running?");
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function fetchRecommendations() {
    if (!jobDescription.trim()) {
      setError("Please describe the job before requesting recommendations.");
      return;
    }
    setLoadingRec(true);
    setRecommendations(null);
    setReasoning("");
    try {
      const res = await axios.post(`${API}/insights`, { job_description: jobDescription });
      setRecommendations(res.data.chosen_employees);
      setReasoning(res.data.reasoning);
      setError("");
    } catch {
      setError("Could not fetch recommendations. Is app-core running?");
    } finally {
      setLoadingRec(false);
    }
  }

  async function handleCreate(data) {
    setFormLoading(true);
    try {
      await axios.post(`${API}/employees`, data);
      setShowAddModal(false);
      fetchEmployees();
    } catch {
      setError("Could not create employee.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate(data) {
    setFormLoading(true);
    try {
      await axios.patch(`${API}/employees/${editEmployee.employeeID}`, data);
      setEditEmployee(null);
      fetchEmployees();
    } catch {
      setError("Could not update employee.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(employeeID) {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${API}/employees/${employeeID}`);
      fetchEmployees();
    } catch {
      setError("Could not delete employee.");
    }
  }

  function prepareEditForm(employee) {
    setEditEmployee({
      ...employee,
      capability: JSON.stringify(employee.capability || {}, null, 2),
      limitations: JSON.stringify(employee.limitations || {}, null, 2),
      unavailable: JSON.stringify(employee.unavailable || {}, null, 2),
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Inter', 'Arial', sans-serif",
      padding: "2rem",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>🌊 DeepDive</h1>
        <p style={{ color: COLORS.muted, marginTop: "0.25rem" }}>AI-Powered Workforce Management</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Job Description */}
          <div style={{
            backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
            borderRadius: "12px", padding: "1.5rem",
          }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>📋 Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Describe the job requirements, location, duration, and any special conditions..."
              style={{
                width: "100%", minHeight: "140px",
                backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`,
                borderRadius: "8px", color: COLORS.text,
                padding: "0.75rem", fontSize: "0.9rem",
                resize: "vertical", outline: "none",
                boxSizing: "border-box", lineHeight: 1.6,
              }}
            />
            <button onClick={fetchRecommendations} disabled={loadingRec} style={{
              marginTop: "1rem", width: "100%",
              backgroundColor: COLORS.accent, color: "#fff",
              border: "none", borderRadius: "8px", padding: "0.75rem",
              fontSize: "0.95rem", fontWeight: 600,
              cursor: loadingRec ? "not-allowed" : "pointer",
              opacity: loadingRec ? 0.7 : 1,
            }}>
              {loadingRec ? "⏳ Finding Best Candidates..." : "🤖 Get AI Recommendations"}
            </button>
          </div>

          {/* Recommendations */}
          <div style={{
            backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
            borderRadius: "12px", padding: "1.5rem",
          }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>🧠 AI Recommendations</h2>
            {!recommendations && !loadingRec && (
              <p style={{ color: COLORS.muted, fontSize: "0.9rem" }}>
                Describe a job and click "Get AI Recommendations" to see suggested candidates.
              </p>
            )}
            {recommendations && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {recommendations.map((emp, i) => (
                    <RecommendationCard key={emp.employeeID} employee={emp} index={i} />
                  ))}
                </div>
                {reasoning && (
                  <div style={{
                    backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px", padding: "1rem",
                    fontSize: "0.875rem", color: COLORS.muted, lineHeight: 1.7,
                  }}>
                    <div style={{ fontWeight: 600, color: COLORS.text, marginBottom: "0.5rem" }}>💬 Reasoning</div>
                    {reasoning}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column — Employee Roster */}
        <div style={{
          backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: "12px", padding: "1.5rem",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>👥 Employee Roster</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setShowAddModal(true)} style={{
                backgroundColor: COLORS.green + "22", color: COLORS.green,
                border: `1px solid ${COLORS.green}44`, borderRadius: "8px",
                padding: "0.4rem 0.9rem", fontSize: "0.85rem",
                cursor: "pointer", fontWeight: 600,
              }}>
                + Add
              </button>
              <button onClick={fetchEmployees} disabled={loadingEmployees} style={{
                backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
                color: COLORS.text, borderRadius: "8px",
                padding: "0.4rem 0.9rem", fontSize: "0.85rem", cursor: "pointer",
              }}>
                {loadingEmployees ? "Loading..." : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {employees.length === 0 && (
            <p style={{ color: COLORS.muted, fontSize: "0.9rem" }}>
              Click Refresh to load active employees from the database.
            </p>
          )}

          {employees.length > 0 && (
            <>
              <div style={{
                backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`,
                borderRadius: "8px", padding: "0.75rem 1rem",
                marginBottom: "1rem", textAlign: "center",
              }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: COLORS.green }}>
                  {employees.length}
                </span>
                <span style={{ fontSize: "0.85rem", color: COLORS.muted, marginLeft: "0.5rem" }}>
                  Active Employees
                </span>
              </div>
              <div style={{
                display: "flex", flexDirection: "column", gap: "0.6rem",
                maxHeight: "520px", overflowY: "auto",
              }}>
                {employees.map(emp => (
                  <EmployeeCard
                    key={emp.employeeID}
                    employee={emp}
                    onEdit={prepareEditForm}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: "1.5rem",
          backgroundColor: COLORS.red + "18", border: `1px solid ${COLORS.red}44`,
          borderRadius: "8px", padding: "0.75rem 1rem",
          color: COLORS.red, fontSize: "0.9rem",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="➕ Add New Employee" onClose={() => setShowAddModal(false)}>
          <EmployeeForm
            onSubmit={handleCreate}
            onCancel={() => setShowAddModal(false)}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editEmployee && (
        <Modal title="✏️ Edit Employee" onClose={() => setEditEmployee(null)}>
          <EmployeeForm
            initial={editEmployee}
            onSubmit={handleUpdate}
            onCancel={() => setEditEmployee(null)}
            loading={formLoading}
          />
        </Modal>
      )}
    </div>
  );
}