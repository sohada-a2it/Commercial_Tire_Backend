// app/components/TireFinder.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Truck, Map, Weight, TrendingUp, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
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
  { value: 'extra-heavy', label: '📦📦📦📦 Extra Heavy', description: '40+ tons', range: '80+ tons' }
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
  const [criteria, setCriteria] = useState({});

  const handleFindTires = async (selectedVehicle, selectedRoad, selectedLoad) => {
    // Use passed parameters or state values
    const finalVehicleType = selectedVehicle || vehicleType;
    const finalRoadType = selectedRoad || roadType;
    const finalLoadWeight = selectedLoad || loadWeight;

    if (!finalVehicleType || !finalRoadType || !finalLoadWeight) {
      setError('Please select all options before proceeding');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const searchCriteria = {
        vehicleType: finalVehicleType,
        roadType: finalRoadType,
        loadWeight: finalLoadWeight
      };
      
      console.log('Searching with criteria:', searchCriteria);
      const result = await findTiresByCriteria(searchCriteria);
      console.log('API Response:', result);
      
      if (result.success) {
        setVehicleType(finalVehicleType);
        setRoadType(finalRoadType);
        setLoadWeight(finalLoadWeight);
        setCriteria(searchCriteria);
        setRecommendations(result.recommendations || []);
        setShowResults(true);
        setStep(4);
        
        // Scroll to results
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        setError(result.message || 'No tires found matching your criteria. Please try different options.');
        setRecommendations([]);
        setShowResults(true);
        setStep(4);
      }
    } catch (error) {
      console.error('Error finding tires:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError(`Error: ${error.message || 'Failed to find tires. Please check your selections and try again.'}`);
      setShowResults(true);
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
    setCriteria({});
  };

  const getVehicleLabel = (value) => VEHICLE_TYPES.find(v => v.value === value)?.label || '';
  const getRoadLabel = (value) => ROAD_TYPES.find(r => r.value === value)?.label || '';
  const getLoadLabel = (value) => LOAD_TYPES.find(l => l.value === value)?.label || '';

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 px-6 py-10 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"></div>
        </div>
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <Search className="w-14 h-14" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Smart Tire Finder</h2>
          <p className="text-amber-100 text-lg">Find the perfect tire in just 3 steps</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Progress Steps */}
        {!showResults && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                    ${step >= s 
                      ? 'bg-amber-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-200 text-gray-500'}
                  `}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-2 mx-2 rounded-full transition-all ${
                      step > s ? 'bg-amber-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs md:text-sm text-gray-600">
              <span className={step >= 1 ? 'font-semibold text-amber-600' : ''}>Vehicle Type</span>
              <span className={step >= 2 ? 'font-semibold text-amber-600' : ''}>Road Type</span>
              <span className={step >= 3 ? 'font-semibold text-amber-600' : ''}>Load Weight</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !showResults && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Vehicle Type */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Truck className="w-6 h-6 text-amber-600" />
              1. What type of vehicle do you have?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VEHICLE_TYPES.map((vehicle) => (
                <button
                  key={vehicle.value}
                  onClick={() => {
                    setVehicleType(vehicle.value);
                    setStep(2);
                  }}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all transform hover:scale-105
                    ${vehicleType === vehicle.value 
                      ? 'border-amber-600 bg-amber-50 shadow-md' 
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'}
                  `}
                >
                  <div className="text-2xl mb-1">{vehicle.label}</div>
                  <div className="text-sm text-gray-600">{vehicle.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Road Type */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Map className="w-6 h-6 text-amber-600" />
                2. What kind of roads will you mostly drive on?
              </h3>
              <button 
                onClick={() => setStep(1)} 
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 hover:underline"
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
                    p-4 rounded-xl border-2 text-left transition-all transform hover:scale-102
                    ${roadType === road.value 
                      ? 'border-amber-600 bg-amber-50 shadow-md' 
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'}
                  `}
                >
                  <div className="font-bold text-gray-800">{road.label}</div>
                  <div className="text-sm text-gray-600">{road.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Load Weight */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Weight className="w-6 h-6 text-amber-600" />
                3. How much weight will the tires carry?
              </h3>
              <button 
                onClick={() => setStep(2)} 
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 hover:underline"
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
                    handleFindTires(vehicleType, roadType, load.value);
                  }}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all transform hover:scale-102
                    ${loadWeight === load.value 
                      ? 'border-amber-600 bg-amber-50 shadow-md' 
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'}
                  `}
                >
                  <div className="font-bold text-gray-800">{load.label}</div>
                  <div className="text-sm text-gray-600">{load.description} • {load.range}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Finding the perfect tires for you...</p>
            <p className="text-gray-400 text-sm mt-2">Analyzing {getVehicleLabel(vehicleType)} requirements for {getRoadLabel(roadType)} driving</p>
          </div>
        )}

        {/* Results Section */}
        {showResults && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-amber-50 to-indigo-50 p-6 rounded-xl border border-amber-200">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                    {recommendations.length > 0 
                      ? `🎯 ${recommendations.length} Perfect Match${recommendations.length !== 1 ? 'es' : ''}` 
                      : '⚠️ No Tires Found'}
                  </h3>
                  {recommendations.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Based on: <span className="font-semibold">{getVehicleLabel(criteria.vehicleType)}</span> • 
                      <span className="font-semibold"> {getRoadLabel(criteria.roadType)}</span> • 
                      <span className="font-semibold"> {getLoadLabel(criteria.loadWeight)}</span>
                    </p>
                  )}
                </div>
                <button 
                  onClick={resetFinder} 
                  className="px-6 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all font-medium whitespace-nowrap"
                >
                  ↻ New Search
                </button>
              </div>
            </div>

            {/* Tires List */}
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((tire, idx) => (
                  <div 
                    key={idx} 
                    className="border-2 border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-xl hover:border-amber-300 transition-all transform hover:scale-[1.01]"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Tire Image */}
                      <div className="flex-shrink-0 w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <img 
                          src={tire.image?.url || 'https://via.placeholder.com/150?text=Tire'} 
                          alt={tire.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Tire'}
                        />
                      </div>

                      {/* Tire Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                          <div>
                            <h4 className="font-bold text-xl text-gray-800">{tire.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                              <span className="font-semibold text-amber-600">{tire.brand}</span>
                              {tire.tireSpecs?.size && <span>• {tire.tireSpecs.size}</span>}
                              {tire.tireSpecs?.loadIndex && <span>• Load Index: {tire.tireSpecs.loadIndex}</span>}
                              {tire.tireSpecs?.speedRating && <span>• Speed: {tire.tireSpecs.speedRating}</span>}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-left md:text-right">
                            {tire.offerPrice ? (
                              <>
                                <div className="text-2xl font-bold text-red-600">
                                  {formatPrice(tire.offerPrice)}
                                </div>
                                <div className="text-sm text-gray-400 line-through">
                                  {formatPrice(tire.price)}
                                </div>
                                <div className="text-xs text-red-600 font-semibold mt-1">SPECIAL OFFER</div>
                              </>
                            ) : tire.price ? (
                              <div className="text-2xl font-bold text-gray-800">
                                {formatPrice(tire.price)}
                              </div>
                            ) : (
                              <div className="text-sm font-semibold text-amber-600 cursor-pointer hover:underline">
                                Request Quote →
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <div className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Best Match
                          </div>
                          {tire.tireType && (
                            <div className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full capitalize font-medium">
                              {tire.tireType}
                            </div>
                          )}
                          {tire.applicationsList?.slice(0, 2).map((app, i) => (
                            <div key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                              {app}
                            </div>
                          ))}
                        </div>

                        {/* Recommendation Reason */}
                        {tire.recommendationReason && (
                          <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg mb-4 border-l-4 border-amber-400">
                            💡 {tire.recommendationReason}
                          </p>
                        )}

                        {/* View Details Button */}
                        <Link href={`/product/${tire.id || tire._id}`}>
                          <button className="mt-2 text-amber-600 font-semibold hover:text-amber-700 hover:underline flex items-center gap-1 text-sm">
                            View Full Details & Specs →
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-gray-700 font-semibold text-lg mb-2">No Tires Found</p>
                <p className="text-gray-600 mb-4">
                  We couldn't find tires matching all your criteria. Try adjusting your selections:
                </p>
                <ul className="text-gray-600 text-sm mb-4 inline-block text-left">
                  <li>• Try a different load weight category</li>
                  <li>• Explore other road types</li>
                  <li>• Consider a different vehicle type</li>
                </ul>
                <button 
                  onClick={resetFinder} 
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all font-medium"
                >
                  Start New Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}