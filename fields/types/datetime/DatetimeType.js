var moment = require('moment');
var DateType = require('../date/DateType');
var FieldType = require('../Type');
var util = require('util');
var _ = require('underscore');

// ISO_8601 is needed for the automatically created createdAt and updatedAt fields
var parseFormats = ['YYYY-MM-DD', 'YYYY-MM-DD h:m:s a', 'YYYY-MM-DD h:m a', 'YYYY-MM-DD H:m:s', 'YYYY-MM-DD H:m', 'YYYY-MM-DD h:mm:s a Z', moment.ISO_8601];

/**
 * DateTime FieldType Constructor
 * @extends Field
 * @api public
 */
function datetime(list, path, options) {
	this._nativeType = Date;
	this._underscoreMethods = ['format', 'moment', 'parse'];
	this._fixedSize = 'large';
	this._properties = ['formatString', 'dateFormat', 'timeFormat', 'datePlaceholder', 'timePlaceholder', 'isUTC'];
	this.typeDescription = 'date and time';
	this.parseFormatString = options.parseFormat || parseFormats;
	this.formatString = (options.format === false) ? false : (options.format || 'YYYY-MM-DD h:mm:ss a');
	this.tzFormatString = 'Z';

	// Create an array of moment time format characters to help find where the time portion of the format string beings
	var timeOptions = ['h', 'H', 'm', 's', 'S'];
	var timeIndex = -1;

	var that = this;

	if(this.formatString) {
		// Loop through each moment time format character to determine which begins the time portion of format to segregate date from time
		_.each(timeOptions, function(timeChar) {
			var charIndex = that.formatString.indexOf(timeChar);

			if((charIndex !== -1 && charIndex < timeIndex) || (charIndex !== -1 && timeIndex === -1)) {
				timeIndex = charIndex;
			}
		});

		this.dateFormat = this.formatString.slice(0, timeIndex).trim();
		this.timeFormat = this.formatString.slice(timeIndex).trim();
		this.datePlaceholder = 'e.g. ' + moment().format(this.dateFormat);
		this.timePlaceholder = 'e.g. ' + moment().format(this.timeFormat);

	} else {
		this.dateFormat = '';
		this.timeFormat = '';
		this.datePlaceholder = '';
		this.timePlaceholder = '';
	}

	if (this.formatString && 'string' !== typeof this.formatString) {
		throw new Error('FieldType.DateTime: options.format must be a string.');
	}
	datetime.super_.call(this, list, path, options);
	this.paths = {
		date: this._path.append('_date'),
		time: this._path.append('_time'),
		tzOffset: this._path.append('_tzOffset'),
	};
}
util.inherits(datetime, FieldType);

/* Inherit from DateType prototype */
datetime.prototype.addFilterToQuery = DateType.prototype.addFilterToQuery;
datetime.prototype.format = DateType.prototype.format;
datetime.prototype.moment = DateType.prototype.moment;
datetime.prototype.parse = DateType.prototype.parse;

/**
 * Get the value from a data object; may be simple or a pair of fields
 */
datetime.prototype.getInputFromData = function(data) {
	var dateValue = data[this.paths.date];
	var timeValue = data[this.paths.time];
	var tzOffsetValue = data[this.paths.tzOffset];
	if (dateValue && timeValue) {
		return dateValue.trim() + ' ' + timeValue.trim() + ' ' + tzOffsetValue;
	}

	return data[this.path];
};

/**
 * Checks that a valid date has been provided in a data object
 * An empty value clears the stored value and is considered valid
 */
datetime.prototype.validateInput = function(data, required, item) {
	var value = this.getInputFromData(data);
	
	if(!!value){
		return moment(value, parseFormats).isValid();
	}else if(required){
		return false;
	}
	
	return true;

};

/**
 * Updates the value for this field in the item from a data object
 */
datetime.prototype.updateItem = function(item, data) {
	var value = this.getInputFromData(data);
	var oldValue = item.get(this.path);
	if(value){
		var mValue = moment(value, this.formatString + ' ' + this.tzFormatString).utc();
		if(!mValue.isSame(oldValue)){
			item.set(this.path, mValue.toDate());
		}
	}else if(oldValue){
		item.set(this.path, null);
	}
	
};

/* Export Field Type */
exports = module.exports = datetime;
