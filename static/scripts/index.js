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

    // Function to change background color based on value
    function changeBackgroundColor(elementId, lowerUnhealthyLimit, lowerDangerousLimit, higherUnhealthyLimit, higherDangerousLimit) {
      const element = document.getElementById(elementId);
      const value = parseFloat(element.textContent);

      if (!isNaN(value)) {
        if (value < lowerDangerousLimit || value > higherDangerousLimit) {
          element.style.backgroundColor = '#FF0000'; // Red for dangerous
        }
        else if (value < lowerUnhealthyLimit || value > higherUnhealthyLimit) {
          element.style.backgroundColor = 'yellow'; // Yellow for unhealthy else
        }
        else {
          element.style.backgroundColor = '#90EE90'; // Green for healthy
        }
      }
    }

    // Setting background color for heart rate
    changeBackgroundColor("hr_low", 60, 40, 180, 200);
    changeBackgroundColor("hr_high", 60, 40, 180, 200);
    changeBackgroundColor("hr_avg", 60, 40, 180, 200);

    // Settting background color for body temp
    changeBackgroundColor("bt_low", 97, 95, 99, 103);
    changeBackgroundColor("bt_high", 97, 95, 99, 103);
    changeBackgroundColor("bt_avg", 97, 95, 99, 103);

    // Setting background color for respiration rate
    changeBackgroundColor("rr_low", 12, 10, 15, 16);
    changeBackgroundColor("rr_high", 12, 10, 15, 16);
    changeBackgroundColor("rr_avg", 12, 10, 15, 16);

  })
  .catch((error) => {
    // Handle errors here
    console.error('Fetch error:', error);
  });