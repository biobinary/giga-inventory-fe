'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api, { commentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Calendar, ShoppingBag, MessageSquare, Send, Edit, Trash2 } from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Info */}
        <Card>
          <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-t-lg overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-24 h-24 text-gray-400" />
            )}
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              {item.category && <Badge variant="secondary">{item.category}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{item.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Stok Tersedia</p>
                <p className="text-3xl font-bold text-gray-900">
                  {item.stock} / {item.totalStock}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {item.isAvailable ? (
                  <Badge variant="success" className="mt-2">Tersedia</Badge>
                ) : (
                  <Badge variant="danger" className="mt-2">Habis</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrow Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Form Peminjaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBorrow} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Jumlah</label>
                <Input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={borrowForm.quantity}
                  onChange={(e) => setBorrowForm({ ...borrowForm, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tanggal Pinjam</label>
                <Input
                  type="date"
                  value={borrowForm.borrowDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tanggal Kembali</label>
                <Input
                  type="date"
                  value={borrowForm.returnDate}
                  onChange={(e) => setBorrowForm({ ...borrowForm, returnDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Alasan Peminjaman</label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={borrowForm.reason}
                  onChange={(e) => setBorrowForm({ ...borrowForm, reason: e.target.value })}
                  placeholder="Jelaskan untuk apa barang ini dipinjam..."
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!item.isAvailable}>
                <Calendar className="w-4 h-4 mr-2" />
                Ajukan Peminjaman
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Komentar ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Tulis komentar..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada komentar</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.user.name}</span>
                        {comment.user.role === 'ADMIN' && (
                          <Badge variant="default" className="text-xs">Admin</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      {editingComment === comment.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-700">{comment.content}</p>
                      )}
                    </div>
                    {(user?.id === comment.user.id || user?.role === 'ADMIN') && editingComment !== comment.id && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditText(comment.content);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
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