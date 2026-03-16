import { View, Pressable } from 'react-native';
import { LayoutGrid, ShoppingBag, Zap, History, Settings } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

export const SalespersonBottomNav = ({ primaryNavy }: { primaryNavy: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'dashboard', icon: LayoutGrid, path: '/(main)/salesperson/dashboard' },
    { id: 'products', icon: ShoppingBag, path: '/(main)/salesperson/products' },
    { id: 'pay', icon: Zap, path: '/(main)/salesperson/pay' },
    { id: 'history', icon: History, path: '/(main)/salesperson/history' },
    { id: 'settings', icon: Settings, path: '/(main)/salesperson/settings' },
  ];

  const isActive = (path: string) => {
    const normalizedPathname = pathname.replace(/^\/|\(\w+\)\//g, '');
    const normalizedTarget = path.replace(/^\/|\(\w+\)\//g, '');
    return normalizedPathname === normalizedTarget;
  };

  return (
    <View className="absolute bottom-10 left-8 right-8 h-20 bg-white/95 rounded-3xl border border-slate-100 flex-row items-center justify-around px-4 shadow-2xl shadow-blue-900/10 backdrop-blur-xl">
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        return (
          <Pressable 
            key={tab.id}
            onPress={() => router.replace(tab.path as any)}
            className={`w-12 h-12 rounded-full items-center justify-center ${active ? '' : 'opacity-20'}`}
            style={active ? { backgroundColor: primaryNavy } : {}}
          >
            <tab.icon size={22} color={active ? "white" : primaryNavy} />
          </Pressable>
        );
      })}
    </View>
  );
};
