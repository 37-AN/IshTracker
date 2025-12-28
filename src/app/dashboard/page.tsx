// src/app/dashboard/page.tsx

import { HeuristicEngine } from '@/lib/engine/HeuristicEngine';
import { HealthGauges } from '@/components/dashboard/HealthGauges';
import { LogicTrace } from '@/components/dashboard/LogicTrace';
import { ManualOverrides } from '@/components/dashboard/ManualOverrides';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Heuristic Engine Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Gauges */}
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <HealthGauges />
        </div>

        {/* Logic Trace */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-4">Logic Trace</h2>
          <LogicTrace />
        </div>
      </div>

      {/* Manual Overrides */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Manual Overrides</h2>
        <ManualOverrides />
      </div>
    </div>
  );
}
