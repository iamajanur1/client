import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env';

export default function Login({ navigation, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('surveyor'); 

  // Load saved credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        const savedPass = await AsyncStorage.getItem("savedPassword");
        const savedRole = await AsyncStorage.getItem("savedRole");
        if (savedEmail && savedPass) {
          setEmail(savedEmail);
          setPassword(savedPass);
          setRemember(true);
          if (savedRole) setRole(savedRole);
        }
      } catch (error) {
        console.error("Error loading saved credentials", error);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Normalize user data: Ensure _id exists (fallback to id if backend sends it)
        const normalizedUser = {
          ...data.user,
          _id: data.user._id || data.user.id || data.user.userId
        };

        // Save or remove credentials based on Remember Me
        if (remember) {
          await AsyncStorage.setItem("savedEmail", email);
          await AsyncStorage.setItem("savedPassword", password);
          await AsyncStorage.setItem("savedRole", role);
        } else {
          await AsyncStorage.removeItem("savedEmail");
          await AsyncStorage.removeItem("savedPassword");
          await AsyncStorage.removeItem("savedRole");
        }

        // Store the token and user data
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(normalizedUser));

        // Debug log
        console.log('Stored userData:', normalizedUser);

        Alert.alert("Success", "Login successful!");
        
        // Clear form AFTER storage
        setEmail("");
        setPassword("");
        setRemember(false);

        // Call the onLogin callback to update app state
        if (onLogin) {
          onLogin();
        } else {
          navigation.replace('Dashboard');
        }
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Error", "Cannot connect to server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const RoleButton = ({ value, label }) => (
    <TouchableOpacity
      onPress={() => setRole(value)}
      style={[styles.roleBtn, role === value ? styles.roleBtnActive : null]}
    >
      <Text style={[styles.roleBtnText, role === value ? { color: '#fff' } : null]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#90ee90", "#f0f0f0"]} style={styles.container}>
      <View style={styles.card}>
        <Image source={require("../assets/Logo_Creindia.jpg")} style={styles.logo} />
        <Text style={styles.title}>Welcome to CreIndia</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" />
        
        <View style={{ width: "100%", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, backgroundColor: "#f9f9f9", paddingHorizontal: 15, height: 45 }}>
            <TextInput style={{ flex: 1, fontSize: 16, color: "#333" }} placeholder="Password" placeholderTextColor="#555" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} autoCapitalize="none" />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ alignSelf: 'flex-start', marginTop: 6, marginBottom: 6, fontWeight: '600' }}>Role</Text>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
          <RoleButton value="surveyor" label="Surveyor" />
          <RoleButton value="citizen" label="Citizen" />
        </View>

        <View style={styles.checkboxContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox value={remember} onValueChange={setRemember} color={remember ? "#ff7b00" : undefined} />
            <Text style={styles.checkboxLabel}> Remember Me</Text>
          </View>

          <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Password recovery not implemented yet")}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.loginButton, isLoading && styles.disabledButton]} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.loginText}>{isLoading ? "Logging in..." : "LOGIN"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Register")} disabled={isLoading}>
          <Text style={styles.registerText}>Create New Account</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>(Use your registered email to login)</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "90%", backgroundColor: "#fff", borderRadius: 25, paddingVertical: 40, paddingHorizontal: 25, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 8 },
  logo: { width: 180, height: 90, marginBottom: 10, resizeMode: "contain" },
  title: { fontSize: 22, fontWeight: "bold", color: "#ff7b00", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20 },
  input: { width: "100%", height: 45, backgroundColor: "#f9f9f9", borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: "#ddd" },
  checkboxContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 20 },
  checkboxLabel: { color: "#333", fontSize: 14 },
  forgotText: { color: "#1e90ff", fontSize: 14, fontWeight: "500" },
  loginButton: { width: "100%", backgroundColor: "#ff7b00", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginBottom: 10 },
  disabledButton: { backgroundColor: "#cccccc" },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  registerButton: { width: "100%", borderWidth: 1.5, borderColor: "#ff7b00", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  registerText: { color: "#ff7b00", fontSize: 16, fontWeight: "bold" },
  hint: { marginTop: 15, fontSize: 13, color: "#666", fontStyle: "italic" },
  roleBtn: { width: '48%', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  roleBtnActive: { backgroundColor: '#ff7b00', borderColor: '#ff7b00' },
  roleBtnText: { fontWeight: '600', color: '#333' }
});






// import React, { useState,useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Image,
// } from "react-native";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';
// import Checkbox from "expo-checkbox";
// import { LinearGradient } from "expo-linear-gradient";

// export default function Login({ navigation, onLogin }) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);


// useEffect(() => {
//     const loadCredentials = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem('savedUsername');
//         const savedPass = await AsyncStorage.getItem('savedPassword');
//         if (savedUser && savedPass) {
//           setUsername(savedUser);
//           setPassword(savedPass);
//           setRememberMe(true);

