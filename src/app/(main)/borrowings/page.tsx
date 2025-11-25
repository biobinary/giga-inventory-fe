'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Calendar, Package, Clock, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface BorrowingItem {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

interface Borrowing {
  id: string;
  status: string;
  borrowDate: string;
  returnDate: string;
  reason: string;
  createdAt: string;
  items: BorrowingItem[];
}

const statusConfig = {
  PENDING: { label: 'Menunggu', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '⏳' },
  APPROVED: { label: 'Disetujui', variant: 'success' as const, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: '✅' },
  BORROWED: { label: 'Dipinjam', variant: 'default' as const, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: '📦' },
  RETURNED: { label: 'Dikembalikan', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: '✓' },
  REJECTED: { label: 'Ditolak', variant: 'danger' as const, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '❌' },
  OVERDUE: { label: 'Terlambat', variant: 'danger' as const, color: 'bg-red-600 text-white dark:bg-red-700', icon: '⚠️' },
};

export default function BorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const response = await api.get('/borrowings/my');
      setBorrowings(response.data);
    } catch (error) {
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const filteredBorrowings = filter === 'all'
    ? borrowings
    : borrowings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-steel-blue/30 border-t-blue-600 dark:border-t-steel-blue rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat peminjaman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-900 dark:to-pink-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Peminjaman Saya</h1>
          </div>
          <p className="text-purple-100 text-lg">Lihat status dan riwayat peminjaman barang Anda</p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="whitespace-nowrap"
            >
              🔵 Semua ({borrowings.length})
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = borrowings.filter(b => b.status === status).length;
              return (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="whitespace-nowrap"
                >
                  {config.icon} {config.label} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Borrowings List */}
      {filteredBorrowings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-indigo-400/20 dark:bg-indigo-600/20 blur-2xl rounded-full"></div>
              <ShoppingBag className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto relative" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {filter === 'all' ? 'Belum ada peminjaman' : `Tidak ada peminjaman ${statusConfig[filter as keyof typeof statusConfig]?.label.toLowerCase()}`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Mulai pinjam barang dari laboratorium
            </p>
            <Link href="/items">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-steel-blue dark:to-indigo-700">
                <Package className="w-4 h-4 mr-2" />
                Lihat Barang
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredBorrowings.map((borrowing) => {
            const config = statusConfig[borrowing.status as keyof typeof statusConfig];
            return (
              <Card key={borrowing.id} className="group hover:shadow-2xl transition-all duration-300 border-l-4" style={{ borderLeftColor: borrowing.status === 'PENDING' ? '#F59E0B' : borrowing.status === 'APPROVED' ? '#10B981' : borrowing.status === 'BORROWED' ? '#3B82F6' : borrowing.status === 'OVERDUE' ? '#EF4444' : '#6B7280' }}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-bold">
                          Peminjaman #{borrowing.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <Badge className={`${config.color} font-semibold`}>
                          {config.icon} {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        📅 Dibuat {formatDate(borrowing.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Barang yang Dipinjam:
                    </h4>
                    <div className="space-y-2">
                      {borrowing.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-steel-blue transition-colors">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-steel-blue/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.item.imageUrl ? (
                              <img
                                src={item.item.imageUrl}
                                alt={item.item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.item.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah: {item.quantity} unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-steel-blue/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-steel-blue/30">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                        <Calendar className="w-4 h-4 mr-1" />
                        Tanggal Pinjam
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100">{formatDate(borrowing.borrowDate)}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        Tanggal Kembali
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100">{formatDate(borrowing.returnDate)}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">💭 Alasan Peminjaman:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{borrowing.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Link href={`/borrowings/${borrowing.id}`} className="flex-1">
                      <Button variant="outline" className="w-full h-11 hover:bg-blue-50 dark:hover:bg-steel-blue/10 border-2">
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat Detail
                      </Button>
                    </Link>
                    {(borrowing.status === 'APPROVED' || borrowing.status === 'BORROWED') && (
                      <Link href={`/borrowings/${borrowing.id}/extend`}>
                        <Button className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-steel-blue dark:to-indigo-700">
                          <Clock className="w-4 h-4 mr-2" />
                          Perpanjang
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}