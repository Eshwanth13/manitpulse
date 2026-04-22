import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifySuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      login(token);
      setTimeout(() => {
        navigate('/post');
      }, 2500);
    }
  }, [token, login, navigate]);

  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-standard p-12 space-y-10"
      >
        <div className="w-24 h-24 bg-brand-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-brand animate-in zoom-in duration-500">
          <CheckCircle2 size={56} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black outfit text-neutral-900 dark:text-white tracking-tight">Access Granted.</h2>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            Your university identity is verified. You now have anonymous immunity for the next 30 days.
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-3 pt-6 border-t border-neutral-50 dark:border-neutral-700/50">
          <Loader2 className="animate-spin text-brand-600 dark:text-brand-400" size={24} />
          <p className="text-[10px] font-black text-neutral-300 dark:text-neutral-600 uppercase tracking-[0.3em]">Syncing Encrypted Identity...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifySuccess;
