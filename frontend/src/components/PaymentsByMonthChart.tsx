"use client";
import React, { useEffect, useState } from "react";
import { authFetch } from '../utils/authFetch';
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
  id: number;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  payment_type?: string;
}

interface MonthData {
  month: string;
  total: number;
}

interface PaymentsByMonthChartProps {
  filterStage?: string | null;
  onBarClick?: (month: string) => void;
  selectedMonth?: string | null;
  paymentsData?: Payment[];
}

export default function PaymentsByMonthChart({ filterStage, onBarClick, selectedMonth, paymentsData = [] }: PaymentsByMonthChartProps) {
  const [data, setData] = useState<MonthData[]>([]);
  const [currency, setCurrency] = useState("MXN");

  useEffect(() => {
    const monthly: Record<string, number> = {};
    let curr = "MXN";
    
    // Process the paymentsData passed as props
    paymentsData.forEach((p: any) => {
      // Apply stage filter if provided
      if (filterStage && p.status !== filterStage) return;
      
      const date = new Date(p.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      // Handle both string and number amounts
      const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount;
      monthly[key] = (monthly[key] || 0) + (isNaN(amount) ? 0 : amount);
      if (p.currency) curr = p.currency;
    });
    
    const result = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total }));
    
    setData(result);
    setCurrency(curr);
  }, [paymentsData, filterStage]);

  if (!data.length) return <div className="text-gray-400">Sin datos para este período</div>;

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
