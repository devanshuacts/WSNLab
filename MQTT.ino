#include"Adafruit_MQTT.h"         // Adafruit APIs for MQTT server talks
#include"Adafruit_MQTT_Client.h"  // Board Specification APIs are defined inside this one
#include <ESP8266WiFi.h>


  WiFiClient client1;
 /*------------------------------------------------------------
     * Arguments: 
     * 1. Address of WiFiClient Object 
     * 2. Port Address : 1883 or 8883 
     * 3. Username of the Adafruit A/c (String)
     * 4. API Key value from the A/c (String)
     *-------------------------------------------------------------*/   
     char NAME[]="diot1111";
     char API_KEY[]="907e5bc7352647448d584daaec156602";
     char URL[]="io.adafruit.com";
     Adafruit_MQTT_Client mqtt(&client1,URL,1883,NAME,API_KEY);


  /*-----------------------------------------------------------
     * Arguments
     * 1. Address of the Adafruit_MQTT_Client
     * 2. Adafruit Username
     * 3. link of the 'Feeds' we have cretaed in Adafruit
     * 4. MQTT_QoS_0/1/2 => Quality of Service (Optional)
     *------------------------------------------------------------*/
   Adafruit_MQTT_Publish mypub=Adafruit_MQTT_Publish(&mqtt,"diot1111/feeds/status");
   
   Adafruit_MQTT_Subscribe mysub=Adafruit_MQTT_Subscribe(&mqtt,"diot1111/feeds/switch");



void setup() {
  // put your setup code here, to run once:
  pinMode(5,OUTPUT);
  
  WiFi.begin("Android","12435687");
  Serial.begin(115200);
  
  while(WiFi.status() != WL_CONNECTED)
    {
      Serial.println("Connecting");
      delay(1000);
    }
   
  Serial.println(LED_BUILTIN);
   /*--------------------------------------------------------------
    * String Pool Note
    * Serail.println(F("")) will be stored in Flash memory
    */

    //Printg the Local IP
    Serial.println(WiFi.localIP());
    
    //Subcsribe to topic Feed
    mqtt.subscribe(&mysub);

    mqtt.connect();
}

void loop() {
  // put your main code here, to run repeatedly:
       
   if(mqtt.connected())
   {
                /*---------------------------------------------------------
             * publisher code: 
             * 5 Max subscription 
             *  To change goto HEader file 
             *      "#define MAXSUBSCRIBE 5"
             */
        Serial.println("MQTT Connected");     
   }
   else if(mqtt.connect()==0)
   {
      Serial.println("Connecting to the MQTT....");    
   }
             Serial.println("MQTT Connected");
             //mypub.publish("hi");
             Adafruit_MQTT_Subscribe *sub;
             while(sub=mqtt.readSubscription(5000))
             {  
                if(sub==&mysub)
                {
                  if(strcmp((char *)mysub.lastread,"ON")==0)
                  {
                    
                  Serial.println("LED is on");
                  Serial.println((char*)mysub.lastread);
                  digitalWrite(5,HIGH);
                  }
                  else 
                  {
                  Serial.println("LED off");
                  analogWrite(5,LOW);
                  }
                  }
             }  
   Serial.println(".");
   delay(1000);  
}
