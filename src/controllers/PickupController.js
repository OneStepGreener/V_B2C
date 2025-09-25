/**
 * Pickup Controller
 * Handles pickup navigation and management
 */

import ApiService from '../services/api';
import AuthController from './AuthController';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PickupController {
  /**
   * Get navigation coordinates for current pickup
   * @returns {Promise<Object|null>} Navigation coordinates
   */
  static async getCurrentPickupNavigation() {
    try {
      const currentPickup = await AuthController.getCurrentPickup();
      
      if (!currentPickup || !currentPickup.pickup) {
        return null;
      }

      const pickup = currentPickup.pickup;
      
      return {
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        address: pickup.address,
        customerName: pickup.customer_name,
        pickupIndex: currentPickup.index,
        isLast: currentPickup.isLast
      };
    } catch (error) {
      console.error('Error getting current pickup navigation:', error);
      return null;
    }
  }

  /**
   * Get pickup details for display (V2 - Normalized System)
   * @returns {Promise<Object|null>} Pickup details
   */
  static async getCurrentPickupDetails() {
    try {
      // First try V2 system (normalized)
      const assignmentSession = await AuthController.getAssignmentSession();
      if (assignmentSession && assignmentSession.isV2) {
        console.log('🔍 Using V2 system for pickup details');
        
        // Use the current stop data from the session (from login response)
        if (assignmentSession.currentStop) {
          console.log('✅ Using current stop data from session');
          const stop = assignmentSession.currentStop;
          return {
            customerName: stop.customer_name || stop.name_snapshot || 'Customer',
            address: stop.address || stop.address_snapshot || 'Address not available',
            latitude: stop.latitude,
            longitude: stop.longitude,
            nextPickupDate: null, // Not available in V2
            pickupIndex: assignmentSession.currentSequence,
            totalPickups: assignmentSession.totalStops,
            isLast: assignmentSession.currentSequence >= assignmentSession.totalStops,
            customerId: stop.customer_id || stop.customer_id_snapshot
          };
        }
        
        // Fallback: Get current stop data from V2 system
        const currentStopData = await AuthController.getCurrentStopV2();
        if (!currentStopData || !currentStopData.stop) {
          console.error('❌ No current stop data found in V2 system');
          return null;
        }

        const stop = currentStopData.stop;
        return {
          customerName: stop.customer_name || stop.name_snapshot || 'Customer',
          address: stop.address || stop.address_snapshot || 'Address not available',
          latitude: stop.latitude,
          longitude: stop.longitude,
          nextPickupDate: null, // Not available in V2
          pickupIndex: currentStopData.sequence,
          totalPickups: assignmentSession.totalStops,
          isLast: currentStopData.isLast,
          customerId: stop.customer_id || stop.customer_id_snapshot
        };
      }

      // Fallback to V1 system for backward compatibility
      console.log('🔍 Falling back to V1 system for pickup details');
      const sessionData = await AuthController.getDriverSession();
      if (!sessionData) {
        console.error('❌ No session data found in either V1 or V2 system');
        return null;
      }

      const currentIndex = sessionData.currentPickupIndex || 0;
      
      // Fetch fresh pickup data from backend instead of using cached session data
      try {
        const freshPickupData = await ApiService.getPickupDetails(sessionData.driverId, currentIndex);
        
        return {
          customerName: freshPickupData.customer_name,
          address: freshPickupData.address,
          latitude: freshPickupData.latitude,
          longitude: freshPickupData.longitude,
          nextPickupDate: freshPickupData.next_pickup_date,
          pickupIndex: currentIndex + 1, // Display as 1-based
          totalPickups: sessionData.totalPickups || 0,
          isLast: currentIndex >= (sessionData.totalPickups - 1)
        };
      } catch (apiError) {
        console.error('Error fetching fresh pickup data, falling back to session:', apiError);
        
        // Fallback to session data if API call fails
        const currentPickup = await AuthController.getCurrentPickup();
        if (!currentPickup || !currentPickup.pickup) {
          return null;
        }

        const pickup = currentPickup.pickup;
        return {
          customerName: pickup.customer_name,
          address: pickup.address,
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          nextPickupDate: pickup.next_pickup_date,
          pickupIndex: currentPickup.index + 1,
          totalPickups: sessionData.totalPickups || 0,
          isLast: currentPickup.isLast
        };
      }
    } catch (error) {
      console.error('Error getting pickup details:', error);
      return null;
    }
  }

  /**
   * Start pickup timing for current stop (V2 - Normalized System)
   * @returns {Promise<Object>} Start pickup response
   */
  static async startCurrentPickup() {
    try {
      const assignmentSession = await AuthController.getAssignmentSession();
      if (assignmentSession && assignmentSession.isV2) {
        console.log('🚀 Starting pickup timing for V2 system');
        
        // Start pickup timing
        const startResult = await ApiService.startPickup(
          assignmentSession.assignmentId,
          assignmentSession.currentSequence
        );
        
        console.log('✅ Pickup timing started:', startResult);
        
        return {
          success: true,
          message: 'Pickup started successfully',
          pickupStartedAt: startResult.pickup_started_at
        };
      }
      
      return {
        success: false,
        error: 'V2 session not found'
      };
    } catch (error) {
      console.error('Error starting pickup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete current pickup and move to next (V2 - Normalized System)
   * @param {Object} completionData - Pickup completion data
   * @returns {Promise<Object>} Next pickup data or completion status
   */
  static async completeCurrentPickup(completionData = {}) {
    try {
      // First try V2 system (normalized)
      const assignmentSession = await AuthController.getAssignmentSession();
      if (assignmentSession && assignmentSession.isV2) {
        console.log('🔍 Using V2 system for completing pickup');
        
        // Use the new photo upload API method (this handles everything)
        const completionResult = await ApiService.completeAssignmentStopWithPhoto(
          assignmentSession.assignmentId,
          assignmentSession.currentSequence,
          completionData
        );
        
        console.log('✅ Pickup completed with photo upload:', completionResult);
        
        // Manually move to next stop in session (since we already completed via API)
        const nextSequence = assignmentSession.currentSequence + 1;
        
        if (nextSequence > assignmentSession.totalStops) {
          // No more stops - all completed
          return {
            success: true,
            hasNext: false,
            message: 'All pickups completed!'
          };
        }
        
        // Update session with next sequence
        assignmentSession.currentSequence = nextSequence;
        await AsyncStorage.setItem('assignmentSession', JSON.stringify(assignmentSession));
        
        // Get next stop data
        const nextStopData = await ApiService.getAssignmentStop(
          assignmentSession.assignmentId,
          nextSequence
        );
        
        if (!nextStopData) {
          // No more stops - all completed, end trip timing
          console.log('🏁 All pickups completed, ending trip timing...');
          try {
            await ApiService.endTrip(assignmentSession.assignmentId);
            console.log('✅ Trip timing ended successfully');
          } catch (tripEndError) {
            console.error('⚠️ Error ending trip timing:', tripEndError);
          }
          
          return {
            success: true,
            hasNext: false,
            message: 'All pickups completed!'
          };
        }

        const stop = nextStopData.stop;
        return {
          success: true,
          hasNext: true,
          nextPickup: {
            customerName: stop.customer_name || stop.name_snapshot || 'Customer',
            address: stop.address || stop.address_snapshot || 'Address not available',
            latitude: stop.latitude,
            longitude: stop.longitude,
            pickupIndex: nextStopData.sequence,
            isLast: nextStopData.isLast,
            customerId: stop.customer_id || stop.customer_id_snapshot
          }
        };
      }

      // Fallback to V1 system for backward compatibility
      console.log('🔍 Falling back to V1 system for completing pickup');
      const sessionData = await AuthController.getDriverSession();
      if (!sessionData) {
        throw new Error('No active session found');
      }

      const currentIndex = sessionData.currentPickupIndex;
      
      // Update pickup status on backend
      await ApiService.updatePickupStatus(
        sessionData.driverId, 
        currentIndex, 
        {
          status: 'completed',
          completed_at: new Date().toISOString(),
          ...completionData
        }
      );

      // Calculate next pickup index
      const nextIndex = currentIndex + 1;
      
      // Fetch fresh pickup data from backend instead of using local session
      try {
        const freshPickupData = await ApiService.getPickupDetails(sessionData.driverId, nextIndex);
        
        // Update local session with new pickup index
        await AuthController.updateCurrentPickupIndex(nextIndex);
        
        return {
          success: true,
          hasNext: true,
          nextPickup: {
            customerName: freshPickupData.customer_name,
            address: freshPickupData.address,
            latitude: freshPickupData.latitude,
            longitude: freshPickupData.longitude,
            pickupIndex: nextIndex + 1,
            isLast: false // Will be determined by backend
          }
        };
      } catch (pickupError) {
        // If no more pickups found in database
        if (pickupError.message.includes('not found') || pickupError.message.includes('404')) {
          return {
            success: true,
            hasNext: false,
            message: 'All pickups completed!'
          };
        }
        throw pickupError;
      }
    } catch (error) {
      console.error('Error completing pickup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Open navigation app with pickup coordinates
   * @returns {Promise<boolean>} Success status
   */
  static async openNavigation() {
    try {
      const navigation = await this.getCurrentPickupNavigation();
      
      if (!navigation) {
        throw new Error('No navigation data available');
      }

      const { latitude, longitude, address } = navigation;
      
      // Construct Google Maps URL
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(address)}`;
      
      // For React Native, you would use Linking.openURL(url)
      // This is a placeholder for the navigation opening logic
      console.log('Opening navigation to:', { latitude, longitude, address });
      
      return true;
    } catch (error) {
      console.error('Error opening navigation:', error);
      return false;
    }
  }

  /**
   * Get pickup progress information
   * @returns {Promise<Object|null>} Progress data
   */
  static async getPickupProgress() {
    try {
      // First try V2 system (normalized)
      const assignmentSession = await AuthController.getAssignmentSession();
      if (assignmentSession && assignmentSession.isV2) {
        console.log('🔍 Using V2 system for pickup progress');
        
        const current = assignmentSession.currentSequence;
        const total = assignmentSession.totalStops;
        
        return {
          current: current, // Already 1-based
          total: total,
          percentage: Math.round((current / total) * 100),
          remaining: total - current
        };
      }
      
      // Fallback to V1 system for backward compatibility
      const sessionData = await AuthController.getDriverSession();
      if (!sessionData) {
        return null;
      }

      const currentIndex = sessionData.currentPickupIndex;
      const totalPickups = sessionData.totalPickups;
      
      return {
        current: currentIndex + 1, // 1-based for display
        total: totalPickups,
        percentage: Math.round(((currentIndex + 1) / totalPickups) * 100),
        remaining: totalPickups - (currentIndex + 1)
      };
    } catch (error) {
      console.error('Error getting pickup progress:', error);
      return null;
    }
  }

  /**
   * Skip current pickup (with reason)
   * @param {string} reason - Reason for skipping
   * @returns {Promise<Object>} Next pickup data or completion status
   */
  static async skipCurrentPickup(reason) {
    try {
      const sessionData = await AuthController.getDriverSession();
      if (!sessionData) {
        throw new Error('No active session found');
      }

      const currentIndex = sessionData.currentPickupIndex;
      
      // Update pickup status as skipped
      await ApiService.updatePickupStatus(
        sessionData.driverId, 
        currentIndex, 
        {
          status: 'skipped',
          skipped_at: new Date().toISOString(),
          skip_reason: reason
        }
      );

      // Calculate next pickup index
      const nextIndex = currentIndex + 1;
      
      // Fetch fresh pickup data from backend instead of using local session
      try {
        const freshPickupData = await ApiService.getPickupDetails(sessionData.driverId, nextIndex);
        
        // Update local session with new pickup index
        await AuthController.updateCurrentPickupIndex(nextIndex);
        
        return {
          success: true,
          hasNext: true,
          nextPickup: {
            customerName: freshPickupData.customer_name,
            address: freshPickupData.address,
            latitude: freshPickupData.latitude,
            longitude: freshPickupData.longitude,
            pickupIndex: nextIndex + 1,
            isLast: false // Will be determined by backend
          }
        };
      } catch (pickupError) {
        // If no more pickups found in database
        if (pickupError.message.includes('not found') || pickupError.message.includes('404')) {
          return {
            success: true,
            hasNext: false,
            message: 'All pickups processed!'
          };
        }
        throw pickupError;
      }
    } catch (error) {
      console.error('Error skipping pickup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default PickupController;

