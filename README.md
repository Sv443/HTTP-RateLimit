# HTTP-RateLimit v0.1.0
## This package counts the incoming client requests and determines whether a requesting client has reached a specified request threshold per minute

<br><br><br><br><br><br><br><br><br>

# Installation:
```
npm i --save http-ratelimit
```

<br><br><br><br><br><br><br><br><br>

# Example Usage:
```js
const http = require("http");
const rateLimit = require("http-ratelimit");


http.createServer((req, res) => {

    rateLimit.inboundRequest(req); // this function has to run in the createServer callback, optimally at the very top of it

    if(rateLimit.isRateLimited(req, 20) === true) { // this checks whether the request is from an IP that has already sent x amount of requests in one minute. x is specified with the second attribute.
        // requester has sent more than 20 requests in one minute
        // it is best to end the request here with status code 429
    }
    else {
        // requester has sent less than 20 requests in one minute
        // do your normal stuff here
    }

}).listen(80, null, err => {
    if(!err) {
        // server was successfully started
        rateLimit.init(); // HTTP-RateLimit has to be initialized before running any other function. It's best to put it right in here
    }
    else {
        // error while starting server
    }
});
```

<br><br><br><br><br><br><br><br><br>

# Function List:
- `rateLimit.init()` - Initializes all variables etc.
- `rateLimit.inboundRequest(req: HttpClientRequest)` - Adds the request's IP address to the list of requests per minute
- `rateLimit.isRateLimited(req: HttpClientRequest, requestLimitPerMinute: Number)` - Checks if the request's IP address occurs more than `requestLimitPerMinute` times in the above mentioned list
