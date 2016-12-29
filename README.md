# routerjs
A simple client side router loosely inspired by Python's Flask.

Of course, very experimental as this stage.

## Basic Usage
```javascript

var app = new Router();

// If url hash changes to /some/path/#/blog/2016/12/5?search=Some sub string&ignorecase=true
// then the below callback will execute, and the the params and query objects would look like so ...
app.route('/blog/<number:year>/<number:month>/<number:day>', function(params, query) {
    // param: { year: 2016, month: 12, day: 5 }
    // Notice 'ignorecase' value has been cast to bool.
    // query: { search: 'Some sub string', ignorecase: true }
});

```
