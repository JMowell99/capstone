fetch('/healthData?user_id=1', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ECE3906'
  }
})
  .then(response => response.json())
  .then(data => {
    const bodyTemp = data.body_temp;
    const heartRate = data.heart_rate;
    const respirationRate = data.respiration_rate;
    const timestamps = data.timestamps;

    const trace1 = {
      x: timestamps,
      y: bodyTemp,
      type: 'line'
    };
    const layout1 = {
      xaxis: {
        title: 'Time'
      },
      yaxis: {
        title: 'Body Temperature (Fahrenheit)'
      },
      displayModeBar: false, // Disable zoom and tools
      staticPlot: true // Set staticPlot to true
    };

    const trace2 = {
      x: timestamps,
      y: heartRate,
      type: 'line'
    };
    const layout2 = {
      xaxis: {
        title: 'Time'
      },
      yaxis: {
        title: 'Heart Rate (beats per minute)'
      },
      displayModeBar: false, // Disable zoom and tools
      staticPlot: true // Set staticPlot to true
    };

    const trace3 = {
      x: timestamps,
      y: respirationRate,
      type: 'line'
    };
    const layout3 = {
      xaxis: {
        title: 'Time'
      },
      yaxis: {
        title: 'Respiration Rate (breaths per minute)'
      },
      displayModeBar: false, // Disable zoom and tools
      staticPlot: true // Set staticPlot to true
    };

    const chartData1 = [trace1];
    Plotly.newPlot('chart1', chartData1, layout1);

    const chartData2 = [trace2];
    Plotly.newPlot('chart2', chartData2, layout2);

    const chartData3 = [trace3];
    Plotly.newPlot('chart3', chartData3, layout3);
  })
  .catch(error => console.error(error));
