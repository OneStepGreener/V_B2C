// App Configuration
export const APP_CONFIG = {
  // App branding
  APP_NAME: 'OneStepGreener',
  APP_TAGLINE: 'Greener together',
  
  // Splash screen duration (in milliseconds)
  SPLASH_DURATION: 2000,
  
  // Validation rules
  VALIDATION: {
    VEHICLE_NUMBER_LENGTH: 10,
    DRIVING_LICENSE_LENGTH: 15,
    MIN_WEIGHT: 0.1,
    MAX_WEIGHT: 1000,
  },
  
  // Colors
  COLORS: {
    PRIMARY_BACKGROUND: '#1a1a1a',
    ACCENT_GREEN: '#1a4d2e',
    WHITE: '#ffffff',
    BLACK: '#000000',
    RED: '#ff0000',
    GRAY: '#666666',
    LIGHT_GRAY: '#f0f0f0',
  },
  
  // Mock data for development
  MOCK_DATA: {
    TASK_PROGRESS: {
      current: 1,
      total: 50,
    },
    SAMPLE_ADDRESS: 'H no 2-250, Mayavati nagar, Gurugram',
    SAMPLE_COORDINATES: {
      latitude: 28.4595,
      longitude: 77.0266,
    },
  },
  
  // Camera settings
  CAMERA: {
    QUALITY: 0.8,
    MAX_WIDTH: 2000,
    MAX_HEIGHT: 2000,
    ALLOW_EDITING: false,
    INCLUDE_BASE64: false,
  },
};

// Dynamic API Configuration (for backend integration)
const getApiBaseUrl = () => {
  // Backend server configuration (other device)
  return 'http://192.168.4.243:5000/api';
  
  // Live server configuration (commented out)
  // return 'https://reactapp.tcil.in/aiml/LATEST_BACK_VEHICLE/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    LOGIN: '/driver/authenticate',
    LOGIN_V2: '/driver/authenticate/v2', // New V2 endpoint
    PICKUP_DETAILS: '/driver/{driverId}/pickup/{pickupIndex}',
    UPDATE_PICKUP: '/driver/{driverId}/pickup/{pickupIndex}/update',
    DRIVER_PICKUPS: '/driver/{driverId}/pickups',
    // V2 endpoints
    ASSIGNMENT_STOP: '/assignments/{assignmentId}/stops/{sequence}',
    COMPLETE_STOP: '/assignments/{assignmentId}/stops/{sequence}/complete',
    ASSIGNMENT_PROGRESS: '/assignments/{assignmentId}/progress',
  },
  TIMEOUT: 30000, // Increased to 30 seconds for V2
};

// Navigation Configuration
export const NAVIGATION_CONFIG = {
  SCREENS: {
    SPLASH: 'Splash',
    DRIVER_LOGIN: 'DriverLogin',
    PICKUP_START: 'PickupStart',
    UPDATING_STATS: 'UpdatingStats',
    FINAL_PICKUP: 'FinalPickup',
  },
}; 