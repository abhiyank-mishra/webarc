"use client";

import Link from 'next/link';
import { Activity, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, isAdmin, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 top-0 left-0 glass-card !bg-white/80 dark:!bg-slate-950/80 border-none shadow-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            Health<span className="text-primary-600">Point</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/check-status" className="text-sm font-medium hover:text-primary-600 transition-colors">Check Status</Link>
                        <Link href="/book" className="text-sm font-medium hover:text-primary-600 transition-colors">Book Slot</Link>
                        {user && !isAdmin && (
                            <Link href="/my-bookings" className="text-sm font-medium hover:text-primary-600 transition-colors">My Bookings</Link>
                        )}
                        {isAdmin ? (
                            <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">Admin</Link>
                        ) : !user ? (
                            <Link href="/login" className="text-sm font-medium hover:text-primary-600 transition-colors">Login</Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                       <UserIcon className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <span className="text-xs font-bold truncate max-w-[100px]">{user.displayName?.split(' ')[0] || 'User'}</span>
                                </div>
                                <button 
                                    onClick={() => signOut()}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        <Link href="/quick-token" className="btn-emergency !py-2 !px-5 text-sm">
                            Emergency
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-slate-600 dark:text-slate-300"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className={cn("md:hidden bg-white dark:bg-slate-900 absolute w-full transition-all duration-300 ease-in-out border-b dark:border-slate-800",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden")}>
                <div className="px-4 pt-2 pb-6 space-y-2">
                    <Link href="/check-status" className="block px-3 py-4 text-base font-medium border-b border-slate-100 dark:border-slate-800">Check Status</Link>
                    <Link href="/book" className="block px-3 py-4 text-base font-medium border-b border-slate-100 dark:border-slate-800">Book Slot</Link>
                    {user && !isAdmin && (
                        <Link href="/my-bookings" className="block px-3 py-4 text-base font-medium border-b border-slate-100 dark:border-slate-800" onClick={() => setIsOpen(false)}>My Bookings</Link>
                    )}
                    {isAdmin ? (
                        <Link href="/admin" className="block px-3 py-4 text-base font-medium border-b border-slate-100 dark:border-slate-800">Admin Dashboard</Link>
                    ) : !user ? (
                        <Link href="/login" className="block px-3 py-4 text-base font-medium border-b border-slate-100 dark:border-slate-800">Login / Sign Up</Link>
                    ) : (
                        <div className="px-3 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{user.displayName || 'User'}</p>
                                    <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{user.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => signOut()}
                                className="flex items-center gap-2 text-red-600 text-sm font-bold"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    )}
                    <div className="pt-4">
                        <Link href="/quick-token" className="btn-emergency block text-center" onClick={() => setIsOpen(false)}>
                            EMERGENCY
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
