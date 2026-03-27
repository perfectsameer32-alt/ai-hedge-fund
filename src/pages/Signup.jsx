import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create the user document in Firestore to store additional data
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        // mock initial portfolio values for dashboard
        portfolioValue: 100000, 
        role: "client"
      });

      console.log("Successfully created account!");
      toast.success("Account created successfully!");
      navigate('/dashboard');
    } catch(err) {
      console.error("Signup Error:", err);
      toast.error('Failed to sign up: ' + err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <PageTransition className="pt-24 pb-12 min-h-screen flex items-center justify-center relative">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-md relative z-10 mx-4"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-dark-bg/60 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan"></div>
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-dark-bg border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <ShieldCheck className="w-8 h-8 text-neon-purple" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm font-light">Institutional Client Registration</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-neon-cyan transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-white/10 focus:border-neon-cyan/50 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all focus:ring-1 focus:ring-neon-cyan/50 shadow-inner"
                  placeholder="name@institution.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Security Key (Password)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-neon-purple transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-white/10 focus:border-neon-purple/50 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all focus:ring-1 focus:ring-neon-purple/50 shadow-inner"
                  placeholder="••••••••••••"
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full relative py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-dark-bg font-bold text-md hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </div>
              ) : (
                <>
                  <span className="relative z-10">Create Account</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-gray-500 text-xs font-light">
              Already have an account?{' '}
              <Link to="/access" className="text-neon-purple hover:text-neon-cyan transition-colors underline underline-offset-4">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
