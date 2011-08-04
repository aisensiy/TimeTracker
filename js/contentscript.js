var body = document.getElementsByTagName('body')[0];
var port = chrome.extension.connect({name: 'idle'});

body.addEventListener('mousemove', function(event){
	port.postMessage();
});
body.addEventListener('keypress', function(event){
	port.postMessage({});
});
