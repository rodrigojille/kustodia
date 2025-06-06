"use client";
import React from "react";

const apiDocsContent = `# API Docs

Bienvenido a la documentación técnica de Kustodia. Aquí encontrarás información clave para integrar y utilizar la plataforma desde el frontend y backend.

## Integración Backend API (Proxy Automático)
- Todas las solicitudes \`/api/*\` realizadas desde el frontend Next.js se redirigen automáticamente al backend (puerto 4000) durante el desarrollo.
- Esto se gestiona con una regla de reescritura en \`next.config.js\`, por lo que no necesitas modificar las URLs de tus fetch.
- Ejemplo:
  - \`fetch('/api/users/verify-recipient')\` irá directo al backend.

## Buenas Prácticas de UI
- Usa \`text-black\` para todos los textos principales y secundarios para máxima legibilidad.
- Utiliza clases de Tailwind para tamaño y peso de fuente.
- Tipografía recomendada: Inter o Geist.

## Cómo Mantener o Extender
- Para nuevos endpoints backend, simplemente usa \`/api/tu-endpoint\` desde el frontend.
- Para mejorar la tipografía, puedes agregar la fuente Inter vía Google Fonts y actualizar tu configuración de Tailwind.
- Siempre utiliza clases de Tailwind para tipografía y espaciados.

---

**Próximamente:** Se publicará aquí la referencia completa de endpoints, ejemplos de requests/responses y guías de integración.
`;




export default function ApiDocsPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-start py-12 px-2">
      <a href="/" className="mb-2 flex justify-center">
        <img src="/kustodia-logo.png" alt="Kustodia Logo" className="h-16 w-16 rounded-full shadow-lg hover:scale-105 transition" />
      </a>
      <h1 className="text-4xl font-bold mb-6 text-blue-700">API Docs</h1>
      <div className="bg-white rounded-xl shadow p-6 text-gray-900 prose max-w-2xl w-full">
        <pre style={{whiteSpace: "pre-wrap", fontFamily: 'inherit', background: 'none', border: 'none', margin: 0, padding: 0}}>{apiDocsContent}</pre>
      </div>
    </div>
  );
}
