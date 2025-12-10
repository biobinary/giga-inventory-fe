'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api, { commentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Calendar, ShoppingBag, MessageSquare, Send, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/utils';

interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  stock: number;
  totalStock: number;
  category?: string;
  isAvailable: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [item, setItem] = useState<Item | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [borrowForm, setBorrowForm] = useState({
    quantity: 1,
    borrowDate: '',
    returnDate: '',
    reason: '',
  });
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchItem();
      fetchComments();
    }
  }, [params.id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${params.id}`);
      setItem(response.data);
    } catch (error) {
      toast.error('Gagal memuat detail barang');
      router.push('/items');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsApi.getByItem(params.id as string);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setSubmitting(true);
    try {
      await api.post('/borrowings', {
        items: [{ itemId: item.id, quantity: borrowForm.quantity }],
        borrowDate: new Date(borrowForm.borrowDate).toISOString(),
        returnDate: new Date(borrowForm.returnDate).toISOString(),
        reason: borrowForm.reason,
      });

      toast.success('Permintaan peminjaman berhasil dibuat!');
      router.push('/borrowings');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengajukan peminjaman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await commentsApi.create({
        content: commentText,
        itemId: params.id as string,
      });
      setCommentText('');
      fetchComments();
      toast.success('Komentar berhasil ditambahkan');
    } catch (error) {
      toast.error('Gagal menambahkan komentar');
    }
  };

  const handleEditComment = async (commentId: string) => {
    try {
      await commentsApi.update(commentId, editText);
      setEditingComment(null);
      setEditText('');
      fetchComments();
      toast.success('Komentar berhasil diubah');
    } catch (error) {
      toast.error('Gagal mengubah komentar');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;

    try {
      await commentsApi.delete(commentId);
      fetchComments();
      toast.success('Komentar berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus komentar');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-steel-blue animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Memuat detail barang...</p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="group hover:bg-gray-100 dark:hover:bg-steel-surface"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Kembali
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Info */}
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-32 h-32 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            {item.category && (
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 dark:bg-steel-surface/90 shadow-lg">
                  {item.category}
                </Badge>
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl">{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-steel-blue/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-steel-blue/30">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Stok Tersedia</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {item.stock}
                  </p>
                  <p className="text-xl text-gray-500 dark:text-gray-400">/ {item.totalStock}</p>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Status</p>
                {item.isAvailable ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg w-fit">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Tersedia</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg w-fit">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-semibold">Habis</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrow Form */}
        <Card className="border-2 border-blue-200 dark:border-steel-blue/50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-steel-blue/10 dark:to-indigo-900/10">
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Form Peminjaman
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleBorrow} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Jumlah</label>
                <Input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={borrowForm.quantity}
                  onChange={(e) => setBorrowForm({ ...borrowForm, quantity: parseInt(e.target.value) || 1 })}
                  required
                  className="h-11"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Maksimal: {item.stock} unit</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal Pinjam
                </label>
                <Input
                  type="date"
                  value={borrowForm.borrowDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal Kembali
                </label>
                <Input
                  type="date"
                  value={borrowForm.returnDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, returnDate: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alasan Peminjaman</label>
                <textarea
                  className="w-full min-h-[120px] px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-steel-blue bg-white dark:bg-gray-900/20 dark:text-white resize-none"
                  value={borrowForm.reason}
                  onChange={(e) => setBorrowForm({ ...borrowForm, reason: e.target.value })}
                  placeholder="Jelaskan untuk apa barang ini dipinjam..."
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-steel-blue dark:to-indigo-700 text-base font-semibold"
                disabled={!item.isAvailable || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Ajukan Peminjaman
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardTitle className="flex items-center text-purple-700 dark:text-purple-400">
            <MessageSquare className="w-6 h-6 mr-2" />
            Komentar ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-3">
            <Input
              placeholder="Tulis komentar Anda..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="h-11"
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Belum ada komentar</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Jadilah yang pertama berkomentar!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="group p-4 border-l-4 border-blue-500 dark:border-steel-blue bg-gray-50 dark:bg-steel-surface/30 rounded-r-lg hover:bg-gray-100 dark:hover:bg-steel-surface/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{comment.user.name}</span>
                        {comment.user.role === 'ADMIN' && (
                          <Badge variant="default" className="text-xs">👑 Admin</Badge>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      {editingComment === comment.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                            className="h-10"
                          />
                          <Button size="sm" onClick={() => handleEditComment(comment.id)} className="h-10">
                            Simpan
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)} className="h-10">
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                      )}
                    </div>
                    {(user?.id === comment.user.id || user?.role === 'ADMIN') && editingComment !== comment.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditText(comment.content);
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}