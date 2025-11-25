'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Mail, IdCard, Upload, Camera, Edit2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    nrp: user?.nrp || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.patch('/users/profile', formData);
      const updatedUser = response.data;
      
      if (user) {
        setAuth(
          { ...user, ...updatedUser },
          localStorage.getItem('accessToken')!,
          localStorage.getItem('refreshToken')!
        );
      }
      
      toast.success('Profile berhasil diperbarui');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStudentCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/users/upload-student-card', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data.user;
      
      if (user) {
        setAuth(
          { ...user, ...updatedUser },
          localStorage.getItem('accessToken')!,
          localStorage.getItem('refreshToken')!
        );
      }

      toast.success('Kartu mahasiswa berhasil diupload');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal upload kartu mahasiswa');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-steel-blue dark:via-indigo-800 dark:to-purple-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Profile Saya</h1>
          <p className="text-blue-100">Kelola informasi akun Anda</p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Profile Info Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-steel-blue dark:to-indigo-700"></div>
        <CardContent className="relative pt-0 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-steel-blue dark:to-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white dark:border-steel-surface shadow-xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-steel-surface flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left sm:pt-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-steel-text">{user?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <div className="mt-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
                  {user?.role === 'ADMIN' ? '👑 Administrator' : '👤 User'}
                </Badge>
              </div>
            </div>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="mt-4 sm:mt-0 dark:border-gray-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card className="border-2 border-blue-200 dark:border-steel-blue/50">
          <CardHeader className="bg-blue-50 dark:bg-steel-blue/10">
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
              <Edit2 className="w-5 h-5 mr-2" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input 
                  value={user?.email} 
                  disabled 
                  className="bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed h-11" 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Email tidak dapat diubah
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  NRP <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  value={formData.nrp}
                  onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                  placeholder="5025211001"
                  className="h-11"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-steel-blue dark:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user?.name || '', nrp: user?.nrp || '' });
                  }}
                  className="h-11 dark:border-gray-700"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Student Card Upload */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-400">
            <IdCard className="w-5 h-5 mr-2" />
            Kartu Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {user?.studentCardUrl ? (
            <div className="space-y-4">
              <div className="relative group">
                <div className="relative aspect-video max-w-2xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={user.studentCardUrl}
                    alt="Student Card"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <p className="text-white text-sm font-medium">Kartu Mahasiswa Anda</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Kartu terverifikasi</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/20 blur-2xl rounded-full"></div>
                <Camera className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 relative" />
              </div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Belum ada kartu mahasiswa
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload kartu mahasiswa untuk mengajukan peminjaman
              </p>
            </div>
          )}

          <div className="space-y-3">
            <label htmlFor="student-card" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                disabled={uploading}
                onClick={() => document.getElementById('student-card')?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    {user?.studentCardUrl ? 'Ganti Kartu Mahasiswa' : 'Upload Kartu Mahasiswa'}
                  </>
                )}
              </Button>
            </label>
            <input
              id="student-card"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadStudentCard}
              disabled={uploading}
            />
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                Format: JPG, PNG
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                Max: 5MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}