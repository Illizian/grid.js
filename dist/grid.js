/*! grid.js - v0.1.0 - 2014-05-24
Illizian (alex@alexscotton.com)
* https://github.com/Illizian/grid.js
 Licensed MIT */

var debug = true;

var logger = function (message) {
	if(debug) console.log(message);
};
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
		min_rows: 1,
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
	var min_rows = Math.ceil(widgets/columns);
	min_rows = ((min_rows >= this.options.min_rows) ? min_rows : this.options.min_rows);
	// Set dashboard props to "best fit"
	this.rows			= min_rows;
	this.columns		= columns;
	this.cells			= [];
	this.column_width	= width;

	logger('Grid Properties: '+ this.rows +'rows X '+ this.columns +'columns = '+ this.cells +'cells @ '+ this.column_width +'px width');

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
/**
 * the Widget Class
 *
 * @param {HTMLElement|String} *el    The Widgets HTMLelement or a selector as a string.
 * @param {Number}             *index The Widgets index on the grid
 * @param {Object}             *index The cell the widget is within
 */
var Widget = function(el, index, cell) {
	logger('Widget#new');

	this.$el = $(el);
	this.x = cell.x;
	this.y = cell.y;
	this.w = cell.w;
	this.h = cell.h;
	this.i = index;

	// Set element properties
	this.$el.data('index', this.i);
	this.$el.css({
		"top": this.y,
		"left": this.x,
		"height": this.h,
		"width": this.w
	});
};
Widget.prototype.update = function(coords) {
	logger('Widget#update');
	$.extend(this, coords);

	this.$el.data('index', this.i);
	this.$el.css({
		"top": this.y,
		"left": this.x,
		"height": this.h,
		"width": this.w
	});
};
Widget.prototype.pickup = function(event) {
	// Should probably think of a better name
	logger('Widget#pickup');

	// Set the dragging class (use css to signal the widget is dragging)
	this.$el.addClass('dragging');

	// Store the pickup location
	this._pickup = {
		x: this.x,
		y: this.y,
		offsetX: event.offsetX,
		offsetY: event.offsetY
	};

	// Attach further event listeners
	$(event.currentTarget).on("mousemove", this.move.bind(this))
						  .on("mouseup", this.drop.bind(this));

};
Widget.prototype.move = function(event) {
	logger('Widget#move');
	this.update({
		x: event.pageX - this._pickup.offsetX,
		y: event.pageY - this._pickup.offsetY
	});
};
Widget.prototype.drop = function(event) {
	logger('Widget#drop');
	// Remove the event listeners
	$(event.currentTarget).off("mousemove mouseup");

	// Set the dragging class (use css to signal the widget is dragging)
	this.$el.removeClass('dragging');
	// Reset the pickup location
	this._pickup = null;

	// And begin the swap logic
	// TODO: Can't rely on dashboard variable.. find a means to do this without it
	var newIndex = grid.getCellIndexFromCoords(event.pageX, event.pageY);
	var oldIndex = this.i;
	grid.swapCellContents.bind(grid)(oldIndex, newIndex);
};