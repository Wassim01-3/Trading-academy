import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/integrations/api/client';

interface UserActivityStatus {
  userId: number;
  isActive: boolean;
  lastSeen: number | null;
  lastSeenFormatted: string | null;
}

export const useUserActivity = () => {
  const [userStatuses, setUserStatuses] = useState<Map<number, UserActivityStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Send heartbeat to server
  const sendHeartbeat = useCallback(async () => {
    try {
      await apiClient.sendHeartbeat();
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, []);

  // Fetch user statuses from server
  const fetchUserStatuses = useCallback(async () => {
    try {
      const response = await apiClient.getUserStatuses();
      if (response.data) {
        const statusMap = new Map<number, UserActivityStatus>();
        response.data.userStatuses.forEach(status => {
          statusMap.set(status.userId, status);
        });
        setUserStatuses(statusMap);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to fetch user statuses:', error);
      setIsConnected(false);
    }
  }, []);

  // Check if user is active
  const isUserActive = useCallback((userId: number): boolean => {
    const status = userStatuses.get(userId);
    return status?.isActive || false;
  }, [userStatuses]);

  // Get user's last seen time
  const getUserLastSeen = useCallback((userId: number): string | null => {
    const status = userStatuses.get(userId);
    return status?.lastSeenFormatted || null;
  }, [userStatuses]);

  // Start heartbeat interval
  useEffect(() => {
    const heartbeatInterval = setInterval(sendHeartbeat, 30000); // Send heartbeat every 30 seconds
    return () => clearInterval(heartbeatInterval);
  }, [sendHeartbeat]);

  // Start status polling
  useEffect(() => {
    const statusInterval = setInterval(fetchUserStatuses, 10000); // Fetch statuses every 10 seconds
    fetchUserStatuses(); // Initial fetch
    
    return () => clearInterval(statusInterval);
  }, [fetchUserStatuses]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop sending heartbeats
        setIsConnected(false);
      } else {
        // Page is visible, resume heartbeats
        setIsConnected(true);
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sendHeartbeat]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Send logout activity when user leaves
      apiClient.logoutActivity().catch(console.error);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    userStatuses,
    isConnected,
    isUserActive,
    getUserLastSeen,
    fetchUserStatuses,
    sendHeartbeat
  };
};
