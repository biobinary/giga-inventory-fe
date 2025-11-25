'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Menunggu Approval',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      link: '/admin/borrowings?status=PENDING',
    },
    {
      title: 'Disetujui',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      link: '/admin/borrowings?status=APPROVED',
    },
    {
      title: 'Sedang Dipinjam',
      value: stats?.borrowed || 0,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/borrowings?status=BORROWED',
    },
    {
      title: 'Terlambat',
      value: stats?.overdue || 0,
      icon: AlertCircle,
      color: 'bg-red-100 text-red-600',
      link: '/admin/borrowings?status=OVERDUE',
    },
    {
      title: 'Dikembalikan',
      value: stats?.returned || 0,
      icon: Package,
      color: 'bg-gray-100 text-gray-600',
      link: '/admin/borrowings?status=RETURNED',
    },
    {
      title: 'Ditolak',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
      link: '/admin/borrowings?status=REJECTED',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Statistik peminjaman barang</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.link} key={stat.title}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Total Summary */}
      <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardHeader>
          <CardTitle>Total Peminjaman</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold">{stats?.total || 0}</div>
          <p className="text-blue-100 mt-2">Total semua peminjaman yang tercatat</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/borrowings?status=PENDING">
            <Button className="w-full" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Review Pending ({stats?.pending || 0})
            </Button>
          </Link>
          <Link href="/admin/items">
            <Button className="w-full" variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Kelola Barang
            </Button>
          </Link>
          <Link href="/admin/borrowings?status=OVERDUE">
            <Button className="w-full" variant="outline">
              <AlertCircle className="w-4 h-4 mr-2" />
              Cek Overdue ({stats?.overdue || 0})
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}