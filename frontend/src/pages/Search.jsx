import { useState, useEffect } from 'react';
import { searchAPI, uploadAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiSearch, FiExternalLink, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [otherItems, setOtherItems] = useState([]);

  // Fetch other items when component loads
  useEffect(() => {
    fetchOtherItems();
  }, []);

  const fetchOtherItems = async () => {
    try {
      const response = await uploadAPI.getAll({ limit: 6 });
      setOtherItems(response.data.uploads || []);
    } catch (error) {
      console.error('Error fetching other items:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await searchAPI.search({ query });
      setResults(response.data.results || []);

      if (!response.data.results || response.data.results.length === 0) {
        // Refresh other items when no results found
        fetchOtherItems();
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      // Fetch other items to show instead
      fetchOtherItems();
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      product: 'text-yellow-400',
      quote: 'text-pink-400',
      book: 'text-blue-400',
      todo: 'text-green-400',
      article: 'text-purple-400',
      video: 'text-red-400',
    };
    return colors[category] || 'text-gray-400';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text mb-2">AI-Powered Search</h1>
        <p className="text-gray-400">Search your knowledge using natural language</p>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-2xl p-6 border border-dark-border mb-8">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-dark-card border border-dark-border rounded-xl focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 text-white placeholder-gray-500 text-lg"
              placeholder='Try: "article about AI" or "that reel on butterflies"'
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-medium hover:shadow-neon-glow transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Try:</span>
          {['Show me my saved articles', 'Find that product I saved', 'Dreams from last month'].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="text-sm px-3 py-1 bg-dark-card border border-dark-border rounded-full text-gray-400 hover:text-neon-blue hover:border-neon-blue transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <p className="mt-4 text-gray-400">AI is searching your knowledge...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div>
          <div className="text-center py-12 glass rounded-xl border border-dark-border mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-white font-medium mb-2">No results found for "{query}"</p>
            <p className="text-sm text-gray-400">Try different keywords or browse other items below</p>
          </div>

          {/* Other Items Section */}
          {otherItems.length > 0 && (
            <div className="animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neon-blue">Other Saved Items</h2>
                <p className="text-sm text-gray-400">{otherItems.length} items</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherItems.map((item, index) => (
                  <div
                    key={item._id}
                    className="glass rounded-xl p-5 border border-dark-border hover:border-neon-blue/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-neon-glow-sm animate-scaleIn cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full bg-dark-card ${getCategoryColor(item.category)}`}>
                            {item.category || 'other'}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-dark-bg text-gray-300 border border-dark-border">
                            {item.type}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">
                          {item.title || item.metadata?.title || 'Untitled'}
                        </h3>
                        {(item.content || item.metadata?.extractedText) && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {item.content || item.metadata?.extractedText}
                          </p>
                        )}

                        {/* Keywords */}
                        {item.aiAnalysis?.keywords && item.aiAnalysis.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.aiAnalysis.keywords.slice(0, 3).map((keyword, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-dark-card border border-dark-border rounded-full text-gray-400">
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 p-2 text-neon-blue hover:text-neon-purple transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <a
                  href="/dashboard"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-neon-glow transition-all"
                >
                  View All Items
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400">
              Found <span className="text-neon-blue font-medium">{results.length}</span> results
            </p>
          </div>

          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result._id}
                className="glass rounded-xl p-6 border border-dark-border hover:border-neon-blue/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full bg-dark-card ${getCategoryColor(result.category)}`}>
                        {result.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      {result.title || 'Untitled'}
                    </h3>
                    {result.content && (
                      <p className="text-gray-400 line-clamp-3 mb-3">
                        {result.content}
                      </p>
                    )}

                    {/* AI Analysis */}
                    {result.aiAnalysis?.summary && (
                      <div className="bg-dark-card rounded-lg p-3 mb-3 border-l-4 border-neon-blue">
                        <p className="text-sm text-gray-300">
                          <span className="text-neon-blue font-medium">AI Summary:</span> {result.aiAnalysis.summary}
                        </p>
                      </div>
                    )}

                    {/* Keywords */}
                    {result.aiAnalysis?.keywords && result.aiAnalysis.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.aiAnalysis.keywords.map((keyword, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-dark-card border border-dark-border rounded-full text-gray-400">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 p-2 text-neon-blue hover:text-neon-purple transition-colors"
                    >
                      <FiExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Metadata */}
                {result.metadata?.source && (
                  <div className="text-xs text-gray-500 pt-3 border-t border-dark-border">
                    Source: {result.metadata.source}
                    {result.metadata.platform && ` • ${result.metadata.platform}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
