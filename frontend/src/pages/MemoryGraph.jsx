import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { uploadAPI, threadAPI } from '../utils/api';
import toast from 'react-hot-toast';

function MemoryGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const [uploadsResponse, threadsResponse] = await Promise.all([
        uploadAPI.getAll({ limit: 50 }),
        threadAPI.getAll()
      ]);

      const uploads = uploadsResponse.data.uploads;
      const threads = threadsResponse.data.threads;

      // Create nodes from uploads and threads
      const newNodes = [];
      const newEdges = [];

      // Category nodes (central hubs)
      const categories = [...new Set(uploads.map(u => u.category))];
      categories.forEach((category, idx) => {
        newNodes.push({
          id: `cat-${category}`,
          data: {
            label: category.toUpperCase()
          },
          position: {
            x: Math.cos((idx / categories.length) * 2 * Math.PI) * 300 + 400,
            y: Math.sin((idx / categories.length) * 2 * Math.PI) * 300 + 300
          },
          style: {
            background: '#6366f1',
            color: 'white',
            border: '2px solid #8b5cf6',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }
        });
      });

      // Upload nodes
      uploads.forEach((upload, idx) => {
        const categoryNode = newNodes.find(n => n.id === `cat-${upload.category}`);
        const angle = (idx / uploads.length) * 2 * Math.PI;
        const radius = 150;

        newNodes.push({
          id: upload._id,
          data: {
            label: upload.title?.substring(0, 30) || 'Untitled'
          },
          position: categoryNode ? {
            x: categoryNode.position.x + Math.cos(angle) * radius,
            y: categoryNode.position.y + Math.sin(angle) * radius
          } : {
            x: Math.random() * 800,
            y: Math.random() * 600
          },
          style: {
            background: '#131318',
            color: '#00d4ff',
            border: '1px solid #2a2a35',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            width: '150px'
          }
        });

        // Connect upload to category
        if (upload.category) {
          newEdges.push({
            id: `e-${upload._id}-cat`,
            source: upload._id,
            target: `cat-${upload.category}`,
            animated: false,
            style: { stroke: '#2a2a35' }
          });
        }
      });

      // Thread connections
      threads.forEach(thread => {
        if (thread.uploads && thread.uploads.length > 1) {
          for (let i = 0; i < thread.uploads.length - 1; i++) {
            for (let j = i + 1; j < thread.uploads.length; j++) {
              const upload1 = thread.uploads[i];
              const upload2 = thread.uploads[j];

              if (upload1._id && upload2._id) {
                newEdges.push({
                  id: `e-thread-${upload1._id}-${upload2._id}`,
                  source: upload1._id,
                  target: upload2._id,
                  animated: true,
                  style: { stroke: '#a855f7', strokeWidth: 2 },
                  label: 'Similar'
                });
              }
            }
          }
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      toast.error('Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold neon-text mb-2">Memory Graph</h1>
        <p className="text-gray-400">Visualize connections between your saved knowledge</p>
      </div>

      <div className="glass rounded-2xl border border-dark-border overflow-hidden" style={{ height: '70vh' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
              <p className="mt-4 text-gray-400">Building your knowledge graph...</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            style={{
              background: '#0a0a0f'
            }}
          >
            <Controls
              style={{
                button: {
                  backgroundColor: '#131318',
                  color: '#00d4ff',
                  borderBottom: '1px solid #2a2a35'
                }
              }}
            />
            <MiniMap
              nodeColor={(node) => {
                if (node.id.startsWith('cat-')) return '#6366f1';
                return '#131318';
              }}
              maskColor="rgba(10, 10, 15, 0.6)"
              style={{
                background: '#131318',
                border: '1px solid #2a2a35'
              }}
            />
            <Background color="#2a2a35" gap={16} />
          </ReactFlow>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 border border-dark-border">
          <p className="text-sm text-gray-400">Total Nodes</p>
          <p className="text-2xl font-bold text-neon-blue mt-1">{nodes.length}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-dark-border">
          <p className="text-sm text-gray-400">Connections</p>
          <p className="text-2xl font-bold text-neon-purple mt-1">{edges.length}</p>
        </div>
        <div className="glass rounded-xl p-4 border border-dark-border">
          <p className="text-sm text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-neon-green mt-1">
            {nodes.filter(n => n.id.startsWith('cat-')).length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MemoryGraph;
