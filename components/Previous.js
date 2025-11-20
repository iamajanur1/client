
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

export default function Previous({ navigation }) {
  const [entries, setEntries] = useState([
    { name: 'Max', breed: 'Labrador', age: '2', color: 'Yellow', sex: 'Male', health: 'Good' },
    { name: 'Bella', breed: 'Beagle', age: '3', color: 'Brown', sex: 'Female', health: 'Excellent' },
    { name: 'Rocky', breed: 'Pug', age: '1', color: 'Black', sex: 'Male', health: 'Good' },
    { name: 'Daisy', breed: 'Dalmatian', age: '4', color: 'White', sex: 'Female', health: 'Fair' },
    { name: 'Bruno', breed: 'Bulldog', age: '5', color: 'Fawn', sex: 'Male', health: 'Good' },
    { name: 'Luna', breed: 'Husky', age: '2', color: 'Gray', sex: 'Female', health: 'Excellent' },
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

  return (
    <ImageBackground
      source={require('../assets/mainpage2.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Top nav — back (left) and menu (right) */}
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
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Previous Entries</Text>

            <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
              <View style={styles.entryGrid}>
                {entries.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.entryCard}
                    activeOpacity={0.8}
                    onPress={() => openModal(item)}
                  >
                    <View style={styles.entryHeader}>
                      <Ionicons name="paw" size={24} color="#ff7a2a" />
                      <Text style={styles.entryName}>{item.name || `Dog ${idx + 1}`}</Text>
                    </View>

                    <View style={styles.entryDetails}>
                      <Text style={styles.detailText}>🐶 Breed: {item.breed}</Text>
                      <Text style={styles.detailText}>⏱️ Age: {item.age}</Text>
                      <Text style={styles.detailText}>🎨 Color: {item.color}</Text>
                      <Text style={styles.detailText}>⚧ Sex: {item.sex || '-'}</Text>
                      <Text style={styles.detailText}>💊 Health: {item.health || '-'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Company logo */}
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

      {/* Modal */}
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
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
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
    shadowRadius: 8,
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
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ff7a2a',
    marginBottom: 20,
  },
  entryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  entryCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff7a2a',
    marginLeft: 6,
  },
  entryDetails: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff7a2a',
    marginBottom: 10,
  },
  modalDetail: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: '#ff7a2a',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});









// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// export default function Previous({ navigation }) {
//   // Sample previous data
//   const [entries, setEntries] = useState([
//     { breed: 'Labrador', age: '2', color: 'Yellow' },
//     { breed: 'Beagle', age: '3', color: 'Brown' },
//     { breed: 'Pug', age: '1', color: 'Black' },
//     { breed: 'Dalmatian', age: '4', color: 'White' },
//     { breed: 'Bulldog', age: '5', color: 'Fawn' },
//     { breed: 'Husky', age: '2', color: 'Gray' },
//   ]);

//   return (
//     <ImageBackground
//       source={require('../assets/mainpage2.png')}
//       style={styles.bg}
//       resizeMode="cover"
//     >
//       {/* Top nav — back (left) and menu (right) */}
//       <View style={styles.topRow}>
//         <TouchableOpacity style={styles.topIcon} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={22} color="#000" />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.topIcon} onPress={() => console.log('Menu pressed')}>
//           <Ionicons name="menu" size={22} color="#000" />
//         </TouchableOpacity>
//       </View>

//       {/* Keyboard-aware scroll for future editable inputs */}
//       <KeyboardAwareScrollView
//   contentContainerStyle={{ flexGrow: 1 }}
//   enableOnAndroid={true}
//   keyboardShouldPersistTaps="handled"
//   extraScrollHeight={20}
//   showsVerticalScrollIndicator={false}
// >
//   <View style={styles.cardContainer}>
//     <View style={styles.card}>
//       <Text style={styles.cardTitle}>Previous Entries</Text>

//       <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
//         <View style={styles.entryGrid}>
//           {entries.map((item, idx) => (
//             <View key={idx} style={styles.entryCard}>
//               <View style={styles.entryHeader}>
//                 <Ionicons name="paw" size={24} color="#ff7a2a" />
//                 <Text style={styles.entryName}>{item.name || `Dog ${idx + 1}`}</Text>
//               </View>

//               <View style={styles.entryDetails}>
//                 <Text style={styles.detailText}>🐶 Breed: {item.breed}</Text>
//                 <Text style={styles.detailText}>⏱️ Age: {item.age}</Text>
//                 <Text style={styles.detailText}>🎨 Color: {item.color}</Text>
//                 <Text style={styles.detailText}>⚧ Sex: {item.sex || 'null'}</Text>
//                 <Text style={styles.detailText}>💊 Health: {item.health || 'null'}</Text>
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>

//       {/* Company logo */}
//       <View style={{ marginTop: 20, alignItems: 'center', marginBottom: 20 }}>
//         <Image
//           source={require('../assets/Logo_Creindia.jpg')}
//           style={{ width: 150, height: 70, opacity: 0.95,top: 40 }}
//           resizeMode="contain"
//         />
//       </View>
//     </View>
//   </View>
// </KeyboardAwareScrollView>

//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   bg: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     backgroundColor: '#fff',
//   },
//   topRow: {
//     marginTop: Platform.select({ ios: 44, android: 40, default: 24 }),
//     paddingHorizontal: 18,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   topIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cardContainer: {
//     marginTop: 40,
//     flex: 1,
//     width: '100%',
//     backgroundColor: 'rgba(255,255,255,0.98)',
//     borderRadius: 28,
//     paddingVertical: 35,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//     shadowRadius: 8,
//   },
//   card: {
//     flex: 1,
//     width: '100%',
//     backgroundColor: 'rgba(255,255,255,0.98)',
//     borderRadius: 28,
//     paddingVertical: 25,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//   },
//   cardTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#ff7a2a',
//     marginBottom: 20,
//   },
// entryGrid: {
//   flexDirection: 'row',
//   flexWrap: 'wrap',
//   justifyContent: 'space-between',
// },
// entryCard: {
//   width: '48%',
//   backgroundColor: '#f9f9f9',
//   borderRadius: 16,
//   padding: 12,
//   marginBottom: 12,
//   shadowColor: '#000',
//   shadowOpacity: 0.08,
//   shadowOffset: { width: 0, height: 2 },
//   shadowRadius: 4,
//   elevation: 3,
// },
// entryHeader: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   marginBottom: 8,
// },
// entryName: {
//   fontSize: 16,
//   fontWeight: '700',
//   color: '#ff7a2a',
//   marginLeft: 6,
// },
// entryDetails: {
//   marginTop: 4,
// },
// detailText: {
//   fontSize: 14,
//   color: '#333',
//   marginVertical: 2,
// },

// });
