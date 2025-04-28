const video = document.getElementById('video');
const circles = document.querySelectorAll('.circle');

// Load the Teachable Machine model
const modelURL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/";
let model, webcam;

// Initialize the webcam
async function initWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });
    video.srcObject = stream;
    video.play();
}

// Load the model
async function loadModel() {
    model = await tmImage.load(modelURL + "model.json", modelURL + "metadata.json");
    console.log("Model loaded.");
}

// Start the webcam and model
async function start() {
    await initWebcam();
    await loadModel();
    detectGesture();
}

// Detect gestures
async function detectGesture() {
    const prediction = await model.predict(video);
    prediction.forEach((pred) => {
        const { className, probability } = pred;
        if (probability > 0.5) {
            // Update circles based on recognized gesture
            circles.forEach(circle => {
                if (circle.id === className) {
                    circle.classList.add('active');
                } else {
                    circle.classList.remove('active');
                }
            });
        }
    });
    requestAnimationFrame(detectGesture);
}

// Start the application
start();
