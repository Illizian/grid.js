/*
 * @Author: alex
 * @Date:   2014-05-24 00:42:19
 * @Last Modified by:   alex
 * @Last Modified time: 2014-05-24 11:39:37
 */

/**
 * The Grid Class
 *
 * @param {HTMLElement|String} *el                    The Grid HTMLelement or a selector as a string.
 * @param {Object}             *options               An Object with the options you want to overwrite:
 *     @param {Number}         *options.margins       Margins between widgets in px
 *     @param {Number}         *options.min_columns   The minimum number of columns
 *     @param {Number}         *options.max_columns   The maximum number of columns
 *     @param {Number}         *options.min_col_width The maximum number of columns
 */
var Grid = function(el, options) {
	logger('Grid#new');
	if(!options) 	options = {};
	if(!el)			el = '#grid-container';

	// Cache the element
	this.$el = $(el);

	// Default options
	this.options = {
		margins: 10,
		min_columns: 1,
		max_columns: 12,
		min_col_width: 140
	};
	// Extend default options with specified ones
	$.extend(this.options, options);
};
Grid.prototype.init = function() {
	logger('Grid#init()');

	// Add Event Handlers to the window
    $(window).on("resize.end", this.update.bind(this));
    $(window).on("mousedown", this.mousedown.bind(this));

	this.update();
};

/**
 * Call this to refresh the grid, you can optionally specify new options.
 *
 * @param {Object}      *options               An Object with the options you want to overwrite:
 *     @param {Number}  *options.margins       Margins between widgets in px
 *     @param {Number}  *options.min_columns   The minimum number of columns
 *     @param {Number}  *options.max_columns   The maximum number of columns
 *     @param {Number}  *options.min_col_width The maximum number of columns
 */
Grid.prototype.update = function(options) {
	logger('Grid#update()');
	if(!options) options = {};
	$.extend(this.options, options);

	this.width = this.$el.width();
	this.height = this.$el.height();
	logger('Grid height: '+ this.height +' width: '+ this.width);

	// Clear the current cells
	this.cells = [];
	// Generate new cells
	this.generateCells();
	// And assign widgets to grid again
	this.autoAssignWidgets();
};

/**
 * calculates the 'best fit' based on the options and number of widgets and creates the
 * cells to house the widgets
 */
Grid.prototype.generateCells = function() {
	logger('Grid#generateCells()');
	// Calculate "best fit" by iterating
	var widgets = this.$el.find('.widget').length;
	var columns = this.options.max_columns;
	var width   = Math.floor((this.width-this.options.margins) / columns);
	while(width < this.options.min_col_width && columns !== this.options.min_columns) {
		columns--;
		width = Math.floor((this.width-this.options.margins) / columns);
	}

	// Set dashboard props to "best fit"
	this.rows			= Math.ceil(widgets/columns);
	this.columns		= columns;
	this.cells			= [];
	this.column_width	= width;

	// Set element height to the required height for the grid
	this.$el.height((this.rows*this.column_width)+this.options.margins);

	// Generate the grid cells
	for (var i = 0; i < (this.rows * this.columns); i++) {
		var row = Math.floor(i/this.columns);
		var col = i-(row*this.columns);
		var x	= (col*this.column_width)+this.options.margins;
		var y	= (row*this.column_width)+this.options.margins;

		this.cells.push({
			row: row,
			col: col,
			x: x,
			y: y,
			w: this.column_width-this.options.margins,
			h: this.column_width-this.options.margins,
			widget: null
		});
	}
};

/**
 * assigns widgets to cells in the order they appear in the $el
 */
Grid.prototype.autoAssignWidgets = function() {
	logger('Grid#autoAssignWidgets()');
	// Get widgets from the DOM
	var widgets = this.$el.find('.widget');

	// Iterate over the widgets and add them to the grid cells
	$.each(widgets, function(index, element) {
		this.cells[index].widget = new Widget(element, index, this.cells[index]);
	}.bind(this));
};

/**
 * Attempts to find the index of a cell from page co-ordinates.
 *
 * @param {Number}  *x The X Co-Ordinate
 * @param {Number}  *y The Y Co-Ordinate
 */
Grid.prototype.getCellIndexFromCoords = function(x, y) {
	logger('Grid#getCellIndexFromCoords()');

	return _.findIndex(this.cells, function(cell) {
		return (
			x > cell.x &&
			x < cell.x+this.column_width &&

			y > cell.y &&
			y < cell.y+this.column_width
		);
	}.bind(this));
};
Grid.prototype.swapCellContents = function(indexA, indexB) {
	logger('Grid#swapCellContents()');
	// Create clones of the 2 cells
	var widgetInCellA = $.extend(true, {}, this.cells[indexA].widget);
	var widgetInCellB = $.extend(true, {}, this.cells[indexB].widget);

	// Swap the cells
	this.cells[indexA].widget = widgetInCellB;
	this.cells[indexB].widget = widgetInCellA;

	// Update the widget with it's new cell props
	if(this.cells[indexA].widget.update)
		this.cells[indexA].widget.update({x: this.cells[indexA].x, y: this.cells[indexA].y,	i: indexA});
	if(this.cells[indexB].widget.update)
		this.cells[indexB].widget.update({ x: this.cells[indexB].x, y: this.cells[indexB].y, i: indexB });

};
Grid.prototype.mousedown = function(event) {
	logger('Grid#mousedown()');
	if(event.which !== 1 || !$(event.target).hasClass('widget')) return null;
	// Get the widget's index
	var index = $(event.target).data('index');
	logger('Clicked on #'+index);

	// Send the event to the widget's pickup handler
	this.cells[index].widget.pickup(event);
};