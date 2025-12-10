'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, AlertCircle, Package, Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Borrowing {
  id: string;
  status: string;
  returnDate: string;
  items: {
    id: string;
    quantity: number;
    item: {
      name: string;
      imageUrl?: string;
    };
  }[];
}

export default function ExtensionRequestPage() {
  const router = useRouter();
  const params = useParams();
  const [borrowing, setBorrowing] = useState<Borrowing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    newReturnDate: '',
    reason: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchBorrowing();
    }
  }, [params.id]);

  const fetchBorrowing = async () => {
    try {
      const response = await api.get(`/borrowings/${params.id}`);
      setBorrowing(response.data);

      // Set default new return date to current return date + 3 days
      const currentReturnDate = new Date(response.data.returnDate);
      const defaultNewDate = new Date(currentReturnDate);
      defaultNewDate.setDate(defaultNewDate.getDate() + 3);

      setFormData({
        ...formData,
        newReturnDate: defaultNewDate.toISOString().split('T')[0],
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat data peminjaman');
      router.push('/borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!borrowing) return;

    // Validate new date is after current return date
    const currentReturnDate = new Date(borrowing.returnDate);
    const newReturnDate = new Date(formData.newReturnDate);

    if (newReturnDate <= currentReturnDate) {
      toast.error('Tanggal baru harus setelah tanggal pengembalian saat ini');
      return;
    }

    // Calculate days difference
    const daysDiff = Math.ceil(
      (newReturnDate.getTime() - currentReturnDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 7) {
      toast.error('Perpanjangan maksimal 7 hari');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Alasan perpanjangan harus diisi');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/borrowings/${params.id}/extend`, {
        newReturnDate: new Date(formData.newReturnDate).toISOString(),
        reason: formData.reason,
      });

      toast.success('Permintaan perpanjangan berhasil dibuat!');
      router.push(`/borrowings/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengajukan perpanjangan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-steel-blue animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Memuat data peminjaman...</p>
      </div>
    );
  }

  if (!borrowing) return null;

  const currentReturnDate = new Date(borrowing.returnDate);
  const newReturnDate = formData.newReturnDate ? new Date(formData.newReturnDate) : null;
  const extensionDays = newReturnDate
    ? Math.ceil((newReturnDate.getTime() - currentReturnDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isValidExtension = extensionDays > 0 && extensionDays <= 7;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="group hover:bg-gray-100 dark:hover:bg-steel-surface"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Kembali
      </Button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-800 dark:via-indigo-900 dark:to-blue-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Ajukan Perpanjangan</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Perpanjang waktu peminjaman barang Anda (maksimal 7 hari)
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Borrowing Info */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-steel-blue/10 dark:to-indigo-900/10">
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
              <Package className="w-5 h-5 mr-2" />
              Informasi Peminjaman
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Borrowing ID */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">ID Peminjaman</span>
              <Badge variant="secondary" className="font-mono">
                #{borrowing.id.slice(0, 8).toUpperCase()}
              </Badge>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Barang yang Dipinjam
              </span>
              <div className="space-y-2">
                {borrowing.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-steel-blue/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.item.imageUrl ? (
                        <img
                          src={item.item.imageUrl}
                          alt={item.item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {item.item.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Jumlah: {item.quantity} unit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Return Date */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
                  Tanggal Kembali Saat Ini
                </p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-200">
                  {formatDate(borrowing.returnDate)}
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                {borrowing.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Extension Form */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="flex items-center text-purple-700 dark:text-purple-400">
              <Clock className="w-5 h-5 mr-2" />
              Form Perpanjangan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* New Return Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Kembali Baru <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.newReturnDate}
                onChange={(e) => setFormData({ ...formData, newReturnDate: e.target.value })}
                min={new Date(currentReturnDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                max={new Date(currentReturnDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
                className="h-12"
              />

              {/* Extension Days Indicator */}
              {extensionDays !== 0 && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${isValidExtension
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                  <div className={`text-3xl font-bold ${isValidExtension ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    +{extensionDays}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isValidExtension ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                      hari perpanjangan
                    </p>
                    {!isValidExtension && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Maksimal 7 hari!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Alasan Perpanjangan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full min-h-[140px] px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 bg-white dark:bg-gray-900/20 dark:text-white resize-none"
                placeholder="Jelaskan mengapa Anda memerlukan perpanjangan waktu peminjaman..."
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Berikan alasan yang jelas untuk mempermudah admin dalam memproses permintaan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
              Hal yang Perlu Diperhatikan
            </p>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                Perpanjangan maksimal <strong>7 hari</strong> dari tanggal pengembalian saat ini
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                Permintaan akan diproses oleh admin
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                Anda akan menerima notifikasi email ketika perpanjangan disetujui/ditolak
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                Hanya dapat mengajukan <strong>1 perpanjangan</strong> per peminjaman
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-700 dark:to-indigo-800 text-base font-semibold"
            disabled={submitting || !isValidExtension}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Ajukan Perpanjangan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}