// DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startButton = document.getElementById('startButton');
const statusDiv = document.getElementById('status');

// Canvas context
const ctx = canvas.getContext('2d');

// Variables
let detectionInterval;
let isDetecting = false;

// Load models
async function loadModels() {
    try {
        statusDiv.textContent = 'Status: Loading face detection models...';
        
        // Load the models (you can choose different models based on your needs)
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
        // await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        // await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        
        statusDiv.textContent = 'Status: Models loaded successfully. Click "Start Detection" to begin.';
        startButton.disabled = false;
    } catch (error) {
        console.error('Error loading models:', error);
        statusDiv.textContent = 'Status: Error loading models. See console for details.';
    }
}

// Start video stream
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
        });
        video.srcObject = stream;
        return true;
    } catch (error) {
        console.error('Error accessing camera:', error);
        statusDiv.textContent = 'Status: Error accessing camera. Please ensure you have granted camera permissions.';
        return false;
    }
}

// Detect faces
async function detectFaces() {
    if (video.paused || video.ended) return;
    
    // Use tinyFaceDetector for better performance (less accurate than ssdMobilenetv1)
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detections
    if (detections && detections.length > 0) {
        // Resize detections to match canvas size
        const resizedDetections = faceapi.resizeResults(detections, {
            width: video.width,
            height: video.height
        });
        
        // Draw detections
        faceapi.draw.drawDetections(canvas, resizedDetections);
        
        // Update status
        statusDiv.textContent = `Status: Detected ${detections.length} face(s)`;
    } else {
        statusDiv.textContent = 'Status: No faces detected';
    }
}

// Toggle face detection
async function toggleDetection() {
    if (isDetecting) {
        // Stop detection
        clearInterval(detectionInterval);
        startButton.textContent = 'Start Detection';
        statusDiv.textContent = 'Status: Detection stopped';
        isDetecting = false;
    } else {
        // Start detection
        const videoStarted = await startVideo();
        if (videoStarted) {
            detectionInterval = setInterval(detectFaces, 100); // Detect every 100ms
            startButton.textContent = 'Stop Detection';
            statusDiv.textContent = 'Status: Detection running...';
            isDetecting = true;
        }
    }
}

// Initialize
startButton.addEventListener('click', toggleDetection);
startButton.disabled = true;

// Load models when page loads
window.addEventListener('load', loadModels);
