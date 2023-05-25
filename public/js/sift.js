const siftBeaconKey = await (await fetch('/sift/beacaon-key')).text()
const siftUserId = await (await fetch('/sift/user-id')).text()

const cookie = document.cookie
const start = cookie.indexOf('=')
const end = cookie.indexOf(';')
const sessionId = cookie.substring(start+1, end)

var _user_id = siftUserId; // Set to the user's ID, username, or email address, or '' if not yet known.
var _session_id = sessionId; // Set to a unique session ID for the visitor's current browsing session.

var _sift = window._sift = window._sift || [];
_sift.push(['_setAccount', siftBeaconKey]);
_sift.push(['_setUserId', _user_id]);
_sift.push(['_setSessionId', _session_id]);
_sift.push(['_trackPageview']);

(function() {
 function ls() {
   var e = document.createElement('script');
   e.src = 'https://cdn.sift.com/s.js';
   document.body.appendChild(e);
 }
 if (window.attachEvent) {
   window.attachEvent('onload', ls);
 } else {
   window.addEventListener('load', ls, false);
 }
})();