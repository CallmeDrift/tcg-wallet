import Constants from 'expo-constants';

/** Set EXPO_PUBLIC_COLLECTION_API_URL to the URL of your authenticated API proxy. */
export const collectionApiUrl =
  (Constants.expoConfig?.extra?.collectionApiUrl as string | undefined) ||
  process.env.EXPO_PUBLIC_COLLECTION_API_URL;
