import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUpload, FiLink, FiFileText, FiImage, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function MobileUpload() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userName, setUserName] = useState('');
  const [uploadType, setUploadType] = useState('url');
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    content: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid QR code');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/qr/verify/${token}`);
      if (response.data.valid) {
        setIsValid(true);
        setUserName(response.data.user.name);
        toast.success(`Connected as ${response.data.user.name}`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Token validation failed';
      toast.error(errorMsg);
      setIsValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (uploadType === 'file' && file) {
        // File upload
        const formDataToSend = new FormData();
        formDataToSend.append('token', token);
        formDataToSend.append('file', file);
        formDataToSend.append('title', formData.title);

        await axios.post(`${API_URL}/qr/mobile-upload/file`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // URL/Note upload
        await axios.post(`${API_URL}/qr/mobile-upload`, {
          token,
          type: uploadType,
          ...formData
        });
      }

      setSuccess(true);
      toast.success('Upload successful! Check your dashboard.', {
        duration: 5000,
        icon: '🎉'
      });

      // Clear form
      setFormData({ url: '', title: '', content: '' });
      setFile(null);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Upload failed';
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-blue mb-4"></div>
          <p className="text-white text-lg">Verifying connection...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 border border-dark-border max-w-md text-center">
          <FiAlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid QR Code</h1>
          <p className="text-gray-400 mb-6">
            This QR code is invalid, expired, or has already been used.
          </p>
          <p className="text-sm text-gray-500">
            Please scan a new QR code from your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 border border-neon-blue max-w-md text-center animate-scaleIn">
          <FiCheckCircle className="w-24 h-24 text-neon-blue mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-2">Upload Successful!</h1>
          <p className="text-gray-400 mb-6">
            Your content has been saved to {userName}'s collection.
          </p>
          <p className="text-sm text-neon-blue mb-6">
            Check your dashboard to see the new upload!
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({ url: '', title: '', content: '' });
              setFile(null);
            }}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-medium hover:shadow-neon-glow transition-all"
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg p-4 pb-20">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8 animate-slideInLeft">
          <h1 className="text-3xl font-bold neon-text mb-2">📱 Mobile Upload</h1>
          <p className="text-gray-400">Connected as <span className="text-neon-blue font-medium">{userName}</span></p>
        </div>

        {/* Upload Type Selector */}
        <div className="glass rounded-2xl p-6 border border-dark-border mb-6 animate-fadeIn">
          <label className="block text-sm font-medium text-gray-300 mb-3">Upload Type</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setUploadType('url')}
              className={`p-4 rounded-xl border-2 transition-all ${
                uploadType === 'url'
                  ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                  : 'border-dark-border bg-dark-card text-gray-400 hover:border-neon-blue/50'
              }`}
            >
              <FiLink className="w-6 h-6 mx-auto mb-2" />
              <span className="text-xs font-medium">URL</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadType('note')}
              className={`p-4 rounded-xl border-2 transition-all ${
                uploadType === 'note'
                  ? 'border-neon-purple bg-neon-purple/10 text-neon-purple'
                  : 'border-dark-border bg-dark-card text-gray-400 hover:border-neon-purple/50'
              }`}
            >
              <FiFileText className="w-6 h-6 mx-auto mb-2" />
              <span className="text-xs font-medium">Note</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadType('file')}
              className={`p-4 rounded-xl border-2 transition-all ${
                uploadType === 'file'
                  ? 'border-neon-green bg-neon-green/10 text-neon-green'
                  : 'border-dark-border bg-dark-card text-gray-400 hover:border-neon-green/50'
              }`}
            >
              <FiImage className="w-6 h-6 mx-auto mb-2" />
              <span className="text-xs font-medium">File</span>
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-dark-border animate-scaleIn">
          {uploadType === 'url' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                  placeholder="Optional title"
                />
              </div>
            </>
          )}

          {uploadType === 'note' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-500 focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all"
                  placeholder="Note title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-500 focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all resize-none"
                  placeholder="Write your note..."
                  rows="6"
                  required
                />
              </div>
            </>
          )}

          {uploadType === 'file' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-dark-card border-2 border-dashed border-dark-border rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-neon-green/20 file:text-neon-green hover:file:bg-neon-green/30 transition-all"
                    accept="image/*,.pdf"
                    required
                  />
                </div>
                {file && (
                  <p className="mt-2 text-sm text-neon-green">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-500 focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all"
                  placeholder="Optional title"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-semibold hover:shadow-neon-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <FiUpload className={uploading ? 'animate-spin' : ''} />
            <span>{uploading ? 'Uploading...' : 'Upload to Dashboard'}</span>
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This page will expire in 10 minutes.<br />
            Your content will be saved to {userName}'s SynapseMind collection.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MobileUpload;
