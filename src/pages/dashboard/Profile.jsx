import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Hash, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.displayName) {
        setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            displayName: displayName
        });
        toast.success("Profile updated successfully!");
        // Note: Global context listener might not update immediately if it only listens to Auth state. 
        // In a full prod app, we'd also reload the context or use onSnapshot for the user doc.
    } catch (error) {
        console.error("Update error:", error);
        toast.error("Failed to update profile.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400 font-light">Manage your institutional account settings and personal details.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <form onSubmit={handleSave} className="space-y-6">
            
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-white/10 focus:border-neon-cyan/50 text-white rounded-xl py-3 pl-12 pr-4 outline-none transition-all focus:ring-1 focus:ring-neon-cyan/50 shadow-inner"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
            </div>

            {/* Read-only Auth Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Mail size={12}/> Account Email
                  </label>
                  <p className="w-full bg-dark-bg/80 border border-white/5 text-gray-400 rounded-xl py-3 px-4 cursor-not-allowed">
                      {currentUser?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Hash size={12}/> Firebase UID
                  </label>
                  <p className="w-full bg-dark-bg/80 border border-white/5 text-gray-400 rounded-xl py-3 px-4 font-mono text-sm cursor-not-allowed truncate">
                      {currentUser?.uid}
                  </p>
                </div>
            </div>
            
            <div className="pt-4 flex items-center gap-4">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="py-3 px-6 rounded-xl bg-neon-blue/10 text-neon-cyan font-semibold border border-neon-blue/30 hover:bg-neon-blue/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : <><Save size={18}/> Save Changes</>}
                </button>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle size={14}/> Changes sync to Firestore instantly
                </p>
            </div>
        </form>
      </div>
    </motion.div>
  );
}
