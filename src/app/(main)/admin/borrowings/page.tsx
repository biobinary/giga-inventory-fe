'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShoppingBag,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  FileText,
  Loader2,
  Search,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatDateTime } from '@/lib/utils';

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
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    nrp?: string;
  };
  items: BorrowingItem[];
}

const statusConfig = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  APPROVED: { label: 'Disetujui', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  BORROWED: { label: 'Dipinjam', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
  RETURNED: { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: CheckCircle },
  REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  OVERDUE: { label: 'Terlambat', color: 'bg-red-600 text-white dark:bg-red-700', icon: AlertCircle },
};

const statusActions: Record<string, { next: string[]; labels: Record<string, string> }> = {
  PENDING: {
    next: ['APPROVED', 'REJECTED'],
    labels: { APPROVED: 'Setujui', REJECTED: 'Tolak' }
  },
  APPROVED: {
    next: ['BORROWED', 'REJECTED'],
    labels: { BORROWED: 'Barang Diambil', REJECTED: 'Batalkan' }
  },
  BORROWED: {
    next: ['RETURNED', 'OVERDUE'],
    labels: { RETURNED: 'Dikembalikan', OVERDUE: 'Tandai Terlambat' }
  },
  OVERDUE: {
    next: ['RETURNED'],
    labels: { RETURNED: 'Dikembalikan' }
  },
};

export default function AdminBorrowingsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [pendingAction, setPendingAction] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setFilter(status);
    }
  }, [searchParams]);

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/borrowings');
      // API returns { data: [], meta: {} } structure
      const borrowingsData = response.data.data || response.data;
      setBorrowings(Array.isArray(borrowingsData) ? borrowingsData : []);
    } catch (error) {
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (borrowingId: string, newStatus: string, notes?: string) => {
    setProcessingId(borrowingId);
    try {
      const payload: { status: string; adminNotes?: string; rejectionReason?: string } = {
        status: newStatus
      };

      if (notes) {
        if (newStatus === 'REJECTED') {
          payload.rejectionReason = notes;
        } else {
          payload.adminNotes = notes;
        }
      }

      await api.patch(`/borrowings/${borrowingId}/status`, payload);
      toast.success(`Status berhasil diubah menjadi ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`);
      fetchBorrowings();
      setShowNotesModal(null);
      setAdminNotes('');
      setPendingAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setProcessingId(null);
    }
  };

  const initiateStatusChange = (borrowingId: string, newStatus: string) => {
    if (newStatus === 'REJECTED') {
      setPendingAction({ id: borrowingId, status: newStatus });
      setShowNotesModal(borrowingId);
    } else {
      setPendingAction({ id: borrowingId, status: newStatus });
      setShowNotesModal(borrowingId);
    }
  };

  const confirmStatusChange = () => {
    if (pendingAction) {
      handleStatusUpdate(pendingAction.id, pendingAction.status, adminNotes);
    }
  };

  const filteredBorrowings = borrowings.filter(b => {
    const matchesStatus = filter === 'all' || b.status === filter;
    const matchesSearch = searchTerm === '' ||
      b.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.items.some(item => item.item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-steel-blue animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Memuat data peminjaman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Kelola Peminjaman
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Approve, reject, dan kelola status peminjaman
          </p>
        </div>
        <Button onClick={fetchBorrowings} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Muat Ulang
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama, email, atau barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="whitespace-nowrap"
            >
              Semua ({borrowings.length})
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = borrowings.filter(b => b.status === status).length;
              const Icon = config.icon;
              return (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="whitespace-nowrap"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label} ({count})
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
            <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tidak ada peminjaman
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter !== 'all'
                ? `Tidak ada peminjaman dengan status ${statusConfig[filter as keyof typeof statusConfig]?.label}`
                : 'Belum ada data peminjaman'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBorrowings.map((borrowing) => {
            const config = statusConfig[borrowing.status as keyof typeof statusConfig];
            const actions = statusActions[borrowing.status];
            const StatusIcon = config.icon;

            return (
              <Card key={borrowing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-lg">
                          #{borrowing.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <Badge className={`${config.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dibuat: {formatDateTime(borrowing.createdAt)}
                      </p>
                    </div>
                    <Link href={`/borrowings/${borrowing.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{borrowing.user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{borrowing.user.email}</p>
                    </div>
                    {borrowing.user.nrp && (
                      <Badge variant="secondary">{borrowing.user.nrp}</Badge>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Barang ({borrowing.items.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {borrowing.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.item.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            x{item.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Tanggal Pinjam
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(borrowing.borrowDate)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Tanggal Kembali
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(borrowing.returnDate)}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <FileText className="w-3 h-3 mr-1" />
                      Alasan Peminjaman
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{borrowing.reason}</p>
                  </div>

                  {/* Admin Notes */}
                  {(borrowing.adminNotes || borrowing.rejectionReason) && (
                    <div className={`p-3 rounded-lg ${borrowing.rejectionReason ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {borrowing.rejectionReason ? 'Alasan Penolakan:' : 'Catatan Admin:'}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {borrowing.rejectionReason || borrowing.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {actions && actions.next.length > 0 && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {actions.next.map((nextStatus) => {
                        const isDestructive = nextStatus === 'REJECTED' || nextStatus === 'OVERDUE';
                        return (
                          <Button
                            key={nextStatus}
                            variant={isDestructive ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => initiateStatusChange(borrowing.id, nextStatus)}
                            disabled={processingId === borrowing.id}
                            className={!isDestructive ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {processingId === borrowing.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                {nextStatus === 'APPROVED' && <CheckCircle className="w-4 h-4 mr-1" />}
                                {nextStatus === 'REJECTED' && <XCircle className="w-4 h-4 mr-1" />}
                                {nextStatus === 'BORROWED' && <Package className="w-4 h-4 mr-1" />}
                                {nextStatus === 'RETURNED' && <CheckCircle className="w-4 h-4 mr-1" />}
                                {nextStatus === 'OVERDUE' && <AlertCircle className="w-4 h-4 mr-1" />}
                                {actions.labels[nextStatus]}
                              </>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {pendingAction?.status === 'REJECTED' ? 'Alasan Penolakan' : 'Catatan Admin'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full min-h-[120px] px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-steel-blue bg-white dark:bg-gray-900/20 dark:text-white resize-none"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={pendingAction?.status === 'REJECTED'
                  ? 'Masukkan alasan penolakan (opsional)...'
                  : 'Tambahkan catatan (opsional)...'}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNotesModal(null);
                    setAdminNotes('');
                    setPendingAction(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  className={`flex-1 ${pendingAction?.status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  onClick={confirmStatusChange}
                  disabled={processingId !== null}
                >
                  {processingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Konfirmasi'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
