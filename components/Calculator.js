import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function Calculator({ onLogout }) {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState(null);

  const calculator = (op) => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) return;

    switch (op) {
      case '+': setResult(n1 + n2); break;
      case '-': setResult(n1 - n2); break;
      case '*': setResult(n1 * n2); break;
      case '/': setResult(n2 !== 0 ? n1 / n2 : 'Cannot divide by zero'); break;
      default: setResult('Invalid Operation');
    }
  };

  const resetCalculator = () => {
    setNum1('');
    setNum2('');
    setResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Hii I'm Ajanur Rahman</Text>
        <Text style={styles.subtitle}>Simple Calculator</Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter first number"
          value={num1}
          onChangeText={setNum1}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter second number"
          value={num2}
          onChangeText={setNum2}
        />

        <View style={styles.buttonRow}>
          <Button title="+" onPress={() => calculator('+')} />
          <Button title="-" onPress={() => calculator('-')} />
          <Button title="*" onPress={() => calculator('*')} />
          <Button title="/" onPress={() => calculator('/')} />
        </View>

        {result !== null && <Text style={styles.result}>Result: {result}</Text>}

        <View style={{ marginTop: 10 }}>
          <Button title="Reset" color="red" onPress={resetCalculator} />
        </View>

        <View style={{ marginTop: 10 }}>
          <Button title="Logout" color="gray" onPress={onLogout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {           
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  card: {
    padding: 20,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 10,
  },
  result: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
    color: 'green',
  },
});
