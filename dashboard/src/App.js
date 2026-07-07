import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import axios from "axios";

const API_URL = "http://localhost:8080";

export default function App() {
  const [stats, setStats] = useState({ submitted: 0, completed: 0, failed: 0, retried: 0 });
  const [graphData, setGraphData] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState({ queueSize: 0, deadLetterSize: 0 });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/metrics`);
        const text = res.data;

        const submitted = parseInt(text.match(/jobs_submitted_total (\d+)/)?.[1] || 0);
        const completed = parseInt(text.match(/jobs_completed_total (\d+)/)?.[1] || 0);
        const failed = parseInt(text.match(/jobs_failed_total (\d+)/)?.[1] || 0);
        const retried = parseInt(text.match(/jobs_retried_total (\d+)/)?.[1] || 0);

        setStats({ submitted, completed, failed, retried });

        setGraphData(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          submitted, completed, failed, retried
        }].slice(-20));

        // Queue status
        const statusRes = await axios.get(`${API_URL}/api/jobs/status`);
        setQueueStatus(statusRes.data);

      } catch (err) {
        console.error('Metrics error:', err.message);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const submitJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/jobs/submit`, {
        jobs: [
          { name: "DatabaseBackup", command: "backup.sh", priority: "high", dependsOn: [] },
          { name: "GenerateReport", command: "report.sh", priority: "medium", dependsOn: ["DatabaseBackup"] },
          { name: "SendEmail", command: "email.sh", priority: "low", dependsOn: ["GenerateReport"] },
          { name: "ClearCache", command: "cache.sh", priority: "high", dependsOn: [] },
        ]
      });
      setResponse(res.data);
    } catch (err) {
      setResponse({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#080810", minHeight: "100vh", color: "white", padding: "30px", fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "3rem" }}>⚙️</div>
        <h1 style={{ color: "#00ff88", fontSize: "2.5rem", margin: "10px 0", letterSpacing: "3px", textShadow: "0 0 20px #00ff8844" }}>
          Distributed Job Scheduler
        </h1>
        <p style={{ color: "#555", letterSpacing: "2px", fontSize: "0.85rem" }}>
          AI-POWERED TASK ORCHESTRATION ENGINE
        </p>
        <div style={{ width: "100px", height: "2px", background: "linear-gradient(to right, transparent, #00ff88, transparent)", margin: "15px auto" }} />
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" }}>
        {[
          { label: "SUBMITTED", value: stats.submitted, color: "#ffaa00", icon: "📥" },
          { label: "COMPLETED", value: stats.completed, color: "#00ff88", icon: "✅" },
          { label: "RETRIED", value: stats.retried, color: "#aa88ff", icon: "🔄" },
          { label: "FAILED", value: stats.failed, color: "#ff4444", icon: "💀" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#0d0d1a", padding: "20px", borderRadius: "12px",
            border: `1px solid ${stat.color}33`, textAlign: "center",
            boxShadow: `0 0 15px ${stat.color}11`
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontSize: "2rem", fontWeight: "bold" }}>{stat.value}</div>
            <div style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "1px", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Queue Status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", marginBottom: "30px" }}>
        <div style={{ background: "#0d0d1a", padding: "20px", borderRadius: "12px", border: "1px solid #ffaa0033", textAlign: "center" }}>
          <div style={{ color: "#ffaa00", fontSize: "1.5rem", fontWeight: "bold" }}>{queueStatus.queueSize}</div>
          <div style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "1px" }}>QUEUE SIZE</div>
        </div>
        <div style={{ background: "#0d0d1a", padding: "20px", borderRadius: "12px", border: "1px solid #ff444433", textAlign: "center" }}>
          <div style={{ color: "#ff4444", fontSize: "1.5rem", fontWeight: "bold" }}>{queueStatus.deadLetterSize}</div>
          <div style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "1px" }}>DEAD LETTER QUEUE</div>
        </div>
      </div>

      {/* Live Graph */}
      <div style={{ background: "#0d0d1a", padding: "25px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #ffffff11" }}>
        <h2 style={{ color: "#00ff88", fontSize: "1rem", letterSpacing: "2px", marginBottom: "20px" }}>
          📈 LIVE JOB METRICS
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="time" stroke="#444" tick={{ fontSize: 10 }} />
            <YAxis stroke="#444" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0d0d1a", border: "1px solid #333", borderRadius: "8px" }} />
            <Legend />
            <Area type="monotone" dataKey="completed" stroke="#00ff88" fill="url(#completedGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="failed" stroke="#ff4444" fill="url(#failedGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="retried" stroke="#aa88ff" strokeWidth={2} dot={false} fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Job Submitter */}
      <div style={{ background: "#0d0d1a", padding: "25px", borderRadius: "12px", border: "1px solid #ffffff11" }}>
        <h2 style={{ color: "#00ff88", fontSize: "1rem", letterSpacing: "2px", marginBottom: "20px" }}>
          🤖 AI-POWERED JOB SUBMITTER
        </h2>

        <button onClick={submitJobs} disabled={loading} style={{
          background: loading ? "#333" : "linear-gradient(135deg, #00ff88, #00cc66)",
          color: "black", padding: "12px 30px", borderRadius: "8px",
          border: "none", cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold", letterSpacing: "1px", fontSize: "0.9rem",
          boxShadow: loading ? "none" : "0 0 15px #00ff8844",
          marginBottom: "15px"
        }}>
          {loading ? "⏳ SUBMITTING..." : "▶ SUBMIT JOBS WITH AI PRIORITY"}
        </button>

        {response && (
          <div style={{
            background: "#080810", padding: "20px", borderRadius: "8px",
            border: `1px solid ${response.error ? "#ff444444" : "#00ff8844"}`,
          }}>
            {response.error ? (
              <div style={{ color: "#ff4444" }}>❌ Error: {response.error}</div>
            ) : (
              <>
                <div style={{ color: "#00ff88", marginBottom: "10px" }}>
                  ✅ {response.message} — {response.totalJobs} jobs
                </div>
                <div style={{ color: "#ffaa00", marginBottom: "8px" }}>
                  🤖 AI Optimized: {response.aiOptimized ? "YES" : "NO (fallback)"}
                </div>
                <div style={{ color: "#888", fontSize: "0.85rem" }}>
                  Execution Order: {response.executionOrder?.join(" → ")}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "30px", color: "#333", fontSize: "0.75rem", letterSpacing: "2px" }}>
        DISTRIBUTED JOB SCHEDULER • AI-POWERED • FAULT TOLERANT • REAL-TIME MONITORING
      </div>

    </div>
  );
}