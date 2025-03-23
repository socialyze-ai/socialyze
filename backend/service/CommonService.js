
// Redirect to the dashboard or profile page
    // const cookiesHeader = req.headers.cookie
    // let sessionId = getValueFromCookie(cookiesHeader, "connect.sid")
    // sessionId = sessionId.split('.')[0];
    // sessionId = sessionId.replace("s:", "");
function getValueFromCookie (cookiesHeader, key) {
    if (cookiesHeader) {
        // Split the 'Cookie' header by semicolon to separate individual cookies
        const cookies = cookiesHeader.split(';');
    
        // Find the 'connect.sid' cookie and extract its value
        let value = null;
        cookies.forEach((cookie) => {
          const [cookieName, cookieValue] = cookie.trim().split('=');
          if (cookieName === key) {
            value = cookieValue;
          }
        });
    
        if (value) {
          // 'connect.sid' cookie value found, you can use it here
           return decodeURIComponent(value);
        }
    }
}

module.exports = {
    getValueFromCookie
};