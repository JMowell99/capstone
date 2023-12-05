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

    // Initialize variables to store low, average, and high for heart rate
    let hrLow = Infinity;
    let hrHigh = -Infinity;
    let hrSum = 0;
    let hrCount = 0;

    // Initialize variables to store low, average, and high for step count
    let scLow = Infinity;
    let scHigh = -Infinity;
    let scSum = 0;
    let scCount = 0;

    // Initialize variables to store low, average, and high for oxygen level
    let olLow = Infinity;
    let olHigh = -Infinity;
    let olSum = 0;
    let olCount = 0;

    // Iterate through each array in 'heart_rate'
    data.heart_rate.forEach(arr => {
      const nonZeroValues = arr.filter(value => value !== 0);
      if (nonZeroValues.length > 0) {
        const currentLow = Math.min(...nonZeroValues);
        const currentHigh = Math.max(...nonZeroValues);
        const currentAverage = Math.round(
          nonZeroValues.reduce((sum, value) => sum + value, 0) / nonZeroValues.length
        );

        // Update heart rate low, high, and sum
        hrLow = Math.min(hrLow, currentLow);
        hrHigh = Math.max(hrHigh, currentHigh);
        hrSum += currentAverage;
        hrCount += 1;
      }
    });

    // Iterate through each array in 'step_count'
    data.step_count.forEach(arr => {
      const nonZeroValues = arr.filter(value => value !== 0);
      if (nonZeroValues.length > 0) {
        const currentLow = Math.min(...nonZeroValues);
        const currentHigh = Math.max(...nonZeroValues);
        const currentAverage = Math.round(
          nonZeroValues.reduce((sum, value) => sum + value, 0) / nonZeroValues.length
        );

        // Update step count low, high, and sum
        scLow = Math.min(scLow, currentLow);
        scHigh = Math.max(scHigh, currentHigh);
        scSum += currentAverage;
        scCount += 1;
      }
    });

    // Iterate through each array in 'oxygen_level'
    data.oxygen_level.forEach(arr => {
      const nonZeroValues = arr.filter(value => value !== 0);
      if (nonZeroValues.length > 0) {
        const currentLow = Math.min(...nonZeroValues);
        const currentHigh = Math.max(...nonZeroValues);
        const currentAverage = Math.round(
          nonZeroValues.reduce((sum, value) => sum + value, 0) / nonZeroValues.length
        );

        // Update oxygen level low, high, and sum
        olLow = Math.min(olLow, currentLow);
        olHigh = Math.max(olHigh, currentHigh);
        olSum += currentAverage;
        olCount += 1;
      }
    });

    // Calculate the overall average for heart rate
    const hrOverallAverage = hrCount > 0 ? Math.round(hrSum / hrCount) : 0;

    // Calculate the overall average for step count
    const scOverallAverage = scCount > 0 ? Math.round(scSum / scCount) : 0;

    // Calculate the overall average for oxygen level
    const olOverallAverage = olCount > 0 ? Math.round(olSum / olCount) : 0;

    // Update the content of the HTML elements with the calculated values for heart rate
    document.getElementById("hr_low").textContent = hrLow;
    document.getElementById("hr_avg").textContent = hrOverallAverage;
    document.getElementById("hr_high").textContent = hrHigh;

    // Update the background color of the <td> elements for heart rate based on conditions
    updateBackgroundColor("hr_low", hrLow, hrAbsoluteMin, hrHealthyMin, hrHealthyMax, hrAbsoluteMax);
    updateBackgroundColor("hr_avg", hrOverallAverage, hrAbsoluteMin, hrHealthyMin, hrHealthyMax, hrAbsoluteMax);
    updateBackgroundColor("hr_high", hrHigh, hrAbsoluteMin, hrHealthyMin, hrHealthyMax, hrAbsoluteMax);

    // Update the content of the HTML elements with the calculated values for step count
    document.getElementById("sc_low").textContent = scLow;
    document.getElementById("sc_avg").textContent = scOverallAverage;
    document.getElementById("sc_high").textContent = scHigh;

    // Update the background color of the <td> elements for step count based on conditions
    updateBackgroundColor("sc_low", scLow, scAbsoluteMin, scHealthyMin, scHealthyMax, scAbsoluteMax);
    updateBackgroundColor("sc_avg", scOverallAverage, scAbsoluteMin, scHealthyMin, scHealthyMax, scAbsoluteMax);
    updateBackgroundColor("sc_high", scHigh, scAbsoluteMin, scHealthyMin, scHealthyMax, scAbsoluteMax);

    // Update the content of the HTML elements with the calculated values for oxygen level
    document.getElementById("ol_low").textContent = olLow;
    document.getElementById("ol_avg").textContent = olOverallAverage;
    document.getElementById("ol_high").textContent = olHigh;

    // Update the background color of the <td> elements for oxygen level based on conditions
    updateBackgroundColor("ol_low", olLow, olAbsoluteMin, olHealthyMin, olHealthyMax, olAbsoluteMax);
    updateBackgroundColor("ol_avg", olOverallAverage, olAbsoluteMin, olHealthyMin, olHealthyMax, olAbsoluteMax);
    updateBackgroundColor("ol_high", olHigh, olAbsoluteMin, olHealthyMin, olHealthyMax, olAbsoluteMax);
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
