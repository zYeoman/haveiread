// ==UserScript==
// @name         HaveIRead
// @namespace    https://mickir.me/
// @version      0.6.7
// @description  Have I read this page?
// @author       Mickir
// @noframes
// @match        http://*/*
// @match        https://*/*
// @exclude      https://www.google.com/search*
// @exclude      https://www.notion.so/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM.addStyle
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @updateURL    https://raw.github.com/zYeoman/haveiread/master/haveiread.user.js
// @downloadURL  https://raw.github.com/zYeoman/haveiread/master/haveiread.user.js
// ==/UserScript==

(async () => {
  'use strict'
  var username = await window.GM.getValue('user', '')
  var key = await window.GM.getValue('key', '')
  if (username === '') {
    username = window.prompt('HaveIRead? Enter your username', 'username')
    key = window.prompt('Enter or Set your key', 'key')
    await window.GM.setValue('user', username)
    await window.GM.setValue('key', key)
  }
  window.GM.addStyle(`
    #haveiread {
      width: unset;
      line-height: normal;
      padding: 0;
      margin: 0;
      display: none;
      min-width: 24px;
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 999999;
      background: white;
      border: 2px solid;
    }
    #haveiread p {
      font-family: sans-serif;
      font-size: 10px;
      margin: 0;
      padding: 0;
      outline: none;
    }
    `)
  // New Element
  const show = document.createElement('div')
  const input = document.createElement('p')
  show.id = 'haveiread'
  input.contentEditable = true
  show.appendChild(input)

  // Request
  function update (url) {
    var data = {
      url: url || document.URL,
      title: document.title,
      user: username,
      key: key
    }
    window.GM.xmlHttpRequest({
      method: 'POST',
      url: 'https://api.mickir.me/read/',
      data: JSON.stringify(data),
      onload: response => {
        var data = JSON.parse(response.responseText)
        if (data.status === 'OK') {
          input.innerText = (data.read && (data.comment || '看过')) || '没看过'
          show.style.color = (data.read && 'red') || 'green'
          if (input.innerText !== 'n' && data.read && data.count < 10) {
            show.style.display = 'block'
          }
        } else {
        }
      }
    })
  }

  function comment (text) {
    var url = document.URL
    var data = {
      url: url,
      comment: text,
      user: username,
      key: key
    }
    window.GM.xmlHttpRequest({
      method: 'PUT',
      url: 'https://api.mickir.me/comment/',
      data: JSON.stringify(data),
      onload: response => {
        var data = JSON.parse(response.responseText)
        if (data.status === 'OK') {
          input.blur()
        } else {
        }
      }
    })
  }

  document.body.appendChild(show)
  update()
  function appendShow () {
    window.setTimeout(() => {
      if (document.getElementById('haveiread') === null) {
        console.log('Try add show again')
        document.body.appendChild(show)
        appendShow()
      }
    }, 1000)
  }
  appendShow()
  input.addEventListener('keypress', function (evt) {
    if (evt.which === 13) {
      evt.preventDefault()
      comment(input.innerText)
    }
  })
  function realURL (url) {
    var a = document.createElement('a')
    a.href = url
    return a.href
  }
  (function (history) {
    var pushState = history.pushState
    history.pushState = function (state) {
      update(realURL(arguments[2]))
      return pushState.apply(history, arguments)
    }
  })(window.history)
})()
