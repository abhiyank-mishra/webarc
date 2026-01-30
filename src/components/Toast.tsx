'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    type?: 'success' | 'error' | 'info';
}

export function Toast({ message, isVisible, onClose, type = 'success' }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: 50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, x: 20 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4 min-w-[320px]">
                        <div className={`p-2 rounded-xl ${
                            type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                            type === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                            'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                        }`}>
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                {type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Info'}
                            </h3>
                            <p className="text-sm text-slate-500">{message}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
