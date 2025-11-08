import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiLink, FiFileText, FiImage, FiFile, FiUpload, FiClock } from 'react-icons/fi';

function Upload() {
  const [uploadType, setUploadType] = useState('url');
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    content: '',
    category: '',
  });
  const [timeCapsule, setTimeCapsule] = useState({
    enabled: false,
    unlockDate: '',
    message: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (uploadType === 'file' && files.length > 0) {
        const formDataObj = new FormData();
        formDataObj.append('file', files[0]);
        formDataObj.append('title', formData.title);
        formDataObj.append('category', formData.category);

        if (timeCapsule.enabled) {
          formDataObj.append('timeCapsule', JSON.stringify({
            unlockDate: timeCapsule.unlockDate,
            message: timeCapsule.message
          }));
        }

        response = await uploadAPI.uploadFile(formDataObj);
      } else {
        const uploadData = {
          type: uploadType,
          ...formData
        };

        if (timeCapsule.enabled) {
          uploadData.timeCapsule = {
            unlockDate: timeCapsule.unlockDate,
            message: timeCapsule.message
          };
        }

        response = await uploadAPI.create(uploadData);
      }

      toast.success('Upload successful! AI is analyzing your content...');

      // Reset form
      setFormData({ url: '', title: '', content: '', category: '' });
      setFiles([]);
      setTimeCapsule({ enabled: false, unlockDate: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const uploadTypes = [
    { id: 'url', icon: FiLink, label: 'URL', desc: 'Web page, article, or link' },
    { id: 'note', icon: FiFileText, label: 'Note', desc: 'Text note or idea' },
    { id: 'file', icon: FiImage, label: 'File', desc: 'Image or PDF' },
    { id: 'dream', icon: FiClock, label: 'Dream', desc: 'Dream or thought' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text mb-2">Upload Content</h1>
        <p className="text-gray-400">Save and organize your ideas, links, files, and more</p>
      </div>

      {/* Upload Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {uploadTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setUploadType(type.id)}
            className={`p-4 rounded-xl border-2 transition-all glass-hover ${
              uploadType === type.id
                ? 'border-neon-blue bg-neon-blue/10'
                : 'border-dark-border'
            }`}
          >
            <type.icon className={`w-8 h-8 mx-auto mb-2 ${uploadType === type.id ? 'text-neon-blue' : 'text-gray-400'}`} />
            <p className="font-medium text-sm">{type.label}</p>
            <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
          </button>
        ))}
      </div>

      {/* Upload Form */}
      <div className="glass rounded-2xl p-8 border border-dark-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          {uploadType === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500"
                placeholder="https://example.com/article"
                required
              />
              <p className="text-xs text-gray-500 mt-2">AI will automatically extract and categorize content</p>
            </div>
          )}

          {/* Note/Dream Content */}
          {(uploadType === 'note' || uploadType === 'dream') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {uploadType === 'dream' ? 'Dream / Thought' : 'Note Content'} <span className="text-red-400">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500 resize-none"
                placeholder={uploadType === 'dream' ? 'Describe your dream or thought...' : 'Write your note here...'}
                required
              />
            </div>
          )}

          {/* File Upload */}
          {uploadType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload File <span className="text-red-400">*</span>
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-neon-blue bg-neon-blue/10'
                    : 'border-dark-border hover:border-gray-500'
                }`}
              >
                <input {...getInputProps()} />
                <FiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {files.length > 0 ? (
                  <div>
                    <p className="text-neon-blue font-medium">{files[0].name}</p>
                    <p className="text-sm text-gray-500 mt-1">{(files[0].size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-300 mb-1">Drag & drop a file here, or click to select</p>
                    <p className="text-sm text-gray-500">Supports: Images (PNG, JPG, GIF) and PDF files</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500"
              placeholder="Give it a custom title..."
            />
          </div>

          {/* Category (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category (Optional - AI will auto-detect)
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white"
            >
              <option value="">Auto-detect</option>
              <option value="product">Product</option>
              <option value="quote">Quote</option>
              <option value="book">Book</option>
              <option value="todo">To-Do</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="reel">Reel</option>
              <option value="tweet">Tweet</option>
              <option value="code">Code</option>
              <option value="research">Research</option>
            </select>
          </div>

          {/* Time Capsule */}
          <div className="border border-dark-border rounded-xl p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={timeCapsule.enabled}
                onChange={(e) => setTimeCapsule({ ...timeCapsule, enabled: e.target.checked })}
                className="w-5 h-5 rounded border-dark-border bg-dark-card focus:ring-2 focus:ring-neon-blue"
              />
              <div>
                <span className="font-medium text-gray-300">Enable Time Capsule</span>
                <p className="text-sm text-gray-500">Lock this content until a future date</p>
              </div>
            </label>

            {timeCapsule.enabled && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unlock Date
                  </label>
                  <input
                    type="datetime-local"
                    value={timeCapsule.unlockDate}
                    onChange={(e) => setTimeCapsule({ ...timeCapsule, unlockDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message to Future Self (Optional)
                  </label>
                  <textarea
                    value={timeCapsule.message}
                    onChange={(e) => setTimeCapsule({ ...timeCapsule, message: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:border-neon-blue text-white placeholder-gray-500 resize-none"
                    placeholder="Why are you saving this?"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white py-4 rounded-xl font-medium hover:shadow-neon-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FiUpload className="w-5 h-5" />
                <span>Save to SynapseMind</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
