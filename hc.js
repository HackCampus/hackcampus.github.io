(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var repeat = function repeat(valueFn, times) {
  return new Array(times).fill().map(valueFn);
};

module.exports = function () {
  function WrappingGrid(width, height) {
    var values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, WrappingGrid);

    this.isGrid = true;
    this.width = width;
    this.height = height;
    var emptyGrid = values || repeat(function (_) {
      return repeat(function (_) {
        return false;
      }, width);
    }, height);
    this.grid = emptyGrid;
  }

  _createClass(WrappingGrid, [{
    key: "get",
    value: function get(x, y) {
      return this.grid[(y + this.height) % this.height][(x + this.width) % this.width];
    }
  }, {
    key: "set",
    value: function set(x, y) {
      var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      this.grid[(y + this.height) % this.height][(x + this.width) % this.width] = value;
      return this;
    }
  }, {
    key: "map",
    value: function map() {
      var f = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (value, x, y) {
        return false;
      };

      var grid = this.grid.map(function (rows, y) {
        return rows.map(function (value, x) {
          return f(value, x, y);
        });
      });
      return new WrappingGrid(this.width, this.height, grid);
    }
  }, {
    key: "forEach",
    value: function forEach() {
      var f = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (value, x, y) {
        return null;
      };

      this.grid.forEach(function (rows, y) {
        return rows.forEach(function (value, x) {
          return f(value, x, y);
        });
      });
    }
  }]);

  return WrappingGrid;
}();

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Grid = require('./WrappingGrid');
var step = require('./step');

