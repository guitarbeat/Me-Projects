import { useAuth } from '@/contexts/AuthContext';

export const useProfile = () => {
  const { profile, loading, refreshProfile } = useAuth();

  return {
    profile,
    loading,
    refreshProfile,
  };
};
