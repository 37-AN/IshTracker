import React from 'react';
import { HealthCard } from '@/components/dashboard/HealthCard';
import { SystemAnalytics } from '@/components/dashboard/SystemAnalytics';
import { AutonomousLogicTrace } from '@/components/dashboard/AutonomousLogicTrace';
import { HardwareHeatmap } from '@/components/dashboard/HardwareHeatmap';
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Network } from 'lucide-react';
import { useAutonomousStore } from '@/store/useAutonomousStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AutonomousDashboard() {
  const { health } = useAutonomousStore();

  const mesSparklineData = [
    { time: '09:00', value: 80 }, { time: '09:30', value: 85 }, { time: '10:00', value: 82 },
    { time: '10:30', value: 78 }, { time: '11:00', value: 88 }, { time: '11:30', value: 90 },
    { time: '12:00', value: 85 }, { time: '12:30', value: 79 }, { time: '13:00', value: 87 },
  ];

  const sqlSparklineData = [
    { time: '09:00', value: 95 }, { time: '09:30', value: 92 }, { time: '10:00', value: 94 },
    { time: '10:30', value: 90 }, { time: '11:00', value: 96 }, { time: '11:30', value: 93 },
    { time: '12:00', value: 95 }, { time: '12:30', value: 91 }, { time: '13:00', value: 97 },
  ];

  const networkSparklineData = [
    { time: '09:00', value: 70 }, { time: '09:30', value: 65 }, { time: '10:00', value: 40 },
    { time: '10:30', value: 50 }, { time: '11:00', value: 30 }, { time: '11:30', value: 45 },
    { time: '12:00', value: 55 }, { time: '12:30', value: 60 }, { time: '13:00', value: 42 },
  ];


  return (
    <div className="p-6 space-y-6 bg-slate-900 text-white min-h-screen">
      {/* Header: System Health Summary */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">System Sovereignty</h1>
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-green-100 text-green-800">Coded AI: Active</Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">Mode: Autonomous</Badge>
        </div>
      </div>

      {/* Manual Overrides */}
      <Card className="bg-slate-800 text-white border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-sm">Manual Overrides</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="mes-override" />
            <Label htmlFor="mes-override">Override MES Autonomy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="sql-override" />
            <Label htmlFor="sql-override">Override SQL Autonomy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="network-override" />
            <Label htmlFor="network-override">Override Network Autonomy</Label>
          </div>
        </CardContent>
      </Card>

      {/* Top Row: HealthCard components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthCard 
          title="MES (TrakSYS)" 
          icon={<Activity className="w-5 h-5 text-blue-400" />} 
          score={health.mes.score} 
          rate={`${health.mes.rate.toFixed(1)} events/m`}
          status={health.mes.status.charAt(0).toUpperCase() + health.mes.status.slice(1) as any} // Capitalize first letter
          data={mesSparklineData}
        />
        <HealthCard 
          title="SQL Database" 
          icon={<Database className="w-5 h-5 text-green-400" />} 
          score={health.sql.score} 
          rate={`${health.sql.rate.toFixed(1)} events/m`}
          status={health.sql.status.charAt(0).toUpperCase() + health.sql.status.slice(1) as any}
          data={sqlSparklineData}
        />
        <HealthCard 
          title="Network (APs)" 
          icon={<Network className="w-5 h-5 text-red-400" />} 
          score={health.network.score} 
          rate={`${health.network.rate.toFixed(1)} events/m`}
          status={health.network.status.charAt(0).toUpperCase() + health.network.status.slice(1) as any}
          data={networkSparklineData}
        />
      </div>

      {/* Center Row: SystemAnalytics and AutonomousLogicTrace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemAnalytics />
        </div>
        <div>
          <AutonomousLogicTrace />
        </div>
      </div>

      {/* Bottom Row: HardwareHeatmap */}
      <div>
        <HardwareHeatmap />
      </div>
    </div>
  );
}
