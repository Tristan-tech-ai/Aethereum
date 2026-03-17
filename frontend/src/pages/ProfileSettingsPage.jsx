import React, { useState, useRef } from 'react';
import { User, Camera, Shield, ArrowLeft, Save, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import { useAuthStore } from '../stores/authStore';

const ProfileSettingsPage = () => {
  const { user, updateProfile, uploadAvatar, updateSettings, loading, error, fieldErrors, clearError } = useAuthStore();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });

  // Settings form
  const [settingsData, setSettingsData] = useState({
    is_profile_public: user?.is_profile_public ?? true,
    show_on_leaderboard: user?.show_on_leaderboard ?? false,
    weekly_goal: user?.weekly_goal ?? 5,
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    const result = await updateProfile(profileData);
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    const result = await updateSettings(settingsData);
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate client-side
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    await uploadAvatar(file);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy & Settings', icon: Shield },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/profile" className="text-text-muted hover:text-text-primary transition-colors duration-fast">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-h2 font-heading text-text-primary">Profile Settings</h1>
          <p className="text-text-secondary text-body-sm">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Avatar Section */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar
              src={user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `/storage/${user.avatar_url}`) : null}
              name={user?.name || ''}
              size="xl"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-fast flex items-center justify-center"
            >
              <Camera size={24} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-text-primary font-semibold text-h4">{user?.name}</h3>
            <p className="text-text-secondary text-body-sm">@{user?.username}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-primary text-sm hover:text-primary-light transition-colors duration-fast font-medium"
            >
              Change avatar
            </button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-secondary p-1 rounded-md-drd border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); clearError(); setSaveSuccess(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-fast ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-glow-primary'
                : 'text-text-muted hover:text-text-primary hover:bg-dark-card'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 text-success text-sm rounded-md-drd flex items-center gap-2">
          <Check size={16} />
          Changes saved successfully!
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-md-drd">
          {error}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <Input
              label="Display Name"
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              error={fieldErrors.name}
              required
            />

            <Input
              label="Username"
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              error={fieldErrors.username}
              required
            />
            <p className="text-caption text-text-muted -mt-3">
              Letters, numbers, and underscores only. This is your public @handle.
            </p>

            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-3">Bio</label>
              <textarea
                rows={3}
                maxLength={500}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                className="w-full bg-dark-secondary border border-border hover:border-border-hover focus:border-2 focus:border-primary text-text-primary rounded-[8px] px-4 py-3 transition-all duration-fast outline-none placeholder:text-text-muted resize-none"
              />
              <p className="text-caption text-text-muted mt-1">{profileData.bio.length}/500</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Privacy & Settings Tab */}
      {activeTab === 'privacy' && (
        <Card>
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-text-primary font-semibold">Public Profile</h3>
                <p className="text-text-secondary text-body-sm">Allow others to view your profile and knowledge cards</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsData.is_profile_public}
                  onChange={(e) => setSettingsData({ ...settingsData, is_profile_public: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-elevated peer-focus:ring-2 peer-focus:ring-border-focus rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-fast"></div>
              </label>
            </div>

            {/* Leaderboard Toggle */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <h3 className="text-text-primary font-semibold">Show on Leaderboard</h3>
                <p className="text-text-secondary text-body-sm">Appear on weekly leaderboards (Focus, Knowledge, Streak, Quiz)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsData.show_on_leaderboard}
                  onChange={(e) => setSettingsData({ ...settingsData, show_on_leaderboard: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-elevated peer-focus:ring-2 peer-focus:ring-border-focus rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-fast"></div>
              </label>
            </div>

            {/* Weekly Goal */}
            <div className="border-t border-border pt-6">
              <h3 className="text-text-primary font-semibold mb-1">Weekly Learning Goal</h3>
              <p className="text-text-secondary text-body-sm mb-4">How many days per week do you want to learn?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSettingsData({ ...settingsData, weekly_goal: day })}
                    className={`w-10 h-10 rounded-[8px] font-medium text-sm transition-all duration-fast ${
                      settingsData.weekly_goal === day
                        ? 'bg-primary text-white shadow-glow-primary'
                        : 'bg-dark-secondary text-text-muted hover:bg-dark-card hover:text-text-primary'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-caption text-text-muted mt-2">
                {settingsData.weekly_goal === 7 ? 'Every day — impressive!' : `${settingsData.weekly_goal} days per week`}
              </p>
            </div>

            <div className="flex justify-end border-t border-border pt-6">
              <Button type="submit" loading={loading}>
                <Save size={16} className="mr-2" />
                Save Settings
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfileSettingsPage;
