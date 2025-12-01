/**
 * ShoreSquad JavaScript Application
 * Interactive beach cleanup community platform
 */

// App Configuration
const CONFIG = {
  weatherApi: {
    neaUrl: 'https://api.data.gov.sg/v1/environment/24-hour-weather-forecast',
    fallbackUrl: 'https://api.data.gov.sg/v1/environment/air-temperature'
  },
  maps: {
    defaultCenter: { lat: 1.381497, lng: 103.955574 }, // Pasir Ris, Singapore
    defaultZoom: 10
  },
  animations: {
    counterSpeed: 2000,
    scrollOffset: 100
  },
  chat: {
    tawkPropertyId: 'default', // Replace with actual Tawk.to property ID
    enabled: true
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
  
  try {
    // Initialize core components
    initNavigation();
    initScrollEffects();
    initAnimatedCounters();
    initWeatherWidget();
    initMapPlaceholder();
    initFormHandling();
    initLocationFeatures();
    
    // Initialize additional features
    initChatWidget();
    monitorPerformance();
    initMobileOptimizations();
    
    // Load initial data
    loadCleanupEvents();
    
    console.log('✅ ShoreSquad App Ready!');
    trackUserInteraction('app_initialized');
    
    // Show app is ready
    document.body.classList.add('app-ready');
    
  } catch (error) {
    logError(error, 'App Initialization');
    console.error('❌ App initialization failed:', error);
    
    // Show fallback UI
    showFallbackUI();
  }
}

function showFallbackUI() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'app-error-fallback';
    fallbackDiv.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h2>Something went wrong</h2>
        <p>We're experiencing technical difficulties. Please refresh the page or try again later.</p>
        <button onclick="location.reload()" class="retry-btn">
          <i class="fas fa-redo"></i> Refresh Page
        </button>
      </div>
    `;
    mainContent.prepend(fallbackDiv);
  }
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
  
  // Show initial loading state
  showWeatherLoading();
  
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
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  } else {
    loadDefaultWeather();
  }
}

function showWeatherLoading() {
  if (!elements.weatherWidget) return;
  
  elements.weatherWidget.innerHTML = `
    <div class="loading-overlay">
      <div class="spinner-large"></div>
      <div class="loading-text">Getting Singapore weather data...</div>
    </div>
  `;
}

function loadDefaultWeather() {
  // Load weather for default location (LA)
  loadWeatherData(CONFIG.maps.defaultCenter.lat, CONFIG.maps.defaultCenter.lng);
}

async function loadWeatherData(lat, lng) {
  try {
    console.log('🌤️ Loading NEA weather data...');
    
    // Fetch 24-hour weather forecast from NEA API
    const response = await fetch(CONFIG.weatherApi.neaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`NEA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ NEA API Response:', data);
    
    // Parse NEA weather data
    const weatherData = parseNEAWeatherData(data);
    displayWeather(weatherData);
    
  } catch (error) {
    console.error('❌ Weather API Error:', error);
    handleWeatherError(error);
  }
}

function parseNEAWeatherData(neaData) {
  try {
    const forecast = neaData.items?.[0];
    const general = forecast?.general;
    const periods = forecast?.periods;
    
    if (!forecast || !general) {
      throw new Error('Invalid NEA data structure');
    }
    
    // Get current period forecast
    const currentTime = new Date();
    const currentPeriod = periods?.find(period => {
      const startTime = new Date(period.time.start);
      const endTime = new Date(period.time.end);
      return currentTime >= startTime && currentTime <= endTime;
    }) || periods?.[0];
    
    const temperature = {
      min: general.temperature?.low || 26,
      max: general.temperature?.high || 32,
      current: Math.round((general.temperature?.low + general.temperature?.high) / 2) || 29
    };
    
    // Determine cleanup conditions
    const forecast_text = currentPeriod?.regions?.national || general.forecast || 'Fair weather';
    const cleanupCondition = getCleanupCondition(forecast_text.toLowerCase());
    
    return {
      location: 'Singapore',
      temperature: temperature.current,
      temperatureRange: `${temperature.min}-${temperature.max}°C`,
      condition: currentPeriod?.regions?.national || general.forecast || 'Fair',
      humidity: general.relative_humidity?.high || 85,
      windSpeed: Math.round(Math.random() * 10 + 10), // NEA doesn't provide wind in this endpoint
      uvIndex: Math.round(Math.random() * 5 + 3), // Estimate
      cleanupCondition: cleanupCondition,
      lastUpdated: forecast.timestamp,
      source: 'NEA Singapore'
    };
  } catch (parseError) {
    console.error('❌ Error parsing NEA data:', parseError);
    throw new Error('Failed to parse weather data');
  }
}

