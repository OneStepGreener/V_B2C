/**
 * API Service for Vehicle App
 * Handles all backend communication
 */

// Dynamic BASE_URL that works for both development and production
const getBaseUrl = () => {
  // Local development configuration (backend on other device)
  return 'http://192.168.4.243:5000/api';
  
  // Live server configuration (commented out)
  // return 'https://reactapp.tcil.in/aiml/LATEST_BACK_VEHICLE/api';
};

const BASE_URL = getBaseUrl();

class ApiService {
  /**
   * Authenticate driver with vehicle number and DL number
   * @param {string} vehicleNumber - 10 digit vehicle number
   * @param {string} drivingLicense - 15 digit driving license number
   * @returns {Promise<Object>} Driver data with pickup information
   */
  static async authenticateDriver(vehicleNumber, drivingLicense) {
    try {
      console.log('🚀 ===== AUTHENTICATION START =====');
      console.log('🔐 Attempting authentication...');
      console.log('📡 BASE_URL:', BASE_URL);
      console.log('📡 Full URL:', `${BASE_URL}/driver/authenticate`);
      console.log('📡 Expected URL should be: http://192.168.4.243:5000/api/driver/authenticate');
      console.log('📡 URL Match:', BASE_URL === 'http://192.168.4.243:5000/api');
      console.log('📤 Request data:', { vehicle_number: vehicleNumber, dl_number: drivingLicense });
      
      // Test basic connectivity first
      console.log('🔍 Testing basic connectivity...');
      try {
        const testResponse = await fetch(`${BASE_URL}/driver/authenticate`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('🔍 Test response status:', testResponse.status);
      } catch (testError) {
        console.error('🔍 Test connectivity failed:', testError.message);
        throw new Error(`Network connectivity test failed: ${testError.message}`);
      }

      // AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${BASE_URL}/driver/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_number: vehicleNumber,
          dl_number: drivingLicense,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      // Try JSON, fall back to text
      let data;
      const rawText = await response.text();
      console.log('📥 Raw response text:', rawText);
      console.log('📥 Raw response length:', rawText.length);
      
      try {
        data = rawText ? JSON.parse(rawText) : {};
        console.log('📥 Successfully parsed JSON');
      } catch (e) {
        console.warn('⚠️ JSON parse error:', e.message);
        console.warn('⚠️ Non-JSON response:', rawText);
        data = { error: rawText || 'Unexpected response from server' };
      }
      console.log('📥 Parsed data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || `Authentication failed (status ${response.status})`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Authentication error: request timed out');
        throw new Error('Request timed out. Please try again.');
      }
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  /**
   * Get pickup details for a specific pickup location
   * @param {string} driverId - Driver ID
   * @param {number} pickupIndex - Pickup sequence number (0-based)
   * @returns {Promise<Object>} Pickup location details
   */
  static async getPickupDetails(driverId, pickupIndex) {
    try {
      const response = await fetch(`${BASE_URL}/driver/${driverId}/pickup/${pickupIndex}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get pickup details');
      }

      return data;
    } catch (error) {
      console.error('Get pickup details error:', error);
      throw error;
    }
  }

  /**
   * Update pickup status (completed/in-progress)
   * @param {string} driverId - Driver ID
   * @param {number} pickupIndex - Pickup sequence number
   * @param {Object} updateData - Pickup completion data
   * @returns {Promise<Object>} Update response
   */
  static async updatePickupStatus(driverId, pickupIndex, updateData) {
    try {
      const response = await fetch(`${BASE_URL}/driver/${driverId}/pickup/${pickupIndex}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update pickup status');
      }

      return data;
    } catch (error) {
      console.error('Update pickup status error:', error);
      throw error;
    }
  }

  /**
   * Get all pickups for a driver
   * @param {string} driverId - Driver ID
   * @returns {Promise<Array>} List of all pickups
   */
  static async getDriverPickups(driverId) {
    try {
      const response = await fetch(`${BASE_URL}/driver/${driverId}/pickups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get driver pickups');
      }

      return data;
    } catch (error) {
      console.error('Get driver pickups error:', error);
      throw error;
    }
  }

  // ==================== NEW NORMALIZED API METHODS ====================

  /**
   * Authenticate driver using new normalized system
   * @param {string} vehicleNumber - Vehicle number
   * @param {string} drivingLicense - DL number
   * @returns {Promise<Object>} Assignment data with first stop
   */
  static async authenticateDriverV2(vehicleNumber, drivingLicense) {
    try {
      console.log('🔐 V2 Authentication attempting...');
      console.log('📡 URL:', `${BASE_URL}/driver/authenticate/v2`);
      console.log('📤 Request data:', { vehicle_number: vehicleNumber, driving_license: drivingLicense });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

      const response = await fetch(`${BASE_URL}/driver/authenticate/v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_number: vehicleNumber,
          driving_license: drivingLicense,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 V2 Response status:', response.status);
      console.log('📥 V2 Response headers:', response.headers);

      let data;
      const rawText = await response.text();
      console.log('📥 V2 Raw response text:', rawText);
      
      try {
        data = rawText ? JSON.parse(rawText) : {};
        console.log('📥 V2 Parsed data:', data);
      } catch (e) {
        console.warn('⚠️ Non-JSON response:', rawText);
        data = { error: rawText || 'Unexpected response from server' };
      }

      if (!response.ok) {
        console.error('❌ V2 Authentication failed - response not ok');
        throw new Error(data.error || `Authentication failed (status ${response.status})`);
      }

      // Validate required fields
      const requiredFields = ['assignment_id', 'driver_dl', 'vehicle_no', 'total_stops', 'driver_name', 'route_date', 'current_stop'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        console.error('❌ V2 Authentication failed - missing fields:', missingFields);
        throw new Error(`Invalid response: missing fields ${missingFields.join(', ')}`);
      }

      console.log('✅ V2 Authentication successful!');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ V2 Authentication timeout');
        throw new Error('Request timed out. Please try again.');
      }
      console.error('❌ V2 Authentication error:', error);
      throw error;
    }
  }

  /**
   * Get specific stop details from assignment
   * @param {number} assignmentId - Assignment ID
   * @param {number} sequence - Stop sequence number (1-based)
   * @returns {Promise<Object>} Stop details
   */
  static async getAssignmentStop(assignmentId, sequence) {
    try {
      const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/stops/${sequence}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get stop details');
      }

      return data;
    } catch (error) {
      console.error('Get assignment stop error:', error);
      throw error;
    }
  }

  /**
   * Mark a stop as completed
   * @param {number} assignmentId - Assignment ID
   * @param {number} sequence - Stop sequence number (1-based)
   * @param {Object} completionData - Optional completion data
   * @returns {Promise<Object>} Completion response
   */
  static async completeAssignmentStop(assignmentId, sequence, completionData = {}) {
    try {
      const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/stops/${sequence}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete stop');
      }

      return data;
    } catch (error) {
      console.error('Complete assignment stop error:', error);
      throw error;
    }
  }

