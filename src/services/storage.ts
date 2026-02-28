import AsyncStorage from '@react-native-async-storage/async-storage'

export class StorageService {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key)
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }
}

export const storageService = new StorageService()
