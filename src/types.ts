export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'suv';
export type VehicleCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type ListingStatus = 'available' | 'pending' | 'sold';
export type EscrowStatus = 'escrow_pending' | 'released' | 'refunded';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: VehicleCondition;
  vehicleType: VehicleType;
  images: string[];
  description: string;
  location: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  status: ListingStatus;
  createdAt: string;
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar: string;
  balance: number; // Simulated escrow/payment wallet balance
  googleUser?: boolean;
  facebookUser?: boolean;
  password?: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerId: string;
  targetUserId: string; // The user (buyer or seller) being rated
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  vehicleId: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
  };
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  status: EscrowStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'listing' | 'offer' | 'payment' | 'review' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AWSMetrics {
  cpuUtilization: number;
  activeEc2Instances: number;
  rdsConnections: number;
  s3StorageBytes: number;
  backupStatus: 'Completed' | 'Running' | 'Failed';
  lastBackupTime: string;
  scaleOutEnabled: boolean;
  ddosPrevention: 'Active' | 'Inactive';
}
