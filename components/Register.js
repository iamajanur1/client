// components/Register.js  (updated)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import{API_URL} from '@env';

export default function Register({ navigation }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('surveyor'); // default as requested

  const handleRegister = async () => {
    if (!name || !username || !email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          dob,
          gender,
          education,
          address,
          role
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Registration completed!");
        
        // Store the token and user data
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        // Clear form
        setName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setDob("");
        setGender("");
        setEducation("");
        setAddress("");

        // Navigate to Dashboard
        navigation.replace('Login');
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>

        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#555" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#555" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#555" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <View style={styles.passwordContainer}>
          <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor="#555" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} autoCapitalize="none" />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#555" />
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Date of Birth (DD/MM/YYYY)" placeholderTextColor="#555" value={dob} onChangeText={setDob} />
        <TextInput style={styles.input} placeholder="Gender" placeholderTextColor="#555" value={gender} onChangeText={setGender} />
        <TextInput style={styles.input} placeholder="Education Qualification" placeholderTextColor="#555" value={education} onChangeText={setEducation} />
        <TextInput style={[styles.input, { height: 70 }]} placeholder="Address" placeholderTextColor="#555" value={address} onChangeText={setAddress} multiline />

        <Text style={{ alignSelf: 'flex-start', marginTop: 6, marginBottom: 6, fontWeight: '600' }}>Role</Text>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
          <RoleButton value="surveyor" label="Surveyor" />
          <RoleButton value="citizen" label="Citizen" />
        </View>

        <TouchableOpacity style={[styles.registerButton, isLoading && styles.disabledButton]} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.registerText}>{isLoading ? "Registering..." : "Register"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ width: "100%", borderWidth: 1.5, borderColor: "#ff7b00", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 5 }} onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={{ color: "#ff7b00", fontSize: 16, fontWeight: "bold" }}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center", paddingVertical: 20 },
  card: { width: "90%", backgroundColor: "#fff", borderRadius: 25, paddingVertical: 30, paddingHorizontal: 25, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 8 },
  title: { fontSize: 22, fontWeight: "bold", color: "#ff7b00", marginBottom: 20 },
  input: { width: "100%", height: 45, backgroundColor: "#f9f9f9", borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: "#ddd", color: "#333" },
  passwordContainer: { flexDirection: "row", alignItems: "center", width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, backgroundColor: "#f9f9f9", paddingHorizontal: 15, height: 45, marginBottom: 12 },
  passwordInput: { flex: 1, fontSize: 16, color: "#333" },
  registerButton: { width: "100%", backgroundColor: "#ff7b00", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  disabledButton: { backgroundColor: "#cccccc" },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  roleBtn: { width: '48%', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  roleBtnActive: { backgroundColor: '#ff7b00', borderColor: '#ff7b00' },
  roleBtnText: { fontWeight: '600', color: '#333' }
});
