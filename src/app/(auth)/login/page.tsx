'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast.success('Login berhasil!');
      router.push('/items');
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-steel-bg dark:via-steel-surface dark:to-steel-bg animate-gradient p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 dark:bg-steel-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 dark:border dark:border-gray-800">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 dark:bg-steel-blue/20 blur-2xl rounded-full"></div>
              <div className="text-6xl relative">🔬</div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Lab GIGA
            </CardTitle>
            <CardDescription className="text-center text-base">
              Sistem Peminjaman Barang Laboratorium
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-steel-blue dark:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-steel-surface px-2 text-gray-500 dark:text-gray-400">
                Belum punya akun?
              </span>
            </div>
          </div>

          <Link href="/register">
            <Button 
              variant="outline" 
              className="w-full h-11 border-2 hover:bg-gray-50 dark:hover:bg-steel-bg dark:border-gray-700"
            >
              Daftar Sekarang
            </Button>
          </Link>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-blue-50 dark:bg-steel-blue/10 rounded-lg p-4 space-y-1">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                🔑 Akun Demo:
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Admin: admin@labgiga.com / admin123
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                User: user@example.com / user123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}