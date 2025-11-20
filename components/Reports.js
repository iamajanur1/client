import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Reports({ navigation }) {
  const [entries] = useState([
    { name: 'Max', breed: 'Labrador', age: 2, color: 'Yellow', sex: 'Male', health: 'Good' },
    { name: 'Bella', breed: 'Beagle', age: 3, color: 'Brown', sex: 'Female', health: 'Excellent' },
    { name: 'Rocky', breed: 'Pug', age: 1, color: 'Black', sex: 'Male', health: 'Good' },
    { name: 'Daisy', breed: 'Dalmatian', age: 4, color: 'White', sex: 'Female', health: 'Fair' },
    { name: 'Bruno', breed: 'Bulldog', age: 5, color: 'Fawn', sex: 'Male', health: 'Good' },
    { name: 'Luna', breed: 'Husky', age: 2, color: 'Gray', sex: 'Female', health: 'Excellent' },
  ]);

  const [selectedDog, setSelectedDog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (dog) => {
    setSelectedDog(dog);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedDog(null);
    setModalVisible(false);
  };

  // summary
  const totalDogs = entries.length;
  const maleDogs = entries.filter((d) => d.sex === 'Male').length;
  const femaleDogs = entries.filter((d) => d.sex === 'Female').length;
  const healthyDogs = entries.filter((d) => d.health === 'Good' || d.health === 'Excellent').length;

  return (
    <ImageBackground
      source={require('../assets/mainpage2.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Top nav */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.topIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topIcon} onPress={() => console.log('Menu pressed')}>
          <Ionicons name="menu" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reports</Text>

            {/* Summary cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{totalDogs}</Text>
                <Text style={styles.summaryLabel}>Total Dogs</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{maleDogs}</Text>
                <Text style={styles.summaryLabel}>Males</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{femaleDogs}</Text>
                <Text style={styles.summaryLabel}>Females</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{healthyDogs}</Text>
                <Text style={styles.summaryLabel}>Healthy</Text>
              </View>
            </View>

            {/* Dog list */}
            <ScrollView style={{ marginTop: 20 }}>
              {entries.map((dog, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.dogCard}
                  onPress={() => openModal(dog)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dogName}>{dog.name}</Text>
                  <Text style={styles.dogBrief}>
                    {dog.breed} | {dog.age} yrs | {dog.sex}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Logo at bottom */}
            <View style={{ marginTop: 20, alignItems: 'center', marginBottom: 20 }}>
              <Image
                source={require('../assets/Logo_Creindia.jpg')}
                style={{ width: 150, height: 70, opacity: 0.95,top:40 }}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Modal for dog details */}
      {selectedDog && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="paw" size={60} color="#ff7a2a" />
                </View>

                <Text style={styles.modalName}>{selectedDog.name || 'Unknown'}</Text>

                <Text style={styles.modalDetail}>🐶 Breed: {selectedDog.breed}</Text>
                <Text style={styles.modalDetail}>⏱️ Age: {selectedDog.age}</Text>
                <Text style={styles.modalDetail}>🎨 Color: {selectedDog.color}</Text>
                <Text style={styles.modalDetail}>⚧ Sex: {selectedDog.sex || '-'}</Text>
                <Text style={styles.modalDetail}>💊 Health: {selectedDog.health || '-'}</Text>

                <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%', backgroundColor: '#fff' },
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
    marginTop: 40,
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 28,
    paddingVertical: 35,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 28,
    paddingVertical: 25,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#ff7a2a', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  summaryCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
  },
  summaryValue: { fontSize: 20, fontWeight: '700', color: '#ff7a2a' },
  summaryLabel: { fontSize: 14, color: '#333', marginTop: 4 },
  dogCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  dogName: { fontSize: 16, fontWeight: '700', color: '#ff7a2a', marginBottom: 4 },
  dogBrief: { fontSize: 14, color: '#333' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalName: { fontSize: 20, fontWeight: '700', color: '#ff7a2a', marginBottom: 10 },
  modalDetail: { fontSize: 16, color: '#333', marginBottom: 6 },
  modalCloseBtn: {
    marginTop: 14,
    backgroundColor: '#ff7a2a',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  modalCloseText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
