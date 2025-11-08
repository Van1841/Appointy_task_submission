import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'AI', 'Technology', 'Nature', 'Finance', 'Health',
  'Education', 'Entertainment', 'Sports', 'Art', 'Science'
];

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.name,
      selectedCategories
    );

    if (result.success) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mb-4 shadow-neon-glow">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-3xl font-bold neon-text mb-2">Join SynapseMind</h1>
          <p className="text-gray-400">Create your AI-powered second brain</p>
        </div>

        {/* Signup Form */}
        <div className="glass rounded-2xl p-8 border border-dark-border">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center space-x-2 ${step === 1 ? 'text-neon-blue' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-neon-blue text-dark-bg' : 'bg-dark-card'}`}>
                1
              </div>
              <span className="text-sm font-medium">Account</span>
            </div>
            <div className="w-12 h-0.5 bg-dark-border"></div>
            <div className={`flex items-center space-x-2 ${step === 2 ? 'text-neon-blue' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-neon-blue text-dark-bg' : 'bg-dark-card'}`}>
                2
              </div>
              <span className="text-sm font-medium">Interests</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Details */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6">Create Account</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500 transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500 transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white py-3 rounded-lg font-medium hover:shadow-neon-glow transition-all duration-200"
                >
                  Next: Select Interests
                </button>
              </div>
            )}

            {/* Step 2: Category Selection */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-2">What interests you?</h2>
                <p className="text-gray-400 mb-6">Select categories to personalize your experience (optional)</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                        selectedCategories.includes(category)
                          ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                          : 'border-dark-border bg-dark-card text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-dark-card border border-dark-border text-white py-3 rounded-lg font-medium hover:bg-dark-hover transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-accent-primary to-accent-secondary text-white py-3 rounded-lg font-medium hover:shadow-neon-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FiUserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-neon-blue hover:text-neon-purple transition-colors font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
