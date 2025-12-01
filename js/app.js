/**
 * ShoreSquad JavaScript Application
 * Interactive beach cleanup community platform
 */

// App Configuration
const CONFIG = {
  weatherApi: {
    key: 'your-weather-api-key', // Replace with actual API key
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  },
  maps: {
    defaultCenter: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    defaultZoom: 10
  },
  animations: {
    counterSpeed: 2000,
    scrollOffset: 100
  }
};

// DOM Elements
const elements = {
  navToggle: document.querySelector('.nav-toggle'),
  navMenu: document.querySelector('.nav-menu'),
  heroStats: document.querySelectorAll('.stat-number'),
  signupForm: document.querySelector('.signup-form'),
  weatherWidget: document.getElementById('weather-widget'),
  mapDisplay: document.getElementById('interactive-map'),
  locationInput: document.getElementById('location-input'),
  searchBtn: document.querySelector('.search-btn'),
  cleanupList: document.querySelector('.cleanup-list')
};

// App State
let appState = {
  userLocation: null,
  weatherData: null,
  cleanupEvents: [],
  map: null,
  isMapLoaded: false
};

/**
 * Initialize the application
 */
function initApp() {
  console.log('🌊 ShoreSquad App Initializing...');
  
  // Initialize components
  initNavigation();
  initScrollEffects();
  initAnimatedCounters();
  initWeatherWidget();
  initMapPlaceholder();
  initFormHandling();
  initLocationFeatures();
  
  // Load initial data
  loadCleanupEvents();
  
  console.log('✅ ShoreSquad App Ready!');
}

/**
 * Navigation Menu Toggle
 */
function initNavigation() {
  if (!elements.navToggle || !elements.navMenu) return;
  
  elements.navToggle.addEventListener('click', toggleNavMenu);
  
  // Close menu on link click (mobile)
  elements.navMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      closeNavMenu();
    }
  });
  
  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      closeNavMenu();
    }
  });
  
  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function toggleNavMenu() {
  const isOpen = elements.navMenu.classList.contains('active');
  
  if (isOpen) {
    closeNavMenu();
  } else {
    openNavMenu();
  }
}

function openNavMenu() {
  elements.navMenu.classList.add('active');
  elements.navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeNavMenu() {
  elements.navMenu.classList.remove('active');
  elements.navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/**
 * Scroll Effects and Animations
 */
function initScrollEffects() {
  // Header background on scroll
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }
  });
  
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('.feature-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

/**
 * Animated Counters
 */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.stat-number');
  let animated = false;
  
  const animateCounters = () => {
    if (animated) return;
    animated = true;
    
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      const duration = CONFIG.animations.counterSpeed;
      const step = target / (duration / 16); // 60fps
      let current = 0;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current).toLocaleString();
      }, 16);
    });
  };
  
  // Trigger animation when hero section is visible
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
      }
    });
  }, { threshold: 0.5 });
  
  const heroSection = document.querySelector('.hero-stats');
  if (heroSection) {
    heroObserver.observe(heroSection);
  }
}

/**
 * Weather Widget
 */
function initWeatherWidget() {
  if (!elements.weatherWidget) return;
  
  // Get user location and load weather
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        appState.userLocation = { lat: latitude, lng: longitude };
        loadWeatherData(latitude, longitude);
      },
      error => {
        console.warn('Geolocation denied:', error);
        loadDefaultWeather();
      }
    );
  } else {
    loadDefaultWeather();
  }
}

function loadDefaultWeather() {
  // Load weather for default location (LA)
  loadWeatherData(CONFIG.maps.defaultCenter.lat, CONFIG.maps.defaultCenter.lng);
}

function loadWeatherData(lat, lng) {
  // Simulate weather API call (replace with actual API)
  setTimeout(() => {
    const mockWeatherData = {
      location: 'Los Angeles, CA',
      temperature: 24,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12,
      uvIndex: 6,
      cleanupCondition: 'Perfect for beach cleanup! 🌞'
    };
    
    displayWeather(mockWeatherData);
  }, 1000);
}

