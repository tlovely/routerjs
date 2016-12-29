# routerjs
A simple front end router loosely inspired by Python's Flask.

Of course, very experimental as this stage.

## Basic Usage
```javascript

var app = new Router();

// If url hash changes to /some/path/#/blog/2016/12/5?search=Some sub string&ignorecase=true
// then the below callback will execute, and the the params and query objects would look like so ...
app.route('/blog/<number:year>/<number:month>/<number:day>', function(params, query) {
    // param: { year: 2012, month: 12, day: 5 }
    // query: { search: 'Some sub string', ignorecase: true }
});

```
