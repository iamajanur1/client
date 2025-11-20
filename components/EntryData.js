import React, { useState, useEffect, useRef, useContext } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '@env';
import { LocationContext } from '../contexts/LocationContext';
import useQueue from '../hooks/useQueue';

export default function EntryData({ navigation, route }) {
  const [uploads, setUploads] = useState([]);
  const uploadsRef = useRef([]); // keep latest uploads accessible in async effects
  const [progress, setProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [routeProgress, setRouteProgress] = useState(60);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const intervalsRef = useRef({});
  const { liveCoords, routeId: ctxRouteId, locationStatus } = useContext(LocationContext);
  const { enqueueEntry, pendingCount } = useQueue();
  const isFocused = useIsFocused();

  // keep uploadsRef in sync
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  const [form, setForm] = useState({
    sex: '',
    age: '',
    colorCategory: '',
    colorSub: '',
    notch: '',
    remarks: '',
    marks: '',
    injury: '',
  });

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };


  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, []);

  const addUploadItem = async (uri, type = 'photo') => {
    try {
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const nameBase = type === 'photo' ? `Photo` : `File`;
      // use functional update so name uses the real current prev inside setter
      setUploads(prev => [...prev, { id, uri: compressed.uri, type, name: `${nameBase}_${prev.length + 1}` }]);
      setProgress(prev => ({ ...prev, [id]: 0 }));
      let percent = 0;
      const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 8) + 3;
        if (percent >= 100) percent = 100;
        setProgress(prev => ({ ...prev, [id]: percent }));
        if (percent >= 100) {
          clearInterval(interval);
          delete intervalsRef.current[id];
        }
      }, 120);
      intervalsRef.current[id] = interval;
    } catch (err) {
      console.warn('addUploadItem error', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const consumeCapturedImages = async () => {
      try {
        const raw = await AsyncStorage.getItem('pendingCapturedImages');
        if (!raw) return;
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr) || arr.length === 0) {
          await AsyncStorage.removeItem('pendingCapturedImages');
          return;
        }

        // Add each queued URI sequentially, but skip if already present (use uploadsRef)
        for (const uri of arr) {
          if (!uploadsRef.current.find(u => u.uri === uri)) {
            // await to keep order predictable
            // addUploadItem is async (uses ImageManipulator) so await is good
            // eslint-disable-next-line no-await-in-loop
            await addUploadItem(uri, 'photo');
          }
        }

        // clear queue after importing
        await AsyncStorage.removeItem('pendingCapturedImages');
      } catch (err) {
        console.warn('EntryData: error consuming captured images', err);
      }
    };

    if (isFocused && mounted) {
      consumeCapturedImages();
    }

    return () => { mounted = false; };
    // We intentionally _do not_ depend on uploads here: we use uploadsRef for latest state.
  }, [isFocused]);

  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission to access gallery is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        const unique = result.assets.filter(
          (a, i, s) => i === s.findIndex(x => x.uri === a.uri)
        );
        for (const asset of unique) {
          // sequential add
          // eslint-disable-next-line no-await-in-loop
          await addUploadItem(asset.uri, 'photo');
        }
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
      Alert.alert('Something went wrong while picking images.');
    }
  };

  const handleUpload = () => {
    Alert.alert('Upload Files', 'Choose upload option', [
      { text: 'Select from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCapture = () => navigation.navigate('CaptureScreen'); // CaptureScreen will push to AsyncStorage and goBack()

  const resetForm = () => {
    setForm({
      sex: '',
      age: '',
      colorCategory: '',
      colorSub: '',
      notch: '',
      remarks: '',
      marks: '',
      injury: '',
    });
    setUploads([]);
    setProgress({});
    setOverallProgress(0);
  };


  const handleSubmit = async () => {
    if (!form.sex || !form.age || !form.colorCategory || !form.marks || !form.injury) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }
    if (uploads.length === 0) {
      Alert.alert('Validation', 'Please upload or capture at least one photo.');
      return;
    }
    setIsLocationLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location to continue.');
        setIsLocationLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeout: 15000,
      });

      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 0,
      };

      // routeId: prefer context routeId (ctxRouteId) else fallback to navigation param
      const resolvedRouteId = ctxRouteId || route?.params?.routeId;
      if (!resolvedRouteId) {
        Alert.alert('Route Error', 'Route ID is missing. Please select a route.');
        setIsLocationLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User not logged in');
        setIsLocationLoading(false);
        return;
      }

      // Build FormData
      const formData = new FormData();
      Object.keys(form).forEach(k => formData.append(k, form[k]));
      uploads.forEach(u => {
        const uriParts = u.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('uploads', {
          uri: u.uri,
          name: `${u.name}.${fileType}`,
          type: `image/${fileType}`,
        });
      });
      formData.append('routeId', resolvedRouteId);
      formData.append('latitude', coords.latitude);
      formData.append('longitude', coords.longitude);
      formData.append('accuracy', coords.accuracy);

      const res = await axios.post(`${API_URL}/api/entry`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: e => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setOverallProgress(pct);
          setProgress(prev => {
            const updated = { ...prev };
            uploads.forEach(u => (updated[u.id] = pct));
            return updated;
          });
        },
      });

      if (res.data.success) {
        Alert.alert('Success', 'Entry submitted successfully with location!');
        resetForm();
      } else {
        throw new Error(res.data.message || 'Failed to submit entry');
      }
    } catch (error) {
      console.error('Submit Error:', error?.message ?? error);
      Alert.alert('Submit Error', error?.message || 'Failed to submit entry');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const RadioGroup = ({ label, options, selected, onSelect }) => (
    <View style={styles.radioGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.radioRow}>
        {options.map(opt => (
          <Pressable
            key={opt}
            style={styles.radioOption}
            onPress={() => onSelect(opt)}
          >
            <View
              style={[
                styles.radioCircle,
                selected === opt && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioText}>{opt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const ColorSelector = () => {
    const colorMap = {
      Solid: ['White', 'Black', 'Brown'],
      Bicolour: ['White-Black', 'White-Brown', 'Black-Brown'],
      Tricolour: ['Black-Brown-White', 'White-Black-Brown', 'Brown-White-Black'],
      Mixed: [],
    };

    return (
      <View style={styles.radioGroup}>
        <Text style={styles.label}>Colour</Text>
        <View style={styles.radioRow}>
          {Object.keys(colorMap).map(cat => (
            <Pressable
              key={cat}
              style={styles.radioOption}
              onPress={() =>
                handleChange('colorCategory', cat === form.colorCategory ? '' : cat)
              }
            >
              <View
                style={[
                  styles.radioCircle,
                  form.colorCategory === cat && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioText}>{cat}</Text>
            </Pressable>
          ))}
        </View>

        {form.colorCategory &&
          colorMap[form.colorCategory].length > 0 && (
            <View style={[styles.radioRow, { marginTop: 8, flexWrap: 'wrap' }]}>
              {colorMap[form.colorCategory].map(sub => (
                <Pressable
                  key={sub}
                  style={styles.radioOption}
                  onPress={() => handleChange('colorSub', sub)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      form.colorSub === sub && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.radioText}>{sub}</Text>
                </Pressable>
              ))}
            </View>
          )}
      </View>
    );
  };

  const getFileInfo = type => {
    switch (type) {
      case 'photo':
        return { icon: 'image', color: '#4CAF50', label: 'Photo' };
      default:
        return { icon: 'file', color: '#9C27B0', label: 'File' };
    }
  };

  return (
    <ImageBackground
      source={require('../assets/mainpage2.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.topIcon}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topIcon}>
          <Ionicons name="menu" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
      >
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {pendingCount > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{pendingCount} Pending Sync</Text>
              </View>
            )}
           
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBox} onPress={handleCapture}>
                <View style={styles.actionCircle}>
                  <Ionicons name="camera" size={30} color="#ff7a2a" />
                </View>
                <Text style={styles.actionLabel}>Capture</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBox} onPress={handleUpload}>
                <View style={styles.actionCircle}>
                  <Ionicons name="cloud-upload" size={30} color="#ff7a2a" />
                </View>
                <Text style={styles.actionLabel}>Upload files</Text>
              </TouchableOpacity>
            </View>

            {uploads.length > 0 && (
              <View style={{ width: '90%', marginVertical: 10 }}>
                <Text style={styles.uploadTitle}>
                  Uploaded Files ({uploads.length})
                </Text>
                {uploads.map(u => {
                  const info = getFileInfo(u.type);
                  const pct = progress[u.id] || 0;
                  return (
                    <View key={u.id} style={styles.uploadItem}>
                      <View style={styles.uploadHeader}>
                        <View
                          style={[styles.fileIcon, { backgroundColor: info.color }]}
                        >
                          <Ionicons name={info.icon} size={16} color="white" />
                        </View>
                        <Text style={styles.uploadText}>
                          {u.name} - {info.label}
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                      </View>
                      <View style={styles.uploadStatus}>
                        <Text
                          style={[
                            styles.statusText,
                            { color: pct === 100 ? 'green' : '#ff7a2a' },
                          ]}
                        >
                          {pct === 100 ? '✓ Upload complete' : `Uploading... ${pct}%`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.routeContainer}>
              <Text style={styles.routeTitle}>Route Progress</Text>
              <View style={styles.routeBar}>
                <View style={styles.positionLabel}>
                  <Text style={styles.positionText}>Current Position</Text>
                </View>
                <View style={styles.progressBarRoute}>
                  <View style={[styles.progressFillRoute, { width: `${routeProgress}%` }]} />
                </View>
                <View style={styles.positionLabel}>
                  <Text style={styles.positionText}>Destination</Text>
                </View>
              </View>
              <Text style={styles.progressPercentage}>{routeProgress}% Complete</Text>
            </View>

            <View style={{ width: '100%' }}>
              <RadioGroup
                label="Sex"
                options={['M', 'F', 'NV']}
                selected={form.sex}
                onSelect={v => handleChange('sex', v)}
              />
              <RadioGroup
                label="Age"
                options={['Puppy', 'Young', 'Adult', 'Old']}
                selected={form.age}
                onSelect={v => handleChange('age', v)}
              />
              <ColorSelector />
              <RadioGroup
                label="Marks"
                options={['Face', 'Body', 'Leg', 'Tail', 'NA']}
                selected={form.marks}
                onSelect={v => handleChange('marks', v)}
              />
              <RadioGroup
                label="Injury"
                options={['Scar', 'Major', 'Others']}
                selected={form.injury}
                onSelect={v => handleChange('injury', v)}
              />
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notch</Text>
                <TextInput
                  style={styles.input}
                  value={form.notch}
                  onChangeText={v => handleChange('notch', v)}
                  placeholder="Enter notch info"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Note / Remarks</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  multiline
                  value={form.remarks}
                  onChangeText={v => handleChange('remarks', v)}
                  placeholder="Enter notes or remarks"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isLocationLoading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isLocationLoading}
            >
              <Text style={styles.submitText}>
                {isLocationLoading ? 'Fetching Location...' : 'Submit'}
              </Text>
            </TouchableOpacity>

            {overallProgress > 0 && overallProgress < 100 && (
              <View style={{ width: '90%', marginVertical: 10 }}>
                <Text>Uploading: {overallProgress}%</Text>
                <View
                  style={{
                    height: 6,
                    backgroundColor: '#eee',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${overallProgress}%`,
                      height: '100%',
                      backgroundColor: '#ff7a2a',
                    }}
                  />
                </View>
              </View>
            )}

            <View
              style={{
                marginTop: 20,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Image
                source={require('../assets/Logo_Creindia.jpg')}
                style={{ width: 150, height: 70, opacity: 1, top: 18 }}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },

  topRow: {
    marginTop: Platform.select({ ios: 44, android: 40, default: 24 }),
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  topIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },

  card: {
    width: '100%',
    backgroundColor: '#ebfdf0ff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowRadius: 8,
    flex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    top: 38,
  },

  actionRow: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  actionBox: { width: '48%', justifyContent: 'center', alignItems: 'center' },

  actionCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },

  actionLabel: { fontSize: 14, color: '#333', fontWeight: '600' },

  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },

  uploadItem: {
    marginBottom: 15,
    padding: 5,
    backgroundColor: '#f8f4f4ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  fileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  uploadText: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
    flex: 1,
  },

  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#ff7a2a',
    borderRadius: 8,
  },

  uploadStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  //route progress
  routeContainer: {
    width: '100%',
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
  },

  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },

  routeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },

  positionLabel: {
    flex: 1,
    alignItems: 'center',
  },

  positionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  progressBarRoute: {
    flex: 3,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 10,
  },

  progressFillRoute: {
    height: '100%',
    backgroundColor: '#ff7a2a',
    borderRadius: 3,
  },

  progressPercentage: {
    fontSize: 14,
    color: '#ff7a2a',
    fontWeight: '600',
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridItem: {
    width: '48%',
    marginBottom: 12,
  },

  input: {
    height: 44,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },

  submitBtn: {
    width: '65%',
    backgroundColor: '#ff7a2a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 80,
    elevation: 2,
  },

  submitText: { color: '#000', fontSize: 17, fontWeight: '700', textTransform: 'uppercase' },


 label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6 },
  radioGroup: { marginBottom: 15, width: '100%', paddingHorizontal: 10 },
  radioRow: { flexDirection: 'row', flexWrap: 'wrap' },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  radioCircle: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    borderColor: '#ff7a2a', marginRight: 6, alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { backgroundColor: '#ff7a2a' },
  radioText: { fontSize: 14, color: '#333' },
  inputGroup: { width: '100%', marginBottom: 12, paddingHorizontal: 10 },
  input: {
    height: 44,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },

});



























