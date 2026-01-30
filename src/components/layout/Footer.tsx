import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <Activity className="h-6 w-6 text-primary-600" />
                            <span className="text-xl font-bold">HealthPoint</span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
                            Smart queue intelligence for modern healthcare. Reducing wait times and improving patient care through data-driven decisions.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Services</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/quick-token" className="hover:text-primary-600">Quick Token</Link></li>
                            <li><Link href="/book" className="hover:text-primary-600">Book Appointment</Link></li>
                            <li><Link href="/check-status" className="hover:text-primary-600">Live Queue</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-primary-600">Accessibility</Link></li>
                            <li><Link href="#" className="hover:text-primary-600">Offline Guide</Link></li>
                            <li><Link href="/admin" className="hover:text-primary-600">Staff Portal</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} HealthPoint Queue Intelligence. Built for Accessibility.</p>
                    <div className="mt-4 md:mt-0 flex space-x-6">
                        <Link href="#">Privacy Policy</Link>
                        <Link href="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
