import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const StoreCard = ({ store }) => {
  return (
    <Link
      to={`/stores/${store.id}`}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group"
      data-testid={`store-card-${store.id}`}
    >
      <div className="h-48 bg-gray-200 overflow-hidden">
        {store.cover_image ? (
          <img src={store.cover_image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
            <FaMapMarkerAlt />
          </div>
        )}
      </div>
      
      <div className="p-4" dir="rtl">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1" data-testid="store-name">{store.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2" data-testid="store-description">{store.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full" data-testid="store-category">
            {store.category}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1" data-testid="store-rating">
            <FaStar className="text-yellow-500" />
            <span className="font-semibold">{store.rating.toFixed(1)}</span>
            <span>({store.reviews_count})</span>
          </div>
          {store.phone && (
            <div className="flex items-center gap-1" data-testid="store-phone">
              <FaPhone className="text-gray-400" />
              <span>{store.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-2 text-sm text-gray-500 flex items-center gap-1" data-testid="store-address">
          <FaMapMarkerAlt className="text-gray-400" />
          <span className="line-clamp-1">{store.address}</span>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;