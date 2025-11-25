'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { LogOut, Package, ShoppingBag, User, LayoutDashboard } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 dark:bg-steel-surface/80 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/items" className="flex items-center space-x-3 group">
            <div className="text-3xl transform group-hover:scale-110 transition-transform duration-200">
              🔬
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Lab GIGA
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === 'ADMIN' ? 'Admin Panel' : 'Portal Mahasiswa'}
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {user?.role === 'ADMIN' ? (
              <>
                <Link href="/admin/dashboard">
                  <Button
                    variant={isActive('/admin/dashboard') ? 'default' : 'ghost'}
                    size="sm"
                    className="relative overflow-hidden group"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    <span>Dashboard</span>
                    {isActive('/admin/dashboard') && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                    )}
                  </Button>
                </Link>
                <Link href="/admin/items">
                  <Button 
                    variant={isActive('/admin/items') ? 'default' : 'ghost'} 
                    size="sm"
                    className="relative"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    <span>Items</span>
                    {isActive('/admin/items') && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                    )}
                  </Button>
                </Link>
                <Link href="/admin/borrowings">
                  <Button 
                    variant={isActive('/admin/borrowings') ? 'default' : 'ghost'} 
                    size="sm"
                    className="relative"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    <span>Borrowings</span>
                    {isActive('/admin/borrowings') && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/items">
                  <Button 
                    variant={isActive('/items') ? 'default' : 'ghost'} 
                    size="sm"
                    className="relative"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    <span>Barang</span>
                    {isActive('/items') && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                    )}
                  </Button>
                </Link>
                <Link href="/borrowings">
                  <Button 
                    variant={isActive('/borrowings') ? 'default' : 'ghost'} 
                    size="sm"
                    className="relative"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    <span>Peminjaman Saya</span>
                    {isActive('/borrowings') && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                    )}
                  </Button>
                </Link>
              </>
            )}

            <Link href="/profile">
              <Button
                variant={isActive('/profile') ? 'default' : 'ghost'}
                size="sm"
                className="relative"
              >
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
                {isActive('/profile') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></span>
                )}
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}