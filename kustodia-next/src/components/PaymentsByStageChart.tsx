"use client";
import React, { useEffect, useState } from "react";
import { fetchPayments } from "../fetchPayments";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Payment {
  id: string;
  status: string;
  amount: number;
  currency: string;
}

const COLORS = ["#1976d2", "#ffb300", "#e53935", "#43a047"];
const STATUS_LABELS: Record<string, string> = {
  requested: "Solicitado",
  pending: "Pendiente",
  funded: "En disputa",
  paid: "Pagado",
};

interface PaymentsByStageChartProps {
  filterMonth?: string | null;
  onSliceClick?: (stage: string) => void;
  selectedStage?: string | null;
}

export default function PaymentsByStageChart({ filterMonth, onSliceClick, selectedStage }: PaymentsByStageChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [currency, setCurrency] = useState("MXN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments().then((payments: Payment[]) => {
      const stageTotals: Record<string, number> = {};
      let curr = "MXN";
      payments.forEach((p) => {
        stageTotals[p.status] = (stageTotals[p.status] || 0) + Number(p.amount);
        if (!curr && p.currency) curr = p.currency;
      });
      const result = Object.entries(stageTotals).map(([status, total]) => ({
        name: STATUS_LABELS[status] || status,
        value: total,
      }));
      setData(result);
      setCurrency(curr);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400">Cargando...</div>;
  if (!data.length) return <div className="text-gray-400">Sin datos</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={70}
          fill="#1976d2"
          label
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value.toLocaleString("es-MX", { style: "currency", currency })} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
