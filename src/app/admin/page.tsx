"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Clock,
    TrendingUp,
    AlertTriangle,
    Plus,
    Settings,
    MoreVertical,
    Activity,
    ArrowUpRight,
    Search
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { Toast } from '@/components/Toast';

const data = [
    { time: '08 AM', load: 12, wait: 10 },
    { time: '09 AM', load: 34, wait: 25 },
    { time: '10 AM', load: 56, wait: 45 },
    { time: '11 AM', load: 78, wait: 55 },
    { time: '12 PM', load: 45, wait: 30 },
    { time: '01 PM', load: 23, wait: 15 },
    { time: '02 PM', load: 45, wait: 25 },
    { time: '03 PM', load: 67, wait: 40 },
    { time: '04 PM', load: 89, wait: 60 },
    { time: '05 PM', load: 34, wait: 20 },
];

export default function AdminPage() {
    const { user, loading: authLoading, isAdmin, signOut } = useAuth();
    const router = useRouter();
    const [queueData, setQueueData] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'queue' | 'appointments' | 'slots'>('queue');
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [newSlot, setNewSlot] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; tokenId: string; tokenNumber: string }>({ isOpen: false, tokenId: '', tokenNumber: '' });
    const [deleteSlotModal, setDeleteSlotModal] = useState<{ isOpen: boolean; slot: string }>({ isOpen: false, slot: '' });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (!authLoading && user && !isAdmin) {
            router.push('/login');
        }
    }, [user, authLoading, isAdmin, router]);

    useEffect(() => {
        const setupListener = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, query, onSnapshot, orderBy } = await import('firebase/firestore');

                // Listener for Queue Tokens
                const tokensRef = collection(db, 'tokens');
                const qTokens = query(tokensRef, orderBy('createdAt', 'desc'));

                const unsubTokens = onSnapshot(qTokens, (snapshot) => {
                    const tokens = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setQueueData(tokens);
                    setLoading(false);
                });

                // Listener for Appointments
                const apptsRef = collection(db, 'appointments');
                const qAppts = query(apptsRef, orderBy('createdAt', 'desc'));

                const unsubAppts = onSnapshot(qAppts, (snapshot) => {
                    const appts = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setAppointments(appts);
                });

                return () => {
                    unsubTokens();
                    unsubAppts();
                };
            } catch (error) {
                console.error('Error setting up listener:', error);
                setQueueData([]);
                setLoading(false);
            }
        };

        if (user && isAdmin) {
            setupListener();
        }
    }, [user, isAdmin]);

    // Fetch time slots from Firestore
    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { doc, getDoc, setDoc } = await import('firebase/firestore');

                const slotsDoc = await getDoc(doc(db, 'settings', 'timeSlots'));
                
                if (slotsDoc.exists()) {
                    setTimeSlots(slotsDoc.data().slots || []);
                } else {
                    // Initialize with default slots if not exists
                    const defaultSlots = [
                        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
                        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
                    ];
                    await setDoc(doc(db, 'settings', 'timeSlots'), { slots: defaultSlots });
                    setTimeSlots(defaultSlots);
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
            }
        };

        if (!authLoading && user && isAdmin) {
            fetchSlots();
        }
    }, [authLoading, user, isAdmin]);

    if (authLoading || !user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-6 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        Admin <span className="text-primary-600 italic">Command Center</span>
                    </h1>
                    <p className="text-slate-500">Monitoring activity logs and appointment requests.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => signOut()} 
                        className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2 px-4"
                    >
                        <span className="text-sm font-bold">Logout</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    icon={Users}
                    label="Total Patients Today"
                    value={queueData.length.toString()}
                    trend={`${queueData.filter(t => t.status === 'waiting').length} waiting`}
                    positive={true}
                    color="blue"
                />
                <StatCard
                    icon={Clock}
                    label="Average Wait Time"
                    value={queueData.length > 0 ? `${Math.round(queueData.reduce((acc, t) => acc + (t.expectedTime || 0), 0) / queueData.length)}m` : '0m'}
                    trend={queueData.filter(t => (t.expectedTime || 0) < 30).length > queueData.length / 2 ? 'Good' : 'High'}
                    positive={queueData.filter(t => (t.expectedTime || 0) < 30).length > queueData.length / 2}
                    color="emerald"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Completed Today"
                    value={queueData.filter(t => t.status === 'completed').length.toString()}
                    trend={`${Math.round((queueData.filter(t => t.status === 'completed').length / Math.max(queueData.length, 1)) * 100)}%`}
                    positive={true}
                    color="purple"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Priority Cases"
                    value={queueData.filter(t => t.isPriority).length.toString()}
                    trend={queueData.filter(t => t.isPriority && t.status === 'waiting').length > 0 ? 'Pending' : 'Clear'}
                    positive={queueData.filter(t => t.isPriority && t.status === 'waiting').length === 0}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Main Chart */}
                <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-[2rem]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Crowd Load Intensity</h3>
                            <p className="text-sm text-slate-500">Volume of patients per hour vs expected wait time.</p>
                        </div>
                        <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1">
                            <option>Today</option>
                            <option>Yesterday</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="load" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Live Counters */}
                <div className="glass-card p-6 md:p-8 rounded-[2rem]">
                    <h3 className="text-xl font-bold mb-6">Staff Presence</h3>
                    <div className="space-y-6">
                        <CounterStatus name="Counter 01" service="General" active={true} load={45} />
                        <CounterStatus name="Counter 02" service="Pediat." active={true} load={82} />
                        <CounterStatus name="Counter 03" service="Lab" active={false} load={0} />
                        <CounterStatus name="Counter 04" service="Cardio" active={true} load={12} />
                        <CounterStatus name="Counter 05" service="ENT" active={true} load={65} />
                    </div>
                    <button className="w-full mt-8 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-colors">
                        Manage All Staff
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-8">
                <button 
                    onClick={() => setActiveTab('queue')}
                    className={cn(
                        "px-6 py-3 rounded-xl font-bold transition-all",
                        activeTab === 'queue' ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                >
                    Live Queue
                </button>
                <button
                    onClick={() => setActiveTab('appointments')}
                     className={cn(
                        "px-6 py-3 rounded-xl font-bold transition-all relative",
                        activeTab === 'appointments' ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                >
                    Appointment Requests
                    {appointments.filter(a => a.status === 'confirmed').length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-50 dark:border-slate-950">
                            {appointments.filter(a => a.status === 'confirmed').length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('slots')}
                    className={cn(
                        "px-6 py-3 rounded-xl font-bold transition-all",
                        activeTab === 'slots' ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                >
                    Manage Slots
                </button>
            </div>

            {/* Content Switch */}
            {activeTab === 'queue' ? (
                /* Recent Queue Table */
                <div className="glass-card overflow-hidden rounded-[2rem]">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold">Real-time Queue Log</h3>
                        <Activity className="h-5 w-5 text-primary-500 animate-pulse" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-xs font-black uppercase tracking-widest">
                                    <th className="px-8 py-4">Token</th>
                                    <th className="px-8 py-4">Department</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Wait Time</th>
                                    <th className="px-8 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {queueData.length > 0 ? (
                                    queueData.slice(0, 10).map((token) => (
                                        <QueueRow 
                                            key={token.id}
                                            tokenId={token.id}
                                            id={token.number || 'N/A'} 
                                            dept={token.serviceName || 'Unknown'} 
                                            status={token.status === 'waiting' ? 'Waiting' : token.status === 'called' ? 'In Progress' : 'Completed'} 
                                            time={token.expectedTime ? `${token.expectedTime}m` : '--'} 
                                            type={token.isPriority ? 'Priority' : 'Normal'}
                                            onDelete={(tokenId: string, tokenNumber: string) => setDeleteModal({ isOpen: true, tokenId, tokenNumber })}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-8 text-center text-slate-400">
                                            No active tokens in the queue
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'appointments' ? (
                /* Appointments Table */
                <div className="glass-card overflow-hidden rounded-[2rem]">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold">Pending Appointments</h3>
                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">
                            Action Required
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-xs font-black uppercase tracking-widest">
                                    <th className="px-8 py-4">Patient</th>
                                    <th className="px-8 py-4">Contact</th>
                                    <th className="px-8 py-4">Slot</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {appointments.length > 0 ? (
                                    appointments.map((appt) => (
                                        <AppointmentRow 
                                            key={appt.id}
                                            data={appt}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-8 text-center text-slate-400">
                                            No pending appointments
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Slots Management */
                <div className="glass-card p-8 rounded-[2rem]">
                    <h3 className="text-2xl font-bold mb-6">Manage Time Slots</h3>
                    
                    {/* Add New Slot Form */}
                    <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                        <h4 className="font-bold mb-4">Add New Time Slot</h4>
                        <div className="flex gap-3">
                            <input
                                type="time"
                                value={newSlot}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    const [hours, minutes] = time.split(':');
                                    const hour = parseInt(hours);
                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                    const displayHour = hour % 12 || 12;
                                    setNewSlot(`${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`);
                                }}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <button
                                onClick={async () => {
                                    if (!newSlot) return;
                                    try {
                                        const { db } = await import('@/lib/firebase');
                                        const { doc, updateDoc } = await import('firebase/firestore');
                                        
                                        const updatedSlots = [...timeSlots, newSlot].sort();
                                        await updateDoc(doc(db, 'settings', 'timeSlots'), { slots: updatedSlots });
                                        setTimeSlots(updatedSlots);
                                        setNewSlot('');
                                        showToast('Slot added successfully!', 'success');
                                    } catch (error) {
                                        console.error('Error adding slot:', error);
                                        showToast('Failed to add slot.', 'error');
                                    }
                                }}
                                className="btn-primary !py-3"
                            >
                                Add Slot
                            </button>
                        </div>
                    </div>

                    {/* Current Slots List */}
                    <div>
                        <h4 className="font-bold mb-4">Current Time Slots ({timeSlots.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {timeSlots.map((slot, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                    <span className="font-medium">{slot}</span>
                                    <button
                                        onClick={() => setDeleteSlotModal({ isOpen: true, slot })}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteModal({ isOpen: false, tokenId: '', tokenNumber: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card p-8 rounded-3xl max-w-md w-full"
                        >
                            <h3 className="text-2xl font-bold mb-4">Delete Token?</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Are you sure you want to delete token <strong>{deleteModal.tokenNumber}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, tokenId: '', tokenNumber: '' })}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const { db } = await import('@/lib/firebase');
                                            const { doc, deleteDoc } = await import('firebase/firestore');
                                            
                                            await deleteDoc(doc(db, 'tokens', deleteModal.tokenId));
                                            setDeleteModal({ isOpen: false, tokenId: '', tokenNumber: '' });
                                            showToast('Token deleted successfully!', 'success');
                                        } catch (error) {
                                            console.error('Error deleting token:', error);
                                            showToast('Failed to delete token.', 'error');
                                        }
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Slot Confirmation Modal */}
            <AnimatePresence>
                {deleteSlotModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteSlotModal({ isOpen: false, slot: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card p-8 rounded-3xl max-w-md w-full"
                        >
                            <h3 className="text-2xl font-bold mb-4">Delete Time Slot?</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Are you sure you want to delete the <strong>{deleteSlotModal.slot}</strong> time slot? This will affect future bookings.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteSlotModal({ isOpen: false, slot: '' })}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const { db } = await import('@/lib/firebase');
                                            const { doc, updateDoc } = await import('firebase/firestore');
                                            
                                            const updatedSlots = timeSlots.filter((s) => s !== deleteSlotModal.slot);
                                            await updateDoc(doc(db, 'settings', 'timeSlots'), { slots: updatedSlots });
                                            setTimeSlots(updatedSlots);
                                            setDeleteSlotModal({ isOpen: false, slot: '' });
                                            showToast('Slot deleted successfully!', 'success');
                                        } catch (error) {
                                            console.error('Error deleting slot:', error);
                                            showToast('Failed to delete slot.', 'error');
                                        }
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                                >
                                    Delete
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

function StatCard({ icon: Icon, label, value, trend, positive, color }: any) {
    const colorMap: any = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20',
    };

    return (
        <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className={cn("p-3 rounded-2xl", colorMap[color])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                    positive ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-red-500 bg-red-50 dark:bg-red-900/20"
                )}>
                    {positive ? <ArrowUpRight className="h-3 w-3" /> : null}
                    {trend}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black mt-1">{value}</p>
            </div>
        </div>
    );
}

function CounterStatus({ name, service, active, load }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full", active ? "bg-green-500" : "bg-slate-300")} />
                <div>
                    <p className="text-sm font-bold">{name}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{service}</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-1000",
                            load > 80 ? "bg-red-500" : (load > 40 ? "bg-amber-500" : "bg-emerald-500")
                        )}
                        style={{ width: `${load}%` }}
                    />
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{load}% LOAD</p>
            </div>
        </div>
    );
}

function QueueRow({ tokenId, id, dept, status, time, type, onDelete }: any) {
    return (
        <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
            <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                    <span className="font-black text-sm">{id}</span>
                    {type !== 'Normal' && (
                        <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                            type === 'Priority' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                            {type}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-8 py-5">
                <span className="text-sm font-medium text-slate-500">{dept}</span>
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full",
                        status === 'Waiting' ? "bg-amber-500" : (status === 'In Progress' ? "bg-blue-500" : (status === 'Completed' ? "bg-emerald-500" : "bg-red-500"))
                    )} />
                    <span className="text-sm font-semibold">{status}</span>
                </div>
            </td>
            <td className="px-8 py-5 text-sm font-bold">{time}</td>
            <td className="px-8 py-5">
                <button 
                    onClick={() => onDelete(tokenId, id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500 hover:text-red-700"
                    title="Delete Token"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </td>
        </tr>
    );
}

function AppointmentRow({ data }: any) {
    const handleApprove = async () => {
        const { db } = await import('@/lib/firebase');
        const { doc, updateDoc, collection, addDoc } = await import('firebase/firestore');
        
        try {
            // 1. Update status in Firestore
            await updateDoc(doc(db, 'appointments', data.id), {
                status: 'approved'
            });
            
            // 2. Send email via Firebase Extension (mail collection)
            await addDoc(collection(db, 'mail'), {
                to: data.userEmail,
                message: {
                    subject: 'Appointment Confirmed - HealthPoint',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4F46E5;">Appointment Confirmed!</h2>
                            <p>Dear ${data.name},</p>
                            <p>Your appointment at <strong>HealthPoint</strong> has been confirmed.</p>
                            
                            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Appointment Details</h3>
                                <p><strong>Service:</strong> ${data.serviceName}</p>
                                <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p><strong>Time Slot:</strong> ${data.slot}</p>
                                <p><strong>Phone:</strong> ${data.phone}</p>
                            </div>
                            
                            <p style="color: #DC2626;"><strong>Important:</strong> Please arrive 15 minutes before your scheduled time.</p>
                            
                            <p>If you need to reschedule or cancel, please visit your account dashboard.</p>
                            
                            <p>Best regards,<br><strong>HealthPoint Team</strong></p>
                        </div>
                    `
                }
            });
            
            alert('Appointment approved! Email will be sent shortly.');
        } catch (error) {
            console.error('Error approving:', error);
            alert('Failed to approve appointment.');
        }
    };

    return (
        <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
            <td className="px-8 py-5">
                <div>
                    <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
                    <p className="text-xs text-slate-500">{data.userEmail}</p>
                </div>
            </td>
            <td className="px-8 py-5">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{data.phone}</p>
            </td>
            <td className="px-8 py-5">
                 <div>
                    <p className="font-bold text-sm">{data.slot}</p>
                    <p className="text-xs text-slate-500">{new Date(data.date).toLocaleDateString()}</p>
                </div>
            </td>
            <td className="px-8 py-5">
                <span className={cn("text-xs font-black uppercase px-2 py-1 rounded",
                    data.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                    {data.status || 'Pending'}
                </span>
            </td>
            <td className="px-8 py-5 text-right">
                {data.status !== 'approved' && (
                    <button 
                        onClick={handleApprove}
                        className="btn-primary py-2 px-4 text-xs"
                    >
                        Approve & Email
                    </button>
                )}
            </td>
        </tr>
    );
}
