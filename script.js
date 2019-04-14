// ==UserScript==
// @name         HaveIRead
// @namespace    https://mickir.me/
// @version      0.1
// @description  Have I read this page?
// @author       Mickir
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
  "use strict";
  var url = document.URL;
  $.post("https://api.mickir.me/", `{"url":"${url}"}`).then(function(data) {
    if (data.status == "OK") {
      var du = (data.read && "看过") || "没看过";
      var a = $(
        `<div style="border: 2px solid;font-family: sans-serif;position:fixed;top:10px;right:10px;z-index:9999;background:white;">${du}</div>`
      );
      a.appendTo($(document.body));
      if (data.read) a.css("color", "red");
      else a.css("color", "green");
    }
  });
})();