function getCleanupCondition(forecast) {
  if (forecast.includes('rain') || forecast.includes('shower') || forecast.includes('thundery')) {
    return 'Not ideal for cleanup - rain expected 🌧️';
  } else if (forecast.includes('cloudy') || forecast.includes('partly')) {
    return 'Good conditions for cleanup! 🌤️';
  } else if (forecast.includes('fair') || forecast.includes('sunny')) {
    return 'Perfect for beach cleanup! ☀️';
  } else {
    return 'Check weather before heading out! 🌊';
  }
}

function handleWeatherError(error) {
  console.error('Weather service unavailable:', error.message);
  
  // Display fallback weather data
  const fallbackData = {
    location: 'Singapore',
    temperature: 29,
    temperatureRange: '26-32°C',
    condition: 'Weather data unavailable',
    humidity: 75,
    windSpeed: 12,
    uvIndex: 5,
    cleanupCondition: 'Check local weather before cleanup! 🌊',
    lastUpdated: new Date().toISOString(),
    source: 'Fallback Data',
    error: true
  };
  
  displayWeather(fallbackData);
  
  // Show user-friendly error message
  showWeatherErrorNotification();
}

function showWeatherErrorNotification() {
  const notification = document.createElement('div');
  notification.className = 'weather-error-notification';
  notification.innerHTML = `
    <div class="error-content">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Weather data temporarily unavailable. Showing approximate conditions.</span>
      <button onclick="this.parentElement.parentElement.remove()" aria-label="Close notification">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function displayWeather(data) {
  if (!elements.weatherWidget) return;
  
  const weatherIcon = getWeatherIcon(data.condition);
  const errorClass = data.error ? 'weather-error' : '';
  const updateTime = new Date(data.lastUpdated).toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  elements.weatherWidget.innerHTML = `
    <div class="weather-content ${errorClass}">
      <div class="weather-header">
        <div class="weather-location">
          <h3>${data.location}</h3>
          <div class="weather-source">Source: ${data.source}</div>
        </div>
        <div class="weather-temp">
          <span class="temp-main">${data.temperature}°C</span>
          ${data.temperatureRange ? `<span class="temp-range">${data.temperatureRange}</span>` : ''}
        </div>
      </div>
      
      <div class="weather-details">
        <div class="weather-condition">
          <i class="${weatherIcon}" aria-hidden="true"></i>
          <span>${data.condition}</span>
        </div>
        
        <div class="weather-metrics">
          <div class="metric">
            <i class="fas fa-tint" aria-hidden="true"></i>
            <span>Humidity: ${data.humidity}%</span>
          </div>
          <div class="metric">
            <i class="fas fa-wind" aria-hidden="true"></i>
            <span>Wind: ${data.windSpeed} km/h</span>
          </div>
          <div class="metric">
            <i class="fas fa-sun" aria-hidden="true"></i>
            <span>UV Index: ${data.uvIndex}</span>
          </div>
        </div>
        
        <div class="cleanup-recommendation">
          <strong>${data.cleanupCondition}</strong>
        </div>
        
        <div class="weather-updated">
          <i class="fas fa-clock" aria-hidden="true"></i>
          <span>Updated: ${updateTime}</span>
          <button class="refresh-weather" onclick="refreshWeatherData()" aria-label="Refresh weather data">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  appState.weatherData = data;
}

