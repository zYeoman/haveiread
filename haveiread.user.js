// ==UserScript==
// @name         HaveIRead
// @namespace    https://mickir.me/
// @version      0.5.2
// @description  Have I read this page?
// @author       Mickir
// @noframes
// @match        http://*/*
// @match        https://*/*
// @exclude      https://www.google.com/search*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM.addStyle
// @updateURL    https://github.com/zYeoman/haveiread/blob/master/haveiread.user.js
// @downloadURL  https://github.com/zYeoman/haveiread/blob/master/haveiread.user.js
// ==/UserScript==

(function() {
  "use strict";
  GM.addStyle(`
    #haveiread {
      display: none;
      font-family: sans-serif;
      font-size: 10px;
      min-width: 24px;
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 999999;
      background: white;
      border: 2px solid;
    }
    #haveiread p {
      margin: 0;
      padding: 0;
      outline: none;
    }
    `);
  // New Element
  const show = document.createElement("div");
  const input = document.createElement("p");
  show.id = "haveiread";
  input.contentEditable = true;
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
          if (input.innerText != "n") {
            show.style.display = "block";
          }
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
