/**
 * BaseRepository - Abstract Repository Pattern interface for Option One Store.
 * Standardized data access layer supporting Supabase, PostgreSQL, or LocalStorage cache provider.
 */
export class BaseRepository {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  getLocalData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`[BaseRepository Error] Failed to read key ${this.storageKey}:`, e);
      return [];
    }
  }

  setLocalData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error(`[BaseRepository Error] Failed to write key ${this.storageKey}:`, e);
    }
  }
}
