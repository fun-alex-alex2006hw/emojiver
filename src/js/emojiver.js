/*
 * Emojiver.js
 * @author Jacob Kim(astyfx, astyfx@gmail.com)
 * @license MIT
 * @description Emoji widget for chat or text
 */

(function(root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory);
  } else if (typeof exports === 'object') {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory();
  } else {
      // Browser globals (root is window)
      root.emojiver = factory();
  }
})(this, function() {
  'use strict';

  var debug = {
    info: function(message) {
      console.log('[INFO] ' + message);
    }
  }; 

  function _isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  }

  function _extend(obj, props) {
    for(var prop in props) {
      if(props.hasOwnProperty(prop)) {
        obj[prop] = props[prop];
      }
    }
    return obj;
  }

  function _getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while(element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
  }
  
  function _getOffset(el) {
    var box = el.getBoundingClientRect();
    return {
      y: box.top  + (window.pageYOffset || el.scrollTop)  - (el.clientTop || 0),
      x: box.left + (window.pageXOffset || el.scrollLeft) - (el.clientLeft || 0)
    }
  } 

  function _getChildren(n, skipMe){
    var r = [];
    for (; n; n = n.nextSibling) 
      if (n.nodeType === 1 && n != skipMe)
        r.push(n);        
    return r;
  };

  function _getSiblingsNotMe(n) {
    return _getChildren(n.parentNode.firstChild, n);
  }

  function _getSiblings(n) {
    return _getChildren(n.parentNode.firstChild);
  }

  function _setStyle(el, style) {
    for(var prop in style)
      el.style[prop] = style[prop];
  }

  // jquery style functions
  /**
  * from http://toddmotto.com/creating-jquery-style-functions-in-javascript-hasclass-addclass-removeclass-toggleclass/
  */
  function _hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
  }

  function _addClass(elem, className) {
    if (!_hasClass(elem, className)) {
      elem.className += ' ' + className;
    }
  }

  function _removeClass(elem, className) {
    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
    if (_hasClass(elem, className)) {
      while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
        newClass = newClass.replace(' ' + className + ' ', ' ');
      }
      elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
  } 
  
  function _toggleClass(elem, className) {
    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ' ) + ' ';
    if (_hasClass(elem, className)) {
      while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
        newClass = newClass.replace( ' ' + className + ' ' , ' ' );
      }
      elem.className = newClass.replace(/^\s+|\s+$/g, '');
    } else {
      elem.className += ' ' + className;
    }
  }

  function _toggleClassRemoveSiblings(el, nc) {
    var siblings = _getSiblings(el);
    siblings.forEach(function(si) {
      _removeClass(si, nc);
    });

   _addClass(el, nc);
  }

  function _toggleMenu(current, selector) {
    var targets = document.querySelectorAll(selector);
    [].forEach.call(targets, function(t) {
      t.style.backgroundPositionY = '0px';
    });
    current.style.backgroundPositionY = '-21px';
  }

  function _insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  // position Widget on events(window resizing,  
  function _positionWidget(el, config) {
    var elPos = _getOffset(el);
    var style = {};
    var leftFactor = config.boxLeftFactor ? config.boxLeftFactor : 0;
    var leftPos = elPos.x - config.boxWidth + leftFactor;
    leftPos = leftPos < 0 ? 0 : leftPos;
    style.left = leftPos + 'px';
    switch(config.position) {
      case 'top':
        if(elPos.y < config.inputHeight) {
          style.top= config.inputHeight + 22 + 'px';
        } else if(elPos.y > config.inputHeight + config.boxHeight) {
          style.top = elPos.y - (config.inputHeight + config.boxHeight - 5) + 'px';
        }
        break;
      case 'bottom':
        style.top = elPos.y + config.inputHeight + 5 + 'px';
        break;
    }
    return style;
  }

  /* 
  * ed: emoji data
  * edCategories: emoji categories with unified
  * edNames: emoji matcher for name
  */ 
  var ed = %ed%;
  var edCategories = %cate%;
  var edNames = %names%;

  var eNameRegex = /\:[a-zA-Z0-9-_+]+\:/g;
  // thansk to https://github.com/mathiasbynens/emoji-regex
  // added url regex advanced for link message
  var eRegex = /(https?|ftp|file):\/\/[a-z0-9-_.]+(:[0-9]+|)(\/.*)?|\s|\:[a-zA-Z0-9-_+]+\:|[a-zA-Z0-9]+|[^\u0000-\u007F]+|[/`~!@#$%^&*()_|+\-=?;:\'\",.<>\{\}\[\]\\\//]|(?:0\u20E3|1\u20E3|2\u20E3|3\u20E3|4\u20E3|5\u20E3|6\u20E3|7\u20E3|8\u20E3|9\u20E3|#\u20E3|\*\u20E3|\uD83C(?:\uDDE6\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF2|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFD|\uDDFF)|\uDDE7\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFC|\uDDFE|\uDDFF)|\uDDE8\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDE9\uD83C(?:\uDDEA|\uDDEC|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDFF)|\uDDEA\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDED|\uDDF7|\uDDF8|\uDDF9|\uDDFA)|\uDDEB\uD83C(?:\uDDEE|\uDDEF|\uDDF0|\uDDF2|\uDDF4|\uDDF7)|\uDDEC\uD83C(?:\uDDE6|\uDDE7|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDEE|\uDDF1|\uDDF2|\uDDF3|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFC|\uDDFE)|\uDDED\uD83C(?:\uDDF0|\uDDF2|\uDDF3|\uDDF7|\uDDF9|\uDDFA)|\uDDEE\uD83C(?:\uDDE8|\uDDE9|\uDDEA|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF6|\uDDF7|\uDDF8|\uDDF9)|\uDDEF\uD83C(?:\uDDEA|\uDDF2|\uDDF4|\uDDF5)|\uDDF0\uD83C(?:\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDF2|\uDDF3|\uDDF5|\uDDF7|\uDDFC|\uDDFE|\uDDFF)|\uDDF1\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDEE|\uDDF0|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFE)|\uDDF2\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF5|\uDDF6|\uDDF7|\uDDF8|\uDDF9|\uDDFA|\uDDFB|\uDDFC|\uDDFD|\uDDFE|\uDDFF)|\uDDF3\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEB|\uDDEC|\uDDEE|\uDDF1|\uDDF4|\uDDF5|\uDDF7|\uDDFA|\uDDFF)|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C(?:\uDDE6|\uDDEA|\uDDEB|\uDDEC|\uDDED|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF7|\uDDF8|\uDDF9|\uDDFC|\uDDFE)|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C(?:\uDDEA|\uDDF4|\uDDF8|\uDDFA|\uDDFC)|\uDDF8\uD83C(?:\uDDE6|\uDDE7|\uDDE8|\uDDE9|\uDDEA|\uDDEC|\uDDED|\uDDEE|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF8|\uDDF9|\uDDFB|\uDDFD|\uDDFE|\uDDFF)|\uDDF9\uD83C(?:\uDDE6|\uDDE8|\uDDE9|\uDDEB|\uDDEC|\uDDED|\uDDEF|\uDDF0|\uDDF1|\uDDF2|\uDDF3|\uDDF4|\uDDF7|\uDDF9|\uDDFB|\uDDFC|\uDDFF)|\uDDFA\uD83C(?:\uDDE6|\uDDEC|\uDDF2|\uDDF8|\uDDFE|\uDDFF)|\uDDFB\uD83C(?:\uDDE6|\uDDE8|\uDDEA|\uDDEC|\uDDEE|\uDDF3|\uDDFA)|\uDDFC\uD83C(?:\uDDEB|\uDDF8)|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C(?:\uDDEA|\uDDF9)|\uDDFF\uD83C(?:\uDDE6|\uDDF2|\uDDFC)))|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD79\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED0\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3]|\uD83E[\uDD10-\uDD18\uDD80-\uDD84\uDDC0]/ig;

  var categories = ['People', 'Nature', 'Foods', 'Celebration', 'Activity', 'Places', 'Symbols'];
  var colorsets = ['gray'];


  var defaultConfig = {
    mode: 'name', // choices = ['name', 'render']
    position: 'top', // choices = ['top', 'left', 'right', 'bottom']
    inputHeight: 38, // input height for box position
    headerHeight: 36,
    boxWidth: 288, // emojiver widget box width
    boxHeight: 230, // emojiver widget box height
    sheetSize: 35, // 3500% , sheet image background size that multiplied by 100
    getFactor: function(sheetSize) {
      // emoji image position factor
      return 100 / (sheetSize - 1);
    },
    sheetUrl: "./sheet_apple_64.png", // Emoji Icon sheet
    iconUrl: "./emoji-icon.png", // Emoji Menu and Toggle icon
    style: {
    },
    toggleStyle: {},
    renderStyle: {
      width: 16,
      height: 16
    }
  };


  var emojiver = (function() {
    function init(el, config) {
      // support jquery selector
      el = el[0] || el;

      config = _extend(defaultConfig, config);

      var doc = document;
      var win = window;

      var container = document.createElement('div');
      container.className = 'emojiver';

      var header = document.createElement('div');
      header.className = 'emojiver__header';

      var content = document.createElement('div');
      content.className = 'emojiver__content';
      content.style.height = config.boxHeight - config.headerHeight + 'px';

      categories.forEach(function(f) {
        var category = document.createElement('ul');
        category.className = 'emojiver__category is-' + f.toLowerCase();
        category.dataset.category = f.toLowerCase();
        edCategories[f].forEach(function(item) {
          // emojiWrapper
          var emojiWrapper = document.createElement('li');
          emojiWrapper.className = 'emojiver__wrapper';
          emojiWrapper.dataset.name = ed[item][0];

          // emojiAnchor
          var emojiAnchor = document.createElement('a');
          emojiAnchor.className = 'emojiver__anchor';
          emojiAnchor.dataset.name = ed[item][0];
          emojiAnchor.dataset.render = ed[item][1];

          // WARNING related to gulp script
          emojiAnchor.dataset.sheetX = ed[item][2]; 
          emojiAnchor.dataset.sheetY = ed[item][3];

          emojiAnchor.onmouseover = function(e) {
            e = e || event;

            var color = colorsets[Math.floor(Math.random() * colorsets.length)];
            if(e.target.className.indexOf('emojiver__anchor') > -1)
              e.target.className = 'emojiver__anchor is-' + color; 
          }

          emojiAnchor.onclick = function(e) {
            e = e || event;

            var name, render;
            if(e.target.tagName === 'SPAN') {
              name = e.target.parentNode.dataset['name'];
              render = e.target.parentNode.dataset['render'];
            } else if(e.target.tagName === 'A') {
              name = e.target.dataset['name'];
              render = e.target.dataset['render'];
            }

            if(config.mode === 'name') {
              el.value += ':' + name + ':';
            } else if(config.mode === 'render') {
              el.value += render;
            }
            var emojiver = document.querySelector('.emojiver');
            _toggleClass(emojiver, 'is-open');
            _toggleClass(toggle, 'is-active');

            // focus input to send message
            el.focus();
          }

          // emojiItem
          var posFactor = config.getFactor(config.sheetSize);
          var sX = ed[item][2], sY = ed[item][3];

          var emojiItem = document.createElement('span');
          emojiItem.className = 'emojiver__item';
          emojiItem.style.background = 'url("' + config.sheetUrl + '")';
          emojiItem.style.width = "22px";
          emojiItem.style.height = "22px";
          emojiItem.style.backgroundPosition = posFactor * sX + '% ' + posFactor * sY + '%';
          emojiItem.style.backgroundSize = config.sheetSize + '00%';
          emojiItem.innerHTML = ':' + ed[item][0] + ':';

          // insert elements 
          emojiAnchor.appendChild(emojiItem);
          emojiWrapper.appendChild(emojiAnchor);
          category.appendChild(emojiWrapper); 
        });
        
        content.appendChild(category); 

        var menu = document.createElement('a');
        menu.className = 'emojiver__header__menu';
        menu.dataset.category = f.toLowerCase();

        var menuIcon = document.createElement('span');
        menuIcon.className = 'emojiver__header__menuIcon';
        menuIcon.style.background = 'url("' + config.iconUrl + '")';

        var cname = f.toLowerCase();
        switch(cname) {
          case 'people':
            menuIcon.style.backgroundPositionX = '0px';
            break;
          case 'nature':
            menuIcon.style.backgroundPositionX = '-18px';
            break;
          case 'foods':
            menuIcon.style.backgroundPositionX = '-37px';
            break;
          case 'celebration':
            menuIcon.style.backgroundPositionX = '-55px';
            break;
          case 'activity':
            menuIcon.style.backgroundPositionX = '-72px';
            break;
          case 'places':
            menuIcon.style.backgroundPositionX = '-90px';
            break;
          case 'symbols':
            menuIcon.style.backgroundPositionX = '-107px';
            break;
        }

        menu.appendChild(menuIcon);

        // menu events
        menu.onclick = function(e) {
          var targetCategory = container.querySelector('.emojiver__category[data-category="' + f.toLowerCase() + '"]');
          _toggleClassRemoveSiblings(targetCategory, 'is-active');
          _toggleClassRemoveSiblings(this, 'is-active');
          _toggleMenu(menuIcon, '.emojiver__header__menuIcon');
        }
        header.appendChild(menu);
        container.appendChild(header);
        container.appendChild(content);
      });

      var toggle = document.createElement('a');
      toggle.className = 'emojiver__toggle';
      var toggleIcon = document.createElement('span');
      toggleIcon.style.backgroundImage = 'url("' + config.iconUrl + '")';
      toggleIcon.style.width = '20px';
      toggleIcon.style.height = '20px';

      toggle.appendChild(toggleIcon);
      if(!_isEmpty(config.toggleStyle)) {
        _setStyle(toggle, config.toggleStyle);
      }
      toggle.onclick = function(e) {
        var emojiver = document.querySelector('.emojiver');

        // size
        emojiver.style.width = typeof config.boxWidth === 'number' ? config.boxWidth + 'px' : config.boxWidth;
        emojiver.style.height = typeof config.boxHeight === 'number' ? config.boxHeight + 'px' : config.boxHeight;

        var first = document.querySelector('.emojiver__category[data-category="people"]');
        var firstMenu = document.querySelector('.emojiver__header__menu[data-category="people"]');

        _toggleClassRemoveSiblings(first, 'is-active');
        _toggleClassRemoveSiblings(firstMenu, 'is-active');

        // set emojiver widget style
        _setStyle(emojiver, _positionWidget(toggle, config)); // set top left
        _setStyle(emojiver, config.style);

        _toggleClass(emojiver, 'is-open');
        _toggleClass(toggle, 'is-active');

        var firstIcon = firstMenu.children[0];
        _toggleMenu(firstIcon, '.emojiver__header__menuIcon');
      };

      _insertAfter(toggle, el);
      document.body.insertBefore(container, document.body.childNodes[document.body.childNodes.length - 1]);
    }

    // emoji name replacer
    // TODO enable custom replacer
    function _replacer(name, cf) {
      var cf = _extend(defaultConfig, cf);
      var replacerStyle = cf.style;

      // check passed name is valid
      if(!edNames.hasOwnProperty(name.replace(/\:/g, "")))
        return document.createTextNode(name);

      name = name.replace(/\:/g, "");

      if(cf.mode === 'render') {
        return document.createTextNode(ed[edNames[name][0]][1]);
      }

      var emoji = document.createElement('span');
      var posFactor = cf.getFactor(cf.sheetSize);
      var sX = edNames[name][1], sY = edNames[name][2];
      var style = {
        width: '22px',
        height: '22px',
        background: 'url("' + cf.sheetUrl + '")',
        backgroundPosition: posFactor * sX + '% ' + posFactor * sY + '%',
        textIndent: '-9999px',
        display: 'inline-block',
        backgroundSize: cf.sheetSize + '00%'
      }

      // support custom emoji span size
      if(!_isEmpty(cf.style)) {
        if('width' in cf.style) 
          cf.style.width = typeof cf.style.width === 'number' ? cf.style.width + 'px' : cf.style.width;
        if('height' in cf.style) 
          cf.style.height = typeof cf.style.height === 'number' ? cf.style.height + 'px' : cf.style.height;
      }

      style = _extend(style, replacerStyle);
      _setStyle(emoji, style);
      emoji.innerHTML = ':' + name + ':';
      return emoji;
    }    
    function renderToTarget(text, targetEl, config) {
      text.replace(eRegex, function(match) {
        console.log(match);
        if(/\:[a-zA-Z0-9-_+]+\:/g.test(match)) {
          // test emoji string like " :smile: "
          targetEl.appendChild(_replacer(match, config));
        } else {
          // TODO convert unicode emoji to image
          if(/(https?|ftp|file):\/\/[a-z0-9-_.]+(:[0-9]+|)(\/.*)?/ig.test(match)) {
            var anchorNode = document.createElement('a');
            anchorNode.setAttribute('href', match);
            anchorNode.innerHTML = match;
            targetEl.appendChild(anchorNode);
          } else {
            var textNode = document.createTextNode(match);
            targetEl.appendChild(textNode);
          }
        }
      });
      return targetEl;
    }
    function render(text, config) {
      var tempEl = document.createElement('div');
      text.replace(eRegex, function(match) {
        if(/\:[a-zA-Z0-9-_+]+\:/g.test(match)) {
          // test emoji string like " :smile: "
          tempEl.appendChild(_replacer(match, config));
        } else {
          if(/(https?|ftp|file):\/\/[a-z0-9-_.]+(:[0-9]+|)(\/.*)?/ig.test(match)) {
            var anchorNode = document.createElement('a');
            anchorNode.setAttribute('href', match);
            anchorNode.innerHTML = match;
            tempEl.appendChild(anchorNode);
          } else {
            var textNode = document.createTextNode(match);
            tempEl.appendChild(textNode);
          }
        }
      });
      return tempEl.innerHTML;
    }
    return {
      init: init,
      render: render,
      renderToTarget: renderToTarget,
      defaultConfig: defaultConfig
    };
  })();
  return emojiver;
});
