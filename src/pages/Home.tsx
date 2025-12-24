"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Home() {
  const qrRegionId = "qr-reader";
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [qrResult, setQrResult] = useState<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/beep.mp3");

    Html5Qrcode.getCameras().then((devices) => {
      if (devices.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    });

    return () => {
      qrCodeRef.current?.stop().catch(() => {});
      qrCodeRef.current?.clear();
    };
  }, []);

  useEffect(() => {
    if (!selectedCamera) return;

    const start = async () => {
      if (qrCodeRef.current) {
        await qrCodeRef.current.stop().catch(() => {});
        await qrCodeRef.current.clear();
      }

      const scanner = new Html5Qrcode(qrRegionId);
      qrCodeRef.current = scanner;

      await scanner.start(
        { deviceId: { exact: selectedCamera } },
        {
          fps: 10,
          qrbox: { width: 360, height: 360 },
          aspectRatio: 1,
        },
        (decodedText) => {
          setQrResult(decodedText);
          audioRef.current?.play().catch(() => {});
        }
      );
    };

    start();
  }, [selectedCamera]);

  const toggleTorch = async () => {
    try {
      const caps =
        await qrCodeRef.current?.getRunningTrackCapabilities();
      if (!caps?.torch) return;

      await qrCodeRef.current?.applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn((p) => !p);
    } catch {}
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#7F55B1] to-[#9B7EBD] text-[#2a1d3a]">
      {/* NAVBAR */}
      <header className="h-20 px-6 md:px-10 flex items-center justify-between bg-white/30 backdrop-blur border-b border-white/40">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">
            OH Ticket Scanner
          </h1>
          <p className="text-sm opacity-70">
            Live verification system
          </p>
        </div>

        <a
          href="/dashboard"
          target="_blank"
          rel="noopener noreferrer">
          <button className="px-5 py-2.5 rounded-xl bg-[#F49BAB]/80 hover:bg-[#F49BAB] transition text-white font-medium">
          Dashboard
          </button>
        </a>
      </header>

      {/* MAIN */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 p-4 md:p-8">
        {/* CAMERA */}
        <section className="relative w-full h-[65vh] md:h-full rounded-3xl overflow-hidden bg-black shadow-2xl">
          <div id={qrRegionId} className="absolute inset-0" />

          {/* SCANNER FRAME */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[70vw] max-w-[360px] aspect-square rounded-3xl border-[3px] border-[#F49BAB] shadow-[0_0_60px_#F49BAB88]" />
          </div>
        </section>

        {/* PANEL */}
        <aside className="flex flex-col justify-center gap-6">
          <div className="bg-[#FFE1E0]/60 backdrop-blur border border-white/50 rounded-2xl p-5">
            <p className="text-sm opacity-70 mb-2">
              Camera source
            </p>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/80 border border-white/60 outline-none"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || "Camera"}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleTorch}
            className="h-14 rounded-2xl bg-[#F49BAB]/80 hover:bg-[#F49BAB] transition font-semibold text-white shadow-lg"
          >
            {torchOn ? "Disable flashlight" : "Enable flashlight"}
          </button>

          {qrResult && (
            <div className="bg-[#FFE1E0]/60 backdrop-blur border border-white/50 rounded-2xl p-4">
              <p className="text-xs opacity-60 mb-1">
                Last scanned code
              </p>
              <p className="font-mono text-sm break-words">
                {qrResult}
              </p>
            </div>
          )}
        </aside>
      </main>

      <footer className="text-center text-xs text-white/80 py-3">
        Secure local camera processing
      </footer>
    </div>
  );
}
