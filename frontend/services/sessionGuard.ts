import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StorageService } from './storage';
import { User, apiService } from './api';

export const useSessionGuard = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const { isLoggedIn, user } = await StorageService.initializeAuth();

            if (!isLoggedIn || !user) {
                console.log('❌ No valid session found, redirecting to welcome');
                setIsAuthenticated(false);
                router.replace('/');
                return;
            }

            // Set API token for authenticated requests
            const token = await StorageService.getToken();
            if (token) {
                apiService.setToken(token);
                console.log('🔑 API token set for authenticated requests');
            }

            setIsAuthenticated(true);
            setCurrentUser(user);
            console.log('✅ Session validated for user:', user.username);
        } catch (error) {
            console.error('❌ Session check failed:', error);
            setIsAuthenticated(false);
            // Clear any corrupted session data
            await StorageService.clearAuth();
            router.replace('/');
        }
    };

    const refreshSession = async () => {
        await checkAuthStatus();
    };

    return { isAuthenticated, currentUser, checkAuthStatus, refreshSession };
};