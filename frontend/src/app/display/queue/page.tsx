'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

/**
 * Token Display Screen (TV mode) — spec §7.4
 * Full-screen view for waiting room TV. No sidebar/header.
 * - Large "Now Serving" with current token number
 * - Next 5 tokens in queue
 * - Current time and date
 * - Auto-refreshes every 10 seconds
 * - Subtle animated gradient background
 */
export default function TokenDisplayPage() {
  const [now, setNow] = useState(new Date());

  const { data } = useQuery({
    queryKey: ['display-queue'],
    queryFn: () => apiFetch('/appointments/today-queue'),
    refetchInterval: 10_000,
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const queue = (data as any)?.data || (data as any) || {};
  const nowServing = [
    ...(queue.in_progress || []),
    ...(queue.checked_in || []),
  ];
  const upcoming = [...(queue.scheduled || [])].slice(0, 5);
  const completed = [...(queue.completed || [])];

  const currentToken = nowServing[0];
  const nextTokens = (nowServing.slice(1)).concat(upcoming).slice(0, 5);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">MediCare Hospital</h1>
            <p className="text-sm text-text-muted">মেডিকেয়ার হাসপাতাল</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-text-primary tabular-nums">{timeStr}</p>
          <p className="text-sm text-text-muted">{dateStr}</p>
        </div>
      </div>

      {/* Now Serving */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center w-full max-w-4xl">
          <p className="text-2xl font-medium text-text-muted mb-4">
            Now Serving / এখন ডাক দেওয়া হচ্ছে
          </p>
          {currentToken ? (
            <div className="bg-white rounded-3xl shadow-xl border border-primary-200 p-12 mb-8">
              <p className="text-8xl font-bold text-primary-600 tracking-tight">
                {currentToken.appointmentNo?.replace('APT-', '').replace('20260723-', '') || '---'}
              </p>
              <p className="text-3xl font-medium text-text-primary mt-4">
                {currentToken.patient?.fullName}
              </p>
              <p className="text-lg text-text-muted mt-2">
                Dr. {currentToken.doctor?.fullName} · {currentToken.doctor?.specialization}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-border p-12 mb-8">
              <p className="text-8xl font-bold text-text-muted tracking-tight">---</p>
              <p className="text-2xl text-text-muted mt-4">No patients in queue</p>
            </div>
          )}

          {/* Next Tokens */}
          {nextTokens.length > 0 && (
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-border p-6">
              <p className="text-xl font-semibold text-text-secondary mb-4">
                Next in Queue / পরবর্তী
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {nextTokens.map((token: any, i: number) => (
                  <div key={token.id} className="bg-white rounded-xl border border-border px-6 py-3 shadow-sm">
                    <p className="text-3xl font-bold text-text-primary">
                      {token.appointmentNo?.replace('APT-', '').replace('20260723-', '') || `#${i + 1}`}
                    </p>
                    <p className="text-sm text-text-muted">{token.patient?.fullName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-primary-100">
        <p className="text-sm text-text-muted">
          Total today: {queue.total || 0} · Completed: {completed.length}
        </p>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
          Live · Auto-refreshing every 10s
        </div>
      </div>
    </div>
  );
}
