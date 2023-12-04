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

    // Threshold values for background colors
    const absoluteMax = 200;
    const absoluteMin = 30;
    const healthyMax = 100;
    const healthyMin = 60;

    // Initialize variables to store low, average, and high
    let low = Infinity;
    let high = -Infinity;
    let sum = 0;
    let count = 0;

    // Iterate through each array in 'heart_rate'
    data.heart_rate.forEach(arr => {
      const nonZeroValues = arr.filter(value => value !== 0);
      if (nonZeroValues.length > 0) {
        const currentLow = Math.min(...nonZeroValues);
        const currentHigh = Math.max(...nonZeroValues);
        const currentAverage = Math.round(
          nonZeroValues.reduce((sum, value) => sum + value, 0) / nonZeroValues.length
        );

        // Update low, high, and sum
        low = Math.min(low, currentLow);
        high = Math.max(high, currentHigh);
        sum += currentAverage;
        count += 1;
      }
    });

    // Calculate the overall average
    const overallAverage = count > 0 ? Math.round(sum / count) : 0;

    // Update the content of the HTML elements with the calculated values
    document.getElementById("hr_low").textContent = low;
    document.getElementById("hr_avg").textContent = overallAverage;
    document.getElementById("hr_high").textContent = high;

    // Update the background color of the <td> elements based on conditions
    updateBackgroundColor("hr_low", low, absoluteMin, healthyMin, healthyMax, absoluteMax);
    updateBackgroundColor("hr_avg", overallAverage, absoluteMin, healthyMin, healthyMax, absoluteMax);
    updateBackgroundColor("hr_high", high, absoluteMin, healthyMin, healthyMax, absoluteMax);
  })
  .catch(error => {
    // Handle any errors that occurred during the fetch
    console.error('Fetch error:', error);
  });

// Function to update the background color based on four threshold ranges
function updateBackgroundColor(elementId, value, absoluteMin, healthyMin, healthyMax, absoluteMax) {
  const tdElement = document.getElementById(elementId);

  console.log(`Checking value ${value}:`);
  console.log(`  Healthy range: ${healthyMin} - ${healthyMax}`);
  console.log(`  Absolute range: ${absoluteMin} - ${absoluteMax}`);

  if (value >= healthyMin && value <= healthyMax) {
    tdElement.style.backgroundColor = '#90EE90'; // Light Green
    console.log('  Light Green');
  } else if (value < absoluteMin || value > absoluteMax) {
    tdElement.style.backgroundColor = '#FF0000'; // Red
    console.log('  Red');
  } else {
    tdElement.style.backgroundColor = 'yellow'; // Yellow
    console.log('  Yellow');
  }
}
