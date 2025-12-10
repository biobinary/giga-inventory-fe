'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Package,
    ArrowLeft,
    Loader2,
    Upload,
    X,
    Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function NewItemPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        stock: 0,
        totalStock: 0,
        category: '',
        isAvailable: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Nama barang harus diisi');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('stock', formData.stock.toString());
            data.append('totalStock', formData.totalStock.toString());
            data.append('category', formData.category);
            data.append('isAvailable', formData.isAvailable.toString());

            if (imageFile) {
                data.append('file', imageFile);
            }

            await api.post('/items', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Barang berhasil ditambahkan');
            router.push('/admin/items');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menambahkan barang');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/items">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Tambah Barang Baru
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Isi informasi barang inventaris
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Informasi Barang
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Gambar Barang
                            </label>
                            <div className="flex items-start gap-4">
                                <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">Tidak ada gambar</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">Upload Gambar</span>
                                        </div>
                                    </label>
                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setImageFile(null);
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Hapus Gambar
                                        </Button>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Format: JPG, PNG. Maksimal 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Nama Barang *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Masukkan nama barang"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Deskripsi
                            </label>
                            <textarea
                                className="w-full min-h-[120px] px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-steel-blue bg-white dark:bg-gray-900/20 dark:text-white resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Jelaskan detail barang..."
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Kategori
                            </label>
                            <Input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="Contoh: Elektronik, Alat Tulis, dll"
                            />
                        </div>

                        {/* Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Stok Tersedia
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setFormData({
                                            ...formData,
                                            stock: val,
                                            totalStock: Math.max(val, formData.totalStock)
                                        });
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Total Stok
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.totalStock}
                                    onChange={(e) => setFormData({ ...formData, totalStock: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                Barang tersedia untuk dipinjam
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link href="/admin/items" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Barang
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
