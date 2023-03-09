// define endpoints
const endpoints = ['/min', '/max', '/average'];

// concatenate the healthData parameter to each endpoint URL using template literals
const minEndpoint = `/min?healthData=${healthDataParam}`;
const maxEndpoint = `/max?healthData=${healthDataParam}`;
const avgEndpoint = `/average?healthData=${healthDataParam}`;









fetch('/healthData?user_id=1', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ECE3906'
    }
  }
)

.then(response => response.json())

.then(data => {
  const bodyTemp = data.body_temp;
  const minBodyTemp = Math.min(...BodyTempValues);
  const heartRate = data.heart_rate;
  const minHeartRate = Math.min(...heartRateValues);
  const respirationRate = data.respiration_rate;
  const minRespirationRate = Math.min(...respirationRateValues);
  const timestamps = data.timestamps;
})

