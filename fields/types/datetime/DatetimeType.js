var moment = require('moment');
var DateType = require('../date/DateType');
var FieldType = require('../Type');
var util = require('util');
var _ = require('underscore');

/**
 * DateTime FieldType Constructor
 * @extends Field
 * @api public
 */
function datetime(list, path, options) {
	this._nativeType = Date;
	this._underscoreMethods = ['format', 'moment', 'parse'];
	this._fixedSize = 'large';
	this._properties = ['formatString', 'dateFormat', 'timeFormat'];
	this.typeDescription = 'date and time';

	this.dateFormat = options.dateFormat || 'YYYY-MM-DD';
	this.timeFormat = options.timeFormat || 'h:mm a';
	this.formatString = (options.format === false) ? false : (options.format || this.dateFormat + ' ' + this.timeFormat);

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
	
	if(!!dateValue){
		if(timeValue){
			return moment.utc(dateValue + ' ' + timeValue + ' ' + tzOffsetValue, this.dateFormat + ' ' + this.timeFormat + ' Z');
		}
		return moment(dateValue, this.dateFormat).utc();

	}else if (data[this.path]){
		return moment.utc(this.get(this.path), this.formatString);
	}

	return null;
};

/**
 * Checks that a valid date has been provided in a data object
 * An empty value clears the stored value and is considered valid
 */
datetime.prototype.validateInput = function(data, required, item) {
	
	var mValue = this.getInputFromData(data);
	
	if(!!mValue){
		return mValue.isValid();
	}else if(required){
		return false;
	}
	
	return true;

};

/**
 * Updates the value for this field in the item from a data object
 */
datetime.prototype.updateItem = function(item, data) {
	var mValue = this.getInputFromData(data);
	
	var oldValue = item.get(this.path);
	if(mValue){
		if(!mValue.isSame(oldValue)){
			item.set(this.path, mValue.toDate());
		}
	}else if(oldValue){
		item.set(this.path, null);
	}
	
};

/* Export Field Type */
exports = module.exports = datetime;
