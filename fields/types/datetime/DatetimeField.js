var React = require('react');
var Field = require('../Field');
var Note = require('../../components/Note');
var DateInput = require('../../components/DateInput');
var moment = require('moment');

module.exports = Field.create({

	displayName: 'DatetimeField',

	focusTargetRef: 'dateInput',
	tzOffsetInputFormat: 'Z',

	getInitialState: function() {
		if(this.props.value){
			var t = moment.utc(this.props.value).local();
			return {
				dateValue: t.format(this.props.dateFormat),
				timeValue: t.format(this.props.timeFormat),
				tzOffsetValue: t.format(this.tzOffsetInputFormat),
			}
		}
		return {
			dateValue: '',
			timeValue: '',
			tzOffsetValue: moment().format(this.tzOffsetInputFormat),
		};
	},

	getDefaultProps: function() {
		return {
			formatString: 'YYYY-MM-DD h:mm a'
		};
	},

	// TODO: Move isValid() so we can share with server-side code
	isValid: function(value) {
		return moment(value, this.parseFormats).isValid();
	},

	format: function(value, format) {
		format = format || this.props.dateFormat + ' ' + this.props.timeFormat;
		return value ? moment.utc(value).local().format(format) : '';
	},

	handleChange: function(dateValue, timeValue, tzOffsetValue) {
		var value = dateValue + ' ' + timeValue + ' ' + tzOffsetValue;
		var datetimeFormat = this.props.dateFormat + ' ' + this.props.timeFormat + ' ' + this.tzOffsetInputFormat;
		this.props.onChange({
			path: this.props.path,
			value: this.isValid(value) ? moment(value, datetimeFormat).toISOString() : null
		});
	},

	dateChanged: function(value) {
		this.setState({ dateValue: value });
		this.handleChange(value, this.state.timeValue, this.state.tzOffsetValue);
	},

	timeChanged: function(event) {
		this.setState({ timeValue: event.target.value });
		this.handleChange(this.state.dateValue, event.target.value, this.state.tzOffsetValue);
	},

	setNow: function() {
		var dateValue = moment().format(this.props.dateFormat);
		var timeValue = moment().format(this.props.timeFormat);
		var tzOffsetValue = moment().format( this.tzOffsetInputFormat );
		this.setState({
			dateValue: dateValue,
			timeValue: timeValue,
			tzOffsetValue: tzOffsetValue
		});
		this.handleChange(dateValue, timeValue, tzOffsetValue);
	},

	renderUI: function() {
		var input;
		var fieldClassName = 'field-ui';
		if (this.shouldRenderField()) {
			input = (
				<div className={fieldClassName}>
					<DateInput ref="dateInput" name={this.props.paths.date} value={this.state.dateValue} placeholder={this.props.datePlaceholder} format={this.props.dateFormat} onChange={this.dateChanged} />
					<input type="text" name={this.props.paths.time} value={this.state.timeValue} placeholder={this.props.timePlaceholder} onChange={this.timeChanged} autoComplete="off" className="form-control time" />
					<input type="hidden" name={this.props.paths.tzOffset} value={this.state.tzOffsetValue}/>
					<button type="button" className="btn btn-default btn-set-now" onClick={this.setNow}>Now</button>
				</div>
			);
		} else {
			input = (
				<div className={fieldClassName}>
					<div className="field-value">{this.format(this.props.value, this.props.formatString)}</div>
				</div>
			);
		}
		return (
			<div className="field field-type-datetime">
				<label className="field-label">{this.props.label}</label>
				{input}
				<div className="col-sm-9 col-md-10 col-sm-offset-3 col-md-offset-2 field-note-wrapper">
					<Note note={this.props.note} />
				</div>
			</div>
		);
	}
});
