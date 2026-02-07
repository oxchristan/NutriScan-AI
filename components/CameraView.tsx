import React, { useRef, useState, useEffect } from 'react';
import { X, Image as ImageIcon, Zap, Camera as CameraIcon, RotateCw } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      stopCamera(); // Ensure previous stream is closed
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please use upload.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally if using front camera for mirror effect
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUri = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageUri);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative h-full w-full bg-black flex flex-col font-sans">
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Bar */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onCancel} className="text-white p-2 hover:bg-white/10 rounded-full transition">
          <X size={28} strokeWidth={1.5} />
        </button>
        <div className="bg-black/40 backdrop-blur-md px-4 py-1 border border-white/10 text-white text-xs tracking-widest uppercase rounded-sm">
          AI Scanner
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
        {error ? (
           <div className="text-white text-center p-8">
               <CameraIcon size={48} className="mx-auto mb-4 opacity-50" />
               <p className="mb-4">{error}</p>
               <button onClick={triggerFileInput} className="bg-white text-black px-4 py-2 rounded-sm text-sm uppercase font-bold">
                   Upload Photo
               </button>
           </div>
        ) : (
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />
        )}
        
        {/* Guides */}
        {!error && (
            <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[75%] aspect-square border border-white/30 rounded-lg">
                    {/* Corner Markers */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
                <p className="absolute bottom-10 left-0 w-full text-center text-white/70 text-sm font-medium tracking-wide drop-shadow-md">
                    Position food in frame
                </p>
            </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-48 bg-black/90 flex flex-col items-center justify-center relative z-20 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full px-12 max-w-md">
            <button onClick={triggerFileInput} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <ImageIcon size={24} strokeWidth={1.5} />
            </button>

            {/* Shutter Button */}
            <button 
              onClick={!error ? capturePhoto : triggerFileInput}
              className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center group active:scale-95 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-transform group-active:scale-90"></div>
            </button>

            <button onClick={toggleCamera} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <RotateCw size={24} strokeWidth={1.5} />
            </button>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CameraView;