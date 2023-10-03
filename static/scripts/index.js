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

// Make a GET request to the /healthData endpoint with user_id and Authorization header
fetch(endpointUrl, getRequestOptions)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    // Calculate low, high, and average values
    const bodyTempValues = data.body_temp;
    const heartRateValues = data.heart_rate;
    const respirationRateValues = data.respiration_rate;

    const bodyTempLow = Math.min(...bodyTempValues);
    const bodyTempHigh = Math.max(...bodyTempValues);
    const bodyTempAvg = bodyTempValues.reduce((acc, val) => acc + val, 0) / bodyTempValues.length;

    const heartRateLow = Math.min(...heartRateValues);
    const heartRateHigh = Math.max(...heartRateValues);
    const heartRateAvg = heartRateValues.reduce((acc, val) => acc + val, 0) / heartRateValues.length;

    const respirationRateLow = Math.min(...respirationRateValues);
    const respirationRateHigh = Math.max(...respirationRateValues);
    const respirationRateAvg = respirationRateValues.reduce((acc, val) => acc + val, 0) / respirationRateValues.length;

    // Update the content of the <td> elements with calculated values
    document.getElementById('bt_low').textContent = `${bodyTempLow}`;
    document.getElementById('bt_high').textContent = `${bodyTempHigh}`;
    document.getElementById('bt_avg').textContent = `${bodyTempAvg.toFixed(2)}`;

    document.getElementById('hr_low').textContent = `${heartRateLow}`;
    document.getElementById('hr_high').textContent = `${heartRateHigh}`;
    document.getElementById('hr_avg').textContent = `${heartRateAvg.toFixed(2)}`;

    document.getElementById('rr_low').textContent = `${respirationRateLow}`;
    document.getElementById('rr_high').textContent = `${respirationRateHigh}`;
    document.getElementById('rr_avg').textContent = `${respirationRateAvg.toFixed(2)}`;
  })
  .catch((error) => {
    // Handle errors here
    console.error('Fetch error:', error);
  });