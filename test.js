var util = require('util');

var bleno = require('./index');

var gpio = require('rpi-gpio')

var SerialPort = require('serialport');

var xyz = 0;
var axisval;
var xval = 0, yval = 0, zval = 0;
function readSerial(axis) {
	axisval = axis; 
	var port = new SerialPort('/dev/ttyACM0', {
		parser: SerialPort.parsers.readline('\n')
	});

	port.on('data', function (data) {
		xyz = data;
		//console.log('Data of length ' + xyz.length + ' ' + xyz);
		if(xyz.length == 12){
			if(xyz[0] == 'x'){
				xval = (parseInt(xyz[9], 10)*100) + (parseInt(xyz[10], 10)*10) + parseInt(xyz[11], 10)
				//console.log('data = ' + xyz + ' and xval = ' + xval);
			}
			else if(xyz[0] == 'y'){
				yval = (parseInt(xyz[9], 10)*100) + (parseInt(xyz[10], 10)*10) + parseInt(xyz[11], 10)
				//console.log('data = ' + xyz + ' and yval = ' + yval);
			}
			else if(xyz[0] == 'z'){
				zval = (parseInt(xyz[9], 10)*100) + (parseInt(xyz[10], 10)*10) + parseInt(xyz[11], 10)
				//console.log('data = ' + xyz + ' and zval = ' + zval);
			}
		}
		if(port.isOpen() == true)
			port.close()
	});
}

function writeon() {
	gpio.write(7, true, function(err) {
		if(err) throw err;
		console.log('LED on') 
	});
}

function writeoff() {
	gpio.write(7, false, function(err) {
		if(err) throw err;
		console.log('LED off') 
	});
}


var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

console.log('bleno');

var StaticReadOnlyCharacteristic = function() {
  StaticReadOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff1',
    properties: ['read'],
    value: new Buffer('value'),
    descriptors: [
      new BlenoDescriptor({
        uuid: '2901',
        value: 'user description'
      })
    ]
  });
};
util.inherits(StaticReadOnlyCharacteristic, BlenoCharacteristic);

var DynamicReadOnlyCharacteristic = function() {
  DynamicReadOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff2',
    properties: ['read']
  });
};

util.inherits(DynamicReadOnlyCharacteristic, BlenoCharacteristic);

DynamicReadOnlyCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var result = this.RESULT_SUCCESS;
  var data = new Buffer('dynamic value');

  if (offset > data.length) {
    result = this.RESULT_INVALID_OFFSET;
    data = null;
  } else {
    data = data.slice(offset);
  }

  callback(result, data);
};

var LongDynamicReadOnlyCharacteristic = function() {
  LongDynamicReadOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff3',
    properties: ['read']
  });
};

util.inherits(LongDynamicReadOnlyCharacteristic, BlenoCharacteristic);

LongDynamicReadOnlyCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var result = this.RESULT_SUCCESS;
  var data = new Buffer(512);

  for (var i = 0; i < data.length; i++) {
    data[i] = i % 256;
  }

  if (offset > data.length) {
    result = this.RESULT_INVALID_OFFSET;
    data = null;
  } else {
    data = data.slice(offset);
  }

  callback(result, data);
};

var WriteOnlyCharacteristic = function() {
  WriteOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff4',
    properties: ['write', 'writeWithoutResponse']
  });
};

util.inherits(WriteOnlyCharacteristic, BlenoCharacteristic);

WriteOnlyCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  console.log('WriteOnlyCharacteristic write request: ' + data.toString('hex') + ' ' + offset + ' ' + withoutResponse);

  callback(this.RESULT_SUCCESS);
};

var NotifyOnlyCharacteristic = function() {
  NotifyOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff5',
    properties: ['notify']
  });
};

util.inherits(NotifyOnlyCharacteristic, BlenoCharacteristic);

NotifyOnlyCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('NotifyOnlyCharacteristic subscribe');

  this.counter = 0;
  this.changeInterval = setInterval(function() {
    var data = new Buffer(4);
    data.writeUInt32LE(this.counter, 0);

    console.log('NotifyOnlyCharacteristic update value: ' + this.counter);
    updateValueCallback(data);
    this.counter++;
  }.bind(this), 5000);
};

NotifyOnlyCharacteristic.prototype.onUnsubscribe = function() {
  console.log('NotifyOnlyCharacteristic unsubscribe');

  if (this.changeInterval) {
    clearInterval(this.changeInterval);
    this.changeInterval = null;
  }
};

NotifyOnlyCharacteristic.prototype.onNotify = function() {
  console.log('NotifyOnlyCharacteristic on notify');
};

