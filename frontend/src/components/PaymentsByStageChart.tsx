"use client";
import React, { useEffect, useState } from "react";
import { authFetch } from '../utils/authFetch';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PAYMENT_STATUSES, getStatusConfig, getStatusSpanish } from '../config/paymentStatuses';

interface Payment {
  id: string;
  status: string;
  amount: number;
  currency: string;
}

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
    authFetch('payments')
      .then(res => res.json())
      .then(data => {
        const payments = Array.isArray(data) ? data : (data.payments || []);
        const stageTotals: Record<string, number> = {};
        let curr = "MXN";
        // Safety check for payments array
        if (!payments || !Array.isArray(payments)) {
          console.warn('Payments data is not an array:', payments);
          setLoading(false);
          return;
        }
        payments.forEach((p: any) => {
          // Handle both string and number amounts
          const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount;
          stageTotals[p.status] = (stageTotals[p.status] || 0) + (isNaN(amount) ? 0 : amount);
          if (!curr && p.currency) curr = p.currency;
        });
        const result = Object.entries(stageTotals).map(([status, total]) => ({
          name: getStatusSpanish(status),
          value: total,
          status,
        }));
        setData(result);
        setCurrency(curr);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching payments for stage chart:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-400">Cargando...</div>;
  if (!data.length) return <div className="text-gray-400">Sin datos</div>;

  // Ensure all statuses are always present in the chart (even with value 0)
  const allStatuses = Object.keys(PAYMENT_STATUSES);
  const completeData = allStatuses.map(status => {
    const found = data.find(d => d.status === status);
    return found || { name: getStatusSpanish(status), value: 0, status };
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
            <Cell key={`cell-${idx}`} fill={getStatusConfig(entry.status).color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => {
            // value: slice value, props: { payload, ... }
            const total = completeData.reduce((sum, d) => sum + d.value, 0);
            const percent = total > 0 ? (value / total) * 100 : 0;
            return [
              `${value.toLocaleString("es-MX", { style: "currency", currency })}  (${percent.toFixed(1)}%)`,
              getStatusSpanish(props.payload.status)
            ];
          }}
        />

      </PieChart>
    </ResponsiveContainer>
  </div>
      {/* Vertical legend for mobile/desktop */}
      <div className="flex flex-col gap-2 pl-2 min-w-[90px]">
        {Object.entries(PAYMENT_STATUSES).map(([status, config]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="block w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></span>
            <span className="text-xs text-gray-800">{config.spanish}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
