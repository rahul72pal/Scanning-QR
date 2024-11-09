'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import smapleQrImage from '../../../public/sampleQR.png';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ScannedData {
  name: string;
  rollNo: string;
  class: string;
}

const QRScanner: React.FC = () => {
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<ScannedData[]>([]);
  const [startScan, setStartScan] = useState(false);
  const scannedRollNumbers = useRef<Set<string>>(new Set());

  // Continuous scanning without debouncing in `onScanSuccess`
  const onScanSuccess = useCallback((result: QrScanner.ScanResult) => {
    let newResult;

    try {
      newResult = JSON.parse(result.data);
      if (!newResult.name || !newResult.rollNo || !newResult.class) {
        toast.error('Invalid QR format');
        return;
      }
    } catch {
      toast.error('Invalid QR code format. Please scan a valid QR code.');
      return;
    }

    const newRollNo = newResult.rollNo;

    // Prevent duplicate roll numbers
    if (!scannedRollNumbers.current.has(newRollNo)) {
      console.log("New QR Code scanned:", newResult);

      // Add the roll number to the set to prevent future duplicates
      scannedRollNumbers.current.add(newRollNo);

      // Add the new result to the scanned results array
      setScannedResult((prev) => [...prev, newResult]);

      toast.success("QR Code Scanned!");
    }
  }, []);

  const onScanFail = (err: string | Error) => {
    console.log(err);
  };

  // Effect to manage scanner start and stop
  useEffect(() => {
    if (startScan && videoEl.current) {
      // Initialize the scanner only once when starting
      scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl.current || undefined,
      });

      // Start the scanner
      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err) => {
          setQrOn(false);
          console.log(err);
        });

      // Clean up when `startScan` is toggled off
      return () => {
        scanner.current?.stop();
      };
    } else {
      // Stop the scanner when not scanning
      scanner.current?.stop();
    }
  }, [startScan, onScanSuccess]); // `onScanSuccess` is still included as a dependency

  useEffect(() => {
    if (!qrOn) {
      alert("Camera is blocked or not accessible. Please allow camera in your browser permissions and reload.");
    }
  }, [qrOn]);

  console.log("scannedResult =", scannedResult);

  return (
    <div className="relative sm:w-[100vw] flex flex-col items-center
     lg:w-[50%] mx-auto justify-center h-screen bg-gray-400">
      {/* QR Video Element */}
      {startScan && (
        <video
          ref={videoEl}
          className="w-full max-w-md rounded-lg shadow-lg border-2 border-red-600"
        />
      )}

      <div ref={qrBoxEl} className="w-64 h-64 border-4 border-dashed border-yellow-500">
        {!videoEl.current && !startScan && (
          <Image
            src={smapleQrImage}
            alt="QR Frame"
            className="w-full h-full object-cover opacity-70"
            width={356} // Define the width
            height={356} // Define the height
          />
        )}
      </div>

      {/* {scannedResult && startScan && ( */}
        <h3>Number of Scanned Results: {scannedResult.length}</h3>
      {/* )} */}

      {/* Display Scanned Result */}
      {/* {scannedResult.length > 0 && !startScan && (
        <div className="top-0 left-0 p-2 bg-gray-800 text-white text-lg border-2 border-red-600 rounded-md shadow-md">
          <h3>Number of Scanned Results: {scannedResult.length}</h3>
          <ul>
            {scannedResult.map((result, index) => (
              <li key={index}>
                <strong>Name:</strong> {result.name} <br />
                <strong>Roll No:</strong> {result.rollNo} <br />
                <strong>Class:</strong> {result.class}
              </li>
            ))}
          </ul>
        </div>
      )} */}

      {/* Button to toggle scanning */}
      <button
        className="px-8 mt-4 py-4 bg-blue-500 text-white rounded-md"
        onClick={() => setStartScan(!startScan)}
      >
        {startScan ? "Stop Scanning" : "Start Scanning"}
      </button>
    </div>
  );
};

export default QRScanner;
