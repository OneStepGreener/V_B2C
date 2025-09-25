import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import PickupController from '../controllers/PickupController';

const { width, height } = Dimensions.get('window');

const PickupStartScreen = ({ navigation, route }) => {
  const [pickupDetails, setPickupDetails] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPickupData();
  }, []);

  const loadPickupData = async () => {
    try {
      setIsLoading(true);
      
      // Get current pickup details
      const details = await PickupController.getCurrentPickupDetails();
      const progressData = await PickupController.getPickupProgress();
      
      if (details) {
        setPickupDetails(details);
        setProgress(progressData);
      } else {
        Alert.alert('Error', 'No pickup data found. Please login again.');
        navigation.navigate('DriverLogin');
      }
    } catch (error) {
      console.error('Error loading pickup data:', error);
      Alert.alert('Error', 'Failed to load pickup data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNavigation = async () => {
    if (!pickupDetails) return;
    
    try {
      // Create Google Maps URL with coordinates
      const url = `https://www.google.com/maps/search/?api=1&query=${pickupDetails.latitude},${pickupDetails.longitude}`;
      
      // Try to open Google Maps directly
      await Linking.openURL(url);
    } catch (error) {
      // If Google Maps app fails, try opening in browser
      try {
        const browserUrl = `https://maps.google.com/maps?q=${pickupDetails.latitude},${pickupDetails.longitude}`;
        await Linking.openURL(browserUrl);
      } catch (browserError) {
        Alert.alert(
          'Navigation Error',
          'Failed to open navigation. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleStartPickup = async () => {
    try {
      // Start pickup timing
      console.log('🚀 Starting pickup timing...');
      const startResult = await PickupController.startCurrentPickup();
      
      if (startResult.success) {
        console.log('✅ Pickup timing started successfully');
        // Pass pickup details to UpdatingStats screen
        navigation.navigate('UpdatingStats', { 
          pickupDetails,
          progress 
        });
      } else {
        console.error('❌ Failed to start pickup timing:', startResult.error);
        Alert.alert('Warning', 'Failed to start pickup timing, but continuing...');
        // Continue anyway
        navigation.navigate('UpdatingStats', { 
          pickupDetails,
          progress 
        });
      }
    } catch (error) {
      console.error('❌ Error starting pickup timing:', error);
      Alert.alert('Warning', 'Failed to start pickup timing, but continuing...');
      // Continue anyway
      navigation.navigate('UpdatingStats', { 
        pickupDetails,
        progress 
      });
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <ActivityIndicator size="large" color="#1a4d2e" />
        <Text style={styles.loadingText}>Loading pickup details...</Text>
      </View>
    );
  }

  // Show error if no pickup data
  if (!pickupDetails) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <Text style={styles.errorText}>No pickup data available</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={loadPickupData}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Main white card */}
      <View style={styles.mainCard}>
        {/* Task progress */}
        <View style={styles.taskProgress}>
          <Text style={styles.currentTask}>{pickupDetails.pickupIndex}</Text>
          <Text style={styles.totalTasks}> /{pickupDetails.totalPickups}</Text>
        </View>
        
        {/* Customer name */}
        <View style={styles.customerSection}>
          <Text style={styles.customerName}>{pickupDetails.customerName}</Text>
        </View>

        {/* Address section */}
        <View style={styles.addressSection}>
          <Text style={styles.addressTitle}>Address</Text>
          <Text style={styles.addressText}>{pickupDetails.address}</Text>
          {(pickupDetails.city || pickupDetails.pincode) && (
            <Text style={styles.locationText}>
              {pickupDetails.city && pickupDetails.city}
              {pickupDetails.city && pickupDetails.pincode && ', '}
              {pickupDetails.pincode && pickupDetails.pincode}
            </Text>
          )}
          {pickupDetails.customerId && (
            <Text style={styles.customerIdText}>Customer ID: {pickupDetails.customerId}</Text>
          )}
          {pickupDetails.nextPickupDate && (
            <Text style={styles.dateText}>Next Pickup: {pickupDetails.nextPickupDate}</Text>
          )}
        </View>

        {/* Start Navigation button - Centered */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navigationButton} onPress={handleStartNavigation}>
            <Text style={styles.navigationText}>START NAVIGATION</Text>
            <Image 
              source={require('../assets/image/navigation.png')}
              style={styles.navigationIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Start Pickup button */}
      <TouchableOpacity style={styles.startPickupButton} onPress={handleStartPickup}>
        <Text style={styles.startPickupText}>Start Pickup</Text>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    height: height * 0.6, // Decrease card size to 60% of screen height
    width: '90%', // Decrease card width to 90%
    alignSelf: 'center', // Center the card
    justifyContent: 'space-between',
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  currentTask: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalTasks: {
    fontSize: 18,
    color: '#666',
    fontWeight: '400',
  },
  customerSection: {
    marginBottom: 15,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  addressSection: {
    marginVertical: 20,
  },
  addressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  addressText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 24,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  customerIdText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1a4d2e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navigationButton: {
    backgroundColor: '#1a4d2e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  navigationIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  startPickupButton: {
    backgroundColor: '#1a4d2e', // Same color as Start Navigation button
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    alignSelf: 'center', // Center the button
    width: '90%', // Match card width
  },
  startPickupText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PickupStartScreen; 