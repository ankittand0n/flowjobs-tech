/// <reference types="chrome"/>

export const storage = {
  get: async (keys: string[]) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },

  set: async (items: { [key: string]: any }) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve(true);
      });
    });
  },

  remove: async (keys: string[]) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve(true);
      });
    });
  }
}; 