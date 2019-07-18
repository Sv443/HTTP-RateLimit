# HTTP-RateLimit v0.2.3 <br> [![](https://img.shields.io/github/license/Sv443/HTTP-RateLimit.svg?style=flat-square)](https://github.com/Sv443/HTTP-RateLimit/blob/master/LICENSE) [![](https://img.shields.io/badge/JSDoc-v3.5.5-green.svg?style=flat-square)](http://usejsdoc.org/) [![](https://img.shields.io/github/issues/Sv443/HTTP-RateLimit.svg?style=flat-square)](https://github.com/Sv443/HTTP-RateLimit/issues) [![](https://img.shields.io/github/stars/Sv443/HTTP-RateLimit.svg?style=flat-square)](https://github.com/Sv443/HTTP-RateLimit/stargazers)
## This package counts the incoming client requests and determines whether a requesting client has reached a specified request threshold per defined timeframe


<br><br><br><br><br>

# Installation:
```
npm i http-ratelimit
```

<br><br><br><br><br>

# Example Usage:
```js
const http = require("http"); // also works with the https package
const rateLimit = require("http-ratelimit");


http.createServer((req, res) => {
    rateLimit.inboundRequest(req); // this function has to run in the createServer callback, optimally at the very top of it like shown here

    if(rateLimit.isRateLimited(req, 20) === true) { // this checks whether the request is from an IP that has already sent x amount of requests in the defined timeframe (two minutes in this example). x is specified with the second attribute.
        // if this part is reached, that means the requester has sent more than 20 requests in two minutes
        // it is best to end the request here with status code 429, like the following lines suggest:

        res.writeHead(429, {"Content-Type": "text/plain; utf-8"});
        res.end("Too many requests - max is 20 requests in two minutes");
    }
    else {
        // the requester has sent less than 20 requests in the defined timeframe (two minutes in this example)
        // do your normal stuff here

        res.writeHead(200, {"Content-Type": "text/plain; utf-8"});
        res.end("https://data.whicdn.com/images/325197845/superthumb.jpg");
    }

}).listen(80, null, err => {
    if(!err) {
        // server was successfully started
        rateLimit.init(2, true); // HTTP-RateLimit has to be initialized before running any other function. It's best to put it right in here.
        // In this example, a timeframe of two minutes is chosen (first parameter) - (defaults to 1 if left undefined)
        // If you are using a reverse proxy, the second parameter has to be set to true - (defaults to false if left undefined)

        console.log("success");
    }
    else {
        // error while starting server
        console.log(`Error: ${err}`);
        process.exit(1);
    }
});
```

<br><br><br><br><br>

# Function List:
- `rateLimit.init(timeframe: Number, usingReverseProxy: Boolean)` - Initializes all variables etc. | If you are using a reverse proxy, make sure to set the second parameter to true as then the IP address has to be pulled from the "x-forwarded-for" request header
- `rateLimit.inboundRequest(req: http.IncomingMessage)` - Adds the requestee's IP address to the list of requests per timeframe
- `rateLimit.isRateLimited(req: http.IncomingMessage, requestLimitPerMinute: Number)` - Checks if the request's IP address occurs more than `requestLimitPerMinute` times in the above mentioned list and should therefore be rate limited | Returns true or false

<br><br><br>

[Back to the Top](#http-ratelimit-v022-----)