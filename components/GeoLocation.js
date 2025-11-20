import React, { useEffect, useRef, useState, createContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useQueue from '../hooks/useQueue';
import { API_URL, GOOGLE_API_KEY } from '@env';

export const LocationContext = createContext();

export default function GeoLocation() {
  const mapRef = useRef(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [liveCoords, setLiveCoords] = useState(null);
  const [canStart, setCanStart] = useState(false);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const navigation = useNavigation();
  const { pendingCount } = useQueue();
  const watchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const suggAbortRef = useRef(null);

  const mapRouteShape = (routeDoc) => {
    if (!routeDoc) return null;

    const pickCoords = (obj) => {
      if (!obj) return null;
      const lat = obj.latitude ?? obj.lat ?? null;
      const lng = obj.longitude ?? obj.lng ?? null;
      if (lat == null || lng == null) return null;
      return { latitude: Number(lat), longitude: Number(lng) };
    };

    const start =
      pickCoords(routeDoc.startLocation) ||
      pickCoords(routeDoc.startCoords) ||
      pickCoords(routeDoc.start) ||
      null;

    const end =
      pickCoords(routeDoc.endLocation) ||
      pickCoords(routeDoc.endCoords) ||
      pickCoords(routeDoc.end) ||
      null;

    let poly = [];
    if (Array.isArray(routeDoc.routeCoords) && routeDoc.routeCoords.length > 0) {
      poly = routeDoc.routeCoords
        .map(p => {
          const lat = p.latitude ?? p.lat ?? null;
          const lng = p.longitude ?? p.lng ?? null;
          if (lat == null || lng == null) return null;
          return { latitude: Number(lat), longitude: Number(lng) };
        })
        .filter(Boolean);
    }

    return {
      _id: routeDoc._id || routeDoc.id || null,
      name: routeDoc.name || routeDoc.routeName || '',
      startCoords: start,
      endCoords: end,
      routeCoords: poly,
      raw: routeDoc,
    };
  };

  // Get initial location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Location permission is required.');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCurrentCoords(coords);
        setLiveCoords(coords);
        setTimeout(() => {
          mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 300);
        }, 300);
      } catch (err) {
        console.warn('GeoLocation: init location error:', err);
      }
    })();

    return () => {
      if (watchRef.current && typeof watchRef.current.remove === 'function') {
        watchRef.current.remove();
      }
      if (suggAbortRef.current) suggAbortRef.current.abort?.();
    };
  }, []);

  // 🔹 Fetch assigned route
  useEffect(() => {
    let mounted = true;
    const fetchAssignedRoute = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);
        const userId = user._id || user.id || user.userId;
        if (!userId) return;

        const res = await fetch(`${API_URL}/api/routes/${userId}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();
        let routeDoc = Array.isArray(data.routes)
          ? data.routes[0]
          : data.route || (Array.isArray(data) ? data[0] : data);

        if (!routeDoc) {
          if (mounted) {
            setAssignedRoute(null);
            setRouteCoords([]);
          }
          return;
        }

        const mapped = mapRouteShape(routeDoc);
        if (mounted && mapped) {
          setAssignedRoute(mapped);
          setRouteCoords(mapped.routeCoords || []);
          if (mapped.startCoords && mapRef.current) {
            setTimeout(() => {
              mapRef.current.animateToRegion(
                { ...mapped.startCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                350
              );
            }, 350);
          }
        }
      } catch (err) {
        console.warn('GeoLocation: Failed to fetch assigned route:', err.message);
        if (mounted) {
          setAssignedRoute(null);
          setRouteCoords([]);
        }
      }
    };
    fetchAssignedRoute();
    return () => { mounted = false; };
  }, []);

  // 🔹 Auto start watching position (no buttons)
  useEffect(() => {
    let watcher = null;
    const startAutoWatch = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;

        watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, timeInterval: 2000, distanceInterval: 1 },
          loc => {
            const live = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setLiveCoords(live);

            if (assignedRoute?.startCoords) {
              const dist = getDistanceMeters(live, assignedRoute.startCoords);
              if (dist <= 50 && !canStart) setCanStart(true); // 🔸 changed 10 → 50
              else if (dist > 50 && canStart) setCanStart(false);
            }
          }
        );
        watchRef.current = watcher;
      } catch (err) {
        console.warn('GeoLocation: auto watch error:', err);
      }
    };
    startAutoWatch();

    return () => {
      if (watcher && typeof watcher.remove === 'function') watcher.remove();
    };
  }, [assignedRoute]);

  const getDistanceMeters = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = d => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const aa =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  const toFixed = p => (p ? `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}` : '—');

  return (
    <LocationContext.Provider value={{ liveCoords, routeId: assignedRoute?._id }}>
      <View style={styles.wrap}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#666" style={{ marginHorizontal: 8 }} />
          <TextInput
            placeholder="Search location"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        {Array.isArray(suggestions) && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={i => i.place_id || Math.random().toString()}
            style={styles.suggestions}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem}>
                <Text style={{ fontWeight: '600' }}>
                  {item?.structured_formatting?.main_text ?? item?.description ?? 'Unknown'}
                </Text>
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {item?.structured_formatting?.secondary_text ?? ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation
          initialRegion={{
            latitude: currentCoords?.latitude ?? 20.5937,
            longitude: currentCoords?.longitude ?? 78.9629,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }}
        >
          {assignedRoute?.startCoords && (
            <Marker coordinate={assignedRoute.startCoords} pinColor="green" title="Start" />
          )}
          {assignedRoute?.endCoords && (
            <Marker coordinate={assignedRoute.endCoords} pinColor="red" title="End" />
          )}
          {routeCoords && routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#2f6fff" />
          )}
        </MapView>

        <View style={styles.info}>
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>{pendingCount} Pending Sync</Text>
            </View>
          )}

          {assignedRoute && (
            <Text style={[styles.infoRow, { fontWeight: 'bold', color: '#007AFF' }]}>
              Route: {assignedRoute.name}
            </Text>
          )}

          <Text style={styles.infoRow}>
            <Text style={styles.infoTitle}>Current:</Text> {toFixed(liveCoords ?? currentCoords)}
          </Text>

          <Text style={styles.infoRow}>
            <Text style={styles.infoTitle}>Start: </Text>
            {assignedRoute?.startCoords
              ? `lat: ${assignedRoute.startCoords.latitude.toFixed(6)}, long: ${assignedRoute.startCoords.longitude.toFixed(6)}`
              : 'NA'}
          </Text>

          <Text style={styles.infoRow}>
            <Text style={styles.infoTitle}>End: </Text>
            {assignedRoute?.endCoords
              ? `lat: ${assignedRoute.endCoords.latitude.toFixed(6)}, long: ${assignedRoute.endCoords.longitude.toFixed(6)}`
              : 'NA'}
          </Text>

          {assignedRoute && canStart && (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => navigation.navigate('EntryData', { routeId: assignedRoute._id })}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>You can Start</Text>
            </TouchableOpacity>
          )}

          {!assignedRoute && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
              No route assigned by admin yet.
            </Text>
          )}
        </View>
      </View>
    </LocationContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#f7f7f7', marginTop: 40, marginBottom: 10 },
  searchInput: { flex: 1, padding: 8, backgroundColor: '#fff', borderRadius: 8 },
  suggestions: { maxHeight: 150, backgroundColor: '#fff' },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  map: { flex: 1, marginBottom: 10 },
  info: { padding: 12, marginBottom: 20 },
  infoRow: { marginVertical: 2 },
  infoTitle: { fontWeight: '600' },
  pendingBadge: { backgroundColor: '#FF9500', padding: 6, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  pendingText: { color: '#fff', fontWeight: 'bold' },
  startBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
});
