import React from 'react';
import { BrainCircuit } from 'lucide-react';
import Aurora from '../Aurora/Aurora';

export default function ServerWakeup() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Aurora
          colorStops={["#37AA9C", "#B497CF", "#06B6D4"]}
          blend={0.5}
          amplitude={1.2}
          speed={0.8}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', zIndex: 1 }}></div>
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center', padding: '2rem', maxWidth: '400px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(55, 170, 156, 0.3)', filter: 'blur(20px)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
          <BrainCircuit size={64} color="#37AA9C" style={{ position: 'relative', zIndex: 1, animation: 'pulse 2s infinite' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Waking up server</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Our backend is spinning back up after inactivity. This usually takes about 30 seconds.
          </p>
        </div>
        
        <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: '30%', backgroundColor: '#37AA9C', height: '100%', borderRadius: '2px', animation: 'progress 2s infinite ease-in-out' }}></div>
        </div>

        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.1); }
            }
            @keyframes progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
