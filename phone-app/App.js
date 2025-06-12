import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

const BACKEND = 'http://localhost:3000';

export default function App() {
  const [phoneNumber, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('evm:1');
  const [result, setResult] = useState('');
  const [code, setCode] = useState('');
  const [requestId, setRequestId] = useState('');

  const bind = async () => {
    const res = await fetch(`${BACKEND}/blockchain-public-addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, blockchainPublicAddress: address, blockchainNetworkId: network, requestId })
    });
    const data = await res.json();
    setResult(JSON.stringify(data));
  };

  const startVerify = async () => {
    const res = await fetch(`${BACKEND}/verify/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    const data = await res.json();
    setRequestId(data.requestId);
  };

  const checkVerify = async () => {
    await fetch(`${BACKEND}/verify/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, code })
    });
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
      <Button title="Start Verify" onPress={startVerify} />
      <TextInput style={styles.input} placeholder="Code" value={code} onChangeText={setCode} />
      <Button title="Check Code" onPress={checkVerify} />
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
