"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
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
    const [activeTab, setActiveTab] = useState<'queue' | 'appointments'>('queue');

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
                                            id={token.number || 'N/A'} 
                                            dept={token.serviceName || 'Unknown'} 
                                            status={token.status === 'waiting' ? 'Waiting' : token.status === 'called' ? 'In Progress' : 'Completed'} 
                                            time={token.expectedTime ? `${token.expectedTime}m` : '--'} 
                                            type={token.isPriority ? 'Priority' : 'Normal'} 
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
            ) : (
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
            )}
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

function QueueRow({ id, dept, status, time, type }: any) {
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
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                </button>
            </td>
        </tr>
    );
}

function AppointmentRow({ data }: any) {
    const handleApprove = async () => {
        const { db } = await import('@/lib/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        
        // 1. Update status in Firestore
        try {
            await updateDoc(doc(db, 'appointments', data.id), {
                status: 'approved'
            });
            
            // 2. Open Email Client (mailto)
            const subject = encodeURIComponent(`Appointment Confirmed - HealthPoint`);
            const body = encodeURIComponent(`
Dear ${data.name},

Your appointment at HealthPoint has been confirmed.

Details:
Service: ${data.serviceName}
Date: ${new Date(data.date).toLocaleDateString()}
Time Slot: ${data.slot}

Please arrive 15 minutes early.

Regards,
HealthPoint Admin
            `);
            
            // Only open mailto if userEmail exists. If only phone, maybe open WhatsApp? (Optional future enhancement)
             if (data.userEmail) {
                window.location.href = `mailto:${data.userEmail}?subject=${subject}&body=${body}`;
            } else {
                alert('Appointment approved! No email found for this user to send notification.');
            }

        } catch (error) {
            console.error('Error approving appointment:', error);
            alert('Failed to approve appointment');
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
