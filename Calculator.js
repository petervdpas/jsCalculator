/*
 * TODO: Check bug operator switch without entering a new digit... 
 * uses old result as memroy...
 */
function Calculator(output_size, rld, debug) {

	this.debug = debug;
	this.use_reload = rld;
	
	this.result = 0;
	this.memory = 0;
	this.memory_save = 0;

	this.last_digit = null;
	this.last_operation = null;
	this.saved_operation = null;
	
	this.new_digit = false;
	this.computed = false;
	this.ongoing = false;
	this.float = false;
	this.digit_count = 0;
	
	this.output_size = output_size;
	
	this.operations = [
		'clear', 
		'percent', 
		'negative', 
		'.',
		'plus', 
		'minus', 
		'divide', 
		'multiply', 
		'compute'
	];
}

Calculator.prototype.compute = function(btn) {
	var _this = this;
	
	switch(  _this.checkOperation(btn) ) {
		
		case 0:
			// clear
			_this.clear();
			break;
			
		case 1:
			// percent
			_this.result *= 0.01;
			break;
			
		case 2:
			// negative
			_this.result *= -1;
			break;
				
		case 3:
			// float
			if (!_this.float) {
				if ( (_this.digit_count < 9) && (!_this.computed) ) {
					_this.result = _this.result + btn;
					_this.computed = false;
					_this.new_digit = true;
				}
				_this.ongoing = false;
				_this.float = true;
			}
			break;
				
		case 4:
			// plus
			_this.do(btn);
			break;
			
		case 5:
			// minus
			_this.do(btn);
			break;
			
		case 6:
			// divide
			_this.do(btn);
			break;
			
		case 7:
			// multiply
			_this.do(btn);
			break;
			
		case 8:
			// compute
			
			var switched = _this.operatorSwitched();
			
			if ( switched ) {
				_this.result = _this.memory_save;
			}

			if ( _this.result === 0 ) {
				
				if ( _this.digit_count === 0 ) {
					_this.memory_save = _this.memory;
				}
				
				_this.result = _this.memory_save;
				
				if (_this.ongoing) {
					_this.ongoing = false;
				}
			}
			
			if (_this.new_digit) {
				_this.memory_save = _this.result;
				_this.new_digit = false;
			} else {
				if (!switched) {
					_this.memory = _this.result;
					_this.result = _this.memory_save;	
				}
			}
			
			switch( _this.checkOperation(_this.last_operation) ) {
				case 4:
					// plus
					_this.result = _this.memory + _this.result;
					break;
				case 5:
					// minus
					_this.result = _this.memory - _this.result;
					break;
				case 6:
					// divide
					_this.result = _this.memory / _this.result;
					break;
				case 7:
					// multiply
					_this.result = _this.memory * _this.result;
					break;
				default:
					break;
			}
			
			_this.result = _this.round(_this.result, 9);
			_this.memory = _this.round(_this.memory, 9);
			
			_this.saved_operation = _this.last_operation;
			_this.digit_count = 9;
			_this.computed = true;
			break;
			
		default:
			// keypad
			if ( (_this.digit_count < 9) && (!_this.computed) ) {
				_this.result = 
					Number(_this.result.toString() + _this.zeroCheck(btn));
					
				_this.digit_count++;
				_this.computed = false;
				_this.new_digit = true;
			}
			_this.ongoing = false;
			break;
	}

	_this.last_digit = btn;
	
	if ( _this.debug ) {
		_this.bugMonitor();
	}
}

Calculator.prototype.bugMonitor = function() {
	var _this = this;
	
	if ( console &&
		(typeof console !== 'undefined') &&
		(typeof console.log !== 'undefined') ) {
			
		console.log("result: " + _this.result);
		console.log("memory: " + _this.memory);
		console.log("memory-save: " + _this.memory_save);
		console.log("current operation: " + _this.last_operation);
		console.log("saved operation: " + _this.saved_operation);
		console.log("float: " + _this.float);
		console.log("digit-count: " + _this.digit_count);
		console.log("ongoing: " + _this.ongoing);
		console.log("new-digit: " + _this.new_digit);
		console.log("---------------------------------------------");
	}
}

Calculator.prototype.do = function(btn) {
	var _this = this;
	
	_this.new_digit = false;
	_this.computed = false;
	
	if (!_this.ongoing) {
		_this.ongoing = true;
	}
	
	_this.float = false;
	_this.digit_count = 0;
	
	_this.saved_operation = _this.last_operation;
	_this.last_operation = btn;
	
	if (_this.last_digit === '.') {
		_this.result = Number(_this.result.toString().replace(/\.$/, ''));
	}
	
	_this.memory = _this.result;
	
	_this.result = 0;
}

Calculator.prototype.display = function() {
	var _this = this;
	
	var output = null;
	
	if ( _this.ongoing ) {
		output = _this.memory;
	} else {
		output = _this.result;
	}
	
	if ( output.toString().length > Number(_this.output_size + 2) ) {
		output = output.toExponential(_this.output_size/2);
	}
	
	return output;
}

Calculator.prototype.memoryDisplay = function() {
	var _this = this;
	
	var output = _this.memory;
	
	if ( output.toString().length > Number(_this.output_size + 2) ) {
		output = output.toExponential(_this.output_size/2);
	}
	
	return output;
}


Calculator.prototype.operation = function() {
	var _this = this;
	
	var op = "";
	
	switch( _this.checkOperation(_this.last_operation) ) {
		case 4:
			// plus
			op = "&#43;"; //"&plus;"; //IE fix
			break;
		case 5:
			// minus
			op = "&#45;";
			break;
		case 6:
			// divide
			op = "&#247;";
			break;
		case 7:
			// multiply
			op = "&#215;";
			break;
		default:
			break;
	}
	
	return op;
	
}

Calculator.prototype.operatorSwitched = function() {
	var _this = this;
	
	var switched = false;
	
	if ( (_this.digit_count === 0) && 
			(_this.saved_operation !== null) &&
			(_this.saved_operation !== _this.last_operation) ) {
		switched = true;
	}
	
	return switched;
}

Calculator.prototype.checkOperation = function(btn) {
	var _this = this;
	return _this.operations.indexOf(btn);
}

Calculator.prototype.zeroCheck = function(btn) {
	var _this = this;
	
	if (_this.result === '0' && !(btn === '.')) {
		return btn;
	} else {
		if ( !((_this.last_digit === btn) && (btn === '.')) ) {
			return btn;
		}
	}
	
	return null;
}

Calculator.prototype.clear = function() {
	var _this = this;
	
	if (!_this.use_reload) {

		_this.result = 0;
		_this.memory = 0;
		_this.memory_save = 0;

		_this.last_digit = null;
		_this.last_operation = null;
		_this.saved_operation = null;
	
		_this.new_digit = false;
		_this.computed = false;
		_this.ongoing = false;
		_this.float = false;
		_this.digit_count = 0;
		
		return;
	}

	
	window.location.reload();
}

Calculator.prototype.round = function(value, places) {
    var multiplier = Math.pow(10, places);
    return (Math.round(value * multiplier) / multiplier);
}
