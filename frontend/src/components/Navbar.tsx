import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'AI System', href: '#ai-system' },
  { name: 'Communities', href: '#communities' },
  { name: 'Research', href: '#research' },
  { name: 'About', href: '#about' },
];

export const Navbar = ({ onOpenAuth }: { onOpenAuth: (tab: 'login' | 'register') => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-l border-r rounded-b-[24px] md:rounded-b-[32px] ease-out',
        scrolled
          ? 'bg-slate-950/85 backdrop-blur-lg border-primary/25 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)]'
          : 'bg-slate-950/30 backdrop-blur-md border-white/5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-primary/30 group-hover:border-primary/50 transition-colors overflow-hidden">
            <img src="/logo.png" className="w-full h-full object-cover rounded-xl relative z-10" alt="UniMind Logo" />
            <div className="absolute inset-0 bg-primary-glow/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-bold font-poppins tracking-wider text-slate-100">
            Uni<span className="text-gradient">Mind</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white hover:text-shadow-glow transition-all"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => onOpenAuth('login')}
            className="px-5 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => onOpenAuth('register')}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary-glow shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(96,165,250,0.6)] transition-all transform hover:-translate-y-0.5"
          >
            Join Beta
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/90 backdrop-blur-xl rounded-b-[24px] border-t border-white/5"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/10 my-2" />
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                  className="px-5 py-3 rounded-lg text-sm font-semibold bg-white/5 text-slate-200 hover:bg-white/10"
                >
                  Login
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                  className="px-5 py-3 text-sm font-semibold text-white rounded-lg bg-primary shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                >
                  Join Beta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
