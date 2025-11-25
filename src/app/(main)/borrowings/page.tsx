'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Calendar, Package, Clock } from 'lucide-react';
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
  PENDING: { label: 'Menunggu', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Disetujui', variant: 'success' as const, color: 'bg-green-100 text-green-800' },
  BORROWED: { label: 'Dipinjam', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
  RETURNED: { label: 'Dikembalikan', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
  REJECTED: { label: 'Ditolak', variant: 'danger' as const, color: 'bg-red-100 text-red-800' },
  OVERDUE: { label: 'Terlambat', variant: 'danger' as const, color: 'bg-red-600 text-white' },
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Peminjaman Saya</h1>
          <p className="text-gray-600 mt-1">Lihat status dan riwayat peminjaman</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Semua ({borrowings.length})
        </Button>
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = borrowings.filter(b => b.status === status).length;
          return (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {config.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Borrowings List */}
      {filteredBorrowings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada peminjaman</p>
            <Link href="/items">
              <Button className="mt-4">Lihat Barang</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBorrowings.map((borrowing) => {
            const config = statusConfig[borrowing.status as keyof typeof statusConfig];
            return (
              <Card key={borrowing.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Peminjaman #{borrowing.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Dibuat {formatDate(borrowing.createdAt)}
                      </p>
                    </div>
                    <Badge className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Barang:</h4>
                    <div className="space-y-2">
                      {borrowing.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            {item.item.imageUrl ? (
                              <img
                                src={item.item.imageUrl}
                                alt={item.item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.item.name}</p>
                            <p className="text-xs text-gray-500">Jumlah: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Tanggal Pinjam
                      </div>
                      <p className="text-sm font-medium">{formatDate(borrowing.borrowDate)}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        Tanggal Kembali
                      </div>
                      <p className="text-sm font-medium">{formatDate(borrowing.returnDate)}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Alasan:</p>
                    <p className="text-sm text-gray-700">{borrowing.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Link href={`/borrowings/${borrowing.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Lihat Detail
                      </Button>
                    </Link>
                    {(borrowing.status === 'APPROVED' || borrowing.status === 'BORROWED') && (
                      <Link href={`/borrowings/${borrowing.id}/extend`}>
                        <Button>Perpanjang</Button>
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