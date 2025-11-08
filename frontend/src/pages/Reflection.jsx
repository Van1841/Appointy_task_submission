import { useState, useEffect } from 'react';
import { reflectionAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiTarget, FiZap } from 'react-icons/fi';
import { format } from 'date-fns';

function Reflection() {
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchLatestReflection();
  }, []);

  const fetchLatestReflection = async () => {
    try {
      const response = await reflectionAPI.getLatest();
      setReflection(response.data.reflection);
    } catch (error) {
      // No reflection found yet
    } finally {
      setLoading(false);
    }
  };

  const generateReflection = async () => {
    setGenerating(true);

    try {
      const response = await reflectionAPI.generate({});
      setReflection(response.data.reflection);
      toast.success('Weekly reflection generated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate reflection');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <p className="mt-4 text-gray-400">Loading reflection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">Weekly Reflection</h1>
          <p className="text-gray-400">AI-powered insights about your knowledge journey</p>
        </div>
        <button
          onClick={generateReflection}
          disabled={generating}
          className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-medium hover:shadow-neon-glow transition-all disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate This Week'}
        </button>
      </div>

      {!reflection ? (
        <div className="text-center py-12 glass rounded-xl border border-dark-border">
          <p className="text-gray-400 mb-4">No reflection generated yet</p>
          <button
            onClick={generateReflection}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-medium hover:shadow-neon-glow transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Your First Reflection'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Range */}
          <div className="glass rounded-xl p-6 border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Reflection Period</p>
                <p className="text-xl font-medium text-white">
                  {format(new Date(reflection.weekStart), 'MMM dd')} - {format(new Date(reflection.weekEnd), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Saves</p>
                <p className="text-3xl font-bold text-neon-blue">{reflection.totalSaves}</p>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="glass rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiZap className="mr-2 text-neon-blue" />
              This Week's Summary
            </h2>
            <p className="text-gray-300 leading-relaxed">{reflection.summary}</p>
          </div>

          {/* Categories Breakdown */}
          <div className="glass rounded-xl p-6 border border-dark-border">
            <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {reflection.categoriesBreakdown && Object.entries(reflection.categoriesBreakdown).map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">{category}</span>
                    <span className="text-sm text-neon-blue font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-dark-card rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full transition-all"
                      style={{ width: `${(count / reflection.totalSaves) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Topics */}
          {reflection.topTopics && reflection.topTopics.length > 0 && (
            <div className="glass rounded-xl p-6 border border-dark-border">
              <h2 className="text-xl font-bold mb-4">Top Topics</h2>
              <div className="flex flex-wrap gap-3">
                {reflection.topTopics.map((topic, idx) => (
                  <div key={idx} className="bg-dark-card border border-dark-border rounded-xl px-4 py-2">
                    <p className="text-neon-blue font-medium">{topic.topic}</p>
                    <p className="text-xs text-gray-500">{topic.count} saves</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {reflection.aiInsights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Patterns */}
              {reflection.aiInsights.patterns && reflection.aiInsights.patterns.length > 0 && (
                <div className="glass rounded-xl p-6 border border-dark-border">
                  <h3 className="font-bold mb-3 flex items-center text-neon-blue">
                    <FiTrendingUp className="mr-2" />
                    Patterns
                  </h3>
                  <ul className="space-y-2">
                    {reflection.aiInsights.patterns.map((pattern, idx) => (
                      <li key={idx} className="text-sm text-gray-400">• {pattern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {reflection.aiInsights.recommendations && reflection.aiInsights.recommendations.length > 0 && (
                <div className="glass rounded-xl p-6 border border-dark-border">
                  <h3 className="font-bold mb-3 flex items-center text-neon-purple">
                    <FiTarget className="mr-2" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {reflection.aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-400">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Growth Areas */}
              {reflection.aiInsights.growthAreas && reflection.aiInsights.growthAreas.length > 0 && (
                <div className="glass rounded-xl p-6 border border-dark-border">
                  <h3 className="font-bold mb-3 flex items-center text-neon-green">
                    <FiZap className="mr-2" />
                    Growth Areas
                  </h3>
                  <ul className="space-y-2">
                    {reflection.aiInsights.growthAreas.map((area, idx) => (
                      <li key={idx} className="text-sm text-gray-400">• {area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reflection;
