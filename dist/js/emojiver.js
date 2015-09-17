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

  // toggle siblings class
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
  var ed = {"2049":["interrobang","⁉",0,3,276],"2122":["tm","™",0,4,263],"2139":["information_source","ℹ",0,5,252],"2194":["left_right_arrow","↔",0,6,227],"2195":["arrow_up_down","↕",0,7,226],"2196":["arrow_upper_left","↖",0,8,225],"2197":["arrow_upper_right","↗",0,9,222],"2198":["arrow_lower_right","↘",0,10,223],"2199":["arrow_lower_left","↙",0,11,224],"2600":["sunny","☀",0,31,90],"2601":["cloud","☁",0,32,92],"2611":["ballot_box_with_check","☑",0,34,300],"2614":["umbrella","☔",1,0,95],"2615":["coffee","☕",1,1,51],"2648":["aries","♈",1,9,190],"2649":["taurus","♉",1,10,191],"2650":["sagittarius","♐",1,17,198],"2651":["capricorn","♑",1,18,199],"2652":["aquarius","♒",1,19,200],"2653":["pisces","♓",1,20,201],"2660":["spades","♠",1,21,296],"2663":["clubs","♣",1,22,297],"2665":["hearts","♥",1,23,298],"2666":["diamonds","♦",1,24,299],"2668":["hotsprings","♨",1,25,292],"2693":["anchor","⚓",1,28,40],"2702":["scissors","✂",2,10,110],"2705":["white_check_mark","✅",2,11,169],"2708":["airplane","✈",2,12,38],"2709":["email","✉",2,13,72],"2712":["black_nib","✒",2,33,117],"2714":["heavy_check_mark","✔",2,34,261],"2716":["heavy_multiplication_x","✖",3,0,260],"2728":["sparkles","✨",3,1,15],"2733":["eight_spoked_asterisk","✳",3,2,167],"2734":["eight_pointed_black_star","✴",3,3,170],"2744":["snowflake","❄",3,4,97],"2747":["sparkle","❇",3,5,166],"2753":["question","❓",3,8,272],"2754":["grey_question","❔",3,9,274],"2755":["grey_exclamation","❕",3,10,273],"2757":["exclamation","❗",3,11,271],"2764":["heart","❤",3,12,25],"2795":["heavy_plus_sign","➕",3,13,256],"2796":["heavy_minus_sign","➖",3,14,257],"2797":["heavy_division_sign","➗",3,15,259],"2934":["arrow_heading_up","⤴",3,19,231],"2935":["arrow_heading_down","⤵",3,20,232],"3030":["wavy_dash","〰",3,28,258],"3297":["congratulations","㊗",3,30,151],"3299":["secret","㊙",3,31,150],"00A9":["copyright","©",0,0,264],"00AE":["registered","®",0,1,265],"203C":["bangbang","‼",0,2,275],"21A9":["leftwards_arrow_with_hook","↩",0,12,230],"21AA":["arrow_right_hook","↪",0,13,229],"231A":["watch","⌚",0,14,1],"231B":["hourglass","⌛",0,15,7],"23E9":["fast_forward","⏩",0,16,214],"23EA":["rewind","⏪",0,17,215],"23EB":["arrow_double_up","⏫",0,18,216],"23EC":["arrow_double_down","⏬",0,19,217],"23F0":["alarm_clock","⏰",0,20,5],"23F3":["hourglass_flowing_sand","⏳",0,21,6],"24C2":["m","Ⓜ",0,22,286],"25AA":["black_small_square","▪",0,23,312],"25AB":["white_small_square","▫",0,24,313],"25B6":["arrow_forward","▶",0,25,210],"25C0":["arrow_backward","◀",0,26,211],"25FB":["white_medium_square","◻",0,27,317],"25FC":["black_medium_square","◼",0,28,316],"25FD":["white_medium_small_square","◽",0,29,319],"25FE":["black_medium_small_square","◾",0,30,318],"260E":["phone","☎",0,33,15],"261D":["point_up","☝",1,2,139],"263A":["relaxed","☺",1,8,13],"264A":["gemini","♊",1,11,192],"264B":["cancer","♋",1,12,193],"264C":["leo","♌",1,13,194],"264D":["virgo","♍",1,14,195],"264E":["libra","♎",1,15,196],"264F":["scorpius","♏",1,16,197],"267B":["recycle","♻",1,26,293],"267F":["wheelchair","♿",1,27,206],"26A0":["warning","⚠",1,29,291],"26A1":["zap","⚡",1,30,87],"26AA":["white_circle","⚪",1,31,301],"26AB":["black_circle","⚫",1,32,302],"26BD":["soccer","⚽",1,33,16],"26BE":["baseball","⚾",1,34,19],"26C4":["snowman","⛄",2,0,10],"26C5":["partly_sunny","⛅",2,1,91],"26CE":["ophiuchus","⛎",2,2,287],"26D4":["no_entry","⛔",2,3,139],"26EA":["church","⛪",2,4,78],"26F2":["fountain","⛲",2,5,59],"26F3":["golf","⛳",2,6,22],"26F5":["boat","⛵",2,7,43],"26FA":["tent","⛺",2,8,14],"26FD":["fuelpump","⛽",2,9,32],"270A":["fist","✊",2,14,147],"270B":["hand","✋",2,20,148],"270C":["v","✌",2,26,145],"270F":["pencil2","✏",2,32,118],"274C":["x","❌",3,6,277],"274E":["negative_squared_cross_mark","❎",3,7,168],"27A1":["arrow_right","➡",3,16,218],"27B0":["curly_loop","➰",3,17,268],"27BF":["loop","➿",3,18,269],"2B05":["arrow_left","⬅",3,21,219],"2B06":["arrow_up","⬆",3,22,220],"2B07":["arrow_down","⬇",3,23,221],"2B1B":["black_large_square","⬛",3,24,314],"2B1C":["white_large_square","⬜",3,25,315],"2B50":["star","⭐",3,26,99],"2B55":["o","⭕",3,27,278],"303D":["part_alternation_mark","〽",3,29,270],"1F004":["mahjong","🀄",3,32,50],"1F0CF":["black_joker","🃏",3,33,49],"1F170":["a","🅰",3,34,174],"1F171":["b","🅱",4,0,175],"1F17E":["o2","🅾",4,1,178],"1F17F":["parking","🅿",4,2,181],"1F18E":["ab","🆎",4,3,176],"1F191":["cl","🆑",4,4,177],"1F192":["cool","🆒",4,5,183],"1F193":["free","🆓",4,6,184],"1F194":["id","🆔",4,7,180],"1F195":["new","🆕",4,8,185],"1F196":["ng","🆖",4,9,186],"1F197":["ok","🆗",4,10,187],"1F198":["sos","🆘",4,11,179],"1F199":["up","🆙",4,12,188],"1F19A":["vs","🆚",4,13,173],"1F201":["koko","🈁",4,14,163],"1F202":["sa","🈂",4,15,162],"1F21A":["u7121","🈚",4,16,156],"1F22F":["u6307","🈯",4,17,164],"1F232":["u7981","🈲",4,18,154],"1F233":["u7a7a","🈳",4,19,161],"1F234":["u5408","🈴",4,20,152],"1F235":["u6e80","🈵",4,21,153],"1F236":["u6709","🈶",4,22,155],"1F237":["u6708","🈷",4,23,159],"1F238":["u7533","🈸",4,24,157],"1F239":["u5272","🈹",4,25,160],"1F23A":["u55b6","🈺",4,26,158],"1F250":["ideograph_advantage","🉐",4,27,148],"1F251":["accept","🉑",4,28,147],"1F300":["cyclone","🌀",4,29,285],"1F301":["foggy","🌁",4,30,57],"1F302":["closed_umbrella","🌂",4,31,31],"1F303":["night_with_stars","🌃",4,32,64],"1F304":["sunrise_over_mountains","🌄",4,33,101],"1F305":["sunrise","🌅",4,34,102],"1F306":["city_sunset","🌆",5,0,63],"1F307":["city_sunrise","🌇",5,1,62],"1F308":["rainbow","🌈",5,2,103],"1F309":["bridge_at_night","🌉",5,3,65],"1F30A":["ocean","🌊",5,4,104],"1F30B":["volcano","🌋",5,5,105],"1F30C":["milky_way","🌌",5,6,106],"1F30D":["earth_africa","🌍",5,7,110],"1F30E":["earth_americas","🌎",5,8,111],"1F30F":["earth_asia","🌏",5,9,112],"1F310":["globe_with_meridians","🌐",5,10,109],"1F311":["new_moon","🌑",5,11,113],"1F312":["waxing_crescent_moon","🌒",5,12,114],"1F313":["first_quarter_moon","🌓",5,13,115],"1F314":["moon","🌔",5,14,116],"1F315":["full_moon","🌕",5,15,117],"1F316":["waning_gibbous_moon","🌖",5,16,118],"1F317":["last_quarter_moon","🌗",5,17,119],"1F318":["waning_crescent_moon","🌘",5,18,120],"1F319":["crescent_moon","🌙",5,19,89],"1F31A":["new_moon_with_face","🌚",5,20,121],"1F31B":["first_quarter_moon_with_face","🌛",5,21,123],"1F31C":["last_quarter_moon_with_face","🌜",5,22,124],"1F31D":["full_moon_with_face","🌝",5,23,122],"1F31E":["sun_with_face","🌞",5,24,125],"1F31F":["star2","🌟",5,25,98],"1F320":["stars","🌠",5,26,100],"1F330":["chestnut","🌰",5,27,20],"1F331":["seedling","🌱",5,28,1],"1F332":["evergreen_tree","🌲",5,29,2],"1F333":["deciduous_tree","🌳",5,30,3],"1F334":["palm_tree","🌴",5,31,4],"1F335":["cactus","🌵",5,32,5],"1F337":["tulip","🌷",5,33,6],"1F338":["cherry_blossom","🌸",5,34,7],"1F339":["rose","🌹",6,0,8],"1F33A":["hibiscus","🌺",6,1,9],"1F33B":["sunflower","🌻",6,2,10],"1F33C":["blossom","🌼",6,3,11],"1F33D":["corn","🌽",6,4,3],"1F33E":["ear_of_rice","🌾",6,5,13],"1F33F":["herb","🌿",6,6,14],"1F340":["four_leaf_clover","🍀",6,7,15],"1F341":["maple_leaf","🍁",6,8,16],"1F342":["fallen_leaf","🍂",6,9,17],"1F343":["leaves","🍃",6,10,18],"1F344":["mushroom","🍄",6,11,19],"1F345":["tomato","🍅",6,12,1],"1F346":["eggplant","🍆",6,13,2],"1F347":["grapes","🍇",6,14,5],"1F348":["melon","🍈",6,15,6],"1F349":["watermelon","🍉",6,16,7],"1F34A":["tangerine","🍊",6,17,8],"1F34B":["lemon","🍋",6,18,9],"1F34C":["banana","🍌",6,19,10],"1F34D":["pineapple","🍍",6,20,11],"1F34E":["apple","🍎",6,21,12],"1F34F":["green_apple","🍏",6,22,13],"1F350":["pear","🍐",6,23,14],"1F351":["peach","🍑",6,24,15],"1F352":["cherries","🍒",6,25,16],"1F353":["strawberry","🍓",6,26,17],"1F354":["hamburger","🍔",6,27,18],"1F355":["pizza","🍕",6,28,19],"1F356":["meat_on_bone","🍖",6,29,20],"1F357":["poultry_leg","🍗",6,30,21],"1F358":["rice_cracker","🍘",6,31,22],"1F359":["rice_ball","🍙",6,32,23],"1F35A":["rice","🍚",6,33,24],"1F35B":["curry","🍛",6,34,25],"1F35C":["ramen","🍜",7,0,26],"1F35D":["spaghetti","🍝",7,1,27],"1F35E":["bread","🍞",7,2,28],"1F35F":["fries","🍟",7,3,29],"1F360":["sweet_potato","🍠",7,4,4],"1F361":["dango","🍡",7,5,30],"1F362":["oden","🍢",7,6,31],"1F363":["sushi","🍣",7,7,32],"1F364":["fried_shrimp","🍤",7,8,33],"1F365":["fish_cake","🍥",7,9,34],"1F366":["icecream","🍦",7,10,35],"1F367":["shaved_ice","🍧",7,11,36],"1F368":["ice_cream","🍨",7,12,37],"1F369":["doughnut","🍩",7,13,38],"1F36A":["cookie","🍪",7,14,39],"1F36B":["chocolate_bar","🍫",7,15,40],"1F36C":["candy","🍬",7,16,41],"1F36D":["lollipop","🍭",7,17,42],"1F36E":["custard","🍮",7,18,43],"1F36F":["honey_pot","🍯",7,19,44],"1F370":["cake","🍰",7,20,45],"1F371":["bento","🍱",7,21,46],"1F372":["stew","🍲",7,22,47],"1F373":["egg","🍳",7,23,48],"1F374":["fork_and_knife","🍴",7,24,49],"1F375":["tea","🍵",7,25,50],"1F376":["sake","🍶",7,26,52],"1F377":["wine_glass","🍷",7,27,53],"1F378":["cocktail","🍸",7,28,54],"1F379":["tropical_drink","🍹",7,29,55],"1F37A":["beer","🍺",7,30,56],"1F37B":["beers","🍻",7,31,57],"1F37C":["baby_bottle","🍼",7,32,58],"1F380":["ribbon","🎀",7,33,1],"1F381":["gift","🎁",7,34,2],"1F382":["birthday","🎂",8,0,3],"1F383":["jack_o_lantern","🎃",8,1,4],"1F384":["christmas_tree","🎄",8,2,5],"1F385":["santa","🎅",8,3,106],"1F386":["fireworks","🎆",8,9,9],"1F387":["sparkler","🎇",8,10,10],"1F388":["balloon","🎈",8,11,13],"1F389":["tada","🎉",8,12,11],"1F38A":["confetti_ball","🎊",8,13,12],"1F38B":["tanabata_tree","🎋",8,14,6],"1F38C":["crossed_flags","🎌",8,15,22],"1F38D":["bamboo","🎍",8,16,7],"1F38E":["dolls","🎎",8,17,19],"1F38F":["flags","🎏",8,18,20],"1F390":["wind_chime","🎐",8,19,21],"1F391":["rice_scene","🎑",8,20,8],"1F392":["school_satchel","🎒",8,21,36],"1F393":["mortar_board","🎓",8,22,17],"1F3A0":["carousel_horse","🎠",8,23,51],"1F3A1":["ferris_wheel","🎡",8,24,52],"1F3A2":["roller_coaster","🎢",8,25,53],"1F3A3":["fishing_pole_and_fish","🎣",8,26,15],"1F3A4":["microphone","🎤",8,27,35],"1F3A5":["movie_camera","🎥",8,28,10],"1F3A6":["cinema","🎦",8,29,254],"1F3A7":["headphones","🎧",8,30,34],"1F3A8":["art","🎨",8,31,41],"1F3A9":["tophat","🎩",8,32,38],"1F3AA":["circus_tent","🎪",8,33,39],"1F3AB":["ticket","🎫",8,34,37],"1F3AC":["clapper","🎬",9,0,40],"1F3AD":["performing_arts","🎭",9,1,36],"1F3AE":["video_game","🎮",9,2,47],"1F3AF":["dart","🎯",9,3,42],"1F3B0":["slot_machine","🎰",9,4,45],"1F3B1":["8ball","🎱",9,5,43],"1F3B2":["game_die","🎲",9,6,46],"1F3B3":["bowling","🎳",9,7,44],"1F3B4":["flower_playing_cards","🎴",9,8,48],"1F3B5":["musical_note","🎵",9,9,31],"1F3B6":["notes","🎶",9,10,32],"1F3B7":["saxophone","🎷",9,11,29],"1F3B8":["guitar","🎸",9,12,27],"1F3B9":["musical_keyboard","🎹",9,13,26],"1F3BA":["trumpet","🎺",9,14,30],"1F3BB":["violin","🎻",9,15,28],"1F3BC":["musical_score","🎼",9,16,33],"1F3BD":["running_shirt_with_sash","🎽",9,17,24],"1F3BE":["tennis","🎾",9,18,20],"1F3BF":["ski","🎿",9,19,9],"1F3C0":["basketball","🏀",9,20,17],"1F3C1":["checkered_flag","🏁",9,21,25],"1F3C2":["snowboarder","🏂",9,22,8],"1F3C3":["runner","🏃",9,23,1],"1F3C4":["surfer","🏄",9,29,6],"1F3C6":["trophy","🏆",10,0,23],"1F3C7":["horse_racing","🏇",10,1,13],"1F3C8":["football","🏈",10,7,18],"1F3C9":["rugby_football","🏉",10,8,21],"1F3CA":["swimmer","🏊",10,9,5],"1F3E0":["house","🏠",10,15,66],"1F3E1":["house_with_garden","🏡",10,16,67],"1F3E2":["office","🏢",10,17,68],"1F3E3":["post_office","🏣",10,18,71],"1F3E4":["european_post_office","🏤",10,19,72],"1F3E5":["hospital","🏥",10,20,73],"1F3E6":["bank","🏦",10,21,74],"1F3E7":["atm","🏧",10,22,189],"1F3E8":["hotel","🏨",10,23,75],"1F3E9":["love_hotel","🏩",10,24,76],"1F3EA":["convenience_store","🏪",10,25,79],"1F3EB":["school","🏫",10,26,80],"1F3EC":["department_store","🏬",10,27,69],"1F3ED":["factory","🏭",10,28,70],"1F3EE":["izakaya_lantern","🏮",10,29,23],"1F3EF":["japanese_castle","🏯",10,30,61],"1F3F0":["european_castle","🏰",10,31,60],"1F3FB":["skin-tone-2","🏻",10,32,null],"1F3FC":["skin-tone-3","🏼",10,33,null],"1F3FD":["skin-tone-4","🏽",10,34,null],"1F3FE":["skin-tone-5","🏾",11,0,null],"1F3FF":["skin-tone-6","🏿",11,1,null],"1F400":["rat","🐀",11,2,21],"1F401":["mouse2","🐁",11,3,22],"1F402":["ox","🐂",11,4,25],"1F403":["water_buffalo","🐃",11,5,26],"1F404":["cow2","🐄",11,6,27],"1F405":["tiger2","🐅",11,7,29],"1F406":["leopard","🐆",11,8,30],"1F407":["rabbit2","🐇",11,9,32],"1F408":["cat2","🐈",11,10,34],"1F409":["dragon","🐉",11,11,67],"1F40A":["crocodile","🐊",11,12,69],"1F40B":["whale2","🐋",11,13,73],"1F40C":["snail","🐌",11,14,81],"1F40D":["snake","🐍",11,15,70],"1F40E":["racehorse","🐎",11,16,36],"1F40F":["ram","🐏",11,17,38],"1F410":["goat","🐐",11,18,40],"1F411":["sheep","🐑",11,19,39],"1F412":["monkey","🐒",11,20,66],"1F413":["rooster","🐓",11,21,41],"1F414":["chicken","🐔",11,22,42],"1F415":["dog2","🐕",11,23,55],"1F416":["pig2","🐖",11,24,52],"1F417":["boar","🐗",11,25,51],"1F418":["elephant","🐘",11,26,48],"1F419":["octopus","🐙",11,27,76],"1F41A":["shell","🐚",11,28,80],"1F41B":["bug","🐛",11,29,82],"1F41C":["ant","🐜",11,30,83],"1F41D":["bee","🐝",11,31,84],"1F41E":["beetle","🐞",11,32,85],"1F41F":["fish","🐟",11,33,77],"1F420":["tropical_fish","🐠",11,34,78],"1F421":["blowfish","🐡",12,0,79],"1F422":["turtle","🐢",12,1,71],"1F423":["hatching_chick","🐣",12,2,44],"1F424":["baby_chick","🐤",12,3,43],"1F425":["hatched_chick","🐥",12,4,45],"1F426":["bird","🐦",12,5,46],"1F427":["penguin","🐧",12,6,47],"1F428":["koala","🐨",12,7,60],"1F429":["poodle","🐩",12,8,56],"1F42A":["dromedary_camel","🐪",12,9,49],"1F42B":["camel","🐫",12,10,50],"1F42C":["dolphin","🐬",12,11,75],"1F42D":["mouse","🐭",12,12,23],"1F42E":["cow","🐮",12,13,28],"1F42F":["tiger","🐯",12,14,31],"1F430":["rabbit","🐰",12,15,33],"1F431":["cat","🐱",12,16,35],"1F432":["dragon_face","🐲",12,17,68],"1F433":["whale","🐳",12,18,74],"1F434":["horse","🐴",12,19,37],"1F435":["monkey_face","🐵",12,20,62],"1F436":["dog","🐶",12,21,57],"1F437":["pig","🐷",12,22,53],"1F438":["frog","🐸",12,23,72],"1F439":["hamster","🐹",12,24,24],"1F43A":["wolf","🐺",12,25,58],"1F43B":["bear","🐻",12,26,59],"1F43C":["panda_face","🐼",12,27,61],"1F43D":["pig_nose","🐽",12,28,54],"1F43E":["feet","🐾",12,29,86],"1F440":["eyes","👀",12,30,131],"1F442":["ear","👂",12,31,130],"1F443":["nose","👃",13,2,132],"1F444":["lips","👄",13,8,133],"1F445":["tongue","👅",13,9,135],"1F446":["point_up_2","👆",13,10,140],"1F447":["point_down","👇",13,16,141],"1F448":["point_left","👈",13,22,142],"1F449":["point_right","👉",13,28,143],"1F44A":["facepunch","👊",13,34,146],"1F44B":["wave","👋",14,5,136],"1F44C":["ok_hand","👌",14,11,144],"1F44D":["+1","👍",14,17,137],"1F44E":["-1","👎",14,23,138],"1F44F":["clap","👏",14,29,152],"1F450":["open_hands","👐",15,0,150],"1F451":["crown","👑",15,6,18],"1F452":["womans_hat","👒",15,7,39],"1F453":["eyeglasses","👓",15,8,38],"1F454":["necktie","👔",15,9,50],"1F455":["shirt","👕",15,10,49],"1F456":["jeans","👖",15,11,51],"1F457":["dress","👗",15,12,46],"1F458":["kimono","👘",15,13,47],"1F459":["bikini","👙",15,14,45],"1F45A":["womans_clothes","👚",15,15,48],"1F45B":["purse","👛",15,16,33],"1F45C":["handbag","👜",15,17,34],"1F45D":["pouch","👝",15,18,32],"1F45E":["mans_shoe","👞",15,19,43],"1F45F":["athletic_shoe","👟",15,20,44],"1F460":["high_heel","👠",15,21,41],"1F461":["sandal","👡",15,22,40],"1F462":["boot","👢",15,23,42],"1F463":["footprints","👣",15,24,68],"1F464":["bust_in_silhouette","👤",15,25,69],"1F465":["busts_in_silhouette","👥",15,26,70],"1F466":["boy","👦",15,27,71],"1F467":["girl","👧",15,33,72],"1F468":["man","👨",16,4,73],"1F469":["woman","👩",16,10,74],"1F46A":["family","👪",16,16,77],"1F46B":["couple","👫",16,17,90],"1F46C":["two_men_holding_hands","👬",16,18,91],"1F46D":["two_women_holding_hands","👭",16,19,92],"1F46E":["cop","👮",16,20,93],"1F46F":["dancers","👯",16,26,94],"1F470":["bride_with_veil","👰",16,27,95],"1F471":["person_with_blond_hair","👱",16,33,96],"1F472":["man_with_gua_pi_mao","👲",17,4,97],"1F473":["man_with_turban","👳",17,10,98],"1F474":["older_man","👴",17,16,99],"1F475":["older_woman","👵",17,22,100],"1F476":["baby","👶",17,28,101],"1F477":["construction_worker","👷",17,34,102],"1F478":["princess","👸",18,5,103],"1F479":["japanese_ogre","👹",18,11,108],"1F47A":["japanese_goblin","👺",18,12,109],"1F47B":["ghost","👻",18,13,107],"1F47C":["angel","👼",18,14,105],"1F47D":["alien","👽",18,20,112],"1F47E":["space_invader","👾",18,21,113],"1F47F":["imp","👿",18,22,10],"1F480":["skull","💀",18,23,111],"1F481":["information_desk_person","💁",18,24,115],"1F482":["guardsman","💂",18,30,104],"1F483":["dancer","💃",19,1,3],"1F484":["lipstick","💄",19,7,37],"1F485":["nail_care","💅",19,8,129],"1F486":["massage","💆",19,14,121],"1F487":["haircut","💇",19,20,122],"1F488":["barber","💈",19,26,56],"1F489":["syringe","💉",19,27,57],"1F48A":["pill","💊",19,28,58],"1F48B":["kiss","💋",19,29,134],"1F48C":["love_letter","💌",19,30,27],"1F48D":["ring","💍",19,31,24],"1F48E":["gem","💎",19,32,30],"1F48F":["couplekiss","💏",19,33,126],"1F490":["bouquet","💐",19,34,12],"1F491":["couple_with_heart","💑",20,0,123],"1F492":["wedding","💒",20,1,77],"1F493":["heartbeat","💓",20,2,30],"1F494":["broken_heart","💔",20,3,26],"1F495":["two_hearts","💕",20,4,28],"1F496":["sparkling_heart","💖",20,5,32],"1F497":["heartpulse","💗",20,6,31],"1F498":["cupid","💘",20,7,33],"1F499":["blue_heart","💙",20,8,39],"1F49A":["green_heart","💚",20,9,38],"1F49B":["yellow_heart","💛",20,10,37],"1F49C":["purple_heart","💜",20,11,36],"1F49D":["gift_heart","💝",20,12,34],"1F49E":["revolving_hearts","💞",20,13,29],"1F49F":["heart_decoration","💟",20,14,35],"1F4A0":["diamond_shape_with_a_dot_inside","💠",20,15,295],"1F4A1":["bulb","💡",20,16,24],"1F4A2":["anger","💢",20,17,294],"1F4A3":["bomb","💣",20,18,66],"1F4A4":["zzz","💤",20,19,130],"1F4A5":["boom","💥",20,20,16],"1F4A6":["sweat_drops","💦",20,21,94],"1F4A7":["droplet","💧",20,22,93],"1F4A8":["dash","💨",20,23,96],"1F4A9":["hankey","💩",20,24,110],"1F4AA":["muscle","💪",20,25,149],"1F4AB":["dizzy","💫",20,31,14],"1F4AC":["speech_balloon","💬",20,32,134],"1F4AD":["thought_balloon","💭",20,33,133],"1F4AE":["white_flower","💮",20,34,149],"1F4AF":["100","💯",21,0,279],"1F4B0":["moneybag","💰",21,1,29],"1F4B1":["currency_exchange","💱",21,2,266],"1F4B2":["heavy_dollar_sign","💲",21,3,267],"1F4B3":["credit_card","💳",21,4,27],"1F4B4":["yen","💴",21,5,51],"1F4B5":["dollar","💵",21,6,54],"1F4B6":["euro","💶",21,7,52],"1F4B7":["pound","💷",21,8,53],"1F4B8":["money_with_wings","💸",21,9,28],"1F4B9":["chart","💹",21,10,165],"1F4BA":["seat","💺",21,11,39],"1F4BB":["computer","💻",21,12,4],"1F4BC":["briefcase","💼",21,13,35],"1F4BD":["minidisc","💽",21,14,17],"1F4BE":["floppy_disk","💾",21,15,18],"1F4BF":["cd","💿",21,16,19],"1F4C0":["dvd","📀",21,17,20],"1F4C1":["file_folder","📁",21,18,115],"1F4C2":["open_file_folder","📂",21,19,116],"1F4C3":["page_with_curl","📃",21,20,86],"1F4C4":["page_facing_up","📄",21,21,85],"1F4C5":["date","📅",21,22,91],"1F4C6":["calendar","📆",21,23,92],"1F4C7":["card_index","📇",21,24,106],"1F4C8":["chart_with_upwards_trend","📈",21,25,88],"1F4C9":["chart_with_downwards_trend","📉",21,26,89],"1F4CA":["bar_chart","📊",21,27,90],"1F4CB":["clipboard","📋",21,28,96],"1F4CC":["pushpin","📌",21,29,109],"1F4CD":["round_pushpin","📍",21,30,112],"1F4CE":["paperclip","📎",21,31,108],"1F4CF":["straight_ruler","📏",21,32,113],"1F4D0":["triangular_ruler","📐",21,33,111],"1F4D1":["bookmark_tabs","📑",21,34,87],"1F4D2":["ledger","📒",22,0,100],"1F4D3":["notebook","📓",22,1,98],"1F4D4":["notebook_with_decorative_cover","📔",22,2,99],"1F4D5":["closed_book","📕",22,3,101],"1F4D6":["book","📖",22,4,97],"1F4D7":["green_book","📗",22,5,102],"1F4D8":["blue_book","📘",22,6,103],"1F4D9":["orange_book","📙",22,7,104],"1F4DA":["books","📚",22,8,105],"1F4DB":["name_badge","📛",22,9,140],"1F4DC":["scroll","📜",22,10,95],"1F4DD":["memo","📝",22,11,119],"1F4DE":["telephone_receiver","📞",22,12,14],"1F4DF":["pager","📟",22,13,13],"1F4E0":["fax","📠",22,14,16],"1F4E1":["satellite","📡",22,15,26],"1F4E2":["loudspeaker","📢",22,16,125],"1F4E3":["mega","📣",22,17,124],"1F4E4":["outbox_tray","📤",22,18,77],"1F4E5":["inbox_tray","📥",22,19,76],"1F4E6":["package","📦",22,20,78],"1F4E7":["e-mail","📧",22,21,75],"1F4E8":["incoming_envelope","📨",22,22,74],"1F4E9":["envelope_with_arrow","📩",22,23,73],"1F4EA":["mailbox_closed","📪",22,24,81],"1F4EB":["mailbox","📫",22,25,82],"1F4EC":["mailbox_with_mail","📬",22,26,83],"1F4ED":["mailbox_with_no_mail","📭",22,27,84],"1F4EE":["postbox","📮",22,28,80],"1F4EF":["postal_horn","📯",22,29,79],"1F4F0":["newspaper","📰",22,30,70],"1F4F1":["iphone","📱",22,31,2],"1F4F2":["calling","📲",22,32,3],"1F4F3":["vibration_mode","📳",22,33,171],"1F4F4":["mobile_phone_off","📴",22,34,172],"1F4F5":["no_mobile_phones","📵",23,0,145],"1F4F6":["signal_strength","📶",23,1,253],"1F4F7":["camera","📷",23,2,8],"1F4F9":["video_camera","📹",23,3,9],"1F4FA":["tv","📺",23,4,11],"1F4FB":["radio","📻",23,5,12],"1F4FC":["vhs","📼",23,6,21],"1F500":["twisted_rightwards_arrows","🔀",23,7,233],"1F501":["repeat","🔁",23,8,234],"1F502":["repeat_one","🔂",23,9,235],"1F503":["arrows_clockwise","🔃",23,10,262],"1F504":["arrows_counterclockwise","🔄",23,11,228],"1F505":["low_brightness","🔅",23,12,93],"1F506":["high_brightness","🔆",23,13,94],"1F507":["mute","🔇",23,14,129],"1F508":["speaker","🔈",23,15,126],"1F509":["sound","🔉",23,16,127],"1F50A":["loud_sound","🔊",23,17,128],"1F50B":["battery","🔋",23,18,22],"1F50C":["electric_plug","🔌",23,19,23],"1F50D":["mag","🔍",23,20,136],"1F50E":["mag_right","🔎",23,21,137],"1F50F":["lock_with_ink_pen","🔏",23,22,120],"1F510":["closed_lock_with_key","🔐",23,23,121],"1F511":["key","🔑",23,24,71],"1F512":["lock","🔒",23,25,122],"1F513":["unlock","🔓",23,26,123],"1F514":["bell","🔔",23,27,131],"1F515":["no_bell","🔕",23,28,132],"1F516":["bookmark","🔖",23,29,69],"1F517":["link","🔗",23,30,107],"1F518":["radio_button","🔘",23,31,303],"1F519":["back","🔙",23,32,281],"1F51A":["end","🔚",23,33,280],"1F51B":["on","🔛",23,34,282],"1F51C":["soon","🔜",24,0,284],"1F51D":["top","🔝",24,1,283],"1F51E":["underage","🔞",24,2,146],"1F51F":["keycap_ten","🔟",24,3,247],"1F520":["capital_abcd","🔠",24,4,251],"1F521":["abcd","🔡",24,5,250],"1F522":["1234","🔢",24,6,248],"1F523":["symbols","🔣",24,7,255],"1F524":["abc","🔤",24,8,249],"1F525":["fire","🔥",24,9,88],"1F526":["flashlight","🔦",24,10,25],"1F527":["wrench","🔧",24,11,62],"1F528":["hammer","🔨",24,12,65],"1F529":["nut_and_bolt","🔩",24,13,64],"1F52A":["hocho","🔪",24,14,63],"1F52B":["gun","🔫",24,15,68],"1F52C":["microscope","🔬",24,16,59],"1F52D":["telescope","🔭",24,17,60],"1F52E":["crystal_ball","🔮",24,18,61],"1F52F":["six_pointed_star","🔯",24,19,288],"1F530":["beginner","🔰",24,20,289],"1F531":["trident","🔱",24,21,290],"1F532":["black_square_button","🔲",24,22,320],"1F533":["white_square_button","🔳",24,23,321],"1F534":["red_circle","🔴",24,24,304],"1F535":["large_blue_circle","🔵",24,25,305],"1F536":["large_orange_diamond","🔶",24,26,310],"1F537":["large_blue_diamond","🔷",24,27,311],"1F538":["small_orange_diamond","🔸",24,28,308],"1F539":["small_blue_diamond","🔹",24,29,309],"1F53A":["small_red_triangle","🔺",24,30,306],"1F53B":["small_red_triangle_down","🔻",24,31,307],"1F53C":["arrow_up_small","🔼",24,32,212],"1F53D":["arrow_down_small","🔽",24,33,213],"1F550":["clock1","🕐",24,34,322],"1F551":["clock2","🕑",25,0,323],"1F552":["clock3","🕒",25,1,324],"1F553":["clock4","🕓",25,2,325],"1F554":["clock5","🕔",25,3,326],"1F555":["clock6","🕕",25,4,327],"1F556":["clock7","🕖",25,5,328],"1F557":["clock8","🕗",25,6,329],"1F558":["clock9","🕘",25,7,330],"1F559":["clock10","🕙",25,8,331],"1F55A":["clock11","🕚",25,9,332],"1F55B":["clock12","🕛",25,10,333],"1F55C":["clock130","🕜",25,11,334],"1F55D":["clock230","🕝",25,12,335],"1F55E":["clock330","🕞",25,13,336],"1F55F":["clock430","🕟",25,14,337],"1F560":["clock530","🕠",25,15,338],"1F561":["clock630","🕡",25,16,339],"1F562":["clock730","🕢",25,17,340],"1F563":["clock830","🕣",25,18,341],"1F564":["clock930","🕤",25,19,342],"1F565":["clock1030","🕥",25,20,343],"1F566":["clock1130","🕦",25,21,344],"1F567":["clock1230","🕧",25,22,345],"1F5FB":["mount_fuji","🗻",25,23,107],"1F5FC":["tokyo_tower","🗼",25,24,58],"1F5FD":["statue_of_liberty","🗽",25,25,55],"1F5FE":["japan","🗾",25,26,108],"1F5FF":["moyai","🗿",25,27,56],"1F600":["grinning","😀",25,28,1],"1F601":["grin","😁",25,29,2],"1F602":["joy","😂",25,30,3],"1F603":["smiley","😃",25,31,4],"1F604":["smile","😄",25,32,5],"1F605":["sweat_smile","😅",25,33,6],"1F606":["laughing","😆",25,34,7],"1F607":["innocent","😇",26,0,8],"1F608":["smiling_imp","😈",26,1,9],"1F609":["wink","😉",26,2,11],"1F60A":["blush","😊",26,3,12],"1F60B":["yum","😋",26,4,14],"1F60C":["relieved","😌",26,5,15],"1F60D":["heart_eyes","😍",26,6,16],"1F60E":["sunglasses","😎",26,7,17],"1F60F":["smirk","😏",26,8,18],"1F610":["neutral_face","😐",26,9,19],"1F611":["expressionless","😑",26,10,20],"1F612":["unamused","😒",26,11,21],"1F613":["sweat","😓",26,12,22],"1F614":["pensive","😔",26,13,23],"1F615":["confused","😕",26,14,24],"1F616":["confounded","😖",26,15,25],"1F617":["kissing","😗",26,16,26],"1F618":["kissing_heart","😘",26,17,27],"1F619":["kissing_smiling_eyes","😙",26,18,28],"1F61A":["kissing_closed_eyes","😚",26,19,29],"1F61B":["stuck_out_tongue","😛",26,20,30],"1F61C":["stuck_out_tongue_winking_eye","😜",26,21,31],"1F61D":["stuck_out_tongue_closed_eyes","😝",26,22,32],"1F61E":["disappointed","😞",26,23,33],"1F61F":["worried","😟",26,24,34],"1F620":["angry","😠",26,25,35],"1F621":["rage","😡",26,26,36],"1F622":["cry","😢",26,27,37],"1F623":["persevere","😣",26,28,38],"1F624":["triumph","😤",26,29,39],"1F625":["disappointed_relieved","😥",26,30,40],"1F626":["frowning","😦",26,31,41],"1F627":["anguished","😧",26,32,42],"1F628":["fearful","😨",26,33,43],"1F629":["weary","😩",26,34,44],"1F62A":["sleepy","😪",27,0,45],"1F62B":["tired_face","😫",27,1,46],"1F62C":["grimacing","😬",27,2,47],"1F62D":["sob","😭",27,3,48],"1F62E":["open_mouth","😮",27,4,49],"1F62F":["hushed","😯",27,5,50],"1F630":["cold_sweat","😰",27,6,51],"1F631":["scream","😱",27,7,52],"1F632":["astonished","😲",27,8,53],"1F633":["flushed","😳",27,9,54],"1F634":["sleeping","😴",27,10,55],"1F635":["dizzy_face","😵",27,11,56],"1F636":["no_mouth","😶",27,12,57],"1F637":["mask","😷",27,13,58],"1F638":["smile_cat","😸",27,14,59],"1F639":["joy_cat","😹",27,15,60],"1F63A":["smiley_cat","😺",27,16,61],"1F63B":["heart_eyes_cat","😻",27,17,62],"1F63C":["smirk_cat","😼",27,18,63],"1F63D":["kissing_cat","😽",27,19,64],"1F63E":["pouting_cat","😾",27,20,65],"1F63F":["crying_cat_face","😿",27,21,66],"1F640":["scream_cat","🙀",27,22,67],"1F645":["no_good","🙅",27,23,116],"1F646":["ok_woman","🙆",27,29,117],"1F647":["bow","🙇",28,0,114],"1F648":["see_no_evil","🙈",28,6,63],"1F649":["hear_no_evil","🙉",28,7,64],"1F64A":["speak_no_evil","🙊",28,8,65],"1F64B":["raising_hand","🙋",28,9,118],"1F64C":["raised_hands","🙌",28,15,151],"1F64D":["person_frowning","🙍",28,21,120],"1F64E":["person_with_pouting_face","🙎",28,27,119],"1F64F":["pray","🙏",28,33,153],"1F680":["rocket","🚀",29,4,36],"1F681":["helicopter","🚁",29,5,37],"1F682":["steam_locomotive","🚂",29,6,3],"1F683":["railway_car","🚃",29,7,1],"1F684":["bullettrain_side","🚄",29,8,6],"1F685":["bullettrain_front","🚅",29,9,7],"1F686":["train2","🚆",29,10,8],"1F687":["metro","🚇",29,11,9],"1F688":["light_rail","🚈",29,12,10],"1F689":["station","🚉",29,13,11],"1F68A":["tram","🚊",29,14,12],"1F68B":["train","🚋",29,15,4],"1F68C":["bus","🚌",29,16,13],"1F68D":["oncoming_bus","🚍",29,17,14],"1F68E":["trolleybus","🚎",29,18,15],"1F68F":["busstop","🚏",29,19,31],"1F690":["minibus","🚐",29,20,16],"1F691":["ambulance","🚑",29,21,17],"1F692":["fire_engine","🚒",29,22,18],"1F693":["police_car","🚓",29,23,19],"1F694":["oncoming_police_car","🚔",29,24,20],"1F695":["taxi","🚕",29,25,22],"1F696":["oncoming_taxi","🚖",29,26,23],"1F697":["car","🚗",29,27,24],"1F698":["oncoming_automobile","🚘",29,28,25],"1F699":["blue_car","🚙",29,29,26],"1F69A":["truck","🚚",29,30,27],"1F69B":["articulated_lorry","🚛",29,31,28],"1F69C":["tractor","🚜",29,32,29],"1F69D":["monorail","🚝",29,33,5],"1F69E":["mountain_railway","🚞",29,34,2],"1F69F":["suspension_railway","🚟",30,0,46],"1F6A0":["mountain_cableway","🚠",30,1,45],"1F6A1":["aerial_tramway","🚡",30,2,44],"1F6A2":["ship","🚢",30,3,41],"1F6A3":["rowboat","🚣",30,4,4],"1F6A4":["speedboat","🚤",30,10,42],"1F6A5":["traffic_light","🚥",30,11,35],"1F6A6":["vertical_traffic_light","🚦",30,12,34],"1F6A7":["construction","🚧",30,13,33],"1F6A8":["rotating_light","🚨",30,14,21],"1F6A9":["triangular_flag_on_post","🚩",30,15,114],"1F6AA":["door","🚪",30,16,52],"1F6AB":["no_entry_sign","🚫",30,17,138],"1F6AC":["smoking","🚬",30,18,67],"1F6AD":["no_smoking","🚭",30,19,208],"1F6AE":["put_litter_in_its_place","🚮",30,20,209],"1F6AF":["do_not_litter","🚯",30,21,142],"1F6B0":["potable_water","🚰",30,22,207],"1F6B1":["non-potable_water","🚱",30,23,144],"1F6B2":["bike","🚲",30,24,30],"1F6B3":["no_bicycles","🚳",30,25,143],"1F6B4":["bicyclist","🚴",30,26,11],"1F6B5":["mountain_bicyclist","🚵",30,32,12],"1F6B6":["walking","🚶",31,3,2],"1F6B7":["no_pedestrians","🚷",31,9,141],"1F6B8":["children_crossing","🚸",31,10,135],"1F6B9":["mens","🚹",31,11,203],"1F6BA":["womens","🚺",31,12,204],"1F6BB":["restroom","🚻",31,13,202],"1F6BC":["baby_symbol","🚼",31,14,205],"1F6BD":["toilet","🚽",31,15,55],"1F6BE":["wc","🚾",31,16,182],"1F6BF":["shower","🚿",31,17,53],"1F6C0":["bath","🛀",31,18,7],"1F6C1":["bathtub","🛁",31,24,54],"1F6C2":["passport_control","🛂",31,25,47],"1F6C3":["customs","🛃",31,26,48],"1F6C4":["baggage_claim","🛄",31,27,49],"1F6C5":["left_luggage","🛅",31,28,50],"0023-20E3":["hash","#⃣",31,29,236],"0030-20E3":["zero","0⃣",31,30,237],"0031-20E3":["one","1⃣",31,31,238],"0032-20E3":["two","2⃣",31,32,239],"0033-20E3":["three","3⃣",31,33,240],"0034-20E3":["four","4⃣",31,34,241],"0035-20E3":["five","5⃣",32,0,242],"0036-20E3":["six","6⃣",32,1,243],"0037-20E3":["seven","7⃣",32,2,244],"0038-20E3":["eight","8⃣",32,3,245],"0039-20E3":["nine","9⃣",32,4,246],"1F1E6-1F1EA":["flag-ae","🇦🇪",32,5,121],"1F1E6-1F1F9":["flag-at","🇦🇹",32,6,82],"1F1E6-1F1FA":["flag-au","🇦🇺",32,7,81],"1F1E7-1F1EA":["flag-be","🇧🇪",32,8,83],"1F1E7-1F1F7":["flag-br","🇧🇷",32,9,84],"1F1E8-1F1E6":["flag-ca","🇨🇦",32,10,85],"1F1E8-1F1ED":["flag-ch","🇨🇭",32,11,117],"1F1E8-1F1F1":["flag-cl","🇨🇱",32,12,86],"1F1E8-1F1F3":["flag-cn","🇨🇳",32,13,87],"1F1E8-1F1F4":["flag-co","🇨🇴",32,14,88],"1F1E9-1F1EA":["flag-de","🇩🇪",32,15,92],"1F1E9-1F1F0":["flag-dk","🇩🇰",32,16,89],"1F1EA-1F1F8":["flag-es","🇪🇸",32,17,115],"1F1EB-1F1EE":["flag-fi","🇫🇮",32,18,90],"1F1EB-1F1F7":["flag-fr","🇫🇷",32,19,91],"1F1EC-1F1E7":["flag-gb","🇬🇧",32,20,119],"1F1ED-1F1F0":["flag-hk","🇭🇰",32,21,93],"1F1EE-1F1E9":["flag-id","🇮🇩",32,22,95],"1F1EE-1F1EA":["flag-ie","🇮🇪",32,23,96],"1F1EE-1F1F1":["flag-il","🇮🇱",32,24,97],"1F1EE-1F1F3":["flag-in","🇮🇳",32,25,94],"1F1EE-1F1F9":["flag-it","🇮🇹",32,26,98],"1F1EF-1F1F5":["flag-jp","🇯🇵",32,27,99],"1F1F0-1F1F7":["flag-kr","🇰🇷",32,28,100],"1F1F2-1F1F4":["flag-mo","🇲🇴",32,29,101],"1F1F2-1F1FD":["flag-mx","🇲🇽",32,30,103],"1F1F2-1F1FE":["flag-my","🇲🇾",32,31,102],"1F1F3-1F1F1":["flag-nl","🇳🇱",32,32,104],"1F1F3-1F1F4":["flag-no","🇳🇴",32,33,106],"1F1F3-1F1FF":["flag-nz","🇳🇿",32,34,105],"1F1F5-1F1ED":["flag-ph","🇵🇭",33,0,107],"1F1F5-1F1F1":["flag-pl","🇵🇱",33,1,108],"1F1F5-1F1F7":["flag-pr","🇵🇷",33,2,110],"1F1F5-1F1F9":["flag-pt","🇵🇹",33,3,109],"1F1F7-1F1FA":["flag-ru","🇷🇺",33,4,111],"1F1F8-1F1E6":["flag-sa","🇸🇦",33,5,112],"1F1F8-1F1EA":["flag-se","🇸🇪",33,6,116],"1F1F8-1F1EC":["flag-sg","🇸🇬",33,7,113],"1F1F9-1F1F7":["flag-tr","🇹🇷",33,8,118],"1F1FA-1F1F8":["flag-us","🇺🇸",33,9,120],"1F1FB-1F1F3":["flag-vn","🇻🇳",33,10,122],"1F1FF-1F1E6":["flag-za","🇿🇦",33,11,114],"1F468-200D-1F468-200D-1F466":["man-man-boy","👨‍👨‍👦",33,12,85],"1F468-200D-1F468-200D-1F466-200D-1F466":["man-man-boy-boy","👨‍👨‍👦‍👦",33,13,88],"1F468-200D-1F468-200D-1F467":["man-man-girl","👨‍👨‍👧",33,14,86],"1F468-200D-1F468-200D-1F467-200D-1F466":["man-man-girl-boy","👨‍👨‍👧‍👦",33,15,87],"1F468-200D-1F468-200D-1F467-200D-1F467":["man-man-girl-girl","👨‍👨‍👧‍👧",33,16,89],"1F468-200D-1F469-200D-1F466":["man-woman-boy","👨‍👩‍👦",33,17,75],"1F468-200D-1F469-200D-1F466-200D-1F466":["man-woman-boy-boy","👨‍👩‍👦‍👦",33,18,78],"1F468-200D-1F469-200D-1F467":["man-woman-girl","👨‍👩‍👧",33,19,76],"1F468-200D-1F469-200D-1F467-200D-1F466":["man-woman-girl-boy","👨‍👩‍👧‍👦",33,20,null],"1F468-200D-1F469-200D-1F467-200D-1F467":["man-woman-girl-girl","👨‍👩‍👧‍👧",33,21,79],"1F468-200D-2764-FE0F-200D-1F468":["man-heart-man","👨‍❤️‍👨",33,22,125],"1F468-200D-2764-FE0F-200D-1F48B-200D-1F468":["man-kiss-man","👨‍❤️‍💋‍👨",33,23,128],"1F469-200D-1F469-200D-1F466":["woman-woman-boy","👩‍👩‍👦",33,24,80],"1F469-200D-1F469-200D-1F466-200D-1F466":["woman-woman-boy-boy","👩‍👩‍👦‍👦",33,25,83],"1F469-200D-1F469-200D-1F467":["woman-woman-girl","👩‍👩‍👧",33,26,81],"1F469-200D-1F469-200D-1F467-200D-1F466":["woman-woman-girl-boy","👩‍👩‍👧‍👦",33,27,82],"1F469-200D-1F469-200D-1F467-200D-1F467":["woman-woman-girl-girl","👩‍👩‍👧‍👧",33,28,84],"1F469-200D-2764-FE0F-200D-1F469":["woman-heart-woman","👩‍❤️‍👩",33,29,124],"1F469-200D-2764-FE0F-200D-1F48B-200D-1F469":["woman-kiss-woman","👩‍❤️‍💋‍👩",33,30,127]};
  var edCategories = {"Symbols":["231A","1F4F1","1F4F2","1F4BB","23F0","23F3","231B","1F4F7","1F4F9","1F3A5","1F4FA","1F4FB","1F4DF","1F4DE","260E","1F4E0","1F4BD","1F4BE","1F4BF","1F4C0","1F4FC","1F50B","1F50C","1F4A1","1F526","1F4E1","1F4B3","1F4B8","1F4B0","1F48E","1F302","1F45D","1F45B","1F45C","1F4BC","1F392","1F484","1F453","1F452","1F461","1F460","1F462","1F45E","1F45F","1F459","1F457","1F458","1F45A","1F455","1F454","1F456","1F6AA","1F6BF","1F6C1","1F6BD","1F488","1F489","1F48A","1F52C","1F52D","1F52E","1F527","1F52A","1F529","1F528","1F4A3","1F6AC","1F52B","1F516","1F4F0","1F511","2709","1F4E9","1F4E8","1F4E7","1F4E5","1F4E4","1F4E6","1F4EF","1F4EE","1F4EA","1F4EB","1F4EC","1F4ED","1F4C4","1F4C3","1F4D1","1F4C8","1F4C9","1F4CA","1F4C5","1F4C6","1F505","1F506","1F4DC","1F4CB","1F4D6","1F4D3","1F4D4","1F4D2","1F4D5","1F4D7","1F4D8","1F4D9","1F4DA","1F4C7","1F517","1F4CE","1F4CC","2702","1F4D0","1F4CD","1F4CF","1F6A9","1F4C1","1F4C2","2712","270F","1F4DD","1F50F","1F510","1F512","1F513","1F4E3","1F4E2","1F508","1F509","1F50A","1F507","1F4A4","1F514","1F515","1F4AD","1F4AC","1F6B8","1F50D","1F50E","1F6AB","26D4","1F4DB","1F6B7","1F6AF","1F6B3","1F6B1","1F4F5","1F51E","1F251","1F250","1F4AE","3299","3297","1F234","1F235","1F232","1F236","1F21A","1F238","1F23A","1F237","1F239","1F233","1F202","1F201","1F22F","1F4B9","2747","2733","274E","2705","2734","1F4F3","1F4F4","1F19A","1F170","1F171","1F18E","1F191","1F17E","1F198","1F194","1F17F","1F6BE","1F192","1F193","1F195","1F196","1F197","1F199","1F3E7","2648","2649","264A","264B","264C","264D","264E","264F","2650","2651","2652","2653","1F6BB","1F6B9","1F6BA","1F6BC","267F","1F6B0","1F6AD","1F6AE","25B6","25C0","1F53C","1F53D","23E9","23EA","23EB","23EC","27A1","2B05","2B06","2B07","2197","2198","2199","2196","2195","2194","1F504","21AA","21A9","2934","2935","1F500","1F501","1F502","0023-20E3","0030-20E3","0031-20E3","0032-20E3","0033-20E3","0034-20E3","0035-20E3","0036-20E3","0037-20E3","0038-20E3","0039-20E3","1F51F","1F522","1F524","1F521","1F520","2139","1F4F6","1F3A6","1F523","2795","2796","3030","2797","2716","2714","1F503","2122","00A9","00AE","1F4B1","1F4B2","27B0","27BF","303D","2757","2753","2755","2754","203C","2049","274C","2B55","1F4AF","1F51A","1F519","1F51B","1F51D","1F51C","1F300","24C2","26CE","1F52F","1F530","1F531","26A0","2668","267B","1F4A2","1F4A0","2660","2663","2665","2666","2611","26AA","26AB","1F518","1F534","1F535","1F53A","1F53B","1F538","1F539","1F536","1F537","25AA","25AB","2B1B","2B1C","25FC","25FB","25FE","25FD","1F532","1F533","1F550","1F551","1F552","1F553","1F554","1F555","1F556","1F557","1F558","1F559","1F55A","1F55B","1F55C","1F55D","1F55E","1F55F","1F560","1F561","1F562","1F563","1F564","1F565","1F566","1F567"],"Nature":["1F331","1F332","1F333","1F334","1F335","1F337","1F338","1F339","1F33A","1F33B","1F33C","1F490","1F33E","1F33F","1F340","1F341","1F342","1F343","1F344","1F330","1F400","1F401","1F42D","1F439","1F402","1F403","1F404","1F42E","1F405","1F406","1F42F","1F407","1F430","1F408","1F431","1F40E","1F434","1F40F","1F411","1F410","1F413","1F414","1F424","1F423","1F425","1F426","1F427","1F418","1F42A","1F42B","1F417","1F416","1F437","1F43D","1F415","1F429","1F436","1F43A","1F43B","1F428","1F43C","1F435","1F648","1F649","1F64A","1F412","1F409","1F432","1F40A","1F40D","1F422","1F438","1F40B","1F433","1F42C","1F419","1F41F","1F420","1F421","1F41A","1F40C","1F41B","1F41C","1F41D","1F41E","1F43E","26A1","1F525","1F319","2600","26C5","2601","1F4A7","1F4A6","2614","1F4A8","2744","1F31F","2B50","1F320","1F304","1F305","1F308","1F30A","1F30B","1F30C","1F5FB","1F5FE","1F310","1F30D","1F30E","1F30F","1F311","1F312","1F313","1F314","1F315","1F316","1F317","1F318","1F31A","1F31D","1F31B","1F31C","1F31E"],"Foods":["1F345","1F346","1F33D","1F360","1F347","1F348","1F349","1F34A","1F34B","1F34C","1F34D","1F34E","1F34F","1F350","1F351","1F352","1F353","1F354","1F355","1F356","1F357","1F358","1F359","1F35A","1F35B","1F35C","1F35D","1F35E","1F35F","1F361","1F362","1F363","1F364","1F365","1F366","1F367","1F368","1F369","1F36A","1F36B","1F36C","1F36D","1F36E","1F36F","1F370","1F371","1F372","1F373","1F374","1F375","2615","1F376","1F377","1F378","1F379","1F37A","1F37B","1F37C"],"People":["1F600","1F601","1F602","1F603","1F604","1F605","1F606","1F607","1F608","1F47F","1F609","1F60A","263A","1F60B","1F60C","1F60D","1F60E","1F60F","1F610","1F611","1F612","1F613","1F614","1F615","1F616","1F617","1F618","1F619","1F61A","1F61B","1F61C","1F61D","1F61E","1F61F","1F620","1F621","1F622","1F623","1F624","1F625","1F626","1F627","1F628","1F629","1F62A","1F62B","1F62C","1F62D","1F62E","1F62F","1F630","1F631","1F632","1F633","1F634","1F635","1F636","1F637","1F638","1F639","1F63A","1F63B","1F63C","1F63D","1F63E","1F63F","1F640","1F463","1F464","1F465","1F466","1F467","1F468","1F469","1F468-200D-1F469-200D-1F466","1F468-200D-1F469-200D-1F467","1F46A","1F468-200D-1F469-200D-1F466-200D-1F466","1F468-200D-1F469-200D-1F467-200D-1F467","1F469-200D-1F469-200D-1F466","1F469-200D-1F469-200D-1F467","1F469-200D-1F469-200D-1F467-200D-1F466","1F469-200D-1F469-200D-1F466-200D-1F466","1F469-200D-1F469-200D-1F467-200D-1F467","1F468-200D-1F468-200D-1F466","1F468-200D-1F468-200D-1F467","1F468-200D-1F468-200D-1F467-200D-1F466","1F468-200D-1F468-200D-1F466-200D-1F466","1F468-200D-1F468-200D-1F467-200D-1F467","1F46B","1F46C","1F46D","1F46E","1F46F","1F470","1F471","1F472","1F473","1F474","1F475","1F476","1F477","1F478","1F482","1F47C","1F385","1F47B","1F479","1F47A","1F4A9","1F480","1F47D","1F47E","1F647","1F481","1F645","1F646","1F64B","1F64E","1F64D","1F486","1F487","1F491","1F469-200D-2764-FE0F-200D-1F469","1F468-200D-2764-FE0F-200D-1F468","1F48F","1F469-200D-2764-FE0F-200D-1F48B-200D-1F469","1F468-200D-2764-FE0F-200D-1F48B-200D-1F468","1F485","1F442","1F440","1F443","1F444","1F48B","1F445","1F44B","1F44D","1F44E","261D","1F446","1F447","1F448","1F449","1F44C","270C","1F44A","270A","270B","1F4AA","1F450","1F64C","1F44F","1F64F"],"Places":["1F683","1F69E","1F682","1F68B","1F69D","1F684","1F685","1F686","1F687","1F688","1F689","1F68A","1F68C","1F68D","1F68E","1F690","1F691","1F692","1F693","1F694","1F6A8","1F695","1F696","1F697","1F698","1F699","1F69A","1F69B","1F69C","1F6B2","1F68F","26FD","1F6A7","1F6A6","1F6A5","1F680","1F681","2708","1F4BA","2693","1F6A2","1F6A4","26F5","1F6A1","1F6A0","1F69F","1F6C2","1F6C3","1F6C4","1F6C5","1F4B4","1F4B6","1F4B7","1F4B5","1F5FD","1F5FF","1F301","1F5FC","26F2","1F3F0","1F3EF","1F307","1F306","1F303","1F309","1F3E0","1F3E1","1F3E2","1F3EC","1F3ED","1F3E3","1F3E4","1F3E5","1F3E6","1F3E8","1F3E9","1F492","26EA","1F3EA","1F3EB","1F1E6-1F1FA","1F1E6-1F1F9","1F1E7-1F1EA","1F1E7-1F1F7","1F1E8-1F1E6","1F1E8-1F1F1","1F1E8-1F1F3","1F1E8-1F1F4","1F1E9-1F1F0","1F1EB-1F1EE","1F1EB-1F1F7","1F1E9-1F1EA","1F1ED-1F1F0","1F1EE-1F1F3","1F1EE-1F1E9","1F1EE-1F1EA","1F1EE-1F1F1","1F1EE-1F1F9","1F1EF-1F1F5","1F1F0-1F1F7","1F1F2-1F1F4","1F1F2-1F1FE","1F1F2-1F1FD","1F1F3-1F1F1","1F1F3-1F1FF","1F1F3-1F1F4","1F1F5-1F1ED","1F1F5-1F1F1","1F1F5-1F1F9","1F1F5-1F1F7","1F1F7-1F1FA","1F1F8-1F1E6","1F1F8-1F1EC","1F1FF-1F1E6","1F1EA-1F1F8","1F1F8-1F1EA","1F1E8-1F1ED","1F1F9-1F1F7","1F1EC-1F1E7","1F1FA-1F1F8","1F1E6-1F1EA","1F1FB-1F1F3"],"Activity":["1F3C3","1F6B6","1F483","1F6A3","1F3CA","1F3C4","1F6C0","1F3C2","1F3BF","26C4","1F6B4","1F6B5","1F3C7","26FA","1F3A3","26BD","1F3C0","1F3C8","26BE","1F3BE","1F3C9","26F3","1F3C6","1F3BD","1F3C1","1F3B9","1F3B8","1F3BB","1F3B7","1F3BA","1F3B5","1F3B6","1F3BC","1F3A7","1F3A4","1F3AD","1F3AB","1F3A9","1F3AA","1F3AC","1F3A8","1F3AF","1F3B1","1F3B3","1F3B0","1F3B2","1F3AE","1F3B4","1F0CF","1F004","1F3A0","1F3A1","1F3A2"],"Celebration":["1F380","1F381","1F382","1F383","1F384","1F38B","1F38D","1F391","1F386","1F387","1F389","1F38A","1F388","1F4AB","2728","1F4A5","1F393","1F451","1F38E","1F38F","1F390","1F38C","1F3EE","1F48D","2764","1F494","1F48C","1F495","1F49E","1F493","1F497","1F496","1F498","1F49D","1F49F","1F49C","1F49B","1F49A","1F499"],"null":["1F3FB","1F3FC","1F3FD","1F3FE","1F3FF","1F468-200D-1F469-200D-1F467-200D-1F466"]};
  var edNames = {"100":["1F4AF",21,0],"1234":["1F522",24,6],"copyright":["00A9",0,0],"registered":["00AE",0,1],"bangbang":["203C",0,2],"interrobang":["2049",0,3],"tm":["2122",0,4],"information_source":["2139",0,5],"left_right_arrow":["2194",0,6],"arrow_up_down":["2195",0,7],"arrow_upper_left":["2196",0,8],"arrow_upper_right":["2197",0,9],"arrow_lower_right":["2198",0,10],"arrow_lower_left":["2199",0,11],"leftwards_arrow_with_hook":["21A9",0,12],"arrow_right_hook":["21AA",0,13],"watch":["231A",0,14],"hourglass":["231B",0,15],"fast_forward":["23E9",0,16],"rewind":["23EA",0,17],"arrow_double_up":["23EB",0,18],"arrow_double_down":["23EC",0,19],"alarm_clock":["23F0",0,20],"hourglass_flowing_sand":["23F3",0,21],"m":["24C2",0,22],"black_small_square":["25AA",0,23],"white_small_square":["25AB",0,24],"arrow_forward":["25B6",0,25],"arrow_backward":["25C0",0,26],"white_medium_square":["25FB",0,27],"black_medium_square":["25FC",0,28],"white_medium_small_square":["25FD",0,29],"black_medium_small_square":["25FE",0,30],"sunny":["2600",0,31],"cloud":["2601",0,32],"phone":["260E",0,33],"ballot_box_with_check":["2611",0,34],"umbrella":["2614",1,0],"coffee":["2615",1,1],"point_up":["261D",1,2],"relaxed":["263A",1,8],"aries":["2648",1,9],"taurus":["2649",1,10],"gemini":["264A",1,11],"cancer":["264B",1,12],"leo":["264C",1,13],"virgo":["264D",1,14],"libra":["264E",1,15],"scorpius":["264F",1,16],"sagittarius":["2650",1,17],"capricorn":["2651",1,18],"aquarius":["2652",1,19],"pisces":["2653",1,20],"spades":["2660",1,21],"clubs":["2663",1,22],"hearts":["2665",1,23],"diamonds":["2666",1,24],"hotsprings":["2668",1,25],"recycle":["267B",1,26],"wheelchair":["267F",1,27],"anchor":["2693",1,28],"warning":["26A0",1,29],"zap":["26A1",1,30],"white_circle":["26AA",1,31],"black_circle":["26AB",1,32],"soccer":["26BD",1,33],"baseball":["26BE",1,34],"snowman":["26C4",2,0],"partly_sunny":["26C5",2,1],"ophiuchus":["26CE",2,2],"no_entry":["26D4",2,3],"church":["26EA",2,4],"fountain":["26F2",2,5],"golf":["26F3",2,6],"boat":["26F5",2,7],"tent":["26FA",2,8],"fuelpump":["26FD",2,9],"scissors":["2702",2,10],"white_check_mark":["2705",2,11],"airplane":["2708",2,12],"email":["2709",2,13],"fist":["270A",2,14],"hand":["270B",2,20],"v":["270C",2,26],"pencil2":["270F",2,32],"black_nib":["2712",2,33],"heavy_check_mark":["2714",2,34],"heavy_multiplication_x":["2716",3,0],"sparkles":["2728",3,1],"eight_spoked_asterisk":["2733",3,2],"eight_pointed_black_star":["2734",3,3],"snowflake":["2744",3,4],"sparkle":["2747",3,5],"x":["274C",3,6],"negative_squared_cross_mark":["274E",3,7],"question":["2753",3,8],"grey_question":["2754",3,9],"grey_exclamation":["2755",3,10],"exclamation":["2757",3,11],"heart":["2764",3,12],"heavy_plus_sign":["2795",3,13],"heavy_minus_sign":["2796",3,14],"heavy_division_sign":["2797",3,15],"arrow_right":["27A1",3,16],"curly_loop":["27B0",3,17],"loop":["27BF",3,18],"arrow_heading_up":["2934",3,19],"arrow_heading_down":["2935",3,20],"arrow_left":["2B05",3,21],"arrow_up":["2B06",3,22],"arrow_down":["2B07",3,23],"black_large_square":["2B1B",3,24],"white_large_square":["2B1C",3,25],"star":["2B50",3,26],"o":["2B55",3,27],"wavy_dash":["3030",3,28],"part_alternation_mark":["303D",3,29],"congratulations":["3297",3,30],"secret":["3299",3,31],"mahjong":["1F004",3,32],"black_joker":["1F0CF",3,33],"a":["1F170",3,34],"b":["1F171",4,0],"o2":["1F17E",4,1],"parking":["1F17F",4,2],"ab":["1F18E",4,3],"cl":["1F191",4,4],"cool":["1F192",4,5],"free":["1F193",4,6],"id":["1F194",4,7],"new":["1F195",4,8],"ng":["1F196",4,9],"ok":["1F197",4,10],"sos":["1F198",4,11],"up":["1F199",4,12],"vs":["1F19A",4,13],"koko":["1F201",4,14],"sa":["1F202",4,15],"u7121":["1F21A",4,16],"u6307":["1F22F",4,17],"u7981":["1F232",4,18],"u7a7a":["1F233",4,19],"u5408":["1F234",4,20],"u6e80":["1F235",4,21],"u6709":["1F236",4,22],"u6708":["1F237",4,23],"u7533":["1F238",4,24],"u5272":["1F239",4,25],"u55b6":["1F23A",4,26],"ideograph_advantage":["1F250",4,27],"accept":["1F251",4,28],"cyclone":["1F300",4,29],"foggy":["1F301",4,30],"closed_umbrella":["1F302",4,31],"night_with_stars":["1F303",4,32],"sunrise_over_mountains":["1F304",4,33],"sunrise":["1F305",4,34],"city_sunset":["1F306",5,0],"city_sunrise":["1F307",5,1],"rainbow":["1F308",5,2],"bridge_at_night":["1F309",5,3],"ocean":["1F30A",5,4],"volcano":["1F30B",5,5],"milky_way":["1F30C",5,6],"earth_africa":["1F30D",5,7],"earth_americas":["1F30E",5,8],"earth_asia":["1F30F",5,9],"globe_with_meridians":["1F310",5,10],"new_moon":["1F311",5,11],"waxing_crescent_moon":["1F312",5,12],"first_quarter_moon":["1F313",5,13],"moon":["1F314",5,14],"full_moon":["1F315",5,15],"waning_gibbous_moon":["1F316",5,16],"last_quarter_moon":["1F317",5,17],"waning_crescent_moon":["1F318",5,18],"crescent_moon":["1F319",5,19],"new_moon_with_face":["1F31A",5,20],"first_quarter_moon_with_face":["1F31B",5,21],"last_quarter_moon_with_face":["1F31C",5,22],"full_moon_with_face":["1F31D",5,23],"sun_with_face":["1F31E",5,24],"star2":["1F31F",5,25],"stars":["1F320",5,26],"chestnut":["1F330",5,27],"seedling":["1F331",5,28],"evergreen_tree":["1F332",5,29],"deciduous_tree":["1F333",5,30],"palm_tree":["1F334",5,31],"cactus":["1F335",5,32],"tulip":["1F337",5,33],"cherry_blossom":["1F338",5,34],"rose":["1F339",6,0],"hibiscus":["1F33A",6,1],"sunflower":["1F33B",6,2],"blossom":["1F33C",6,3],"corn":["1F33D",6,4],"ear_of_rice":["1F33E",6,5],"herb":["1F33F",6,6],"four_leaf_clover":["1F340",6,7],"maple_leaf":["1F341",6,8],"fallen_leaf":["1F342",6,9],"leaves":["1F343",6,10],"mushroom":["1F344",6,11],"tomato":["1F345",6,12],"eggplant":["1F346",6,13],"grapes":["1F347",6,14],"melon":["1F348",6,15],"watermelon":["1F349",6,16],"tangerine":["1F34A",6,17],"lemon":["1F34B",6,18],"banana":["1F34C",6,19],"pineapple":["1F34D",6,20],"apple":["1F34E",6,21],"green_apple":["1F34F",6,22],"pear":["1F350",6,23],"peach":["1F351",6,24],"cherries":["1F352",6,25],"strawberry":["1F353",6,26],"hamburger":["1F354",6,27],"pizza":["1F355",6,28],"meat_on_bone":["1F356",6,29],"poultry_leg":["1F357",6,30],"rice_cracker":["1F358",6,31],"rice_ball":["1F359",6,32],"rice":["1F35A",6,33],"curry":["1F35B",6,34],"ramen":["1F35C",7,0],"spaghetti":["1F35D",7,1],"bread":["1F35E",7,2],"fries":["1F35F",7,3],"sweet_potato":["1F360",7,4],"dango":["1F361",7,5],"oden":["1F362",7,6],"sushi":["1F363",7,7],"fried_shrimp":["1F364",7,8],"fish_cake":["1F365",7,9],"icecream":["1F366",7,10],"shaved_ice":["1F367",7,11],"ice_cream":["1F368",7,12],"doughnut":["1F369",7,13],"cookie":["1F36A",7,14],"chocolate_bar":["1F36B",7,15],"candy":["1F36C",7,16],"lollipop":["1F36D",7,17],"custard":["1F36E",7,18],"honey_pot":["1F36F",7,19],"cake":["1F370",7,20],"bento":["1F371",7,21],"stew":["1F372",7,22],"egg":["1F373",7,23],"fork_and_knife":["1F374",7,24],"tea":["1F375",7,25],"sake":["1F376",7,26],"wine_glass":["1F377",7,27],"cocktail":["1F378",7,28],"tropical_drink":["1F379",7,29],"beer":["1F37A",7,30],"beers":["1F37B",7,31],"baby_bottle":["1F37C",7,32],"ribbon":["1F380",7,33],"gift":["1F381",7,34],"birthday":["1F382",8,0],"jack_o_lantern":["1F383",8,1],"christmas_tree":["1F384",8,2],"santa":["1F385",8,3],"fireworks":["1F386",8,9],"sparkler":["1F387",8,10],"balloon":["1F388",8,11],"tada":["1F389",8,12],"confetti_ball":["1F38A",8,13],"tanabata_tree":["1F38B",8,14],"crossed_flags":["1F38C",8,15],"bamboo":["1F38D",8,16],"dolls":["1F38E",8,17],"flags":["1F38F",8,18],"wind_chime":["1F390",8,19],"rice_scene":["1F391",8,20],"school_satchel":["1F392",8,21],"mortar_board":["1F393",8,22],"carousel_horse":["1F3A0",8,23],"ferris_wheel":["1F3A1",8,24],"roller_coaster":["1F3A2",8,25],"fishing_pole_and_fish":["1F3A3",8,26],"microphone":["1F3A4",8,27],"movie_camera":["1F3A5",8,28],"cinema":["1F3A6",8,29],"headphones":["1F3A7",8,30],"art":["1F3A8",8,31],"tophat":["1F3A9",8,32],"circus_tent":["1F3AA",8,33],"ticket":["1F3AB",8,34],"clapper":["1F3AC",9,0],"performing_arts":["1F3AD",9,1],"video_game":["1F3AE",9,2],"dart":["1F3AF",9,3],"slot_machine":["1F3B0",9,4],"8ball":["1F3B1",9,5],"game_die":["1F3B2",9,6],"bowling":["1F3B3",9,7],"flower_playing_cards":["1F3B4",9,8],"musical_note":["1F3B5",9,9],"notes":["1F3B6",9,10],"saxophone":["1F3B7",9,11],"guitar":["1F3B8",9,12],"musical_keyboard":["1F3B9",9,13],"trumpet":["1F3BA",9,14],"violin":["1F3BB",9,15],"musical_score":["1F3BC",9,16],"running_shirt_with_sash":["1F3BD",9,17],"tennis":["1F3BE",9,18],"ski":["1F3BF",9,19],"basketball":["1F3C0",9,20],"checkered_flag":["1F3C1",9,21],"snowboarder":["1F3C2",9,22],"runner":["1F3C3",9,23],"surfer":["1F3C4",9,29],"trophy":["1F3C6",10,0],"horse_racing":["1F3C7",10,1],"football":["1F3C8",10,7],"rugby_football":["1F3C9",10,8],"swimmer":["1F3CA",10,9],"house":["1F3E0",10,15],"house_with_garden":["1F3E1",10,16],"office":["1F3E2",10,17],"post_office":["1F3E3",10,18],"european_post_office":["1F3E4",10,19],"hospital":["1F3E5",10,20],"bank":["1F3E6",10,21],"atm":["1F3E7",10,22],"hotel":["1F3E8",10,23],"love_hotel":["1F3E9",10,24],"convenience_store":["1F3EA",10,25],"school":["1F3EB",10,26],"department_store":["1F3EC",10,27],"factory":["1F3ED",10,28],"izakaya_lantern":["1F3EE",10,29],"japanese_castle":["1F3EF",10,30],"european_castle":["1F3F0",10,31],"skin-tone-2":["1F3FB",10,32],"skin-tone-3":["1F3FC",10,33],"skin-tone-4":["1F3FD",10,34],"skin-tone-5":["1F3FE",11,0],"skin-tone-6":["1F3FF",11,1],"rat":["1F400",11,2],"mouse2":["1F401",11,3],"ox":["1F402",11,4],"water_buffalo":["1F403",11,5],"cow2":["1F404",11,6],"tiger2":["1F405",11,7],"leopard":["1F406",11,8],"rabbit2":["1F407",11,9],"cat2":["1F408",11,10],"dragon":["1F409",11,11],"crocodile":["1F40A",11,12],"whale2":["1F40B",11,13],"snail":["1F40C",11,14],"snake":["1F40D",11,15],"racehorse":["1F40E",11,16],"ram":["1F40F",11,17],"goat":["1F410",11,18],"sheep":["1F411",11,19],"monkey":["1F412",11,20],"rooster":["1F413",11,21],"chicken":["1F414",11,22],"dog2":["1F415",11,23],"pig2":["1F416",11,24],"boar":["1F417",11,25],"elephant":["1F418",11,26],"octopus":["1F419",11,27],"shell":["1F41A",11,28],"bug":["1F41B",11,29],"ant":["1F41C",11,30],"bee":["1F41D",11,31],"beetle":["1F41E",11,32],"fish":["1F41F",11,33],"tropical_fish":["1F420",11,34],"blowfish":["1F421",12,0],"turtle":["1F422",12,1],"hatching_chick":["1F423",12,2],"baby_chick":["1F424",12,3],"hatched_chick":["1F425",12,4],"bird":["1F426",12,5],"penguin":["1F427",12,6],"koala":["1F428",12,7],"poodle":["1F429",12,8],"dromedary_camel":["1F42A",12,9],"camel":["1F42B",12,10],"dolphin":["1F42C",12,11],"mouse":["1F42D",12,12],"cow":["1F42E",12,13],"tiger":["1F42F",12,14],"rabbit":["1F430",12,15],"cat":["1F431",12,16],"dragon_face":["1F432",12,17],"whale":["1F433",12,18],"horse":["1F434",12,19],"monkey_face":["1F435",12,20],"dog":["1F436",12,21],"pig":["1F437",12,22],"frog":["1F438",12,23],"hamster":["1F439",12,24],"wolf":["1F43A",12,25],"bear":["1F43B",12,26],"panda_face":["1F43C",12,27],"pig_nose":["1F43D",12,28],"feet":["1F43E",12,29],"eyes":["1F440",12,30],"ear":["1F442",12,31],"nose":["1F443",13,2],"lips":["1F444",13,8],"tongue":["1F445",13,9],"point_up_2":["1F446",13,10],"point_down":["1F447",13,16],"point_left":["1F448",13,22],"point_right":["1F449",13,28],"facepunch":["1F44A",13,34],"wave":["1F44B",14,5],"ok_hand":["1F44C",14,11],"+1":["1F44D",14,17],"-1":["1F44E",14,23],"clap":["1F44F",14,29],"open_hands":["1F450",15,0],"crown":["1F451",15,6],"womans_hat":["1F452",15,7],"eyeglasses":["1F453",15,8],"necktie":["1F454",15,9],"shirt":["1F455",15,10],"jeans":["1F456",15,11],"dress":["1F457",15,12],"kimono":["1F458",15,13],"bikini":["1F459",15,14],"womans_clothes":["1F45A",15,15],"purse":["1F45B",15,16],"handbag":["1F45C",15,17],"pouch":["1F45D",15,18],"mans_shoe":["1F45E",15,19],"athletic_shoe":["1F45F",15,20],"high_heel":["1F460",15,21],"sandal":["1F461",15,22],"boot":["1F462",15,23],"footprints":["1F463",15,24],"bust_in_silhouette":["1F464",15,25],"busts_in_silhouette":["1F465",15,26],"boy":["1F466",15,27],"girl":["1F467",15,33],"man":["1F468",16,4],"woman":["1F469",16,10],"family":["1F46A",16,16],"couple":["1F46B",16,17],"two_men_holding_hands":["1F46C",16,18],"two_women_holding_hands":["1F46D",16,19],"cop":["1F46E",16,20],"dancers":["1F46F",16,26],"bride_with_veil":["1F470",16,27],"person_with_blond_hair":["1F471",16,33],"man_with_gua_pi_mao":["1F472",17,4],"man_with_turban":["1F473",17,10],"older_man":["1F474",17,16],"older_woman":["1F475",17,22],"baby":["1F476",17,28],"construction_worker":["1F477",17,34],"princess":["1F478",18,5],"japanese_ogre":["1F479",18,11],"japanese_goblin":["1F47A",18,12],"ghost":["1F47B",18,13],"angel":["1F47C",18,14],"alien":["1F47D",18,20],"space_invader":["1F47E",18,21],"imp":["1F47F",18,22],"skull":["1F480",18,23],"information_desk_person":["1F481",18,24],"guardsman":["1F482",18,30],"dancer":["1F483",19,1],"lipstick":["1F484",19,7],"nail_care":["1F485",19,8],"massage":["1F486",19,14],"haircut":["1F487",19,20],"barber":["1F488",19,26],"syringe":["1F489",19,27],"pill":["1F48A",19,28],"kiss":["1F48B",19,29],"love_letter":["1F48C",19,30],"ring":["1F48D",19,31],"gem":["1F48E",19,32],"couplekiss":["1F48F",19,33],"bouquet":["1F490",19,34],"couple_with_heart":["1F491",20,0],"wedding":["1F492",20,1],"heartbeat":["1F493",20,2],"broken_heart":["1F494",20,3],"two_hearts":["1F495",20,4],"sparkling_heart":["1F496",20,5],"heartpulse":["1F497",20,6],"cupid":["1F498",20,7],"blue_heart":["1F499",20,8],"green_heart":["1F49A",20,9],"yellow_heart":["1F49B",20,10],"purple_heart":["1F49C",20,11],"gift_heart":["1F49D",20,12],"revolving_hearts":["1F49E",20,13],"heart_decoration":["1F49F",20,14],"diamond_shape_with_a_dot_inside":["1F4A0",20,15],"bulb":["1F4A1",20,16],"anger":["1F4A2",20,17],"bomb":["1F4A3",20,18],"zzz":["1F4A4",20,19],"boom":["1F4A5",20,20],"sweat_drops":["1F4A6",20,21],"droplet":["1F4A7",20,22],"dash":["1F4A8",20,23],"hankey":["1F4A9",20,24],"muscle":["1F4AA",20,25],"dizzy":["1F4AB",20,31],"speech_balloon":["1F4AC",20,32],"thought_balloon":["1F4AD",20,33],"white_flower":["1F4AE",20,34],"moneybag":["1F4B0",21,1],"currency_exchange":["1F4B1",21,2],"heavy_dollar_sign":["1F4B2",21,3],"credit_card":["1F4B3",21,4],"yen":["1F4B4",21,5],"dollar":["1F4B5",21,6],"euro":["1F4B6",21,7],"pound":["1F4B7",21,8],"money_with_wings":["1F4B8",21,9],"chart":["1F4B9",21,10],"seat":["1F4BA",21,11],"computer":["1F4BB",21,12],"briefcase":["1F4BC",21,13],"minidisc":["1F4BD",21,14],"floppy_disk":["1F4BE",21,15],"cd":["1F4BF",21,16],"dvd":["1F4C0",21,17],"file_folder":["1F4C1",21,18],"open_file_folder":["1F4C2",21,19],"page_with_curl":["1F4C3",21,20],"page_facing_up":["1F4C4",21,21],"date":["1F4C5",21,22],"calendar":["1F4C6",21,23],"card_index":["1F4C7",21,24],"chart_with_upwards_trend":["1F4C8",21,25],"chart_with_downwards_trend":["1F4C9",21,26],"bar_chart":["1F4CA",21,27],"clipboard":["1F4CB",21,28],"pushpin":["1F4CC",21,29],"round_pushpin":["1F4CD",21,30],"paperclip":["1F4CE",21,31],"straight_ruler":["1F4CF",21,32],"triangular_ruler":["1F4D0",21,33],"bookmark_tabs":["1F4D1",21,34],"ledger":["1F4D2",22,0],"notebook":["1F4D3",22,1],"notebook_with_decorative_cover":["1F4D4",22,2],"closed_book":["1F4D5",22,3],"book":["1F4D6",22,4],"green_book":["1F4D7",22,5],"blue_book":["1F4D8",22,6],"orange_book":["1F4D9",22,7],"books":["1F4DA",22,8],"name_badge":["1F4DB",22,9],"scroll":["1F4DC",22,10],"memo":["1F4DD",22,11],"telephone_receiver":["1F4DE",22,12],"pager":["1F4DF",22,13],"fax":["1F4E0",22,14],"satellite":["1F4E1",22,15],"loudspeaker":["1F4E2",22,16],"mega":["1F4E3",22,17],"outbox_tray":["1F4E4",22,18],"inbox_tray":["1F4E5",22,19],"package":["1F4E6",22,20],"e-mail":["1F4E7",22,21],"incoming_envelope":["1F4E8",22,22],"envelope_with_arrow":["1F4E9",22,23],"mailbox_closed":["1F4EA",22,24],"mailbox":["1F4EB",22,25],"mailbox_with_mail":["1F4EC",22,26],"mailbox_with_no_mail":["1F4ED",22,27],"postbox":["1F4EE",22,28],"postal_horn":["1F4EF",22,29],"newspaper":["1F4F0",22,30],"iphone":["1F4F1",22,31],"calling":["1F4F2",22,32],"vibration_mode":["1F4F3",22,33],"mobile_phone_off":["1F4F4",22,34],"no_mobile_phones":["1F4F5",23,0],"signal_strength":["1F4F6",23,1],"camera":["1F4F7",23,2],"video_camera":["1F4F9",23,3],"tv":["1F4FA",23,4],"radio":["1F4FB",23,5],"vhs":["1F4FC",23,6],"twisted_rightwards_arrows":["1F500",23,7],"repeat":["1F501",23,8],"repeat_one":["1F502",23,9],"arrows_clockwise":["1F503",23,10],"arrows_counterclockwise":["1F504",23,11],"low_brightness":["1F505",23,12],"high_brightness":["1F506",23,13],"mute":["1F507",23,14],"speaker":["1F508",23,15],"sound":["1F509",23,16],"loud_sound":["1F50A",23,17],"battery":["1F50B",23,18],"electric_plug":["1F50C",23,19],"mag":["1F50D",23,20],"mag_right":["1F50E",23,21],"lock_with_ink_pen":["1F50F",23,22],"closed_lock_with_key":["1F510",23,23],"key":["1F511",23,24],"lock":["1F512",23,25],"unlock":["1F513",23,26],"bell":["1F514",23,27],"no_bell":["1F515",23,28],"bookmark":["1F516",23,29],"link":["1F517",23,30],"radio_button":["1F518",23,31],"back":["1F519",23,32],"end":["1F51A",23,33],"on":["1F51B",23,34],"soon":["1F51C",24,0],"top":["1F51D",24,1],"underage":["1F51E",24,2],"keycap_ten":["1F51F",24,3],"capital_abcd":["1F520",24,4],"abcd":["1F521",24,5],"symbols":["1F523",24,7],"abc":["1F524",24,8],"fire":["1F525",24,9],"flashlight":["1F526",24,10],"wrench":["1F527",24,11],"hammer":["1F528",24,12],"nut_and_bolt":["1F529",24,13],"hocho":["1F52A",24,14],"gun":["1F52B",24,15],"microscope":["1F52C",24,16],"telescope":["1F52D",24,17],"crystal_ball":["1F52E",24,18],"six_pointed_star":["1F52F",24,19],"beginner":["1F530",24,20],"trident":["1F531",24,21],"black_square_button":["1F532",24,22],"white_square_button":["1F533",24,23],"red_circle":["1F534",24,24],"large_blue_circle":["1F535",24,25],"large_orange_diamond":["1F536",24,26],"large_blue_diamond":["1F537",24,27],"small_orange_diamond":["1F538",24,28],"small_blue_diamond":["1F539",24,29],"small_red_triangle":["1F53A",24,30],"small_red_triangle_down":["1F53B",24,31],"arrow_up_small":["1F53C",24,32],"arrow_down_small":["1F53D",24,33],"clock1":["1F550",24,34],"clock2":["1F551",25,0],"clock3":["1F552",25,1],"clock4":["1F553",25,2],"clock5":["1F554",25,3],"clock6":["1F555",25,4],"clock7":["1F556",25,5],"clock8":["1F557",25,6],"clock9":["1F558",25,7],"clock10":["1F559",25,8],"clock11":["1F55A",25,9],"clock12":["1F55B",25,10],"clock130":["1F55C",25,11],"clock230":["1F55D",25,12],"clock330":["1F55E",25,13],"clock430":["1F55F",25,14],"clock530":["1F560",25,15],"clock630":["1F561",25,16],"clock730":["1F562",25,17],"clock830":["1F563",25,18],"clock930":["1F564",25,19],"clock1030":["1F565",25,20],"clock1130":["1F566",25,21],"clock1230":["1F567",25,22],"mount_fuji":["1F5FB",25,23],"tokyo_tower":["1F5FC",25,24],"statue_of_liberty":["1F5FD",25,25],"japan":["1F5FE",25,26],"moyai":["1F5FF",25,27],"grinning":["1F600",25,28],"grin":["1F601",25,29],"joy":["1F602",25,30],"smiley":["1F603",25,31],"smile":["1F604",25,32],"sweat_smile":["1F605",25,33],"laughing":["1F606",25,34],"innocent":["1F607",26,0],"smiling_imp":["1F608",26,1],"wink":["1F609",26,2],"blush":["1F60A",26,3],"yum":["1F60B",26,4],"relieved":["1F60C",26,5],"heart_eyes":["1F60D",26,6],"sunglasses":["1F60E",26,7],"smirk":["1F60F",26,8],"neutral_face":["1F610",26,9],"expressionless":["1F611",26,10],"unamused":["1F612",26,11],"sweat":["1F613",26,12],"pensive":["1F614",26,13],"confused":["1F615",26,14],"confounded":["1F616",26,15],"kissing":["1F617",26,16],"kissing_heart":["1F618",26,17],"kissing_smiling_eyes":["1F619",26,18],"kissing_closed_eyes":["1F61A",26,19],"stuck_out_tongue":["1F61B",26,20],"stuck_out_tongue_winking_eye":["1F61C",26,21],"stuck_out_tongue_closed_eyes":["1F61D",26,22],"disappointed":["1F61E",26,23],"worried":["1F61F",26,24],"angry":["1F620",26,25],"rage":["1F621",26,26],"cry":["1F622",26,27],"persevere":["1F623",26,28],"triumph":["1F624",26,29],"disappointed_relieved":["1F625",26,30],"frowning":["1F626",26,31],"anguished":["1F627",26,32],"fearful":["1F628",26,33],"weary":["1F629",26,34],"sleepy":["1F62A",27,0],"tired_face":["1F62B",27,1],"grimacing":["1F62C",27,2],"sob":["1F62D",27,3],"open_mouth":["1F62E",27,4],"hushed":["1F62F",27,5],"cold_sweat":["1F630",27,6],"scream":["1F631",27,7],"astonished":["1F632",27,8],"flushed":["1F633",27,9],"sleeping":["1F634",27,10],"dizzy_face":["1F635",27,11],"no_mouth":["1F636",27,12],"mask":["1F637",27,13],"smile_cat":["1F638",27,14],"joy_cat":["1F639",27,15],"smiley_cat":["1F63A",27,16],"heart_eyes_cat":["1F63B",27,17],"smirk_cat":["1F63C",27,18],"kissing_cat":["1F63D",27,19],"pouting_cat":["1F63E",27,20],"crying_cat_face":["1F63F",27,21],"scream_cat":["1F640",27,22],"no_good":["1F645",27,23],"ok_woman":["1F646",27,29],"bow":["1F647",28,0],"see_no_evil":["1F648",28,6],"hear_no_evil":["1F649",28,7],"speak_no_evil":["1F64A",28,8],"raising_hand":["1F64B",28,9],"raised_hands":["1F64C",28,15],"person_frowning":["1F64D",28,21],"person_with_pouting_face":["1F64E",28,27],"pray":["1F64F",28,33],"rocket":["1F680",29,4],"helicopter":["1F681",29,5],"steam_locomotive":["1F682",29,6],"railway_car":["1F683",29,7],"bullettrain_side":["1F684",29,8],"bullettrain_front":["1F685",29,9],"train2":["1F686",29,10],"metro":["1F687",29,11],"light_rail":["1F688",29,12],"station":["1F689",29,13],"tram":["1F68A",29,14],"train":["1F68B",29,15],"bus":["1F68C",29,16],"oncoming_bus":["1F68D",29,17],"trolleybus":["1F68E",29,18],"busstop":["1F68F",29,19],"minibus":["1F690",29,20],"ambulance":["1F691",29,21],"fire_engine":["1F692",29,22],"police_car":["1F693",29,23],"oncoming_police_car":["1F694",29,24],"taxi":["1F695",29,25],"oncoming_taxi":["1F696",29,26],"car":["1F697",29,27],"oncoming_automobile":["1F698",29,28],"blue_car":["1F699",29,29],"truck":["1F69A",29,30],"articulated_lorry":["1F69B",29,31],"tractor":["1F69C",29,32],"monorail":["1F69D",29,33],"mountain_railway":["1F69E",29,34],"suspension_railway":["1F69F",30,0],"mountain_cableway":["1F6A0",30,1],"aerial_tramway":["1F6A1",30,2],"ship":["1F6A2",30,3],"rowboat":["1F6A3",30,4],"speedboat":["1F6A4",30,10],"traffic_light":["1F6A5",30,11],"vertical_traffic_light":["1F6A6",30,12],"construction":["1F6A7",30,13],"rotating_light":["1F6A8",30,14],"triangular_flag_on_post":["1F6A9",30,15],"door":["1F6AA",30,16],"no_entry_sign":["1F6AB",30,17],"smoking":["1F6AC",30,18],"no_smoking":["1F6AD",30,19],"put_litter_in_its_place":["1F6AE",30,20],"do_not_litter":["1F6AF",30,21],"potable_water":["1F6B0",30,22],"non-potable_water":["1F6B1",30,23],"bike":["1F6B2",30,24],"no_bicycles":["1F6B3",30,25],"bicyclist":["1F6B4",30,26],"mountain_bicyclist":["1F6B5",30,32],"walking":["1F6B6",31,3],"no_pedestrians":["1F6B7",31,9],"children_crossing":["1F6B8",31,10],"mens":["1F6B9",31,11],"womens":["1F6BA",31,12],"restroom":["1F6BB",31,13],"baby_symbol":["1F6BC",31,14],"toilet":["1F6BD",31,15],"wc":["1F6BE",31,16],"shower":["1F6BF",31,17],"bath":["1F6C0",31,18],"bathtub":["1F6C1",31,24],"passport_control":["1F6C2",31,25],"customs":["1F6C3",31,26],"baggage_claim":["1F6C4",31,27],"left_luggage":["1F6C5",31,28],"hash":["0023-20E3",31,29],"zero":["0030-20E3",31,30],"one":["0031-20E3",31,31],"two":["0032-20E3",31,32],"three":["0033-20E3",31,33],"four":["0034-20E3",31,34],"five":["0035-20E3",32,0],"six":["0036-20E3",32,1],"seven":["0037-20E3",32,2],"eight":["0038-20E3",32,3],"nine":["0039-20E3",32,4],"flag-ae":["1F1E6-1F1EA",32,5],"flag-at":["1F1E6-1F1F9",32,6],"flag-au":["1F1E6-1F1FA",32,7],"flag-be":["1F1E7-1F1EA",32,8],"flag-br":["1F1E7-1F1F7",32,9],"flag-ca":["1F1E8-1F1E6",32,10],"flag-ch":["1F1E8-1F1ED",32,11],"flag-cl":["1F1E8-1F1F1",32,12],"flag-cn":["1F1E8-1F1F3",32,13],"flag-co":["1F1E8-1F1F4",32,14],"flag-de":["1F1E9-1F1EA",32,15],"flag-dk":["1F1E9-1F1F0",32,16],"flag-es":["1F1EA-1F1F8",32,17],"flag-fi":["1F1EB-1F1EE",32,18],"flag-fr":["1F1EB-1F1F7",32,19],"flag-gb":["1F1EC-1F1E7",32,20],"flag-hk":["1F1ED-1F1F0",32,21],"flag-id":["1F1EE-1F1E9",32,22],"flag-ie":["1F1EE-1F1EA",32,23],"flag-il":["1F1EE-1F1F1",32,24],"flag-in":["1F1EE-1F1F3",32,25],"flag-it":["1F1EE-1F1F9",32,26],"flag-jp":["1F1EF-1F1F5",32,27],"flag-kr":["1F1F0-1F1F7",32,28],"flag-mo":["1F1F2-1F1F4",32,29],"flag-mx":["1F1F2-1F1FD",32,30],"flag-my":["1F1F2-1F1FE",32,31],"flag-nl":["1F1F3-1F1F1",32,32],"flag-no":["1F1F3-1F1F4",32,33],"flag-nz":["1F1F3-1F1FF",32,34],"flag-ph":["1F1F5-1F1ED",33,0],"flag-pl":["1F1F5-1F1F1",33,1],"flag-pr":["1F1F5-1F1F7",33,2],"flag-pt":["1F1F5-1F1F9",33,3],"flag-ru":["1F1F7-1F1FA",33,4],"flag-sa":["1F1F8-1F1E6",33,5],"flag-se":["1F1F8-1F1EA",33,6],"flag-sg":["1F1F8-1F1EC",33,7],"flag-tr":["1F1F9-1F1F7",33,8],"flag-us":["1F1FA-1F1F8",33,9],"flag-vn":["1F1FB-1F1F3",33,10],"flag-za":["1F1FF-1F1E6",33,11],"man-man-boy":["1F468-200D-1F468-200D-1F466",33,12],"man-man-boy-boy":["1F468-200D-1F468-200D-1F466-200D-1F466",33,13],"man-man-girl":["1F468-200D-1F468-200D-1F467",33,14],"man-man-girl-boy":["1F468-200D-1F468-200D-1F467-200D-1F466",33,15],"man-man-girl-girl":["1F468-200D-1F468-200D-1F467-200D-1F467",33,16],"man-woman-boy":["1F468-200D-1F469-200D-1F466",33,17],"man-woman-boy-boy":["1F468-200D-1F469-200D-1F466-200D-1F466",33,18],"man-woman-girl":["1F468-200D-1F469-200D-1F467",33,19],"man-woman-girl-boy":["1F468-200D-1F469-200D-1F467-200D-1F466",33,20],"man-woman-girl-girl":["1F468-200D-1F469-200D-1F467-200D-1F467",33,21],"man-heart-man":["1F468-200D-2764-FE0F-200D-1F468",33,22],"man-kiss-man":["1F468-200D-2764-FE0F-200D-1F48B-200D-1F468",33,23],"woman-woman-boy":["1F469-200D-1F469-200D-1F466",33,24],"woman-woman-boy-boy":["1F469-200D-1F469-200D-1F466-200D-1F466",33,25],"woman-woman-girl":["1F469-200D-1F469-200D-1F467",33,26],"woman-woman-girl-boy":["1F469-200D-1F469-200D-1F467-200D-1F466",33,27],"woman-woman-girl-girl":["1F469-200D-1F469-200D-1F467-200D-1F467",33,28],"woman-heart-woman":["1F469-200D-2764-FE0F-200D-1F469",33,29],"woman-kiss-woman":["1F469-200D-2764-FE0F-200D-1F48B-200D-1F469",33,30]};

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
      width: 22,
      height: 22 
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
        menu.dataset.title = f;

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
        var menuTooltip = document.createElement('div');
        menuTooltip.className = 'emojiver__header__tooltip';
        menuTooltip.style.top = '-32px';

        var menuTooltipArrow = document.createElement('div');
        menuTooltipArrow.className = "emojiver__header__tooltipArrow";

        var menuTooltipInner = document.createElement('div');
        menuTooltipInner.className = "emojiver__header__tooltipInner";
        menuTooltipInner.innerHTML = menu.dataset['title'];

        menuTooltip.appendChild(menuTooltipArrow);
        menuTooltip.appendChild(menuTooltipInner);

        menu.onmouseenter = function(e) {
          var targetMenu = document.querySelector('.emojiver__header__menu[data-title="' + this.dataset['title'] + '"]'); 
          var left = _getOffset(targetMenu).x;

          var containerPositionLeft = _getOffset(container).x; // offset of emojiver box
          menuTooltip.style.left = left - containerPositionLeft - menuTooltip.offsetWidth / 6 + 'px';
          menuTooltip.className = 'emojiver__header__tooltip is-on';
        }
        menu.onmouseleave = function(e) {
          menuTooltip.className = 'emojiver__header__tooltip';
        }
        header.appendChild(menu);
        header.appendChild(menuTooltip);
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
      var replacerStyle = cf.renderStyle;

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
      if(!_isEmpty(cf.renderStyle)) {
        if('width' in cf.renderStyle) 
          cf.renderStyle.width = typeof cf.renderStyle.width === 'number' ? cf.renderStyle.width + 'px' : cf.renderStyle.width;
        if('height' in cf.renderStyle) 
          cf.renderStyle.height = typeof cf.renderStyle.height === 'number' ? cf.renderStyle.height + 'px' : cf.renderStyle.height;
      }

      style = _extend(style, replacerStyle);
      _setStyle(emoji, style);
      emoji.innerHTML = ':' + name + ':';
      return emoji;
    }    
    function renderToTarget(text, targetEl, config) {
      text.replace(eRegex, function(match) {
        if(/\:[a-zA-Z0-9-_+]+\:/g.test(match)) {
          // test emoji string like " :smile: "
          targetEl.appendChild(_replacer(match, config));
        } else {
          // TODO convert unicode emoji to image
          if(/(https?|ftp|file):\/\/[a-z0-9-_.]+(:[0-9]+|)(\/.*)?/ig.test(match)) {
            var anchorNode = document.createElement('a');
            anchorNode.setAttribute('href', match);
            anchorNode.setAttribute('target', '_blank');
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
            anchorNode.setAttribute('target', '_blank');
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
