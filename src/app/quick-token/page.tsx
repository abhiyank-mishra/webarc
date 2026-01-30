"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HospitalServices } from '@/lib/services';
import {
    Activity,
    ArrowLeft,
    CheckCircle,
    Clock,
    Stethoscope,
    Baby,
    Ear,
    Bone,
    HeartPulse,
    Beaker
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const IconMap: any = {
    Stethoscope,
    Baby,
    Ear,
    Bone,
    HeartPulse,
    Beaker
};

export default function EmergencyTokenPage() {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [isPriority, setIsPriority] = useState(false);
    const [tokenData, setTokenData] = useState<any>(null);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('hp_current_token');
            if (saved) {
                setTokenData(JSON.parse(saved));
                setStep(3);
            }
        }
    }, []);

    const handleGenerateToken = async () => {
        try {
            // Import Firestore functions
            const { db } = await import('@/lib/firebase');
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

            // Generate token data
            const tokenNumber = `${selectedService.id.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
            const position = Math.floor(Math.random() * 10) + 1;
            const waitTime = isPriority ? Math.floor(selectedService.waitTime / 2) : 20 + (position * selectedService.waitTime);

            const newToken = {
                number: tokenNumber,
                position,
                expectedTime: waitTime,
                serviceName: selectedService.name,
                serviceId: selectedService.id,
                isPriority,
                status: 'waiting', // waiting, called, completed
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: serverTimestamp(),
            };

            // Save to Firestore
            await addDoc(collection(db, 'tokens'), newToken);

            setTokenData(newToken);
            if (typeof window !== 'undefined') {
                localStorage.setItem('hp_current_token', JSON.stringify(newToken));
            }
            setStep(3);
        } catch (error) {
            console.error('Error generating token:', error);
            alert('Failed to generate token. Please try again.');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                    {/* Step 1: Select Service */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h1 className="text-3xl font-bold mb-2">Emergency Department Select</h1>
                                <p className="text-slate-500">Pick a department for immediate emergency token generation.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {HospitalServices.map((service) => {
                                    const Icon = IconMap[service.type] || Stethoscope;
                                    return (
                                        <button
                                            key={service.id}
                                            onClick={() => {
                                                setSelectedService(service);
                                                setStep(2);
                                            }}
                                            className="p-6 text-left glass-card hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group rounded-3xl"
                                        >
                                            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-2xl w-fit mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-bold text-lg">{service.name}</h3>
                                            <p className="text-sm text-slate-500 mt-1">Usually takes {service.waitTime} minutes</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Priority Selection */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card p-10 rounded-3xl text-center space-y-8 relative"
                        >
                            <button
                                onClick={() => setStep(1)}
                                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
                                aria-label="Back"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>

                            <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold mb-2">Almost Done!</h2>
                                <p className="text-slate-500">You selected {selectedService.name}. Just one more step.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-primary-200 transition-all select-none">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        checked={isPriority}
                                        onChange={(e) => setIsPriority(e.target.checked)}
                                    />
                                    <div className="ml-4 text-left">
                                        <p className="font-bold text-red-600">This is a Critical Emergency</p>
                                        <p className="text-sm text-slate-500">Life-threatening or severe condition</p>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handleGenerateToken}
                                className="btn-emergency w-full py-4 text-lg"
                            >
                                Generate Emergency Token
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Success & Token Card */}
                    {step === 3 && tokenData && (
                        <motion.div
                            key="step3"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-2">You're All Set!</h2>
                                <p className="text-slate-500">Save this screen or show the QR code at the counter.</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800">
                                <div className="bg-red-600 p-8 text-center text-white">
                                    <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-2">Token Number</p>
                                    <h3 className="text-6xl font-black tracking-tighter">{tokenData.number}</h3>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                        <div className="text-center flex-1">
                                            <p className="text-slate-400 text-xs uppercase mb-1">Position</p>
                                            <p className="text-2xl font-bold">{tokenData.position}</p>
                                        </div>
                                        <div className="w-px bg-slate-100 dark:bg-slate-800 h-10 self-center"></div>
                                        <div className="text-center flex-1">
                                            <p className="text-slate-400 text-xs uppercase mb-1">Wait Time</p>
                                            <p className="text-2xl font-bold text-primary-500">~{tokenData.expectedTime}m</p>
                                        </div>
                                        <div className="w-px bg-slate-100 dark:bg-slate-800 h-10 self-center"></div>
                                        <div className="text-center flex-1">
                                            <p className="text-slate-400 text-xs uppercase mb-1">Issued At</p>
                                            <p className="text-2xl font-bold">{tokenData.timestamp}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <QRCodeSVG
                                                value={JSON.stringify({ t: tokenData.number, s: tokenData.serviceName })}
                                                size={180}
                                                level="H"
                                            />
                                        </div>
                                        <p className="mt-4 text-xs text-slate-400 font-medium tracking-wide">SCAN AT COUNTER UPON ARRIVAL</p>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start space-x-3">
                                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Live Updates</p>
                                            <p className="text-xs text-blue-800/70 dark:text-blue-400/70">Your wait time updates automatically as the queue moves.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Link href="/check-status" className="btn-secondary w-full text-center">
                                    Track Live Status
                                </Link>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-slate-500 text-sm hover:underline"
                                >
                                    Apply for another service
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
