# A Responsive Drag & Drop Widget Dashboard

## Why?

I've used [gridster.js](http://gridster.net/) for awhile but needed a lightweight responsive solution for my latest project - so here it is.

## Is it ready?

*Nearly!* Check the issue tracker for my todo list :P (Feel free to tackle any and send me a PR).

## Usage

If you use `dist/grid.with.libs.js` this includes dependancies (jQuery & lodash) otherwise to use `dist/grid.js` you will need to ensure you've included these already.

Then all you need to do, is add the grid and widget markup to your DOM:
```html
<ul id="grid-container">
    <li class="widget">
        <div class="widget-body">
            <h1>Widget #1</h1>
            <p>This is a widget</p>
        </div>
    </li>
</ul>
```

and then create your new grid.js class:
```javascript
$(document).ready(function(){
    grid = new Grid('#grid-container');
    grid.init();
});
```
_Currently adding the grid variable to the global scope is a requirement [To fix](https://github.com/Illizian/grid.js/issues/2)_

You may override any of the default options when calling Grid():
```javascript
$(document).ready(function(){
    grid = new Grid('#grid-container', {
        margins: 10,
        min_rows: 1,
        min_columns: 1,
        max_columns: 12,
        min_col_width: 140
    });
    grid.init();
});
```