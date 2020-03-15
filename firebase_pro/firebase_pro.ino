#include <ESP8266WiFi.h>
#include <FirebaseArduino.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Servo.h>

// Set these to run example.
#define FIREBASE_HOST "iotguy-dashboard.firebaseio.com"
#define FIREBASE_AUTH "bU4LQXXorSR3yyn3rPpGJFaWN6YxrrJWpMHRCB7T"
#define WIFI_SSID "Silver Lions Zone"
#define WIFI_PASSWORD "science@123"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

Servo myservo;  // create servo object to control a servo

String prefix="users/pjhWgVd2zchhI1Ymw4AduinBdw13/";
int ldrValue=0;
int pos=0;
int lastPos=0;
String ldr, distance, p;
const int red= D5;
const int green= D6;
const int trigPin = D3;
const int echoPin = D4;
const int buttonPin = D7;

void setup() {
  Serial.begin(115200);
  
  pinMode(A0, INPUT); 
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(trigPin, OUTPUT);  // Sets the trigPin as an Output
  pinMode(echoPin, INPUT);  // Sets the echoPin as an Input
  pinMode(buttonPin,INPUT_PULLUP);

  myservo.attach(D8);  // attaches the servo on D8 to the servo object

  //OLED SETUP
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C); /* Initialize display with address 0x3C */
  display.clearDisplay();  /* Clear display */
  display.setTextSize(2);  /* Select font size of text. Increases with size of argument. */
  display.setTextColor(WHITE);  /* Color of text*/
  
  // connect to wifi.
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("connecting");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("connected: ");
  Serial.println(WiFi.localIP());
  
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void loop() {

  digitalWrite(red, Firebase.getInt(prefix+"red-led"));
  digitalWrite(green, Firebase.getInt(prefix+"green-led"));
  pos= Firebase.getInt(prefix+"servo");
  if(pos != lastPos){
    Serial.println("SERVO POSITION: "+pos);
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    lastPos=pos;    
  }
  // set ultrasonic values
  int first = triggerRadar(trigPin,echoPin);
  Firebase.setInt(prefix+"ultrasonic/first", first);
  delay(100);
  int second = triggerRadar(trigPin,echoPin);
  Firebase.setInt(prefix+"ultrasonic/second", second);
  delay(100);
  int third = triggerRadar(trigPin,echoPin);
  Firebase.setInt(prefix+"ultrasonic/third", third);
  delay(100);
  int fourth = triggerRadar(trigPin,echoPin);
  Firebase.setInt(prefix+"ultrasonic/fouth", fourth);
  delay(100);
  int fifth = triggerRadar(trigPin,echoPin);
  Firebase.setInt(prefix+"ultrasonic/fifth", fifth);
  delay(100);
  ldrValue = analogRead(A0);   // read the ldr input on analog pin 0
  Firebase.setInt(prefix+"ldr", ldrValue);
  // handle error
  if (Firebase.failed()) {
      Serial.print("setting failed with error:");
      Serial.println(Firebase.error());  
      return;
  }
  ldr= String(ldrValue);
  distance= String(fifth);
  p = String(pos);
  Serial.println("LDR: "+ldr+" || Dist: "+distance+" || Pos: "+p);
  updateOLED(ldr,distance,p);/* Update OLED Every second and display */
}
void updateOLED(String ldr, String d, String pos){
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("LDR:"+ldr);
  
  display.setCursor(0, 25);
  display.println("DIST:"+d);

//  display.setCursor(0, 30);
//  display.println("POS: "+pos);
  display.display();
}
int triggerRadar(int trigPin, int echoPin){
  String dist;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  int d = duration*0.0343/2;
  return d;
}
