// app/components/TireFinder.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Truck, Road, Weight, TrendingUp, ArrowLeft } from 'lucide-react';
import { findTiresByCriteria } from '@/services/catalogService';

const VEHICLE_TYPES = [
  { value: 'truck', label: '🚛 Truck', description: 'Heavy duty trucks, long haul' },
  { value: 'bus', label: '🚌 Bus', description: 'Passenger transport, city/highway' },
  { value: 'trailer', label: '🚍 Trailer', description: 'Trailer applications, free-rolling' },
  { value: 'otr', label: '🏗️ OTR', description: 'Off-the-road equipment' },
  { value: 'industrial', label: '🏭 Industrial', description: 'Forklifts, industrial vehicles' }
];

const ROAD_TYPES = [
  { value: 'highway', label: '🛣️ Highway', description: 'Long distance, paved roads' },
  { value: 'mixed', label: '🔄 Mixed Service', description: 'Mix of paved & unpaved roads' },
  { value: 'off-road', label: '⛰️ Off-Road', description: 'Rough terrain, construction sites' },
  { value: 'mining', label: '⛏️ Mining', description: 'Extreme conditions, rocky terrain' }
];

const LOAD_TYPES = [
  { value: 'light', label: '📦 Light Load', description: 'Up to 10 tons', range: '10-20 tons' },
  { value: 'medium', label: '📦📦 Medium Load', description: '10-20 tons', range: '20-40 tons' },
  { value: 'heavy', label: '📦📦📦 Heavy Load', description: '20-40 tons', range: '40+ tons' },
  { value: 'extra-heavy', label: '📦📦📦📦 Extra Heavy', description: '40+ tons', range: '40-80 tons' }
];

const formatPrice = (price) => {
  if (!price) return 'Contact for price';
  const num = parseFloat(String(price).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? String(price) : `$${num.toLocaleString()}`;
};

export default function TireFinder() {
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState('');
  const [roadType, setRoadType] = useState('');
  const [loadWeight, setLoadWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const handleFindTires = async () => {
    if (!vehicleType || !roadType || !loadWeight) {
      setError('Please select all options');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await findTiresByCriteria({
        vehicleType,
        roadType,
        loadWeight
      });
      
      if (result.success) {
        setRecommendations(result.recommendations || []);
        setShowResults(true);
        setStep(4);
      } else {
        setError(result.message || 'No tires found');
      }
    } catch (error) {
      console.error('Error finding tires:', error);
      setError('Failed to find tires. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetFinder = () => {
    setStep(1);
    setVehicleType('');
    setRoadType('');
    setLoadWeight('');
    setRecommendations([]);
    setShowResults(false);
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white text-center">
        <Search className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2">Tire Finder Tool</h2>
        <p className="text-blue-100">Find the perfect tire for your vehicle in 3 easy steps</p>
      </div>

      <div className="p-6">
        {/* Progress Steps */}
        {!showResults && (
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Vehicle Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">1. Select Vehicle Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VEHICLE_TYPES.map((vehicle) => (
                <button
                  key={vehicle.value}
                  onClick={() => {
                    setVehicleType(vehicle.value);
                    setStep(2);
                  }}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${vehicleType === vehicle.value 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}
                  `}
                >
                  <div className="text-2xl mb-1">{vehicle.label}</div>
                  <div className="text-sm text-gray-500">{vehicle.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Road Type */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">2. Select Road Type</h3>
              <button 
                onClick={() => setStep(1)} 
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </div>
            <div className="grid gap-3">
              {ROAD_TYPES.map((road) => (
                <button
                  key={road.value}
                  onClick={() => {
                    setRoadType(road.value);
                    setStep(3);
                  }}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${roadType === road.value 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}
                  `}
                >
                  <div className="font-medium text-gray-800">{road.label}</div>
                  <div className="text-sm text-gray-500">{road.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Load Weight */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">3. Select Load Weight</h3>
              <button 
                onClick={() => setStep(2)} 
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </div>
            <div className="grid gap-3">
              {LOAD_TYPES.map((load) => (
                <button
                  key={load.value}
                  onClick={() => {
                    setLoadWeight(load.value);
                    handleFindTires();
                  }}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${loadWeight === load.value 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}
                  `}
                >
                  <div className="font-medium text-gray-800">{load.label}</div>
                  <div className="text-sm text-gray-500">{load.description} • {load.range}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding the best tires for you...</p>
          </div>
        )}

        {/* Results */}
        {showResults && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  🎯 Recommended Tires ({recommendations.length})
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Based on: {VEHICLE_TYPES.find(v => v.value === vehicleType)?.label} • 
                  {ROAD_TYPES.find(r => r.value === roadType)?.label} • 
                  {LOAD_TYPES.find(l => l.value === loadWeight)?.label}
                </p>
              </div>
              <button 
                onClick={resetFinder} 
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Start Over →
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {recommendations.map((tire, idx) => (
                <div key={idx} className="border rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img 
                      src={tire.image?.url || 'https://via.placeholder.com/100x100?text=Tire'} 
                      alt={tire.name}
                      className="w-24 h-24 object-contain bg-gray-50 rounded-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/100x100?text=Tire'}
                    />
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-gray-800">{tire.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                            <span className="font-medium">{tire.brand}</span>
                            {tire.tireSpecs?.size && <span>• {tire.tireSpecs.size}</span>}
                            {tire.tireSpecs?.loadIndex && <span>• Load: {tire.tireSpecs.loadIndex}</span>}
                            {tire.tireSpecs?.speedRating && <span>• Speed: {tire.tireSpecs.speedRating}</span>}
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          {tire.offerPrice ? (
                            <>
                              <div className="text-xl font-bold text-red-600">
                                {formatPrice(tire.offerPrice)}
                              </div>
                              <div className="text-sm text-gray-400 line-through">
                                {formatPrice(tire.price)}
                              </div>
                            </>
                          ) : tire.price ? (
                            <div className="text-xl font-bold text-gray-800">
                              {formatPrice(tire.price)}
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-blue-600">Request Quote</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          ✅ Best Match
                        </div>
                        {tire.tireType && (
                          <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full capitalize">
                            {tire.tireType}
                          </div>
                        )}
                        {tire.applicationsList?.slice(0, 2).map((app, i) => (
                          <div key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {app}
                          </div>
                        ))}
                      </div>

                      {tire.recommendationReason && (
                        <p className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                          💡 {tire.recommendationReason}
                        </p>
                      )}

                      <Link href={`/product/${tire.id || tire._id}`}>
                        <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                          View Details →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recommendations.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No tires found matching your criteria.</p>
                <button onClick={resetFinder} className="mt-3 text-blue-600 hover:underline">
                  Try different options
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}