//           console.log('Username is:', savedUser);
//           console.log('Password is:', savedPass);
//         }

//       } catch (error) {
//         console.error('Error loading saved credentials', error);
//       }
//     };
//     loadCredentials();
//   }, []);

//   const handleLogin = async () => {
//     if (username === "Admin" && password === "12345") {
//     if (rememberMe) {
//         await AsyncStorage.setItem('savedUsername', username);
//         await AsyncStorage.setItem('savedPassword', password);
//       } else {
//         await AsyncStorage.removeItem('savedUsername');
//         await AsyncStorage.removeItem('savedPassword');
//       }

//       onLogin();
//       setUsername("");
//       setPassword("");
//       setRemember(false);
//     } else {
//       Alert.alert("Login Failed", "Incorrect username or password");
//     }
//   };
//     const toggleRemember = () => setRememberMe(!rememberMe);


//   return (
//     <LinearGradient colors={["#90ee90", "#f0f0f0"]} style={styles.container}>
//       <View style={styles.card}>
//         <Image
//           source={require("../assets/Logo_Creindia.jpg")} // your CreIndia logo here
//           style={styles.logo}
//         />

//         <Text style={styles.title}>Welcome to CreIndia</Text>
//         <Text style={styles.subtitle}>Login to continue</Text>
//         <View style={ styles.userContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Username"
//           value={username}
//           onChangeText={setUsername}
//           placeholderTextColor="#999"
//         />
//         </View>
//         <View style={styles.passwordContainer}>
//           <TextInput
//             style={[styles.input, { flex: 1 }]}
//             placeholder="Password"
//             placeholderTextColor="#999"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//             <Ionicons
//               name={showPassword ? 'eye-off' : 'eye'}
//               size={24}
//               color="#1e90ff"
//               marginBottom={12}
//                 marginLeft={5}
                
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.checkboxContainer}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Checkbox value={remember} onValueChange={setRemember} color={remember ? "#ff7b00" : undefined} />
//             <Text style={styles.checkboxLabel}> Remember Me</Text>
//           </View>

//           <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Password recovery not implemented yet")}>
//             <Text style={styles.forgotText}>Forgot Password?</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
//           <Text style={styles.loginText}>LOGIN</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.registerButton}
//           onPress={() => navigation.navigate("Register")}
//         >
//           <Text style={styles.registerText}>Create New Account</Text>
//         </TouchableOpacity>

//         <Text style={styles.hint}>(Use Admin / 12345 to login)</Text>
//       </View>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   userContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "90%",
    
//     marginRight: 30,
//   },
//    passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 15,

//   },
//   card: {
//     width: "90%",
//     backgroundColor: "#fff",
//     borderRadius: 25,
//     paddingVertical: 40,
//     paddingHorizontal: 25,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   logo: {
//     width: 90,
//     height: 90,
//     marginBottom: 10,
//     resizeMode: "contain",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#ff7b00",
//     marginBottom: 5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#555",
//     marginBottom: 20,
//   },
//   input: {
//     width: "100%",
//     height: 45,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   checkboxContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     marginBottom: 20,
//   },
//   checkboxLabel: {
//     color: "#333",
//     fontSize: 14,
//   },
//   forgotText: {
//     color: "#1e90ff",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   loginButton: {
//     width: "100%",
//     backgroundColor: "#ff7b00",
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   loginText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   registerButton: {
//     width: "100%",
//     borderWidth: 1.5,
//     borderColor: "#ff7b00",
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: "center",
//   },
//   registerText: {
//     color: "#ff7b00",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   hint: {
//     marginTop: 15,
//     fontSize: 13,
//     color: "#666",
//     fontStyle: "italic",
//   },
// });























// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Modal,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons } from '@expo/vector-icons';

// export default function Login({ navigation, onLogin }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [forgotVisible, setForgotVisible] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState('');

//   // Load saved credentials when component mounts
//   useEffect(() => {
//     const loadCredentials = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem('savedUsername');
//         const savedPass = await AsyncStorage.getItem('savedPassword');
//         if (savedUser && savedPass) {
//           setUsername(savedUser);
//           setPassword(savedPass);
//           setRememberMe(true);
//         }
//       } catch (error) {
//         console.error('Error loading saved credentials', error);
//       }
//     };
//     loadCredentials();
//   }, []);

//   const handleLogin = async () => {
//     if (username === 'Admin' && password === '12345') {
//       if (rememberMe) {
//         await AsyncStorage.setItem('savedUsername', username);
//         await AsyncStorage.setItem('savedPassword', password);
//       } else {
//         await AsyncStorage.removeItem('savedUsername');
//         await AsyncStorage.removeItem('savedPassword');
//       }
//       onLogin();
//       setUsername('');
//       setPassword('');
//     } else {
//       Alert.alert('Login Failed', 'Incorrect username or password');
//     }
//   };

//   const toggleRemember = () => setRememberMe(!rememberMe);

//   const handleForgotSubmit = () => {
//     if (forgotEmail.trim() === '') {
//       Alert.alert('Error', 'Please enter your registered email');
//       return;
//     }
//     Alert.alert('Success', 'A reset link has been sent to your email.');
//     setForgotEmail('');
//     setForgotVisible(false);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <Text style={styles.title}>Welcome to CreIndia</Text>
//         <Text style={styles.subtitle}>Login to Continue</Text>

//         <TextInput
//           style={styles.input}
//           placeholder="Username"
//           placeholderTextColor="#999"
//           value={username}
//           onChangeText={setUsername}
//         />

//         <View style={styles.passwordContainer}>
//           <TextInput
//             style={[styles.input, { flex: 1 }]}
//             placeholder="Password"
//             placeholderTextColor="#999"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//             <Ionicons
//               name={showPassword ? 'eye-off' : 'eye'}
//               size={24}
//               color="#1e90ff"
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.rememberForgot}>
//           <TouchableOpacity onPress={toggleRemember} style={styles.rememberMe}>
//             <Ionicons
//               name={rememberMe ? 'checkbox' : 'square-outline'}
//               size={22}
//               color={rememberMe ? '#1e90ff' : '#888'}
//             />
//             <Text style={styles.rememberText}>Remember Me</Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setForgotVisible(true)}>
//             <Text style={styles.forgotText}>Forgot Password?</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
//           <Text style={styles.loginText}>Login</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.createButton}
//           onPress={() => navigation.navigate('Register')}
//         >
//           <Text style={styles.createText}>Create New Account</Text>
//         </TouchableOpacity>

