import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { API_URL } from '@env';
import { Alert } from 'react-native';

const useQueue = () => {
  const [pendingCount, setPendingCount] = useState(0);

  const loadQueue = async () => {
    try {
      const queue = await AsyncStorage.getItem('pendingEntries');
      const parsed = queue ? JSON.parse(queue) : [];
      setPendingCount(parsed.length);
    } catch (error) {
      console.warn('Load Queue Error:', error);
    }
  };

  const enqueueEntry = async entry => {
    try {
      const queue = await AsyncStorage.getItem('pendingEntries');
      const parsed = queue ? JSON.parse(queue) : [];
      parsed.push(entry);
      await AsyncStorage.setItem('pendingEntries', JSON.stringify(parsed));
      setPendingCount(parsed.length);
    } catch (error) {
      console.warn('Enqueue Error:', error);
    }
  };

  const syncQueue = async () => {
    try {
      const queue = await AsyncStorage.getItem('pendingEntries');
      if (!queue) return;
      const parsed = JSON.parse(queue);
      if (!parsed.length) return;

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No token found for sync');
        return;
      }

      const updatedQueue = [];
      for (let i = 0; i < parsed.length; i++) {
        const entry = parsed[i];
        // Skip and remove entries with coords: null
        if (!entry.coords) {
          console.log(`Removed entry ${entry.id} due to missing coordinates`);
          continue; // Skip to next entry
        }

        try {
          const formData = new FormData();
          Object.keys(entry.form).forEach(k => formData.append(k, entry.form[k]));
          entry.uploads.forEach(u => {
            const uriParts = u.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('uploads', {
              uri: u.uri,
              name: `${u.name}.${fileType}`,
              type: `image/${fileType}`,
            });
          });
          // Safe access with fallback for coords
          formData.append('latitude', entry.coords?.latitude || '');
          formData.append('longitude', entry.coords?.longitude || '');
          formData.append('accuracy', entry.coords?.accuracy || '');
          formData.append('routeId', entry.routeId);

          const res = await axios.post(`${API_URL}/api/entry`, formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          });

          if (res.data.success) {
            console.log(`Synced entry ${entry.id} successfully`);
            Alert.alert('Entry Synced', `Entry ${entry.id} synced successfully.`);
            // Don't add to updatedQueue (effectively removes it)
          } else {
            console.warn(`Sync failed for entry ${entry.id}:`, res.data.message);
            updatedQueue.push(entry); // Keep in queue if failed
          }
        } catch (error) {
          console.warn('Sync Queue Error:', error.message, 'Entry ID:', entry.id);
          updatedQueue.push(entry); // Keep in queue if error
        }
      }

      // Update AsyncStorage with remaining entries
      await AsyncStorage.setItem('pendingEntries', JSON.stringify(updatedQueue));
      setPendingCount(updatedQueue.length);
    } catch (error) {
      console.warn('Sync Queue Error:', error.message);
    }
  };

  useEffect(() => {
    loadQueue();
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  return { enqueueEntry, pendingCount };
};

export default useQueue;