import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const AnomalyChart = ({ data, title }) => {
  return (
    <Plot
      data={[
        {
          x: data.map((_, index) => index),
          y: data.map((d) => d.anomalyScore),
          type: "scatter",
          mode: "lines+markers",
          marker: { color: "red" },
        },
      ]}
      layout={{
        title,
        plot_bgcolor: "rgba(0, 0, 0, 0)",
        paper_bgcolor: "rgba(0, 0, 0, 0)",
        font: { color: "white" },
        xaxis: { gridcolor: "rgba(255, 255, 255, 0.1)" },
        yaxis: { gridcolor: "rgba(255, 255, 255, 0.1)" },
      }}
      config={{ displayModeBar: false }}
    />
  );
};

export default AnomalyChart;
