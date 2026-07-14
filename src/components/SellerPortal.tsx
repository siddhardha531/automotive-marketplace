import React, { useState } from 'react';
import { 
  Car, Plus, Edit3, Trash2, Tag, Calendar, MapPin, 
  User, CheckCircle, RefreshCw, Layers, FileText, ChevronRight
} from 'lucide-react';
import { Vehicle, VehicleType, VehicleCondition, ListingStatus } from '../types';

interface SellerPortalProps {
  vehicles: Vehicle[];
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateVehicle: (id: string, updated: Partial<Vehicle>) => void;
  onDeleteVehicle: (id: string) => void;
  addLog: (msg: string) => void;
}

const VEHICLE_IMAGE_PRESETS = [
  {
    name: 'Red Sports Coupe',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Electric Pearl White Sedan',
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Charcoal Offroad SUV',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Black Heavy Duty Pickup',
    url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Red Cruiser Motorcycle',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
  }
];

export default function SellerPortal({
  vehicles,
  currentUserId,
  currentUserName,
  currentUserEmail,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  addLog
}: SellerPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'create'>('listings');
  
  // Create / Edit State
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  
  // Form States
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2022);
  const [price, setPrice] = useState(25000);
  const [mileage, setMileage] = useState(15000);
  const [condition, setCondition] = useState<VehicleCondition>('Excellent');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [imageUrl, setImageUrl] = useState(VEHICLE_IMAGE_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Seattle, WA');
  const [phone, setPhone] = useState('+1 (555) 123-4567');

  // Filter listings by active seller
  const myListings = vehicles.filter(v => v.sellerId === currentUserId);

  const resetForm = () => {
    setMake('');
    setModel('');
    setYear(2022);
    setPrice(25000);
    setMileage(15000);
    setCondition('Excellent');
    setVehicleType('car');
    setImageUrl(VEHICLE_IMAGE_PRESETS[0].url);
    setDescription('');
    setLocation('Seattle, WA');
    setPhone('+1 (555) 123-4567');
    setEditingVehicleId(null);
  };

  const handleCreateOrEditListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !imageUrl.trim() || !description.trim()) {
      alert('Please fill out all required fields');
      return;
    }

    if (editingVehicleId) {
      // Editing Mode
      onUpdateVehicle(editingVehicleId, {
        make,
        model,
        year,
        price,
        mileage,
        condition,
        vehicleType,
        images: [imageUrl],
        description,
        location,
        sellerPhone: phone
      });
      addLog(`[Seller Portal] Updated listing: ${year} ${make} ${model} (Listing ID: ${editingVehicleId}). S3 cache refreshed.`);
      alert('Listing updated successfully!');
      resetForm();
      setActiveSubTab('listings');
    } else {
      // Create Mode
      onAddVehicle({
        make,
        model,
        year,
        price,
        mileage,
        condition,
        vehicleType,
        images: [imageUrl],
        description,
        location,
        sellerId: currentUserId,
        sellerName: currentUserName,
        sellerEmail: currentUserEmail,
        sellerPhone: phone
      });
      addLog(`[Seller Portal] Created new listing for ${year} ${make} ${model} at ${location}. Uploaded images to Amazon S3.`);
      alert('Listing created successfully!');
      resetForm();
      setActiveSubTab('listings');
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setYear(vehicle.year);
    setPrice(vehicle.price);
    setMileage(vehicle.mileage);
    setCondition(vehicle.condition);
    setVehicleType(vehicle.vehicleType);
    setImageUrl(vehicle.images[0] || VEHICLE_IMAGE_PRESETS[0].url);
    setDescription(vehicle.description);
    setLocation(vehicle.location);
    setPhone(vehicle.sellerPhone);
    setActiveSubTab('create');
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans" id="seller-portal-root">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="h-8 w-8 text-amber-500" />
            Seller Operations Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal vehicle inventory, view purchase offers, track transaction progress, and draft new listings.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg mt-4 md:mt-0">
          <button 
            onClick={() => {
              resetForm();
              setActiveSubTab('listings');
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === 'listings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            My Live Vehicles ({myListings.length})
          </button>
          
          <button 
            onClick={() => {
              resetForm();
              setActiveSubTab('create');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-amber-500" />
            {editingVehicleId ? 'Edit Draft' : 'Add New Listing'}
          </button>
        </div>
      </div>

      {/* Sub tabs view */}
      {activeSubTab === 'listings' && (
        <div>
          {myListings.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center max-w-xl mx-auto">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-lg">No Active Inventory</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                You haven't listed any vehicles for sale. Get started by drafting a listing with images, condition details, and pricing.
              </p>
              <button 
                onClick={() => setActiveSubTab('create')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
              >
                Draft First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map(vehicle => (
                <div key={vehicle.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={vehicle.images[0]} 
                      alt={vehicle.make} 
                      className="h-48 w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold shadow-sm ${
                        vehicle.status === 'available' ? 'bg-emerald-500 text-white' :
                        vehicle.status === 'pending' ? 'bg-amber-500 text-white animate-pulse' :
                        'bg-gray-800 text-white'
                      }`}>
                        {vehicle.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                        <p className="text-gray-400 text-xs font-mono">ID: {vehicle.id} | {vehicle.vehicleType.toUpperCase()}</p>
                      </div>
                      <span className="text-lg font-extrabold text-gray-900 font-mono">{formatPrice(vehicle.price)}</span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{vehicle.description}</p>

                    {/* Metadata specs */}
                    <div className="grid grid-cols-3 gap-2 border-y border-gray-50 py-3 my-4 text-[10px] font-mono text-gray-500">
                      <div>
                        <span className="block text-gray-400">MILEAGE</span>
                        <span className="font-bold text-gray-800">{vehicle.mileage.toLocaleString()} mi</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">CONDITION</span>
                        <span className="font-bold text-gray-800">{vehicle.condition}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">LOCATION</span>
                        <span className="font-bold text-gray-800 truncate block" title={vehicle.location}>{vehicle.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-2">
                      <button 
                        onClick={() => handleEditClick(vehicle)}
                        disabled={vehicle.status === 'sold'}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-slate-50 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-gray-400" />
                        Edit Specs
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this listing for ${vehicle.make} ${vehicle.model}?`)) {
                            onDeleteVehicle(vehicle.id);
                          }
                        }}
                        className="p-2 border border-red-100 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {vehicle.status === 'pending' && (
                      <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mt-4 flex items-start gap-2.5">
                        <span className="text-amber-500 text-xs">⚠️</span>
                        <div>
                          <p className="text-[11px] font-bold text-amber-900">Escrow Pending Checkout</p>
                          <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
                            Funds are locked in our escrow secure safe. Verify and finalize shipping directly through your buyer.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'create' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-4xl">
          <div className="p-5 border-b border-gray-50 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">
              {editingVehicleId ? 'Edit Vehicle Specifications' : 'Draft New Vehicle Listing Specifications'}
            </h3>
            <span className="text-xs text-amber-600 font-mono font-medium">S3 Image Staging Active</span>
          </div>

          <form onSubmit={handleCreateOrEditListing} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Manufacturer / Make *</label>
                <input 
                  type="text"
                  placeholder="e.g., Honda, BMW, Ford"
                  value={make}
                  onChange={e => setMake(e.target.value)}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Vehicle Model *</label>
                <input 
                  type="text"
                  placeholder="e.g., Civic, Model Y, F-150"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Model Year *</label>
                <input 
                  type="number"
                  min={1990}
                  max={2027}
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value) || 2022)}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Pricing (USD) *</label>
                <input 
                  type="number"
                  min={1}
                  value={price}
                  onChange={e => setPrice(parseInt(e.target.value) || 0)}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Current Mileage (Miles) *</label>
                <input 
                  type="number"
                  min={0}
                  value={mileage}
                  onChange={e => setMileage(parseInt(e.target.value) || 0)}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Body Type *</label>
                <select 
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value as VehicleType)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="car">Sedan / Coupe (Car)</option>
                  <option value="suv">SUV / Crossover</option>
                  <option value="truck">Truck / Pickup</option>
                  <option value="motorcycle">Motorcycle / Sportbike</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Overall Condition *</label>
                <select 
                  value={condition}
                  onChange={e => setCondition(e.target.value as VehicleCondition)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="New">Nearly New / Showroom</option>
                  <option value="Excellent">Excellent (Minor Wear)</option>
                  <option value="Good">Good (Healthy Commuter)</option>
                  <option value="Fair">Fair (Needs Minor Work)</option>
                  <option value="Poor">Poor (For Parts/Project)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Vehicle Location *</label>
                <input 
                  type="text"
                  placeholder="e.g., Seattle, WA"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Contact phone *</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Image preset selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Staged Vehicle Image URL *
              </label>
              
              <div className="flex gap-2 mb-3">
                <input 
                  type="text"
                  placeholder="Insert image S3 secure staging web URL"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  required
                  className="flex-1 text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
              </div>

              {/* Presets Grid */}
              <div>
                <p className="text-[11px] text-gray-400 mb-2 font-medium">Or select from high-quality AWS catalog presets:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {VEHICLE_IMAGE_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`relative rounded-lg overflow-hidden border-2 h-14 transition-all cursor-pointer ${
                        imageUrl === preset.url ? 'border-amber-500 scale-[1.03] shadow-sm' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1 text-[8px] text-white font-medium truncate">
                        {preset.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Listing Description *</label>
              <textarea 
                rows={5}
                placeholder="Describe the vehicle's features, ownership history, services completed, flaws, active upgrades, key details..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button 
                type="button"
                onClick={resetForm}
                className="border border-gray-200 hover:bg-slate-50 text-gray-600 px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Form
              </button>
              <button 
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {editingVehicleId ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Save & Update Listing
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Publish Live Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
