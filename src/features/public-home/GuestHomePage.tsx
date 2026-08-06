import React from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';

export default function GuestHomePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-32">
          <div className="container mx-auto px-4 max-w-[1200px] text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Welcome to <span className="text-brand-normal">MindHub</span>
            </h1>
            <p className="text-lg lg:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
              Your platform for continuous learning and growth. Explore courses, connect with top instructors, and advance your career today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link 
                to="/explore" 
                className="px-6 py-3 bg-brand-normal text-white rounded-lg font-medium hover:bg-brand-normal/90 transition-colors"
              >
                Explore Courses
              </Link>
              <Link 
                to="/login" 
                className="px-6 py-3 bg-background border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights (Placeholder) */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-2xl border border-border text-center">
                <div className="w-12 h-12 bg-brand-normal/10 text-brand-normal rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                  🎓
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Instructors</h3>
                <p className="text-foreground/70">Learn from industry professionals with real-world experience.</p>
              </div>
              <div className="p-6 bg-card rounded-2xl border border-border text-center">
                <div className="w-12 h-12 bg-brand-normal/10 text-brand-normal rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                  🚀
                </div>
                <h3 className="text-xl font-bold mb-2">Career Growth</h3>
                <p className="text-foreground/70">Build skills that matter and advance in your professional journey.</p>
              </div>
              <div className="p-6 bg-card rounded-2xl border border-border text-center">
                <div className="w-12 h-12 bg-brand-normal/10 text-brand-normal rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
                  🤝
                </div>
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-foreground/70">Connect with peers, ask questions, and learn together.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
