import { Vehicle, Review, User } from './types';

export const INITIAL_USERS: User[] = [];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh_1',
    make: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2021,
    price: 32500,
    mileage: 28400,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Beautiful Tesla Model 3 in pearl white multi-coat. Single owner, garage kept, full self-driving computer package included (FSD active), clean title, and battery health at 94%. Charging cables and custom weather floor mats are included. Reluctant sale due to relocation.',
    location: 'Seattle, WA',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-10T14:30:00Z',
    featured: true
  },
  {
    id: 'veh_2',
    make: 'Jeep',
    model: 'Wrangler Rubicon Unlimited',
    year: 2019,
    price: 38900,
    mileage: 41200,
    condition: 'Excellent',
    vehicleType: 'suv',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Fully loaded Rubicon prepared for overland adventuring. Features a 2-inch suspension lift, 35-inch BFGoodrich All-Terrain tires, premium winch, steel bumpers, and cold weather package (heated seats/steering). Meticulously serviced at Jeep dealership.',
    location: 'Denver, CO',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-12T09:15:00Z',
    featured: true
  },
  {
    id: 'veh_3',
    make: 'Ford',
    model: 'F-150 Raptor',
    year: 2020,
    price: 54900,
    mileage: 34500,
    condition: 'Good',
    vehicleType: 'truck',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Agate Black F-150 Raptor with 802A Luxury package. High-output Twin-Turbo V6. Features Fox Live Valve shocks, twin-panel moonroof, 360-degree camera system, B&O premium audio. Used lightly for weekend trips, minor scratch on tailgate but runs perfectly.',
    location: 'Austin, TX',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-08T11:00:00Z',
    featured: false
  },
  {
    id: 'veh_4',
    make: 'Ducati',
    model: 'Monster 821',
    year: 2018,
    price: 8400,
    mileage: 8900,
    condition: 'Excellent',
    vehicleType: 'motorcycle',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Iconic Ducati Monster in classic Ducati Red. Completely stock, meticulously maintained. Full annual service completed in June 2026 including belt inspection. Responsive riding modes, ABS, Ducati Traction Control. Perfect urban commuter or weekend canyon carver.',
    location: 'San Francisco, CA',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-13T17:45:00Z',
    featured: true
  },
  {
    id: 'veh_5',
    make: 'Toyota',
    model: 'RAV4 Hybrid XLE',
    year: 2022,
    price: 29800,
    mileage: 19100,
    condition: 'New',
    vehicleType: 'suv',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Excellent hybrid SUV, nearly brand new condition. Incredible fuel efficiency (41 MPG city). Features Toyota Safety Sense 2.0 (Lane Departure Alert, Pre-collision system, Adaptive Cruise), Apple CarPlay & Android Auto. Owner is upgrading to a larger truck.',
    location: 'Boston, MA',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-14T01:20:00Z',
    featured: false
  },
  {
    id: 'veh_6',
    make: 'Honda',
    model: 'Civic Type R',
    year: 2019,
    price: 33200,
    mileage: 27500,
    condition: 'Good',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Championship White Civic Type R. 306-horsepower turbo 2.0L. Completely unmodified, rare to find in this clean condition. Features Brembo front brakes, active damper system, customized standard bucket seats, 20-inch wheels. Fully serviced at local Honda dealer.',
    location: 'Chicago, IL',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'sold',
    createdAt: '2026-07-05T08:00:00Z',
    featured: false
  },
  {
    id: 'veh_7',
    make: 'Porsche',
    model: '911 GT3 (992)',
    year: 2022,
    price: 189500,
    mileage: 4200,
    condition: 'New',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Stunning Shark Blue Porsche 911 GT3. Naturally aspirated 4.0L flat-six engine revving to 9,000 RPM. 7-speed PDK dual-clutch transmission. Features carbon fiber full bucket seats, front axle lift system, ceramic composite brakes (PCCB), and carbon fiber roof. Full body PPF installed from day one.',
    location: 'Miami, FL',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-14T05:00:00Z',
    featured: true
  },
  {
    id: 'veh_8',
    make: 'Rivian',
    model: 'R1T Launch Edition',
    year: 2023,
    price: 68000,
    mileage: 12400,
    condition: 'Excellent',
    vehicleType: 'truck',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Launch Edition Rivian R1T in Rivian Blue with Black Mountain interior. Quad-Motor AWD system producing 835 HP. Large battery pack with ~328 miles of real-world range. Includes reinforced underbody shield, power tonneau cover, premium adventure package, and built-in air compressor.',
    location: 'Portland, OR',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-13T10:30:00Z',
    featured: true
  },
  {
    id: 'veh_9',
    make: 'Chevrolet',
    model: 'Corvette C8 Stingray 3LT',
    year: 2021,
    price: 67900,
    mileage: 8100,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Beautiful Torch Red Corvette C8 Stingray with Adrenaline Red leather interior. Top tier 3LT trim package. Features the Z51 Performance Package (performance brakes, suspension, exhaust, electronic limited-slip differential), front lift with memory, GT2 bucket seats, and Bose Performance Series 14-speaker audio.',
    location: 'Las Vegas, NV',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-12T16:20:00Z',
    featured: false
  },
  {
    id: 'veh_10',
    make: 'BMW',
    model: 'M4 Competition xDrive',
    year: 2022,
    price: 74500,
    mileage: 15300,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Alpine White BMW M4 Competition Coupe equipped with xDrive all-wheel drive. Twin-turbo inline-six engine generating 503 HP. Options include Executive Package (Head-up display, heated steering wheel, power tailgate), carbon fiber exterior trim, and Yas Marina Blue/Black full Merino leather interior.',
    location: 'Los Angeles, CA',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-14T03:15:00Z',
    featured: false
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    reviewerName: 'Alice Green',
    reviewerId: 'usr_buyer_alice',
    targetUserId: 'usr_seller_1',
    rating: 5,
    comment: 'Robert was incredibly professional and patient. He showed me all the maintenance logs and let me perform an independent pre-purchase inspection. The car was exactly as described!',
    createdAt: '2026-06-20T10:30:00Z'
  },
  {
    id: 'rev_2',
    reviewerName: 'Mark R.',
    reviewerId: 'usr_buyer_mark',
    targetUserId: 'usr_seller_2',
    rating: 4,
    comment: 'Great seller. Response was a little slow due to timezones but the purchase transaction through the AWS escrow system was flawless and extremely secure.',
    createdAt: '2026-07-02T15:45:00Z'
  }
];
