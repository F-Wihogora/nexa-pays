import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function DashboardLauncher() {
  const router = useRouter();

  useEffect(() => {
    // In a real app, we'd check the user's role from a context/store
    // For now, we'll default to the agent role
    const userRole = 'agent'; 
    
    if (userRole === 'agent') {
      router.replace('/agent/scan');
    } else if (userRole === 'salesperson') {
      router.replace('/salesperson/dashboard');
    }
  }, []);

  return null;
}