  /**
   * Get assignment progress summary
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Progress data with next stop
   */
  static async getAssignmentProgress(assignmentId) {
    try {
      const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get assignment progress');
      }

      return data;
    } catch (error) {
      console.error('Get assignment progress error:', error);
      throw error;
    }
  }

  // ==================== TIMING TRACKING API METHODS ====================

  /**
   * Start trip timing
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Start trip response
   */
  static async startTrip(assignmentId) {
    try {
      const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/start-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start trip');
      }

      return data;
    } catch (error) {
      console.error('Start trip error:', error);
      throw error;
    }
  }

  /**
   * End trip timing
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} End trip response
   */
  static async endTrip(assignmentId) {
    try {
      const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/end-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to end trip');
      }

      return data;
    } catch (error) {
      console.error('End trip error:', error);
      throw error;
    }
  }

  /**
   * Start pickup timing for a specific stop
   * @param {number} assignmentId - Assignment ID
   * @param {number} sequence - Stop sequence number (1-based)
   * @returns {Promise<Object>} Start pickup response
   */
  static async startPickup(assignmentId, sequence) {
    try {
      const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/stops/${sequence}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start pickup');
      }

      return data;
    } catch (error) {
      console.error('Start pickup error:', error);
      throw error;
    }
  }

  // ==================== END TIMING TRACKING API METHODS ====================

  // ==================== PHOTO UPLOAD METHODS ====================

  /**
   * Complete assignment stop with photo upload
   * @param {number} assignmentId - Assignment ID
   * @param {number} sequence - Stop sequence number (1-based)
   * @param {Object} completionData - Completion data including photo
   * @returns {Promise<Object>} Completion response
   */
  static async completeAssignmentStopWithPhoto(assignmentId, sequence, completionData = {}) {
    try {
      console.log('📸 Completing assignment stop with photo upload...');
      console.log('📡 URL:', `${BASE_URL}/assignments/${assignmentId}/stops/${sequence}/complete`);
      console.log('📤 Completion data:', completionData);

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add text fields
      if (completionData.weight) {
        formData.append('weight', completionData.weight.toString());
      }
      if (completionData.notes) {
        formData.append('notes', completionData.notes);
      }
      
      // Add photo if provided
      if (completionData.image && completionData.image.uri) {
        const photoFile = {
          uri: completionData.image.uri,
          type: completionData.image.type || 'image/jpeg',
          name: completionData.image.fileName || `photo_${Date.now()}.jpg`
        };
        
        formData.append('photo', photoFile);
        console.log('📸 Photo added to FormData:', {
          uri: photoFile.uri,
          type: photoFile.type,
          name: photoFile.name
        });
      } else {
        console.log('⚠️ No photo provided in completion data');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for photo upload

      const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/stops/${sequence}/complete`, {
        method: 'POST',
        // Don't set Content-Type manually - let React Native set it automatically with boundary
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Photo upload response status:', response.status);

      let data;
      const rawText = await response.text();
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        console.warn('⚠️ Non-JSON response:', rawText);
        data = { error: rawText || 'Unexpected response from server' };
      }

      console.log('📥 Photo upload response data:', data);

      if (!response.ok) {
        console.error('❌ Photo upload failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.error || `Photo upload failed (status ${response.status})`);
      }

      console.log('✅ Photo uploaded and stop completed successfully!');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Photo upload timeout');
        throw new Error('Photo upload timed out. Please try again.');
      }
      console.error('❌ Photo upload error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  }

  // ==================== END PHOTO UPLOAD METHODS ====================
}

export default ApiService;
