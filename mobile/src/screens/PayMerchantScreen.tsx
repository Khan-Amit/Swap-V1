import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { EmvcoDecoder, PromptPayQRData } from '../services/emvco';

export default function PayMerchantScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  // Simulated raw EMVCo string payload scanned from a Thai online shop
  // Maps out to 125.50 THB payment to a merchant phone account
  const rawScannedQR = "00020101021129370016A0000006770101110113006681234567853037645406125.505802TH";
  
  // Parse the data instantly through our EMVCo engine service
  const qrData: PromptPayQRData = EmvcoDecoder.decode(rawScannedQR);

  const handleConfirmAuthorization = async () => {
    setIsProcessing(true);
    
    // Simulate high-speed sub-space API network payload delivery to backend/src/api/v1/qr.py
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus('SUCCESS');
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- LCARS SUB-BAR TOP HEADER --- */}
      <View style={styles.lcarsHeader}>
        <View style={styles.lcarsCapLeft} />
        <Text style={styles.headerTitle}>TACTICAL PAYMENTS MATRIX</Text>
        <View style={styles.lcarsBarRight} />
      </View>

      {paymentStatus === 'IDLE' ? (
        <View style={{ flex: 1 }}>
          {/* --- SCANNED TARGET READOUT --- */}
          <View style={styles.displayPanel}>
            <Text style={styles.panelTitle}>[ SCAN ANALYTICS REPORT ]</Text>
            
            <Text style={styles.label}>TARGET NETWORK REGISTRY:</Text>
            <Text style={styles.valueText}>THAI PROMPTPAY (EMVCo COMPLIANT)</Text>

            <Text style={styles.label}>MERCHANT ENDPOINT ID:</Text>
            <Text style={styles.endpointData}>{qrData.proxyValue || "UNKNOWN ENDPOINT"}</Text>

            <Text style={styles.label}>MERCHANT REGISTERED NAME:</Text>
            <Text style={styles.valueText}>{qrData.merchantName || "SECURE THAI ONLINE SHOP"}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.label}>ENERGY QUANTUM DEBIT AMOUNT:</Text>
            <Text style={styles.chargeAmount}>{qrData.amount?.toFixed(2) || "0.00"} THB</Text>
          </View>

          {/* --- SUBMIT INTERACTION ACTION BAR --- */}
          <View style={styles.actionContainer}>
            <Text style={styles.warningAlert}>⚠️ CRITICAL: FUND SETTLEMENT IS IMMUTABLE ONCE ROUTED</Text>
            
            <TouchableOpacity 
              style={[styles.warpButton, isProcessing && styles.disabledButton]} 
              onPress={handleConfirmAuthorization}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>AUTHORIZE TRANSWARP DISCHARGE</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* --- TRANSACTION SUCCESS OVERLAY PANELS --- */
        <View style={styles.successScreen}>
          <Text style={styles.successIcon}>🛸</Text>
          <Text style={styles.successText}>TRANSWARP VELOCITY SETTLED</Text>
          <Text style={styles.successSub}>Ledger synchronized across sectors. 125.50 THB delivered to merchant.</Text>
          
          <TouchableOpacity style={styles.returnButton} onPress={() => setPaymentStatus('IDLE')}>
            <Text style={styles.returnText}>RETURN TO DASHBOARD PROTOCOLS</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  lcarsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  lcarsCapLeft: {
    width: 20,
    height: 35,
    backgroundColor: '#CC6699',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 8,
  },
  headerTitle: {
    color: '#CC6699',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  lcarsBarRight: {
    flex: 1,
    height: 35,
    backgroundColor: '#99CCFF',
    marginLeft: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  displayPanel: {
    backgroundColor: '#111111',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CC6699',
  },
  panelTitle: {
    color: '#CC6699',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    color: '#555577',
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 12,
  },
  valueText: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  endpointData: {
    color: '#00FFFF',
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#222233',
    marginVertical: 16,
  },
  chargeAmount: {
    color: '#FF9900',
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionContainer: {
    padding: 16,
    marginTop: 'auto',
  },
  warningAlert: {
    color: '#FF3333',
    fontFamily: 'monospace',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 16,
  },
  warpButton: {
    backgroundColor: '#FF9900',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555555',
  },
  buttonText: {
    color: '#000000',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  successText: {
    color: '#00FF00',
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successSub: {
    color: '#888888',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  returnButton: {
    borderWidth: 1,
    borderColor: '#3366CC',
    height: 45,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
  },
  returnText: {
    color: '#3366CC',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
