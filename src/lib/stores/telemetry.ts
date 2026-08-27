import { writable } from 'svelte/store';
import { putData, getData } from '../utils/indexedDB';

export type TelemetryData = {
  id: 'user_telemetry';
  totalTokens: number;
  requests: number;
};

const defaultTelemetry: TelemetryData = {
  id: 'user_telemetry',
  totalTokens: 0,
  requests: 0,
};

export const telemetry = writable<TelemetryData>(defaultTelemetry);

export async function initTelemetry() {
  const loaded = await getData('telemetry', 'user_telemetry');
  if (loaded) {
    telemetry.set(loaded);
  } else {
    await putData('telemetry', defaultTelemetry);
  }
}

export async function logTelemetry(tokensUsed: number) {
  telemetry.update(current => {
    const updated = {
      ...current,
      totalTokens: current.totalTokens + tokensUsed,
      requests: current.requests + 1
    };
    putData('telemetry', updated).catch(console.error);
    return updated;
  });
}
