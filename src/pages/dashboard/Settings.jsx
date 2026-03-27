import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Settings() {
  const { currentUser } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
    }
    if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    setIsUpdating(true);
    try {
        await updatePassword(currentUser, newPassword);
        toast.success("Security key updated successfully!");
        setNewPassword('');
        setConfirmPassword('');
    } catch (error) {
        console.error("Password update error:", error);
        // Firebase requires users to be 'recently authenticated' to change password
        if(error.code === 'auth/requires-recent-login') {
            toast.error("Please log out and log back in to verify your identity before changing your password.");
        } else {
            toast.error("Failed to update password: " + error.message);
        }
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Security Settings</h1>
        <p className="text-gray-400 font-light">Manage your cryptographic keys and authentication settings.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-purple/20 blur-3xl rounded-full pointer-events-none"></div>

        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="text-neon-purple" size={20}/>
            Update Security Key
        </h3>

        <form onSubmit={handlePasswordUpdate} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">New Security Key</label>
              <div className="relative group">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-white/10 focus:border-neon-purple/50 text-white rounded-xl py-3 px-4 outline-none transition-all focus:ring-1 focus:ring-neon-purple/50 shadow-inner"
                  placeholder="Enter new 6+ char password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Confirm Key</label>
              <div className="relative group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-white/10 focus:border-neon-purple/50 text-white rounded-xl py-3 px-4 outline-none transition-all focus:ring-1 focus:ring-neon-purple/50 shadow-inner"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-gray-500 flex items-center gap-1 w-2/3">
                    <ShieldAlert size={14} className="text-orange-400 flex-shrink-0"/> 
                    Changing your password may require you to re-authenticate on other devices.
                </p>
                <button
                    type="submit"
                    disabled={isUpdating}
                    className="py-2.5 px-6 rounded-xl bg-neon-purple text-dark-bg font-bold hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50"
                >
                    {isUpdating ? "Updating..." : "Update Key"}
                </button>
            </div>
        </form>
      </div>
    </motion.div>
  );
}
