import { useAuth as useAuthContext } from '@/context/AuthContext';

// Shim to maintain compatibility where useAuth is imported from hooks
export const useAuth = () => {
  return useAuthContext();
};
