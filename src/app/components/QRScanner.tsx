'use client';
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import smapleQrImage from '../../../public/sampleQR.png';
import Image from 'next/image';
import toast from 'react-hot-toast';

const QRScanner: React.FC = () => {
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<any[]>([]); // Store parsed JSON data
  const [startScan, setStartScan] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number>(0); // Track the last scan time
  const scannedRollNumbers = useRef<Set<string>>(new Set()); // Track scanned roll numbers to prevent duplicates

  const DEBOUNCE_TIME = 2000; // 2 second debounce time to slow down scanning

  // Handle successful scan with debouncing to prevent duplicate entries and fast scans
  const onScanSuccess = (result: QrScanner.ScanResult) => {
    let newResult;

    try {
      // Parse the QR data into a JSON object
      newResult = JSON.parse(result.data);

      // Check if the necessary fields exist in the parsed object
      if (!newResult.name || !newResult.rollNo || !newResult.class) {
        toast.error('Invalid QR format');
      }
    } catch (error) {
      toast.error('Invalid QR code format. Please scan a valid QR code.');
      return;
    }

    const newRollNo = newResult.rollNo;  // Adjusted based on the new object structure

    // Check if enough time has passed to process the next scan
    const currentTime = Date.now();
    if (currentTime - lastScanTime > DEBOUNCE_TIME) {
      // Check if this roll number has already been scanned
      if (!scannedRollNumbers.current.has(newRollNo)) {
        console.log("New QR Code scanned:", newResult);
        
        // Add the roll number to the set to prevent future duplicates
        scannedRollNumbers.current.add(newRollNo);

        // Add the new result to the scanned results array
        setScannedResult((prev) => [...prev, newResult]);

        // Update the last scan time
        setLastScanTime(currentTime);
        toast.success("QR Code Scanned!");
      }
    }
  };

  const onScanFail = (err: string | Error) => {
    console.log(err);
  };

  // Effect to manage scanner start and stop
  useEffect(() => {
    if (startScan && videoEl.current) {
      // Re-initialize the scanner when starting
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
  }, [startScan]); // Trigger this effect when startScan changes

  useEffect(() => {
    if (!qrOn) {
      alert("Camera is blocked or not accessible. Please allow camera in your browser permissions and reload.");
    }
  }, [qrOn]);

  console.log("scannedResult =", scannedResult);

  return (
    <div className="relative flex flex-col items-center w-[50%] mx-auto justify-center h-screen bg-gray-400">
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
            className="w-full h-full object-cover opacity-50"
            width={356} // Define the width
            height={356} // Define the height
          />
        )}
      </div>

      {/* Display Scanned Result */}
      {scannedResult.length > 0 && !startScan && (
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
      )}

      {/* Button to toggle scanning */}
      <button
        className="w-64 h-64 mt-4 p-4 bg-blue-500 text-white rounded-md"
        onClick={() => setStartScan(!startScan)}
      >
        {startScan ? "Stop Scanning" : "Start Scanning"}
      </button>
    </div>
  );
};

export default QRScanner;
