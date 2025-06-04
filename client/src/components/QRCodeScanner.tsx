
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!isOpen) return;
        
        setError(null);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setPermission(true);
          setScanning(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Camera access denied. Please enable camera permissions.');
        setPermission(false);
      }
    };

    if (isOpen) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setScanning(false);
    };
  }, [isOpen]);

  useEffect(() => {
    let animationFrame: number;
    const scanQRCode = () => {
      if (!scanning || !permission || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          // This is a placeholder - in a real implementation you would use a library like jsQR
          // Here we're simulating QR scanning for demo purposes
          
          // In a real implementation, you would use something like:
          // const code = jsQR(imageData.data, imageData.width, imageData.height);
          // if (code) onScan(code.data);
          
          // For now, let's simulate scanning after 3 seconds
          setTimeout(() => {
            if (scanning) {
              const mockData = "bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.001";
              onScan(mockData);
              setScanning(false);
              onClose();
            }
          }, 3000);
        } catch (err) {
          console.error('QR scanning error:', err);
        }
      }

      animationFrame = requestAnimationFrame(scanQRCode);
    };

    if (scanning && permission) {
      animationFrame = requestAnimationFrame(scanQRCode);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [scanning, permission, onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background/95 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription className="text-white/70">
            Position the QR code in the center of the camera view
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center">
          {error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : (
            <div className="relative w-full max-w-sm mx-auto aspect-square mb-4 overflow-hidden rounded-lg border-2 border-dashed border-white/20">
              <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay 
                playsInline 
                muted
              />
              <canvas 
                ref={canvasRef}
                className="hidden" // Canvas is hidden but used for processing
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 border-2 border-[#F2FF44] opacity-70"></div>
              </div>
            </div>
          )}
          
          <Button 
            variant="outline"
            onClick={onClose}
            className="mt-2 border-white/10 hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
