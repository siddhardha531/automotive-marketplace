import React, { useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Calendar, Compass, Star, 
  ShieldCheck, Phone, Mail, DollarSign, X, Check, ArrowRight, User,
  CreditCard, Lock, Building, CheckCircle2, Wallet, AlertCircle
} from 'lucide-react';
import { Vehicle, VehicleType, VehicleCondition, Review, User as UserType } from '../types';

interface BuyerPortalProps {
  vehicles: Vehicle[];
  reviews: Review[];
  currentUser: UserType;
  onInitiateEscrow: (vehicleId: string, amount: number, sellerId: string, sellerName: string) => void;
  onAddReview: (targetUserId: string, rating: number, comment: string) => void;
  addLog: (msg: string) => void;
  onUpdateBalance?: (userId: string, amount: number) => void;
}

export default function BuyerPortal({
  vehicles,
  reviews,
  currentUser,
  onInitiateEscrow,
  onAddReview,
  addLog,
  onUpdateBalance
}: BuyerPortalProps) {
  // Navigation & Details selection
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Checkout & Payment states
  const [checkoutVehicle, setCheckoutVehicle] = useState<Vehicle | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardZip, setCardZip] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

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
    setCheckoutVehicle(vehicle);
    setPaymentMethod('card'); // default to card
    setCardNumber('');
    setCardName(currentUser?.name || '');
    setCardExpiry('');
    setCardCvv('');
    setCardZip('');
    setIsProcessingPayment(false);
    setPaymentStep('');
    setPaymentSuccess(false);
    setPaymentError('');
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

  const cardType = useMemo(() => {
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (cleanNum.startsWith('5')) return 'MasterCard';
    return 'CreditCard';
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutVehicle) return;

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setPaymentError('Invalid Card Number. Must be at least 15 digits.');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        setPaymentError('Invalid Expiry Date. Use MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setPaymentError('Invalid CVV. Must be at least 3 digits.');
        return;
      }
    } else {
      if ((currentUser?.balance ?? 0) < checkoutVehicle.price) {
        setPaymentError('Insufficient balance in AWS Escrow Wallet. Use Credit Card checkout to process immediately.');
        return;
      }
    }

    setPaymentError('');
    setIsProcessingPayment(true);
    setPaymentStep('Resolving secure Stripe merchant credentials...');

    setTimeout(() => {
      setPaymentStep('Validating card cryptographic signatures with issuer bank...');
      
      setTimeout(() => {
        setPaymentStep('Initiating AWS Multi-AZ escrow custody contract...');
        
        setTimeout(() => {
          setPaymentStep('Depositing funds securely inside escrow ledger...');
          
          setTimeout(() => {
            setIsProcessingPayment(false);
            setPaymentSuccess(true);
            
            if (paymentMethod === 'card' && onUpdateBalance) {
              onUpdateBalance(currentUser.id, checkoutVehicle.price);
              addLog(`[Financial Gateway] Stripe transaction approved. Credited $${checkoutVehicle.price.toLocaleString()} directly into user balance to fund escrow.`);
            }
            
            onInitiateEscrow(
              checkoutVehicle.id, 
              checkoutVehicle.price, 
              checkoutVehicle.sellerId, 
              checkoutVehicle.sellerName
            );
            
            addLog(`[Financial Gateway] Successfully completed $${checkoutVehicle.price.toLocaleString()} Escrow placement via ${paymentMethod === 'card' ? 'Stripe Gateway' : 'Ledger Wallet'}.`);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
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

      {/* Checkout Modal */}
      {checkoutVehicle && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row h-auto md:max-h-[640px] animate-scale-up">
            
            {/* Left Column: Order Summary & Interactive Card Graphic */}
            <div className="md:w-5/12 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-150 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Secure Escrow Checkout</h4>
                  <h3 className="font-extrabold text-lg text-slate-900 mt-1">Order Summary</h3>
                </div>

                {/* Vehicle Micro-Card */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-3">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-100">
                    <img 
                      src={checkoutVehicle.image} 
                      alt={`${checkoutVehicle.year} ${checkoutVehicle.make} ${checkoutVehicle.model}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{checkoutVehicle.year} {checkoutVehicle.make} {checkoutVehicle.model}</h5>
                    <div className="flex gap-2 text-[10px] text-slate-500 font-mono mt-1">
                      <span className="uppercase">{checkoutVehicle.condition}</span>
                      <span>•</span>
                      <span>{checkoutVehicle.mileage.toLocaleString()} mi</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Escrow Value</span>
                    <span className="font-mono font-black text-slate-900">{formatPrice(checkoutVehicle.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">AWS Processing Fee</span>
                    <span className="font-mono text-emerald-600 font-bold">FREE ($0)</span>
                  </div>
                  <div className="border-t border-slate-150 pt-3 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-800">Total Escrow Amount</span>
                    <span className="font-mono font-black text-slate-950 text-base">{formatPrice(checkoutVehicle.price)}</span>
                  </div>
                </div>

                {/* Interactive Credit Card Graphic */}
                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Stripe Sandbox Card Preview</span>
                    <div className={`aspect-[1.586/1] w-full rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-lg transition-all duration-500 ${
                      cardType === 'Visa' ? 'bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950' :
                      cardType === 'MasterCard' ? 'bg-gradient-to-br from-rose-700 via-amber-800 to-stone-900' :
                      'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950'
                    }`}>
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
                      
                      {/* Card Header */}
                      <div className="flex justify-between items-start z-10">
                        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                          <Lock className="h-3 w-3 text-emerald-400" />
                          <span className="text-[8px] font-mono tracking-widest text-emerald-400 uppercase font-black">Secure</span>
                        </div>
                        <div className="font-bold text-xs font-mono tracking-widest text-white/90">
                          {cardType === 'Visa' ? 'VISA' : cardType === 'MasterCard' ? 'MASTERCARD' : 'STRIPE'}
                        </div>
                      </div>

                      {/* Chip & Watermark */}
                      <div className="flex justify-between items-center z-10 mt-2">
                        {/* Brass Chip Graphic */}
                        <div className="h-8 w-10 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md border border-yellow-100 shadow-inner overflow-hidden relative">
                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-yellow-700/30" />
                          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-yellow-700/30" />
                          <div className="absolute inset-2 border border-yellow-700/10 rounded-sm" />
                        </div>
                        {/* AWS Holographic security logo */}
                        <div className="opacity-20 flex items-center gap-1">
                          <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="text-center font-mono text-base tracking-widest z-10 mt-3 font-semibold text-slate-100">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      {/* Footer Details */}
                      <div className="flex justify-between items-end z-10 mt-2 font-mono">
                        <div className="truncate pr-4">
                          <span className="block text-[7px] text-slate-400 uppercase font-bold">Cardholder Name</span>
                          <span className="text-xs tracking-wide uppercase font-medium truncate block max-w-[150px]">{cardName || 'YOUR FULL NAME'}</span>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="block text-[7px] text-slate-400 uppercase font-bold">Expires</span>
                            <span className="text-xs font-medium block">{cardExpiry || 'MM/YY'}</span>
                          </div>
                          <div>
                            <span className="block text-[7px] text-slate-400 uppercase font-bold">CVV</span>
                            <span className="text-xs font-medium block">{cardCvv || '•••'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Lock Badge */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#FF9900]" />
                <span>AWS-STK-LEDGER secured end-to-end.</span>
              </div>
            </div>

            {/* Right Column: Checkout tabs & Forms */}
            <div className="flex-1 flex flex-col justify-between bg-white overflow-hidden">
              
              {/* Checkout Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Payment Gateway</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Select a secure sandbox method to deposit escrow funds</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setCheckoutVehicle(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="p-6 flex-grow overflow-y-auto space-y-5">
                {isProcessingPayment ? (
                  /* Processing View */
                  <div className="h-full flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="relative">
                      {/* Glowing circular loading animation */}
                      <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-[#FF9900] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-slate-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2 max-w-xs">
                      <h4 className="font-extrabold text-sm text-slate-900">Authorizing Secure Escrow Deposit</h4>
                      <p className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {paymentStep}
                      </p>
                    </div>
                  </div>
                ) : paymentSuccess ? (
                  /* Success View */
                  <div className="h-full flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                      <CheckCircle2 className="h-10 w-10 animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="font-extrabold text-base text-slate-900">Escrow Account Funded!</h4>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Stripe payment captured successfully. A secure escrow contract has been provisioned on the AWS Ledger and funds are now locked.
                      </p>
                      <div className="pt-2">
                        <span className="text-[9px] bg-slate-950 text-[#FF9900] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                          STATUS: ESCROW_PENDING
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Input Forms */
                  <div className="space-y-5">
                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('card');
                          setPaymentError('');
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'card' 
                            ? 'bg-white text-slate-900 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-950'
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Credit/Debit Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('wallet');
                          setPaymentError('');
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'wallet' 
                            ? 'bg-white text-slate-900 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-950'
                        }`}
                      >
                        <Wallet className="h-4 w-4" />
                        <span>AWS Ledger Wallet</span>
                      </button>
                    </div>

                    {paymentError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                        <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold">{paymentError}</span>
                      </div>
                    )}

                    {paymentMethod === 'card' ? (
                      /* Credit Card Form fields */
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2.5 font-sans focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Card Number (Auto-formatting)</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              className="w-full border border-slate-200 rounded-lg p-2.5 pl-10 font-mono tracking-widest focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                              placeholder="4111 2222 3333 4444"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                              <CreditCard className="h-4.5 w-4.5" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Expiration (MM/YY)</label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={handleCardExpiryChange}
                              maxLength={5}
                              className="w-full border border-slate-200 rounded-lg p-2.5 font-mono text-center focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">CVV</label>
                            <input
                              type="password"
                              required
                              value={cardCvv}
                              onChange={handleCardCvvChange}
                              maxLength={4}
                              className="w-full border border-slate-200 rounded-lg p-2.5 font-mono text-center focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                              placeholder="•••"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Billing Zip / Postal Code</label>
                          <input
                            type="text"
                            required
                            value={cardZip}
                            onChange={e => setCardZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                            className="w-full border border-slate-200 rounded-lg p-2.5 font-sans focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] focus:outline-none"
                            placeholder="90210"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Wallet Information fields */
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Current Ledger Balance</span>
                            <span className="font-mono font-black text-slate-900">
                              {formatPrice(currentUser?.balance ?? 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Escrow Value of Vehicle</span>
                            <span className="font-mono text-rose-600 font-bold">
                              -{formatPrice(checkoutVehicle.price)}
                            </span>
                          </div>
                          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-800">Remaining Wallet Balance</span>
                            <span className={`font-mono font-black ${
                              (currentUser?.balance ?? 0) >= checkoutVehicle.price 
                                ? 'text-emerald-600' 
                                : 'text-rose-600'
                            }`}>
                              {formatPrice((currentUser?.balance ?? 0) - checkoutVehicle.price)}
                            </span>
                          </div>
                        </div>

                        {(currentUser?.balance ?? 0) >= checkoutVehicle.price ? (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 leading-relaxed">
                            <Check className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Sufficient Wallet Funds</p>
                              <p className="text-emerald-700 mt-0.5">Your sandbox ledger wallet is fully funded. No external credit card transactions are needed.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed">
                            <AlertCircle className="h-4.5 w-4.5 text-[#FF9900] flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <p className="font-bold">Insufficient Sandbox Balance</p>
                              <p className="text-amber-700 mt-0.5">Your balance is too low. Please switch to the "Credit/Debit Card" tab to process this order instantly and credit your sandbox account.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 border-t border-slate-150 bg-slate-50 flex gap-3">
                {paymentSuccess ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutVehicle(null)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors text-center block shadow-md"
                  >
                    Close Secure Window
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => setCheckoutVehicle(null)}
                      className="flex-1 bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 font-bold py-3 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isProcessingPayment || (paymentMethod === 'wallet' && (currentUser?.balance ?? 0) < checkoutVehicle.price)}
                      className="flex-[2] bg-[#FF9900] hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      <ShieldCheck className="h-4.5 w-4.5 text-slate-950" />
                      <span>Place Escrow Order</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
