

function actionSite(id){
/* id = 0 --> bloquar
			= 1 --> permitir */
chrome.tabs.getSelected(null,function(tab){
	var background = chrome.extension.getBackgroundPage();
	window.close();
	background.popup.filter(id, tab);
});
}

window.addEventListener('DOMContentLoaded', function(e){
  document.getElementById("btn_block").addEventListener("click", function(){
    actionSite(0);
  });
  document.getElementById("btn_trust").addEventListener("click", function(){
    actionSite(1);
  });
  document.getElementById("btn_options").addEventListener("click", function(){
    chrome.tabs.create({url:"options.html"});
    window.close();
 });
});
