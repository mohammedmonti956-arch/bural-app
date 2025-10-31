import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { FaStore, FaStar, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom store icon
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center when user location is detected
function ChangeMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

const MapView = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const defaultCenter = [24.7136, 46.6753]; // Riyadh coordinates

  useEffect(() => {
    fetchStores();
    getUserLocation();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axiosInstance.get('/stores');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      <Header />
      
      <div className="flex-1 relative">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الخريطة...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={userLocation || defaultCenter}
            zoom={13}
            zoomControl={true}
            scrollWheelZoom={true}
            className="h-full w-full"
            data-testid="map-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={3}
            />
            
            {/* Update map center when user location is detected */}
            <ChangeMapCenter center={userLocation} />
            
            {/* User location marker */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center" dir="rtl">
                    <FaMapMarkerAlt className="text-red-600 text-2xl mx-auto mb-2" />
                    <p className="font-bold">موقعك الحالي</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Store markers */}
            {stores.map((store) => (
              <Marker
                key={store.id}
                position={[store.latitude, store.longitude]}
                icon={storeIcon}
                eventHandlers={{
                  click: () => {
                    window.location.href = `/stores/${store.id}`;
                  }
                }}
              >
                <Popup maxWidth={300}>
                  <div className="p-2" dir="rtl" data-testid={`marker-popup-${store.id}`}>
                    <Link to={`/stores/${store.id}`} className="block hover:text-blue-600">
                      <h3 className="font-bold text-lg mb-2">{store.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{store.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        {store.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-500" />
                        <span className="font-semibold">{store.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {store.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FaPhone />
                        <a href={`tel:${store.phone}`} className="hover:text-blue-600">{store.phone}</a>
                      </div>
                    )}

                    <div className="text-sm text-gray-500 mb-3">
                      <FaMapMarkerAlt className="inline ml-1" />
                      {store.address}
                    </div>

                    <Link
                      to={`/stores/${store.id}`}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Map info overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]" data-testid="map-info">
          <div className="flex items-center gap-2 mb-2">
            <FaStore className="text-blue-600 text-xl" />
            <span className="font-bold text-gray-900">{stores.length} متجر</span>
          </div>
          <p className="text-sm text-gray-600">انقر على أي علامة لعرض التفاصيل</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MapView;
