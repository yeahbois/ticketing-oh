import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import type { Html5QrcodeCameraScanConfig } from "html5-qrcode";

export default function Home() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize cameras
  useEffect(() => {
    async function initCameras() {
      try {
        const availableCameras = await Html5Qrcode.getCameras();
        if (availableCameras && availableCameras.length) {
          setCameras(
            availableCameras.map((cam) => ({ id: cam.id, label: cam.label }))
          );
          setSelectedCamera(availableCameras[0].id);
        }
      } catch (err) {
        console.error("Camera init error:", err);
      }
    }
    initCameras();

    // Initialize sound
    audioRef.current = new Audio("/beep.mp3"); // put your beep.mp3 in public folder
  }, []);

  // Initialize scanner
  useEffect(() => {
    if (!selectedCamera) return;

    // Clear previous scanner
    scannerRef.current?.clear().catch(() => {});

    const config: Html5QrcodeCameraScanConfig = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      rememberLastUsedCamera: true,
    };

    scannerRef.current = new Html5QrcodeScanner("qr-reader", config, false);
    scannerRef.current.render(
      (decodedText) => {
        setQrResult(decodedText);
        // Play sound
        audioRef.current?.play().catch(() => {});
      },
      (error) => console.warn("QR Scan Error:", error),
      selectedCamera
    );

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [selectedCamera]);

  // Torch toggle
  const toggleTorch = async () => {
    setTorchOn((prev) => !prev);
    try {
      const track = scannerRef.current?.getRunningTrack?.();
      if (track?.applyConstraints) {
        await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      }
    } catch (e) {
      console.warn("Torch not supported:", e);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-gray-900 dark:text-white font-display antialiased">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-[#254632] flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">qr_code_scanner</span>
          OH Ticket Scanner
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          System Ready
        </span>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 sm:p-6 lg:p-10">
        {/* Camera Container */}
        <div className="flex-1 relative bg-black rounded-lg overflow-hidden border border-gray-800 dark:border-[#254632] flex justify-center items-center">
          <div id="qr-reader" className="w-full h-full"></div>
          {/* QR Box Overlay */}
          <div className="absolute inset-0 border-2 border-primary/30 rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
          </div>
        </div>

        {/* Settings Container */}
        <div className="flex flex-col gap-4 md:w-72">
          {/* Camera Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Select Camera:</label>
            <select
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={selectedCamera ?? ""}
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label}
                </option>
              ))}
            </select>
          </div>

          {/* Torch Button */}
          <button
            onClick={toggleTorch}
            className="flex items-center justify-center h-12 px-4 rounded-full bg-surface-dark border border-[#366348] hover:bg-[#254632] text-white gap-2 transition-colors duration-200"
          >
            <span className="material-symbols-outlined">
              {torchOn ? "flashlight_off" : "flashlight_on"}
            </span>
            {torchOn ? "Turn Off Flash" : "Turn On Flash"}
          </button>

          {/* QR Result */}
          {qrResult && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center break-words">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                QR Code Detected:
              </p>
              <p className="font-mono text-gray-900 dark:text-white">{qrResult}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-gray-400 dark:text-[#5a7a67]">
        Scanning happens locally on your device for privacy.
      </footer>
    </div>
  );
}