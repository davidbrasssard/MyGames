import { useState } from 'react';
import { testDeviceNow, useQuality, type DeviceReport } from '../kit/quality';

// DEVELOPMENT ONLY: shows the current device quality tier. Change it with ?quality=lite or ?quality=full in the URL.
export function QualityBadge() {
  const { tier, source } = useQuality();
  return (
    <p className="dev-note" data-testid="quality-badge">
      Quality: <strong>{tier}</strong> ({source})
    </p>
  );
}

// DEVELOPMENT ONLY: big button that measures this device now and shows the numbers.
export function DeviceTest() {
  const [state, setState] = useState<'idle' | 'running' | 'failed' | DeviceReport>('idle');
  const run = () => {
    setState('running');
    void testDeviceNow().then((report) => setState(report ?? 'failed'));
  };
  const big = { fontSize: '2rem', margin: '0.4rem 0', fontWeight: 700 } as const;
  return (
    <div>
      <button type="button" className="dev-cel-button" style={{ fontSize: '2rem', padding: '1rem 2rem', minHeight: '5rem' }} disabled={state === 'running'} onClick={run}>
        {state === 'running' ? 'Testing…' : 'Test this device'}
      </button>
      {state === 'failed' && <p style={big}>Test interrupted (tab hidden). Try again.</p>}
      {typeof state === 'object' && (
        <div data-testid="device-report">
          <p style={big}>Tier: {state.tier === 'lite' ? 'Lite' : 'Full'}</p>
          <p style={big}>Median frame: {state.medianMs.toFixed(1)} ms</p>
          <p style={big}>Long frames (&gt; 40 ms): {(state.longShare * 100).toFixed(0)} %</p>
          <p style={big}>deviceMemory: {state.deviceMemory ?? 'n/a'}</p>
          <p style={big}>hardwareConcurrency: {state.hardwareConcurrency ?? 'n/a'}</p>
        </div>
      )}
    </div>
  );
}
