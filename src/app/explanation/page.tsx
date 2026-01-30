"use client";

import { motion } from 'framer-motion';
import {
    BrainCircuit,
    Clock,
    Users,
    Zap,
    ShieldCheck,
    HeartPulse,
    Info,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ExplanationPage() {
    const factors = [
        {
            icon: Users,
            title: "Current Queue Length",
            description: "We look at the total number of patients currently waiting for the same service.",
            weight: "High Influence"
        },
        {
            icon: Clock,
            title: "Average Service Time",
            description: "Calculated based on the average time spent by recent patients in the consultation room.",
            weight: "Real-time Data"
        },
        {
            icon: Zap,
            title: "Active Counters",
            description: "The number of staff members currently attending to patients. More counters mean faster service.",
            weight: "Variable"
        },
        {
            icon: HeartPulse,
            title: "Priority Adjustments",
            description: "Senior citizens and emergency cases are prioritized, which may slightly shift positions for others.",
            weight: "Inclusive Logic"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center space-x-2 text-primary-600 font-bold mb-4">
                    <BrainCircuit className="h-6 w-6" />
                    <span className="uppercase tracking-widest text-sm">Transparency Protocol</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-6">How We Calculate <br /><span className="text-primary-600">Your Wait Time</span></h1>
                <p className="text-lg text-slate-500">
                    At HealthPoint, we believe in radical transparency. Our system uses a multi-factor logic to give you the most accurate prediction possible.
                </p>
            </motion.div>

            <div className="space-y-6 mb-16">
                {factors.map((factor, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-8 rounded-[2rem] flex flex-col md:flex-row gap-6 items-start md:items-center"
                    >
                        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl text-primary-600">
                            <factor.icon className="h-8 w-8" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold">{factor.title}</h3>
                                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter">
                                    {factor.weight}
                                </span>
                            </div>
                            <p className="text-slate-500">{factor.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-blue-600 rounded-[3rem] p-12 text-white text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-6 text-blue-200" />
                <h2 className="text-3xl font-bold mb-4">Commitment to Fairness</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                    Our algorithm ensures every patient is served efficiently. No special shortcuts—just smart, data-driven healthcare management.
                </p>
                <Link href="/quick-token" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold transition-all inline-flex items-center">
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
            </div>

            <div className="mt-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Info className="h-4 w-4" />
                HealthPoint Engine Version 1.2.0 • Last sync: Just now
            </div>
        </div>
    );
}
