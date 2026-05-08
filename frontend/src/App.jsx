import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      onAuth(data.email);
    } catch (err) {
      Sentry.captureException(err);
      setError("Erreur réseau");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="10" fill="#2563eb"/>
          <path d="M10 18l6 6 10-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#fff" }}>TaskFlow</h1>
      </div>
      <p style={{ color: "#d1d5db", marginBottom: 32, fontSize: 14, letterSpacing: "0.01em" }}>
        Gestionnaire de tâches — React · Node.js · MongoDB
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["login", "register"].map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "10px", border: "none", borderRadius: 8, cursor: "pointer",
            fontWeight: 600, fontSize: 14,
            background: mode === m ? "#2563eb" : "#e5e7eb",
            color: mode === m ? "#fff" : "#374151",
          }}>
            {m === "login" ? "Connexion" : "Inscription"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          data-cy="auth-email"
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" required
          style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15 }}
        />
        <input
          data-cy="auth-password"
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe (min. 6 caractères)" required
          style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15 }}
        />
        {error && <p style={{ color: "#dc2626", fontSize: 14, margin: 0 }}>{error}</p>}
        <button
          data-cy="auth-submit"
          type="submit" disabled={loading}
          style={{
            padding: "11px", background: "#2563eb", color: "#fff",
            border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}
        >
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer un compte"}
        </button>
      </form>
    </div>
  );
}

function TaskManager({ email, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const res = await fetch(`${API}/api/tasks`, { headers: authHeaders() });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      Sentry.captureException(err);
      setError("Impossible de charger les tâches.");
    }
  }

  useEffect(() => { loadTasks(); }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title: input.trim() }),
      });
      if (!res.ok) throw new Error("Erreur création");
      setInput("");
      await loadTasks();
    } catch (err) {
      Sentry.captureException(err);
      setError("Erreur lors de la création.");
    }
  }

  async function markDone(id) {
    await fetch(`${API}/api/tasks/${id}/done`, { method: "PATCH", headers: authHeaders() });
    await loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API}/api/tasks/${id}`, { method: "DELETE", headers: authHeaders() });
    await loadTasks();
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="10" fill="#2563eb"/>
            <path d="M10 18l6 6 10-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>TaskFlow</h1>
        </div>
        <button onClick={onLogout} style={{
          padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#d1d5db",
        }}>
          Déconnexion
        </button>
      </div>
      <p style={{ color: "#9ca3af", marginBottom: 24, fontSize: 13 }}>{email}</p>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          data-cy="task-input"
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Nouvelle tâche..."
          style={{
            flex: 1, padding: "10px 14px", border: "1px solid #d1d5db",
            borderRadius: 8, fontSize: 15, outline: "none",
          }}
        />
        <button
          data-cy="add-btn"
          type="submit"
          style={{
            padding: "10px 20px", background: "#2563eb", color: "#fff",
            border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
          }}
        >
          Ajouter
        </button>
      </form>

      {error && <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>}

      {tasks.length === 0 && (
        <p data-cy="empty-state" style={{ color: "#9ca3af", textAlign: "center", padding: "32px 0" }}>
          Aucune tâche pour l'instant.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tasks.map((task) => (
          <li key={task._id} data-cy="task-item" style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", marginBottom: 8,
            border: "1px solid #e5e7eb", borderRadius: 8,
            background: task.done ? "#f0fdf4" : "#fff",
          }}>
            <span style={{
              flex: 1, fontSize: 15,
              textDecoration: task.done ? "line-through" : "none",
              color: task.done ? "#6b7280" : "#111",
            }}>
              {task.title}
            </span>
            {!task.done && (
              <button data-cy="done-btn" onClick={() => markDone(task._id)} style={{
                padding: "4px 12px", background: "#16a34a", color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
              }}>
                ✓ Done
              </button>
            )}
            <button data-cy="delete-btn" onClick={() => deleteTask(task._id)} style={{
              padding: "4px 12px", background: "#dc2626", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
            }}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  function handleAuth(userEmail) {
    setToken(localStorage.getItem("token"));
    setEmail(userEmail);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken("");
    setEmail("");
  }

  if (!token) return <AuthForm onAuth={handleAuth} />;
  return <TaskManager email={email} onLogout={handleLogout} />;
}
