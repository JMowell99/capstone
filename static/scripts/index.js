console.log("user_id:", user_id);

// Define the URL of the endpoint with the user_id parameter
const endpointUrl = `/healthData?user_id=${user_id}`;

// Define the request options for a GET request
const getRequestOptions = {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ECE3906',
    'Content-Type': 'application/json',
  },
};

// Make the API call using fetch
fetch(endpointUrl, getRequestOptions)
  .then(response => {
    // Check if the response status is OK (200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Parse the JSON in the response
    return response.json();
  })
  .then(data => {
    // Display the raw data
    console.log("Raw Data:", data);

    // Threshold values for heart rate background colors
    const hrAbsoluteMax = 200;
    const hrAbsoluteMin = 30;
    const hrHealthyMax = 100;
    const hrHealthyMin = 60;

    // Threshold values for step count background colors
    const scAbsoluteMax = Infinity;
    const scAbsoluteMin = -1;
    const scHealthyMax = Infinity;
    const scHealthyMin = 8000;

    // Threshold values for oxygen level background colors
    const olAbsoluteMax = 101;
    const olAbsoluteMin = 80;
    const olHealthyMax = 101;
    const olHealthyMin = 95;

    // Process heart rate
    processHealthMetric(data.heart_rate, "hr", hrAbsoluteMin, hrHealthyMin, hrHealthyMax, hrAbsoluteMax);

    // Process step count
    processHealthMetric(data.step_count, "sc", scAbsoluteMin, scHealthyMin, scHealthyMax, scAbsoluteMax);

    // Process oxygen level
    processHealthMetric(data.oxygen_level, "ol", olAbsoluteMin, olHealthyMin, olHealthyMax, olAbsoluteMax);
  })
  .catch(error => {
    // Handle any errors that occurred during the fetch
    console.error('Fetch error:', error);
  });

// Function to update the background color based on four threshold ranges
function updateBackgroundColor(elementId, value, absoluteMin, healthyMin, healthyMax, absoluteMax) {
  const tdElement = document.getElementById(elementId);

  console.log(`Checking value ${value}:`);
  console.log(`Healthy range: ${healthyMin} - ${healthyMax}`);
  console.log(`Absolute range: ${absoluteMin} - ${absoluteMax}`);

  if (value >= healthyMin && value <= healthyMax) {
    tdElement.style.backgroundColor = '#90EE90'; // Light Green
    console.log('Green');
  } else if (value < absoluteMin || value > absoluteMax) {
    tdElement.style.backgroundColor = '#FF0000'; // Red
    console.log('Red');
  } else {
    tdElement.style.backgroundColor = 'yellow'; // Yellow
    console.log('Yellow');
  }
}

// Function to process health metric data
function processHealthMetric(metricData, metricPrefix, absoluteMin, healthyMin, healthyMax, absoluteMax) {
  let low = Infinity;
  let high = -Infinity;
  let sum = 0;
  let count = 0;

  metricData.forEach(value => {
    const nonZeroValue = value !== 0;
    if (nonZeroValue) {
      // Update low, high, and sum
      low = Math.min(low, value);
      high = Math.max(high, value);
      sum += value;
      count += 1;
    }
  });

  // Calculate the overall average
  const overallAverage = count > 0 ? Math.round(sum / count) : 0;

  // Update the content of the HTML elements
  document.getElementById(`${metricPrefix}_low`).textContent = low;
  document.getElementById(`${metricPrefix}_avg`).textContent = overallAverage;
  document.getElementById(`${metricPrefix}_high`).textContent = high;

  // Update the background color based on conditions
  updateBackgroundColor(`${metricPrefix}_low`, low, absoluteMin, healthyMin, healthyMax, absoluteMax);
  updateBackgroundColor(`${metricPrefix}_avg`, overallAverage, absoluteMin, healthyMin, healthyMax, absoluteMax);
  updateBackgroundColor(`${metricPrefix}_high`, high, absoluteMin, healthyMin, healthyMax, absoluteMax);
}
