import React, { useState } from "react";

const ResetPassword: React.FC = () => {
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("pending");
    setMessage("");
    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("¡Contraseña restablecida exitosamente! Ahora puedes iniciar sesión.");
      } else {
        setStatus("error");
        setMessage(data.error || "No se pudo restablecer la contraseña.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Intenta de nuevo más tarde.");
    }
    setSubmitting(false);
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.outerWrap}>
        <div style={styles.container}>
          <img src="/logo.svg" alt="Kustodia Logo" style={styles.logo} />
          <h1 style={styles.title}>Restablece tu contraseña</h1>
          {token ? (
            <form onSubmit={handleSubmit} style={{ display: status === "success" ? "none" : "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
              <input
                type="password"
                placeholder="Nueva contraseña"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.button} disabled={submitting}>
                {submitting ? "Restableciendo..." : "Restablecer"}
              </button>
            </form>
          ) : (
            <div style={styles.error}>Token de recuperación faltante.</div>
          )}
          {status === "success" && <div style={styles.success}>{message}</div>}
          {status === "error" && <div style={styles.error}>{message}</div>}
          {status === "success" && (
            <a href="/login" style={styles.button}>Ir a Iniciar Sesión</a>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageBg: {
    background: "linear-gradient(135deg, #0c1836 0%, #2e7ef7 100%)",
    color: "#fff",
    fontFamily: "Montserrat, Arial, sans-serif",
    minHeight: "100vh",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  outerWrap: {
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    padding: '24px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    boxShadow: "0 8px 32px 0 rgba(46,126,247,0.13)",
    padding: "2.5rem 1.25rem 2rem 1.25rem",
    maxWidth: 400,
    width: "100%",
    textAlign: "center" as const,
    margin: 0,
  },
  logo: {
    width: 72,
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "2rem",
    letterSpacing: 1,
    marginBottom: "1rem",
    color: "#2e7ef7",
    fontWeight: 700,
  },
  input: {
    padding: "0.75rem",
    borderRadius: 8,
    border: "none",
    fontSize: "1rem",
    fontFamily: "inherit",
    background: "#e3e9f7",
    color: "#0c1836",
  },
  success: {
    background: "#27ae60",
    color: "#fff",
    padding: "0.75rem",
    borderRadius: 8,
    marginBottom: "1rem",
    fontWeight: 600,
  },
  error: {
    background: "#c0392b",
    color: "#fff",
    padding: "0.75rem",
    borderRadius: 8,
    marginBottom: "1rem",
    fontWeight: 600,
  },
  button: {
    display: "inline-block",
    background: "#2e7ef7",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    marginTop: "1rem",
    transition: "background 0.2s",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

export default ResetPassword;
