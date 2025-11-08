import { useState, useEffect } from 'react';
import { threadAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiLayers, FiZap, FiTrash2, FiClock, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';

function Threads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await threadAPI.getAll();
      setThreads(response.data.threads || []);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast.error('Failed to load threads');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const generateThreads = async () => {
    setGenerating(true);
    try {
      const response = await threadAPI.generateThreads();
      console.log('Thread generation response:', response.data);
      toast.success(response.data.message || 'Threads generated successfully!');
      setThreads(response.data.threads || []);
    } catch (error) {
      console.error('Error generating threads:', error);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to generate threads';
      toast.error(errorMsg);

      // If it's a network error, provide more info
      if (!error.response) {
        toast.error('Network error: Make sure backend is running on port 5000');
      }
    } finally {
      setGenerating(false);
    }
  };

  const deleteThread = async (id) => {
    if (!confirm('Delete this thread?')) return;

    try {
      await threadAPI.delete(id);
      toast.success('Thread deleted');
      setThreads(threads.filter(t => t._id !== id));
    } catch (error) {
      toast.error('Failed to delete thread');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <p className="mt-4 text-gray-400">Loading threads...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8 animate-slideInLeft">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">🧵 Threads</h1>
          <p className="text-gray-400">AI-powered connections between your content</p>
        </div>
        <button
          onClick={generateThreads}
          disabled={generating}
          className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-xl font-medium hover:shadow-neon-glow transition-all disabled:opacity-50 flex items-center space-x-2"
        >
          <FiZap className={generating ? 'animate-spin' : ''} />
          <span>{generating ? 'Generating...' : 'Generate Threads'}</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="glass rounded-xl p-4 border border-dark-border mb-6 animate-fadeIn">
        <p className="text-sm text-gray-400">
          <FiTrendingUp className="inline w-4 h-4 mr-1 text-neon-blue" />
          AI analyzes your uploads and creates threads based on similar keywords, topics, and content
        </p>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-16 glass rounded-xl border border-dark-border animate-scaleIn">
          <FiLayers className="w-20 h-20 mx-auto mb-4 text-neon-purple opacity-50 animate-pulse" />
          <p className="text-xl text-white font-medium mb-2">No threads yet</p>
          <p className="text-sm text-gray-400 mb-6">Click "Generate Threads" to let AI find connections between your uploads</p>
          <button
            onClick={generateThreads}
            disabled={generating}
            className="px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-semibold hover:shadow-neon-glow transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Your First Threads'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threads.map((thread, index) => (
            <div
              key={thread._id}
              className="glass rounded-xl overflow-hidden border border-dark-border hover:border-neon-purple/50 transition-all duration-500 hover:shadow-neon-glow-sm hover:-translate-y-2 animate-scaleIn group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 p-4 border-b border-dark-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <FiLayers className="text-neon-purple w-5 h-5" />
                      <h3 className="text-lg font-bold text-white group-hover:text-neon-purple transition-colors">{thread.title}</h3>
                    </div>
                    {thread.description && (
                      <p className="text-gray-400 text-xs">{thread.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteThread(thread._id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all group/delete"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-400 group-hover/delete:text-red-300" />
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center">
                    <FiClock className="w-3 h-3 mr-1" />
                    {format(new Date(thread.createdAt), 'MMM dd')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-dark-bg text-gray-300 rounded-full">
                      {thread.uploads?.length || 0} items
                    </span>
                    {thread.aiGenerated && (
                      <span className="px-2 py-0.5 bg-neon-purple/20 text-neon-purple rounded-full flex items-center">
                        <FiZap className="w-3 h-3 mr-1" />
                        AI
                      </span>
                    )}
                  </div>
                </div>

                {/* Similarity Bar */}
                {thread.similarity && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Similarity Score</span>
                      <span className="text-xs text-neon-purple font-medium">{Math.round(thread.similarity * 100)}%</span>
                    </div>
                    <div className="bg-dark-card rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-neon-purple to-neon-pink h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${thread.similarity * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Thread items preview */}
              <div className="p-4">
                {thread.uploads && thread.uploads.length > 0 ? (
                  <div className="space-y-2">
                    {thread.uploads.slice(0, 3).map((upload, idx) => (
                      <div
                        key={upload._id}
                        className="bg-dark-card rounded-lg p-3 border border-dark-border hover:border-neon-blue/50 transition-all transform hover:scale-105 cursor-pointer"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <p className="text-sm text-white font-medium line-clamp-1 mb-1">{upload.title || 'Untitled'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-0.5 bg-dark-bg rounded-full text-gray-400">{upload.category}</span>
                          <span className="text-xs text-gray-500">{upload.type}</span>
                        </div>
                        {/* Keywords preview */}
                        {upload.aiAnalysis?.keywords && upload.aiAnalysis.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {upload.aiAnalysis.keywords.slice(0, 2).map((keyword, kidx) => (
                              <span key={kidx} className="text-xs px-1.5 py-0.5 bg-neon-purple/10 text-neon-purple rounded">
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {thread.uploads.length > 3 && (
                      <div className="text-center py-2 bg-dark-card/50 rounded-lg border border-dashed border-dark-border">
                        <p className="text-xs text-gray-400">+{thread.uploads.length - 3} more items</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No items in this thread</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Threads;
