// Common city coordinates for quick reference
// Format: { city, country, lat, lng }

export const CITY_COORDINATES = {
    // India
    "Delhi, India": { lat: 28.7041, lng: 77.1025 },
    "Mumbai, India": { lat: 19.0760, lng: 72.8777 },
    "Bangalore, India": { lat: 12.9716, lng: 77.5946 },
    "Hyderabad, India": { lat: 17.3850, lng: 78.4867 },
    "Kolkata, India": { lat: 22.5726, lng: 88.3639 },
    "Chennai, India": { lat: 13.0827, lng: 80.2707 },
    "Pune, India": { lat: 18.5204, lng: 73.8567 },
    "Ahmedabad, India": { lat: 23.0225, lng: 72.5714 },

    // USA
    "New York, USA": { lat: 40.7128, lng: -74.0060 },
    "Los Angeles, USA": { lat: 34.0522, lng: -118.2437 },
    "Chicago, USA": { lat: 41.8781, lng: -87.6298 },
    "Houston, USA": { lat: 29.7604, lng: -95.3698 },
    "Phoenix, USA": { lat: 33.4484, lng: -112.0742 },
    "Miami, USA": { lat: 25.7617, lng: -80.1918 },

    // Bangladesh
    "Dhaka, Bangladesh": { lat: 23.8103, lng: 90.4125 },
    "Chittagong, Bangladesh": { lat: 22.3569, lng: 91.7832 },

    // Pakistan
    "Karachi, Pakistan": { lat: 24.8607, lng: 67.0011 },
    "Lahore, Pakistan": { lat: 31.5497, lng: 74.3436 },

    // UK
    "London, UK": { lat: 51.5074, lng: -0.1278 },
    "Manchester, UK": { lat: 53.4808, lng: -2.2426 },

    // Canada
    "Toronto, Canada": { lat: 43.6532, lng: -79.3832 },
    "Vancouver, Canada": { lat: 49.2827, lng: -123.1207 },

    // Australia
    "Sydney, Australia": { lat: -33.8688, lng: 151.2093 },
    "Melbourne, Australia": { lat: -37.8136, lng: 144.9631 },
};

// Helper function to search coordinates by city name
export const searchCityCoordinates = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return Object.entries(CITY_COORDINATES)
        .filter(([city]) => city.toLowerCase().includes(term))
        .map(([city, coords]) => ({ city, ...coords }));
};

// Helper function to get exact city coordinates
export const getCityCoordinates = (city) => {
    return CITY_COORDINATES[city] || null;
};
