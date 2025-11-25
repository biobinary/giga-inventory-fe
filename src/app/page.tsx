'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/items');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-steel-bg dark:via-steel-surface dark:to-steel-bg animate-gradient">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-steel-blue/20 blur-3xl rounded-full"></div>
          <div className="text-8xl mb-4 relative animate-bounce">🔬</div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Lab GIGA
        </h1>
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Memuat aplikasi...</p>
        </div>
      </div>
    </div>
  );
}