"use client";
import React, { useEffect, useState } from "react";
import fetchPayments from "../fetchPayments";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
}

interface MonthData {
  month: string;
  total: number;
}

interface PaymentsByMonthChartProps {
  filterStage?: string | null;
  onBarClick?: (month: string) => void;
  selectedMonth?: string | null;
}

export default function PaymentsByMonthChart({ filterStage, onBarClick, selectedMonth }: PaymentsByMonthChartProps) {
  const [data, setData] = useState<MonthData[]>([]);
  const [currency, setCurrency] = useState("MXN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments().then((payments: Payment[]) => {
      const monthly: Record<string, number> = {};
      let curr = "MXN";
      // Safety check for payments array
      if (!payments || !Array.isArray(payments)) {
        console.warn('Payments data is not an array:', payments);
        setLoading(false);
        return;
      }
      payments.forEach((p) => {
        const date = new Date(p.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthly[key] = (monthly[key] || 0) + Number(p.amount);
        if (!curr && p.currency) curr = p.currency;
      });
      const result = Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, total]) => ({ month, total }));
      setData(result);
      setCurrency(curr);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400">Cargando...</div>;
  if (!data.length) return <div className="text-gray-400">Sin datos</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => value.toLocaleString("es-MX", { style: "currency", currency })} />
        <Bar dataKey="total" fill="#1976d2" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
