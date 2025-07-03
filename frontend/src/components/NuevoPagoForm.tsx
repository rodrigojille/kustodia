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
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl flex justify-center">
        <div className="w-full">
          <PagoFormFull />
        </div>
      </div>
    </div>
  );
}

import PagoFormFull from "./PagoFormFull"; // Bridge wallet escrow 2

// (legacy PagoForm and CobroForm removed)
// All form logic is now in PagoFormFull and CobroFormFull.
// No additional code is needed here.
