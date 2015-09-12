Emojiver.js
==================

###Features
This is an Emoji enabler like slack

* Filtered menu by emoji category
* Image or Native emoji both supported
* Position Customize


## Install
Install with [Bower](http://bower.io)

`$ bower install --save emojiver`

Load the script files in your application:

```
<link rel="stylesheet" href="bower_components/emojiver/dist/css/emojiver.css ">
<script type="text/javascript" src="bower_components/emojiver/dist/js/emojiver.js"></script>
```


## Usage

### RenderToTarget
```javascript
<a id="demo_render">Render</a>
<div id="demo_rendered" style="height: 350px;"></div>
<input type="text" id="demo_input" style="height: 38px;">

<script>
emojiver.init(document.getElementById('demo_input'), {
  mode: 'name',
  height: 38,
  position: 'top',
  sheetUrl: '../dist/img/sheet_apple_64.png',
  iconUrl: '../dist/img/emoji-icon.png'
});

document.getElementById('demo_render').onclick = function() {
  var demoInput = document.getElementById('demo_input');

  var value = demoInput.value;

  var rendered = emojiver.renderToTarget(value, document.getElementById('demo_rendered'));
}
</script>
```
### Render
```javascript
<div id="demo_rendered" style="height: 350px;"></div>
<input type="text" id="demo_input" style="height: 38px;">

<script>
emojiver.init(document.getElementById('demo_input'), {
  mode: 'name',
  height: 38,
  position: 'top',
  sheetUrl: '../dist/img/sheet_apple_64.png',
  iconUrl: '../dist/img/emoji-icon.png'
});

document.getElementById('demo_input').onkeydown = function(e) {
  if(!e.shiftKey && e.keyCode == 13) {
      var demoInput = document.getElementById('demo_input');
      var value = demoInput.value;
      var emoji = emojiver.render(value);
      document.getElementById('demo_rendered').appendChild(emoji);
  }
}
</script>
```

##Config

ex) emojiver.render(text, config); / emojiver.renderToTarget(text, target, config);
```
{
    mode: 'name', // choices = ['name', 'render']
    position: 'top', // choices = ['top', 'left', 'right', 'bottom']
    inputHeight: 38, // input height for box position
    headerHeight: 36, // emoji menu height
    boxWidth: 288, // emojiver widget box width
    boxHeight: 230, // emojiver widget box height
    sheetSize: 35, // 3500% , sheet image background size that multiplied by 100
    getFactor: function(sheetSize) { // emoji image position factor
      return 100 / (sheetSize - 1);
    },
    sheetUrl: "./sheet_apple_64.png", // emoji sheet path
    iconUrl: "./emoji-icon.png", // emoji menu and toggle button icon path
    style: { // emoji popup style
    },
    toggleStyle: {}, // toggle button style
    renderStyle: { // rendered emoji image size
      width: 16,
      height: 16
    }
}
```