var ConwayTransition = function () {
  function ConwayTransition(container) {
    var hColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#ff9600';
    var cColor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'white';

    var _this = this;

    var backgroundColor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'black';
    var generations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 128;

    _classCallCheck(this, ConwayTransition);

    this.container = container;
    this.hColor = hColor;
    this.cColor = cColor;
    this.backgroundColor = backgroundColor;
    this.generations = generations;
    this.cellSize = 120;
    this.scrollAmount = 0;

    this.nextElement = container.nextElementSibling;

    this.container.style.height = '100vh';
    this.container.style.backgroundColor = this.backgroundColor;

    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none'; // allow click through
    this.c = canvas.getContext('2d');
    container.appendChild(canvas);

    var getScrollAmount = function getScrollAmount() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      var scrollAmount = (scrollTop - _this.offsetTop) / window.innerHeight;
      return scrollAmount;
    };

    this.scale = window.devicePixelRatio || 1;
    var onResize = function onResize() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      _this.width = width * _this.scale;
      _this.height = height * _this.scale;

      canvas.width = _this.width;
      canvas.height = _this.height;
      canvas.style.top = 0;
      canvas.style.left = 0;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      container.style.height = height + 'px';

      var _container$getBoundin = container.getBoundingClientRect(),
          top = _container$getBoundin.top;

      _this.offsetTop = top;

      _this.nextElementHeight = _this.nextElement.clientHeight;

      _this.makeGames();

      _this.scrollAmount = getScrollAmount();
      window.requestAnimationFrame(function () {
        _this.draw();
      });
    };
    onResize();
    window.addEventListener('resize', onResize);

    var onScroll = function onScroll(event) {
      _this.scrollAmount = getScrollAmount();
      window.requestAnimationFrame(function () {
        _this.draw();
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
  }

  _createClass(ConwayTransition, [{
    key: 'makeGames',
    value: function makeGames() {
      var _this2 = this;

      this.gameWidth = Math.ceil(this.width / this.cellSize) + 2;
      this.gameHeight = Math.ceil(this.height / this.cellSize) + 2;

      var grid = function grid() {
        return new Grid(_this2.gameWidth, _this2.gameHeight);
      };

      // center
      var x = Math.floor(this.gameWidth / 2) - 2,
          y = Math.floor(this.gameHeight / 2) - 3;


      var hGame = grid();
      var cGame = grid();
      var trail = grid();

      hGame.set(x - 1, y - 1).set(x - 1, y).set(x, y).set(x - 1, y + 1).set(x + 1, y + 1);

      cGame.set(x + 1, y).set(x + 2, y).set(x, y + 1).set(x + 1, y + 2).set(x + 2, y + 2);

      this.hGames = [hGame];
      this.cGames = [cGame];
      this.trails = [trail];

      for (var i = 1; i < this.generations; i++) {
        hGame = step(hGame);
        cGame = step(cGame);
        trail = trail.map(function (alreadyAlive, x, y) {
          var born = hGame.get(x, y);
          return alreadyAlive || born;
        });
        this.hGames.push(hGame);
        this.cGames.push(cGame);
        this.trails.push(trail);
      }
    }
  }, {
    key: 'draw',
    value: function draw() {
      var _this3 = this;

      this.c.clearRect(0, 0, this.width * this.scale, this.height * this.scale);

      var fixNextElement = function fixNextElement() {
        _this3.nextElement.style.position = 'fixed';
        _this3.nextElement.style.top = 0;
        _this3.nextElement.style.left = 0;
        _this3.nextElement.style.width = '100%';
        _this3.container.style.height = 'calc(100vh + ' + _this3.nextElementHeight + 'px)';
      };

      var resetFixNextElement = function resetFixNextElement() {
        _this3.nextElement.style.cssText = '';
        _this3.container.style.height = '100vh';
        _this3.container.style.backgroundColor = _this3.backgroundColor;
      };

      var offScreen = this.scrollAmount < -1 || this.scrollAmount >= 1;
      if (offScreen) {
        resetFixNextElement();
        this.c.globalAlpha = 0;
        return;
      }

      var generation = 0,
          alpha = 0;
      if (this.scrollAmount >= -1 && this.scrollAmount < 0) {
        resetFixNextElement();

        alpha = Math.pow(this.scrollAmount + 1, 4);
        generation = 0;
      } else if (this.scrollAmount >= 0 && this.scrollAmount < 1) {
        fixNextElement();

        this.c.save();
        this.c.globalAlpha = Math.pow(1 - this.scrollAmount, 4);
        this.c.fillStyle = this.backgroundColor;
        this.c.fillRect(0, 0, this.width * this.scale, this.height * this.scale);
        this.c.restore();

        alpha = 1 - Math.pow(this.scrollAmount, 4);
        generation = Math.floor(this.scrollAmount * this.generations);
      }

      this.c.globalAlpha = alpha;

      var hGame = this.hGames[generation];
      var cGame = this.cGames[generation];
      var trail = this.trails[generation];
      for (var y = 0; y < this.gameHeight; y++) {
        for (var x = 0; x < this.gameWidth; x++) {
          var c = cGame.get(x, y);
          if (c) {
            this.drawCell(x, y, this.cColor);
            continue;
          }
          var h = hGame.get(x, y);
          if (h) {
            this.drawCell(x, y, this.hColor);
            continue;
          }
          var alreadyAlive = trail.get(x, y);
          if (!alreadyAlive) {
            this.drawCell(x, y, this.backgroundColor);
            continue;
          }
        }
      }
    }
  }, {
    key: 'drawCell',
    value: function drawCell(x, y, color) {
      var centerOffsetLeft = -(this.width % this.cellSize) / 2;
      var centerOffsetTop = -(this.height % this.cellSize) / 2;
      this.c.fillStyle = color;
      this.c.fillRect(centerOffsetLeft + x * this.cellSize, centerOffsetTop + y * this.cellSize, this.cellSize, this.cellSize);
    }
  }]);

  return ConwayTransition;
}();

module.exports = ConwayTransition;

},{"./WrappingGrid":1,"./step":3}],3:[function(require,module,exports){
'use strict';

module.exports = function step(grid) {
  if (!grid.isGrid) {
    console.error('grid is not a grid g.');
    return;
  }
  function neighbors(x, y) {
    return [grid.get(x - 1, y - 1), grid.get(x, y - 1), grid.get(x + 1, y - 1), grid.get(x - 1, y),, grid.get(x + 1, y), grid.get(x - 1, y + 1), grid.get(x, y + 1), grid.get(x + 1, y + 1)];
  }
  return grid.map(function (alive, x, y) {
    var lives = neighbors(x, y).filter(function (living) {
      return living;
    }).length;
    return alive ? lives == 2 || lives == 3 : lives == 3;
  });
};

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var addThrottledEventListener = require('../addThrottledEventListener');
var letterPixels = require('./pixels');

function randomItem(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

function getScrollTop() {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function closestIndex(haystack, needle) {
  var closest = 0;
  for (var i = 0; i < haystack.length; i++) {
    if (needle >= haystack[i]) closest = i;
  }
  return closest;
}

function max(xs) {
  var max = -Infinity;
  for (var i = 0; i < xs.length; i++) {
    if (max < xs[i]) max = xs[i];
  }
  return max;
}

function unlerp(min, max, value) {
  return (value - min) / (max - min);
}

var Letters = function () {
  function Letters(container, titles) {
    var _this = this;

    _classCallCheck(this, Letters);

    this.titles = titles;

    this.maxLength = max(this.titles.map(function (title) {
      return title.text.length;
    }));

    this.offsets = this.getSectionOffsets();

    var canvas = document.createElement('canvas');
    this.c = canvas.getContext('2d');
    container.appendChild(canvas);

    var onScroll = function onScroll() {
      _this.updateState(getScrollTop());
      _this.draw();
    };
    onScroll();
    addThrottledEventListener('scroll', onScroll);

    this.scale = window.devicePixelRatio || 1;
    var onResize = function onResize() {
      var height = container.clientHeight;
      var width = height * _this.maxLength;
      _this.width = width;
      _this.height = height;
      container.width = width;
      canvas.width = width * _this.scale;
      canvas.height = height * _this.scale;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      _this.offsets = _this.getSectionOffsets();
      window.requestAnimationFrame(function () {
        _this.draw();
      });
    };
    onResize();
    addThrottledEventListener('resize', onResize);
  }

  _createClass(Letters, [{
    key: 'updateState',
    value: function updateState(scrollTop) {
      var _this2 = this;

      var i = closestIndex(this.offsets, scrollTop);
      var isLastTitle = i >= this.titles.length - 1;
      var currentTitle = this.titles[i];
      var nextTitle = isLastTitle ? null : this.titles[i + 1];
      var ratio = isLastTitle ? 0 : unlerp(this.offsets[i], this.offsets[i + 1], scrollTop);

      var getTitleState = function getTitleState(title) {
        if (title == null) return;
        var text = title.text,
            color = title.color;

        var pixels = [];
        for (var _i = 0; _i < _this2.maxLength; _i++) {
          var letter = text[_i] || ' ';
          var pixelChoices = letterPixels[letter] || letterPixels[' '];
          var choice = randomItem(pixelChoices);
          pixels.push(choice);
        }
        return {
          pixels: pixels,
          color: color
        };
      };

      var newState = function newState() {
        return {
          i: i,
          ratio: ratio,
          current: getTitleState(currentTitle),
          next: getTitleState(nextTitle)
        };
      };

      if (!this.state) {
        this.state = newState();
        return;
      }

      var old = this.state;

      var same = old.i === i;
      if (same) {
        this.state.ratio = ratio;
        return;
      }

      var oneDown = old.i === i - 1;
      if (oneDown) {
        this.state = {
          i: i,
          ratio: ratio,
          current: old.next,
          next: getTitleState(nextTitle)
        };
        return;
      }

      var severalDown = old.i < i;
      if (severalDown) {
        this.state = newState();
        return;
      }

      var oneUp = old.i === i + 1;
      if (oneUp) {
        this.state = {
          i: i,
          ratio: ratio,
          current: getTitleState(currentTitle),
          next: old.current
        };
        return;
      }

      var severalUp = old.i > i;
      if (severalUp) {
        this.state = newState();
        return;
      }
    }
  }, {
    key: 'getSectionOffsets',
    value: function getSectionOffsets() {
      return this.titles.map(function (x) {
        return x.element.offsetTop;
      });
    }
  }, {
    key: 'draw',
    value: function draw() {
      var _this3 = this;

      var letterSize = 8; // letter pixels
      var pixelSize = Math.floor(this.height * this.scale / letterSize); // screen pixels

      this.c.clearRect(0, 0, this.width * this.scale, this.height * this.scale);

      var drawPixel = function drawPixel(x, y, color) {
        _this3.c.fillStyle = color;
        _this3.c.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      };

      var _state = this.state,
          i = _state.i,
          ratio = _state.ratio,
          current = _state.current,
          next = _state.next;
      var currentColor = current.color,
          currentPixels = current.pixels;


      var nextProbability = Math.pow(ratio, 6);

      if (ratio === 0) {
        var color = currentColor;
        var pixels = currentPixels;
        var offset = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = pixels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var letter = _step.value;

            var p = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = letter[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var pixel = _step2.value;

                if (pixel === '1') {
                  var x = p % letterSize;
                  var y = ~~(p / letterSize);
                  drawPixel(offset + x, y, color);
                }
                p++;
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            offset += letterSize;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      } else {
        var nextColor = next.color,
            nextPixels = next.pixels;

        for (var _i2 = 0; _i2 < this.maxLength; _i2++) {
          var currentLetter = currentPixels[_i2];
          var nextLetter = nextPixels[_i2];
          for (var _p = 0; _p < currentLetter.length; _p++) {
            var displayNext = Math.random() < nextProbability;
            var _color = displayNext ? nextColor : currentColor;
            var _pixel = displayNext ? nextLetter[_p] : currentLetter[_p];
            if (_pixel === '1') {
              var _x = _p % letterSize;
              var _y = ~~(_p / letterSize);
              var _offset = _i2 * letterSize;
              drawPixel(_offset + _x, _y, _color);
            }
          }
        }
      }
    }
  }]);

  return Letters;
}();

module.exports = Letters;

},{"../addThrottledEventListener":6,"./pixels":5}],5:[function(require,module,exports){
'use strict';

module.exports = { A: ['0000000001111111011111110111111101111111010000010111111101000001', '0000000001111111011100010111000101110001011111110111000101110001', '0000000001111100010000100100000101000001011111110100000101000001', '0000000001111111010000010101110101000001010111010101010101110111', '0000000001111111010000010100000101111111010000010100000101000001', '0000000001111111010000010100000101000001010000010111111101000001', '0000000001111111000000010000000101111111010000010100000101111111', '0000000000001111000100010010000101000001010000010111111101000001', '0000000000011100001000100100000101000001011111110100000101000001'],
   B: ['0000000001111110011110100111111101111001011110010111100101111111', '0000000001111110010000010100000101000001011111100100000101111110', '0000000001000000010000000111111101000001010000010100000101111111', '0000000001111110010000010111111001000001010000010100000101111110', '0000000001111111010000010100000101001110010000010100000101111111', '0000000001111110010000100100001001111111010000010100000101111111', '0000000001011000011001000100001001111110010000010100000101111110', '0000000001111110010000010100000101111110010000010100001101111110', '0000000001111111010000110101110101000011010111010100001101111111'],
   C: ['0000000000111110010000010100000001000000010000000100000100111110', '0000000001111111011111110111111101100000011111110111111101111111', '0000000001111111011111110110001101100000011000110111111101111111', '0000000001111110010011110100111101000000010011110100111101111110', '0000000001111111010001110100011101000000010000000100011101111111', '0000000001111111010000000100000001000000010000000100000001111111', '0000000001111111011111010111110001111100011111010111110101111111', '0000000001111111010000010100000101000000010000000100000101111111', '0000000001111111010000010101111101010000010111110100000101111111'],
   D: ['0000000001111110011111110110001101100011011000110111111101111110', '0000000001111100010000100100000101000001010000010100001001111100', '0000000001111000010001000100001001000001010000100100010001111000', '0000000001111100010000100101100101011101010110010100001001111100', '0000000000000001000000010000000100000001011111110100000101111111', '0000000001111100011100100111000101110001011100010111001001111100', '0000000000000001000000010111111101000001010000010100000101111111', '0000000001111110010000010100000101000001010000010100000101111110', '0000000000000001000000010000000101111111011100010111000101111111'],
   E: ['0000000000011111011100000101000001011111010000000100000001111111', '0000000000111111011000000101000001001111010000000100000001111111', '0000000001111111010000000111111101111111011111110100000001111111', '0000000001111111011111100111111001111111011111100111111001111111', '0000000001111111010000000100000001111111010000000100000001111111', '0000000001111111010000000111111101000000011111110111111101111111', '0000000000011111000100000001000001111110010000000100000001111111', '0000000000011100001000100100000101111111010000000010001000011100', '0000000000011111001000000100000001111111010000000010000000011111'],
   F: ['0000000001111111011110110111101101111000011111110111100001111000', '0000000001111111010000000100000001111111010000000100000001000000', '0000000000111111011000000101000001001111010000000100000001000000', '0000000001111111001000000010000000111111001000000010000001110000', '0000000001111111010000010101111101000001010111110101000001110000', '0000000000111111011000000100000001111110010000000100000001000000', '0000000001111111011000000110000001111111011000000110000001100000', '0000000000011111011100000101000001011111010000000100000001000000', '0000000001111111011111110111111101111111010000000111111101000000'],
   G: ['0000000001111111010000010101111101010001010111010100000101111111', '0000000000111110010000000100000001001110010000010100000100111110', '0000000001111111011110000111100001111011011110010111100101111111', '0000000001111111010000000100000001001111010000010100000101111111', '0000000000111110010000010100000001011111010000010100000100111110', '0000000000011100001000100100000001011111010000010010001000011100', '0000000001111111010000000100000001011111010001000100010001111100', '0000000001111111011111110111111101110000011101110111000101111111', '0000000001111111010000010100000101000001011111110000000101111111'],
   H: ['0000000001000001011111110111111101111111011111110111111101000001', '0000000001100000011000000111111101111111011000110110001101100011', '0000000001111111010111010101110101000001010111010101110101111111', '0000000001000001010000010100000101111111010000010100000101000001', '0000000001110111011101110111011101111111011101110111011101110111', '0000000001000000010000000100000001111110010000010100000101000001', '0000000001110001011100010111000101111111011100010111000101110001', '0000000001111101011111010111110101111101011111110111110101111101', '0000000001000001010000010111111101111111011111110100000101000001'],
   I: ['0000000000001000000000000000100000001000000010000000100001111111', '0000000001111111000111000001110000011100000111000001110001111111', '0000000001111111000010000000100000001000011111110111111101111111', '0000000000001000000000000111111100001000000010000000100001111111', '0000000001111111000010000000100000001000000010000000100001111111', '0000000001111111011111110000100000001000000010000111111101111111', '0000000001111111010000010111011101110111011101110100000101111111', '0000000001111111000000000111111101111111011111110111111101111111', '0000000001111111010000010111011100010100011101110100000101111111'],
   J: ['0000000001111111010000010111011101110111011101110100011101111111', '0000000001111111011111110111111100011100011111000111110001111100', '0000000001111111000111000001110000011100000111000001110001111100', '0000000001111111000010000000100000001000010010000100100001111000', '0000000001111111000111000001110000011100010111000101110000111000', '0000000001111111011111110111111100001000000010000000100001111000', '0000000001111111000010000000100000001000010010000100100000111000', '0000000000011111000000000001111100011111000111110001111101111111', '0000000001111111000010000000100000001000000010000000100001111000'],
   K: ['0000000001111010011110100111101001111111011110010111100101111001', '0000000001111001011110100111110001111010011110010111100101111001', '0000000001000001010000100100010001111000010001000100001001000001', '0000000001111111010111010101101101000111010110110101110101111111', '0000000001100011011001100110110001111000011011000110011001100011', '0000000001110111011101110111011001111100011101100111011101110111', '0000000001100110011001100111111001111111011000110110001101100011', '0000000001000001010000010100011101111000010001110100000101000001', '0000000001000100010001000100010001111111010000010100000101000001'],
   L: ['0000000001100000011000000110000001100000011000000111111101111111', '0000000001111000010010000100100001001111010000010100000101111111', '0000000001111111010111110101111101011111010111110100000101111111', '0000000001111110011111100111111001111110011111100111111001111111', '0000000001000000010000000100000001000000011111110111111101111111', '0000000001000000010000000100000001000000010000000100000001111111', '0000000001000000010000000100000001000000010000000010000000011111', '0000000001110000010100000101000001010000010011110010000100011111', '0000000001111000011110000111100001111000011110000111100001111111'],
   M: ['0000000001110111011111110110101101100011011000110110001101100011', '0000000001111111010111010100100101010101010111010101110101111111', '0000000001110111011101110111111101001001010010010100000101000001', '0000000000111010011101010111000101110001011100010111000101110001', '0000000001111111011111110111111101111111011010110110101101101011', '0000000001110111010010010100100101001001010010010100000101000001', '0000000001110111010111010100100101001001010000010100000101000001', '0000000000110110010111010100100101000001010000010100000101000001', '0000000001111111010010010100100101001001010010010100100101001001'],
   N: ['0000000000111110011111110110001101100011011000110110001101100011', '0000000001111111010011010101010101010101010101010101100101111111', '0000000001111110010000010100000101000001010000010100000101000001', '0000000001100011011100110111101101111111011011110110011101100011', '0000000001000001011000010101000101001001010001010100001101000001', '0000000001111111011111010111110101111101011111010111110101111101', '0000000001111111010000010100000101000001010000010100000101000001', '0000000000111110010011110100111101001111010011110100111101001111', '0000000001111111010000010100000101001001010010010100100101111111'],
   O: ['0000000000111110011100110111001101110011011100110111001100111110', '0000000001111111011100010111000101110001011100010111000101111111', '0000000001111111011000110110001101100011011000110110001101111111', '0000000000111110011111110111111101110111011111110111111100111110', '0000000000111110010000010100000101000001010000010100000100111110', '0000000001111111011011110110111101101111011111110111111101111111', '0000000001111111010000010100000101000001010000010100000101111111', '0000000001111111010000010100000101111111011111110111111101111111', '0000000001111111010000010101110101011101010111010100000101111111'],
   P: ['0000000001111111011111110111111101111111010000010111111101000000', '0000000001111111011111110110001101100011011111110111111101100000', '0000000001111111010000010111111101000000010000000100000001000000', '0000000001111111010000010101110101000001010111110101111101111111', '0000000000111110010000010100000101000001010000010111111001000000', '0000000001111111010000010100000101111111010000000100000001000000', '0000000001111111010000010100110101000001010011110100100001111000', '0000000000111110010000010100000101111110010000000100000001000000', '0000000001111111011100010111000101110001011111110111000001110000'],
   Q: ['0000000001111111010000010100000101001001010010010100100101110111', '0000000001111111010000010100000101000001010001010100010101111111', '0000000001111111011111110110001101111111011111110000001100000011', '0000000001111111011100010111000101110001011101010111010101111111', '0000000000111110011111110111111101110001011101010111010100111110', '0000000001111111010000010100000101111111000000010000000100000001', '0000000000111110010000010100000101000001010001010100010100111110', '0000000001111111010000010101110101011101010101010100000101111111', '0000000001111111011111110100001101000011010010110100011101111111'],
   R: ['0000000001111111010000010101110101010001010101110100011101111111', '0000000001111111010000010101111101011111010111110101111101111111', '0000000001111110010000100100001001111111010000010100000101000001', '0000000001111111011111110110000001100000011000000110000001100000', '0000000000111100010000100100001001111111010000010100000101000001', '0000000000111110011100010111000101111110011100100111001001110011', '0000000001111111010001110101011101000001010111010101110101111111', '0000000001111110011111100110011001111111011111110110001101100011', '0000000000111111011111110110000001100000011000000110000001100000'],
   S: ['0000000000111111010000000100000001111111000000010000000101111110', '0000000001111111010000000100000001000000011111110000000101111111', '0000000000111111011110000111100000111110000011110000111101111110', '0000000001111111011110000111100001111111000011110000111101111111', '0000000001111111010000010101111101000001011111010100000101111111', '0000000001111111011111110100000001111111000000110111111101111111', '0000000001111111011111110111111101000000011111110000000101111111', '0000000001111111010000000111111100000011011111110111111101111111', '0000000001111111010000000100000001111111000000010000000101111111'],
   T: ['0000000001111111011111110001110000011100000111000001110000011100', '0000000001111111010000010101110101001001011010110110001101111111', '0000000001111111010010010000100000001000000010000000100000011100', '0000000001111111000010000000100000001000000010000000100000001000', '0000000001111111010000010111011101110111011101110111011101111111', '0000000000010000000100000111111100010000000100000001000000011111', '0000000001111111011001110100000101100111011001110110000101111111', '0000000001111111010000010111011100010100000101000001010000011100', '0000000001111111011111110111111100011100000111000001110000011100'],
   U: ['0000000001110111011101110111011101110111011101110111011101111111', '0000000001110001011100010111000101110001011100010111000101111111', '0000000001111111010010010100100101001001010000010100000101111111', '0000000001000001010000010100000101000001011111110111111101111111', '0000000001100011011000110110001101100011011000110111111101111111', '0000000001000001010000010100000101000001010000010100000101111111', '0000000001111111010111010101110101011101010111010100000101111111', '0000000001111101011111010111110101111101011111010111110101111111', '0000000001110111011101110111011101110111011111110111111101111111'],
   V: ['0000000001100011011000110110001101100011011101110111011100011100', '0000000001111111010010010100100101001001011000110111011101111111', '0000000001000001010000010100000101100011001000100011011000001000', '0000000001110111011101110111011101110111001101100001010000001000', '0000000001111111010111010101110101101011011010110111011101111111', '0000000001000001010000010100000101000001010000010111011100001000', '0000000001100011011000110110001101100011011000110011011000001000', '0000000001110111011101110111011101110111011111110011111000011100', '0000000001100011011000110110001101110111011111110011111000011100'],
   W: ['0000000001000001010000010100100101001001010010010100100101110111', '0000000001001001010010010100100101001001010010010100100101111111', '0000000001000001010000010100000101000001010010010101110100110110', '0000000001000001010000010100100101001001011111110111011101110111', '0000000001111111010111010101110101010101010010010101110101111111', '0000000001101011011010110110101101111111011111110111111101111111', '0000000001000111010001110100011101000111010001110101011100101110', '0000000001000001010000010100000101001001010010010101110101110111', '0000000001100011011000110110001101100011011010110111111101110111'],
   X: ['0000000001111111010111010110101101110111011010110101110101111111', '0000000001100011011000110111011100001000011101110110001101100011', '0000000001000001010000010111011100011100011101110100000101000001', '0000000001100011011101110011111000011100001111100111011101100011', '0000000001111111010111010100100101100011010010010101110101111111', '0000000001110111011101110011111000011100001111100111011101110111', '0000000001000001010000010010001000011100001000100100000101000001', '0000000001000001001000100001010000001000000101000010001001000001', '0000000001000001010000010100000100111110010000010100000101000001'],
   Y: ['0000000001111111010111010101110101000001011111010100000101111111', '0000000001000001010000010100000101111111000000010000000101111111', '0000000001111111010111010101110101000001011101110110001101111111', '0000000001000001010000010100000101111111000010000000100000011100', '0000000001000001010000010010001000010100000010000000100000011100', '0000000001100011011000110111111101111111000000110111111101111111', '0000000001001111010011110100111101111111000011110000111101111111', '0000000001000001010000010111111100001000011111110111111101111111', '0000000001100011011000110110001100111111000000110000001100111110'],
   Z: ['0000000001111111010000010111110101000001010111110100000101111111', '0000000001111111000000110000011000001000001100000110000001111111', '0000000001111111000000010000000100111111010000000100000000111111', '0000000001111111000001110001110001110000011111110111111101111111', '0000000001111110000000110000001101111111011000000110000000111111', '0000000001111111010000010111110101100011010111110100000101111111', '0000000001111111000000110000011000001000001100000110000001111111', '0000000001111111000000010000000101111111010000000100000001111111', '0000000001111111000000010000000100000001011111110100000001111111'],
   ' ': ['0000000000000000000000000000000000000000000000000000000000000000']
};

},{}],6:[function(require,module,exports){
"use strict";

module.exports = function addThrottledEventListener(eventName, listener) {
  var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

  var inProgress = false;
  target.addEventListener(eventName, function (event) {
    if (inProgress) return;
    inProgress = true;
    window.requestAnimationFrame(function () {
      listener(event);
      inProgress = false;
    });
  });
};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = {
  black: '#000000',
  white: '#ffffff',
  orange: '#ff9600'
};

},{}],8:[function(require,module,exports){
'use strict';

var addThrottledEventListener = require('./addThrottledEventListener');
var constants = require('./constants');
var ConwayTransition = require('./ConwayTransition');
var Letters = require('./Letters');

function $(selector) {
  return [].slice.call(document.querySelectorAll(selector));
}

function transitions(panels) {
  for (var i = 0; i < panels.length - 1; i++) {
    var current = panels[i];
    var next = panels[i + 1];
    var backgroundColor = getColor(current);
    var hColor = getColor(next);
    var cColor = getComplement(backgroundColor, hColor);
    var transition = document.createElement('div');
    next.parentElement.insertBefore(transition, next);
    new ConwayTransition(transition, hColor, cColor, backgroundColor);
  }

  function getColor(element) {
    if (element.classList.contains('black')) return constants.black;
    if (element.classList.contains('white')) return constants.white;
    if (element.classList.contains('orange')) return constants.orange;
  }

  function getComplement(colorOne, colorTwo) {
    var colors = [constants.black, constants.white, constants.orange];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = colors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var color = _step.value;

        if (color !== colorOne && color !== colorTwo) return color;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
}

function titles(panels) {
  var container = document.querySelector('.titles');
  var titles = panels.map(function (panel) {
    return {
      element: panel,
      text: panel.dataset.title,
      color: getTitleColor(panel)
    };
  });
  var letters = new Letters(container, titles);

  function getTitleColor(element) {
    if (element.classList.contains('black')) return constants.white;
    if (element.classList.contains('white')) return constants.orange;
    if (element.classList.contains('orange')) return constants.black;
  }
}

function main() {
  var panels = $('.panel');
  transitions(panels);
  titles(panels);
}
document.addEventListener('DOMContentLoaded', main);

},{"./ConwayTransition":2,"./Letters":4,"./addThrottledEventListener":6,"./constants":7}]},{},[8])
//# sourceMappingURL=hc.js.map
