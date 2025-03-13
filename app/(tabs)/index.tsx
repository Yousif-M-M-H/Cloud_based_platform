import 'expo-dev-client';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';

// Set Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoieW9zaWZtb2hhbWVkYWluIiwiYSI6ImNtODNsNzAwMDA2YjMyanBuamhxYzNucTYifQ.KoWrvWMmp4ZhrOXkVN640Q');

const App = () => {
  const [location, setLocation] = useState<number[] | null>(null);
  const [error, setError] = useState(false);

  // Function to get current location
  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use the map');
        setError(true);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation([currentLocation.coords.longitude, currentLocation.coords.latitude]);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to fetch location');
      setError(true);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Do not render anything until location is available
  if (!location && !error) {
    return null; // No UI until location is fetched
  }

  // If error occurs, show an alert and exit
  if (error) {
    Alert.alert('Error', 'Failed to get location. Restart the app.');
    return null;
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        {location && (
          <>
            <Mapbox.Camera zoomLevel={12} centerCoordinate={location} />

            {/* Marker for current location */}
            <Mapbox.PointAnnotation id="currentLocation" coordinate={location}>
              <View style={styles.marker} />
            </Mapbox.PointAnnotation>
          </>
        )}
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
});
