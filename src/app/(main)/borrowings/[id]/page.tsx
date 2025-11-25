'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon
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
    description: string;
  };
}

interface Extension {
  id: string;
  newReturnDate: string;
  reason: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Borrowing {
  id: string;
  status: string;
  reason: string;
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    nrp?: string;
    studentCardUrl?: string;
  };
  items: BorrowingItem[];
  extensions: Extension[];
}

const statusConfig = {
  PENDING: { label: 'Menunggu', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  APPROVED: { label: 'Disetujui', variant: 'success' as const, color: 'bg-green-100 text-green-800', icon: CheckCircle },
  BORROWED: { label: 'Dipinjam', variant: 'default' as const, color: 'bg-blue-100 text-blue-800', icon: Package },
  RETURNED: { label: 'Dikembalikan', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  REJECTED: { label: 'Ditolak', variant: 'danger' as const, color: 'bg-red-100 text-red-800', icon: XCircle },
  OVERDUE: { label: 'Terlambat', variant: 'danger' as const, color: 'bg-red-600 text-white', icon: AlertCircle },
};

const extensionStatusConfig = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Disetujui', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
};

export default function BorrowingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [borrowing, setBorrowing] = useState<Borrowing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStudentCard, setShowStudentCard] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBorrowing();
    }
  }, [params.id]);

  const fetchBorrowing = async () => {
    try {
      const response = await api.get(`/borrowings/${params.id}`);
      setBorrowing(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail peminjaman');
      router.push('/borrowings');
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

  if (!borrowing) return null;

  const config = statusConfig[borrowing.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;
  const canRequestExtension = ['APPROVED', 'BORROWED'].includes(borrowing.status);
  const hasPendingExtension = borrowing.extensions.some(ext => ext.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                Detail Peminjaman
              </CardTitle>
              <p className="text-sm text-gray-500">
                ID: {borrowing.id}
              </p>
              <p className="text-sm text-gray-500">
                Dibuat: {formatDateTime(borrowing.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${config.color} flex items-center gap-1 px-3 py-1 text-sm`}>
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </Badge>
              {borrowing.status === 'OVERDUE' && (
                <Badge variant="danger" className="text-xs">
                  Harap segera kembalikan!
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Borrowed Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="w-5 h-5 mr-2" />
                Barang yang Dipinjam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {borrowing.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.item.imageUrl ? (
                        <img
                          src={item.item.imageUrl}
                          alt={item.item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/items/${item.item.id}`}
                        className="font-semibold text-blue-600 hover:underline block"
                      >
                        {item.item.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.item.description}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        Jumlah: <span className="text-blue-600">{item.quantity} unit</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Tanggal Pinjam</p>
                    <p className="text-sm text-gray-600">{formatDate(borrowing.borrowDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    borrowing.status === 'OVERDUE' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      borrowing.status === 'OVERDUE' ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Tanggal Kembali</p>
                    <p className={`text-sm ${
                      borrowing.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'text-gray-600'
                    }`}>
                      {formatDate(borrowing.returnDate)}
                    </p>
                  </div>
                </div>

                {borrowing.actualReturnDate && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Tanggal Dikembalikan</p>
                      <p className="text-sm text-gray-600">{formatDate(borrowing.actualReturnDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Alasan Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{borrowing.reason}</p>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {(borrowing.adminNotes || borrowing.rejectionReason) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  {borrowing.status === 'REJECTED' ? 'Alasan Penolakan' : 'Catatan Admin'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  borrowing.status === 'REJECTED' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className="text-gray-700">
                    {borrowing.rejectionReason || borrowing.adminNotes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extension History */}
          {borrowing.extensions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  Riwayat Perpanjangan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {borrowing.extensions.map((ext) => {
                    const extConfig = extensionStatusConfig[ext.status as keyof typeof extensionStatusConfig];
                    return (
                      <div key={ext.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge className={extConfig.color}>
                              {extConfig.label}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              Diajukan: {formatDateTime(ext.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Tanggal kembali baru:</p>
                            <p className="text-sm font-semibold text-gray-900">{formatDate(ext.newReturnDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Alasan:</p>
                            <p className="text-sm text-gray-700">{ext.reason}</p>
                          </div>
                          {ext.adminNotes && (
                            <div>
                              <p className="text-xs text-gray-500">Catatan Admin:</p>
                              <p className="text-sm text-gray-700">{ext.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - User Info & Actions */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-5 h-5 mr-2" />
                Informasi Peminjam
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Nama</p>
                <p className="text-sm font-medium text-gray-900">{borrowing.user.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-700">{borrowing.user.email}</p>
              </div>
              {borrowing.user.nrp && (
                <div>
                  <p className="text-xs text-gray-500">NRP</p>
                  <p className="text-sm text-gray-700">{borrowing.user.nrp}</p>
                </div>
              )}
              {borrowing.user.studentCardUrl && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Kartu Mahasiswa</p>
                  <button
                    onClick={() => setShowStudentCard(true)}
                    className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
                  >
                    <img
                      src={borrowing.user.studentCardUrl}
                      alt="Student Card"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canRequestExtension && !hasPendingExtension && (
                <Link href={`/borrowings/${borrowing.id}/extend`} className="block">
                  <Button className="w-full" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Ajukan Perpanjangan
                  </Button>
                </Link>
              )}
              {hasPendingExtension && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Perpanjangan sedang diproses
                  </p>
                </div>
              )}
              {borrowing.status === 'OVERDUE' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Segera kembalikan barang!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Card Modal */}
      {showStudentCard && borrowing.user.studentCardUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowStudentCard(false)}
        >
          <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Kartu Mahasiswa - {borrowing.user.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowStudentCard(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <img
                src={borrowing.user.studentCardUrl}
                alt="Student Card"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}