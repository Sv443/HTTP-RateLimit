/**
 * This module is used together with the NodeJS http or https module.
 * It counts the requests per minute and checks if the requester has exceeded a set amount of requests per timeframe based on their IP address.
 * 
 * @author Sv443 <sven.fehler@web.de> (https://sv443.net/)
 * @license MIT
 */


const http = require("http"); // only used to access typedefs for JSDoc, not for actual code
var lastMinReqs = [], initialized = false;
let useReverseProxy = false;
let placeholderIP = "00.00.00.00";
let iX = 0;




/**
 * Use this function to initialize HTTP-RateLimit. This has to be done before calling any other method
 * @param {Number} [timeframe=1] Specify the timeframe here
 * @param {Boolean} [usingReverseProxy=false] Set this to true, if you are using a reverse proxy so the IP address gets pulled from the x-forwarded-for header instead
 * @returns {(Boolean|String)} true, if initialization succeeded, string containing error message if not successful
 */
const init = (timeframe, usingReverseProxy) => {
    if(initialized == false) {
        try {
            let revprox = false;
            if(usingReverseProxy == true) revprox = true;
            useReverseProxy = revprox;

            if(timeframe == null || typeof timeframe != "number") timeframe = 1;

            setInterval(() => lastMinReqs = [], 1000 * 60 * timeframe);

            initialized = true;

            return true;
        }
        catch(err) {
            return err;
        }
    }
    else return true;
}

/**
 * Use this to check if the request sender has to be rate limited or not. Returns a boolean value
 * @param {http.IncomingMessage} req Inbound client request
 * @param {Number} requestLimitPerTimeframe The limit of requests a single client can make per before defined timeframe before being rate limited
 * @returns {Boolean} true, if the sender has to be rate limited, false if not
 * @throws Will throw an error if HTTP-RateLimit wasn't initialized with the .init() method beforehand
 */
const isRateLimited = (req, requestLimitPerTimeframe) => {
    if(typeof requestLimitPerTimeframe != "number" || requestLimitPerTimeframe < 1) throw new Error("The parameter \"requestLimitPerMinute\" has to be of type \"Number\" and has to be bigger than 0.");
    if(!initialized) throw new Error("HTTP-RateLimit has to be initialized using the .init() method before calling any other method.");

    let ipaddr = "", limitC = 0;

    ipaddr = getIpaddr(req);

    iX = 0; // both for loops have to share one iterator variable

    try {
        for(let i = iX; i < lastMinReqs.length; i++) if(lastMinReqs[i] == ipaddr.toString()) limitC++;
    }
    catch(err) {
        for(let i = iX; i < lastMinReqs.length; i++) if(lastMinReqs[i] == ipaddr) limitC++;
    }

    return (limitC > requestLimitPerTimeframe);
}

/**
 * Put this at the beginning of the inbound request
 * @param {http.IncomingMessage} req Inbound client request
 * @throws Will throw an error if HTTP-RateLimit wasn't initialized with the .init() method beforehand
 */
const inboundRequest = req => {
    let ipaddr = "";

    if(!initialized) throw new Error("HTTP-RateLimit has to be initialized using the .init() method before calling any other method.");

    try {
        ipaddr = getIpaddr(req);
    }
    catch(err) {
        ipaddr = placeholderIP;
    }

    try {
        lastMinReqs.push(ipaddr.toString());
    }
    catch(err) {
        lastMinReqs.push(ipaddr);
    }
}

function getIpaddr(req) {
    let ipaddr = placeholderIP, returnIP = placeholderIP;

    if(useReverseProxy !== true) ipaddr = req.connection.remoteAddress; // if no reverse proxy is used, pull IP from request's remote connection
    else if(useReverseProxy === true && req.headers["x-forwarded-for"] != null && req.headers["x-forwarded-for"].includes(",")) ipaddr = req.headers["x-forwarded-for"].split(",")[0]; // if reverse proxy is used, pull IP from x-forwarded-for header
    else if(useReverseProxy === true && req.headers["x-forwarded-for"] != null && !req.headers["x-forwarded-for"].includes(",")) ipaddr = req.headers["x-forwarded-for"];
    else ipaddr = placeholderIP; // only in the rarest case (when both methods of obtaining the IP fail) a placeholder IP address will be used

    ipaddr = (ipaddr.length<15?ipaddr:(ipaddr.substr(0,7)==='::ffff:'?ipaddr.substr(7):undefined));

    try {
        if(ipaddr != undefined && ipadrr != null) returnIP = ipaddr.toString();
        else returnIP = placeholderIP;
    }
    catch(err) {
        returnIP = placeholderIP;
    }
    finally {
        return returnIP;
    }
}

module.exports = { init, isRateLimited, inboundRequest }