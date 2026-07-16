import React, { useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Calendar, Compass, Star, 
  ShieldCheck, Phone, Mail, DollarSign, X, Check, ArrowRight, User
} from 'lucide-react';
import { Vehicle, VehicleType, VehicleCondition, Review, User as UserType } from '../types';

interface BuyerPortalProps {
  vehicles: Vehicle[];
  reviews: Review[];
  currentUser: UserType;
  onInitiateEscrow: (vehicleId: string, amount: number, sellerId: string, sellerName: string) => void;
  onAddReview: (targetUserId: string, rating: number, comment: string) => void;
  addLog: (msg: string) => void;
}

export default function BuyerPortal({
  vehicles,
  reviews,
  currentUser,
  onInitiateEscrow,
  onAddReview,
  addLog
}: BuyerPortalProps) {
  // Navigation & Details selection
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<VehicleType | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<VehicleCondition | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [minYear, setMinYear] = useState<number>(2015);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc'>('year_desc');
  
  // Reviews form states
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Comparison States
  const [comparedVehicleIds, setComparedVehicleIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const handleToggleCompare = (vehicle: Vehicle) => {
    setComparedVehicleIds(prev => {
      if (prev.includes(vehicle.id)) {
        addLog(`[Comparison Engine] Removed vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} from comparison.`);
        return prev.filter(id => id !== vehicle.id);
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 vehicles at a time.");
        return prev;
      }
      addLog(`[Comparison Engine] Added vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} to comparison.`);
      return [...prev, vehicle.id];
    });
  };

  const isCompared = (id: string) => comparedVehicleIds.includes(id);

  // Extract unique locations for the filter
  const locations = useMemo(() => {
    const locs = vehicles.map(v => v.location);
    return ['all', ...Array.from(new Set(locs))];
  }, [vehicles]);

  // Compute average rating for each seller
  const sellerRatings = useMemo(() => {
    const ratingsMap: Record<string, { sum: number; count: number }> = {};
    reviews.forEach(r => {
      if (!ratingsMap[r.targetUserId]) {
        ratingsMap[r.targetUserId] = { sum: 0, count: 0 };
      }
      ratingsMap[r.targetUserId].sum += r.rating;
      ratingsMap[r.targetUserId].count += 1;
    });
    
    const resultMap: Record<string, number> = {};
    Object.keys(ratingsMap).forEach(sellerId => {
      resultMap[sellerId] = parseFloat((ratingsMap[sellerId].sum / ratingsMap[sellerId].count).toFixed(1));
    });
    
    return resultMap;
  }, [reviews]);

  // Filter & Sort Logic
  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter(v => v.status === 'available');

    // Search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        v => v.make.toLowerCase().includes(term) || 
             v.model.toLowerCase().includes(term) || 
             v.description.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(v => v.vehicleType === selectedType);
    }

    // Condition filter
    if (selectedCondition !== 'all') {
      result = result.filter(v => v.condition === selectedCondition);
    }

    // Price filter
    result = result.filter(v => v.price <= maxPrice);

    // Year filter
    result = result.filter(v => v.year >= minYear);

    // Location filter
    if (selectedLocation !== 'all') {
      result = result.filter(v => v.location === selectedLocation);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'year_desc') return b.year - a.year;
      if (sortBy === 'mileage_asc') return a.mileage - b.mileage;
      return 0;
    });

    return result;
  }, [vehicles, searchTerm, selectedType, selectedCondition, maxPrice, minYear, selectedLocation, sortBy]);

  // Handle Checkout Click
  const handlePurchase = (vehicle: Vehicle) => {
    const balance = currentUser?.balance ?? 0;
    if (balance < vehicle.price) {
      alert(`Insufficient balance. Your current simulated wallet balance is $${balance.toLocaleString()}. You need $${vehicle.price.toLocaleString()} to purchase this vehicle.`);
      return;
    }

    if (confirm(`Do you want to initiate a secure Escrow checkout of $${vehicle.price.toLocaleString()} for this ${vehicle.year} ${vehicle.make} ${vehicle.model}? Your funds will be locked securely until you verify vehicle receipt.`)) {
      onInitiateEscrow(vehicle.id, vehicle.price, vehicle.sellerId, vehicle.sellerName);
      setSelectedVehicle(null);
    }
  };

  // Filter reviews for selected seller
  const selectedSellerReviews = useMemo(() => {
    if (!selectedVehicle) return [];
    return reviews.filter(r => r.targetUserId === selectedVehicle.sellerId);
  }, [reviews, selectedVehicle]);

  // Handle Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    if (!newComment.trim()) {
      alert('Please fill out the feedback comment.');
      return;
    }

    setSubmittingReview(true);
    setTimeout(() => {
      onAddReview(selectedVehicle.sellerId, newRating, newComment);
      addLog(`[Reviews Engine] Added a ${newRating}-star rating for seller ${selectedVehicle.sellerName}.`);
      setNewComment('');
      setNewRating(5);
      setSubmittingReview(false);
      alert('Review submitted successfully!');
    }, 1000);
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans" id="buyer-portal-root">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 md:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs bg-amber-500/90 text-slate-900 font-bold px-2.5 py-1 rounded font-mono uppercase tracking-wider mb-3 inline-block">
            Secure AWS Escrow Shield Enabled
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Find & Purchase Verified Second-Hand Vehicles
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
            Browse reliable pre-owned listings. Every single purchase is locked in our AWS Key Management Service (KMS) escrow smart contract to safeguard your hard-earned funds.
          </p>

          {/* Search Bar Input */}
          <div className="flex bg-white rounded-xl shadow-md overflow-hidden p-1.5 text-gray-800 focus-within:ring-2 focus-within:ring-amber-500/50 transition-all max-w-lg">
            <div className="pl-3 pr-2 flex items-center text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input 
              type="text"
              placeholder="Search by model, brand, spec, year, keywords..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-sm border-0 focus:outline-none p-1.5 focus:ring-0 text-slate-900"
            />
          </div>
        </div>

        {/* Dynamic Background visual asset */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <Compass className="w-full h-full text-white rotate-12" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-4">
            <SlidersHorizontal className="h-4.5 w-4.5 text-amber-500" />
            <h2 className="font-bold text-slate-800 text-sm">Advanced Search Filters</h2>
          </div>

          <div className="space-y-5 text-xs">
            {/* Vehicle Type */}
            <div>
              <label className="block font-bold text-gray-500 uppercase tracking-wider mb-2">Vehicle Category</label>
              <select 
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Vehicles</option>
                <option value="car">Sedan / Coupe</option>
                <option value="suv">SUV / Crossover</option>
                <option value="truck">Truck / Pickup</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Condition</label>
              <select 
                value={selectedCondition}
                onChange={e => setSelectedCondition(e.target.value as any)}
                className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">Any Condition</option>
                <option value="New">Nearly New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block font-bold text-gray-500 uppercase tracking-wider mb-2">Location Zone</label>
              <select 
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-wider">Max Price</label>
                <span className="font-bold font-mono text-gray-900">{formatPrice(maxPrice)}</span>
              </div>
              <input 
                type="range"
                min={5000}
                max={250000}
                step={2000}
                value={maxPrice}
                onChange={e => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Year Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-wider">Minimum Year</label>
                <span className="font-bold font-mono text-gray-900">{minYear}</span>
              </div>
              <input 
                type="range"
                min={2015}
                max={2026}
                step={1}
                value={minYear}
                onChange={e => setMinYear(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCondition('all');
                setMaxPrice(60000);
                setMinYear(2015);
                setSelectedLocation('all');
              }}
              className="w-full text-center py-2 border border-gray-200 hover:bg-slate-50 text-gray-600 rounded-lg font-bold cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Listings Section */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 text-xs">
            <p className="text-gray-500">
              Showing <span className="font-bold text-gray-900 font-mono">{filteredVehicles.length}</span> verified results matching your criteria
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Sort By:</span>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="border border-gray-200 rounded-lg p-1.5 bg-white text-gray-700 font-medium focus:outline-none"
              >
                <option value="year_desc">Newest Year First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="mileage_asc">Lowest Mileage</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <Compass className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 text-base">No Matching Vehicles Found</h3>
              <p className="text-xs text-gray-500 mt-1">
                Try widening your price range, removing keywords, or shifting your location zones.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map(vehicle => {
                const rating = sellerRatings[vehicle.sellerId] || 5;
                
                return (
                  <div 
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={vehicle.images[0]} 
                        alt={vehicle.make} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-amber-400" />
                        {vehicle.location}
                      </div>

                      {/* Compare Overlay Button */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompare(vehicle);
                        }}
                        className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer ${
                          isCompared(vehicle.id) 
                            ? 'bg-amber-500 text-slate-950 border border-amber-600' 
                            : 'bg-slate-900/85 hover:bg-slate-900 backdrop-blur-xs text-white border border-slate-700/80'
                        }`}
                      >
                        {isCompared(vehicle.id) ? (
                          <>
                            <Check className="h-3 w-3 font-extrabold" />
                            Comparing
                          </>
                        ) : (
                          <>
                            + Compare
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide mt-1 inline-block">
                            {vehicle.condition}
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-gray-900 font-mono">
                          {formatPrice(vehicle.price)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-1 mb-4 flex-1">
                        {vehicle.description}
                      </p>

                      {/* Specs pills */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-[10px] font-mono text-gray-500">
                        <span className="flex items-center gap-0.5 font-bold text-gray-700">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {vehicle.year}
                        </span>
                        <span className="font-bold text-gray-700">
                          {vehicle.mileage.toLocaleString()} mi
                        </span>
                        
                        <div className="flex items-center gap-0.5" title="Seller average rating">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-900">{rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details drawer Overlay */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-xs animate-fade-in">
          {/* Backdrop Close Click */}
          <div className="absolute inset-0" onClick={() => setSelectedVehicle(null)} />
          
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden font-sans animate-slide-left">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded font-mono uppercase">
                  Listing Specs
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Image Hero */}
              <div className="rounded-xl overflow-hidden border border-gray-100 shadow-xs">
                <img 
                  src={selectedVehicle.images[0]} 
                  alt={selectedVehicle.make} 
                  className="w-full h-72 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Price Block */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">SECURE ESCROW VEHICLE PRICE</span>
                  <span className="text-3xl font-extrabold font-mono text-white">{formatPrice(selectedVehicle.price)}</span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-mono block">YOUR WALLET BALANCE</span>
                  <span className={`text-sm font-bold font-mono ${(currentUser?.balance ?? 0) >= selectedVehicle.price ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPrice(currentUser?.balance ?? 0)}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 font-mono text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                  <span className="text-gray-400 block text-[10px]">YEAR</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedVehicle.year}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                  <span className="text-gray-400 block text-[10px]">MILEAGE</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedVehicle.mileage.toLocaleString()} mi</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                  <span className="text-gray-400 block text-[10px]">CONDITION</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedVehicle.condition}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                  <span className="text-gray-400 block text-[10px]">CATEGORY</span>
                  <span className="font-bold text-gray-900 text-sm capitalize">{selectedVehicle.vehicleType}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Details</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-white rounded-xl border border-gray-50 p-4 shadow-3xs">
                  {selectedVehicle.description}
                </p>
              </div>

              {/* Seller Trust Profile & Contact */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Seller Verification & Safety Info</h3>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="h-11 w-11 bg-white rounded-full border border-gray-100 flex items-center justify-center font-bold text-slate-700 text-lg">
                    {selectedVehicle.sellerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedVehicle.sellerName}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{sellerRatings[selectedVehicle.sellerId] || 5} Seller Rating</span>
                      <span className="text-gray-400 text-[10px]">({selectedSellerReviews.length} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-100 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{selectedVehicle.sellerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-100 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedVehicle.sellerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Checkout / Escrow CTA */}
              <div className="pt-4">
                <button 
                  onClick={() => handlePurchase(selectedVehicle)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer uppercase tracking-wider"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Initiate Secure Escrow Purchase ({formatPrice(selectedVehicle.price)})
                </button>
                <p className="text-[10px] text-gray-400 text-center font-mono mt-2">
                  Locked funds remain in AWS multi-sig ledger until vehicle delivery receipt confirmation.
                </p>
              </div>

              {/* Reviews List & Leave a review */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sellers Feedback & Ratings ({selectedSellerReviews.length})
                </h3>

                <div className="space-y-3.5">
                  {selectedSellerReviews.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No feedback reviews recorded for this seller yet. Purchase to leave feedback.</p>
                  ) : (
                    selectedSellerReviews.map((rev) => (
                      <div key={rev.id} className="bg-white border border-gray-50 rounded-xl p-4 shadow-3xs text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">{rev.reviewerName}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-500 leading-relaxed italic">"{rev.comment}"</p>
                        <p className="text-[9px] text-gray-400 font-mono text-right">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add review form */}
                <form onSubmit={handleSubmitReview} className="bg-slate-50/50 rounded-xl border border-slate-100 p-4 text-xs space-y-3.5">
                  <h4 className="font-bold text-slate-800">Leave Feedback for {selectedVehicle.sellerName}</h4>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Select Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star className={`h-4.5 w-4.5 ${newRating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      placeholder="Share your experience dealing with this seller..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      required
                      className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {submittingReview ? 'Submitting Review...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Floating comparison bar */}
      {comparedVehicleIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 p-4 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 px-2 py-1.5 rounded-lg font-bold font-mono text-xs flex items-center justify-center">
              {comparedVehicleIds.length} / 4
            </div>
            <div>
              <p className="text-xs font-bold font-sans text-white">Vehicles Selected for Comparison</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {comparedVehicleIds.map(id => {
                  const v = vehicles.find(item => item.id === id);
                  if (!v) return null;
                  return (
                    <span key={id} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                      {v.make} {v.model}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setComparedVehicleIds(prev => prev.filter(item => item !== id));
                        }}
                        className="hover:text-amber-400 cursor-pointer text-slate-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setComparedVehicleIds([])}
              className="px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparisonModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-4 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md cursor-pointer uppercase tracking-wider font-sans"
            >
              Compare
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setShowComparisonModal(false)} />
          
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden max-h-[90vh] animate-scale-up">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500 text-slate-900 font-bold px-2 py-1 rounded font-mono uppercase tracking-wider">
                  Side-By-Side Spec Sheet
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Vehicle Comparison ({comparedVehicleIds.length} of 4)
                </h2>
              </div>
              <button 
                onClick={() => setShowComparisonModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable comparative grid / table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="min-w-[700px]">
                {/* Table structure */}
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {/* Empty top-left cell */}
                      <th className="w-1/5 py-4 font-bold text-gray-400 uppercase tracking-wider">Specifications</th>
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <th key={id} />;
                        return (
                          <th key={id} className="w-1/4 px-4 py-4 align-top">
                            <div className="relative group rounded-xl overflow-hidden mb-3 h-32 border border-gray-100 bg-slate-50">
                              <img 
                                src={v.images[0]} 
                                alt={v.make} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <button 
                                onClick={() => setComparedVehicleIds(prev => prev.filter(item => item !== id))}
                                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white p-1 rounded-full transition-colors cursor-pointer"
                                title="Remove from comparison"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm">
                              {v.year} {v.make} {v.model}
                            </h3>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide mt-1 inline-block">
                              {v.condition}
                            </span>
                          </th>
                        );
                      })}
                      {/* Fill empty spots if less than 4 */}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <th key={`empty-th-${idx}`} className="w-1/4 px-4 py-4 text-center align-middle bg-slate-50/50 border border-dashed border-gray-200 rounded-xl">
                          <div className="py-8 text-gray-400">
                            <p className="text-xs font-bold">+ Add Vehicle</p>
                            <p className="text-[10px] mt-1 text-gray-400 font-mono">Select from list below</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Price row */}
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-4 font-bold text-gray-500 uppercase tracking-wider font-mono text-[10px]">Price</td>
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <td key={id} />;
                        return (
                          <td key={id} className="px-4 py-4 font-bold font-mono text-gray-900 text-sm">
                            {formatPrice(v.price)}
                          </td>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <td key={`empty-price-${idx}`} className="px-4 py-4 text-gray-300 font-mono">-</td>
                      ))}
                    </tr>

                    {/* Mileage row */}
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-4 font-bold text-gray-500 uppercase tracking-wider font-mono text-[10px]">Mileage</td>
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <td key={id} />;
                        return (
                          <td key={id} className="px-4 py-4 font-bold text-gray-800 font-mono">
                            {v.mileage.toLocaleString()} mi
                          </td>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <td key={`empty-mileage-${idx}`} className="px-4 py-4 text-gray-300 font-mono">-</td>
                      ))}
                    </tr>

                    {/* Category row */}
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-4 font-bold text-gray-500 uppercase tracking-wider font-mono text-[10px]">Category</td>
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <td key={id} />;
                        return (
                          <td key={id} className="px-4 py-4 capitalize text-gray-700">
                            {v.vehicleType}
                          </td>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <td key={`empty-category-${idx}`} className="px-4 py-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Location row */}
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-4 font-bold text-gray-500 uppercase tracking-wider font-mono text-[10px]">Location</td>
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <td key={id} />;
                        return (
                          <td key={id} className="px-4 py-4 text-gray-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              {v.location}
                            </div>
                          </td>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <td key={`empty-location-${idx}`} className="px-4 py-4 text-gray-300 font-mono">-</td>
                      ))}
                    </tr>

                    {/* Seller row */}
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-4 font-bold text-gray-500 uppercase tracking-wider font-mono text-[10px]">Seller Trust</td>
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <td key={id} />;
                        const rating = sellerRatings[v.sellerId] || 5;
                        return (
                          <td key={id} className="px-4 py-4 text-gray-700">
                            <div className="font-semibold text-gray-900">{v.sellerName}</div>
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-mono mt-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{rating} / 5</span>
                            </div>
                          </td>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <td key={`empty-seller-${idx}`} className="px-4 py-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Description row */}
                    <tr className="hover:bg-slate-50/30">
                      <td className="py-4 font-bold text-gray-500 uppercase tracking-wider font-mono text-[10px]">Description</td>
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <td key={id} />;
                        return (
                          <td key={id} className="px-4 py-4 text-gray-500 leading-relaxed max-w-xs break-words">
                            {v.description.slice(0, 120)}...
                          </td>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <td key={`empty-desc-${idx}`} className="px-4 py-4 text-gray-300">-</td>
                      ))}
                    </tr>

                    {/* Actions row */}
                    <tr>
                      <td className="py-4" />
                      {comparedVehicleIds.map(id => {
                        const v = vehicles.find(item => item.id === id);
                        if (!v) return <td key={id} />;
                        return (
                          <td key={id} className="px-4 py-6 text-center">
                            <button
                              onClick={() => {
                                handlePurchase(v);
                                setShowComparisonModal(false);
                              }}
                              className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold py-2.5 px-3 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer uppercase tracking-wider"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Secure Escrow
                            </button>
                          </td>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 4 - comparedVehicleIds.length) }).map((_, idx) => (
                        <td key={`empty-action-${idx}`} className="px-4 py-4 text-gray-300" />
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-gray-400">
              <span>* Safe Escrow checkout transactions verified using AWS multi-AZ architecture.</span>
              <button 
                onClick={() => setShowComparisonModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-slate-800 font-bold py-1.5 px-4 rounded-lg text-xs cursor-pointer"
              >
                Close Spec Sheet
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
