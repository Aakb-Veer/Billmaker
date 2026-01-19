'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MonthlyStat {
    name: string;
    total: number;
    count: number;
    sortKey?: number;
}

interface AdminDashboardProps {
    totalCollection: number;
    monthlyStats: MonthlyStat[];
}

export default function AdminDashboard({ totalCollection, monthlyStats }: AdminDashboardProps) {
    return (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Collection Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col justify-center bg-gradient-to-br from-white to-orange-50/50">
                <h3 className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Total Collection (Till Now)</h3>
                <p className="text-4xl font-bold text-orange-600 font-mono tracking-tight">
                    ₹{totalCollection.toLocaleString('en-IN')}
                </p>
            </div>

            {/* Monthly Graph - Spans 2 cols */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 h-[320px]">
                <h3 className="text-gray-700 font-bold mb-6 flex items-center gap-2">
                    <span>📊</span> Monthly Collection
                </h3>
                <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyStats} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(value) => `₹${value / 1000}k`}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#fff7ed' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Collection']}
                            />
                            <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} barSize={40}>
                                {monthlyStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === monthlyStats.length - 1 ? '#ea580c' : '#fb923c'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
