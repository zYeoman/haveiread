// ==UserScript==
// @name         HaveIRead
// @namespace    https://mickir.me/
// @version      0.2
// @description  Have I read this page?
// @author       Mickir
// @match        http://*/*
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @updateURL    https://raw.githubusercontent.com/zYeoman/havairead/master/haveiread.user.js
// @downloadURL  https://raw.githubusercontent.com/zYeoman/havairead/master/haveiread.user.js
// ==/UserScript==

(function() {
  "use strict";
  // New Element
  const show = document.createElement("div");
  show.style.border = "2px solid";
  show.style.fontFamily = "sans-serif";
  show.style.position = "fixed";
  show.style.top = "10px";
  show.style.right = "10px";
  show.style.zIndex = "9999";
  show.style.background = "white";
  show.style.fontSize = "10px";
  // Request
  function update() {
    var url = document.URL;
    var title = document.title;
    GM.xmlHttpRequest({
      method: "POST",
      url: "https://api.mickir.me/",
      data: `{"url":"${url}","title":"${title}"}`,
      onload: response => {
        var data = JSON.parse(response.responseText);
        if (data.status == "OK") {
          show.innerText = (data.read && "看过") || "没看过";
          show.style.color = (data.read && "red") || "green";
        } else {
        }
      }
    });
  }
  update();
  document.body.appendChild(show);
  document.addEventListener("pjax:end", update);
})();
