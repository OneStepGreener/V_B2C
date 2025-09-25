import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AuthController from '../controllers/AuthController';

const { width, height } = Dimensions.get('window');

const DriverLoginScreen = ({ navigation }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateAndProceed = async () => {
    console.log('🚀 validateAndProceed function started!');
    console.log('📝 Vehicle Number:', vehicleNumber);
    console.log('📝 Driving License:', drivingLicense);
    console.log('📏 Vehicle Number length:', vehicleNumber.length);
    console.log('📏 Driving License length:', drivingLicense.length);
    
    // Check if fields are empty
    if (!vehicleNumber.trim()) {
      Alert.alert('Invalid Vehicle Number', 'Please enter a vehicle number.');
      return;
    }

    if (!drivingLicense.trim()) {
      Alert.alert('Invalid Driving License', 'Please enter a driving license number.');
      return;
    }
    
    if (vehicleNumber.length < 8 || vehicleNumber.length > 15) {
      Alert.alert('Invalid Vehicle Number', 'Vehicle number must be 8-15 characters (letters and numbers).');
      return;
    }

    if (drivingLicense.length < 10 || drivingLicense.length > 20) {
      Alert.alert('Invalid Driving License', 'Driving license number must be 10-20 characters (letters and numbers).');
      return;
    }

    console.log('✅ Validation passed, starting authentication...');
    setIsLoading(true);

    try {
      // Proceed directly with authentication
      console.log('🔄 Starting authentication...');
      
      // Authenticate with backend using V1 (original system)
      console.log('🔄 Using V1 authentication (original system)...');
      
      // Add timeout to prevent hanging
      const authPromise = AuthController.login(vehicleNumber, drivingLicense);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout after 30 seconds')), 30000);
      });
      
      const result = await Promise.race([authPromise, timeoutPromise]);
      console.log('✅ Authentication completed:', result);
      
      if (result.success) {
        const driver = result.driver;
        Alert.alert(
          'Login Successful', 
          `Welcome ${driver.driver_name}!\n\n📅 Route Date: ${driver.route_date}\n🚛 Vehicle: ${driver.vehicle_number}\n📍 Total Pickups: ${driver.total_pickups}\n\nReady to start your route?`,
          [
            {
              text: 'Start Route',
              onPress: () => navigation.navigate('PickupStart')
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials or no route assigned for today.');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Network error. Please check your internet connection and try again.';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please check if the server is running and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Authentication timeout')) {
        errorMessage = 'Authentication request timed out. Please check your connection and try again.';
      } else if (error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid vehicle number or driving license. Please check your credentials.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/OSG_Logo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Input fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. DL1LAN3660"
              placeholderTextColor="#999"
              value={vehicleNumber}
              onChangeText={(text) => {
                // Allow letters, numbers, and spaces, convert to uppercase
                const cleanText = text.replace(/[^A-Za-z0-9\s]/g, '').toUpperCase();
                if (cleanText.length <= 15) {
                  setVehicleNumber(cleanText);
                }
              }}
              keyboardType="default"
              maxLength={15}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>D.L. Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. BR5020230001371"
              placeholderTextColor="#999"
              value={drivingLicense}
              onChangeText={(text) => {
                // Allow letters, numbers, convert to uppercase
                const cleanText = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                if (cleanText.length <= 20) {
                  setDrivingLicense(cleanText);
                }
              }}
              keyboardType="default"
              maxLength={20}
              autoCapitalize="characters"
            />
          </View>
        </View>
      </ScrollView>

      {/* Start Trip button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
                <TouchableOpacity
          style={[styles.startTripButton, isLoading && styles.buttonDisabled]} 
          onPress={validateAndProceed}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.startTripText}>Start Trip</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 40,
    paddingBottom: 100, // Add padding to account for fixed button
  },
  logo: {
    width: width * 0.8, // 80% of screen width
    height: height * 0.15, // 15% of screen height
    maxWidth: 300,
    maxHeight: 150,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 30,
    paddingBottom: 120, // Add padding to prevent overlap with fixed button
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  startTripButton: {
    backgroundColor: '#1a4d2e',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#4a4a4a',
    opacity: 0.6,
  },
  startTripText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DriverLoginScreen; 