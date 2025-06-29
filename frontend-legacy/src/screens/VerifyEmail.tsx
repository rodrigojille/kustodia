import React, { useEffect, useState } from "react";

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("Procesando verificación...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación faltante.");
      return;
    }
    fetch("/api/users/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("¡Tu correo ha sido verificado exitosamente! Ahora puedes iniciar sesión en Kustodia.");
        } else {
          setStatus("error");
          setMessage(data.error || "El enlace no es válido o ya fue usado.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión. Intenta de nuevo más tarde.");
      });
  }, []);

  return (
    <div style={styles.pageBg}>
      <div style={styles.container}>
        <img src="/logo.svg" alt="Kustodia Logo" style={styles.logo} />
        <h1 style={styles.title}>Correo verificado</h1>
        {status === "success" && <div style={styles.success}>¡Tu correo ha sido verificado exitosamente!</div>}
        {status === "error" && <div style={styles.error}>No se pudo verificar el correo.</div>}
        <p>{message}</p>
        {status === "success" && (
          <a href="/login" style={styles.button}>Ir a Iniciar Sesión</a>
        )}
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    boxShadow: "0 8px 32px 0 rgba(46,126,247,0.2)",
    padding: "2.5rem 2rem 2rem 2rem",
    maxWidth: 400,
    width: "100%",
    textAlign: "center" as const,
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
  },
};

export default VerifyEmail;
