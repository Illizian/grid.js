/*
* @Author: alex
* @Date:   2014-05-24 00:02:31
* @Last Modified by:   alex
* @Last Modified time: 2014-05-24 11:40:14
*/

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