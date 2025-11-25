'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Mail, IdCard, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      
      // Update auth store
      if (user) {
        setAuth(
          { ...user, ...updatedUser },
          localStorage.getItem('accessToken')!,
          localStorage.getItem('refreshToken')!
        );
      }
      
      toast.success('Profile berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStudentCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
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
      
      // Update auth store
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Kelola informasi akun Anda</p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Badge className="mt-1">
                {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
            </div>
            <div>
              <label className="text-sm font-medium">NRP (Optional)</label>
              <Input
                value={formData.nrp}
                onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                placeholder="5025211001"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Student Card Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IdCard className="w-5 h-5 mr-2" />
            Kartu Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.studentCardUrl ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">Kartu mahasiswa Anda:</p>
              <div className="relative aspect-video max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={user.studentCardUrl}
                  alt="Student Card"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Upload gambar baru untuk mengganti
              </p>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Belum ada kartu mahasiswa</p>
              <p className="text-xs text-gray-500 mt-1">
                Upload kartu mahasiswa untuk mengajukan peminjaman
              </p>
            </div>
          )}

          <div>
            <label htmlFor="student-card" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => document.getElementById('student-card')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Kartu Mahasiswa'}
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
            <p className="text-xs text-gray-500 mt-2">
              Format: JPG, PNG, max 5MB
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}