function displayWeather(data) {
  if (!elements.weatherWidget) return;
  
  elements.weatherWidget.innerHTML = `
    <div class="weather-content">
      <div class="weather-header">
        <h3>${data.location}</h3>
        <div class="weather-temp">${data.temperature}°C</div>
      </div>
      
      <div class="weather-details">
        <div class="weather-condition">
          <i class="fas fa-sun"></i>
          <span>${data.condition}</span>
        </div>
        
        <div class="weather-metrics">
          <div class="metric">
            <i class="fas fa-tint"></i>
            <span>Humidity: ${data.humidity}%</span>
          </div>
          <div class="metric">
            <i class="fas fa-wind"></i>
            <span>Wind: ${data.windSpeed} km/h</span>
          </div>
          <div class="metric">
            <i class="fas fa-sun"></i>
            <span>UV Index: ${data.uvIndex}</span>
          </div>
        </div>
        
        <div class="cleanup-recommendation">
          <strong>${data.cleanupCondition}</strong>
        </div>
      </div>
    </div>
  `;
  
  appState.weatherData = data;
}

/**
 * Map Placeholder and Interaction
 */
function initMapPlaceholder() {
  if (!elements.mapDisplay) return;
  
  // Simulate map loading
  setTimeout(() => {
    elements.mapDisplay.innerHTML = `
      <div class="map-placeholder">
        <div class="map-icon">
          <i class="fas fa-map-marked-alt fa-3x"></i>
        </div>
        <h3>Interactive Beach Map</h3>
        <p>Click to view cleanup locations near you</p>
        <button class="load-map-btn" onclick="loadInteractiveMap()">
          Load Map
        </button>
      </div>
    `;
  }, 500);
  
  // Location search functionality
  if (elements.locationInput && elements.searchBtn) {
    elements.searchBtn.addEventListener('click', handleLocationSearch);
    elements.locationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLocationSearch();
      }
    });
  }
}

function handleLocationSearch() {
  const query = elements.locationInput.value.trim();
  if (!query) return;
  
  // Simulate location search
  showSearchResults(query);
}

function showSearchResults(query) {
  if (!elements.cleanupList) return;
  
  // Mock search results
  const mockResults = [
    {
      name: 'Santa Monica Beach Cleanup',
      date: '2025-12-15',
      time: '09:00 AM',
      participants: 45,
      distance: '2.3 km'
    },
    {
      name: 'Venice Beach Environmental Day',
      date: '2025-12-18',
      time: '10:30 AM',
      participants: 32,
      distance: '4.1 km'
    },
    {
      name: 'Malibu Shore Restoration',
      date: '2025-12-22',
      time: '08:00 AM',
      participants: 67,
      distance: '12.8 km'
    }
  ];
  
  elements.cleanupList.innerHTML = mockResults.map(event => `
    <li class="cleanup-event">
      <div class="event-header">
        <h4>${event.name}</h4>
        <span class="event-distance">${event.distance} away</span>
      </div>
      <div class="event-details">
        <div class="event-date">
          <i class="fas fa-calendar"></i>
          ${formatDate(event.date)} at ${event.time}
        </div>
        <div class="event-participants">
          <i class="fas fa-users"></i>
          ${event.participants} joined
        </div>
      </div>
      <button class="join-event-btn" data-event="${event.name}">
        Join Cleanup
      </button>
    </li>
  `).join('');
  
  // Add event listeners for join buttons
  document.querySelectorAll('.join-event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventName = e.target.dataset.event;
      handleJoinEvent(eventName);
    });
  });
}

function loadInteractiveMap() {
  if (!elements.mapDisplay) return;
  
  elements.mapDisplay.innerHTML = `
    <div class="map-loading">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p>Loading interactive map...</p>
    </div>
  `;
  
  // Simulate loading Google Maps or similar
  setTimeout(() => {
    elements.mapDisplay.innerHTML = `
      <div class="map-content">
        <div class="map-overlay">
          <h3>🗺️ Interactive Beach Map</h3>
          <p>This would display an actual map with cleanup locations</p>
          <p>Integration ready for Google Maps, Leaflet, or Mapbox</p>
        </div>
      </div>
    `;
    appState.isMapLoaded = true;
  }, 2000);
}

/**
 * Form Handling
 */
function initFormHandling() {
  if (!elements.signupForm) return;
  
  elements.signupForm.addEventListener('submit', handleFormSubmission);
  
  // Real-time validation
  const formInputs = elements.signupForm.querySelectorAll('input');
  formInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearError(input));
  });
}

