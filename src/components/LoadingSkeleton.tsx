import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Current Weather Card Skeleton */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-slate-800 rounded" />
              <div className="w-24 h-3 bg-slate-800/60 rounded" />
            </div>
          </div>
          <div className="w-28 h-6 bg-slate-800 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-800" />
            <div className="space-y-3">
              <div className="w-36 h-12 bg-slate-800 rounded-xl" />
              <div className="w-48 h-5 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <div className="h-20 rounded-2xl bg-slate-800/60" />
            <div className="h-20 rounded-2xl bg-slate-800/60" />
            <div className="h-20 rounded-2xl bg-slate-800/60" />
            <div className="h-20 rounded-2xl bg-slate-800/60" />
          </div>
        </div>
      </div>

      {/* Recommendations Skeleton */}
      <div className="space-y-4">
        <div className="w-56 h-6 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-36 rounded-2xl bg-slate-900/60 border border-slate-800" />
          <div className="h-36 rounded-2xl bg-slate-900/60 border border-slate-800" />
          <div className="h-36 rounded-2xl bg-slate-900/60 border border-slate-800" />
        </div>
      </div>

      {/* Forecast Section Skeleton */}
      <div className="space-y-4">
        <div className="w-48 h-6 bg-slate-800 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
