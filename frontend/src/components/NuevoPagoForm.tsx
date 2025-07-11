"use client";
import React, { useState } from "react";

// Import centralized authFetch utility
import { authFetch } from '../utils/authFetch';

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
