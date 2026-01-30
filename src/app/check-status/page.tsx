"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HospitalServices } from '@/lib/services';
import {
    CheckCircle2,
    Clock,
    Users,
    ArrowRight,
    HelpCircle,
    Stethoscope,
    Baby,
    Ear,
    Bone,
    HeartPulse,
    Beaker
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const IconMap: any = {
    Stethoscope,
    Baby,
    Ear,
    Bone,
    HeartPulse,
    Beaker
};

export default function CheckStatusPage() {
    const [liveStats, setLiveStats] = useState<any[]>([]);

    useEffect(() => {
        // Import Firestore and set up real-time listener
        const setupListener = async () => {
            try {
                const { db } = await import('@/lib/firebase');
                const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');

                const tokensRef = collection(db, 'tokens');
                const q = query(tokensRef, where('status', '==', 'waiting'), orderBy('createdAt', 'asc'));

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    // Group tokens by service
                    const serviceMap = new Map();
                    
                    snapshot.forEach((doc) => {
                        const token = doc.data();
                        const serviceId = token.serviceId;
                        
                        if (!serviceMap.has(serviceId)) {
                            serviceMap.set(serviceId, []);
                        }
                        serviceMap.get(serviceId).push({ id: doc.id, ...token });
                    });

                    // Build stats for each service
                    const stats = HospitalServices.map(service => {
                        const tokens = serviceMap.get(service.id) || [];
                        const waitingCount = tokens.length;
                        const currentToken = tokens[0]?.number || 'N/A';
                        
                        return {
                            ...service,
                            currentInRoom: currentToken,
                            waitingCount,
                            status: waitingCount > 10 ? 'Delayed' : 'On Track',
                            load: waitingCount > 8 ? 'High' : (waitingCount > 4 ? 'Medium' : 'Low')
                        };
                    });

                    setLiveStats(stats);
                }, (error) => {
                    console.error('Error fetching queue status:', error);
                    setLiveStats([]);
                });

                return unsubscribe;
            } catch (error) {
                console.error('Error setting up listener:', error);
                setLiveStats([]);
            }
        };

        setupListener();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Live Queue Status</h1>
                    <p className="text-slate-500 max-w-lg">
                        See real-time updates for all departments. No login needed.
                    </p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full border border-primary-100 dark:border-primary-800 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Live Updates</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStats.map((stat, index) => {
                    const Icon = IconMap[stat.type] || Stethoscope;
                    return (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card hover:scale-[1.02] transition-all p-0 overflow-hidden rounded-[2rem]"
                        >
                            <div className={cn("p-6",
                                stat.load === 'High' ? "bg-red-50 dark:bg-red-900/10" :
                                    stat.load === 'Medium' ? "bg-amber-50 dark:bg-amber-900/10" :
                                        "bg-emerald-50 dark:bg-emerald-900/10"
                            )}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                                        <Icon className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        stat.load === 'High' ? "bg-red-500 text-white" :
                                            stat.load === 'Medium' ? "bg-amber-500 text-white" :
                                                "bg-emerald-500 text-white"
                                    )}>
                                        {stat.load} Load
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold">{stat.name}</h3>
                                <p className="text-sm text-slate-500">Counter 0{index + 1} • {stat.status}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Token</p>
                                        <p className="text-3xl font-black text-slate-800 dark:text-slate-100 italic">#{stat.currentInRoom}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Waiting</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{stat.waitingCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <Clock className="h-4 w-4 text-primary-500" />
                                    <p className="text-sm font-medium">Expected Wait: <span className="text-primary-600 dark:text-primary-400">{stat.waitingCount * stat.waitTime} - {stat.waitingCount * stat.waitTime + 10} mins</span></p>
                                </div>

                                <Link
                                    href="/explanation"
                                    className="flex items-center justify-center p-3 text-xs font-bold text-slate-400 hover:text-primary-600 border border-slate-100 dark:border-slate-800 rounded-xl transition-colors group"
                                >
                                    HOW DO WE CALCULATE THIS?
                                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-20 p-10 glass-card rounded-[3rem] text-center max-w-3xl mx-auto border-dashed">
                <HelpCircle className="h-12 w-12 text-primary-200 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Don't have a token yet?</h3>
                <p className="text-slate-500 mb-8">
                    Get your token now and skip the wait. It only takes 30 seconds!
                </p>
                <Link href="/quick-token" className="btn-primary inline-flex items-center">
                    Get Quick Token Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
        </div>
    );
}
