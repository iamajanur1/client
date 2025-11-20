// components/CaptureScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CaptureScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // reset every time this screen focused
      setPhoto(null);
      setIsLoading(false);
    }
  }, [isFocused]);

  const takePicture = async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        navigation.goBack();
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error with camera:', error);
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const acceptPhoto = async () => {
    if (!photo) return;
    try {
      const raw = await AsyncStorage.getItem('pendingCapturedImages');
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.includes(photo)) arr.push(photo);
      await AsyncStorage.setItem('pendingCapturedImages', JSON.stringify(arr));
    } catch (err) {
      console.warn('CaptureScreen: could not save captured image', err);
    }
    navigation.goBack(); // goBack preserves the same EntryData instance
  };

  const retakePhoto = () => {
    setPhoto(null);
    takePicture();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photo ? (
        <View style={styles.captureContainer}>
          <Text style={styles.title}>Capture</Text>
          <Text style={styles.subtitle}>Take a clear photo</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={takePicture} style={[styles.button, styles.cameraButton]} disabled={isLoading}>
              <Ionicons name="camera" size={50} color="white" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, styles.cancelButton]} disabled={isLoading}>
              <Ionicons name="close" size={50} color="white" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview Photo</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="contain" />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={acceptPhoto} style={styles.actionButton}>
              <View style={[styles.iconContainer, styles.acceptIcon]}>
                <Ionicons name="checkmark" size={35} color="white" />
              </View>
              <Text style={styles.actionText}>Use This Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={retakePhoto} style={styles.actionButton}>
              <View style={[styles.iconContainer, styles.retakeIcon]}>
                <Ionicons name="close" size={35} color="white" />
              </View>
              <Text style={styles.actionText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  loadingText: { color: "white", fontSize: 16, marginTop: 15 },
  captureContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 25 },
  title: { fontSize: 32, color: "white", fontWeight: "bold", marginBottom: 15 },
  subtitle: { fontSize: 18, color: "#ccc", marginBottom: 30, textAlign: "center" },
  buttonContainer: { width: "100%", alignItems: "center" },
  button: { width: width * 0.85, padding: 25, borderRadius: 20, alignItems: "center", marginBottom: 25 },
  cameraButton: { backgroundColor: "#007AFF" },
  cancelButton: { backgroundColor: "#F44336" },
  buttonText: { color: "white", fontSize: 22, fontWeight: "bold", marginTop: 15 },
  previewContainer: { flex: 1, backgroundColor: "#000", padding: 20 },
  previewTitle: { fontSize: 28, color: "white", fontWeight: "bold", textAlign: "center", marginTop: 40, marginBottom: 10 },
  imageContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginVertical: 20 },
  previewImage: { width: "95%", height: "80%", borderRadius: 15, borderWidth: 2, borderColor: "#333" },
  actionRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 40 },
  actionButton: { alignItems: "center", padding: 15 },
  iconContainer: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  acceptIcon: { backgroundColor: "#4CAF50" },
  retakeIcon: { backgroundColor: "#F44336" },
  actionText: { color: "white", fontSize: 16, fontWeight: "600" },
});
