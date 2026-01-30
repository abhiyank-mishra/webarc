"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HospitalServices } from '@/lib/services';
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

const slots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

export default function BookingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [formData, setFormData] = useState({
        serviceId: '',
        date: new Date().toISOString().split('T')[0],
        slot: '',
        name: '',
        phone: ''
    });
    const [randomSlots, setRandomSlots] = useState<Record<string, number>>({});

    useEffect(() => {
        const slots: Record<string, number> = {};
        HospitalServices.forEach(s => {
            slots[s.id] = Math.floor(Math.random() * 5) + 3;
        });
        setRandomSlots(slots);
    }, []);

    const selectedService = HospitalServices.find(s => s.id === formData.serviceId);

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-4">Book Your Appointment</h1>
                <p className="text-slate-500">Choose a department, pick a time, and you're done!</p>
                <div className="flex justify-center items-center gap-4 mt-6">
                    <div className={cn("h-2 w-12 rounded-full transition-colors", step >= 1 ? "bg-primary-600" : "bg-slate-200")} />
                    <div className={cn("h-2 w-12 rounded-full transition-colors", step >= 2 ? "bg-primary-600" : "bg-slate-200")} />
                    <div className={cn("h-2 w-12 rounded-full transition-colors", step >= 3 ? "bg-primary-600" : "bg-slate-200")} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <h2 className="text-2xl font-bold text-center mb-6">Which department do you need?</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {HospitalServices.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => {
                                        setFormData({ ...formData, serviceId: service.id });
                                        setStep(2);
                                    }}
                                    className={cn(
                                        "p-6 text-left glass-card border-2 transition-all rounded-3xl",
                                        formData.serviceId === service.id ? "border-primary-600 bg-primary-50/50" : "border-transparent"
                                    )}
                                >
                                    <h3 className="font-bold text-lg">{service.name}</h3>
                                    <p className="text-sm text-slate-500">Available slots: {randomSlots[service.id] || '--'}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="glass-card p-8 rounded-[2rem]">
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Date</label>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {[0, 1, 2, 3, 4].map((i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + i);
                                        const isSelected = d.toISOString().split('T')[0] === formData.date;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setFormData({ ...formData, date: d.toISOString().split('T')[0] })}
                                                className={cn(
                                                    "flex-shrink-0 w-24 p-4 rounded-2xl flex flex-col items-center transition-all",
                                                    isSelected ? "bg-primary-600 text-white shadow-xl scale-105" : "bg-slate-50 dark:bg-slate-800 text-slate-500"
                                                )}
                                            >
                                                <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString([], { weekday: 'short' })}</span>
                                                <span className="text-2xl font-black">{d.getDate()}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Time Slot</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {slots.map((slot) => {
                                        const isSelected = formData.slot === slot;
                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => setFormData({ ...formData, slot })}
                                                className={cn(
                                                    "py-3 rounded-xl text-sm font-bold transition-all border",
                                                    isSelected ? "bg-primary-600 text-white border-primary-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300"
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-between mt-12">
                                <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </button>
                                <button
                                    disabled={!formData.slot}
                                    onClick={() => setStep(3)}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                >
                                    Continue <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="glass-card p-10 rounded-[3rem] text-center space-y-8">
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-[2rem]">
                                <h3 className="text-2xl font-black mb-2">{formData.slot}</h3>
                                <p className="text-primary-600 font-bold">{new Date(formData.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                <p className="text-slate-500 text-sm mt-1">{selectedService?.name}</p>
                            </div>

                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter patient name"
                                        className="input-field mt-1"
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Mobile Number</label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        placeholder="Enter your 10-digit mobile number"
                                        className="input-field mt-1"
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                            if (value.length <= 10) {
                                                setFormData({ ...formData, phone: value });
                                            }
                                        }}
                                        value={formData.phone}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={!formData.name || formData.phone.length !== 10}
                                onClick={async () => {
                                    // Check if user is authenticated
                                    if (!user) {
                                        router.push('/login?redirect=/book');
                                        return;
                                    }

                                    try {
                                        const { db } = await import('@/lib/firebase');
                                        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

                                        await addDoc(collection(db, 'appointments'), {
                                            ...formData,
                                            serviceName: selectedService?.name,
                                            userId: user.uid,
                                            userEmail: user.email,
                                            status: 'confirmed',
                                            createdAt: serverTimestamp(),
                                        });

                                        setStep(4);
                                    } catch (error) {
                                        console.error('Error booking appointment:', error);
                                        alert('Failed to book appointment. Please try again.');
                                    }
                                }}
                                className="btn-primary w-full py-5 text-xl disabled:opacity-50"
                            >
                                Confirm Appointment
                            </button>

                            <button onClick={() => setStep(2)} className="text-slate-400 text-sm hover:underline">
                                Change time or date
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md mx-auto text-center space-y-8"
                    >
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto scale-110">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black mb-2">Booking Confirmed!</h2>
                            <p className="text-slate-500">Your appointment request has been received.</p>
                        </div>

                        <div className="glass-card p-8 rounded-[2rem] border-emerald-500/20 bg-emerald-50/10">
                            <div className="flex items-start gap-4 text-left">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-xl">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient</p>
                                    <p className="font-black text-lg">{formData.name}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-start gap-4 text-left">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-xl">
                                    <Clock className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time & Date</p>
                                    <p className="font-black text-lg">{formData.slot}, {new Date(formData.date).getDate()} {new Date(formData.date).toLocaleDateString([], { month: 'short' })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex items-start space-x-3 text-left">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                                Please arrive 15 minutes before your slot. Your token will be automatically prioritized upon arrival.
                            </p>
                        </div>

                        <Link href="/" className="btn-primary block w-full">
                            Back to Home
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
