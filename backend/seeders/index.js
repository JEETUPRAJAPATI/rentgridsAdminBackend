import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

// Import models
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import PropertyCategory from '../models/PropertyCategory.js';
import PropertyFeature from '../models/PropertyFeature.js';
import PropertyAmenity from '../models/PropertyAmenity.js';
import Property from '../models/Property.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Staff from '../models/Staff.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📁 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedPermissions = async () => {
  console.log('🔐 Seeding permissions...');
  
  const permissions = [
    // User permissions
    { name: 'View Users', module: 'users', action: 'read', description: 'View user list and details' },
    { name: 'Create Users', module: 'users', action: 'create', description: 'Create new users' },
    { name: 'Update Users', module: 'users', action: 'update', description: 'Update user information' },
    { name: 'Delete Users', module: 'users', action: 'delete', description: 'Delete users' },
    { name: 'Manage Users', module: 'users', action: 'manage', description: 'Full user management' },
    
    // Property permissions
    { name: 'View Properties', module: 'properties', action: 'read', description: 'View property list and details' },
    { name: 'Create Properties', module: 'properties', action: 'create', description: 'Create new properties' },
    { name: 'Update Properties', module: 'properties', action: 'update', description: 'Update property information' },
    { name: 'Delete Properties', module: 'properties', action: 'delete', description: 'Delete properties' },
    { name: 'Manage Properties', module: 'properties', action: 'manage', description: 'Full property management' },
    
    // Dashboard permissions
    { name: 'View Dashboard', module: 'dashboard', action: 'read', description: 'View dashboard and analytics' },
    
    // Staff permissions
    { name: 'View Staff', module: 'staff', action: 'read', description: 'View staff list and details' },
    { name: 'Create Staff', module: 'staff', action: 'create', description: 'Create new staff members' },
    { name: 'Update Staff', module: 'staff', action: 'update', description: 'Update staff information' },
    { name: 'Delete Staff', module: 'staff', action: 'delete', description: 'Delete staff members' },
    { name: 'Manage Staff', module: 'staff', action: 'manage', description: 'Full staff management' },
    
    // Payment permissions
    { name: 'View Payments', module: 'payments', action: 'read', description: 'View payment records' },
    { name: 'Update Payments', module: 'payments', action: 'update', description: 'Update payment status' },
    { name: 'Manage Payments', module: 'payments', action: 'manage', description: 'Full payment management' },
    
    // Subscription permissions
    { name: 'View Subscriptions', module: 'subscriptions', action: 'read', description: 'View subscription plans' },
    { name: 'Create Subscriptions', module: 'subscriptions', action: 'create', description: 'Create subscription plans' },
    { name: 'Update Subscriptions', module: 'subscriptions', action: 'update', description: 'Update subscription plans' },
    { name: 'Delete Subscriptions', module: 'subscriptions', action: 'delete', description: 'Delete subscription plans' },
    
    // Settings permissions
    { name: 'View Settings', module: 'settings', action: 'read', description: 'View system settings' },
    { name: 'Update Settings', module: 'settings', action: 'update', description: 'Update system settings' }
  ];

  await Permission.deleteMany({});
  const createdPermissions = await Permission.insertMany(permissions);
  console.log(`✅ Created ${createdPermissions.length} permissions`);
  return createdPermissions;
};

const seedRoles = async (permissions) => {
  console.log('👥 Seeding roles...');
  
  const allPermissionIds = permissions.map(p => p._id);
  const userPermissions = permissions.filter(p => 
    ['users', 'dashboard'].includes(p.module) && ['read', 'create', 'update'].includes(p.action)
  ).map(p => p._id);
  
  const propertyPermissions = permissions.filter(p => 
    ['properties', 'dashboard'].includes(p.module)
  ).map(p => p._id);

  const roles = [
    {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access',
      permissions: allPermissionIds
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access',
      permissions: allPermissionIds.filter(id => {
        const permission = permissions.find(p => p._id.equals(id));
        return permission.module !== 'settings' || permission.action !== 'update';
      })
    },
    {
      name: 'Property Manager',
      slug: 'property-manager',
      description: 'Property management access',
      permissions: propertyPermissions
    },
    {
      name: 'User Manager',
      slug: 'user-manager',
      description: 'User management access',
      permissions: userPermissions
    },
    {
      name: 'Staff',
      slug: 'staff',
      description: 'Basic staff access',
      permissions: permissions.filter(p => 
        p.module === 'dashboard' && p.action === 'read'
      ).map(p => p._id)
    }
  ];

  await Role.deleteMany({});
  const createdRoles = await Role.insertMany(roles);
  console.log(`✅ Created ${createdRoles.length} roles`);
  return createdRoles;
};

