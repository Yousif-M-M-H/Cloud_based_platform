import 'expo-dev-client';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';
import axios from 'axios';

// Set Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoieW9zaWZtb2hhbWVkYWluIiwiYSI6ImNtODNsNzAwMDA2YjMyanBuamhxYzNucTYifQ.KoWrvWMmp4ZhrOXkVN640Q');

// API URL
const API_URL = 'http://10.0.2.2:5000/locations'; // ✅ Use this for Android emulator

// ✅ Define TypeScript Interface for Location Data
interface LocationData {
  latitude: number;
  longitude: number;
}

// ✅ Fix: Explicitly Define useState Types
const App = () => {
  const [location, setLocation] = useState<number[] | null>(null);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Current Location
  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use the map');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const coords: number[] = [currentLocation.coords.longitude, currentLocation.coords.latitude];
      setLocation(coords);

      // ✅ Store location in MongoDB
      await axios.post(API_URL, {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });

      console.log('📍 Location saved:', coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to fetch location');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Saved Locations from MongoDB
  const fetchSavedLocations = async () => {
    try {
      const response = await axios.get<LocationData[]>(API_URL); // ✅ Define Response Type
      setSavedLocations(response.data);
      console.log('📍 Fetched locations:', response.data);
    } catch (error) {
      console.error('Error fetching saved locations:', error);
    }
  };

  useEffect(() => {
    fetchLocation();
    fetchSavedLocations();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        {location && <Mapbox.Camera zoomLevel={12} centerCoordinate={location} />}

        {/* Display current location marker */}
        {location && (
          <Mapbox.PointAnnotation id="currentLocation" coordinate={location}>
            <View style={styles.marker} />
          </Mapbox.PointAnnotation>
        )}

        {/* ✅ Fix: Convert key to string to avoid TypeScript error */}
        {savedLocations.map((loc, index) => (
          <Mapbox.PointAnnotation
            key={`saved-${index}`} // ✅ Convert index to string
            id={`savedLocation-${index}`} // ✅ ID should be a string
            coordinate={[loc.longitude, loc.latitude]} // ✅ Ensure coordinates are numbers
          >
            <View style={styles.savedMarker} />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>
    </View>
  );
};

export default App;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    height: 20,
    width: 20,
    backgroundColor: 'blue',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 50,
  },
  savedMarker: {
    height: 15,
    width: 15,
    backgroundColor: 'red',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 50,
  },
});
