import React, { useState, useEffect } from "react";

const AlertSystem = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/api/anomalies-stream");

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setAlerts((prev) => [...prev, newData]);
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Alerts</h2>
      <ul>
        {alerts.map((alert, index) => (
          <li key={index} className="text-red-400">
            {alert.user}: Anomaly Score {alert.anomalyScore.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertSystem;
