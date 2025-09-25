/**
 * Authentication Controller
 * Handles driver login and session management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

class AuthController {
  /**
   * Authenticate driver and store session data
   * @param {string} vehicleNumber - 10 digit vehicle number
   * @param {string} drivingLicense - 15 digit driving license number
   * @returns {Promise<Object>} Authentication result
   */
  static async login(vehicleNumber, drivingLicense) {
    try {
      console.log('🚀 ===== AUTHCONTROLLER LOGIN START =====');
      console.log('🚀 Vehicle:', vehicleNumber, 'DL:', drivingLicense);
      
      // Validate input format
      if (vehicleNumber.length < 8 || vehicleNumber.length > 15) {
        throw new Error('Vehicle number must be 8-15 characters');
      }

      if (drivingLicense.length < 10 || drivingLicense.length > 20) {
        throw new Error('Driving license number must be 10-20 characters');
      }

      // Authenticate with backend
      console.log('🔍 AuthController: About to call ApiService.authenticateDriver...');
      console.log('🔍 AuthController: Vehicle:', vehicleNumber, 'DL:', drivingLicense);
      
      const driverData = await ApiService.authenticateDriver(vehicleNumber, drivingLicense);
      console.log('🔍 AuthController: ApiService.authenticateDriver completed successfully');
      
      console.log('🔍 AuthController: Backend response:', JSON.stringify(driverData, null, 2));
      console.log('🔍 AuthController: Pickups array:', driverData.pickups);
      console.log('🔍 AuthController: Pickups type:', typeof driverData.pickups);
      console.log('🔍 AuthController: Pickups is array:', Array.isArray(driverData.pickups));
      console.log('🔍 AuthController: Pickups length:', driverData.pickups ? driverData.pickups.length : 'undefined');
      console.log('🔍 AuthController: Total pickups:', driverData.total_pickups);

      // Temporarily remove validation to see what data we actually get
      // if (!driverData.pickups || driverData.pickups.length === 0) {
      //   throw new Error('No pickup assignments found for this vehicle.');
      // }

      // Store driver session data
      await this.storeDriverSession(driverData);

      return {
        success: true,
        driver: driverData,
        message: 'Login successful'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Login failed'
      };
    }
  }

  /**
   * Store driver session data locally
   * @param {Object} driverData - Driver information from backend
   */
  static async storeDriverSession(driverData) {
    try {
      const sessionData = {
        driverId: driverData.driver_id,
        vehicleNumber: driverData.vehicle_number,
        driverName: driverData.driver_name,
        currentPickupIndex: 0, // Start with first pickup
        totalPickups: driverData.total_pickups,
        pickups: driverData.pickups,
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.setItem('driverSession', JSON.stringify(sessionData));
      await AsyncStorage.setItem('isLoggedIn', 'true');

    } catch (error) {
      console.error('Error storing driver session:', error);
      throw new Error('Failed to store session data');
    }
  }

  /**
   * Get current driver session
   * @returns {Promise<Object|null>} Driver session data or null
   */
  static async getDriverSession() {
    try {
      const sessionData = await AsyncStorage.getItem('driverSession');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting driver session:', error);
      return null;
    }
  }

  /**
   * Update current pickup index
   * @param {number} pickupIndex - New pickup index
   */
  static async updateCurrentPickupIndex(pickupIndex) {
    try {
      const sessionData = await this.getDriverSession();
      if (sessionData) {
        sessionData.currentPickupIndex = pickupIndex;
        await AsyncStorage.setItem('driverSession', JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Error updating pickup index:', error);
    }
  }

  /**
   * Check if driver is logged in
   * @returns {Promise<boolean>} Login status
   */
  static async isLoggedIn() {
    try {
      const loginStatus = await AsyncStorage.getItem('isLoggedIn');
      return loginStatus === 'true';
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Logout driver and clear session
   */
  static async logout() {
    try {
      await AsyncStorage.removeItem('driverSession');
      await AsyncStorage.removeItem('isLoggedIn');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Get current pickup information
   * @returns {Promise<Object|null>} Current pickup data
   */
  static async getCurrentPickup() {
    try {
      const sessionData = await this.getDriverSession();
      if (!sessionData || !sessionData.pickups) {
        return null;
      }

      const currentIndex = sessionData.currentPickupIndex;
      const pickup = sessionData.pickups[currentIndex];

      return {
        pickup,
        index: currentIndex,
        isLast: currentIndex >= sessionData.totalPickups - 1
      };
    } catch (error) {
      console.error('Error getting current pickup:', error);
      return null;
    }
  }

  /**
   * Move to next pickup
   * @returns {Promise<Object|null>} Next pickup data or null if no more pickups
   */
  static async moveToNextPickup() {
    try {
      const sessionData = await this.getDriverSession();
      if (!sessionData) {
        return null;
      }

      const nextIndex = sessionData.currentPickupIndex + 1;
      
      if (nextIndex >= sessionData.totalPickups) {
        return null; // No more pickups
      }

      await this.updateCurrentPickupIndex(nextIndex);
      
      return {
        pickup: sessionData.pickups[nextIndex],
        index: nextIndex,
        isLast: nextIndex >= sessionData.totalPickups - 1
      };
    } catch (error) {
      console.error('Error moving to next pickup:', error);
      return null;
    }
  }

  // ==================== NEW NORMALIZED AUTH METHODS ====================

  /**
   * Authenticate driver using new normalized system (V2)
   * @param {string} vehicleNumber - Vehicle number
   * @param {string} drivingLicense - DL number
   * @returns {Promise<Object>} Authentication result
   */
  static async loginV2(vehicleNumber, drivingLicense) {
    try {
      // Validate input format
      if (vehicleNumber.length < 8 || vehicleNumber.length > 15) {
        throw new Error('Vehicle number must be 8-15 characters');
      }

      if (drivingLicense.length < 10 || drivingLicense.length > 20) {
        throw new Error('Driving license number must be 10-20 characters');
      }

      // Authenticate with backend V2
      console.log('🔐 AuthController: About to call ApiService.authenticateDriverV2...');
      const assignmentData = await ApiService.authenticateDriverV2(vehicleNumber, drivingLicense);
      console.log('🔐 AuthController: ApiService.authenticateDriverV2 completed:', assignmentData);

      // Start trip timing
      console.log('🚀 AuthController: Starting trip timing...');
      await ApiService.startTrip(assignmentData.assignment_id);
      console.log('✅ AuthController: Trip timing started successfully');

      // Store assignment session data
      await this.storeAssignmentSession(assignmentData);

      return {
        success: true,
        assignment: assignmentData,
        message: 'Login successful'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Login failed'
      };
    }
  }

  /**
   * Store assignment session data locally
   * @param {Object} assignmentData - Assignment information from backend
   */
  static async storeAssignmentSession(assignmentData) {
    try {
      const sessionData = {
        assignmentId: assignmentData.assignment_id,
        vehicleNumber: assignmentData.vehicle_no,
        driverName: assignmentData.driver_name,
        routeDate: assignmentData.route_date,
        totalStops: assignmentData.total_stops,
        currentSequence: assignmentData.current_stop.sequence, // Get sequence from current_stop
        currentStop: assignmentData.current_stop,
        loginTime: new Date().toISOString(),
        isV2: true // Flag to identify V2 session
      };

      await AsyncStorage.setItem('assignmentSession', JSON.stringify(sessionData));
      await AsyncStorage.setItem('isLoggedIn', 'true');

    } catch (error) {
      console.error('Error storing assignment session:', error);
      throw new Error('Failed to store session data');
    }
  }

  /**
   * Get current assignment session
   * @returns {Promise<Object|null>} Assignment session data or null
   */
  static async getAssignmentSession() {
    try {
      const sessionData = await AsyncStorage.getItem('assignmentSession');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting assignment session:', error);
      return null;
    }
  }

  /**
   * Get current stop information (V2)
   * @returns {Promise<Object|null>} Current stop data
   */
  static async getCurrentStopV2() {
    try {
      const sessionData = await this.getAssignmentSession();
      if (!sessionData) {
        return null;
      }

      // Get fresh stop data from backend
      const stopData = await ApiService.getAssignmentStop(
        sessionData.assignmentId, 
        sessionData.currentSequence
      );

      return {
        stop: stopData.stop,
        sequence: sessionData.currentSequence,
        isLast: sessionData.currentSequence >= sessionData.totalStops
      };
    } catch (error) {
      console.error('Error getting current stop V2:', error);
      return null;
    }
  }

  /**
   * Complete current stop and move to next (V2)
   * @param {Object} completionData - Optional completion data
   * @returns {Promise<Object|null>} Next stop data or null if no more stops
   */
  static async completeCurrentStopV2(completionData = {}) {
    try {
      const sessionData = await this.getAssignmentSession();
      if (!sessionData) {
        return null;
      }

      // Mark current stop as completed
      await ApiService.completeAssignmentStop(
        sessionData.assignmentId,
        sessionData.currentSequence,
        completionData
      );

      const nextSequence = sessionData.currentSequence + 1;
      
      if (nextSequence > sessionData.totalStops) {
        return null; // No more stops
      }

      // Update session with next sequence
      sessionData.currentSequence = nextSequence;
      await AsyncStorage.setItem('assignmentSession', JSON.stringify(sessionData));

      // Get next stop data
      const nextStopData = await ApiService.getAssignmentStop(
        sessionData.assignmentId,
        nextSequence
      );

      return {
        stop: nextStopData.stop,
        sequence: nextSequence,
        isLast: nextSequence >= sessionData.totalStops
      };
    } catch (error) {
      console.error('Error completing stop V2:', error);
      return null;
    }
  }

  /**
   * Get assignment progress (V2)
   * @returns {Promise<Object|null>} Progress data
   */
  static async getAssignmentProgressV2() {
    try {
      const sessionData = await this.getAssignmentSession();
      if (!sessionData) {
        return null;
      }

      const progressData = await ApiService.getAssignmentProgress(sessionData.assignmentId);
      return progressData;
    } catch (error) {
      console.error('Error getting assignment progress V2:', error);
      return null;
    }
  }

  /**
   * Logout and clear V2 session
   */
  static async logoutV2() {
    try {
      await AsyncStorage.removeItem('assignmentSession');
      await AsyncStorage.removeItem('isLoggedIn');
    } catch (error) {
      console.error('Error during V2 logout:', error);
    }
  }

  // ==================== END NEW NORMALIZED AUTH METHODS ====================
}

export default AuthController;

