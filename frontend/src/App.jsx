import { useState } from "react";
import axios from "axios";

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

function EmployeeCard({ employee }) {
  const capabilities = typeof employee.capability === "string"
    ? JSON.parse(employee.capability)
    : employee.capability;

  return (
    <div style={{
      backgroundColor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "10px",
      padding: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <div>
        <div style={{ fontWeight: 600, color: COLORS.text }}>
          {employee.name || `Employee #${employee.employeeID}`}
        </div>
        <div style={{ fontSize: "0.8rem", color: COLORS.muted, marginTop: "4px" }}>
          ID: {employee.employeeID}
        </div>
        {capabilities && (
          <div style={{ fontSize: "0.8rem", color: COLORS.muted, marginTop: "4px" }}>
            {Array.isArray(capabilities) ? capabilities.join(", ") : JSON.stringify(capabilities)}
          </div>
        )}
      </div>
      {employee.status && <StatusBadge status={employee.status} />}
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
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "0.85rem",
        flexShrink: 0,
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

  async function fetchEmployees() {
    setLoadingEmployees(true);
    try {
      const res = await axios.get("http://localhost:8000/data");
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
      const res = await axios.post("http://localhost:8000/insights", {
        job_description: jobDescription,
      });
      setRecommendations(res.data.chosen_employees);
      setReasoning(res.data.reasoning);
      setError("");
    } catch {
      setError("Could not fetch recommendations. Is app-core running?");
    } finally {
      setLoadingRec(false);
    }
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
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>
          🌊 DeepDive
        </h1>
        <p style={{ color: COLORS.muted, marginTop: "0.25rem" }}>
          AI-Powered Workforce Management
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Job Description */}
          <div style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
          }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>
              📋 Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Describe the job requirements, location, duration, and any special conditions..."
              style={{
                width: "100%",
                minHeight: "140px",
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                color: COLORS.text,
                padding: "0.75rem",
                fontSize: "0.9rem",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
            <button
              onClick={fetchRecommendations}
              disabled={loadingRec}
              style={{
                marginTop: "1rem",
                width: "100%",
                backgroundColor: COLORS.accent,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: loadingRec ? "not-allowed" : "pointer",
                opacity: loadingRec ? 0.7 : 1,
              }}
            >
              {loadingRec ? "⏳ Finding Best Candidates..." : "🤖 Get AI Recommendations"}
            </button>
          </div>

          {/* AI Recommendations */}
          <div style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "1.5rem",
          }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>
              🧠 AI Recommendations
            </h2>

            {!recommendations && !loadingRec && (
              <p style={{ color: COLORS.muted, fontSize: "0.9rem" }}>
                Describe a job and click "Get AI Recommendations" to see suggested candidates.
              </p>
            )}

            {recommendations && (
              <>
                {/* Recommended employees */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {recommendations.map((emp, i) => (
                    <RecommendationCard key={emp.employeeID} employee={emp} index={i} />
                  ))}
                </div>

                {/* Reasoning */}
                {reasoning && (
                  <div style={{
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: COLORS.muted,
                    lineHeight: 1.7,
                  }}>
                    <div style={{ fontWeight: 600, color: COLORS.text, marginBottom: "0.5rem" }}>
                      💬 Reasoning
                    </div>
                    {reasoning}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column — Employee Roster */}
        <div style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "12px",
          padding: "1.5rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
              👥 Active Employees
            </h2>
            <button
              onClick={fetchEmployees}
              disabled={loadingEmployees}
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                borderRadius: "8px",
                padding: "0.4rem 0.9rem",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {loadingEmployees ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {employees.length === 0 && (
            <p style={{ color: COLORS.muted, fontSize: "0.9rem" }}>
              Click Refresh to load active employees from the database.
            </p>
          )}

          {employees.length > 0 && (
            <>
              {/* Stats */}
              <div style={{
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: COLORS.green }}>
                  {employees.length}
                </span>
                <span style={{ fontSize: "0.85rem", color: COLORS.muted, marginLeft: "0.5rem" }}>
                  Active Employees
                </span>
              </div>

              {/* Employee List */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                maxHeight: "520px",
                overflowY: "auto",
              }}>
                {employees.map((emp) => (
                  <EmployeeCard key={emp.employeeID} employee={emp} />
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
          backgroundColor: COLORS.red + "18",
          border: `1px solid ${COLORS.red}44`,
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          color: COLORS.red,
          fontSize: "0.9rem",
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}