function getWeatherIcon(condition) {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return 'fas fa-cloud-rain';
  } else if (conditionLower.includes('thunder')) {
    return 'fas fa-bolt';
  } else if (conditionLower.includes('cloudy') || conditionLower.includes('partly')) {
    return 'fas fa-cloud-sun';
  } else if (conditionLower.includes('fair') || conditionLower.includes('sunny')) {
    return 'fas fa-sun';
  } else {
    return 'fas fa-cloud';
  }
}

function refreshWeatherData() {
  const refreshBtn = document.querySelector('.refresh-weather');
  if (refreshBtn) {
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  }
  
  if (appState.userLocation) {
    loadWeatherData(appState.userLocation.lat, appState.userLocation.lng);
  } else {
    loadDefaultWeather();
  }
  
  setTimeout(() => {
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    }
  }, 2000);
}

/**
 * Map Placeholder and Interaction
 */
function initMapPlaceholder() {
  if (!elements.mapDisplay) return;
  
  // Check if iframe loads successfully
  const iframe = elements.mapDisplay.querySelector('iframe');
  if (iframe) {
    iframe.addEventListener('load', () => {
      console.log('✅ Google Maps loaded successfully');
    });
    
    iframe.addEventListener('error', () => {
      console.warn('❌ Google Maps failed to load');
      handleMapError();
    });
    
    // Fallback timeout in case map doesn't load
    setTimeout(() => {
      checkMapLoaded();
    }, 5000);
  }
  
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

function checkMapLoaded() {
  const iframe = document.querySelector('#interactive-map iframe');
  if (iframe) {
    try {
      // Try to access iframe content (will fail if not loaded)
      iframe.contentWindow.location.href;
    } catch (error) {
      // If we can't access it, it might mean it's loaded from external domain (which is expected)
      console.log('Map iframe appears to be loaded from external domain (normal)');
      return;
    }
  }
}

function handleMapError() {
  console.warn('🗺️ Map loading failed, showing fallback');
  const mapDisplay = document.getElementById('interactive-map');
  if (mapDisplay) {
    const iframe = mapDisplay.querySelector('iframe');
    const fallback = mapDisplay.querySelector('.map-fallback');
    
    if (iframe) iframe.style.display = 'none';
    if (fallback) fallback.style.display = 'flex';
  }
}

function openInMaps() {
  const lat = 1.381497;
  const lng = 103.955574;
  const label = 'Pasir Ris Beach Cleanup';
  
  // Try to open in different map applications
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Try Google Maps app first, then Apple Maps
    const googleMapsUrl = `https://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&t=m&z=15`;
    const appleMapsUrl = `https://maps.apple.com/?q=${label}&ll=${lat},${lng}&z=15`;
    
    // For iOS devices, try Apple Maps first
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      window.open(appleMapsUrl, '_blank');
    } else {
      window.open(googleMapsUrl, '_blank');
    }
  } else {
    // Desktop - open Google Maps in new tab
    const desktopMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=ChIJtfj1234567890`;
    window.open(desktopMapsUrl, '_blank');
  }
  
  trackUserInteraction('map_opened_external', { lat, lng, isMobile });
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
  submitBtn.innerHTML = '<div class="spinner"></div> Joining Squad...';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';
  
  // Add loading overlay to form
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.style.position = 'absolute';
  loadingOverlay.innerHTML = `
    <div class="spinner-large"></div>
    <div class="loading-text">Creating your ShoreSquad account...</div>
  `;
  
  const formContainer = elements.signupForm.parentElement;
  formContainer.style.position = 'relative';
  formContainer.appendChild(loadingOverlay);
  
  // Simulate API call
  setTimeout(() => {
    // Remove loading overlay
    loadingOverlay.remove();
    
    // Success
    showSuccessMessage('Welcome to ShoreSquad! Check your email for confirmation.');
    elements.signupForm.reset();
    
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    
    // Track successful signup
    trackUserInteraction('user_signup_success', data);
    
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
 * Mobile and Performance Optimizations
 */
function initMobileOptimizations() {
  // Detect mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    document.body.classList.add('mobile-device');
    
    // Optimize touch events
    optimizeTouchEvents();
    
    // Reduce animations on slower devices
    if (navigator.hardwareConcurrency < 4) {
      document.body.classList.add('reduced-motion');
    }
  }
  
  // Preload critical images
  preloadCriticalAssets();
  
  // Optimize scroll performance
  optimizeScrollPerformance();
}

function optimizeTouchEvents() {
  // Add touch feedback for buttons
  document.addEventListener('touchstart', (e) => {
    if (e.target.matches('button, .btn, .nav-link')) {
      e.target.style.transform = 'scale(0.98)';
    }
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    if (e.target.matches('button, .btn, .nav-link')) {
      setTimeout(() => {
        e.target.style.transform = '';
      }, 100);
    }
  }, { passive: true });
}

function preloadCriticalAssets() {
  // Preload hero background patterns
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0,10 Q25,0 50,10 T100,10 V20 H0 Z" fill="rgba(32,178,170,0.1)"/></svg>';
  document.head.appendChild(link);
}

function optimizeScrollPerformance() {
  // Throttle scroll events
  let ticking = false;
  
  function updateScrollEffects() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Enhanced Error Handling
 */
function showEnhancedError(message, type = 'error', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `enhanced-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === 'error' ? 'fa-exclamation-circle' :
        type === 'warning' ? 'fa-exclamation-triangle' :
        type === 'success' ? 'fa-check-circle' : 'fa-info-circle'
      }"></i>
      <span>${message}</span>
      <button class="close-notification" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }
  }, duration);
  
  return notification;
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
 * Analytics and User Tracking
 */
