import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Mail,
  Globe,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    razorpayEnabled: true,
    stripeEnabled: true,
    razorpayKeyId: 'rzp_test_***',
    stripePublishableKey: 'pk_test_***'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePaymentSettingChange = (key, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // API call to update profile
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    // API call to change password
    toast.success('Password changed successfully');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleNotificationSave = () => {
    // API call to save notification settings
    toast.success('Notification settings saved');
  };

  const handlePaymentSettingsSave = () => {
    // API call to save payment settings
    toast.success('Payment settings saved');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'payments', name: 'Payment Gateways', icon: CreditCard },
    { id: 'system', name: 'System', icon: SettingsIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-600">Update your account profile information</p>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          className="form-input pr-10"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          className="form-input"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-input"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="btn btn-primary">
                        <Shield className="h-4 w-4 mr-2" />
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Authentication</p>
                      <p className="text-sm text-gray-500">Receive verification codes via SMS</p>
                    </div>
                    <button className="btn btn-secondary">Enable</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-600">Choose how you want to be notified</p>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key === 'emailNotifications' && 'Receive notifications via email'}
                          {key === 'pushNotifications' && 'Receive push notifications in browser'}
                          {key === 'smsNotifications' && 'Receive notifications via SMS'}
                          {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={value}
                          onChange={() => handleNotificationChange(key)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <button onClick={handleNotificationSave} className="btn btn-primary">
                    <Bell className="h-4 w-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Razorpay Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Razorpay Configuration</h3>
                  <p className="text-sm text-gray-600">Configure Razorpay payment gateway</p>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Enable Razorpay</p>
                        <p className="text-sm text-gray-500">Accept payments through Razorpay</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={paymentSettings.razorpayEnabled}
                          onChange={(e) => handlePaymentSettingChange('razorpayEnabled', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {paymentSettings.razorpayEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">Razorpay Key ID</label>
                          <input
                            type="text"
                            className="form-input"
                            value={paymentSettings.razorpayKeyId}
                            onChange={(e) => handlePaymentSettingChange('razorpayKeyId', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Razorpay Key Secret</label>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Enter key secret"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stripe Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Stripe Configuration</h3>
                  <p className="text-sm text-gray-600">Configure Stripe payment gateway</p>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Enable Stripe</p>
                        <p className="text-sm text-gray-500">Accept payments through Stripe</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={paymentSettings.stripeEnabled}
                          onChange={(e) => handlePaymentSettingChange('stripeEnabled', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {paymentSettings.stripeEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">Stripe Publishable Key</label>
                          <input
                            type="text"
                            className="form-input"
                            value={paymentSettings.stripePublishableKey}
                            onChange={(e) => handlePaymentSettingChange('stripePublishableKey', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Stripe Secret Key</label>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Enter secret key"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handlePaymentSettingsSave} className="btn btn-primary">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Save Payment Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* General Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                  <p className="text-sm text-gray-600">Configure general system settings</p>
                </div>
                <div className="card-body">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label className="form-label">Site Name</label>
                        <input
                          type="text"
                          className="form-input"
                          defaultValue="Real Estate Admin"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Site URL</label>
                        <input
                          type="url"
                          className="form-input"
                          defaultValue="https://realestate.com"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Site Description</label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        defaultValue="Complete real estate management system"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label className="form-label">Default Language</label>
                        <select className="form-select">
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <select className="form-select">
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Email Settings</h3>
                  <p className="text-sm text-gray-600">Configure SMTP settings for email delivery</p>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">SMTP Host</label>
                      <input
                        type="text"
                        className="form-input"
                        defaultValue="smtp.gmail.com"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SMTP Port</label>
                      <input
                        type="number"
                        className="form-input"
                        defaultValue="587"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SMTP Username</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SMTP Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Enter SMTP password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn btn-primary">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Save System Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;