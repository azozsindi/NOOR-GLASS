/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface ScannerProps {
  onScan: (text: string) => void;
  label: string;
}

export function Scanner({ onScan, label }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-container";

  const toggleScanner = async () => {
    if (isScanning) {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      }
    } else {
      setIsScanning(true);
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          () => {}
        );
      } catch (err) {
        console.error("Scanner start error:", err);
        setIsScanning(false);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="mb-4">
      <button
        onClick={toggleScanner}
        className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
      >
        {isScanning ? <X size={20} /> : <Camera size={20} />}
        {isScanning ? "إغلاق" : label}
      </button>
      <div 
        id={containerId} 
        className={`mt-2 rounded-xl overflow-hidden border-4 border-blue-800 bg-black ${isScanning ? 'block' : 'hidden'}`}
      />
    </div>
  );
}