function trackUserInteraction(action, details = {}) {
  try {
    console.log('📊 User interaction:', action, details);
    
    // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: 'user_interaction',
        event_label: JSON.stringify(details),
        custom_map: details
      });
    }
    
    // Store interaction for internal analytics
    const interaction = {
      action,
      details,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };
    
    // Could store in localStorage for offline analytics
    try {
      const interactions = JSON.parse(localStorage.getItem('shoresquad_interactions') || '[]');
      interactions.push(interaction);
      
      // Keep only last 100 interactions
      if (interactions.length > 100) {
        interactions.splice(0, interactions.length - 100);
      }
      
      localStorage.setItem('shoresquad_interactions', JSON.stringify(interactions));
    } catch (storageError) {
      console.warn('Could not store interaction data:', storageError);
    }
    
  } catch (error) {
    console.warn('Tracking failed for action:', action, error);
  }
}

/**
 * Error Handling and Logging
 */
function logError(error, context = 'General') {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error(`[${context}] Error:`, errorInfo);
  
  // In production, send to error tracking service
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: `${context}: ${error.message}`,
      fatal: false
    });
  }
  
  return errorInfo;
}

window.addEventListener('error', (event) => {
  logError(event.error, 'Global JavaScript Error');
});

window.addEventListener('unhandledrejection', (event) => {
  const error = new Error(event.reason?.message || 'Unhandled Promise Rejection');
  error.stack = event.reason?.stack;
  logError(error, 'Unhandled Promise');
  
  // Prevent the default console.error
  event.preventDefault();
});

/**
 * Chat Widget Integration
 */
function initChatWidget() {
  if (!CONFIG.chat.enabled) return;
  
  try {
    // Tawk.to configuration
    if (typeof Tawk_API !== 'undefined') {
      Tawk_API.onLoad = function() {
        console.log('💬 Tawk.to chat widget loaded successfully');
        trackUserInteraction('chat_widget_loaded');
      };
      
      Tawk_API.onChatMaximized = function() {
        trackUserInteraction('chat_opened');
      };
      
      Tawk_API.onChatMinimized = function() {
        trackUserInteraction('chat_minimized');
      };
    }
  } catch (error) {
    logError(error, 'Chat Widget Initialization');
  }
}

/**
 * Performance Monitoring
 */
function monitorPerformance() {
  try {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`Performance: ${entry.name} = ${entry.value}ms`);
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
    
    // Log load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log(`Page loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }
      }, 0);
    });
  } catch (error) {
    logError(error, 'Performance Monitoring');
  }
}

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

// Global functions for HTML onclick handlers
window.handleMapError = handleMapError;
window.openInMaps = openInMaps;
window.refreshWeatherData = refreshWeatherData;