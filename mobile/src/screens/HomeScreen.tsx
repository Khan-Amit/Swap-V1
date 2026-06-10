import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function HomeScreen() {
  // Mock tracking variables for your specific multi-national profile accounts
  const [userProfile] = useState({
    name: "CADET JANE DOE",
    stardate: "2026.161",
    senderAccount: {
      location: "GERMANY // SEPA CORRIDOR",
      accountNumber: "DE89 3704 0044 1234 5678 90",
      balance: "4,250.00 EUR",
      status: "FEDERATION_VERIFIED"
    },
    receiverAccount: {
      location: "THAILAND // PROMPTPAY CORRIDOR",
      accountNumber: "081-234-5678 (THAI BANK)",
      balance: "15,800.00 THB",
      status: "SECTOR_ACTIVE"
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- STAR TREK LCARS SYSTEM HEADER --- */}
        <View style={styles.lcarsHeader}>
          <View style={styles.lcarsBarLeft} />
          <View style={styles.lcarsTitleBlock}>
            <Text style={styles.systemSubText}>SUB-SPACE QUANTUM NETWORK</Text>
            <Text style={styles.systemTitleText}>SWAP-V1 // TRANSWARP ENGINE</Text>
          </View>
          <View style={styles.lcarsBarRight}>
            <Text style={styles.stardateText}>SD {userProfile.stardate}</Text>
          </View>
        </View>

        {/* --- SENDER IDENTITY POD (EUROPE) --- */}
        <View style={styles.panelContainer}>
          <View style={[styles.panelIndicator, { backgroundColor: '#FF9900' }]} />
          <View style={styles.panelBody}>
            <View style={styles.rowJustify}>
              <Text style={styles.sectionHeader}>[ SENDER PROFILE / SECTOR 01 ]</Text>
              <Text style={[styles.statusText, { color: '#00FF00' }]}>{userProfile.senderAccount.status}</Text>
            </View>
            <Text style={styles.label}>IDENTITY NAME:</Text>
            <Text style={styles.valueText}>{userProfile.name}</Text>
            
            <Text style={styles.label}>ROUTING ROUTE (IBAN):</Text>
            <Text style={styles.accountNumberText}>{userProfile.senderAccount.accountNumber}</Text>
            
            <Text style={styles.label}>LIQUID ENERGY RESERVES:</Text>
            <Text style={[styles.balanceText, { color: '#FF9900' }]}>{userProfile.senderAccount.balance}</Text>
          </View>
        </View>

        {/* --- CROSS-BORDER BRIDGE INDICATOR --- */}
        <View style={styles.bridgeVisual}>
          <Text style={styles.bridgeText}>🛸 SUBSYSTEM BRIDGE ENGAGED // EUR ➡️ THB</Text>
        </View>

        {/* --- RECEIVER IDENTITY POD (THAILAND) --- */}
        <View style={styles.panelContainer}>
          <View style={[styles.panelIndicator, { backgroundColor: '#CC6699' }]} />
          <View style={styles.panelBody}>
            <View style={styles.rowJustify}>
              <Text style={styles.sectionHeader}>[ RECEIVER PROFILE / DELTA QUADRANT ]</Text>
              <Text style={[styles.statusText, { color: '#00FF00' }]}>{userProfile.receiverAccount.status}</Text>
            </View>
            <Text style={styles.label}>DESTINATION NAME:</Text>
            <Text style={styles.valueText}>{userProfile.name}</Text>
            
            <Text style={styles.label}>PROMPTPAY MATRIX ID:</Text>
            <Text style={styles.accountNumberText}>{userProfile.receiverAccount.accountNumber}</Text>
            
            <Text style={styles.label}>LOCAL SYSTEM CURRENCY:</Text>
            <Text style={[styles.balanceText, { color: '#CC6699' }]}>{userProfile.receiverAccount.balance}</Text>
          </View>
        </View>

        {/* --- LCARS FUNCTION CONTROL PADS --- */}
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={[styles.lcarsButton, { backgroundColor: '#3366CC' }]}>
            <Text style={styles.buttonText}>SCAN QR CODE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.lcarsButton, { backgroundColor: '#FF9900' }]}>
            <Text style={styles.buttonText}>INITIATE FX WARP</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // True Deep Space Black background
  },
  scrollContent: {
    padding: 16,
  },
  lcarsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: 10,
  },
  lcarsBarLeft: {
    width: 35,
    height: 60,
    backgroundColor: '#99CCFF',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    marginRight: 6,
  },
  lcarsTitleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  systemSubText: {
    color: '#99CCFF',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  systemTitleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  lcarsBarRight: {
    height: 40,
    backgroundColor: '#FF9900',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  stardateText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  panelContainer: {
    flexDirection: 'row',
    backgroundColor: '#111122', // Dark ship console gray
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333355',
  },
  panelIndicator: {
    width: 12,
  },
  panelBody: {
    flex: 1,
    padding: 16,
  },
  rowJustify: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222244',
    paddingBottom: 6,
  },
  sectionHeader: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  label: {
    color: '#666688',
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  accountNumberText: {
    color: '#00FFFF', // Cyan data readouts
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  balanceText: {
    fontSize: 22,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 2,
  },
  bridgeVisual: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 8,
    backgroundColor: '#001133',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#002266',
  },
  bridgeText: {
    color: '#00FFFF',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  lcarsButton: {
    flex: 0.48,
    height: 45,
    borderRadius: 25, // Star Trek capsule shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 13,
  },
});
