import '../src/index.css';
import '../src/App.css';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { AuthProvider } from '../src/context/AuthContext';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../src/features/map/leafletIcons');
    }
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
