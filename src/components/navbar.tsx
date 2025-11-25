'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { LogOut, Package, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-steel-surface dark:border-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/items" className="flex items-center space-x-2">
            <div className="text-2xl">🔬</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Lab GIGA</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            {user?.role === 'ADMIN' ? (
              <>
                <Link href="/admin/dashboard">
                  <Button
                    variant={isActive('/admin') ? 'default' : 'ghost'}
                    size="sm"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {/* Items & Borrowings Links sama seperti sebelumnya... */}
                <Link href="/admin/items">
                  <Button variant={isActive('/admin/items') ? 'default' : 'ghost'} size="sm">
                    <Package className="w-4 h-4 mr-2" /> Items
                  </Button>
                </Link>
                <Link href="/admin/borrowings">
                  <Button variant={isActive('/admin/borrowings') ? 'default' : 'ghost'} size="sm">
                    <ShoppingBag className="w-4 h-4 mr-2" /> Borrowings
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/items">
                  <Button variant={isActive('/items') ? 'default' : 'ghost'} size="sm">
                    <Package className="w-4 h-4 mr-2" /> Barang
                  </Button>
                </Link>
                <Link href="/borrowings">
                  <Button variant={isActive('/borrowings') ? 'default' : 'ghost'} size="sm">
                    <ShoppingBag className="w-4 h-4 mr-2" /> Peminjaman Saya
                  </Button>
                </Link>
              </>
            )}

            <Link href="/profile">
              <Button
                variant={isActive('/profile') ? 'default' : 'ghost'}
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}