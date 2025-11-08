import { useState, useEffect } from 'react';
import { uploadAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

function Timeline() {
  const [timelineData, setTimelineData] = useState({});
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchTimeline();
    fetchUploads();
  }, [currentMonth]);

  const fetchTimeline = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const response = await uploadAPI.getTimeline({
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });

      setTimelineData(response.data.timeline);
    } catch (error) {
      toast.error('Failed to load timeline');
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await uploadAPI.getAll({ limit: 100 });
      setUploads(response.data.uploads);
    } catch (error) {
      toast.error('Failed to load uploads');
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (count) => {
    if (!count) return 'bg-dark-card';
    if (count === 1) return 'bg-neon-blue/20';
    if (count === 2) return 'bg-neon-blue/40';
    if (count === 3) return 'bg-neon-blue/60';
    return 'bg-neon-blue/80';
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const uploadsGroupedByDate = uploads.reduce((acc, upload) => {
    const date = format(new Date(upload.createdAt), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(upload);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text mb-2">Timeline</h1>
        <p className="text-gray-400">Visual timeline of your saved knowledge</p>
      </div>

      {/* Heatmap */}
      <div className="glass rounded-2xl p-6 border border-dark-border mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Activity Heatmap</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-neon-blue transition-all"
            >
              Previous
            </button>
            <span className="text-lg font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-neon-blue transition-all"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm text-gray-500 font-medium mb-2">
              {day}
            </div>
          ))}

          {monthDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = timelineData[dateStr]?.count || 0;

            return (
              <div
                key={dateStr}
                className={`aspect-square rounded-lg ${getHeatmapColor(count)} border border-dark-border flex items-center justify-center hover:scale-110 transition-transform cursor-pointer group relative`}
              >
                <span className="text-xs text-gray-400">{format(day, 'd')}</span>
                {count > 0 && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark-card border border-neon-blue rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {count} saves
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end space-x-2 mt-4">
          <span className="text-xs text-gray-500">Less</span>
          <div className="w-3 h-3 rounded bg-dark-card"></div>
          <div className="w-3 h-3 rounded bg-neon-blue/20"></div>
          <div className="w-3 h-3 rounded bg-neon-blue/40"></div>
          <div className="w-3 h-3 rounded bg-neon-blue/60"></div>
          <div className="w-3 h-3 rounded bg-neon-blue/80"></div>
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-8">
        {Object.entries(uploadsGroupedByDate).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, dayUploads]) => (
          <div key={date}>
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 rounded-full bg-neon-blue mr-3"></div>
              <h3 className="text-lg font-medium text-neon-blue">
                {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
              </h3>
              <div className="flex-1 h-px bg-dark-border ml-4"></div>
            </div>

            <div className="space-y-3 ml-5 border-l-2 border-dark-border pl-6">
              {dayUploads.map((upload) => (
                <div key={upload._id} className="glass rounded-xl p-4 border border-dark-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-neon-blue/10 text-neon-blue">
                          {upload.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(upload.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      <h4 className="font-medium text-white mb-1">
                        {upload.title || 'Untitled'}
                      </h4>
                      {upload.content && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {upload.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
        </div>
      )}
    </div>
  );
}

export default Timeline;
