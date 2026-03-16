import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './api';

const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    IS_LOGGED_IN: 'is_logged_in',
};

// Fallback storage for when AsyncStorage fails
let memoryStorage: { [key: string]: string } = {};

const safeAsyncStorage = {
    async setItem(key: string, value: string): Promise<void> {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.warn('AsyncStorage setItem failed, using memory storage:', error);
            memoryStorage[key] = value;
        }
    },

    async getItem(key: string): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.warn('AsyncStorage getItem failed, using memory storage:', error);
            return memoryStorage[key] || null;
        }
    },

    async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.warn('AsyncStorage removeItem failed, using memory storage:', error);
            delete memoryStorage[key];
        }
    }
};

export class StorageService {
    static async saveAuthData(token: string, user: User): Promise<void> {
        try {
            await safeAsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
            await safeAsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            await safeAsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
            console.log('✅ Auth data saved successfully');
        } catch (error) {
            console.error('Failed to save auth data:', error);
            throw error;
        }
    }

    static async getToken(): Promise<string | null> {
        try {
            return await safeAsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        } catch (error) {
            console.error('Failed to get token:', error);
            return null;
        }
    }

    static async getUser(): Promise<User | null> {
        try {
            const userData = await safeAsyncStorage.getItem(STORAGE_KEYS.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Failed to get user data:', error);
            return null;
        }
    }

    static async isLoggedIn(): Promise<boolean> {
        try {
            const isLoggedIn = await safeAsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
            const result = isLoggedIn === 'true';
            console.log('🔍 Checking login status:', { isLoggedIn, result });
            return result;
        } catch (error) {
            console.error('Failed to check login status:', error);
            return false;
        }
    }

    static async clearAuthData(): Promise<void> {
        try {
            await safeAsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
            await safeAsyncStorage.removeItem(STORAGE_KEYS.USER);
            await safeAsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
            console.log('✅ Auth data cleared successfully');
        } catch (error) {
            console.error('Failed to clear auth data:', error);
            throw error;
        }
    }

    static async clearAuth(): Promise<void> {
        return this.clearAuthData();
    }

    // Generic storage methods for cart and other data
    static async setItem(key: string, value: string): Promise<void> {
        try {
            await safeAsyncStorage.setItem(key, value);
        } catch (error) {
            console.error(`Failed to set item ${key}:`, error);
            throw error;
        }
    }

    static async getItem(key: string): Promise<string | null> {
        try {
            return await safeAsyncStorage.getItem(key);
        } catch (error) {
            console.error(`Failed to get item ${key}:`, error);
            return null;
        }
    }

    static async removeItem(key: string): Promise<void> {
        try {
            await safeAsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove item ${key}:`, error);
            throw error;
        }
    }

    static async initializeAuth(): Promise<{ token: string | null; user: User | null; isLoggedIn: boolean }> {
        try {
            console.log('🔄 Initializing auth...');
            const [token, user, isLoggedIn] = await Promise.all([
                this.getToken(),
                this.getUser(),
                this.isLoggedIn(),
            ]);

            console.log('🔍 Auth initialization result:', {
                hasToken: !!token,
                hasUser: !!user,
                isLoggedIn,
                userRole: user?.role
            });

            return { token, user, isLoggedIn };
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            return { token: null, user: null, isLoggedIn: false };
        }
    }
}