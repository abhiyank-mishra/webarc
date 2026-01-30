"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Timer, 
    ArrowLeft,
    Inbox
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function MyBookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');

                const apptsRef = collection(db, 'appointments');
                const q = query(
                    apptsRef, 
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setBookings(data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchBookings();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Please log in to see your bookings</h2>
                <Link href="/login?redirect=/my-bookings" className="btn-primary">
                    Login Now
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                     <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-black">My <span className="text-primary-600">Bookings</span></h1>
                    <p className="text-slate-500">Track all your medical appointment requests here.</p>
                </div>
                <Link href="/book" className="btn-primary !py-2.5">
                    Book New Slot
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {bookings.length > 0 ? (
                        bookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-6 md:p-8 rounded-[2rem] border-white/40 dark:border-slate-800 group hover:border-primary-500/30 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "p-4 rounded-2xl flex items-center justify-center",
                                            booking.status === 'approved' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                                        )}>
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">{booking.serviceName}</h3>
                                            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5" />
                                                {booking.slot} • {new Date(booking.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border",
                                            booking.status === 'approved' 
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30" 
                                                : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30"
                                        )}>
                                            {booking.status === 'approved' ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Confirmed
                                                </>
                                            ) : (
                                                <>
                                                    <Timer className="h-4 w-4 animate-pulse" />
                                                    Pending Approval
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {booking.status === 'approved' && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 italic">
                                        Note: A confirmation email has been sent to your Gmail. Please arrive 15 minutes before your slot.
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 glass-card rounded-[2rem] border-dashed"
                        >
                            <div className="bg-slate-100 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Inbox className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No bookings found</h3>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto">You haven{"'"}t booked any medical appointments yet.</p>
                            <Link href="/book" className="btn-primary">
                                Book Your First Slot
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
