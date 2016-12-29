
var Router = (function() {

    var NUMBER_REGEX = /^[-]?[0-9]+[\.]?[0-9]+$/;
    var PARAM = '-<{(param)}>-';

    var contains = function(item, has) {
        return item.indexOf(has) !== -1;
    };

    var wraps = function(item, l, r) {
        return item[0] === l && item.slice(-1) === r;
    };

    var isWrappedWith = function(item, l, r) {
        return item[0] === l && item.slice(-1) === r;
    };

    var isParam = function(p) {
        return isWrappedWith(p, '<', '>');
    };

    // Removes trailing, ending, and excess path slashes.
    var cleanupPath = function(p) {
        return p.split('/').filter(function(i) { return i; }).join('/');
    };

    var parseQueryString = function(s) {
        if (!s) { return ''; }
        var key, val;
        return s.split('&').reduce(function(args, key_val) {
            key_val = key_val.split('=');
            key = key_val[0];
            val = key_val[1];
            // Making assumption param with no value is bool flag.
            if (val === undefined) {
                args[key] = true;
            }
            else if (isWrappedWith(val, '{', '}') || isWrappedWith(val, '[', ']')) {
                args[key] = JSON.parse(val);
            }
            else if (Number(val)) {
                args[key] = Number(val);
            }
            else if (val === 'true') {
                args[key] = true;
            }
            else if (val === 'false') {
                args[key] = false;
            }
            else if (val === 'null') {
                args[key] = null;
            }
            else {
                args[key] = val;
            }
            return args;
        }, {});
    };

    var determineType = function(type) {
        if (type === 'number') {
            return Number;
        }
    };

    var matchParams = function(path, params) {
        var type, val, name;
        return path.split('/').reduce(function(o, piece) {
            if (isParam(piece)) {
                val = params.shift();
                // Removes '<' & '>' and attemps to split by colon. May return
                // array of one.
                piece = piece.slice(1, -1).split(':');
                // If param type is specified, then first item with be
                // type name.
                type = piece.length > 1 ? piece[0] : undefined;
                // Extracts type constructor.
                type = determineType(type);
                // Param name.
                name = type ? piece[1] : piece[0];
                o[name] = type ? type(val) : val;
            }
            return o;
        }, {});
    };

    return function(root, args) {
        var that = this;
        root = args ? cleanupPath(root) : '';
        args = args || {};
        // Initiate internal variables.
        var routeRegister = {};
        var route = function(path, callback) {
            var _path = path;
            if (args.ignoreCase) {
                path = path.toLowerCase();
            }
            path = path.split(/\//g);
            var end = path.length - 1;
            var branch = routeRegister;
            path.forEach(function(p, i) {
                if (wraps(p, '<', '>')) {
                    p = PARAM;
                }
                if (i === end) {
                    branch[p] = {
                        callback: callback,
                        path: _path
                    }
                } else {
                    if (!branch[p]) {
                        branch[p] = {};
                    }
                    branch = branch[p];
                }
            });
            return that;
        };

        var callRoute = function(path, args) {
            path = path.split(/\//g);
            var end = path.length - 1;
            var branch = routeRegister;
            var param, params = [];
            for (var p, i = 0, l = path.length; i < l; i++) {
                p = path[i];
                if (i === end && branch[p]) {
                    branch[p].callback(args, matchParams(branch[p].path, params));
                }
                else if (i === end && branch[PARAM]) {
                    param = branch[PARAM];
                    params.push(p);
                    param.callback(matchParams(param.path, params), args);
                }
                else if (branch[p]) {
                    branch = branch[p];
                }
                else if (branch[PARAM]) {
                    branch = branch[PARAM];
                    params.push(p);
                }
                else {
                    console.warn('No matching route.');
                    break;
                }
            }
        };

        var onhashchange = function() {
            // Removes hash and splits on query string.
            var hash = location.hash.slice(1).split('?');
            // May be undefined. In whch case, function returns empty string.
            var args = parseQueryString(hash[1]);
            var path = cleanupPath(hash[0]);
            callRoute(path, args);
        };

        this.route = function(path, callback) {
            if (root && path[0] !== '/') {
                path = cleanupPath(root + '/' + path);
            } else {
                path = cleanupPath(root + path);
            }
            route(path, callback);
            onhashchange();
        };

        (function() {
            if (window.onhashchange) {
                var oldonhashchange = window.onhashchange;
                window.onhashchange = function(e) {
                    onhashchange(e);
                    oldonhashchange(e);
                };
            } else {
                window.onhashchange = onhashchange;
            }
        })();

    };
})()
