import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiX, FiRefreshCw, FiClock } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function QRModal({ isOpen, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (isOpen && !qrData) {
      generateQR();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!qrData) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(qrData.expiresAt).getTime();
      const remaining = Math.floor((expiry - now) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);
        toast.error('QR code expired. Generate a new one.');
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData]);

  const generateQR = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/qr/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setQrData(response.data);
      setTimeLeft(600);
      toast.success('QR code generated! Scan from your phone.');
    } catch (error) {
      toast.error('Failed to generate QR code');
      console.error('QR generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass rounded-2xl border border-dark-border max-w-md w-full p-6 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold neon-text">📱 Connect Phone</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-all"
          >
            <FiX className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue mb-4"></div>
            <p className="text-gray-400">Generating QR code...</p>
          </div>
        ) : qrData ? (
          <>
            {/* QR Code */}
            <div className="bg-white p-6 rounded-xl mb-6 flex items-center justify-center">
              <QRCodeSVG
                value={qrData.connectUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <FiClock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-neon-blue'}`} />
              <span className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-neon-blue'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Instructions */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-white mb-2">Instructions:</h3>
              <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                <li>Open camera app on your phone</li>
                <li>Scan this QR code</li>
                <li>Upload content directly to your collection</li>
                <li>See it appear here instantly!</li>
              </ol>
            </div>

            {/* Refresh Button */}
            <button
              onClick={generateQR}
              disabled={loading || timeLeft > 60}
              className="w-full py-3 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:border-neon-blue hover:text-neon-blue transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              <span>Generate New QR Code</span>
            </button>
          </>
        ) : (
          <div className="text-center py-12">
            <button
              onClick={generateQR}
              className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-medium hover:shadow-neon-glow transition-all"
            >
              Generate QR Code
            </button>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 This QR code is secure, one-time use, and expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

export default QRModal;
