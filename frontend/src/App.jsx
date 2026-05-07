import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const res = await fetch(`${API}/api/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      Sentry.captureException(err);
      setError("Impossible de charger les tâches.");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    await fetch(`${API}/api/tasks/${id}/done`, { method: "PATCH" });
    await loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API}/api/tasks/${id}`, { method: "DELETE" });
    await loadTasks();
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>TaskFlow</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>Gestionnaire de tâches — React · Node.js · MongoDB</p>

      <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          data-cy="task-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
          <li
            key={task._id}
            data-cy="task-item"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", marginBottom: 8,
              border: "1px solid #e5e7eb", borderRadius: 8,
              background: task.done ? "#f0fdf4" : "#fff",
            }}
          >
            <span
              style={{
                flex: 1, fontSize: 15,
                textDecoration: task.done ? "line-through" : "none",
                color: task.done ? "#6b7280" : "#111",
              }}
            >
              {task.title}
            </span>
            {!task.done && (
              <button
                data-cy="done-btn"
                onClick={() => markDone(task._id)}
                style={{
                  padding: "4px 12px", background: "#16a34a", color: "#fff",
                  border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
                }}
              >
                ✓ Done
              </button>
            )}
            <button
              data-cy="delete-btn"
              onClick={() => deleteTask(task._id)}
              style={{
                padding: "4px 12px", background: "#dc2626", color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
