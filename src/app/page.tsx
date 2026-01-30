import { ArrowRight, Clock, Users, ShieldCheck, Zap, HeartPulse, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Next-Gen Patient Experience
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Skip the Wait, <br />
              <span className="gradient-text">Own Your Time.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Smart queue intelligence for HealthPoint hospitals. Designed for real people, ensuring minimal crowds and transparent waiting times.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/quick-token" className="btn-primary flex items-center group w-full sm:w-auto justify-center">
                Get Quick Token
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/check-status" className="btn-secondary w-full sm:w-auto">
                Live Queue Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Accessibility first */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simpler than a Smartphone App</h2>
            <p className="text-slate-500">Fast, inclusive, and transparent booking for everyone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                <Zap className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Select Service</h3>
              <p className="text-slate-500 text-sm">Pick the department or service you need help with. One tap logic.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:-rotate-6 transition-transform">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Instant Token</h3>
              <p className="text-slate-500 text-sm">Get your digital token and QR code instantly. No signup required.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Wait Smarter</h3>
              <p className="text-slate-500 text-sm">Watch live updates and get an accurate wait time prediction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-3xl">
              <BrainCircuit className="h-8 w-8 text-primary-500 mb-4" />
              <h4 className="font-bold mb-2">Predictive Logic</h4>
              <p className="text-sm text-slate-500">Real-time algorithms calculate wait times based on live staff activity.</p>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <HeartPulse className="h-8 w-8 text-secondary mb-4" />
              <h4 className="font-bold mb-2">Priority Check</h4>
              <p className="text-sm text-slate-500">Automated prioritization for senior citizens and emergency cases.</p>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <Users className="h-8 w-8 text-accent mb-4" />
              <h4 className="font-bold mb-2">Public Kiosk</h4>
              <p className="text-sm text-slate-500">Large-screen friendly interface for public displays and counters.</p>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <Zap className="h-8 w-8 text-purple-500 mb-4" />
              <h4 className="font-bold mb-2">Offline Ready</h4>
              <p className="text-sm text-slate-500">Cached status ensures you never lose your token even without internet.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
