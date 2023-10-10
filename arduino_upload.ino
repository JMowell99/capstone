/*
This is on the github for the purpose of giving the rest of the team access to this code.
It does not yet "work" but it does at least upload data to the website, just not properly formatted.
I am going to come back to this later and get a working version
*/ 


#include <ArduinoJson.h>
#include <WiFi.h>

const char* ssid = "Pixel_5907";
const char* password = "JesseMowell";

const char* serverAddress = "192.168.247.243";
const int serverPort = 3906;
const char* authToken = "Bearer ECE3906";

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");

  // Example usage of sendHttpRequest function with user_id parameter
  int userId = 1;
  sendHttpRequest(userId);
}

void sendHttpRequest(int userId) {
  // In the final code, these arrays will be populated with sensor data
  int heartRate[] = {72, 88, 97, 104, 118, 139, 136, 145, 159, 179};
  float bodyTemp[] = {97, 97.5, 98, 98.5, 99, 99.5, 100, 100.2, 96.4, 97.8};
  int respirationRate[] = {13, 14, 15, 16, 17, 18, 19, 15, 13, 12};

  // Creating JSON document
  StaticJsonDocument<200> jsonDocument;
  JsonArray heartRateArray = jsonDocument.createNestedArray("heart_rate");
  JsonArray bodyTempArray = jsonDocument.createNestedArray("body_temp");
  JsonArray respirationRateArray = jsonDocument.createNestedArray("respiration_rate");

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

}