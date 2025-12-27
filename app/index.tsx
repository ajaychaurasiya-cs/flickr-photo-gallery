import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FlickrPhoto = {
  id: string;
  url_s: string;
};

const FLICKR_API =
  'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s';


const CACHE_KEY = 'FLICKR_CACHE';

export default function HomeScreen() {
  const [photos, setPhotos] = useState<FlickrPhoto[]>([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const loadCachedPhotos = async () => {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      setPhotos(JSON.parse(cached));
    }
  };

  const fetchPhotos = async (force = false) => {
  try {
    const res = await fetch(FLICKR_API); console.log(res);
    const json = await res.json();
    const newPhotos: FlickrPhoto[] = json.photos.photo.filter(
      (p: FlickrPhoto) => p.url_s
    );

    const cached = await AsyncStorage.getItem(CACHE_KEY);

    if (force || JSON.stringify(newPhotos) !== cached) {
      setPhotos(newPhotos);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newPhotos));
    }
  } catch (e) {
    console.log('Offline mode – using cache');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadCachedPhotos();
    fetchPhotos();
  }, []);

  if (loading && photos.length === 0) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }


  const onRefresh = async () => {
  setRefreshing(true);
  await fetchPhotos(true);
  setRefreshing(false);
};


  return (
    <FlatList
  data={photos}
  keyExtractor={(item) => item.id}
  numColumns={2}
  refreshing={refreshing}
  onRefresh={onRefresh}
  contentContainerStyle={styles.list}
  renderItem={({ item }) => (
    <Image source={{ uri: item.url_s }} style={styles.image} />
  )}
/>

  );
}

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  image: {
    width: '48%',
    height: 150,
    margin: '1%',
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
});
