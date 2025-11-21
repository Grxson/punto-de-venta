declare module 'react-native-config' {
  interface ReactNativeConfig {
    API_URL_DEV?: string;
    API_URL_STAGING?: string;
    API_URL_PROD?: string;
    API_TIMEOUT?: string;
    API_RETRIES?: string;
    REACT_APP_ENV?: 'development' | 'staging' | 'production';
    FEATURE_SHOW_EXPERIMENTAL?: string;
    FEATURE_ENABLE_LOGGING?: string;
  }
  const Config: ReactNativeConfig;
  export default Config;
}
