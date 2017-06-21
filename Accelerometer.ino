int const x = A3;
int const y = A2;
int const z = A1;

//int xval = yval = zval = 0;
int xyzval[3] = {0};
char cval[3];
int temp1 = 0;

void setup() {
 // put your setup code here, to run once:
  Serial.begin(9600);

}

void loop() {
  // put your main code here, to run repeatedly:
  xyzval[0] = analogRead(x);
  /*cval[0] = xyzval[0] / 100 - 48;
  temp1 = xyzval[0] % 100;
  cval[1] = temp1 / 10 - 48;
  cval[2] = temp1 % 10 - 48;*/
  
  xyzval[1] = analogRead(y);
  xyzval[2] = analogRead(z);
  
//  Serial.write("x: " xyzval[0], "y: ", xyzval[1], "z: ", xyzval[2]);
  Serial.print("x val = :");
  Serial.print(xyzval[0]);
  Serial.print("\n");
  Serial.print("y val = :");
  Serial.print(xyzval[1]);
  Serial.print("\n");
  Serial.print("z val = :");
  Serial.print(xyzval[2]);
  Serial.print("\n");
  /*Serial.write("x val = :");
  Serial.write(cval[0]);
  Serial.write(cval[1]);
  Serial.write(cval[2]);
  Serial.write("\n");
  Serial.write("y val = :");
  Serial.write(xyzval[1]);
  Serial.write("\n");
  Serial.write("z val = :");
  Serial.write(xyzval[2]);
  Serial.write("\n");*/
  delay(500);  

}