const seedAdmins = async (roles) => {
  console.log('👨‍💼 Seeding admins...');

  const superAdminRole = roles.find(r => r.slug === 'super-admin');
  const adminRole = roles.find(r => r.slug === 'admin');
  const managerRole = roles.find(r => r.slug === 'property-manager');

  // hash the password once (all admins can login with admin123)
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admins = [
    {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      status: 'active',
      isSuperAdmin: true,
      roles: [superAdminRole._id]
    },
    {
      name: 'John Admin',
      email: 'john@sunrise.com',
      password: hashedPassword,
      status: 'active',
      isSuperAdmin: false,
      roles: [adminRole._id]
    },
    {
      name: 'Jane Manager',
      email: 'jane@sunrise.com',
      password: hashedPassword,
      status: 'active',
      isSuperAdmin: false,
      roles: [managerRole._id]
    }
  ];

  await Admin.deleteMany({});
  const createdAdmins = await Admin.insertMany(admins);
  console.log(`✅ Created ${createdAdmins.length} admins`);
  return createdAdmins;
};

const seedUsers = async () => {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      name: 'John Tenant',
      email: 'tenant@example.com',
      phone: '9876543210',
      password: 'password123',
      user_type: 'tenant',
      status: 'active',
      address: '123 Main Street, Mumbai',
      dob: new Date('1990-01-15'),
      gender: 'male'
    },
    {
      name: 'Sarah Landlord',
      email: 'landlord@example.com',
      phone: '9876543211',
      password: 'password123',
      user_type: 'landlord',
      status: 'active',
      address: '456 Oak Avenue, Delhi',
      dob: new Date('1985-05-20'),
      gender: 'female'
    },
    {
      name: 'Mike Both',
      email: 'both@example.com',
      phone: '9876543212',
      password: 'password123',
      user_type: 'both',
      status: 'active',
      address: '789 Pine Road, Bangalore',
      dob: new Date('1988-10-10'),
      gender: 'male'
    },
    {
      name: 'Lisa Smith',
      email: 'lisa@example.com',
      phone: '9876543213',
      password: 'password123',
      user_type: 'tenant',
      status: 'active',
      address: '321 Elm Street, Chennai',
      dob: new Date('1992-12-05'),
      gender: 'female'
    },
    {
      name: 'David Johnson',
      email: 'david@example.com',
      phone: '9876543214',
      password: 'password123',
      user_type: 'landlord',
      status: 'active',
      address: '654 Maple Drive, Hyderabad',
      dob: new Date('1980-08-25'),
      gender: 'male'
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

const seedPropertyCategories = async () => {
  console.log('🏠 Seeding property categories...');
  
  const categories = [
    { name: 'Residential', slug: 'residential', description: 'Residential properties', icon: 'home' },
    { name: 'Commercial', slug: 'commercial', description: 'Commercial properties', icon: 'building' },
    { name: 'Industrial', slug: 'industrial', description: 'Industrial properties', icon: 'factory' },
    { name: 'Land/Plot', slug: 'land-plot', description: 'Land and plot properties', icon: 'map' }
  ];

  await PropertyCategory.deleteMany({});
  const createdCategories = await PropertyCategory.insertMany(categories);
  console.log(`✅ Created ${createdCategories.length} property categories`);
  return createdCategories;
};

const seedPropertyFeatures = async () => {
  console.log('⭐ Seeding property features...');
  
  const features = [
    { name: 'Parking', description: 'Dedicated parking space', icon: 'car' },
    { name: 'Garden', description: 'Private garden area', icon: 'flower' },
    { name: 'Terrace', description: 'Terrace access', icon: 'sun' },
    { name: 'Basement', description: 'Basement area', icon: 'arrow-down' },
    { name: 'Fireplace', description: 'Indoor fireplace', icon: 'fire' },
    { name: 'Study Room', description: 'Dedicated study room', icon: 'book' },
    { name: 'Store Room', description: 'Additional storage space', icon: 'box' },
    { name: 'Servant Room', description: 'Servant quarter', icon: 'user' }
  ];

  await PropertyFeature.deleteMany({});
  const createdFeatures = await PropertyFeature.insertMany(features);
  console.log(`✅ Created ${createdFeatures.length} property features`);
  return createdFeatures;
};

const seedPropertyAmenities = async () => {
  console.log('🏊 Seeding property amenities...');
  
  const amenities = [
    { name: 'Swimming Pool', description: 'Community swimming pool', icon: 'waves', category: 'lifestyle' },
    { name: 'Gym', description: 'Fitness center', icon: 'dumbbell', category: 'lifestyle' },
    { name: 'Security', description: '24/7 security', icon: 'shield', category: 'safety' },
    { name: 'Power Backup', description: 'Generator backup', icon: 'battery', category: 'safety' },
    { name: 'Elevator', description: 'High-speed elevators', icon: 'arrow-up', category: 'connectivity' },
    { name: 'Parking', description: 'Covered parking', icon: 'car', category: 'connectivity' },
    { name: 'Garden', description: 'Landscaped garden', icon: 'tree-pine', category: 'lifestyle' },
    { name: 'Club House', description: 'Community club house', icon: 'users', category: 'lifestyle' },
    { name: 'Children Play Area', description: 'Kids play zone', icon: 'baby', category: 'lifestyle' },
    { name: 'CCTV', description: 'CCTV surveillance', icon: 'video', category: 'safety' }
  ];

  await PropertyAmenity.deleteMany({});
  const createdAmenities = await PropertyAmenity.insertMany(amenities);
  console.log(`✅ Created ${createdAmenities.length} property amenities`);
  return createdAmenities;
};

const seedProperties = async (users, categories, features, amenities) => {
  console.log('🏢 Seeding properties...');
  
  const landlords = users.filter(u => ['landlord', 'both'].includes(u.user_type));
  const residentialCategory = categories.find(c => c.slug === 'residential');
  const commercialCategory = categories.find(c => c.slug === 'commercial');

  const properties = [
    {
      title: 'Luxury 3BHK Apartment in Bandra',
      description: 'Spacious 3BHK apartment with sea view in the heart of Bandra. Fully furnished with modern amenities.',
      owner_id: landlords[0]._id,
      category_id: residentialCategory._id,
      property_type: 'apartment',
      listing_type: 'rent',
      monthly_rent: 45000,
      security_deposit: 135000,
      area: 1200,
      area_unit: 'sqft',
      bedroom: 3,
      bathroom: 2,
      balcony: 2,
      bhk: 3,
      floor_no: 8,
      total_floors: 15,
      furnish_type: 'fully-furnished',
      available_from: new Date(),
      city: 'Mumbai',
      state: 'Maharashtra',
      locality: 'Bandra West',
      landmark: 'Near Bandra Station',
      zipcode: '400050',
      full_address: 'Sea View Apartments, Bandra West, Mumbai - 400050',
      latitude: 19.0596,
      longitude: 72.8295,
      features: features.slice(0, 3).map(f => f._id),
      amenities: amenities.slice(0, 5).map(a => a._id),
      status: 'published',
      is_featured: true,
      is_verified: true,
      views: 150,
      inquiries: 8
    },
    {
      title: 'Modern 2BHK Villa in Whitefield',
      description: 'Beautiful 2BHK villa with garden in prime location of Whitefield, Bangalore.',
      owner_id: landlords[1]._id,
      category_id: residentialCategory._id,
      property_type: 'villa',
      listing_type: 'both',
      monthly_rent: 35000,
      sale_price: 8500000,
      security_deposit: 105000,
      area: 1500,
      area_unit: 'sqft',
      bedroom: 2,
      bathroom: 3,
      balcony: 1,
      bhk: 2,
      floor_no: 0,
      total_floors: 2,
      furnish_type: 'semi-furnished',
      available_from: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      city: 'Bangalore',
      state: 'Karnataka',
      locality: 'Whitefield',
      landmark: 'Near ITPL',
      zipcode: '560066',
      full_address: 'Green Valley Villa, Whitefield, Bangalore - 560066',
      latitude: 12.9698,
      longitude: 77.7500,
      features: features.slice(1, 4).map(f => f._id),
      amenities: amenities.slice(2, 7).map(a => a._id),
      status: 'published',
      is_featured: false,
      is_verified: true,
      views: 89,
      inquiries: 12
    },
    {
      title: 'Commercial Office Space in Gurgaon',
      description: 'Prime office space in Cyber City, Gurgaon. Perfect for IT companies and startups.',
      owner_id: landlords[0]._id,
      category_id: commercialCategory._id,
      property_type: 'office',
      listing_type: 'rent',
      monthly_rent: 125000,
      security_deposit: 375000,
      area: 2500,
      area_unit: 'sqft',
      bedroom: 0,
      bathroom: 4,
      balcony: 0,
      floor_no: 12,
      total_floors: 25,
      furnish_type: 'unfurnished',
      available_from: new Date(),
      city: 'Gurgaon',
      state: 'Haryana',
      locality: 'Cyber City',
      landmark: 'DLF Phase 2',
      zipcode: '122002',
      full_address: 'Cyber Hub, DLF Cyber City, Gurgaon - 122002',
      latitude: 28.4942,
      longitude: 77.0868,
      features: features.slice(0, 2).map(f => f._id),
      amenities: amenities.filter(a => ['Security', 'Power Backup', 'Elevator', 'Parking'].includes(a.name)).map(a => a._id),
      status: 'published',
      is_featured: true,
      is_verified: true,
      views: 234,
      inquiries: 15
    },
    {
      title: 'Cozy 1BHK Apartment in Koramangala',
      description: 'Comfortable 1BHK apartment for bachelors in the vibrant area of Koramangala.',
      owner_id: landlords[1]._id,
      category_id: residentialCategory._id,
      property_type: 'apartment',
      listing_type: 'rent',
      monthly_rent: 22000,
      security_deposit: 44000,
      area: 650,
      area_unit: 'sqft',
      bedroom: 1,
      bathroom: 1,
      balcony: 1,
      bhk: 1,
      floor_no: 3,
      total_floors: 6,
      furnish_type: 'semi-furnished',
      available_from: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      available_for: 'Bachelor',
      city: 'Bangalore',
      state: 'Karnataka',
      locality: 'Koramangala',
      landmark: 'Near Forum Mall',
      zipcode: '560034',
      full_address: 'Sunrise Apartments, Koramangala, Bangalore - 560034',
      latitude: 12.9352,
      longitude: 77.6245,
      features: features.slice(0, 2).map(f => f._id),
      amenities: amenities.slice(0, 4).map(a => a._id),
      status: 'published',
      is_featured: false,
      is_verified: true,
      views: 76,
      inquiries: 5
    },
    {
      title: '4BHK Penthouse for Sale in Andheri',
      description: 'Luxurious 4BHK penthouse with terrace garden. Premium location with all modern amenities.',
      owner_id: landlords[0]._id,
      category_id: residentialCategory._id,
      property_type: 'apartment',
      listing_type: 'sale',
      sale_price: 25000000,
      area: 2200,
      area_unit: 'sqft',
      bedroom: 4,
      bathroom: 4,
      balcony: 3,
      bhk: 4,
      floor_no: 20,
      total_floors: 20,
      furnish_type: 'fully-furnished',
      available_from: new Date(),
      city: 'Mumbai',
      state: 'Maharashtra',
      locality: 'Andheri West',
      landmark: 'Near Metro Station',
      zipcode: '400058',
      full_address: 'Sky Heights, Andheri West, Mumbai - 400058',
      latitude: 19.1136,
      longitude: 72.8697,
      features: features.map(f => f._id), // All features
      amenities: amenities.map(a => a._id), // All amenities
      status: 'published',
      is_featured: true,
      is_verified: true,
      views: 312,
      inquiries: 23
    }
  ];

  await Property.deleteMany({});
  const createdProperties = await Property.insertMany(properties);
  console.log(`✅ Created ${createdProperties.length} properties`);
  return createdProperties;
};

const seedSubscriptionPlans = async () => {
  console.log('💳 Seeding subscription plans...');
  
  const plans = [
    {
      name: 'Starter',
      price: 999,
      duration_days: 30,
      visit_credits: 5,
      features: ['Basic Listings', 'Email Support', 'Standard Profile'],
      status: 'active',
      is_popular: false,
      sort_order: 1
    },
    {
      name: 'Standard',
      price: 1999,
      duration_days: 30,
      visit_credits: 15,
      features: ['Featured Listings', 'Priority Support', 'Enhanced Profile', 'Analytics Dashboard'],
      status: 'active',
      is_popular: true,
      sort_order: 2
    },
    {
      name: 'Priority',
      price: 2499,
      duration_days: 30,
      visit_credits: 25,
      features: ['Rush Boost', 'Concierge Scheduling', 'Priority Support', 'Advanced Analytics'],
      status: 'active',
      is_popular: false,
      sort_order: 3
    },
    {
      name: 'Premium',
      price: 4999,
      duration_days: 30,
      visit_credits: 50,
      features: ['Unlimited Listings', '24/7 Support', 'Premium Profile', 'Marketing Tools', 'API Access'],
      status: 'active',
      is_popular: false,
      sort_order: 4
    }
  ];

  await SubscriptionPlan.deleteMany({});
  const createdPlans = await SubscriptionPlan.insertMany(plans);
  console.log(`✅ Created ${createdPlans.length} subscription plans`);
  return createdPlans;
};

const seedStaff = async (roles) => {
  console.log('👷 Seeding staff...');
  
  const staffRole = roles.find(r => r.slug === 'staff');
  const propertyManagerRole = roles.find(r => r.slug === 'property-manager');

  const staff = [
    {
      name: 'Alice Staff',
      email: 'alice@sunrise.com',
      phone: '9876543220',
      role_id: staffRole._id,
      status: 'active',
      hire_date: new Date('2024-01-15'),
      salary: 25000,
      address: '123 Staff Colony, Mumbai'
    },
    {
      name: 'Bob Manager',
      email: 'bob@sunrise.com',
      phone: '9876543221',
      role_id: propertyManagerRole._id,
      status: 'active',
      hire_date: new Date('2023-11-01'),
      salary: 45000,
      address: '456 Manager Residency, Delhi'
    },
    {
      name: 'Charlie Worker',
      email: 'charlie@sunrise.com',
      phone: '9876543222',
      role_id: staffRole._id,
      status: 'active',
      hire_date: new Date('2024-02-01'),
      salary: 22000,
      address: '789 Worker Street, Bangalore'
    }
  ];

  await Staff.deleteMany({});
  const createdStaff = await Staff.insertMany(staff);
  console.log(`✅ Created ${createdStaff.length} staff members`);
  return createdStaff;
};

const runSeeders = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...\n');
    
    // Seed in order due to dependencies
    const permissions = await seedPermissions();
    const roles = await seedRoles(permissions);
    const admins = await seedAdmins(roles);
    const users = await seedUsers();
    const categories = await seedPropertyCategories();
    const features = await seedPropertyFeatures();
    const amenities = await seedPropertyAmenities();
    const properties = await seedProperties(users, categories, features, amenities);
    const plans = await seedSubscriptionPlans();
    const staff = await seedStaff(roles);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${permissions.length} permissions created`);
    console.log(`   • ${roles.length} roles created`);
    console.log(`   • ${admins.length} admins created`);
    console.log(`   • ${users.length} users created`);
    console.log(`   • ${categories.length} property categories created`);
    console.log(`   • ${features.length} property features created`);
    console.log(`   • ${amenities.length} property amenities created`);
    console.log(`   • ${properties.length} properties created`);
    console.log(`   • ${plans.length} subscription plans created`);
    console.log(`   • ${staff.length} staff members created`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: tenant@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

runSeeders();