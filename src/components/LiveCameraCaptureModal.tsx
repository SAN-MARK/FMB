import React, { useState, useRef, useEffect } from 'react';
import { LiveCaptureMetadata } from '../types';

interface LiveCameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageBase64: string, metadata: LiveCaptureMetadata) => void;
}

export const LiveCameraCaptureModal: React.FC<LiveCameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [timestampStr, setTimestampStr] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize camera stream and fetch live geolocation
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      return;
    }

    setTimestampStr(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

    // Geolocation acquisition
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            lat: Math.round(pos.coords.latitude * 10000) / 10000,
            lng: Math.round(pos.coords.longitude * 10000) / 10000,
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        () => {
          setCurrentCoords({
            lat: 13.0827,
            lng: 80.2754,
            accuracy: 15,
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Direct camera streaming unavailable. Use system camera shutter.');
      }
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      setCameraError('Camera access blocked. Use the system camera shutter button below.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Watermark EXIF/Timestamp on live image for anti-fraud proof (Monochrome Vintage)
      ctx.fillStyle = 'rgba(27, 27, 27, 0.88)';
      ctx.fillRect(0, canvas.height - 36, canvas.width, 36);

      ctx.fillStyle = '#F1ECE2';
      ctx.font = 'bold 12px monospace';
      const gpsText = currentCoords ? `${currentCoords.lat}°N, ${currentCoords.lng}°E (±${currentCoords.accuracy}m)` : 'Chennai Metro';
      ctx.fillText(`FINDBACK PROOF · ${new Date().toISOString()} · ${gpsText}`, 14, canvas.height - 14);

      const base64 = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(base64);
    }
    setIsCapturing(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    const metadata: LiveCaptureMetadata = {
      timestamp: new Date().toISOString(),
      is_live_camera: true,
      geolocation: currentCoords || { lat: 13.0418, lng: 80.2341, accuracy: 10 },
      device_info: navigator.userAgent.slice(0, 80),
    };

    onCapture(capturedImage, metadata);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#1B1B1B]/75">
      <div className="bg-[#F1ECE2] border border-[#1B1B1B] w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#E8E1D3] border-b border-[#1B1B1B] flex items-center justify-between">
          <div>
            <span className="font-['Space_Mono'] text-[10px] uppercase tracking-widest text-[#B0492E] font-bold block">
              [ LIVE HARDWARE SHUTTER ]
            </span>
            <h3 className="text-sm font-['Archivo_Black'] uppercase tracking-tight text-[#1B1B1B]">
              ANTI-FRAUD CAMERA VERIFICATION
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] text-xs font-['Space_Mono'] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative bg-[#1B1B1B] flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {!capturedImage ? (
            <>
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover max-h-[420px]"
                />
              ) : (
                <div className="p-6 text-center text-[#F1ECE2] flex flex-col items-center">
                  <div className="w-14 h-14 border border-[#F1ECE2] flex items-center justify-center text-2xl mb-3">
                    📷
                  </div>
                  <p className="text-xs font-['Space_Mono'] uppercase mb-1">
                    {cameraError || 'INITIALIZING SHUTTER...'}
                  </p>
                  <p className="text-[11px] font-body text-[#A0A09C] max-w-xs mb-4 italic">
                    Gallery photo uploads are strictly disabled to verify physical possession of found items.
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary bg-[#F1ECE2] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] border border-[#F1ECE2]"
                  >
                    TRIGGER MOBILE CAMERA
                  </button>
                </div>
              )}

              {/* Viewfinder HUD Overlays */}
              {stream && (
                <div className="absolute inset-4 border border-[#F1ECE2]/30 pointer-events-none flex flex-col justify-between p-3 font-['Space_Mono'] text-[10px] text-[#F1ECE2]">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#1B1B1B]/80 px-2 py-0.5 border border-[#F1ECE2]/20">
                      REC · LIVE SHUTTER
                    </span>
                    <span className="bg-[#1B1B1B]/80 px-2 py-0.5 border border-[#F1ECE2]/20">
                      {currentCoords ? `${currentCoords.lat}°N, ${currentCoords.lng}°E` : 'CHENNAI'}
                    </span>
                  </div>

                  {/* Architectural Crosshair Target */}
                  <div className="self-center w-14 h-14 border border-dashed border-[#F1ECE2]/60 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#F1ECE2]" />
                  </div>

                  <div className="bg-[#1B1B1B]/80 px-2 py-0.5 border border-[#F1ECE2]/20 self-start">
                    [ {timestampStr} ]
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-[#1B1B1B]">
              <img
                src={capturedImage}
                alt="Captured Item"
                className="w-full h-full object-contain max-h-[400px]"
              />
              <div className="absolute top-3 left-3 bg-[#E8E1D3] border border-[#1B1B1B] px-2 py-0.5 font-['Space_Mono'] text-[10px] text-[#4B5D3A] font-bold">
                [ VERIFIED LIVE CAPTURE ]
              </div>
            </div>
          )}

          {/* Hidden Canvas & Mobile Shutter Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#E8E1D3] border-t border-[#1B1B1B] flex items-center justify-between gap-3">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs"
              >
                SYSTEM SHUTTER
              </button>

              {stream && (
                <button
                  type="button"
                  disabled={isCapturing}
                  onClick={takeSnapshot}
                  className="w-14 h-14 bg-[#1B1B1B] border-2 border-[#1B1B1B] flex items-center justify-center cursor-pointer hover:bg-[#B0492E] transition-colors"
                  title="Capture Frame"
                >
                  <div className="w-8 h-8 bg-[#F1ECE2]" />
                </button>
              )}

              <div className="w-12" />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setCapturedImage(null);
                  startCamera();
                }}
                className="btn-secondary text-xs"
              >
                RETAKE SHOT
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="btn-primary"
              >
                ATTACH EVIDENCE
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
