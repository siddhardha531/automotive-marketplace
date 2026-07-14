import React, { useState, useEffect } from 'react';
import { 
  Server, Database, ShieldCheck, Activity, Cloud, Cpu, HardDrive, 
  Lock, RefreshCw, Terminal, CheckCircle, ArrowRight, AlertTriangle, HelpCircle
} from 'lucide-react';
import { AWSMetrics } from '../types';

interface AWSConsoleProps {
  metrics: AWSMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<AWSMetrics>>;
  logs: string[];
  addLog: (msg: string) => void;
}

export default function AWSArchitectureConsole({ metrics, setMetrics, logs, addLog }: AWSConsoleProps) {
  const [loadSimulated, setLoadSimulated] = useState(false);
  const [backupRunning, setBackupRunning] = useState(false);

  // Auto-scaling simulation
  useEffect(() => {
    let interval: any;
    if (loadSimulated) {
      interval = setInterval(() => {
        setMetrics(prev => {
          const newCpu = Math.min(95, prev.cpuUtilization + Math.floor(Math.random() * 10) + 5);
          let newInstances = prev.activeEc2Instances;
          
          if (newCpu > 75 && prev.activeEc2Instances < 4) {
            newInstances += 1;
            addLog(`[Auto Scaling] Triggered scale-out. Launching instance EC2_NODE_0${newInstances}...`);
          }
          
          return {
            ...prev,
            cpuUtilization: newCpu,
            activeEc2Instances: newInstances,
            rdsConnections: prev.rdsConnections + Math.floor(Math.random() * 5) + 2
          };
        });
      }, 3000);
    } else {
      interval = setInterval(() => {
        setMetrics(prev => {
          const newCpu = Math.max(12, prev.cpuUtilization - Math.floor(Math.random() * 8) - 3);
          let newInstances = prev.activeEc2Instances;
          
          if (newCpu < 40 && prev.activeEc2Instances > 1) {
            addLog(`[Auto Scaling] Cooldown triggered. Terminating idle instance EC2_NODE_0${newInstances}...`);
            newInstances -= 1;
          }
          
          return {
            ...prev,
            cpuUtilization: newCpu,
            activeEc2Instances: newInstances,
            rdsConnections: Math.max(5, prev.rdsConnections - Math.floor(Math.random() * 4))
          };
        });
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [loadSimulated, setMetrics, addLog]);

  const handleSimulateLoad = () => {
    setLoadSimulated(!loadSimulated);
    addLog(
      loadSimulated 
        ? '[Simulation] High load stopped. Restoring normal operations.' 
        : '[Simulation] Generating high user traffic. Stimulating EC2 cluster load...'
    );
  };

  const handleBackupNow = () => {
    if (backupRunning) return;
    setBackupRunning(true);
    setMetrics(prev => ({ ...prev, backupStatus: 'Running' }));
    addLog('[AWS Backup] Initiating hot backup of Amazon RDS & S3 Bucket...');
    
    setTimeout(() => {
      setBackupRunning(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMetrics(prev => ({
        ...prev,
        backupStatus: 'Completed',
        lastBackupTime: `Today at ${timeStr}`
      }));
      addLog(`[AWS Backup] Backup completed successfully. Vault recovery point registered: backup-snap-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`);
    }, 4000);
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="aws-console-root">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-500 text-[10px] text-white font-mono rounded font-semibold tracking-wide">AWS PARTNER DEPLOYMENT</span>
            <span className="text-xs text-gray-400 font-mono">Region: us-east-1</span>
          </div>
          <h1 className="text-3xl font-sans font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Cloud className="h-8 w-8 text-[#FF9900]" />
            AWS Cloud Infrastructure Console
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Interactive real-time monitoring of the e-commerce deployment. Designed for AWS scalability, performance & security.
          </p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0 font-mono text-xs">
          <button 
            onClick={handleSimulateLoad}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all cursor-pointer ${
              loadSimulated 
                ? 'bg-red-50 text-red-700 border-red-200 shadow-sm animate-pulse' 
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Activity className="h-4 w-4" />
            {loadSimulated ? 'Stop High Load Sim' : 'Simulate Traffic Spike (Load)'}
          </button>
          
          <button 
            onClick={handleBackupNow}
            disabled={backupRunning}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${backupRunning ? 'animate-spin' : ''}`} />
            AWS Backup Now
          </button>
        </div>
      </div>

      {/* Grid of live hardware statuses */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Cpu className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">EC2 Cluster</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">CPU Utilization</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-gray-900">{metrics.cpuUtilization}%</span>
              <span className="text-xs text-gray-400 font-mono">({metrics.activeEc2Instances} nodes active)</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-1000 ${
                  metrics.cpuUtilization > 75 ? 'bg-red-500' : metrics.cpuUtilization > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${metrics.cpuUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Amazon RDS</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active PostgreSQL Conns</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-gray-900">{metrics.rdsConnections}</span>
              <span className="text-xs text-emerald-600 font-mono font-medium">● Healthy</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-2">Multi-AZ Standby Sync active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <HardDrive className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Amazon S3</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Media Storage</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-gray-900">{formatBytes(metrics.s3StorageBytes)}</span>
              <span className="text-xs text-gray-400 font-mono">({Math.ceil(metrics.s3StorageBytes / 400000)} files)</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-2">AES-256 S3 Managed Encryption</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-teal-50 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
            </div>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">AWS Backup / IAM</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Backup Snapshots</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-sm font-bold px-2 py-0.5 rounded font-mono ${
                metrics.backupStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                metrics.backupStatus === 'Running' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>{metrics.backupStatus}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-2">Last Snap: {metrics.lastBackupTime}</p>
          </div>
        </div>
      </div>

      {/* Visual Live Interactive Architecture Map */}
      <div className="bg-slate-900 text-slate-100 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl mb-8">
        <h2 className="text-lg font-bold font-mono text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Server className="h-5 w-5 text-amber-500" />
          Interactive Deployment Topology Map (AWS Multi-Availability Zone)
        </h2>
        
        {/* Topology Map */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative items-center">
          
          {/* Node 1: Client Browser Route 53 */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30 text-indigo-400 mb-3">
              <Cloud className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold font-mono text-indigo-300">AWS Route 53 & Shield</h4>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">DDoS Guard {metrics.ddosPrevention === 'Active' ? '■ ON' : '■ OFF'}</p>
            <div className="w-full mt-3 pt-2 border-t border-slate-700/50">
              <span className="text-[9px] bg-indigo-900/40 text-indigo-200 px-1.5 py-0.5 rounded font-mono">Static Assets / DNS</span>
            </div>
          </div>

          <div className="hidden lg:flex justify-center text-amber-500">
            <ArrowRight className="h-5 w-5" />
          </div>

          {/* Node 2: Load Balancer / Application Tier */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center col-span-1 lg:col-span-1">
            <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 text-amber-400 mb-3">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold font-mono text-amber-300">Application Layer (EC2)</h4>
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {Array.from({ length: metrics.activeEc2Instances }).map((_, i) => (
                <span key={i} className="text-[9px] bg-amber-900/40 text-amber-200 px-1.5 py-0.5 rounded font-mono border border-amber-500/20 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block"></span>
                  node-0{i+1}
                </span>
              ))}
            </div>
            <div className="w-full mt-3 pt-2 border-t border-slate-700/50">
              <span className="text-[9px] bg-amber-900/40 text-amber-200 px-1.5 py-0.5 rounded font-mono">Auto Scaling Active</span>
            </div>
          </div>

          <div className="hidden lg:flex justify-center text-amber-500">
            <ArrowRight className="h-5 w-5" />
          </div>

          {/* Node 3: RDS & S3 database storage */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400 mb-3">
              <Database className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold font-mono text-blue-300">Data Tier (RDS + S3)</h4>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">PostgreSQL Multi-AZ</p>
            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">S3 Size: {formatBytes(metrics.s3StorageBytes)}</p>
            <div className="w-full mt-3 pt-2 border-t border-slate-700/50 flex justify-center gap-1">
              <span className="text-[9px] bg-blue-900/40 text-blue-200 px-1.5 py-0.5 rounded font-mono">Encrypted</span>
              <span className="text-[9px] bg-purple-900/40 text-purple-200 px-1.5 py-0.5 rounded font-mono">Backup Ready</span>
            </div>
          </div>

        </div>

        {/* AWS Best Practice Compliance Badges */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Lock className="h-4 w-4 text-[#FF9900]" />
            <span>AWS IAM: Strict Lease Admin</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-[#FF9900]" />
            <span>GDPR Compliance: S3 Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle className="h-4 w-4 text-[#FF9900]" />
            <span>Auto Scaling: Min 1, Max 4</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="h-4 w-4 text-[#FF9900]" />
            <span>Daily AWS Backup Target</span>
          </div>
        </div>
      </div>

      {/* CloudWatch Terminal Output Logs */}
      <div className="bg-slate-950 text-emerald-400 p-6 rounded-2xl border border-slate-800 shadow-inner font-mono text-xs">
        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2 text-slate-400">
          <span className="flex items-center gap-2 font-bold text-slate-300">
            <Terminal className="h-4 w-4 text-amber-500" />
            Live CloudWatch Metrics Logs System
          </span>
          <span className="text-[10px] bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded font-semibold animate-pulse">● LIVE STREAMING</span>
        </div>
        <div className="h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.slice().reverse().map((log, i) => (
            <div key={i} className="flex items-start gap-2 hover:bg-slate-900 p-0.5 rounded">
              <span className="text-slate-500 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className={
                log.includes('[Auto Scaling]') ? 'text-amber-300' :
                log.includes('[AWS Backup]') ? 'text-blue-300' :
                log.includes('[Error]') || log.includes('[Policy Violations]') ? 'text-red-400' :
                log.includes('[Escrow]') || log.includes('[Payment]') ? 'text-emerald-300' :
                'text-slate-300'
              }>
                {log}
              </span>
            </div>
          ))}
          <div className="text-slate-500 text-[10px] italic mt-2">--- End of Live Log buffer ---</div>
        </div>
      </div>
    </div>
  );
}
