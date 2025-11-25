'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';
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
      
      // Set minimum date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!borrowing) return null;

  const currentReturnDate = new Date(borrowing.returnDate);
  const newReturnDate = formData.newReturnDate ? new Date(formData.newReturnDate) : null;
  const extensionDays = newReturnDate 
    ? Math.ceil((newReturnDate.getTime() - currentReturnDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ajukan Perpanjangan</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Ajukan perpanjangan waktu peminjaman Anda (maksimal 7 hari)
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Info */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Peminjaman ID</p>
                <p className="text-sm text-gray-600">{borrowing.id.slice(0, 8)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Barang yang dipinjam</p>
                <div className="mt-1 space-y-1">
                  {borrowing.items.map((item) => (
                    <p key={item.id} className="text-sm text-gray-600">
                      • {item.item.name} ({item.quantity} unit)
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Tanggal Kembali Saat Ini</p>
                  <p className="text-sm text-gray-600">{formatDate(borrowing.returnDate)}</p>
                </div>
                <Badge variant="warning">{borrowing.status}</Badge>
              </div>
            </div>

            {/* New Return Date */}
            <div>
              <label className="text-sm font-medium">
                Tanggal Kembali Baru <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.newReturnDate}
                onChange={(e) => setFormData({ ...formData, newReturnDate: e.target.value })}
                min={new Date(currentReturnDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                max={new Date(currentReturnDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
                className="mt-1"
              />
              {extensionDays > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Perpanjangan: <span className="font-semibold text-blue-600">{extensionDays} hari</span>
                  {extensionDays > 7 && (
                    <span className="text-red-600"> (Maksimal 7 hari!)</span>
                  )}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium">
                Alasan Perpanjangan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full min-h-[120px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                placeholder="Jelaskan mengapa Anda memerlukan perpanjangan waktu..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Berikan alasan yang jelas untuk mempermudah admin dalam memproses permintaan Anda
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Perhatian</p>
                <ul className="text-xs text-yellow-800 mt-1 space-y-1">
                  <li>• Perpanjangan maksimal 7 hari dari tanggal pengembalian saat ini</li>
                  <li>• Permintaan perpanjangan akan diproses oleh admin</li>
                  <li>• Anda akan menerima notifikasi email ketika perpanjangan disetujui/ditolak</li>
                  <li>• Hanya dapat mengajukan 1 perpanjangan per peminjaman</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || extensionDays > 7}
              >
                <Clock className="w-4 h-4 mr-2" />
                {submitting ? 'Mengirim...' : 'Ajukan Perpanjangan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}