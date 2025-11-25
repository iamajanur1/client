import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
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

  // ▼ State Dropdown Data
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  // ▼ Organization Dropdown Data
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  // --------------------------
  // Fetch list of states
  // --------------------------
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/organization-states`);
        const data = await res.json();

        if (data.success) {
          setStates(data.states);
        }
      } catch (err) {
        console.log("State fetch error:", err);
      }
    };

    fetchStates();
  }, []);

  // --------------------------
  // Fetch organizations by state
  // --------------------------
  const fetchOrganizations = async (stateName) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/organizations?state=${stateName}`);
      const data = await res.json();

      if (data.success) {
        setOrganizations(data.organizations);
      }
    } catch (err) {
      console.log("Org fetch error:", err);
    }
  };

  // when state dropdown changes
  const handleStateChange = (value) => {
    setSelectedState(value);
    setSelectedOrg("");
    if (value) fetchOrganizations(value);
  };

  // --------------------------
  // Submit Registration
  // --------------------------
  const handleRegister = async () => {
    if (!name || !username || !email || !password) {
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
          name,
          username,
          email,
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
          "Your account request was sent successfully.\nPlease wait for Organization and CreIndia Admin approval.",
          [{ text: "OK", onPress: () => navigation.replace("Login") }]
        );

        // ❌ DO NOT save token or userData — user is not approved yet
        return;
      }
    else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (err) {
      console.log("Registration error:", err);
      Alert.alert("Error", "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>

        {/* Basic Fields */}
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#555" />
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="DOB" value={dob} onChangeText={setDob} />
        <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} />
        <TextInput style={styles.input} placeholder="Education" value={education} onChangeText={setEducation} />

        <TextInput
          style={[styles.input, { height: 70 }]}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        {/* ----------------- STATE DROPDOWN ----------------- */}
        <Text style={styles.label}>Select State</Text>
        <View style={styles.dropdown}>
          <Picker
            selectedValue={selectedState}
            onValueChange={handleStateChange}
          >
            <Picker.Item label="Select State" value="" />
            {states.map((st, index) => (
              <Picker.Item key={index} label={st} value={st} />
            ))}
          </Picker>
        </View>

        {/* ---------------- ORGANIZATION DROPDOWN ---------------- */}
        <Text style={styles.label}>Select Organization</Text>
        <View style={styles.dropdown}>
          <Picker
            selectedValue={selectedOrg}
            onValueChange={(v) => setSelectedOrg(v)}
            enabled={selectedState !== ""}
          >
            <Picker.Item label="Select Organization" value="" />
            {organizations.map((org) => (
              <Picker.Item key={org._id} label={org.orgName} value={org._id} />
            ))}
          </Picker>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>
            {isLoading ? "Registering..." : "Register"}
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
  container: { flexGrow: 1, backgroundColor: "#f0f0f0", paddingVertical: 20 },
  card: { width: "90%", alignSelf: "center", backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 5 },
  title: { fontSize: 22, fontWeight: "bold", color: "#ff7b00", marginBottom: 20, alignSelf: "center" },
  input: { width: "100%", height: 45, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginBottom: 12, paddingHorizontal: 12 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
  dropdown: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginBottom: 12 },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 },
  passwordInput: { flex: 1 },
  registerButton: { backgroundColor: "#ff7b00", padding: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { opacity: 0.5 },
  backBtn: { borderWidth: 1.5, borderColor: "#ff7b00", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  backText: { color: "#ff7b00", fontSize: 16, fontWeight: "bold" },
});
