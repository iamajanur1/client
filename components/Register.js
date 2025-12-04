import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@env";

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

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/organization-states`);
        const data = await res.json();
        if (data.success) setStates(data.states);
      } catch (err) {
        console.log("State fetch error:", err);
      }
    };
    fetchStates();
  }, []);

  const fetchOrganizations = async (stateName) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/organizations?state=${stateName}`);
      const data = await res.json();
      if (data.success) setOrganizations(data.organizations);
    } catch (err) {
      console.log("Org fetch error:", err);
    }
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    setSelectedOrg("");
    setOrganizations([]); // clear previous
    if (value) fetchOrganizations(value);
  };

  const handleRegister = async () => {
    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (!selectedState) {
      Alert.alert("Error", "Please select your state");
      return;
    }
    if (!selectedOrg) {
      Alert.alert("Error", "Please select your organization");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.toLowerCase().trim(),
          password,
          dob,
          gender,
          education,
          address,
          state: selectedState,
          organization: selectedOrg,
          role: "surveyor",
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Request Submitted",
          "Your account request was sent successfully.\nPlease wait for approval.",
          [{ text: "OK", onPress: () => navigation.replace("Login") }]
        );
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#666666"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666666"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#666666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="DOB (DD/MM/YYYY)" placeholderTextColor="#666666" value={dob} onChangeText={setDob} />
        <TextInput style={styles.input} placeholder="Gender" placeholderTextColor="#666666" value={gender} onChangeText={setGender} />
        <TextInput style={styles.input} placeholder="Education" placeholderTextColor="#666666" value={education} onChangeText={setEducation} />

        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Address"
          placeholderTextColor="#666666"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Text style={styles.label}>Select State</Text>
        <View style={styles.dropdown}>
          <Picker selectedValue={selectedState} onValueChange={handleStateChange}>
            <Picker.Item label="Select State" value="" />
            {states.map((st, i) => (
              <Picker.Item key={i} label={st} value={st} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Organization</Text>
        <View style={styles.dropdown}>
          <Picker
            selectedValue={selectedOrg}
            onValueChange={setSelectedOrg}
            enabled={!!selectedState}
          >
            <Picker.Item label="Select Organization" value="" />
            {organizations.map((org) => (
              <Picker.Item key={org._id} label={org.orgName} value={org._id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.registerText}>
            {isLoading ? "Submitting..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#f5f5f5", paddingVertical: 30 },
  card: {
    width: "92%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#ff7b00", marginBottom: 25, textAlign: "center" },

  // MOST IMPORTANT: BLACK TEXT + GRAY PLACEHOLDER
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 14,
    fontSize: 16,
    color: "#000000",                    // BLACK TEXT
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 15,
  },
  passwordInput: { flex: 1, height: 50, color: "#000000", fontSize: 16 },

  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 8 },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 14,
    overflow: "hidden",
  },

  registerButton: {
    backgroundColor: "#ff7b00",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  registerText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  disabledButton: { opacity: 0.6 },

  backBtn: {
    borderWidth: 2,
    borderColor: "#ff7b00",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
  },
  backText: { color: "#ff7b00", fontSize: 16, fontWeight: "bold" },
});
