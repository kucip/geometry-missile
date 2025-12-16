/**
* User Agent patch to workaround device detection method
*/

ig.module(
    "plugins.patches.user-agent-patch"
).requires(
    "impact.impact"
).defines(function () {
    // custom user agent
	ig.ua.is_uiwebview = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);
	ig.ua.is_safari_or_uiwebview = /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent);
	ig.ua.iOS6_tag = /OS 6_/i.test(navigator.userAgent);
	ig.ua.iOS6 = (ig.ua.iPhone || ig.ua.iPad) && ig.ua.iOS6_tag;
	ig.ua.iOSgt5 = ig.ua.iOS && parseInt((navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/)[1]) > 5;
	ig.ua.HTCONE = /HTC_One/i.test(navigator.userAgent);
	ig.ua.Kindle = /Silk/i.test(navigator.userAgent);	

    // iPad iOS Safari 13 workaround: https://www.indigoblue.eu/2019/work-around-for-user-agent-in-safari-on-ipados
    // Errin's workaround for Mozeus: https://docs.google.com/document/d/1r12sEaRjWE6PDpKZi0DvqzSUEYVoU9x4r11KCl_fTUw/edit?usp=sharing
    ig.ua.touchDevice = ('ontouchstart' in window) || (window.navigator.msMaxTouchPoints) || (window.navigator.maxTouchPoints);
    ig.ua.is_mac = (navigator.platform === 'MacIntel');
    
    ig.ua.iOS = (ig.ua.touchDevice && ig.ua.is_mac) || ig.ua.iOS;

    ig.ua.mobile = ig.ua.iOS || ig.ua.android || ig.ua.iOS6 || ig.ua.winPhone || ig.ua.Kindle || /mobile/i.test(navigator.userAgent);
});
