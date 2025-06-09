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

const STATUS_COLORS: Record<string, string> = {
  requested: "#43a047",     // Green
  pending: "#ffb300",      // Yellow
  funded: "#1976d2",       // Blue
  in_dispute: "#e53935",   // Red
  paid: "#1976d2",         // Blue
  cancelled: "#757575",    // Gray
  refunded: "#7e57c2",     // Purple
};
const STATUS_LABELS: Record<string, string> = {
  requested: "Solicitado",
  pending: "Pendiente",
  funded: "Fondeado",
  in_dispute: "En disputa",
  paid: "Pagado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
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
        status,
      }));
      setData(result);
      setCurrency(curr);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400">Cargando...</div>;
  if (!data.length) return <div className="text-gray-400">Sin datos</div>;

  // Ensure all statuses are always present in the chart (even with value 0)
  const allStatuses = Object.keys(STATUS_LABELS);
  const completeData = allStatuses.map(status => {
    const found = data.find(d => d.status === status);
    return found || { name: STATUS_LABELS[status], value: 0, status };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center w-full h-full gap-4" style={{minHeight: 220}}>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width={220} height={220} minWidth={180} minHeight={180}>
          <PieChart width={220} height={220}>
        <Pie
          data={completeData}
          cx="50%"
          cy="50%"
          labelLine={false}
          // No label prop: labels are removed, only tooltip remains
          dataKey="value"
          nameKey="status"
          outerRadius={window.innerWidth < 640 ? 50 : 90}
          fill="#8884d8"
          paddingAngle={3}
        >
          {completeData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status] || '#888'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => {
            // value: slice value, props: { payload, ... }
            const total = completeData.reduce((sum, d) => sum + d.value, 0);
            const percent = total > 0 ? (value / total) * 100 : 0;
            return [
              `${value.toLocaleString("es-MX", { style: "currency", currency })}  (${percent.toFixed(1)}%)`,
              STATUS_LABELS[props.payload.status] || name
            ];
          }}
        />

      </PieChart>
    </ResponsiveContainer>
  </div>
      {/* Vertical legend for mobile/desktop */}
      <div className="flex flex-col gap-2 pl-2 min-w-[90px]">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="block w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] || '#888' }}></span>
            <span className="text-xs text-gray-800">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
