import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './components/Login';
import Register from './components/Register';
import './polyfills';
import Dashboard from './components/Dashboard';
import Splash from './components/Splash';
import EntryData from "./components/EntryData";
import Previous from "./components/Previous";
import Reports from "./components/Reports";
import CaptureScreen from './components/CaptureScreen';
import GeoLocation from './components/GeoLocation';



const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <Splash onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          <>
          <Stack.Screen name="Dashboard">
            {(props) => <Dashboard {...props} onLogout={() => setIsLoggedIn(false)} />}
          </Stack.Screen>
          
          <Stack.Screen name="CaptureScreen" component={CaptureScreen} />
          <Stack.Screen name="Previous" component={Previous} />
          <Stack.Screen name="Reports" component={Reports} />

          
          <Stack.Screen name="GeoLocation" component={GeoLocation} />
          <Stack.Screen name="EntryData" component={EntryData} />
          
          </>
       )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

































// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';

// export default function App() {
//   const [showCalculator, setShowCalculator] = useState(false);
//   const [num1, setNum1] = useState('');
//   const [num2, setNum2] = useState('');
//   const [result, setResult] = useState(null);

//   // Handle the "Click Me" button
//   const handlePress = () => {
//     Alert.alert('Hello from React Native!');
//     setShowCalculator(true); 
//   };

 
//   const calculator = (op) => {
//     const n1 = parseFloat(num1);
//     const n2 = parseFloat(num2);

//     if (isNaN(n1) || isNaN(n2)) {
//       Alert.alert('Please enter valid numbers');
//       return;
//     }

//     switch (op) {
//       case '+':
//         setResult(n1 + n2);
//         break;
//       case '-':
//         setResult(n1 - n2);
//         break;
//       case '*':
//         setResult(n1 * n2);
//         break;
//       case '/':
//         setResult(n2 !== 0 ? n1 / n2 : 'Cannot divide by zero');
//         break;
//       default:
//         setResult('Invalid Operation');
//     }
//   };


//   const resetCalculator = () => {
//     setNum1('');
//     setNum2('');
//     setResult(null);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to My React Native App!</Text>
//       <Button title="Click Me" onPress={handlePress} />

//       {showCalculator && (
//         <View style={styles.card}>
//           <Text style={styles.subtitle}>Hii I'm Ajanur Rahman</Text>
//           <Text style={styles.subtitle}>Simple Calculator</Text>

//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             placeholder="Enter first number"
//             value={num1}
//             onChangeText={setNum1}
//           />
//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             placeholder="Enter second number"
//             value={num2}
//             onChangeText={setNum2}
//           />

//           <View style={styles.buttonRow}>
//             <Button title="+" onPress={() => calculator('+')} />
//             <Button title="-" onPress={() => calculator('-')} />
//             <Button title="*" onPress={() => calculator('*')} />
//             <Button title="/" onPress={() => calculator('/')} />
//           </View>

//           {result !== null && <Text style={styles.result}>Result: {result}</Text>}

//           <View style={{ marginTop: 10 }}>
//             <Button title="Reset" color="red" onPress={resetCalculator} />
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f38080ff',
//   },
//   card: {
//     marginTop: 20,
//     padding: 20,
//     width: '90%',
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 100,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
//   subtitle: {
//     fontSize: 20,
//     marginBottom: 10,
//     color: '#1e90ff',
//     fontWeight: 'bold',
//   },
//   input: {
//     width: '80%',
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginVertical: 5,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     backgroundColor: '#f9f9f9',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '80%',
//     marginVertical: 10,
//   },
//   result: {
//     fontSize: 18,
//     marginTop: 10,
//     fontWeight: 'bold',
//     color: 'green',
//   },
// });
