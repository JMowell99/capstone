/*

This is on the github for the purpose of giving the rest of the team access to this code.

It does not yet "work" but it does at least upload data to the website, just not properly formatted.

I am going to come back to this later and get a working version

*/

 

#include <ArduinoJson.h>

#include <WiFi.h>

 

#include <SparkFun_Bio_Sensor_Hub_Library.h>

#include <Wire.h>

 

int heartRate[10] = {};

// Initailizes an array to store the 10 data points collected from the sensor

 

// Reset pin, MFIO pin for pulse sensor

int resPin = 4;

int mfioPin = 2;

 

// Takes address, reset pin, and MFIO pin.

SparkFun_Bio_Sensor_Hub bioHub(resPin, mfioPin);

 

const char* ssid = "Pixel_5907";

const char* password = "JesseMowell";

 

const char* serverAddress = "192.168.129.243";

const int serverPort = 3906;

const char* authToken = "Bearer ECE3906";

const int userId = 1;

 

bioData body;  

 

void setup() {

 

 Serial.begin(115200);

// Begins serial communication

 

  Wire.begin(5,18);

// Initailizes I2C communication SDA and SLC pins

 

  int result = bioHub.begin();

// Turns on sensor, stores error as result

 

  if (result == 0) // Zero errors!

    Serial.println("Sensor started!");

  else

    Serial.println("Could not communicate with the sensor!");

 

  Serial.println("Configuring Sensor....");

  int error = bioHub.configBpm(MODE_ONE); // Configuring just the BPM settings.

  if(error == 0){ // Zero errors!

    Serial.println("Sensor configured.");

  }

  else {

    Serial.println("Error configuring sensor.");

    Serial.print("Error: ");

    Serial.println(error);

  }

  // a Buffer is used to help with sensor delay

 

  //  Serial.println("Loading up the buffer with data....");

  //  delay(4000);

 

  // Connect to Wi-Fi

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(1000);

    Serial.println("Connecting to WiFi...");

  }

 

  Serial.println("Connected to WiFi");

 

  // Example usage of sendHttpRequest function with user_id parameter

}

 

void sendHttpRequest(int userId) {

  // In the final code, these arrays will be populated with sensor data

  int bodyTemp[] = {13, 14, 15, 16, 17, 18, 19, 15, 13, 12};

  int respirationRate[] = {13, 14, 15, 16, 17, 18, 19, 15, 13, 12};

 

  // Creating JSON document

  StaticJsonDocument<200> jsonDocument;

  JsonArray heartRateArray = jsonDocument.createNestedArray("heart_rate");

  JsonArray bodyTempArray = jsonDocument.createNestedArray("oxygen_level");

  JsonArray respirationRateArray = jsonDocument.createNestedArray("step_count");

 

  for (int i = 0; i <= (sizeof(heartRate)+1) / sizeof(heartRate[0]); i++) {

    heartRateArray.add(heartRate[i]);

  }

 

  for (int i = 0; i <= sizeof(bodyTemp) / sizeof(bodyTemp[0]); i++) {

    bodyTempArray.add(bodyTemp[i]);

  }

 

  for (int i = 0; i <= sizeof(respirationRate) / sizeof(respirationRate[0]); i++) {

    respirationRateArray.add(respirationRate[i]);

  }

 

  // Create a JSON string

  String jsonPayload;

  serializeJson(jsonDocument, jsonPayload);

 

  // Create an HTTP client object

  WiFiClient client;

 

  // Connect to the server

  if (client.connect(serverAddress, serverPort)) {

    // Make an HTTP POST request

    client.print("POST /healthData?user_id=");

    client.print(userId);

    client.println(" HTTP/1.1");

    client.println("Host: " + String(serverAddress));

    client.println("Authorization: " + String(authToken));

    client.println("Content-Type: application/json");

    client.println("Content-Length: " + String(jsonPayload.length()));

    client.println();

    client.println(jsonPayload);

 

    // Wait for the server to finish and close the connection

    delay(1000);

    client.stop();

  } else {

    Serial.println("Error connecting to server");

  }

}

 

void loop() {

// Information from the readBpm function will be saved to our "body"

    // variable.

    int arraySize = 0;

 

    while (arraySize < 10){

   

    body = bioHub.readBpm();

    Serial.print("Heartrate: ");

    Serial.println(body.heartRate);

    Serial.print("Status: ");

    Serial.println(body.status);

 

    // Slow it down or your heart rate will go up trying to keep up

    // with the flow of numbers

    delay(450);

 

    if ((body.heartRate != 0)

       &&(body.status ==3)){

    heartRate[arraySize] = body.heartRate;

    arraySize++;

    }

  }

  Serial.print("Heartrate data found");

 

  sendHttpRequest(userId);

  delay(1500);

}