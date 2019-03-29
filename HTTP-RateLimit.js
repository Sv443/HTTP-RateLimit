/**
 * This module is used together with the NodeJS http or https module.
 * It counts the requests per minute and checks if the requester has exceeded a set amount of requests per minute based on their IP address.
 * 
 * @author Sv443 <sven.fehler@web.de> (https://sv443.net/)
 * @license MIT
 */


const http = require("http"); // only used to access type declarations
var lastMinReqs = [], initialized = false;




/**
 * Use this function to initialize HTTP-RateLimit. This has to be done before calling any other method
 * @returns {Boolean} true, if initialization succeeded, false if not
 */
module.exports.init = () => {
    if(initialized == false) {
        try {
            setInterval(() => {
                lastMinReqs = [];
            }, 1000 * 60);

            initialized = true;

            return true;
        }
        catch(err) {
            return false;
        }
    }
    else return true;
}

/**
 * Use this to check if the request sender has to be rate limited or not. Returns a boolean value
 * @param {http.ClientRequest} req Inbound client request
 * @param {Number} requestLimitPerMinute The limit of requests a single client can make per minute before being rate limited
 * @returns {Boolean} true, if the sender has to be rate limited, false if not
 * @throws Will throw an error if HTTP-RateLimit wasn't initialized with the .init() method beforehand
 */
module.exports.isRateLimited = (req, requestLimitPerMinute) => {
    if(typeof requestLimitPerMinute != "number" || requestLimitPerMinute < 1) throw new Error("The attribute requestLimitPerMinute has to be of type \"Number\" and has to be bigger than 0.");
    if(!initialized) throw new Error("HTTP-RateLimit has to be initialized using the .init() method before calling any other method.");

    let ipaddr = req.connection.remoteAddress, limitC = 0;
    ipaddr = (ipaddr.length<15?ipaddr:(ipaddr.substr(0,7)==='::ffff:'?ipaddr.substr(7):undefined));

    for(let i = 0; i < lastMinReqs.length; i++) if(lastMinReqs[i] == ipaddr.toString()) limitC++;

    return (limitC > requestLimitPerMinute);
}

/**
 * Put this at the beginning of the inbound request
 * @param {http.ClientRequest} req Inbound client request
 * @returns {void}
 * @throws Will throw an error if HTTP-RateLimit wasn't initialized with the .init() method beforehand
 */
module.exports.inboundRequest = req => {
    if(!initialized) throw new Error("HTTP-RateLimit has to be initialized using the .init() method before calling any other method.");

    let ipaddr = req.connection.remoteAddress;
    ipaddr = (ipaddr.length<15?ipaddr:(ipaddr.substr(0,7)==='::ffff:'?ipaddr.substr(7):undefined));

    lastMinReqs.push(ipaddr.toString());
}