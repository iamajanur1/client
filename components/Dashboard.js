import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

export default function Dashboard({ navigation, onLogout }) {
  const handleEntryData = () => {
    navigation.navigate("GeoLocation");
    console.log('Entry Data pressed');
    
  };

  const handlePrevious = () => {
    console.log('Previous pressed');
    navigation.navigate("Previous");
  };

  const handleReports = () => {
    console.log('Reports pressed');
    navigation.navigate("Reports");
  };

  const handleGeolocation = () => {
    console.log('Geolocation pressed');
    navigation.navigate("GeoLocation");
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
          onPress={() => {
            console.log('Profile pressed');
            // navigation.navigate('Profile');
          }}
          accessibilityLabel="Profile"
        >
          <Text style={styles.topIconText}>👤</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topIcon}
          onPress={() => {
            console.log('Menu pressed');
            // open drawer or menu
          }}
          accessibilityLabel="Menu"
        >
          <Text style={styles.topIconText}>≡</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.orangeBtn} onPress={handleEntryData} activeOpacity={0.8}>
            <Text style={styles.btnIcon}>➕</Text>
            <Text style={styles.btnText}>ENTRY DATA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.orangeBtn, styles.mt]} onPress={handlePrevious} activeOpacity={0.8}>
            <Text style={styles.btnIcon}>⏱️</Text>
            <Text style={styles.btnText}>PREVIOUS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.orangeBtn, styles.mt]} onPress={handleReports} activeOpacity={0.8}>
            <Text style={styles.btnIcon}>📊</Text>
            <Text style={styles.btnText}>REPORTS</Text>
          </TouchableOpacity>

           <TouchableOpacity style={[styles.orangeBtn, styles.mt]} onPress={handleGeolocation} activeOpacity={0.8}>
            <Text style={styles.btnIcon}>🗺️</Text>
            <Text style={styles.btnText}>GeoLocation</Text>
          </TouchableOpacity>
        </View>
      </View>

      
      <View style={styles.logoWrap}>
        <Image source={require('../assets/Logo_Creindia.jpg')} style={styles.logo} resizeMode="contain" />
      </View>

     
      {typeof onLogout === 'function' && (
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    marginTop: Platform.select({ ios: 44, android: 40, default: 24 }), // keep below status bar
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
  topIconText: {
    fontSize: 20,
  },

  cardContainer: {
    
    marginTop: 140,
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
    paddingVertical: 35,
    paddingHorizontal: 18,
    alignItems: 'center',
top: 20,
    shadowRadius: 8,
  },

  orangeBtn: {
    width: '90%',
    backgroundColor: '#ff7a2a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
    // button shadow
    elevation: 2,
  },

  mt: {
    marginTop: 16,
  },

  btnIcon: {
    fontSize: 26,
    width: 44,
    textAlign: 'center',
  },

  btnText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    color: '#000',
  },

  logoWrap: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  logo: {
    width: 180,
    height: 80,
    opacity: 0.95,
  },

  logoutBtn: {
    position: 'absolute',
    bottom: 18,
    right: 12,
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 0.95,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
