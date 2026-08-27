import { writable } from 'svelte/store';
import { putData, getData } from '../utils/indexedDB';

export type Settings = {
  id: 'user_settings';
  provider: 'gemini' | 'openai';
  apiKey: string;
};

const defaultSettings: Settings = {
  id: 'user_settings',
  provider: 'gemini',
  apiKey: '',
};

export const settings = writable<Settings>(defaultSettings);

export async function initSettings() {
  const loaded = await getData('settings', 'user_settings');
  if (loaded) {
    settings.set(loaded);
  } else {
    await putData('settings', defaultSettings);
  }
}

export async function saveSettings(newSettings: Omit<Settings, 'id'>) {
  const s: Settings = { id: 'user_settings', ...newSettings };
  settings.set(s);
  await putData('settings', s);
}
