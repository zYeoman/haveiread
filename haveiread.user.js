// ==UserScript==
// @name         HaveIRead
// @namespace    https://mickir.me/
// @version      0.8.4
// @description  Have I read this page?
// @author       Mickir
// @noframes
// @match        http://*/*
// @match        https://*/*
// @exclude      https://www.google.com/search*
// @exclude      https://www.notion.so/*
// @exclude      https://feedly.com/*
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

  /** 主功能函数 **/

  /**
   * 链接净化规则
   * version 0.0.1
   * update 2018-10-18 11:52:26
   * 规则说明：
   *     来自：https://meta.appinn.net/t/topic/3130/2
   *
   */
  const rules = {
    'www.bilibili.com': {/* Blibili */
      testReg: /^http(?:s)?:\/\/www\.bilibili\.com\/video\/(av\d+).*$/i,
      replace: 'https://www.bilibili.com/$1',
      query: ['p'],
      hash: true
    },
    'itunes.apple.com': {/* Apple Stroe */
      testReg: /^http(?:s)?:\/\/itunes\.apple\.com\/(?:\w{2}\/)?([^\/]+)\/(?:[^\/]+\/)?((?:id)\d+).*$/i,
      replace: 'https://itunes.apple.com/cn/$1/$2'
    },
    'chrome.google.com/webstore': {/* Chrome Store */
      testReg: /^http(?:s)?:\/\/chrome\.google\.com\/webstore\/detail\/[^\/]+\/([a-z]{32}).*/i,
      replace: 'https://chrome.google.com/webstore/detail/$1'
    },
    's.taobao.com': {/* Taobao Search */
      testReg: /^http(?:s)?:\/\/s\.taobao\.com\/search.*$/i,
      replace: 'https://s.taobao.com/search',
      query: ['q']
    },
    'list.tmall.com': {/* Tmall Search */
      testReg: /^http(?:s)?:\/\/list\.tmall\.com\/search_product\.htm.*$/i,
      replace: 'https://list.tmall.com/search_product.htm',
      query: ['q']
    },
    'item.taobao.com': {/* Taobao item */
      testReg: /^http(?:s)?:\/\/item\.taobao\.com\/item\.htm.*$/i,
      replace: 'https://item.taobao.com/item.htm',
      query: ['id']
    },
    'detail.tmall.com': {/* Tmall item */
      testReg: /^http(?:s)?:\/\/detail\.tmall\.com\/item\.htm.*$/i,
      replace: 'https://detail.tmall.com/item.htm',
      query: ['id']
    },
    'taobao/tmall.com/shop': {/* Taobao/Tmall Shop */
      testReg: /^http(?:s)?:\/\/(\w+)\.(taobao|tmall)\.com\/shop\/view_shop\.htm.*$/i,
      replace: 'https://$1.$2.com/'
    },
    'c.pc.qq.com': {/* Open Taobao share link from QQ */
      testReg: /^http(?:s)?:\/\/c\.pc\.qq\.com\/middle.html\?.*pfurl=([^&]*)(?:&.*$|$)/i,
      replace: '$1',
      query: [],
      methods: ['decodeUrl']
    },
    'item.m.jd.com': {/* JD mobile to PC */
      testReg: /^http(?:s)?:\/\/item\.m\.jd\.com\/product\/(\d+)\.html(\?.*)?$/i,
      replace: 'https://item.jd.com/$1.html'
    },
    'item.m.jd.com/ware/': {/* JD mobile to PC */
      testReg: /^http(?:s)?:\/\/item\.m\.jd\.com\/ware\/view\.action\?.*wareId=(\d+).*$/i,
      replace: 'https://item.jd.com/$1.html'
    },
    'search.jd.com': {/* JD Search */
      testReg: /^http(?:s)?:\/\/search\.jd\.com\/Search\?.*$/i,
      query: ['keyword', 'enc']
    },
    'weibo.com/u': {/* Weibo personal homepage to mobile */
      testReg: /^http(?:s)?:\/\/(?:www\.)?weibo\.com\/u\/(\d+)(\?.*)?$/i,
      replace: 'https://m.weibo.cn/$1'
    },
    'weibo.com': {/* Weibo article page to mobile */
      testReg: /^http(?:s)?:\/\/(?:www\.)?weibo\.com\/(?:\d+)\/(\w+)(\?.*)?$/i,
      replace: 'https://m.weibo.cn/status/$1'
    },
    'greasyfork.org': {/* Greasyfork Script */
      testReg: /^http(?:s)?:\/\/(?:www\.)?greasyfork\.org\/(?:[\w-]*\/)?scripts\/(\d+)-.*$/i,
      replace: 'https://greasyfork.org/zh-CN/scripts/$1'
    },
    'store.steampowered.com|steamcommunity.com': {/* Steam */
      testReg: /^http(?:s)?:\/\/(store\.steampowered|steamcommunity)\.com\/app\/(\d+).*$/i,
      replace: 'https://$1.com/app/$2'
    },
    'meta.appinn.com': {/* Appinn BBS */
      testReg: /^http(?:s)?:\/\/meta\.appinn\.com\/t(?:\/[^/]*[^/0-9][^/]*)*\/(\d+)(\/.*$|$)/i,
      replace: 'https://meta.appinn.com/t/$1'
    },
    'yangkeduo.com': {/* Pin Duo Duo product Page */
      testReg: /^http(?:s)?:\/\/mobile\.yangkeduo\.com\/goods.html\?.*$/i,
      query: ['goods_id']
    },
    'other': {/* All url */
      testReg: /^(http(?:s)?:\/\/[^?#]*)[?#].*$/i,
      // 来自https://github.com/Smile4ever/Neat-URL
      block: 'ref, utm_source, utm_medium, utm_term, utm_content, utm_campaign, utm_reader, utm_place, utm_userid, utm_cid, utm_name, utm_pubreferrer, utm_swu, utm_viz_id, ga_source, ga_medium, ga_term, ga_content, ga_campaign, ga_place, yclid, _openstat, fb_action_ids, fb_action_types, fb_ref, fb_source, action_object_map, action_type_map, action_ref_map, gs_l, pd_rd_*@amazon.*, _encoding@amazon.*, psc@amazon.*, ved@google.*, ei@google.*, sei@google.*, gws_rd@google.*, cvid@bing.com, form@bing.com, sk@bing.com, sp@bing.com, sc@bing.com, qs@bing.com, pq@bing.com, feature@youtube.com, gclid@youtube.com, kw@youtube.com, $/ref@amazon.*, _hsenc, mkt_tok, hmb_campaign, hmb_medium, hmb_source, source@sourceforge.net, position@sourceforge.net, callback@bilibili.com, elqTrackId, elqTrack, assetType, assetId, recipientId, campaignId, siteId, tag@amazon.*, ref_@amazon.*, pf_rd_*@amazon.*, spm@*.aliexpress.com, scm@*.aliexpress.com, aff_platform, aff_trace_key, terminal_id, _hsmi, fbclid, spReportId, spJobID, spUserID, spMailingID, utm_mailing, utm_brand, CNDID, mbid, trk, trkCampaign, sc_campaign, sc_channel, sc_content, sc_medium, sc_outcome, sc_geo, sc_country'.split(',').map(item => item.trim())
    }
  }
  function dms_get_pure_url (url = window.location.href) {
    const hash = url.replace(/^[^#]*(#.*)?$/, '$1')
    const base = url.replace(/(\?|#).*$/, '')
    let pureUrl = url
    const getQueryString = function (key) {
      let ret = url.match(new RegExp('(?:\\?|&)(' + key + '=[^?#&]*)', 'i'))
      return ret === null ? '' : ret[1]
    }
    /* 链接处理方法 */
    const methods = {
      decodeUrl: function (url) { return decodeURIComponent(url) }
    }
    for (let i in rules) {
      let rule = rules[i]
      let reg = rule.testReg
      let replace = rule.replace
      if (reg.test(url)) {
        let newQuerys = ''
        if (typeof (rule.query) !== 'undefined' && rule.query.length > 0) {
          rule.query.map((query) => {
            const ret = getQueryString(query)
            if (ret !== '') {
              newQuerys += (newQuerys.length ? '&' : '?') + ret
            }
          })
        }
        if (typeof (rule.block) !== 'undefined' && rule.block.length > 0) {
          const querys = new URLSearchParams(location.search)
          rule.block.map((block) => {
            querys.delete(block)
          })
          const ret = querys.toString()
          if (ret !== '') {
            newQuerys = '?' + ret
          }
        }
        newQuerys += typeof (rule.hash) !== 'undefined' && rule.hash
          ? hash
          : ''
        pureUrl = (typeof (replace) === 'undefined' ? base : url.replace(reg, replace)) + newQuerys
        if (typeof (rule.methods) !== 'undefined' && rule.methods.length > 0) {
          rule.methods.map((methodName) => {
            pureUrl = methods[methodName](pureUrl)
          })
        }
        break
      }
    }
    console.log('PureUrl is ' + pureUrl)
    return pureUrl
  }

  // New Element
  const show = document.createElement('div')
  const input = document.createElement('p')
  show.id = 'haveiread'
  input.contentEditable = true
  show.appendChild(input)

  var current_url = document.URL
  let base_url = 'https://api.mickir.me'
  let read_url = base_url + '/read/' + username
  let comment_url = base_url + '/comment/' + username

  void (function getinfo (url) {
    let theurl = new URL(read_url)
    let data = {
      url: url
    }
    theurl.search = new URLSearchParams(data)
    window.GM.xmlHttpRequest({
      method: 'GET',
      url: theurl,
      onload: response => {
        let data = JSON.parse(response.responseText)
        console.log(data)
        input.innerText = (data.read && (data.comment || '看过')) || '没看过'
        show.style.color = (data.read && 'red') || 'green'
        if (input.innerText !== 'n' && data.read && data.count < 10) {
          show.style.display = 'block'
        }
      }
    })
  }(dms_get_pure_url(current_url)))
  function update (url, len) {
    let data = {
      url: dms_get_pure_url(url),
      title: document.title,
      password: key,
      len: len
    }
    window.GM.xmlHttpRequest(
      { method: 'POST',
        url: read_url,
        data: JSON.stringify(data),
        onload: response => {
          console.log(JSON.parse(response.responseText))
        }
      }
    )
  }

  function comment (url, text) {
    let data = {
      url: dms_get_pure_url(url),
      comment: text,
      password: key
    }
    window.GM.xmlHttpRequest({
      method: 'POST',
      url: comment_url,
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

  let timer
  let before = new Date()
  let len = 0
  window.addEventListener('focus', () => {
    before = new Date()
    window.clearTimeout(timer)
  })
  window.addEventListener('blur', () => {
    len += (new Date()) - before
    timer = window.setTimeout(() => update(current_url, len), 30 * 60 * 1000)
  })
  window.addEventListener('beforeunload', (event) => {
    // 按ms计算
    update(current_url, (new Date()) - before + len)
  })

  document.body.appendChild(show)
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
      comment(current_url, input.innerText)
    }
  })
  // 检测url变化。
  // 修改pushState的方式既不安全又可能再次被覆盖
  window.setInterval(() => {
    if (current_url !== document.URL) {
      update(current_url, (new Date()) - before + len)
      len = 0
      before = new Date()
      current_url = document.URL
    }
  }, 1000)
})()
