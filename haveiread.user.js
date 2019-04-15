// ==UserScript==
// @name         HaveIRead
// @namespace    https://mickir.me/
// @version      0.5.1
// @description  Have I read this page?
// @author       Mickir
// @noframes
// @match        http://*/*
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @updateURL    https://github.com/zYeoman/haveiread/blob/master/haveiread.user.js
// @downloadURL  https://github.com/zYeoman/haveiread/blob/master/haveiread.user.js
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
  show.style.minWidth = "24px";
  show.style.display = "none";
  const input = document.createElement("p");
  input.contentEditable = true;
  input.style.margin = 0;
  input.style.padding = 0;
  input.style.outline = "none";
  show.appendChild(input);

  // Request
  function update() {
    var url = document.URL;
    var title = document.title;
    GM.xmlHttpRequest({
      method: "POST",
      url: "https://api.mickir.me/read/",
      data: `{"url":"${url}","title":"${title}"}`,
      onload: response => {
        var data = JSON.parse(response.responseText);
        if (data.status == "OK") {
          input.innerText = (data.read && (data.comment || "看过")) || "没看过";
          show.style.color = (data.read && "red") || "green";
          show.style.display = "block";
        } else {
        }
      }
    });
  }

  function comment(text) {
    var url = document.URL;
    console.log(`{"url":"${url}","comment":"${text}"}`);
    GM.xmlHttpRequest({
      method: "PUT",
      url: "https://api.mickir.me/comment/",
      data: `{"url":"${url}","comment":"${text}"}`,
      onload: response => {
        var data = JSON.parse(response.responseText);
        console.log(response);
        if (data.status == "OK") {
        } else {
        }
      }
    });
  }

  document.body.appendChild(show);
  document.addEventListener("pjax:end", update);
  update();
  input.addEventListener("keypress", function(evt) {
    if (evt.which === 13) {
      evt.preventDefault();
      comment(input.innerText);
    }
  });
})();
