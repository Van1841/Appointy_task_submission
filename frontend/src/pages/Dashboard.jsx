import { useState, useEffect } from 'react';
import { uploadAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiFilter, FiGrid, FiList, FiExternalLink, FiTrash2, FiClock, FiAlertCircle, FiFileText, FiBook, FiEdit, FiFeather, FiSmartphone } from 'react-icons/fi';
import { format } from 'date-fns';
import QRModal from '../components/QRModal';
import { initSocket, getSocket } from '../utils/socket';

function Dashboard() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState({ category: '', type: '' });
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchUploads();
    setupSocket();

    return () => {
      // Cleanup socket listeners on unmount
      const socket = getSocket();
      if (socket) {
        socket.off('new-mobile-upload');
      }
    };
  }, [filter]);

  const setupSocket = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id) {
      const socket = initSocket(user._id);

      // Listen for mobile uploads
      socket.on('new-mobile-upload', (data) => {
        console.log('📱 New mobile upload received:', data);
        toast.success(data.message || 'New upload from mobile!', {
          icon: '📱',
          duration: 5000
        });

        // Add new upload to the list
        setUploads(prev => [data.upload, ...prev]);
      });
    }
  };

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await uploadAPI.getAll(filter);
      console.log('Fetched uploads:', response.data);
      setUploads(response.data.uploads || []);
    } catch (error) {
      console.error('Error loading uploads:', error);
      toast.error('Failed to load uploads');
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await uploadAPI.delete(id);
      toast.success('Deleted successfully');
      setUploads(uploads.filter(u => u._id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      product: 'text-yellow-400 bg-yellow-400/10',
      quote: 'text-pink-400 bg-pink-400/10',
      book: 'text-blue-400 bg-blue-400/10',
      todo: 'text-green-400 bg-green-400/10',
      article: 'text-purple-400 bg-purple-400/10',
      video: 'text-red-400 bg-red-400/10',
      reel: 'text-orange-400 bg-orange-400/10',
      tweet: 'text-cyan-400 bg-cyan-400/10',
      code: 'text-emerald-400 bg-emerald-400/10',
      research: 'text-indigo-400 bg-indigo-400/10',
      dream: 'text-violet-400 bg-violet-400/10',
      other: 'text-gray-400 bg-gray-400/10',
    };
    return colors[category] || 'text-gray-400 bg-gray-400/10';
  };

  const UploadCard = ({ upload, index }) => {
    const isLocked = upload.timeCapsule?.isLocked && new Date(upload.timeCapsule.unlockDate) > new Date();
    const [isHovered, setIsHovered] = useState(false);

    // Get the image source - handle both thumbnail and filePath for images
    const getImageSrc = () => {
      if (upload.thumbnail) {
        return upload.thumbnail.startsWith('http')
          ? upload.thumbnail
          : `http://localhost:5000${upload.thumbnail}`;
      }
      if (upload.type === 'image' && upload.filePath) {
        return `http://localhost:5000/${upload.filePath}`;
      }
      return null;
    };

    const imageSrc = getImageSrc();
    const shouldShowImage = imageSrc || upload.type === 'image' || upload.type === 'url';

    // Get icon for non-image types
    const getTypeIcon = () => {
      switch (upload.type) {
        case 'note':
          return <FiEdit className="w-16 h-16 text-neon-blue" />;
        case 'dream':
          return <FiFeather className="w-16 h-16 text-neon-purple" />;
        case 'pdf':
          return <FiFileText className="w-16 h-16 text-red-400" />;
        case 'article':
        case 'blog':
          return <FiBook className="w-16 h-16 text-neon-green" />;
        default:
          return <FiFileText className="w-16 h-16 text-gray-400" />;
      }
    };

    return (
      <div
        className="glass rounded-xl overflow-hidden border border-dark-border hover:border-neon-blue/50 transition-all duration-500 group neon-hover hover:shadow-neon-glow-sm hover:-translate-y-2 animate-scaleIn cursor-pointer"
        style={{ animationDelay: `${index * 0.1}s` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail or Type Card */}
        {shouldShowImage ? (
          <div className="relative h-48 bg-dark-card overflow-hidden">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={upload.title || 'Upload'}
                className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-card to-dark-bg">
                <div className="text-center">
                  <FiExternalLink className="w-12 h-12 mx-auto mb-2 text-neon-blue" />
                  <p className="text-sm text-gray-400">{upload.type}</p>
                </div>
              </div>
            )}

            {isLocked && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <FiClock className="w-12 h-12 mx-auto mb-2 text-neon-blue animate-pulse" />
                  <p className="text-sm text-gray-300">Locked until</p>
                  <p className="text-xs text-neon-blue">{format(new Date(upload.timeCapsule.unlockDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            )}

            {/* Hover Action Buttons */}
            <div className={`absolute top-4 right-4 flex space-x-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              {upload.url && (
                <a
                  href={upload.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-dark-card/90 backdrop-blur rounded-full shadow-lg hover:bg-neon-blue hover:scale-110 transition-all duration-300 border border-neon-blue/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink className="w-5 h-5 text-neon-blue hover:text-white transition-colors" />
                </a>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(upload._id);
                }}
                className="p-3 bg-dark-card/90 backdrop-blur rounded-full shadow-lg hover:bg-red-500 hover:scale-110 transition-all duration-300 border border-red-400/50"
              >
                <FiTrash2 className="w-5 h-5 text-red-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          /* Non-image type card */
          <div className="relative h-48 bg-gradient-to-br from-dark-card to-dark-bg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center transform group-hover:scale-110 transition-transform duration-500">
                {getTypeIcon()}
                <p className="text-sm text-gray-400 mt-3 uppercase tracking-wide">{upload.type}</p>
              </div>
            </div>

            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(125, 211, 252, 0.5) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            {isLocked && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <FiClock className="w-12 h-12 mx-auto mb-2 text-neon-blue animate-pulse" />
                  <p className="text-sm text-gray-300">Locked until</p>
                  <p className="text-xs text-neon-blue">{format(new Date(upload.timeCapsule.unlockDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            )}

            {/* Hover Action Buttons */}
            <div className={`absolute top-4 right-4 flex space-x-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              {upload.url && (
                <a
                  href={upload.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-dark-card/90 backdrop-blur rounded-full shadow-lg hover:bg-neon-blue hover:scale-110 transition-all duration-300 border border-neon-blue/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink className="w-5 h-5 text-neon-blue hover:text-white transition-colors" />
                </a>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(upload._id);
                }}
                className="p-3 bg-dark-card/90 backdrop-blur rounded-full shadow-lg hover:bg-red-500 hover:scale-110 transition-all duration-300 border border-red-400/50"
              >
                <FiTrash2 className="w-5 h-5 text-red-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Type & Category Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(upload.category)}`}>
                {upload.category || 'other'}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-dark-bg text-gray-300 border border-dark-border">
                {upload.type}
              </span>
            </div>
            {upload.isDuplicate && (
              <span className="text-xs text-orange-400 flex items-center">
                <FiAlertCircle className="w-3 h-3 mr-1" />
                Duplicate
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-neon-blue transition-colors duration-300">
            {upload.title || upload.metadata?.title || 'Untitled'}
          </h3>

          {/* Content Preview */}
          {(upload.content || upload.metadata?.extractedText) && (
            <p className="text-sm text-gray-400 line-clamp-3 mb-3">
              {upload.content || upload.metadata?.extractedText}
            </p>
          )}

          {/* PDF Info */}
          {upload.type === 'pdf' && upload.metadata?.pages && (
            <p className="text-xs text-gray-500 mb-2">
              📄 {upload.metadata.pages} pages
            </p>
          )}

          {/* URL Preview */}
          {upload.url && upload.type === 'url' && (
            <p className="text-xs text-neon-blue mb-2 truncate">
              🔗 {new URL(upload.url).hostname}
            </p>
          )}

          {/* AI Keywords */}
          {upload.aiAnalysis?.keywords && upload.aiAnalysis.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {upload.aiAnalysis.keywords.slice(0, 3).map((keyword, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-dark-card border border-dark-border rounded-full text-gray-400 hover:border-neon-blue hover:text-neon-blue transition-all duration-300">
                  #{keyword}
                </span>
              ))}
            </div>
          )}

          {/* Sentiment Badge */}
          {upload.aiAnalysis?.sentiment && (
            <div className="mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                upload.aiAnalysis.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                upload.aiAnalysis.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {upload.aiAnalysis.sentiment}
              </span>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-dark-border">
            <span className="flex items-center">
              <FiClock className="w-3 h-3 mr-1" />
              {format(new Date(upload.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>

          {/* Thread Badge */}
          {upload.thread && (
            <div className="mt-2 pt-2 border-t border-dark-border">
              <span className="text-xs text-neon-purple flex items-center">
                <FiGrid className="w-3 h-3 mr-1" />
                In Thread: {upload.thread.title}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="animate-slideInLeft">
          <h1 className="text-3xl font-bold neon-text mb-2">Dashboard</h1>
          <p className="text-gray-400">Your saved knowledge at a glance</p>
        </div>

        <div className="flex items-center space-x-4 animate-slideInRight">
          {/* Connect Phone Button */}
          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg font-medium hover:shadow-neon-glow transition-all duration-300 flex items-center space-x-2"
          >
            <FiSmartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Connect Phone</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-dark-card rounded-lg p-1 border border-dark-border">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-accent-primary text-white' : 'text-gray-400'}`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-accent-primary text-white' : 'text-gray-400'}`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:border-neon-blue transition-all duration-300 neon-hover"
            >
              <option value="">All Categories</option>
              <option value="product">Product</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="code">Code</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4 border border-dark-border hover:border-neon-blue/50 transition-all duration-300 neon-hover group animate-scaleIn">
          <p className="text-sm text-gray-400">Total Saves</p>
          <p className="text-2xl font-bold text-neon-blue mt-1 group-hover:scale-105 transition-transform duration-300">{uploads.length}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-dark-border hover:border-neon-purple/50 transition-all duration-300 neon-hover group animate-scaleIn" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm text-gray-400">This Week</p>
          <p className="text-2xl font-bold text-neon-purple mt-1 group-hover:scale-105 transition-transform duration-300">
            {uploads.filter(u => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(u.createdAt) > weekAgo;
            }).length}
          </p>
        </div>
        <div className="glass rounded-xl p-4 border border-dark-border hover:border-neon-green/50 transition-all duration-300 neon-hover group animate-scaleIn" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-neon-green mt-1 group-hover:scale-105 transition-transform duration-300">
            {new Set(uploads.map(u => u.category)).size}
          </p>
        </div>
      </div>

      {/* Uploads Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <p className="mt-4 text-gray-400">Loading your content...</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-12 glass rounded-xl border border-dark-border">
          <p className="text-gray-400 mb-4">No uploads yet. Start saving your knowledge!</p>
          <a
            href="/upload"
            className="inline-block px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-neon-glow transition-all"
          >
            Upload Your First Item
          </a>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {uploads.map((upload, index) => (
            <UploadCard key={upload._id} upload={upload} index={index} />
          ))}
        </div>
      )}

      {/* QR Modal */}
      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
}

export default Dashboard;