//         <Text style={styles.note}>(Use Admin / 12345 to login)</Text>
//       </View>

//       {/* Forgot Password Modal */}
//       <Modal
//         transparent
//         animationType="fade"
//         visible={forgotVisible}
//         onRequestClose={() => setForgotVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Reset Password</Text>
//             <Text style={styles.modalSubtitle}>
//               Enter your registered email to receive a reset link
//             </Text>

//             <TextInput
//               style={styles.modalInput}
//               placeholder="Email Address"
//               placeholderTextColor="#999"
//               keyboardType="email-address"
//               value={forgotEmail}
//               onChangeText={setForgotEmail}
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalBtn, { backgroundColor: '#1e90ff' }]}
//                 onPress={handleForgotSubmit}
//               >
//                 <Text style={{ color: '#fff', fontWeight: '600' }}>Submit</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.modalBtn, { borderWidth: 1, borderColor: '#1e90ff' }]}
//                 onPress={() => setForgotVisible(false)}
//               >
//                 <Text style={{ color: '#1e90ff', fontWeight: '600' }}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // 🎨 Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f2f6fc',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   card: {
//     backgroundColor: '#fff',
//     width: '90%',
//     borderRadius: 20,
//     paddingVertical: 30,
//     paddingHorizontal: 25,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 6,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#1e90ff',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#555',
//     marginBottom: 20,
//   },
//   input: {
//     width: '100%',
//     height: 45,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     paddingHorizontal: 12,
//     marginBottom: 10,
//     fontSize: 16,
//     color: '#333',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 15,
//   },
//   rememberForgot: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 15,
//   },
//   rememberMe: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   rememberText: {
//     marginLeft: 6,
//     color: '#333',
//     fontSize: 14,
//   },
//   forgotText: {
//     color: '#1e90ff',
//     fontWeight: '500',
//   },
//   loginButton: {
//     backgroundColor: '#1e90ff',
//     paddingVertical: 12,
//     borderRadius: 10,
//     width: '100%',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   loginText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   createButton: {
//     borderColor: '#1e90ff',
//     borderWidth: 1.5,
//     borderRadius: 10,
//     paddingVertical: 10,
//     width: '100%',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   createText: {
//     color: '#1e90ff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   note: {
//     color: '#555',
//     fontStyle: 'italic',
//     fontSize: 13,
//     marginTop: 10,
//   },

//   // Forgot Password Modal
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCard: {
//     backgroundColor: '#fff',
//     width: '85%',
//     borderRadius: 20,
//     padding: 25,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,
//     elevation: 10,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1e90ff',
//     marginBottom: 8,
//   },
//   modalSubtitle: {
//     color: '#555',
//     textAlign: 'center',
//     marginBottom: 15,
//     fontSize: 14,
//   },
//   modalInput: {
//     width: '100%',
//     height: 45,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     paddingHorizontal: 12,
//     marginBottom: 15,
//     backgroundColor: '#f9f9f9',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   modalBtn: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginHorizontal: 5,
//   },
// });
