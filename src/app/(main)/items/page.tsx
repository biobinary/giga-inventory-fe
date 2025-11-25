'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Sparkles, ArrowRight } from 'lucide-react';
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
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchItems();
  }, [search, category]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await api.get(`/items?${params.toString()}`);
      setItems(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat data barang');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-steel-blue/30 border-t-blue-600 dark:border-t-steel-blue rounded-full animate-spin"></div>
          <Package className="w-6 h-6 text-blue-600 dark:text-steel-blue absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat barang...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-steel-blue dark:via-indigo-800 dark:to-purple-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Daftar Barang</h1>
          </div>
          <p className="text-blue-100 text-lg">Pilih barang yang ingin Anda pinjam dari laboratorium</p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Search */}
      <Card className="border-2 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <Input
              placeholder="Cari barang berdasarkan nama atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gray-400/20 dark:bg-gray-600/20 blur-2xl rounded-full"></div>
              <Package className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto relative" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tidak ada barang ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coba ubah kata kunci pencarian Anda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="group overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 dark:border dark:border-gray-800"
            >
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                {item.imageUrl ? (
                  <>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 group-hover:scale-110 transition-transform" />
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="danger" className="shadow-lg">Habis</Badge>
                  </div>
                )}
                {item.category && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 dark:bg-steel-surface/90 shadow-lg">
                      {item.category}
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-steel-blue/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-steel-blue/30">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Stok Tersedia</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        {item.stock}
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-400">/ {item.totalStock}</p>
                    </div>
                  </div>
                  {item.isAvailable ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold">Tersedia</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-semibold">Habis</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/items/${item.id}`} className="w-full">
                  <Button 
                    className="w-full h-11 group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-steel-blue dark:to-indigo-700" 
                    disabled={!item.isAvailable}
                  >
                    {item.isAvailable ? (
                      <>
                        Pinjam Barang
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      'Stok Habis'
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}