'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  pending: number;
  approved: number;
  borrowed: number;
  returned: number;
  rejected: number;
  overdue: number;
  total: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/borrowings/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-steel-blue/30 border-t-blue-600 dark:border-t-steel-blue rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat dashboard...</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Menunggu Approval',
      value: stats?.pending || 0,
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      iconBg: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      link: '/admin/borrowings?status=PENDING',
      description: 'Perlu ditinjau',
    },
    {
      title: 'Disetujui',
      value: stats?.approved || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      link: '/admin/borrowings?status=APPROVED',
      description: 'Siap dipinjam',
    },
    {
      title: 'Sedang Dipinjam',
      value: stats?.borrowed || 0,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      link: '/admin/borrowings?status=BORROWED',
      description: 'Aktif dipinjam',
    },
    {
      title: 'Terlambat',
      value: stats?.overdue || 0,
      icon: AlertCircle,
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      link: '/admin/borrowings?status=OVERDUE',
      description: 'Perlu tindakan',
    },
    {
      title: 'Dikembalikan',
      value: stats?.returned || 0,
      icon: Package,
      gradient: 'from-gray-500 to-slate-500',
      bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      iconBg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      link: '/admin/borrowings?status=RETURNED',
      description: 'Selesai',
    },
    {
      title: 'Ditolak',
      value: stats?.rejected || 0,
      icon: XCircle,
      gradient: 'from-red-600 to-red-700',
      bgGradient: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      iconBg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      link: '/admin/borrowings?status=REJECTED',
      description: 'Tidak disetujui',
    },
  ];

  const activeCount = (stats?.pending || 0) + (stats?.approved || 0) + (stats?.borrowed || 0);
  const completionRate = stats?.total ? Math.round(((stats.returned || 0) / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-steel-blue dark:via-indigo-800 dark:to-purple-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Dashboard Admin</h1>
          </div>
          <p className="text-blue-100 text-lg">Statistik dan overview peminjaman barang laboratorium</p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-steel-blue dark:to-indigo-800 text-white">
          <CardHeader>
            <CardTitle className="text-white/90 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Total Peminjaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">{stats?.total || 0}</div>
            <p className="text-blue-100">Semua peminjaman tercatat</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-800 text-white">
          <CardHeader>
            <CardTitle className="text-white/90 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Peminjaman Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">{activeCount}</div>
            <p className="text-green-100">Pending, approved & borrowed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-700 dark:to-pink-800 text-white">
          <CardHeader>
            <CardTitle className="text-white/90 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Tingkat Penyelesaian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">{completionRate}%</div>
            <p className="text-purple-100">{stats?.returned || 0} dari {stats?.total || 0} selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Statistik Detail</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.link} key={stat.title}>
                <Card className={`group overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br ${stat.bgGradient}`}>
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div className={`text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        Lihat detail →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-blue-200 dark:border-steel-blue/50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-steel-blue/10 dark:to-indigo-900/10">
          <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/borrowings?status=PENDING">
              <Button className="w-full h-16 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-base font-semibold shadow-lg">
                <Clock className="w-5 h-5 mr-2" />
                Review Pending ({stats?.pending || 0})
              </Button>
            </Link>
            <Link href="/admin/items">
              <Button className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 dark:from-steel-blue dark:to-indigo-700 text-white text-base font-semibold shadow-lg">
                <Package className="w-5 h-5 mr-2" />
                Kelola Barang
              </Button>
            </Link>
            <Link href="/admin/borrowings?status=OVERDUE">
              <Button className="w-full h-16 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-base font-semibold shadow-lg">
                <AlertCircle className="w-5 h-5 mr-2" />
                Cek Overdue ({stats?.overdue || 0})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}