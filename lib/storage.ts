// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  RESTAURANTS: 'app:restaurants_v1',
  ARCHIVED_RESTAURANTS: 'app:restaurants_archived_v1',
};

export const saveJson = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('saveJson error', e);
    throw e;
  }
};

export const loadJson = async (key: string) => {
  try {
    const s = await AsyncStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.error('loadJson error', e);
    throw e;
  }
};
