// IE DETECTION	-- DETECTING WITH HTML, MAY NOT WORK PROPERLY	
/*var ie = (function(){

    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');
  
    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );
  
    return v > 4 ? v : undef;
  
}());*/

// IE DETECTION	-- DETECTING WITH USER AGENT
function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

var ie = getInternetExplorerVersion();

function getQueryVariable(variable) {
    var query = window.location.search.substring(1); // search in parent
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].match(/([^=]+?)=(.+)/);
        if (pair && decodeURIComponent(pair[1]) == variable) {
            return decodeURIComponent(pair[2]);
        }
    }
}
		
//var nohtml5_message = {
//	'en':'This game is best experienced with HTML5 capable browsers. We recommend downloading <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a>, or <a href="http://www.mozilla.org" target="_blank">Mozilla Firefox</a>',
//	'hk':'此程式只能支援 HTML5 的瀏覽器上運行，如未能開始遊戲，請按此下載 <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a>, or <a href="http://www.mozilla.org" target="_blank">Mozilla Firefox</a>',
//	'tw':'此程式只能支援 HTML5 的瀏覽器上運行，如未能開始遊戲，請按此下載 <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a>, or <a href="http://www.mozilla.org" target="_blank">Mozilla Firefox</a>',			
//}
//
//if(ie<9){
//	var message;
//	var lang = getQueryVariable('lang');
//	if(lang){
//		switch(lang.toLowerCase()){
//			case 'en':
//				message = nohtml5_message['en'];
//				break;
//			case 'hk':
//				message = nohtml5_message['hk'];
//				break;
//			case 'tw':
//				message = nohtml5_message['tw'];
//				break;
//			default:
//				message = nohtml5_message['en'];
//		}				
//	}else{
//		message = nohtml5_message['en'];
//	}
//
//	// INJECT
//	document.getElementById('nohtml5-text').innerHTML = message;
//
//	// SHOW
//	document.getElementById('nohtml5').style.visibility="visible";		
//	
//}

