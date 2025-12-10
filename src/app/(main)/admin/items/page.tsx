'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Search,
    RefreshCw,
    ArrowLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Item {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    stock: number;
    totalStock: number;
    category?: string;
    isAvailable: boolean;
    createdAt: string;
}

export default function AdminItemsPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/items');
            // API returns { data: [], meta: {} } structure
            const itemsData = response.data.data || response.data;
            setItems(Array.isArray(itemsData) ? itemsData : []);
        } catch (error) {
            toast.error('Gagal memuat data barang');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/items/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleDelete = async (itemId: string) => {
        setDeletingId(itemId);
        try {
            await api.delete(`/items/${itemId}`);
            toast.success('Barang berhasil dihapus');
            fetchItems();
            setShowDeleteModal(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus barang');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = searchTerm === '' ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-12 h-12 text-blue-600 dark:text-steel-blue animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Memuat data barang...</p>
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
                        Kelola Barang
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Tambah, edit, dan hapus barang inventaris
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchItems} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Link href="/admin/items/new">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Barang
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Cari berdasarkan nama atau deskripsi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <Button
                            variant={categoryFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter('all')}
                            className="whitespace-nowrap"
                        >
                            Semua ({items.length})
                        </Button>
                        {categories.map((category) => {
                            const count = items.filter(i => i.category === category).length;
                            return (
                                <Button
                                    key={category}
                                    variant={categoryFilter === category ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCategoryFilter(category)}
                                    className="whitespace-nowrap"
                                >
                                    {category} ({count})
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16">
                        <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Tidak ada barang
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchTerm || categoryFilter !== 'all'
                                ? 'Tidak ada barang yang sesuai dengan filter'
                                : 'Mulai dengan menambahkan barang baru'}
                        </p>
                        <Link href="/admin/items/new">
                            <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Barang Pertama
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                            {/* Image */}
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Package className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                                    </div>
                                )}
                                {item.category && (
                                    <Badge
                                        variant="secondary"
                                        className="absolute top-3 left-3 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
                                    >
                                        {item.category}
                                    </Badge>
                                )}
                                {!item.isAvailable && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Badge variant="danger" className="text-sm">Tidak Tersedia</Badge>
                                    </div>
                                )}
                            </div>

                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {item.description}
                                </p>

                                {/* Stock Info */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Stok</p>
                                        <p className="font-bold text-gray-900 dark:text-gray-100">
                                            {item.stock} / {item.totalStock}
                                        </p>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link href={`/admin/items/${item.id}/edit`} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => setShowDeleteModal(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Konfirmasi Hapus
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeleteModal(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleDelete(showDeleteModal)}
                                    disabled={deletingId !== null}
                                >
                                    {deletingId === showDeleteModal ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Hapus
                                        </>
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
