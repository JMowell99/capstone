console.log("user_id:", user_id);

fetch(`/healthData?user_id=${user_id}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ECE3906'
  }
})
  .then(response => response.json())
  .then(data => {
    const oxygenLevel = data.oxygen_level;
    const heartRate = data.heart_rate;
    const stepCount = data.step_count;
    const timestamps = data.timestamps;

    const trace1 = {
      x: timestamps,
      y: heartRate,
      type: 'line'
    };
    const layout1 = {
      xaxis: {
        title: 'Time'
      },
      yaxis: {
        title: 'BPM (Beats per Minute)'
      },
      displayModeBar: false,
      staticPlot: true
    };

    const trace2 = {
      x: timestamps,
      y: oxygenLevel,
      type: 'line'
    };
    const layout2 = {
      xaxis: {
        title: 'Time'
      },
      yaxis: {
        title: 'Oxygen Level (%)'
      },
      displayModeBar: false,
      staticPlot: true
    };

    const trace3 = {
      x: timestamps,
      y: stepCount,
      type: 'line'
    };
    const layout3 = {
      xaxis: {
        title: 'Time'
      },
      yaxis: {
        title: 'Step Count (Per Day)'
      },
      displayModeBar: false,
      staticPlot: true
    };

    const chartData1 = [trace1];
    Plotly.newPlot('chart1', chartData1, layout1);

    const chartData2 = [trace2];
    Plotly.newPlot('chart2', chartData2, layout2);

    const chartData3 = [trace3];
    Plotly.newPlot('chart3', chartData3, layout3);
  })
  .catch(error => console.error(error));
