import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

const BACKEND = 'http://localhost:3000';

export default function App() {
  const [phoneNumber, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('evm:1');
  const [result, setResult] = useState('');

  const bind = async () => {
    const res = await fetch(`${BACKEND}/blockchain-public-addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, blockchainPublicAddress: address, blockchainNetworkId: network })
    });
    const data = await res.json();
    setResult(JSON.stringify(data));
  };

  const retrieve = async () => {
    const res = await fetch(`${BACKEND}/blockchain-public-addresses/retrieve-blockchains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    const data = await res.json();
    setResult(JSON.stringify(data));
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Phone Number" value={phoneNumber} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Blockchain Address" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="Network (evm:1)" value={network} onChangeText={setNetwork} />
      <Button title="Bind" onPress={bind} />
      <Button title="Retrieve" onPress={retrieve} />
      <Text>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 }
});
