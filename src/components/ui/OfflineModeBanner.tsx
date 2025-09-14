import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { isOfflineModeEnabled } from '../../lib/supabase';

const OfflineModeBanner: React.FC = () => {
  if (!isOfflineModeEnabled) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-yellow-50 border-b border-yellow-200 px-4 py-2"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-yellow-800">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">
          🚧 Running in DEMO/OFFLINE mode - Supabase features disabled
        </span>
        <span className="text-xs text-yellow-600">
          (Set up real Supabase credentials to enable full functionality)
        </span>
      </div>
    </motion.div>
  );
};

export default OfflineModeBanner;

