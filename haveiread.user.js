// ==UserScript==
// @name         HaveIRead
// @namespace    https://mickir.me/
// @version      0.6.2
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
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @updateURL    https://github.com/zYeoman/haveiread/raw/master/haveiread.user.js
// @downloadURL  https://github.com/zYeoman/haveiread/raw/master/haveiread.user.js
// ==/UserScript==

(async () => {
  "use strict";
  var username = await GM.getValue("user", "");
  var key = await GM.getValue("key", "");
  if (username == "") {
    username = prompt("HaveIRead? Enter your username", "username");
    key = prompt("Enter or Set your key", "key");
    await GM.setValue("user", username);
    await GM.setValue("key", key);
  }
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
  function update(url) {
    var data = {
      url: url || document.URL,
      title: document.title,
      user: username,
      key: key
    };
    GM.xmlHttpRequest({
      method: "POST",
      url: "https://api.mickir.me/read/",
      data: JSON.stringify(data),
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
    var data = {
      url: document.URL,
      comment: text,
      user: username,
      key: key
    };
    var url = document.URL;
    GM.xmlHttpRequest({
      method: "PUT",
      url: "https://api.mickir.me/comment/",
      data: JSON.stringify(data),
      onload: response => {
        var data = JSON.parse(response.responseText);
        if (data.status == "OK") {
          input.blur();
        } else {
        }
      }
    });
  }

  document.body.appendChild(show);
  update();
  input.addEventListener("keypress", function(evt) {
    if (evt.which === 13) {
      evt.preventDefault();
      comment(input.innerText);
    }
  });
  function realURL(url) {
    var a = document.createElement("a");
    a.href = url;
    return a.href;
  }
  (function(history) {
    var pushState = history.pushState;
    history.pushState = function(state) {
      update(realURL(arguments[2]));
      return pushState.apply(history, arguments);
    };
  })(window.history);
})();
