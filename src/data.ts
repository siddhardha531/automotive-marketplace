import { Vehicle, Review, User } from './types';

export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>";

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_buyer',
    name: 'Siddharth Samarla',
    email: 'siddusamarla14@gmail.com',
    role: 'buyer',
    avatar: DEFAULT_AVATAR,
    balance: 150000
  },
  {
    id: 'usr_seller_1',
    name: 'Robert Jenkins',
    email: 'robert.j@awsvehicles.com',
    role: 'seller',
    avatar: DEFAULT_AVATAR,
    balance: 45000
  },
  {
    id: 'usr_seller_2',
    name: 'Sarah Connor',
    email: 'sconnor@motors.com',
    role: 'seller',
    avatar: DEFAULT_AVATAR,
    balance: 89000
  }
];

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
      'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/174975/wrangler-exterior-right-front-three-quarter-34.png?isig=0&q=80&q=80'
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
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800'
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
      'https://claveyscorner.com/wp-content/uploads/2020/01/2020-Honda-Civic-Sport-Driving-Front.jpg'
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
  },
  {
    id: 'veh_11',
    make: 'Audi',
    model: 'e-tron GT Prestige',
    year: 2023,
    price: 84900,
    mileage: 6200,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Breathtaking Audi e-tron GT Prestige. Dual electric motor producing 522 HP with boost mode. Stunning tactical green exterior with black leather interior. Bang & Olufsen 3D Premium Sound System, head-up display, adaptive air suspension, and clean title. Level 2 home charger included.',
    location: 'Miami, FL',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-15T09:40:00Z',
    featured: true
  },
  {
    id: 'veh_12',
    make: 'Mazda',
    model: 'MX-5 Miata Club',
    year: 2021,
    price: 26800,
    mileage: 14500,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Soul Red Crystal Metallic MX-5 Miata Club. 6-speed manual transmission, Bilstein dampers, Brembo/BBS Recaro package, heated seats, Apple CarPlay. Pristine condition, driven only in summer. Completely stock, meticulously detailed.',
    location: 'Portland, OR',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-15T11:20:00Z',
    featured: false
  },
  {
    id: 'veh_13',
    make: 'Subaru',
    model: 'Outback Wilderness',
    year: 2022,
    price: 33500,
    mileage: 22100,
    condition: 'Good',
    vehicleType: 'suv',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Geyser Blue Subaru Outback Wilderness. Raised ground clearance (9.5 inches), Yokohama GEOLANDAR all-terrain tires, dual-function X-MODE, startex water-repellent upholstery. Subaru EyeSight Driver Assist. Perfect for PNW exploring and winter snow trips.',
    location: 'Denver, CO',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-14T14:50:00Z',
    featured: true
  },
  {
    id: 'veh_14',
    make: 'Ford',
    model: 'Mustang Shelby GT500',
    year: 2020,
    price: 76900,
    mileage: 8200,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi4WU0bA_N-p0xDafjiEMCRS4u2gCnH4TYjOqtS3vMaQ&s=10'
    ],
    description: 'Menacing Shadow Black Shelby GT500 with painted over-the-top stripes. Supercharged 5.2L V8 producing 760 HP. Tremec 7-speed dual-clutch transmission. Recaro leather seats, Technology Package, carbon fiber interior accents. Sounds incredible, runs flawlessly, clear protective film on front.',
    location: 'Austin, TX',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-15T15:10:00Z',
    featured: false
  },
  {
    id: 'veh_15',
    make: 'Triumph',
    model: 'Bonneville T120 Black',
    year: 2021,
    price: 10400,
    mileage: 3400,
    condition: 'Excellent',
    vehicleType: 'motorcycle',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Stunning Triumph Bonneville T120 Black. 1200cc high-torque twin engine. Matte black finish, custom brown leather seat, vintage bar-end mirrors. Always stored in heated garage, ceramic coated. Includes original exhaust and parts.',
    location: 'Seattle, WA',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-15T16:45:00Z',
    featured: false
  },
  {
    id: 'veh_16',
    make: 'Mercedes-Benz',
    model: 'AMG G 63',
    year: 2021,
    price: 149500,
    mileage: 12800,
    condition: 'Excellent',
    vehicleType: 'suv',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Iconic Mercedes-AMG G 63 in Obsidian Black Metallic over Classic Red/Black Nappa leather. Handcrafted 4.0L V8 Biturbo producing 577 HP. Equipped with the Exclusive Interior Plus package, AMG Night Package, 22-inch AMG cross-spoke wheels, and silver brake calipers. Pristine shape, serviced strictly at Mercedes-Benz authorized dealerships.',
    location: 'Los Angeles, CA',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-15T18:30:00Z',
    featured: true
  },
  {
    id: 'veh_17',
    make: 'Hyundai',
    model: 'IONIQ 5 Limited',
    year: 2022,
    price: 38500,
    mileage: 14200,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Stunning IONIQ 5 Limited AWD in Shooting Star Matte Gray. This award-winning EV features 320 HP, 74-kWh battery pack, ultra-fast 800V charging (10% to 80% in 18 minutes), vision sunroof with power sunshade, head-up display with AR, and Remote Smart Parking Assist. Exceptionally quiet ride, clean title, single owner.',
    location: 'San Jose, CA',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-15T20:15:00Z',
    featured: false
  },
  {
    id: 'veh_18',
    make: 'RAM',
    model: '1500 TRX',
    year: 2022,
    price: 79900,
    mileage: 18500,
    condition: 'Excellent',
    vehicleType: 'truck',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'The ultimate performance pickup. RAM 1500 TRX powered by a Supercharged 6.2L HEMI V8 engine delivering 702 HP. Bright White Clearcoat with TRX Level 2 Equipment Group. Bilstein Black Hawk e2 adaptive shocks, dual-pane panoramic sunroof, Harman Kardon 19-speaker premium sound, and head-up display. Never taken off-road, strictly garage-kept.',
    location: 'Houston, TX',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-16T01:10:00Z',
    featured: true
  },
  {
    id: 'veh_19',
    make: 'Harley-Davidson',
    model: 'Iron 883',
    year: 2020,
    price: 7800,
    mileage: 2600,
    condition: 'Excellent',
    vehicleType: 'motorcycle',
    images: [
      // 'https://images.unsplash.com/photo-1562591176-f4f6e913a891?auto=format&fit=crop&q=80&w=800'
     'https://www.brmexpeditions.com/wp-content/uploads/2023/04/6fc23f391c9906756f70011f771b5a66-e1607773795270.png'
    ],
    description: 'Grit-finished Harley-Davidson Sportster Iron 883 in Black Denim. Air-cooled Evolution V-Twin 883cc engine. Features blacked-out detailing, slammed suspension for a comfortable cruise, solo seat, and custom Vance & Hines shortshots exhaust that sounds deep and aggressive. Meticulously maintained, perfect entry or urban cruiser.',
    location: 'Phoenix, AZ',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-15T22:40:00Z',
    featured: false
  },
  {
    id: 'veh_20',
    make: 'Tesla',
    model: 'Model S Plaid',
    year: 2023,
    price: 89900,
    mileage: 4900,
    condition: 'New',
    vehicleType: 'car',
    images: [
      'https://stimg.cardekho.com/images/carexteriorimages/630x420/Tesla/Model-S/5252/1752499273852/front-left-side-47.jpg'
    ],
    description: 'Incredible Tesla Model S Plaid in Solid Black with Carbon Fiber trim and yoke steering wheel. Tri-Motor AWD system pumping out a staggering 1,020 HP (0-60 MPH in 1.99s). Features standard autopilot, sub-zero weather package, 21-inch Arachnid wheels, and 17-inch cinematic center display. Absolutely immaculate condition inside and out.',
    location: 'San Francisco, CA',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-16T02:05:00Z',
    featured: true
  },
  {
    id: 'veh_21',
    make: 'Land Rover',
    model: 'Defender 110 V8',
    year: 2023,
    price: 94000,
    mileage: 7200,
    condition: 'Excellent',
    vehicleType: 'suv',
    images: [
    //   'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=800'
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMwKHTVB7HR-VtQMa9EZiNguyFUnAo9VgUdgxlh8WXymTJXcXwywQthSuB&s=10'
    ],
    description: 'Mighty Land Rover Defender 110 V8 in Carpathian Gray with Satin Protective Film. 518 HP Supercharged V8 engine. Premium Ebony Windsor leather with Miko Suedecloth interior. Active electronic differential, configurable terrain response, quad outboard exhausts, and 22-inch satin dark gray wheels. True rugged luxury.',
    location: 'Boston, MA',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-16T03:00:00Z',
    featured: false
  },
  {
    id: 'veh_22',
    make: 'GMC',
    model: 'Hummer EV Edition 1',
    year: 2022,
    price: 99500,
    mileage: 3100,
    condition: 'Excellent',
    vehicleType: 'truck',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Jaw-dropping GMC Hummer EV Edition 1 in Interstellar White. Features 3 motors delivering 1,000 HP, revolutionary CrabWalk mode, adaptive air suspension with Extract Mode, Watts to Freedom acceleration mode, and dynamic Infinity Roof with modular transparent Sky Panels. Ultra-rare collector truck ready for delivery.',
    location: 'Denver, CO',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-16T02:30:00Z',
    featured: false
  },
  {
    id: 'veh_23',
    make: 'Vespa',
    model: 'Primavera 150',
    year: 2021,
    price: 4500,
    mileage: 1100,
    condition: 'Excellent',
    vehicleType: 'motorcycle',
    images: [
      'https://c.ndtvimg.com/2026-03/jo29ucac_vespa-sprint-s_625x300_21_March_26.jpg?im=FeatureCrop,algorithm=dnn,width=1200,height=800'
    ],
    description: 'Charming Vespa Primavera 150 in Mint Green. Single-cylinder 4-stroke 150cc engine with electronic injection. Excellent fuel mileage, lightweight, retro styling with modern LED lighting and front disc brake with ABS. Perfect city commuter or beach cruiser. Comes with a matching rear top box.',
    location: 'Miami, FL',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-15T19:20:00Z',
    featured: false
  },
  {
    id: 'veh_24',
    make: 'Toyota',
    model: 'Corolla LE',
    year: 2018,
    price: 14200,
    mileage: 56400,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Extremely reliable Toyota Corolla LE in Classic Silver Metallic. Excellent fuel efficiency, clean interior, back-up camera, lane departure alert, and dynamic radar cruise control. Brand new tires installed last month. Perfect daily commuter with zero issues.',
    location: 'Houston, TX',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-16T03:10:00Z',
    featured: false
  },
  {
    id: 'veh_25',
    make: 'Honda',
    model: 'Civic Sport',
    year: 2019,
    price: 17500,
    mileage: 42100,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGHNNf_BHseBUzvgVn-y6efm40I1EC1P3D4XTzzgvqGQ&s=10'
    ],
    description: 'Sporty Honda Civic Sport in Aegean Blue Metallic. 2.0L 4-cylinder engine, 18-inch alloy wheels, center-outlet dual exhaust, Apple CarPlay, Android Auto, and Honda Sensing suite. Fun to drive, highly fuel-efficient, single-owner car with pristine dealer service record.',
    location: 'Chicago, IL',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-16T03:15:00Z',
    featured: false
  },
  {
    id: 'veh_26',
    make: 'Ford',
    model: 'Escape SE',
    year: 2018,
    price: 12900,
    mileage: 61800,
    condition: 'Good',
    vehicleType: 'suv',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Versatile Ford Escape SE in Shadow Black with intelligent AWD. Powered by a 1.5L EcoBoost engine. Features heated front seats, dual-zone automatic climate control, SYNC 3 infotainment system with an 8-inch touchscreen, and satellite radio. Spacious cargo space and smooth highway ride.',
    location: 'Denver, CO',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-16T03:20:00Z',
    featured: false
  },
  {
    id: 'veh_27',
    make: 'Nissan',
    model: 'Leaf SV',
    year: 2019,
    price: 11500,
    mileage: 38200,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Eco-friendly Nissan Leaf SV Electric in Gun Metallic. 40 kWh battery with ~150 miles range, perfect for urban commuting. Nissan ProPILOT Assist, e-Pedal mode, heated seats/steering wheel, navigation, and quick-charge port. battery health is exceptional at 11/12 bars. Includes premium charger cable.',
    location: 'San Jose, CA',
    sellerId: 'usr_seller_1',
    sellerName: 'Robert Jenkins',
    sellerEmail: 'robert.j@awsvehicles.com',
    sellerPhone: '+1 (206) 555-0142',
    status: 'available',
    createdAt: '2026-07-16T03:25:00Z',
    featured: false
  },
  {
    id: 'veh_28',
    make: 'Subaru',
    model: 'Impreza Premium',
    year: 2019,
    price: 15800,
    mileage: 49500,
    condition: 'Excellent',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'All-Weather Subaru Impreza Premium sedan in Crystal Black Silica with Symmetrical AWD. Subaru EyeSight driver assistance, heated cloth seats, power moonroof, alloy wheels, and seamless Apple CarPlay integration. Extremely safe, highly reliable, and ready for any season.',
    location: 'Seattle, WA',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-16T03:30:00Z',
    featured: false
  },
  {
    id: 'veh_29',
    make: 'Mazda',
    model: '3 Touring',
    year: 2018,
    price: 13600,
    mileage: 58100,
    condition: 'Good',
    vehicleType: 'car',
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Elegant Mazda 3 Touring sedan in Machine Gray Metallic. Luxurious leatherette seats, blind-spot monitoring, dual-zone auto climate control, keyless entry/start, and Bose premium 9-speaker system. Incredible driving dynamics and handling. Fully inspected, fresh oil change.',
    location: 'Phoenix, AZ',
    sellerId: 'usr_seller_2',
    sellerName: 'Sarah Connor',
    sellerEmail: 'sconnor@motors.com',
    sellerPhone: '+1 (303) 555-0189',
    status: 'available',
    createdAt: '2026-07-16T03:35:00Z',
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

