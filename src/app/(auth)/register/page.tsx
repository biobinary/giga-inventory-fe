'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Mail, CreditCard, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nrp: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        nrp: formData.nrp || undefined,
        password: formData.password,
      });
      toast.success('Registrasi berhasil!');
      router.push('/items');
    } catch (error: any) {
      toast.error(error.message || 'Registrasi gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-steel-bg dark:via-steel-surface dark:to-steel-bg animate-gradient p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 dark:bg-steel-blue/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 dark:border dark:border-gray-800">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/20 blur-2xl rounded-full"></div>
              <div className="text-6xl relative">🔬</div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Daftar Akun
            </CardTitle>
            <CardDescription className="text-center text-base">
              Buat akun untuk meminjam barang lab
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Lengkap
              </label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                icon={<User className="w-4 h-4" />}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail className="w-4 h-4" />}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nrp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                NRP <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <Input
                id="nrp"
                name="nrp"
                placeholder="5025211001"
                value={formData.nrp}
                onChange={handleChange}
                icon={<CreditCard className="w-4 h-4" />}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock className="w-4 h-4" />}
                required
                minLength={6}
                className="h-11"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Minimal 6 karakter</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Konfirmasi Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                  Daftar Sekarang
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
                Sudah punya akun?
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button 
              variant="outline" 
              className="w-full h-11 border-2 hover:bg-gray-50 dark:hover:bg-steel-bg dark:border-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}