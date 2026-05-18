import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    default_tone: user?.default_tone || 'professional'
  });
  const [passData, setPassData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setAvatarUrl(base64);
        try {
          const res = await api.patch('/users/profile', { avatar_url: base64 });
          setUser(res.data);
          toast.success('Picture changed successfully!');
        } catch (error) {
          toast.error('Failed to save picture to database');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/users/profile', profileData);
      setUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      return toast.error('New passwords do not match');
    }
    setSavingPass(true);
    try {
      await api.patch('/users/change-password', {
        current_password: passData.current_password,
        new_password: passData.new_password
      });
      toast.success('Password changed successfully');
      setPassData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPass(false);
    }
  };

  const [activeTab, setActiveTab] = useState('general');

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: This will permanently delete your account and all your cover letters. This action cannot be undone. Are you sure?')) {
      try {
        await api.delete('/users/account');
        toast.success('Account deleted');
        logout();
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">Account Settings</h1>
        <p className="text-textMuted">Manage your profile and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('general')} 
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'general' ? 'text-accent border-b-2 border-accent' : 'text-textMuted hover:text-textMain'}`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('security')} 
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'security' ? 'text-accent border-b-2 border-accent' : 'text-textMuted hover:text-textMain'}`}
        >
          Security
        </button>
      </div>

      <div className="space-y-8">
        {activeTab === 'general' && (
          /* Profile Info */
          <div className="card animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-800 pb-4 flex items-center">
              <User className="mr-2 text-accent" size={20} /> Personal Information
            </h2>
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-800">
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center border-4 border-accent/30 hover:border-accent transition-colors cursor-pointer overflow-hidden text-4xl font-bold"
                  onClick={() => document.getElementById('avatar-input').click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-accent text-base text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full pointer-events-none">
                  +
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">{profileData.full_name || 'User'}</h3>
                <p className="text-sm text-textMuted mb-2">{user?.email}</p>
                <input 
                  type="file" 
                  id="avatar-input" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('avatar-input').click()}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  Change Avatar
                </button>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.full_name}
                    onChange={e => setProfileData({...profileData, full_name: e.target.value})}
                    className="input-field" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    className="input-field opacity-50 cursor-not-allowed" 
                    disabled
                  />
                  <p className="text-xs text-textMuted mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 000-0000"
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/in/username"
                    className="input-field" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Default Writing Tone</label>
                  <select 
                    value={profileData.default_tone}
                    onChange={e => setProfileData({...profileData, default_tone: e.target.value})}
                    className="input-field max-w-md"
                  >
                    <option value="professional">Professional & Formal</option>
                    <option value="enthusiastic">Enthusiastic & Eager</option>
                    <option value="concise">Concise & Direct</option>
                    <option value="creative">Creative & Storytelling</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Professional Bio / Summary</label>
                  <textarea 
                    placeholder="Briefly describe your background, career goals, and what makes you unique..."
                    className="input-field h-24 resize-y" 
                  ></textarea>
                  <p className="text-xs text-textMuted mt-1">This helps the AI write more personalized letters.</p>
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={savingProfile} className="btn-primary flex items-center">
                  <Save size={18} className="mr-2" /> {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <>
            {/* Change Password */}
            <div className="card animate-fade-in-up">
              <h2 className="text-xl font-bold mb-6 border-b border-gray-800 pb-4 flex items-center">
                <Lock className="mr-2 text-accent" size={20} /> Change Password
              </h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input 
                    type="password" 
                    value={passData.current_password}
                    onChange={e => setPassData({...passData, current_password: e.target.value})}
                    className="input-field max-w-md" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={passData.new_password}
                    onChange={e => setPassData({...passData, new_password: e.target.value})}
                    className="input-field max-w-md" 
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passData.confirm_password}
                    onChange={e => setPassData({...passData, confirm_password: e.target.value})}
                    className="input-field max-w-md" 
                    required
                    minLength={6}
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={savingPass} className="btn-secondary flex items-center">
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="card border border-red-900/50 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-bold mb-4 text-red-400">Danger Zone</h2>
              <p className="text-textMuted mb-6">
                Deleting your account will permanently remove all your generated cover letters, profile data, and settings. This cannot be undone.
              </p>
              <button onClick={handleDeleteAccount} className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500 hover:text-white transition-colors flex items-center font-medium">
                <Trash2 size={18} className="mr-2" /> Delete Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
