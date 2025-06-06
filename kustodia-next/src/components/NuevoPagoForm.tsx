"use client";
import React, { useState } from "react";

// Minimal utility for fetch with auth from localStorage
type FetchOptions = RequestInit & { headers?: Record<string, string> };
async function authFetch(input: RequestInfo, init: FetchOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { ...(init.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(input, { ...init, headers });
}

export default function NuevoPagoForm() {
  const [tab, setTab] = useState<"pago" | "cobro">("pago");
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex gap-2 mb-4 w-full max-w-2xl">
        <button
          className={`flex-1 px-4 py-2 rounded-lg font-semibold border transition-colors ${tab === "pago" ? "bg-blue-600 text-white" : "bg-white text-blue-700 border-blue-200"}`}
          onClick={() => setTab("pago")}
        >
          Pago
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded-lg font-semibold border transition-colors ${tab === "cobro" ? "bg-blue-600 text-white" : "bg-white text-blue-700 border-blue-200"}`}
          onClick={() => setTab("cobro")}
        >
          Cobro
        </button>
      </div>
      <div className="w-full max-w-2xl flex justify-center">
        <div className="w-full">
          {tab === "pago" ? <PagoFormFull /> : <CobroFormFull />}
        </div>
      </div>
    </div>
  );
}

import PagoFormFull from "./PagoFormFull";
import CobroFormFull from "./CobroFormFull";

// (legacy PagoForm and CobroForm removed)
// All form logic is now in PagoFormFull and CobroFormFull.
// No additional code is needed here.