function validateField(input) {
  const value = input.value.trim();
  const errorElement = document.getElementById(`${input.name}-error`);
  
  let isValid = true;
  let errorMessage = '';
  
  switch (input.type) {
    case 'email':
      if (!isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
      break;
    case 'text':
      if (value.length < 2) {
        isValid = false;
        errorMessage = 'Please enter at least 2 characters';
      }
      break;
  }
  
  if (errorElement) {
    errorElement.textContent = errorMessage;
    input.setAttribute('aria-invalid', !isValid);
  }
  
  return isValid;
}

function clearError(input) {
  const errorElement = document.getElementById(`${input.name}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    input.setAttribute('aria-invalid', 'false');
  }
}

function handleFormSubmission(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Validate all fields
  const inputs = e.target.querySelectorAll('input[required]');
  let isFormValid = true;
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
    }
  });
  
  if (isFormValid) {
    submitSignup(data);
  } else {
    showFormError('Please correct the errors above');
  }
}

function submitSignup(data) {
  const submitBtn = elements.signupForm.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  
  // Show loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining Squad...';
  submitBtn.disabled = true;
  
  // Simulate API call
  setTimeout(() => {
    // Success
    showSuccessMessage('Welcome to ShoreSquad! Check your email for confirmation.');
    elements.signupForm.reset();
    
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 2000);
}

function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <i class="fas fa-check-circle"></i>
    ${message}
  `;
  
  elements.signupForm.insertBefore(successDiv, elements.signupForm.firstChild);
  
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

function showFormError(message) {
  console.error('Form validation error:', message);
  // Could implement a toast notification here
}

/**
 * Location and Geolocation Features
 */
function initLocationFeatures() {
  // Request location permission if user clicks location-based features
  document.querySelectorAll('[data-requires-location]').forEach(element => {
    element.addEventListener('click', requestLocationPermission);
  });
}

function requestLocationPermission() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      appState.userLocation = { lat: latitude, lng: longitude };
      console.log('Location obtained:', appState.userLocation);
      // Update UI to show nearby cleanups
      findNearbyCleanups(latitude, longitude);
    },
    error => {
      console.error('Location error:', error);
      handleLocationError(error);
    }
  );
}

function findNearbyCleanups(lat, lng) {
  // Simulate finding nearby cleanup events
  console.log(`Finding cleanups near ${lat}, ${lng}`);
  // This would make an API call to find nearby events
}

function handleLocationError(error) {
  let message = 'Unable to get your location. ';
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message += 'Please allow location access to find nearby cleanups.';
      break;
    case error.POSITION_UNAVAILABLE:
      message += 'Location information is unavailable.';
      break;
    case error.TIMEOUT:
      message += 'Location request timed out.';
      break;
    default:
      message += 'An unknown error occurred.';
      break;
  }
  
  console.warn(message);
}

/**
 * Event Management
 */
function loadCleanupEvents() {
  // Mock data for cleanup events
  appState.cleanupEvents = [
    {
      id: 1,
      name: 'Santa Monica Beach Cleanup',
      date: '2025-12-15',
      location: { lat: 34.0195, lng: -118.4912 },
      participants: 45,
      organizer: 'LA Beach Squad'
    },
    {
      id: 2,
      name: 'Venice Beach Environmental Day',
      date: '2025-12-18',
      location: { lat: 34.0118, lng: -118.4951 },
      participants: 32,
      organizer: 'Venice Eco Warriors'
    }
  ];
}

function handleJoinEvent(eventName) {
  // Simulate joining an event
  console.log(`Joining event: ${eventName}`);
  
  // Show success feedback
  const successMessage = document.createElement('div');
  successMessage.className = 'join-success';
  successMessage.innerHTML = `
    <i class="fas fa-check-circle"></i>
    You've joined ${eventName}! Check your email for details.
  `;
  
  document.body.appendChild(successMessage);
  
  setTimeout(() => {
    successMessage.remove();
  }, 4000);
}

/**
 * Utility Functions
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Performance and Analytics
 */
function trackUserInteraction(action, details = {}) {
  console.log('User interaction:', action, details);
  // This would integrate with analytics service
}

function preloadImages() {
  // Preload important images for better performance
  const imageUrls = [
    // Add important image URLs here
  ];
  
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

/**
 * Service Worker Registration for PWA
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  }
}

/**
 * Error Handling
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Could send error to logging service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Could send error to logging service
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Export for testing or external access
window.ShoreSquad = {
  init: initApp,
  state: appState,
  config: CONFIG,
  utils: {
    formatDate,
    isValidEmail,
    debounce
  }
};