import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Utility function to generate smoother random numbers
const smoothRandom = (min, max, smoothingFactor = 0.3) => {
  const randomValue = Math.random() * (max - min) + min;
  return (previousValue) => {
    return previousValue * smoothingFactor + randomValue * (1 - smoothingFactor);
  };
};

// Generate baseline values for different metrics
const baselineValues = {
  http: 0.5,
  logon: 0.4,
  device: 0.3,
  network: 0.45,
  file: 0.35
};

// Keep track of previous values for smoothing
let previousValues = { ...baselineValues };

// Utility function to generate time-based variations
const getTimeBasedVariation = () => {
  const hour = new Date().getHours();
  
  // Less activity during night hours (10 PM - 6 AM)
  if (hour >= 22 || hour < 6) {
    return 0.3;
  }
  // Peak hours (9 AM - 5 PM)
  if (hour >= 9 && hour <= 17) {
    return 1.0;
  }
  // Moderate activity for other hours
  return 0.6;
};

// Generate more realistic anomaly data
const processDataset = () => {
  const anomalies = [];
  const timeVariation = getTimeBasedVariation();
  
  // Generate data for each activity type
  Object.keys(baselineValues).forEach(activity => {
    // Generate a smooth random value for this activity
    const generateSmooth = smoothRandom(
      baselineValues[activity] * 0.8,
      baselineValues[activity] * 1.2
    );
    
    // Update the previous value with smoothing
    previousValues[activity] = generateSmooth(previousValues[activity]);
    
    // Apply time-based variation
    const finalValue = previousValues[activity] * timeVariation;
    
    // Add some occasional spikes (10% chance)
    const hasSpike = Math.random() < 0.1;
    const spikeMultiplier = hasSpike ? (Math.random() * 0.3 + 1.1) : 1;
    
    anomalies.push({
      activity,
      anomalyScore: Math.min(finalValue * spikeMultiplier, 1),
      timestamp: new Date().toISOString(),
      severity: hasSpike ? "high" : "low"
    });
  });
  
  return anomalies;
};

// Endpoint to stream anomalies to frontend
app.get("/api/anomalies-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial data
  const sendData = () => {
    const anomalies = processDataset();
    anomalies.forEach(anomaly => {
      res.write(`data: ${JSON.stringify(anomaly)}\n\n`);
    });
  };

  // Send initial batch
  sendData();

  // Set up interval for continuous updates
  const interval = setInterval(sendData, 5000); // Update every 5 seconds

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(interval);
  });
});

// Endpoint to handle dataset uploads
app.post("/api/upload-dataset", express.json({ limit: "50mb" }), (req, res) => {
  try {
    const { data } = req.body;
    
    // Process the uploaded data
    const processedData = data.map(item => ({
      ...item,
      anomalyScore: parseFloat(item.anomalyScore || 0),
      timestamp: item.timestamp || new Date().toISOString()
    }));
    
    res.json({
      success: true,
      message: "Dataset processed successfully",
      data: processedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing dataset",
      error: error.message
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
