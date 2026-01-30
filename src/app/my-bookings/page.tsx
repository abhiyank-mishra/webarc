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
    Inbox,
    Edit3,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HospitalServices } from '@/lib/services';
import { Toast } from '@/components/Toast';

const slots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

export default function MyBookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [rescheduleData, setRescheduleData] = useState({
        date: new Date().toISOString().split('T')[0],
        slot: ''
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

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

    useEffect(() => {
        if (!authLoading) {
            fetchBookings();
        }
    }, [user, authLoading]);

    const handleReschedule = (booking: any) => {
        setSelectedBooking(booking);
        setRescheduleData({
            date: booking.date,
            slot: booking.slot
        });
        setShowRescheduleModal(true);
    };

    const handleCancelClick = (booking: any) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const confirmReschedule = async () => {
        if (!selectedBooking || !rescheduleData.slot) return;

        try {
            const { db } = await import('@/lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');

            await updateDoc(doc(db, 'appointments', selectedBooking.id), {
                date: rescheduleData.date,
                slot: rescheduleData.slot,
                status: 'pending' // Reset to pending after reschedule
            });

            setShowRescheduleModal(false);
            await fetchBookings();
            showToast('Appointment rescheduled successfully!', 'success');
        } catch (error) {
            console.error('Error rescheduling:', error);
            showToast('Failed to reschedule appointment.', 'error');
        }
    };

    const confirmCancel = async () => {
        if (!selectedBooking) return;

        try {
            const { db } = await import('@/lib/firebase');
            const { doc, deleteDoc } = await import('firebase/firestore');

            await deleteDoc(doc(db, 'appointments', selectedBooking.id));

            setShowCancelModal(false);
            await fetchBookings();
            showToast('Appointment cancelled successfully.', 'success');
        } catch (error) {
            console.error('Error cancelling:', error);
            showToast('Failed to cancel appointment.', 'error');
        }
    };

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
                                    <div className="flex items-start gap-4 flex-1">
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

                                    <div className="flex items-center gap-3">
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
                                                    Pending
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                    {booking.status !== 'approved' && (
                                        <button
                                            onClick={() => handleReschedule(booking)}
                                            className="flex-1 btn-secondary !py-2.5 flex items-center justify-center gap-2"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Reschedule
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleCancelClick(booking)}
                                        className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>

                                {booking.status === 'approved' && (
                                    <div className="mt-4 text-sm text-slate-500 italic">
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

            {/* Reschedule Modal */}
            <AnimatePresence>
                {showRescheduleModal && selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowRescheduleModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card p-8 rounded-[2rem] max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6">Reschedule Appointment</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select New Date</label>
                                    <div className="flex gap-4 overflow-x-auto pb-4">
                                        {[0, 1, 2, 3, 4].map((i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + i);
                                            const isSelected = d.toISOString().split('T')[0] === rescheduleData.date;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setRescheduleData({ ...rescheduleData, date: d.toISOString().split('T')[0] })}
                                                    className={cn(
                                                        "flex-shrink-0 p-4 rounded-2xl border-2 transition-all min-w-[80px]",
                                                        isSelected ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-800"
                                                    )}
                                                >
                                                    <div className="text-xs text-slate-500">{d.toLocaleDateString([], { weekday: 'short' })}</div>
                                                    <div className="text-2xl font-bold">{d.getDate()}</div>
                                                    <div className="text-xs text-slate-500">{d.toLocaleDateString([], { month: 'short' })}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select New Time Slot</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => setRescheduleData({ ...rescheduleData, slot })}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 transition-all text-sm font-medium",
                                                    rescheduleData.slot === slot ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-800"
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowRescheduleModal(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmReschedule}
                                        disabled={!rescheduleData.slot}
                                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirm Reschedule
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cancel Modal */}
            <AnimatePresence>
                {showCancelModal && selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCancelModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card p-8 rounded-[2rem] max-w-md w-full text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Cancel Appointment?</h2>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to cancel your appointment for <strong>{selectedBooking.serviceName}</strong> on{' '}
                                <strong>{new Date(selectedBooking.date).toLocaleDateString()}</strong> at <strong>{selectedBooking.slot}</strong>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Keep Appointment
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}
