'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    ArrowLeft,
    Loader2,
    User,
    Package,
    Calendar,
    FileText,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatDateTime } from '@/lib/utils';

interface Extension {
    id: string;
    newReturnDate: string;
    reason: string;
    status: string;
    adminNotes?: string;
    createdAt: string;
    borrowing: {
        id: string;
        returnDate: string;
        status: string;
        items: {
            id: string;
            quantity: number;
            item: {
                id: string;
                name: string;
            };
        }[];
        user: {
            id: string;
            email: string;
            name: string;
            nrp?: string;
        };
    };
}

const statusConfig = {
    PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
    APPROVED: { label: 'Disetujui', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

export default function AdminExtensionsPage() {
    const [extensions, setExtensions] = useState<Extension[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('PENDING');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showNotesModal, setShowNotesModal] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [pendingAction, setPendingAction] = useState<{ id: string; status: string } | null>(null);

    useEffect(() => {
        fetchExtensions();
    }, []);

    const fetchExtensions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/extensions');
            setExtensions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error('Gagal memuat data perpanjangan');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (extensionId: string, newStatus: string, notes?: string) => {
        setProcessingId(extensionId);
        try {
            await api.patch(`/extensions/${extensionId}/status`, {
                status: newStatus,
                adminNotes: notes || undefined,
            });
            toast.success(`Perpanjangan berhasil ${newStatus === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
            fetchExtensions();
            setShowNotesModal(null);
            setAdminNotes('');
            setPendingAction(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengubah status');
        } finally {
            setProcessingId(null);
        }
    };

    const initiateStatusChange = (extensionId: string, newStatus: string) => {
        setPendingAction({ id: extensionId, status: newStatus });
        setShowNotesModal(extensionId);
    };

    const confirmStatusChange = () => {
        if (pendingAction) {
            handleStatusUpdate(pendingAction.id, pendingAction.status, adminNotes);
        }
    };

    const filteredExtensions = extensions.filter(ext =>
        filter === 'all' || ext.status === filter
    );

    const calculateExtensionDays = (currentDate: string, newDate: string) => {
        const current = new Date(currentDate);
        const newD = new Date(newDate);
        return Math.ceil((newD.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-12 h-12 text-blue-600 dark:text-steel-blue animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Memuat data perpanjangan...</p>
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
                        Kelola Perpanjangan
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Setujui atau tolak permintaan perpanjangan peminjaman
                    </p>
                </div>
                <Button onClick={fetchExtensions} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Muat Ulang
                </Button>
            </div>

            {/* Filter Tabs */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                            className="whitespace-nowrap"
                        >
                            Semua ({extensions.length})
                        </Button>
                        {Object.entries(statusConfig).map(([status, config]) => {
                            const count = extensions.filter(e => e.status === status).length;
                            const Icon = config.icon;
                            return (
                                <Button
                                    key={status}
                                    variant={filter === status ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter(status)}
                                    className="whitespace-nowrap"
                                >
                                    <Icon className="w-3 h-3 mr-1" />
                                    {config.label} ({count})
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Pending Alert */}
            {extensions.filter(e => e.status === 'PENDING').length > 0 && filter !== 'PENDING' && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        Ada <strong>{extensions.filter(e => e.status === 'PENDING').length}</strong> permintaan perpanjangan yang menunggu persetujuan
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setFilter('PENDING')}>
                        Lihat
                    </Button>
                </div>
            )}

            {/* Extensions List */}
            {filteredExtensions.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16">
                        <Clock className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Tidak ada permintaan perpanjangan
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter !== 'all'
                                ? `Tidak ada perpanjangan dengan status ${statusConfig[filter as keyof typeof statusConfig]?.label}`
                                : 'Belum ada permintaan perpanjangan'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredExtensions.map((extension) => {
                        const config = statusConfig[extension.status as keyof typeof statusConfig];
                        const StatusIcon = config.icon;
                        const extensionDays = calculateExtensionDays(
                            extension.borrowing.returnDate,
                            extension.newReturnDate
                        );

                        return (
                            <Card key={extension.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <CardTitle className="text-lg">
                                                    Perpanjangan #{extension.id.slice(0, 8).toUpperCase()}
                                                </CardTitle>
                                                <Badge className={`${config.color} flex items-center gap-1`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {config.label}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    +{extensionDays} hari
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Diajukan: {formatDateTime(extension.createdAt)}
                                            </p>
                                        </div>
                                        <Link href={`/borrowings/${extension.borrowing.id}`}>
                                            <Button variant="outline" size="sm">
                                                Lihat Peminjaman
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {extension.borrowing.user.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {extension.borrowing.user.email}
                                            </p>
                                        </div>
                                        {extension.borrowing.user.nrp && (
                                            <Badge variant="secondary">{extension.borrowing.user.nrp}</Badge>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            Barang
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {extension.borrowing.items.map((item) => (
                                                <div key={item.id} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                                                    {item.item.name} <span className="text-gray-500">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dates Comparison */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Tanggal Kembali Saat Ini
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatDate(extension.borrowing.returnDate)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                                            <div className="flex items-center text-sm text-green-600 dark:text-green-400 mb-1">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Tanggal Kembali Baru
                                            </div>
                                            <p className="font-semibold text-green-700 dark:text-green-300">
                                                {formatDate(extension.newReturnDate)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            <FileText className="w-3 h-3 mr-1" />
                                            Alasan Perpanjangan
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{extension.reason}</p>
                                    </div>

                                    {/* Admin Notes (if exists) */}
                                    {extension.adminNotes && (
                                        <div className={`p-3 rounded-lg ${extension.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                Catatan Admin:
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {extension.adminNotes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {extension.status === 'PENDING' && (
                                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => initiateStatusChange(extension.id, 'APPROVED')}
                                                disabled={processingId === extension.id}
                                            >
                                                {processingId === extension.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Setujui
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => initiateStatusChange(extension.id, 'REJECTED')}
                                                disabled={processingId === extension.id}
                                            >
                                                {processingId === extension.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Tolak
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className={pendingAction?.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'}>
                                {pendingAction?.status === 'REJECTED' ? 'Tolak Perpanjangan' : 'Setujui Perpanjangan'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {pendingAction?.status === 'APPROVED'
                                    ? 'Perpanjangan akan disetujui dan tanggal pengembalian akan diperbarui.'
                                    : 'Perpanjangan akan ditolak dan tanggal pengembalian tetap sama.'}
                            </p>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Catatan (opsional)
                                </label>
                                <textarea
                                    className="w-full min-h-[100px] mt-1 px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-steel-blue bg-white dark:bg-gray-900/20 dark:text-white resize-none"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Tambahkan catatan untuk user..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowNotesModal(null);
                                        setAdminNotes('');
                                        setPendingAction(null);
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className={`flex-1 ${pendingAction?.status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    onClick={confirmStatusChange}
                                    disabled={processingId !== null}
                                >
                                    {processingId ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Konfirmasi'
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