var IndicateOnlyCharacteristic = function() {
  IndicateOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff6',
    properties: ['indicate']
  });
};

util.inherits(IndicateOnlyCharacteristic, BlenoCharacteristic);

IndicateOnlyCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('IndicateOnlyCharacteristic subscribe');

  this.counter = 0;
  this.changeInterval = setInterval(function() {
    var data = new Buffer(4);
    data.writeUInt32LE(this.counter, 0);

    console.log('IndicateOnlyCharacteristic update value: ' + this.counter);
    updateValueCallback(data);
    this.counter++;
  }.bind(this), 1000);
};

IndicateOnlyCharacteristic.prototype.onUnsubscribe = function() {
  console.log('IndicateOnlyCharacteristic unsubscribe');

  if (this.changeInterval) {
    clearInterval(this.changeInterval);
    this.changeInterval = null;
  }
};

IndicateOnlyCharacteristic.prototype.onIndicate = function() {
  console.log('IndicateOnlyCharacteristic on indicate');
};

var MyLEDGlowCharacteristic = function() {
  WriteOnlyCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffffa',
    properties: ['write', 'writeWithoutResponse']
  });
};

util.inherits(MyLEDGlowCharacteristic, BlenoCharacteristic);

MyLEDGlowCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  console.log('MyLEDGlowCharacteristic write request: ' + data.toString('hex') + ' ' + offset + ' ' + withoutResponse);
  if(data.toString('hex') == '31')
	gpio.setup(7, gpio.DIR_OUT, writeon)
  else
	gpio.setup(7, gpio.DIR_OUT, writeoff)
  callback(this.RESULT_SUCCESS);
};

var MySensorReadCharacteristic = function() {
    MySensorReadCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffffb',
    properties: ['read']
  });
};
util.inherits(MySensorReadCharacteristic, BlenoCharacteristic);

MySensorReadCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var result = this.RESULT_SUCCESS;
  console.log('result bfore= '+result);
  var data = new Buffer(16);
  var dataval;
  if(axisval == 'x')
    dataval = xval;
  else if(axisval == 'y')
    dataval = yval;
  else if(axisval == 'z')
    dataval = zval;

  if (offset > data.length) {
    result = this.RESULT_INVALID_OFFSET;
    data = null;
  } else {
    data = Buffer.from(dataval.toString());
  }
  console.log('result= '+result+' offset = '+offset+' data= '+data)
  callback(result, data);
};

var MySensorWriteCharacteristic = function() {
  MySensorWriteCharacteristic.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffffc',
    properties: ['write', 'writeWithoutResponse']
  });
};
util.inherits(MySensorWriteCharacteristic, BlenoCharacteristic);

MySensorWriteCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  var axis = data.toString();
  console.log('MySensorWriteCharacteristic write request: ' + axis + ' ' + offset + ' ' + withoutResponse);

  callback(this.RESULT_SUCCESS);
  readSerial(axis);
  //console.log(xyz);
};

function SampleService() {
  SampleService.super_.call(this, {
    uuid: 'fffffffffffffffffffffffffffffff0',
    characteristics: [
      new StaticReadOnlyCharacteristic(),
      new DynamicReadOnlyCharacteristic(),
      new LongDynamicReadOnlyCharacteristic(),
      new WriteOnlyCharacteristic(),
      new NotifyOnlyCharacteristic(),
      new IndicateOnlyCharacteristic(),
      new MyLEDGlowCharacteristic(),
      new MySensorReadCharacteristic(),
      new MySensorWriteCharacteristic()
    ]
  });
}

util.inherits(SampleService, BlenoPrimaryService);

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state + ', address = ' + bleno.address);

  if (state === 'poweredOn') {
    bleno.startAdvertising('dev', ['ffffffffffffffffffffffffffffff04']);
  } else {
    bleno.stopAdvertising();
  }
});

// Linux only events /////////////////
bleno.on('accept', function(clientAddress) {
  console.log('on -> accept, client: ' + clientAddress);

  bleno.updateRssi();
});

bleno.on('disconnect', function(clientAddress) {
  console.log('on -> disconnect, client: ' + clientAddress);
});

bleno.on('rssiUpdate', function(rssi) {
  console.log('on -> rssiUpdate: ' + rssi);
});
//////////////////////////////////////

bleno.on('mtuChange', function(mtu) {
  console.log('on -> mtuChange: ' + mtu);
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new SampleService()
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});

bleno.on('servicesSet', function(error) {
  console.log('on -> servicesSet: ' + (error ? 'error ' + error : 'success'));
});
