import React, { useRef, useEffect, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import "../css/facerecog.css";

interface FaceRecogProps {
  onClose: () => void;
  onFaceDetected?: (faceData: any) => void;
  mode: "login" | "signup";
  username?: string;
}

const FaceRecog = ({
  onClose,
  onFaceDetected,
  mode,
  username,
}: FaceRecogProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<any>(null);
  const faceDescriptorRef = useRef<any>(null);
  const detectionCountRef = useRef(0);
  const animationRef = useRef<number>();
  const faceDetectionRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeFaceDetection();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceDetectionRef.current) {
        faceDetectionRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Progress animation when face is detected
  useEffect(() => {
    if (faceDetected && !isCapturing) {
      setIsCapturing(true);
      setProgress(0);

      const startTime = Date.now();
      const duration = 3000; // 3 seconds

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);

        setProgress(newProgress);

        if (newProgress < 100) {
          animationRef.current = requestAnimationFrame(animateProgress);
        } else {
          // Progress complete - capture face
          captureFace();
        }
      };

      animationRef.current = requestAnimationFrame(animateProgress);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [faceDetected]);

  const initializeFaceDetection = async () => {
    try {
      if (!videoRef.current) {
        setError("Camera element not found");
        return;
      }

      const faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
        },
      });

      faceDetection.setOptions({
        selfieMode: true,
        model: "short",
        minDetectionConfidence: 0.3,
      });

      faceDetection.onResults(onFaceDetectionResults);
      faceDetectionRef.current = faceDetection;

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            await faceDetection.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await cameraRef.current.start();

      videoRef.current.addEventListener("loadeddata", () => {
        if (videoRef.current && videoRef.current.videoWidth > 0) {
          setIsInitialized(true);
          setError("");
        }
      });
    } catch (err) {
      console.error("Error initializing face detection:", err);
      setError("Failed to initialize camera. Please check permissions.");
    }
  };

  const onFaceDetectionResults = (results: any) => {
    if (!results.detections || results.detections.length === 0) {
      detectionCountRef.current = 0;
      return;
    }

    // Face detected
    detectionCountRef.current++;

    // Quick detection - only need 3 frames
    if (detectionCountRef.current > 3 && !faceDetected && !isCapturing) {
      setFaceDetected(true);

      const detection = results.detections[0];
      const boundingBox = detection.boundingBox;

      // MediaPipe already returns normalized values between 0-1
      // xCenter, yCenter, width, height are already normalized!
      const x = boundingBox.xCenter || boundingBox.xMin || 0;
      const y = boundingBox.yCenter || boundingBox.yMin || 0;
      const width = boundingBox.width || 0;
      const height = boundingBox.height || 0;

      // Create descriptor with CORRECT normalized values
      const descriptor = {
        // Raw coordinates (already normalized 0-1 from MediaPipe)
        x: x,
        y: y,
        width: width,
        height: height,

        // These are the normalized values (0-1 range)
        normalizedX: x, // Already normalized!
        normalizedY: y, // Already normalized!
        normalizedWidth: width, // Already normalized!
        normalizedHeight: height, // Already normalized!

        // Landmarks if available
        landmarks:
          detection.landmarks?.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            normalizedX: lm.x, // Already normalized!
            normalizedY: lm.y, // Already normalized!
          })) || [],

        // Additional metrics
        aspectRatio: width / (height || 1),
        confidence: detection.score || 0,

        // Metadata
        timestamp: Date.now(),
        username: username,
        mode: mode,
      };

      console.log("Face descriptor created:", descriptor);
      faceDescriptorRef.current = descriptor;
    }
  };

  const captureFace = () => {
    if (!videoRef.current || !faceDescriptorRef.current) return;

    // Capture image
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    const faceData = {
      descriptor: faceDescriptorRef.current,
      image: imageData,
      username: username,
      mode: mode,
      timestamp: new Date().toISOString(),
    };

    console.log("Face data captured:", faceData);

    if (onFaceDetected) {
      onFaceDetected(faceData);
    }

    // Close after capture
    setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      onClose();
    }, 1000);
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
  };

  const retryCamera = () => {
    setError("");
    setIsInitialized(false);
    setFaceDetected(false);
    setIsCapturing(false);
    setProgress(0);
    initializeFaceDetection();
  };

  return (
    <div className="facerecog-container">
      <div className="camera-wrapper">
        <video ref={videoRef} className="camera-video" autoPlay playsInline />

        <div className="camera-scanner">
          {!isInitialized && !error && (
            <div className="loading-overlay">
              <p>Initializing camera...</p>
            </div>
          )}
          {error && (
            <div className="error-overlay">
              <p>{error}</p>
              <button onClick={retryCamera} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {/* Clean circular progress indicator - no number */}
          {faceDetected && (
            <div className="face-detected-ring">
              <svg
                className="progress-ring"
                width="100%"
                height="100%"
                viewBox="0 0 320 320"
              >
                {/* Background circle (dashed) */}
                <circle
                  className="progress-ring__bg"
                  cx="160"
                  cy="160"
                  r="148"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                  strokeDasharray="8 8"
                />
                {/* Progress circle */}
                <circle
                  className="progress-ring__progress"
                  cx="160"
                  cy="160"
                  r="148"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 148}`}
                  strokeDashoffset={`${2 * Math.PI * 148 * (1 - progress / 100)}`}
                  style={{
                    transition: "stroke-dashoffset 0.1s linear",
                    filter: "drop-shadow(0 0 8px rgba(76, 175, 80, 0.6))",
                  }}
                />
                {/* Small checkmark dot */}
                <circle
                  className="progress-ring__dot"
                  cx="160"
                  cy="160"
                  r="12"
                  fill="#4CAF50"
                  opacity="0.8"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="note">
        <h5>
          <strong>Note:</strong>{" "}
          <span>
            Make sure your face is fully visible <br />
            within the circle for best results.
          </span>
        </h5>
      </div>

      <div className="detection-status">
        {isInitialized && !faceDetected && !error && (
          <p className="status-text">Scanning for face...</p>
        )}
        {faceDetected && (
          <p className="status-text success">Face detected! Capturing...</p>
        )}
      </div>

      <div className="close-button">
        <button
          className="facerecog-button-close"
          onClick={() => {
            stopCamera();
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FaceRecog;
