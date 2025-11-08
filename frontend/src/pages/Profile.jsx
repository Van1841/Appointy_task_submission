import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiSave, FiTrendingUp, FiClock, FiFolder, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { uploadAPI } from '../utils/api';

const CATEGORIES = [
  'AI', 'Technology', 'Nature', 'Finance', 'Health',
  'Education', 'Entertainment', 'Sports', 'Art', 'Science', 'Other'
];

function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    categories: user?.categories || []
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUploads: 0,
    recentUploads: 0,
    favoriteCategory: 'None',
    streak: 0
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await uploadAPI.getAll({});
      const uploads = response.data.uploads;

      // Calculate stats
      const totalUploads = uploads.length;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentUploads = uploads.filter(u => new Date(u.createdAt) > weekAgo).length;

      // Find favorite category
      const categoryCounts = {};
      uploads.forEach(u => {
        const cat = u.category || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCounts).reduce((a, b) =>
        categoryCounts[a] > categoryCounts[b] ? a : b, 'None'
      );

      // Calculate streak (simplified - days with uploads)
      const uniqueDays = new Set(uploads.map(u =>
        new Date(u.createdAt).toDateString()
      ));
      const streak = uniqueDays.size;

      setStats({
        totalUploads,
        recentUploads,
        favoriteCategory: favoriteCategory.charAt(0).toUpperCase() + favoriteCategory.slice(1),
        streak
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const toggleCategory = (category) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateUser(formData);

    if (result.success) {
      toast.success('Profile updated successfully!');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Personal Dashboard */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <FiTrendingUp className="mr-2 text-neon-blue" />
          Your Personal Dashboard
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-6 border border-dark-border hover:border-neon-blue/50 transition-all duration-300 neon-hover group">
            <div className="flex items-center justify-between mb-3">
              <FiFolder className="w-8 h-8 text-neon-blue group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-bold text-neon-blue mb-1">{stats.totalUploads}</p>
            <p className="text-sm text-gray-400">Total Saves</p>
          </div>

          <div className="glass rounded-xl p-6 border border-dark-border hover:border-neon-purple/50 transition-all duration-300 neon-hover group">
            <div className="flex items-center justify-between mb-3">
              <FiClock className="w-8 h-8 text-neon-purple group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs text-gray-400">7 Days</span>
            </div>
            <p className="text-3xl font-bold text-neon-purple mb-1">{stats.recentUploads}</p>
            <p className="text-sm text-gray-400">Recent Saves</p>
          </div>

          <div className="glass rounded-xl p-6 border border-dark-border hover:border-neon-pink/50 transition-all duration-300 neon-hover group">
            <div className="flex items-center justify-between mb-3">
              <FiStar className="w-8 h-8 text-neon-pink group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs text-gray-400">Top</span>
            </div>
            <p className="text-xl font-bold text-neon-pink mb-1">{stats.favoriteCategory}</p>
            <p className="text-sm text-gray-400">Favorite Category</p>
          </div>

          <div className="glass rounded-xl p-6 border border-dark-border hover:border-neon-green/50 transition-all duration-300 neon-hover group">
            <div className="flex items-center justify-between mb-3">
              <FiTrendingUp className="w-8 h-8 text-neon-green group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs text-gray-400">Days</span>
            </div>
            <p className="text-3xl font-bold text-neon-green mb-1">{stats.streak}</p>
            <p className="text-sm text-gray-400">Active Days</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-8 border border-dark-border">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Info */}
          <div>
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white"
                    placeholder="Your name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-xl font-bold mb-4">Interests & Categories</h2>
            <p className="text-sm text-gray-400 mb-4">
              Select categories that interest you for better AI recommendations
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`py-3 px-4 rounded-lg border-2 transition-all duration-300 font-medium neon-hover group ${
                    formData.categories.includes(category)
                      ? 'border-neon-blue bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-neon-blue shadow-neon-glow-sm'
                      : 'border-dark-border bg-dark-card text-gray-400 hover:border-neon-blue/50 hover:text-white hover:shadow-neon-glow-sm'
                  }`}
                >
                  <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Stats */}
          <div>
            <h2 className="text-xl font-bold mb-4">Account Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="text-lg font-medium text-neon-blue mt-1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
                <p className="text-sm text-gray-400">Selected Categories</p>
                <p className="text-lg font-medium text-neon-purple mt-1">
                  {formData.categories.length}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-medium hover:shadow-neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
