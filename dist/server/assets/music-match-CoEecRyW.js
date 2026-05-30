import { r as reactExports, V as jsxRuntimeExports } from "./server-HtPeGmJD.js";
import { m as motion, u as useStamps, a as burstCorrect, b as burstFinale, e as exclamHurray, c as exclamWayToGo, d as exclamYouDidIt, f as exclamYouGotIt } from "./JEFF_-_Exclamations_-_You_got_it_-DDyK2YH4.js";
import { A as AnimatePresence } from "./index-BPt5m5eS.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const GRADIENT_STOPS = [
  [0, "#FF4EAB"],
  [0.4, "#FBBF24"],
  [0.75, "#22C55E"],
  [1, "#3B82F6"]
];
function makeGradient(ctx, width2) {
  const g2 = ctx.createLinearGradient(0, 0, width2, 0);
  for (const [stop, color] of GRADIENT_STOPS) g2.addColorStop(stop, color);
  return g2;
}
function WaveformVisualizer({ audioRef, isPlaying, currentTime, duration, onSeek }) {
  const canvasRef = reactExports.useRef(null);
  const analyserRef = reactExports.useRef(null);
  const sourceRef = reactExports.useRef(null);
  const ctxRef = reactExports.useRef(null);
  const rafRef = reactExports.useRef(0);
  const lastFrameRef = reactExports.useRef([]);
  reactExports.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;
    if (!isPlaying) return;
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    ctxRef.current = audioCtx;
    sourceRef.current = source;
    analyserRef.current = analyser;
  }, [isPlaying, audioRef]);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const HEIGHT = canvas.height;
    const WIDTH = canvas.width;
    const BAR_COUNT = 40;
    const BAR_GAP = 2;
    const BAR_W = Math.floor((WIDTH - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT);
    const progress = duration > 0 ? currentTime / duration : 0;
    const drawBars = (amplitudes) => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const grad = makeGradient(ctx, WIDTH);
      const playedX = progress * WIDTH;
      for (let i2 = 0; i2 < BAR_COUNT; i2++) {
        const amplitude = amplitudes[i2] ?? 0.18;
        const barH = Math.max(4, amplitude * HEIGHT);
        const x = i2 * (BAR_W + BAR_GAP);
        const y = (HEIGHT - barH) / 2;
        ctx.globalAlpha = x + BAR_W <= playedX ? 1 : 0.25;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, BAR_W, barH, 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    if (isPlaying && analyserRef.current) {
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        rafRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        const amplitudes = Array.from({ length: BAR_COUNT }, (_2, i2) => {
          const dataIdx = Math.floor(i2 / BAR_COUNT * dataArray.length);
          return dataArray[dataIdx] / 255;
        });
        lastFrameRef.current = amplitudes;
        drawBars(amplitudes);
      };
      draw();
    } else if (lastFrameRef.current.length > 0) {
      cancelAnimationFrame(rafRef.current);
      drawBars(lastFrameRef.current);
    } else {
      cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const grad = makeGradient(ctx, WIDTH);
      const barH = HEIGHT * 0.36;
      const y = (HEIGHT - barH) / 2;
      const radius = barH / 2;
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.roundRect(0, y, WIDTH, barH, radius);
      ctx.fill();
      const filledW = Math.max(0, progress * WIDTH);
      if (filledW > radius * 2) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(0, y, filledW, barH, radius);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, currentTime, duration]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "relative w-full cursor-pointer",
      style: { height: 56 },
      onClick: onSeek,
      role: "slider",
      "aria-label": "Audio progress",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": duration ? Math.round(currentTime / duration * 100) : 0,
      tabIndex: 0,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "canvas",
        {
          ref: canvasRef,
          width: 600,
          height: 56,
          style: { width: "100%", height: "100%", display: "block" }
        }
      )
    }
  );
}
var extendStatics = function(t2, e2) {
  return (extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
    t3.__proto__ = e3;
  } || function(t3, e3) {
    for (var r in e3) Object.prototype.hasOwnProperty.call(e3, r) && (t3[r] = e3[r]);
  })(t2, e2);
};
function __extends(t2, e2) {
  if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
  function r() {
    this.constructor = t2;
  }
  extendStatics(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r.prototype = e2.prototype, new r());
}
var __assign = function() {
  return (__assign = Object.assign || function(t2) {
    for (var e2, r = 1, i2 = arguments.length; r < i2; r++) for (var a2 in e2 = arguments[r]) Object.prototype.hasOwnProperty.call(e2, a2) && (t2[a2] = e2[a2]);
    return t2;
  }).apply(this, arguments);
};
function __awaiter(t2, e2, r, i2) {
  return new (r || (r = Promise))((function(a2, s2) {
    function n2(t3) {
      try {
        h2(i2.next(t3));
      } catch (t4) {
        s2(t4);
      }
    }
    function o2(t3) {
      try {
        h2(i2.throw(t3));
      } catch (t4) {
        s2(t4);
      }
    }
    function h2(t3) {
      var e3;
      t3.done ? a2(t3.value) : (e3 = t3.value, e3 instanceof r ? e3 : new r((function(t4) {
        t4(e3);
      }))).then(n2, o2);
    }
    h2((i2 = i2.apply(t2, [])).next());
  }));
}
function __generator(t2, e2) {
  var r, i2, a2, s2, n2 = { label: 0, sent: function() {
    if (1 & a2[0]) throw a2[1];
    return a2[1];
  }, trys: [], ops: [] };
  return s2 = { next: o2(0), throw: o2(1), return: o2(2) }, "function" == typeof Symbol && (s2[Symbol.iterator] = function() {
    return this;
  }), s2;
  function o2(s3) {
    return function(o3) {
      return (function(s4) {
        if (r) throw new TypeError("Generator is already executing.");
        for (; n2; ) try {
          if (r = 1, i2 && (a2 = 2 & s4[0] ? i2.return : s4[0] ? i2.throw || ((a2 = i2.return) && a2.call(i2), 0) : i2.next) && !(a2 = a2.call(i2, s4[1])).done) return a2;
          switch (i2 = 0, a2 && (s4 = [2 & s4[0], a2.value]), s4[0]) {
            case 0:
            case 1:
              a2 = s4;
              break;
            case 4:
              return n2.label++, { value: s4[1], done: false };
            case 5:
              n2.label++, i2 = s4[1], s4 = [0];
              continue;
            case 7:
              s4 = n2.ops.pop(), n2.trys.pop();
              continue;
            default:
              if (!(a2 = n2.trys, (a2 = a2.length > 0 && a2[a2.length - 1]) || 6 !== s4[0] && 2 !== s4[0])) {
                n2 = 0;
                continue;
              }
              if (3 === s4[0] && (!a2 || s4[1] > a2[0] && s4[1] < a2[3])) {
                n2.label = s4[1];
                break;
              }
              if (6 === s4[0] && n2.label < a2[1]) {
                n2.label = a2[1], a2 = s4;
                break;
              }
              if (a2 && n2.label < a2[2]) {
                n2.label = a2[2], n2.ops.push(s4);
                break;
              }
              a2[2] && n2.ops.pop(), n2.trys.pop();
              continue;
          }
          s4 = e2.call(t2, n2);
        } catch (t3) {
          s4 = [6, t3], i2 = 0;
        } finally {
          r = a2 = 0;
        }
        if (5 & s4[0]) throw s4[1];
        return { value: s4[0] ? s4[1] : void 0, done: true };
      })([s3, o3]);
    };
  }
}
function createCommonjsModule(t2, e2) {
  return t2(e2 = { exports: {} }, e2.exports), e2.exports;
}
var lottie = createCommonjsModule((function(module, exports) {
  "undefined" != typeof navigator && (function(t2, e2) {
    module.exports = e2();
  })(0, (function() {
    var svgNS = "http://www.w3.org/2000/svg", locationHref = "", _useWebWorker = false, initialDefaultFrame = -999999, setWebWorker = function(t2) {
      _useWebWorker = !!t2;
    }, getWebWorker = function() {
      return _useWebWorker;
    }, setLocationHref = function(t2) {
      locationHref = t2;
    }, getLocationHref = function() {
      return locationHref;
    };
    function createTag(t2) {
      return document.createElement(t2);
    }
    function extendPrototype(t2, e2) {
      var r, i2, a2 = t2.length;
      for (r = 0; r < a2; r += 1) for (var s2 in i2 = t2[r].prototype) Object.prototype.hasOwnProperty.call(i2, s2) && (e2.prototype[s2] = i2[s2]);
    }
    function getDescriptor(t2, e2) {
      return Object.getOwnPropertyDescriptor(t2, e2);
    }
    function createProxyFunction(t2) {
      function e2() {
      }
      return e2.prototype = t2, e2;
    }
    var audioControllerFactory = (function() {
      function t2(t3) {
        this.audios = [], this.audioFactory = t3, this._volume = 1, this._isMuted = false;
      }
      return t2.prototype = { addAudio: function(t3) {
        this.audios.push(t3);
      }, pause: function() {
        var t3, e2 = this.audios.length;
        for (t3 = 0; t3 < e2; t3 += 1) this.audios[t3].pause();
      }, resume: function() {
        var t3, e2 = this.audios.length;
        for (t3 = 0; t3 < e2; t3 += 1) this.audios[t3].resume();
      }, setRate: function(t3) {
        var e2, r = this.audios.length;
        for (e2 = 0; e2 < r; e2 += 1) this.audios[e2].setRate(t3);
      }, createAudio: function(t3) {
        return this.audioFactory ? this.audioFactory(t3) : window.Howl ? new window.Howl({ src: [t3] }) : { isPlaying: false, play: function() {
          this.isPlaying = true;
        }, seek: function() {
          this.isPlaying = false;
        }, playing: function() {
        }, rate: function() {
        }, setVolume: function() {
        } };
      }, setAudioFactory: function(t3) {
        this.audioFactory = t3;
      }, setVolume: function(t3) {
        this._volume = t3, this._updateVolume();
      }, mute: function() {
        this._isMuted = true, this._updateVolume();
      }, unmute: function() {
        this._isMuted = false, this._updateVolume();
      }, getVolume: function() {
        return this._volume;
      }, _updateVolume: function() {
        var t3, e2 = this.audios.length;
        for (t3 = 0; t3 < e2; t3 += 1) this.audios[t3].volume(this._volume * (this._isMuted ? 0 : 1));
      } }, function() {
        return new t2();
      };
    })(), createTypedArray = /* @__PURE__ */ (function() {
      function t2(t3, e2) {
        var r, i2 = 0, a2 = [];
        switch (t3) {
          case "int16":
          case "uint8c":
            r = 1;
            break;
          default:
            r = 1.1;
        }
        for (i2 = 0; i2 < e2; i2 += 1) a2.push(r);
        return a2;
      }
      return "function" == typeof Uint8ClampedArray && "function" == typeof Float32Array ? function(e2, r) {
        return "float32" === e2 ? new Float32Array(r) : "int16" === e2 ? new Int16Array(r) : "uint8c" === e2 ? new Uint8ClampedArray(r) : t2(e2, r);
      } : t2;
    })();
    function createSizedArray(t2) {
      return Array.apply(null, { length: t2 });
    }
    function _typeof$6(t2) {
      return (_typeof$6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    var subframeEnabled = true, expressionsPlugin = null, expressionsInterfaces = null, idPrefix$1 = "", isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent), bmPow = Math.pow, bmSqrt = Math.sqrt, bmFloor = Math.floor, bmMax = Math.max, bmMin = Math.min, BMMath = {};
    !(function() {
      var t2, e2 = ["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "cbrt", "expm1", "clz32", "cos", "cosh", "exp", "floor", "fround", "hypot", "imul", "log", "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"], r = e2.length;
      for (t2 = 0; t2 < r; t2 += 1) BMMath[e2[t2]] = Math[e2[t2]];
    })(), BMMath.random = Math.random, BMMath.abs = function(t2) {
      if ("object" === _typeof$6(t2) && t2.length) {
        var e2, r = createSizedArray(t2.length), i2 = t2.length;
        for (e2 = 0; e2 < i2; e2 += 1) r[e2] = Math.abs(t2[e2]);
        return r;
      }
      return Math.abs(t2);
    };
    var defaultCurveSegments = 150, degToRads = Math.PI / 180, roundCorner = 0.5519;
    function styleDiv(t2) {
      t2.style.position = "absolute", t2.style.top = 0, t2.style.left = 0, t2.style.display = "block", t2.style.transformOrigin = "0 0", t2.style.webkitTransformOrigin = "0 0", t2.style.backfaceVisibility = "visible", t2.style.webkitBackfaceVisibility = "visible", t2.style.transformStyle = "preserve-3d", t2.style.webkitTransformStyle = "preserve-3d", t2.style.mozTransformStyle = "preserve-3d";
    }
    function BMEnterFrameEvent(t2, e2, r, i2) {
      this.type = t2, this.currentTime = e2, this.totalTime = r, this.direction = i2 < 0 ? -1 : 1;
    }
    function BMCompleteEvent(t2, e2) {
      this.type = t2, this.direction = e2 < 0 ? -1 : 1;
    }
    function BMCompleteLoopEvent(t2, e2, r, i2) {
      this.type = t2, this.currentLoop = r, this.totalLoops = e2, this.direction = i2 < 0 ? -1 : 1;
    }
    function BMSegmentStartEvent(t2, e2, r) {
      this.type = t2, this.firstFrame = e2, this.totalFrames = r;
    }
    function BMDestroyEvent(t2, e2) {
      this.type = t2, this.target = e2;
    }
    function BMRenderFrameErrorEvent(t2, e2) {
      this.type = "renderFrameError", this.nativeError = t2, this.currentTime = e2;
    }
    function BMConfigErrorEvent(t2) {
      this.type = "configError", this.nativeError = t2;
    }
    var createElementID = (_count = 0, function() {
      return idPrefix$1 + "__lottie_element_" + (_count += 1);
    }), _count;
    function HSVtoRGB(t2, e2, r) {
      var i2, a2, s2, n2, o2, h2, l2, p2;
      switch (h2 = r * (1 - e2), l2 = r * (1 - (o2 = 6 * t2 - (n2 = Math.floor(6 * t2))) * e2), p2 = r * (1 - (1 - o2) * e2), n2 % 6) {
        case 0:
          i2 = r, a2 = p2, s2 = h2;
          break;
        case 1:
          i2 = l2, a2 = r, s2 = h2;
          break;
        case 2:
          i2 = h2, a2 = r, s2 = p2;
          break;
        case 3:
          i2 = h2, a2 = l2, s2 = r;
          break;
        case 4:
          i2 = p2, a2 = h2, s2 = r;
          break;
        case 5:
          i2 = r, a2 = h2, s2 = l2;
      }
      return [i2, a2, s2];
    }
    function RGBtoHSV(t2, e2, r) {
      var i2, a2 = Math.max(t2, e2, r), s2 = Math.min(t2, e2, r), n2 = a2 - s2, o2 = 0 === a2 ? 0 : n2 / a2, h2 = a2 / 255;
      switch (a2) {
        case s2:
          i2 = 0;
          break;
        case t2:
          i2 = e2 - r + n2 * (e2 < r ? 6 : 0), i2 /= 6 * n2;
          break;
        case e2:
          i2 = r - t2 + 2 * n2, i2 /= 6 * n2;
          break;
        case r:
          i2 = t2 - e2 + 4 * n2, i2 /= 6 * n2;
      }
      return [i2, o2, h2];
    }
    function addSaturationToRGB(t2, e2) {
      var r = RGBtoHSV(255 * t2[0], 255 * t2[1], 255 * t2[2]);
      return r[1] += e2, r[1] > 1 ? r[1] = 1 : r[1] <= 0 && (r[1] = 0), HSVtoRGB(r[0], r[1], r[2]);
    }
    function addBrightnessToRGB(t2, e2) {
      var r = RGBtoHSV(255 * t2[0], 255 * t2[1], 255 * t2[2]);
      return r[2] += e2, r[2] > 1 ? r[2] = 1 : r[2] < 0 && (r[2] = 0), HSVtoRGB(r[0], r[1], r[2]);
    }
    function addHueToRGB(t2, e2) {
      var r = RGBtoHSV(255 * t2[0], 255 * t2[1], 255 * t2[2]);
      return r[0] += e2 / 360, r[0] > 1 ? r[0] -= 1 : r[0] < 0 && (r[0] += 1), HSVtoRGB(r[0], r[1], r[2]);
    }
    var rgbToHex = (function() {
      var t2, e2, r = [];
      for (t2 = 0; t2 < 256; t2 += 1) e2 = t2.toString(16), r[t2] = 1 === e2.length ? "0" + e2 : e2;
      return function(t3, e3, i2) {
        return t3 < 0 && (t3 = 0), e3 < 0 && (e3 = 0), i2 < 0 && (i2 = 0), "#" + r[t3] + r[e3] + r[i2];
      };
    })(), setSubframeEnabled = function(t2) {
      subframeEnabled = !!t2;
    }, getSubframeEnabled = function() {
      return subframeEnabled;
    }, setExpressionsPlugin = function(t2) {
      expressionsPlugin = t2;
    }, getExpressionsPlugin = function() {
      return expressionsPlugin;
    }, setExpressionInterfaces = function(t2) {
      expressionsInterfaces = t2;
    }, getExpressionInterfaces = function() {
      return expressionsInterfaces;
    }, setDefaultCurveSegments = function(t2) {
      defaultCurveSegments = t2;
    }, getDefaultCurveSegments = function() {
      return defaultCurveSegments;
    }, setIdPrefix = function(t2) {
      idPrefix$1 = t2;
    };
    function createNS(t2) {
      return document.createElementNS(svgNS, t2);
    }
    function _typeof$5(t2) {
      return (_typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    var dataManager = /* @__PURE__ */ (function() {
      var t2, e2, r = 1, i2 = [], a2 = { onmessage: function() {
      }, postMessage: function(e3) {
        t2({ data: e3 });
      } }, s2 = { postMessage: function(t3) {
        a2.onmessage({ data: t3 });
      } };
      function n2() {
        e2 || ((e2 = (function(e3) {
          if (window.Worker && window.Blob && getWebWorker()) {
            var r2 = new Blob(["var _workerSelf = self; self.onmessage = ", e3.toString()], { type: "text/javascript" }), i3 = URL.createObjectURL(r2);
            return new Worker(i3);
          }
          return t2 = e3, a2;
        })((function(t3) {
          if (s2.dataManager || (s2.dataManager = (function() {
            function t4(a4, s4) {
              var n4, o4, h3, l3, p3, c3, m2 = a4.length;
              for (o4 = 0; o4 < m2; o4 += 1) if ("ks" in (n4 = a4[o4]) && !n4.completed) {
                if (n4.completed = true, n4.hasMask) {
                  var d2 = n4.masksProperties;
                  for (l3 = d2.length, h3 = 0; h3 < l3; h3 += 1) if (d2[h3].pt.k.i) i3(d2[h3].pt.k);
                  else for (c3 = d2[h3].pt.k.length, p3 = 0; p3 < c3; p3 += 1) d2[h3].pt.k[p3].s && i3(d2[h3].pt.k[p3].s[0]), d2[h3].pt.k[p3].e && i3(d2[h3].pt.k[p3].e[0]);
                }
                0 === n4.ty ? (n4.layers = e4(n4.refId, s4), t4(n4.layers, s4)) : 4 === n4.ty ? r2(n4.shapes) : 5 === n4.ty && f2(n4);
              }
            }
            function e4(t5, e5) {
              var r3 = (function(t6, e6) {
                for (var r4 = 0, i4 = e6.length; r4 < i4; ) {
                  if (e6[r4].id === t6) return e6[r4];
                  r4 += 1;
                }
                return null;
              })(t5, e5);
              return r3 ? r3.layers.__used ? JSON.parse(JSON.stringify(r3.layers)) : (r3.layers.__used = true, r3.layers) : null;
            }
            function r2(t5) {
              var e5, a4, s4;
              for (e5 = t5.length - 1; e5 >= 0; e5 -= 1) if ("sh" === t5[e5].ty) if (t5[e5].ks.k.i) i3(t5[e5].ks.k);
              else for (s4 = t5[e5].ks.k.length, a4 = 0; a4 < s4; a4 += 1) t5[e5].ks.k[a4].s && i3(t5[e5].ks.k[a4].s[0]), t5[e5].ks.k[a4].e && i3(t5[e5].ks.k[a4].e[0]);
              else "gr" === t5[e5].ty && r2(t5[e5].it);
            }
            function i3(t5) {
              var e5, r3 = t5.i.length;
              for (e5 = 0; e5 < r3; e5 += 1) t5.i[e5][0] += t5.v[e5][0], t5.i[e5][1] += t5.v[e5][1], t5.o[e5][0] += t5.v[e5][0], t5.o[e5][1] += t5.v[e5][1];
            }
            function a3(t5, e5) {
              var r3 = e5 ? e5.split(".") : [100, 100, 100];
              return t5[0] > r3[0] || !(r3[0] > t5[0]) && (t5[1] > r3[1] || !(r3[1] > t5[1]) && (t5[2] > r3[2] || !(r3[2] > t5[2]) && null));
            }
            var s3, n3 = /* @__PURE__ */ (function() {
              var t5 = [4, 4, 14];
              function e5(t6) {
                var e6, r3, i4, a4 = t6.length;
                for (e6 = 0; e6 < a4; e6 += 1) 5 === t6[e6].ty && (r3 = t6[e6], i4 = void 0, i4 = r3.t.d, r3.t.d = { k: [{ s: i4, t: 0 }] });
              }
              return function(r3) {
                if (a3(t5, r3.v) && (e5(r3.layers), r3.assets)) {
                  var i4, s4 = r3.assets.length;
                  for (i4 = 0; i4 < s4; i4 += 1) r3.assets[i4].layers && e5(r3.assets[i4].layers);
                }
              };
            })(), o3 = (s3 = [4, 7, 99], function(t5) {
              if (t5.chars && !a3(s3, t5.v)) {
                var e5, i4 = t5.chars.length;
                for (e5 = 0; e5 < i4; e5 += 1) {
                  var n4 = t5.chars[e5];
                  n4.data && n4.data.shapes && (r2(n4.data.shapes), n4.data.ip = 0, n4.data.op = 99999, n4.data.st = 0, n4.data.sr = 1, n4.data.ks = { p: { k: [0, 0], a: 0 }, s: { k: [100, 100], a: 0 }, a: { k: [0, 0], a: 0 }, r: { k: 0, a: 0 }, o: { k: 100, a: 0 } }, t5.chars[e5].t || (n4.data.shapes.push({ ty: "no" }), n4.data.shapes[0].it.push({ p: { k: [0, 0], a: 0 }, s: { k: [100, 100], a: 0 }, a: { k: [0, 0], a: 0 }, r: { k: 0, a: 0 }, o: { k: 100, a: 0 }, sk: { k: 0, a: 0 }, sa: { k: 0, a: 0 }, ty: "tr" })));
                }
              }
            }), h2 = /* @__PURE__ */ (function() {
              var t5 = [5, 7, 15];
              function e5(t6) {
                var e6, r3, i4, a4 = t6.length;
                for (e6 = 0; e6 < a4; e6 += 1) 5 === t6[e6].ty && (r3 = t6[e6], i4 = void 0, "number" == typeof (i4 = r3.t.p).a && (i4.a = { a: 0, k: i4.a }), "number" == typeof i4.p && (i4.p = { a: 0, k: i4.p }), "number" == typeof i4.r && (i4.r = { a: 0, k: i4.r }));
              }
              return function(r3) {
                if (a3(t5, r3.v) && (e5(r3.layers), r3.assets)) {
                  var i4, s4 = r3.assets.length;
                  for (i4 = 0; i4 < s4; i4 += 1) r3.assets[i4].layers && e5(r3.assets[i4].layers);
                }
              };
            })(), l2 = /* @__PURE__ */ (function() {
              var t5 = [4, 1, 9];
              function e5(t6) {
                var r4, i4, a4, s4 = t6.length;
                for (r4 = 0; r4 < s4; r4 += 1) if ("gr" === t6[r4].ty) e5(t6[r4].it);
                else if ("fl" === t6[r4].ty || "st" === t6[r4].ty) if (t6[r4].c.k && t6[r4].c.k[0].i) for (a4 = t6[r4].c.k.length, i4 = 0; i4 < a4; i4 += 1) t6[r4].c.k[i4].s && (t6[r4].c.k[i4].s[0] /= 255, t6[r4].c.k[i4].s[1] /= 255, t6[r4].c.k[i4].s[2] /= 255, t6[r4].c.k[i4].s[3] /= 255), t6[r4].c.k[i4].e && (t6[r4].c.k[i4].e[0] /= 255, t6[r4].c.k[i4].e[1] /= 255, t6[r4].c.k[i4].e[2] /= 255, t6[r4].c.k[i4].e[3] /= 255);
                else t6[r4].c.k[0] /= 255, t6[r4].c.k[1] /= 255, t6[r4].c.k[2] /= 255, t6[r4].c.k[3] /= 255;
              }
              function r3(t6) {
                var r4, i4 = t6.length;
                for (r4 = 0; r4 < i4; r4 += 1) 4 === t6[r4].ty && e5(t6[r4].shapes);
              }
              return function(e6) {
                if (a3(t5, e6.v) && (r3(e6.layers), e6.assets)) {
                  var i4, s4 = e6.assets.length;
                  for (i4 = 0; i4 < s4; i4 += 1) e6.assets[i4].layers && r3(e6.assets[i4].layers);
                }
              };
            })(), p2 = /* @__PURE__ */ (function() {
              var t5 = [4, 4, 18];
              function e5(t6) {
                var r4, i4, a4;
                for (r4 = t6.length - 1; r4 >= 0; r4 -= 1) if ("sh" === t6[r4].ty) if (t6[r4].ks.k.i) t6[r4].ks.k.c = t6[r4].closed;
                else for (a4 = t6[r4].ks.k.length, i4 = 0; i4 < a4; i4 += 1) t6[r4].ks.k[i4].s && (t6[r4].ks.k[i4].s[0].c = t6[r4].closed), t6[r4].ks.k[i4].e && (t6[r4].ks.k[i4].e[0].c = t6[r4].closed);
                else "gr" === t6[r4].ty && e5(t6[r4].it);
              }
              function r3(t6) {
                var r4, i4, a4, s4, n4, o4, h3 = t6.length;
                for (i4 = 0; i4 < h3; i4 += 1) {
                  if ((r4 = t6[i4]).hasMask) {
                    var l3 = r4.masksProperties;
                    for (s4 = l3.length, a4 = 0; a4 < s4; a4 += 1) if (l3[a4].pt.k.i) l3[a4].pt.k.c = l3[a4].cl;
                    else for (o4 = l3[a4].pt.k.length, n4 = 0; n4 < o4; n4 += 1) l3[a4].pt.k[n4].s && (l3[a4].pt.k[n4].s[0].c = l3[a4].cl), l3[a4].pt.k[n4].e && (l3[a4].pt.k[n4].e[0].c = l3[a4].cl);
                  }
                  4 === r4.ty && e5(r4.shapes);
                }
              }
              return function(e6) {
                if (a3(t5, e6.v) && (r3(e6.layers), e6.assets)) {
                  var i4, s4 = e6.assets.length;
                  for (i4 = 0; i4 < s4; i4 += 1) e6.assets[i4].layers && r3(e6.assets[i4].layers);
                }
              };
            })();
            function f2(t5) {
              0 === t5.t.a.length && t5.t.p;
            }
            var c2 = { completeData: function(r3) {
              r3.__complete || (l2(r3), n3(r3), o3(r3), h2(r3), p2(r3), t4(r3.layers, r3.assets), (function(r4, i4) {
                if (r4) {
                  var a4 = 0, s4 = r4.length;
                  for (a4 = 0; a4 < s4; a4 += 1) 1 === r4[a4].t && (r4[a4].data.layers = e4(r4[a4].data.refId, i4), t4(r4[a4].data.layers, i4));
                }
              })(r3.chars, r3.assets), r3.__complete = true);
            } };
            return c2.checkColors = l2, c2.checkChars = o3, c2.checkPathProperties = h2, c2.checkShapes = p2, c2.completeLayers = t4, c2;
          })()), s2.assetLoader || (s2.assetLoader = /* @__PURE__ */ (function() {
            function t4(t5) {
              var e4 = t5.getResponseHeader("content-type");
              return e4 && "json" === t5.responseType && -1 !== e4.indexOf("json") || t5.response && "object" === _typeof$5(t5.response) ? t5.response : t5.response && "string" == typeof t5.response ? JSON.parse(t5.response) : t5.responseText ? JSON.parse(t5.responseText) : null;
            }
            return { load: function(e4, r2, i3, a3) {
              var s3, n3 = new XMLHttpRequest();
              try {
                n3.responseType = "json";
              } catch (t5) {
              }
              n3.onreadystatechange = function() {
                if (4 === n3.readyState) if (200 === n3.status) s3 = t4(n3), i3(s3);
                else try {
                  s3 = t4(n3), i3(s3);
                } catch (t5) {
                  a3 && a3(t5);
                }
              };
              try {
                n3.open(["G", "E", "T"].join(""), e4, true);
              } catch (t5) {
                n3.open(["G", "E", "T"].join(""), r2 + "/" + e4, true);
              }
              n3.send();
            } };
          })()), "loadAnimation" === t3.data.type) s2.assetLoader.load(t3.data.path, t3.data.fullPath, (function(e4) {
            s2.dataManager.completeData(e4), s2.postMessage({ id: t3.data.id, payload: e4, status: "success" });
          }), (function() {
            s2.postMessage({ id: t3.data.id, status: "error" });
          }));
          else if ("complete" === t3.data.type) {
            var e3 = t3.data.animation;
            s2.dataManager.completeData(e3), s2.postMessage({ id: t3.data.id, payload: e3, status: "success" });
          } else "loadData" === t3.data.type && s2.assetLoader.load(t3.data.path, t3.data.fullPath, (function(e4) {
            s2.postMessage({ id: t3.data.id, payload: e4, status: "success" });
          }), (function() {
            s2.postMessage({ id: t3.data.id, status: "error" });
          }));
        }))).onmessage = function(t3) {
          var e3 = t3.data, r2 = e3.id, a3 = i2[r2];
          i2[r2] = null, "success" === e3.status ? a3.onComplete(e3.payload) : a3.onError && a3.onError();
        });
      }
      function o2(t3, e3) {
        var a3 = "processId_" + (r += 1);
        return i2[a3] = { onComplete: t3, onError: e3 }, a3;
      }
      return { loadAnimation: function(t3, r2, i3) {
        n2();
        var a3 = o2(r2, i3);
        e2.postMessage({ type: "loadAnimation", path: t3, fullPath: window.location.origin + window.location.pathname, id: a3 });
      }, loadData: function(t3, r2, i3) {
        n2();
        var a3 = o2(r2, i3);
        e2.postMessage({ type: "loadData", path: t3, fullPath: window.location.origin + window.location.pathname, id: a3 });
      }, completeAnimation: function(t3, r2, i3) {
        n2();
        var a3 = o2(r2, i3);
        e2.postMessage({ type: "complete", animation: t3, id: a3 });
      } };
    })(), ImagePreloader = (function() {
      var t2 = (function() {
        var t3 = createTag("canvas");
        t3.width = 1, t3.height = 1;
        var e3 = t3.getContext("2d");
        return e3.fillStyle = "rgba(0,0,0,0)", e3.fillRect(0, 0, 1, 1), t3;
      })();
      function e2() {
        this.loadedAssets += 1, this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages && this.imagesLoadedCb && this.imagesLoadedCb(null);
      }
      function r() {
        this.loadedFootagesCount += 1, this.loadedAssets === this.totalImages && this.loadedFootagesCount === this.totalFootages && this.imagesLoadedCb && this.imagesLoadedCb(null);
      }
      function i2(t3, e3, r2) {
        var i3 = "";
        if (t3.e) i3 = t3.p;
        else if (e3) {
          var a3 = t3.p;
          -1 !== a3.indexOf("images/") && (a3 = a3.split("/")[1]), i3 = e3 + a3;
        } else i3 = r2, i3 += t3.u ? t3.u : "", i3 += t3.p;
        return i3;
      }
      function a2(t3) {
        var e3 = 0, r2 = setInterval(function() {
          (t3.getBBox().width || e3 > 500) && (this._imageLoaded(), clearInterval(r2)), e3 += 1;
        }.bind(this), 50);
      }
      function s2(t3) {
        var e3 = { assetData: t3 }, r2 = i2(t3, this.assetsPath, this.path);
        return dataManager.loadData(r2, function(t4) {
          e3.img = t4, this._footageLoaded();
        }.bind(this), function() {
          e3.img = {}, this._footageLoaded();
        }.bind(this)), e3;
      }
      function n2() {
        this._imageLoaded = e2.bind(this), this._footageLoaded = r.bind(this), this.testImageLoaded = a2.bind(this), this.createFootageData = s2.bind(this), this.assetsPath = "", this.path = "", this.totalImages = 0, this.totalFootages = 0, this.loadedAssets = 0, this.loadedFootagesCount = 0, this.imagesLoadedCb = null, this.images = [];
      }
      return n2.prototype = { loadAssets: function(t3, e3) {
        var r2;
        this.imagesLoadedCb = e3;
        var i3 = t3.length;
        for (r2 = 0; r2 < i3; r2 += 1) t3[r2].layers || (t3[r2].t && "seq" !== t3[r2].t ? 3 === t3[r2].t && (this.totalFootages += 1, this.images.push(this.createFootageData(t3[r2]))) : (this.totalImages += 1, this.images.push(this._createImageData(t3[r2]))));
      }, setAssetsPath: function(t3) {
        this.assetsPath = t3 || "";
      }, setPath: function(t3) {
        this.path = t3 || "";
      }, loadedImages: function() {
        return this.totalImages === this.loadedAssets;
      }, loadedFootages: function() {
        return this.totalFootages === this.loadedFootagesCount;
      }, destroy: function() {
        this.imagesLoadedCb = null, this.images.length = 0;
      }, getAsset: function(t3) {
        for (var e3 = 0, r2 = this.images.length; e3 < r2; ) {
          if (this.images[e3].assetData === t3) return this.images[e3].img;
          e3 += 1;
        }
        return null;
      }, createImgData: function(e3) {
        var r2 = i2(e3, this.assetsPath, this.path), a3 = createTag("img");
        a3.crossOrigin = "anonymous", a3.addEventListener("load", this._imageLoaded, false), a3.addEventListener("error", function() {
          s3.img = t2, this._imageLoaded();
        }.bind(this), false), a3.src = r2;
        var s3 = { img: a3, assetData: e3 };
        return s3;
      }, createImageData: function(e3) {
        var r2 = i2(e3, this.assetsPath, this.path), a3 = createNS("image");
        isSafari ? this.testImageLoaded(a3) : a3.addEventListener("load", this._imageLoaded, false), a3.addEventListener("error", function() {
          s3.img = t2, this._imageLoaded();
        }.bind(this), false), a3.setAttributeNS("http://www.w3.org/1999/xlink", "href", r2), this._elementHelper.append ? this._elementHelper.append(a3) : this._elementHelper.appendChild(a3);
        var s3 = { img: a3, assetData: e3 };
        return s3;
      }, imageLoaded: e2, footageLoaded: r, setCacheType: function(t3, e3) {
        "svg" === t3 ? (this._elementHelper = e3, this._createImageData = this.createImageData.bind(this)) : this._createImageData = this.createImgData.bind(this);
      } }, n2;
    })();
    function BaseEvent() {
    }
    BaseEvent.prototype = { triggerEvent: function(t2, e2) {
      if (this._cbs[t2]) for (var r = this._cbs[t2], i2 = 0; i2 < r.length; i2 += 1) r[i2](e2);
    }, addEventListener: function(t2, e2) {
      return this._cbs[t2] || (this._cbs[t2] = []), this._cbs[t2].push(e2), function() {
        this.removeEventListener(t2, e2);
      }.bind(this);
    }, removeEventListener: function(t2, e2) {
      if (e2) {
        if (this._cbs[t2]) {
          for (var r = 0, i2 = this._cbs[t2].length; r < i2; ) this._cbs[t2][r] === e2 && (this._cbs[t2].splice(r, 1), r -= 1, i2 -= 1), r += 1;
          this._cbs[t2].length || (this._cbs[t2] = null);
        }
      } else this._cbs[t2] = null;
    } };
    var markerParser = /* @__PURE__ */ (function() {
      function t2(t3) {
        for (var e2, r = t3.split("\r\n"), i2 = {}, a2 = 0, s2 = 0; s2 < r.length; s2 += 1) 2 === (e2 = r[s2].split(":")).length && (i2[e2[0]] = e2[1].trim(), a2 += 1);
        if (0 === a2) throw new Error();
        return i2;
      }
      return function(e2) {
        for (var r = [], i2 = 0; i2 < e2.length; i2 += 1) {
          var a2 = e2[i2], s2 = { time: a2.tm, duration: a2.dr };
          try {
            s2.payload = JSON.parse(e2[i2].cm);
          } catch (r2) {
            try {
              s2.payload = t2(e2[i2].cm);
            } catch (t3) {
              s2.payload = { name: e2[i2].cm };
            }
          }
          r.push(s2);
        }
        return r;
      };
    })(), ProjectInterface = /* @__PURE__ */ (function() {
      function t2(t3) {
        this.compositions.push(t3);
      }
      return function() {
        function e2(t3) {
          for (var e3 = 0, r = this.compositions.length; e3 < r; ) {
            if (this.compositions[e3].data && this.compositions[e3].data.nm === t3) return this.compositions[e3].prepareFrame && this.compositions[e3].data.xt && this.compositions[e3].prepareFrame(this.currentFrame), this.compositions[e3].compInterface;
            e3 += 1;
          }
          return null;
        }
        return e2.compositions = [], e2.currentFrame = 0, e2.registerComposition = t2, e2;
      };
    })(), renderers = {}, registerRenderer = function(t2, e2) {
      renderers[t2] = e2;
    };
    function getRenderer(t2) {
      return renderers[t2];
    }
    function getRegisteredRenderer() {
      if (renderers.canvas) return "canvas";
      for (var t2 in renderers) if (renderers[t2]) return t2;
      return "";
    }
    function _typeof$4(t2) {
      return (_typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    var AnimationItem = function() {
      this._cbs = [], this.name = "", this.path = "", this.isLoaded = false, this.currentFrame = 0, this.currentRawFrame = 0, this.firstFrame = 0, this.totalFrames = 0, this.frameRate = 0, this.frameMult = 0, this.playSpeed = 1, this.playDirection = 1, this.playCount = 0, this.animationData = {}, this.assets = [], this.isPaused = true, this.autoplay = false, this.loop = true, this.renderer = null, this.animationID = createElementID(), this.assetsPath = "", this.timeCompleted = 0, this.segmentPos = 0, this.isSubframeEnabled = getSubframeEnabled(), this.segments = [], this._idle = true, this._completedLoop = false, this.projectInterface = ProjectInterface(), this.imagePreloader = new ImagePreloader(), this.audioController = audioControllerFactory(), this.markers = [], this.configAnimation = this.configAnimation.bind(this), this.onSetupError = this.onSetupError.bind(this), this.onSegmentComplete = this.onSegmentComplete.bind(this), this.drawnFrameEvent = new BMEnterFrameEvent("drawnFrame", 0, 0, 0), this.expressionsPlugin = getExpressionsPlugin();
    };
    extendPrototype([BaseEvent], AnimationItem), AnimationItem.prototype.setParams = function(t2) {
      (t2.wrapper || t2.container) && (this.wrapper = t2.wrapper || t2.container);
      var e2 = "svg";
      t2.animType ? e2 = t2.animType : t2.renderer && (e2 = t2.renderer);
      var r = getRenderer(e2);
      this.renderer = new r(this, t2.rendererSettings), this.imagePreloader.setCacheType(e2, this.renderer.globalData.defs), this.renderer.setProjectInterface(this.projectInterface), this.animType = e2, "" === t2.loop || null === t2.loop || void 0 === t2.loop || true === t2.loop ? this.loop = true : false === t2.loop ? this.loop = false : this.loop = parseInt(t2.loop, 10), this.autoplay = !("autoplay" in t2) || t2.autoplay, this.name = t2.name ? t2.name : "", this.autoloadSegments = !Object.prototype.hasOwnProperty.call(t2, "autoloadSegments") || t2.autoloadSegments, this.assetsPath = t2.assetsPath, this.initialSegment = t2.initialSegment, t2.audioFactory && this.audioController.setAudioFactory(t2.audioFactory), t2.animationData ? this.setupAnimation(t2.animationData) : t2.path && (-1 !== t2.path.lastIndexOf("\\") ? this.path = t2.path.substr(0, t2.path.lastIndexOf("\\") + 1) : this.path = t2.path.substr(0, t2.path.lastIndexOf("/") + 1), this.fileName = t2.path.substr(t2.path.lastIndexOf("/") + 1), this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf(".json")), dataManager.loadAnimation(t2.path, this.configAnimation, this.onSetupError));
    }, AnimationItem.prototype.onSetupError = function() {
      this.trigger("data_failed");
    }, AnimationItem.prototype.setupAnimation = function(t2) {
      dataManager.completeAnimation(t2, this.configAnimation);
    }, AnimationItem.prototype.setData = function(t2, e2) {
      e2 && "object" !== _typeof$4(e2) && (e2 = JSON.parse(e2));
      var r = { wrapper: t2, animationData: e2 }, i2 = t2.attributes;
      r.path = i2.getNamedItem("data-animation-path") ? i2.getNamedItem("data-animation-path").value : i2.getNamedItem("data-bm-path") ? i2.getNamedItem("data-bm-path").value : i2.getNamedItem("bm-path") ? i2.getNamedItem("bm-path").value : "", r.animType = i2.getNamedItem("data-anim-type") ? i2.getNamedItem("data-anim-type").value : i2.getNamedItem("data-bm-type") ? i2.getNamedItem("data-bm-type").value : i2.getNamedItem("bm-type") ? i2.getNamedItem("bm-type").value : i2.getNamedItem("data-bm-renderer") ? i2.getNamedItem("data-bm-renderer").value : i2.getNamedItem("bm-renderer") ? i2.getNamedItem("bm-renderer").value : getRegisteredRenderer() || "canvas";
      var a2 = i2.getNamedItem("data-anim-loop") ? i2.getNamedItem("data-anim-loop").value : i2.getNamedItem("data-bm-loop") ? i2.getNamedItem("data-bm-loop").value : i2.getNamedItem("bm-loop") ? i2.getNamedItem("bm-loop").value : "";
      "false" === a2 ? r.loop = false : "true" === a2 ? r.loop = true : "" !== a2 && (r.loop = parseInt(a2, 10));
      var s2 = i2.getNamedItem("data-anim-autoplay") ? i2.getNamedItem("data-anim-autoplay").value : i2.getNamedItem("data-bm-autoplay") ? i2.getNamedItem("data-bm-autoplay").value : !i2.getNamedItem("bm-autoplay") || i2.getNamedItem("bm-autoplay").value;
      r.autoplay = "false" !== s2, r.name = i2.getNamedItem("data-name") ? i2.getNamedItem("data-name").value : i2.getNamedItem("data-bm-name") ? i2.getNamedItem("data-bm-name").value : i2.getNamedItem("bm-name") ? i2.getNamedItem("bm-name").value : "", "false" === (i2.getNamedItem("data-anim-prerender") ? i2.getNamedItem("data-anim-prerender").value : i2.getNamedItem("data-bm-prerender") ? i2.getNamedItem("data-bm-prerender").value : i2.getNamedItem("bm-prerender") ? i2.getNamedItem("bm-prerender").value : "") && (r.prerender = false), r.path ? this.setParams(r) : this.trigger("destroy");
    }, AnimationItem.prototype.includeLayers = function(t2) {
      t2.op > this.animationData.op && (this.animationData.op = t2.op, this.totalFrames = Math.floor(t2.op - this.animationData.ip));
      var e2, r, i2 = this.animationData.layers, a2 = i2.length, s2 = t2.layers, n2 = s2.length;
      for (r = 0; r < n2; r += 1) for (e2 = 0; e2 < a2; ) {
        if (i2[e2].id === s2[r].id) {
          i2[e2] = s2[r];
          break;
        }
        e2 += 1;
      }
      if ((t2.chars || t2.fonts) && (this.renderer.globalData.fontManager.addChars(t2.chars), this.renderer.globalData.fontManager.addFonts(t2.fonts, this.renderer.globalData.defs)), t2.assets) for (a2 = t2.assets.length, e2 = 0; e2 < a2; e2 += 1) this.animationData.assets.push(t2.assets[e2]);
      this.animationData.__complete = false, dataManager.completeAnimation(this.animationData, this.onSegmentComplete);
    }, AnimationItem.prototype.onSegmentComplete = function(t2) {
      this.animationData = t2;
      var e2 = getExpressionsPlugin();
      e2 && e2.initExpressions(this), this.loadNextSegment();
    }, AnimationItem.prototype.loadNextSegment = function() {
      var t2 = this.animationData.segments;
      if (!t2 || 0 === t2.length || !this.autoloadSegments) return this.trigger("data_ready"), void (this.timeCompleted = this.totalFrames);
      var e2 = t2.shift();
      this.timeCompleted = e2.time * this.frameRate;
      var r = this.path + this.fileName + "_" + this.segmentPos + ".json";
      this.segmentPos += 1, dataManager.loadData(r, this.includeLayers.bind(this), function() {
        this.trigger("data_failed");
      }.bind(this));
    }, AnimationItem.prototype.loadSegments = function() {
      this.animationData.segments || (this.timeCompleted = this.totalFrames), this.loadNextSegment();
    }, AnimationItem.prototype.imagesLoaded = function() {
      this.trigger("loaded_images"), this.checkLoaded();
    }, AnimationItem.prototype.preloadImages = function() {
      this.imagePreloader.setAssetsPath(this.assetsPath), this.imagePreloader.setPath(this.path), this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
    }, AnimationItem.prototype.configAnimation = function(t2) {
      if (this.renderer) try {
        this.animationData = t2, this.initialSegment ? (this.totalFrames = Math.floor(this.initialSegment[1] - this.initialSegment[0]), this.firstFrame = Math.round(this.initialSegment[0])) : (this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip), this.firstFrame = Math.round(this.animationData.ip)), this.renderer.configAnimation(t2), t2.assets || (t2.assets = []), this.assets = this.animationData.assets, this.frameRate = this.animationData.fr, this.frameMult = this.animationData.fr / 1e3, this.renderer.searchExtraCompositions(t2.assets), this.markers = markerParser(t2.markers || []), this.trigger("config_ready"), this.preloadImages(), this.loadSegments(), this.updaFrameModifier(), this.waitForFontsLoaded(), this.isPaused && this.audioController.pause();
      } catch (t3) {
        this.triggerConfigError(t3);
      }
    }, AnimationItem.prototype.waitForFontsLoaded = function() {
      this.renderer && (this.renderer.globalData.fontManager.isLoaded ? this.checkLoaded() : setTimeout(this.waitForFontsLoaded.bind(this), 20));
    }, AnimationItem.prototype.checkLoaded = function() {
      if (!this.isLoaded && this.renderer.globalData.fontManager.isLoaded && (this.imagePreloader.loadedImages() || "canvas" !== this.renderer.rendererType) && this.imagePreloader.loadedFootages()) {
        this.isLoaded = true;
        var t2 = getExpressionsPlugin();
        t2 && t2.initExpressions(this), this.renderer.initItems(), setTimeout(function() {
          this.trigger("DOMLoaded");
        }.bind(this), 0), this.gotoFrame(), this.autoplay && this.play();
      }
    }, AnimationItem.prototype.resize = function(t2, e2) {
      var r = "number" == typeof t2 ? t2 : void 0, i2 = "number" == typeof e2 ? e2 : void 0;
      this.renderer.updateContainerSize(r, i2);
    }, AnimationItem.prototype.setSubframe = function(t2) {
      this.isSubframeEnabled = !!t2;
    }, AnimationItem.prototype.gotoFrame = function() {
      this.currentFrame = this.isSubframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame, this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted && (this.currentFrame = this.timeCompleted), this.trigger("enterFrame"), this.renderFrame(), this.trigger("drawnFrame");
    }, AnimationItem.prototype.renderFrame = function() {
      if (false !== this.isLoaded && this.renderer) try {
        this.expressionsPlugin && this.expressionsPlugin.resetFrame(), this.renderer.renderFrame(this.currentFrame + this.firstFrame);
      } catch (t2) {
        this.triggerRenderFrameError(t2);
      }
    }, AnimationItem.prototype.play = function(t2) {
      t2 && this.name !== t2 || true === this.isPaused && (this.isPaused = false, this.trigger("_play"), this.audioController.resume(), this._idle && (this._idle = false, this.trigger("_active")));
    }, AnimationItem.prototype.pause = function(t2) {
      t2 && this.name !== t2 || false === this.isPaused && (this.isPaused = true, this.trigger("_pause"), this._idle = true, this.trigger("_idle"), this.audioController.pause());
    }, AnimationItem.prototype.togglePause = function(t2) {
      t2 && this.name !== t2 || (true === this.isPaused ? this.play() : this.pause());
    }, AnimationItem.prototype.stop = function(t2) {
      t2 && this.name !== t2 || (this.pause(), this.playCount = 0, this._completedLoop = false, this.setCurrentRawFrameValue(0));
    }, AnimationItem.prototype.getMarkerData = function(t2) {
      for (var e2, r = 0; r < this.markers.length; r += 1) if ((e2 = this.markers[r]).payload && e2.payload.name === t2) return e2;
      return null;
    }, AnimationItem.prototype.goToAndStop = function(t2, e2, r) {
      if (!r || this.name === r) {
        var i2 = Number(t2);
        if (isNaN(i2)) {
          var a2 = this.getMarkerData(t2);
          a2 && this.goToAndStop(a2.time, true);
        } else e2 ? this.setCurrentRawFrameValue(t2) : this.setCurrentRawFrameValue(t2 * this.frameModifier);
        this.pause();
      }
    }, AnimationItem.prototype.goToAndPlay = function(t2, e2, r) {
      if (!r || this.name === r) {
        var i2 = Number(t2);
        if (isNaN(i2)) {
          var a2 = this.getMarkerData(t2);
          a2 && (a2.duration ? this.playSegments([a2.time, a2.time + a2.duration], true) : this.goToAndStop(a2.time, true));
        } else this.goToAndStop(i2, e2, r);
        this.play();
      }
    }, AnimationItem.prototype.advanceTime = function(t2) {
      if (true !== this.isPaused && false !== this.isLoaded) {
        var e2 = this.currentRawFrame + t2 * this.frameModifier, r = false;
        e2 >= this.totalFrames - 1 && this.frameModifier > 0 ? this.loop && this.playCount !== this.loop ? e2 >= this.totalFrames ? (this.playCount += 1, this.checkSegments(e2 % this.totalFrames) || (this.setCurrentRawFrameValue(e2 % this.totalFrames), this._completedLoop = true, this.trigger("loopComplete"))) : this.setCurrentRawFrameValue(e2) : this.checkSegments(e2 > this.totalFrames ? e2 % this.totalFrames : 0) || (r = true, e2 = this.totalFrames - 1) : e2 < 0 ? this.checkSegments(e2 % this.totalFrames) || (!this.loop || this.playCount-- <= 0 && true !== this.loop ? (r = true, e2 = 0) : (this.setCurrentRawFrameValue(this.totalFrames + e2 % this.totalFrames), this._completedLoop ? this.trigger("loopComplete") : this._completedLoop = true)) : this.setCurrentRawFrameValue(e2), r && (this.setCurrentRawFrameValue(e2), this.pause(), this.trigger("complete"));
      }
    }, AnimationItem.prototype.adjustSegment = function(t2, e2) {
      this.playCount = 0, t2[1] < t2[0] ? (this.frameModifier > 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(-1)), this.totalFrames = t2[0] - t2[1], this.timeCompleted = this.totalFrames, this.firstFrame = t2[1], this.setCurrentRawFrameValue(this.totalFrames - 1e-3 - e2)) : t2[1] > t2[0] && (this.frameModifier < 0 && (this.playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(1)), this.totalFrames = t2[1] - t2[0], this.timeCompleted = this.totalFrames, this.firstFrame = t2[0], this.setCurrentRawFrameValue(1e-3 + e2)), this.trigger("segmentStart");
    }, AnimationItem.prototype.setSegment = function(t2, e2) {
      var r = -1;
      this.isPaused && (this.currentRawFrame + this.firstFrame < t2 ? r = t2 : this.currentRawFrame + this.firstFrame > e2 && (r = e2 - t2)), this.firstFrame = t2, this.totalFrames = e2 - t2, this.timeCompleted = this.totalFrames, -1 !== r && this.goToAndStop(r, true);
    }, AnimationItem.prototype.playSegments = function(t2, e2) {
      if (e2 && (this.segments.length = 0), "object" === _typeof$4(t2[0])) {
        var r, i2 = t2.length;
        for (r = 0; r < i2; r += 1) this.segments.push(t2[r]);
      } else this.segments.push(t2);
      this.segments.length && e2 && this.adjustSegment(this.segments.shift(), 0), this.isPaused && this.play();
    }, AnimationItem.prototype.resetSegments = function(t2) {
      this.segments.length = 0, this.segments.push([this.animationData.ip, this.animationData.op]), t2 && this.checkSegments(0);
    }, AnimationItem.prototype.checkSegments = function(t2) {
      return !!this.segments.length && (this.adjustSegment(this.segments.shift(), t2), true);
    }, AnimationItem.prototype.destroy = function(t2) {
      t2 && this.name !== t2 || !this.renderer || (this.renderer.destroy(), this.imagePreloader.destroy(), this.trigger("destroy"), this._cbs = null, this.onEnterFrame = null, this.onLoopComplete = null, this.onComplete = null, this.onSegmentStart = null, this.onDestroy = null, this.renderer = null, this.expressionsPlugin = null, this.imagePreloader = null, this.projectInterface = null);
    }, AnimationItem.prototype.setCurrentRawFrameValue = function(t2) {
      this.currentRawFrame = t2, this.gotoFrame();
    }, AnimationItem.prototype.setSpeed = function(t2) {
      this.playSpeed = t2, this.updaFrameModifier();
    }, AnimationItem.prototype.setDirection = function(t2) {
      this.playDirection = t2 < 0 ? -1 : 1, this.updaFrameModifier();
    }, AnimationItem.prototype.setLoop = function(t2) {
      this.loop = t2;
    }, AnimationItem.prototype.setVolume = function(t2, e2) {
      e2 && this.name !== e2 || this.audioController.setVolume(t2);
    }, AnimationItem.prototype.getVolume = function() {
      return this.audioController.getVolume();
    }, AnimationItem.prototype.mute = function(t2) {
      t2 && this.name !== t2 || this.audioController.mute();
    }, AnimationItem.prototype.unmute = function(t2) {
      t2 && this.name !== t2 || this.audioController.unmute();
    }, AnimationItem.prototype.updaFrameModifier = function() {
      this.frameModifier = this.frameMult * this.playSpeed * this.playDirection, this.audioController.setRate(this.playSpeed * this.playDirection);
    }, AnimationItem.prototype.getPath = function() {
      return this.path;
    }, AnimationItem.prototype.getAssetsPath = function(t2) {
      var e2 = "";
      if (t2.e) e2 = t2.p;
      else if (this.assetsPath) {
        var r = t2.p;
        -1 !== r.indexOf("images/") && (r = r.split("/")[1]), e2 = this.assetsPath + r;
      } else e2 = this.path, e2 += t2.u ? t2.u : "", e2 += t2.p;
      return e2;
    }, AnimationItem.prototype.getAssetData = function(t2) {
      for (var e2 = 0, r = this.assets.length; e2 < r; ) {
        if (t2 === this.assets[e2].id) return this.assets[e2];
        e2 += 1;
      }
      return null;
    }, AnimationItem.prototype.hide = function() {
      this.renderer.hide();
    }, AnimationItem.prototype.show = function() {
      this.renderer.show();
    }, AnimationItem.prototype.getDuration = function(t2) {
      return t2 ? this.totalFrames : this.totalFrames / this.frameRate;
    }, AnimationItem.prototype.updateDocumentData = function(t2, e2, r) {
      try {
        this.renderer.getElementByPath(t2).updateDocumentData(e2, r);
      } catch (t3) {
      }
    }, AnimationItem.prototype.trigger = function(t2) {
      if (this._cbs && this._cbs[t2]) switch (t2) {
        case "enterFrame":
          this.triggerEvent(t2, new BMEnterFrameEvent(t2, this.currentFrame, this.totalFrames, this.frameModifier));
          break;
        case "drawnFrame":
          this.drawnFrameEvent.currentTime = this.currentFrame, this.drawnFrameEvent.totalTime = this.totalFrames, this.drawnFrameEvent.direction = this.frameModifier, this.triggerEvent(t2, this.drawnFrameEvent);
          break;
        case "loopComplete":
          this.triggerEvent(t2, new BMCompleteLoopEvent(t2, this.loop, this.playCount, this.frameMult));
          break;
        case "complete":
          this.triggerEvent(t2, new BMCompleteEvent(t2, this.frameMult));
          break;
        case "segmentStart":
          this.triggerEvent(t2, new BMSegmentStartEvent(t2, this.firstFrame, this.totalFrames));
          break;
        case "destroy":
          this.triggerEvent(t2, new BMDestroyEvent(t2, this));
          break;
        default:
          this.triggerEvent(t2);
      }
      "enterFrame" === t2 && this.onEnterFrame && this.onEnterFrame.call(this, new BMEnterFrameEvent(t2, this.currentFrame, this.totalFrames, this.frameMult)), "loopComplete" === t2 && this.onLoopComplete && this.onLoopComplete.call(this, new BMCompleteLoopEvent(t2, this.loop, this.playCount, this.frameMult)), "complete" === t2 && this.onComplete && this.onComplete.call(this, new BMCompleteEvent(t2, this.frameMult)), "segmentStart" === t2 && this.onSegmentStart && this.onSegmentStart.call(this, new BMSegmentStartEvent(t2, this.firstFrame, this.totalFrames)), "destroy" === t2 && this.onDestroy && this.onDestroy.call(this, new BMDestroyEvent(t2, this));
    }, AnimationItem.prototype.triggerRenderFrameError = function(t2) {
      var e2 = new BMRenderFrameErrorEvent(t2, this.currentFrame);
      this.triggerEvent("error", e2), this.onError && this.onError.call(this, e2);
    }, AnimationItem.prototype.triggerConfigError = function(t2) {
      var e2 = new BMConfigErrorEvent(t2, this.currentFrame);
      this.triggerEvent("error", e2), this.onError && this.onError.call(this, e2);
    };
    var animationManager = (function() {
      var t2 = {}, e2 = [], r = 0, i2 = 0, a2 = 0, s2 = true, n2 = false;
      function o2(t3) {
        for (var r2 = 0, a3 = t3.target; r2 < i2; ) e2[r2].animation === a3 && (e2.splice(r2, 1), r2 -= 1, i2 -= 1, a3.isPaused || p2()), r2 += 1;
      }
      function h2(t3, r2) {
        if (!t3) return null;
        for (var a3 = 0; a3 < i2; ) {
          if (e2[a3].elem === t3 && null !== e2[a3].elem) return e2[a3].animation;
          a3 += 1;
        }
        var s3 = new AnimationItem();
        return f2(s3, t3), s3.setData(t3, r2), s3;
      }
      function l2() {
        a2 += 1, d2();
      }
      function p2() {
        a2 -= 1;
      }
      function f2(t3, r2) {
        t3.addEventListener("destroy", o2), t3.addEventListener("_active", l2), t3.addEventListener("_idle", p2), e2.push({ elem: r2, animation: t3 }), i2 += 1;
      }
      function c2(t3) {
        var o3, h3 = t3 - r;
        for (o3 = 0; o3 < i2; o3 += 1) e2[o3].animation.advanceTime(h3);
        r = t3, a2 && !n2 ? window.requestAnimationFrame(c2) : s2 = true;
      }
      function m2(t3) {
        r = t3, window.requestAnimationFrame(c2);
      }
      function d2() {
        !n2 && a2 && s2 && (window.requestAnimationFrame(m2), s2 = false);
      }
      return t2.registerAnimation = h2, t2.loadAnimation = function(t3) {
        var e3 = new AnimationItem();
        return f2(e3, null), e3.setParams(t3), e3;
      }, t2.setSpeed = function(t3, r2) {
        var a3;
        for (a3 = 0; a3 < i2; a3 += 1) e2[a3].animation.setSpeed(t3, r2);
      }, t2.setDirection = function(t3, r2) {
        var a3;
        for (a3 = 0; a3 < i2; a3 += 1) e2[a3].animation.setDirection(t3, r2);
      }, t2.play = function(t3) {
        var r2;
        for (r2 = 0; r2 < i2; r2 += 1) e2[r2].animation.play(t3);
      }, t2.pause = function(t3) {
        var r2;
        for (r2 = 0; r2 < i2; r2 += 1) e2[r2].animation.pause(t3);
      }, t2.stop = function(t3) {
        var r2;
        for (r2 = 0; r2 < i2; r2 += 1) e2[r2].animation.stop(t3);
      }, t2.togglePause = function(t3) {
        var r2;
        for (r2 = 0; r2 < i2; r2 += 1) e2[r2].animation.togglePause(t3);
      }, t2.searchAnimations = function(t3, e3, r2) {
        var i3, a3 = [].concat([].slice.call(document.getElementsByClassName("lottie")), [].slice.call(document.getElementsByClassName("bodymovin"))), s3 = a3.length;
        for (i3 = 0; i3 < s3; i3 += 1) r2 && a3[i3].setAttribute("data-bm-type", r2), h2(a3[i3], t3);
        if (e3 && 0 === s3) {
          r2 || (r2 = "svg");
          var n3 = document.getElementsByTagName("body")[0];
          n3.innerText = "";
          var o3 = createTag("div");
          o3.style.width = "100%", o3.style.height = "100%", o3.setAttribute("data-bm-type", r2), n3.appendChild(o3), h2(o3, t3);
        }
      }, t2.resize = function() {
        var t3;
        for (t3 = 0; t3 < i2; t3 += 1) e2[t3].animation.resize();
      }, t2.goToAndStop = function(t3, r2, a3) {
        var s3;
        for (s3 = 0; s3 < i2; s3 += 1) e2[s3].animation.goToAndStop(t3, r2, a3);
      }, t2.destroy = function(t3) {
        var r2;
        for (r2 = i2 - 1; r2 >= 0; r2 -= 1) e2[r2].animation.destroy(t3);
      }, t2.freeze = function() {
        n2 = true;
      }, t2.unfreeze = function() {
        n2 = false, d2();
      }, t2.setVolume = function(t3, r2) {
        var a3;
        for (a3 = 0; a3 < i2; a3 += 1) e2[a3].animation.setVolume(t3, r2);
      }, t2.mute = function(t3) {
        var r2;
        for (r2 = 0; r2 < i2; r2 += 1) e2[r2].animation.mute(t3);
      }, t2.unmute = function(t3) {
        var r2;
        for (r2 = 0; r2 < i2; r2 += 1) e2[r2].animation.unmute(t3);
      }, t2.getRegisteredAnimations = function() {
        var t3, r2 = e2.length, i3 = [];
        for (t3 = 0; t3 < r2; t3 += 1) i3.push(e2[t3].animation);
        return i3;
      }, t2;
    })(), BezierFactory = (function() {
      var t2 = { getBezierEasing: function(t3, r2, i3, a3, s3) {
        var n3 = s3 || ("bez_" + t3 + "_" + r2 + "_" + i3 + "_" + a3).replace(/\./g, "p");
        if (e2[n3]) return e2[n3];
        var o3 = new h2([t3, r2, i3, a3]);
        return e2[n3] = o3, o3;
      } }, e2 = {};
      var r = "function" == typeof Float32Array;
      function i2(t3, e3) {
        return 1 - 3 * e3 + 3 * t3;
      }
      function a2(t3, e3) {
        return 3 * e3 - 6 * t3;
      }
      function s2(t3) {
        return 3 * t3;
      }
      function n2(t3, e3, r2) {
        return ((i2(e3, r2) * t3 + a2(e3, r2)) * t3 + s2(e3)) * t3;
      }
      function o2(t3, e3, r2) {
        return 3 * i2(e3, r2) * t3 * t3 + 2 * a2(e3, r2) * t3 + s2(e3);
      }
      function h2(t3) {
        this._p = t3, this._mSampleValues = r ? new Float32Array(11) : new Array(11), this._precomputed = false, this.get = this.get.bind(this);
      }
      return h2.prototype = { get: function(t3) {
        var e3 = this._p[0], r2 = this._p[1], i3 = this._p[2], a3 = this._p[3];
        return this._precomputed || this._precompute(), e3 === r2 && i3 === a3 ? t3 : 0 === t3 ? 0 : 1 === t3 ? 1 : n2(this._getTForX(t3), r2, a3);
      }, _precompute: function() {
        var t3 = this._p[0], e3 = this._p[1], r2 = this._p[2], i3 = this._p[3];
        this._precomputed = true, t3 === e3 && r2 === i3 || this._calcSampleValues();
      }, _calcSampleValues: function() {
        for (var t3 = this._p[0], e3 = this._p[2], r2 = 0; r2 < 11; ++r2) this._mSampleValues[r2] = n2(0.1 * r2, t3, e3);
      }, _getTForX: function(t3) {
        for (var e3 = this._p[0], r2 = this._p[2], i3 = this._mSampleValues, a3 = 0, s3 = 1; 10 !== s3 && i3[s3] <= t3; ++s3) a3 += 0.1;
        var h3 = a3 + 0.1 * ((t3 - i3[--s3]) / (i3[s3 + 1] - i3[s3])), l2 = o2(h3, e3, r2);
        return l2 >= 1e-3 ? (function(t4, e4, r3, i4) {
          for (var a4 = 0; a4 < 4; ++a4) {
            var s4 = o2(e4, r3, i4);
            if (0 === s4) return e4;
            e4 -= (n2(e4, r3, i4) - t4) / s4;
          }
          return e4;
        })(t3, h3, e3, r2) : 0 === l2 ? h3 : (function(t4, e4, r3, i4, a4) {
          var s4, o3, h4 = 0;
          do {
            (s4 = n2(o3 = e4 + (r3 - e4) / 2, i4, a4) - t4) > 0 ? r3 = o3 : e4 = o3;
          } while (Math.abs(s4) > 1e-7 && ++h4 < 10);
          return o3;
        })(t3, a3, a3 + 0.1, e3, r2);
      } }, t2;
    })(), pooling = { double: function(t2) {
      return t2.concat(createSizedArray(t2.length));
    } }, poolFactory = function(t2, e2, r) {
      var i2 = 0, a2 = t2, s2 = createSizedArray(a2);
      return { newElement: function() {
        return i2 ? s2[i2 -= 1] : e2();
      }, release: function(t3) {
        i2 === a2 && (s2 = pooling.double(s2), a2 *= 2), r && r(t3), s2[i2] = t3, i2 += 1;
      } };
    }, bezierLengthPool = poolFactory(8, (function() {
      return { addedLength: 0, percents: createTypedArray("float32", getDefaultCurveSegments()), lengths: createTypedArray("float32", getDefaultCurveSegments()) };
    })), segmentsLengthPool = poolFactory(8, (function() {
      return { lengths: [], totalLength: 0 };
    }), (function(t2) {
      var e2, r = t2.lengths.length;
      for (e2 = 0; e2 < r; e2 += 1) bezierLengthPool.release(t2.lengths[e2]);
      t2.lengths.length = 0;
    }));
    function bezFunction() {
      var t2 = Math;
      function e2(t3, e3, r2, i3, a3, s3) {
        var n3 = t3 * i3 + e3 * a3 + r2 * s3 - a3 * i3 - s3 * t3 - r2 * e3;
        return n3 > -1e-3 && n3 < 1e-3;
      }
      var r = function(t3, e3, r2, i3) {
        var a3, s3, n3, o3, h3, l2, p2 = getDefaultCurveSegments(), f2 = 0, c2 = [], m2 = [], d2 = bezierLengthPool.newElement();
        for (n3 = r2.length, a3 = 0; a3 < p2; a3 += 1) {
          for (h3 = a3 / (p2 - 1), l2 = 0, s3 = 0; s3 < n3; s3 += 1) o3 = bmPow(1 - h3, 3) * t3[s3] + 3 * bmPow(1 - h3, 2) * h3 * r2[s3] + 3 * (1 - h3) * bmPow(h3, 2) * i3[s3] + bmPow(h3, 3) * e3[s3], c2[s3] = o3, null !== m2[s3] && (l2 += bmPow(c2[s3] - m2[s3], 2)), m2[s3] = c2[s3];
          l2 && (f2 += l2 = bmSqrt(l2)), d2.percents[a3] = h3, d2.lengths[a3] = f2;
        }
        return d2.addedLength = f2, d2;
      };
      function i2(t3) {
        this.segmentLength = 0, this.points = new Array(t3);
      }
      function a2(t3, e3) {
        this.partialLength = t3, this.point = e3;
      }
      var s2, n2 = (s2 = {}, function(t3, r2, n3, o3) {
        var h3 = (t3[0] + "_" + t3[1] + "_" + r2[0] + "_" + r2[1] + "_" + n3[0] + "_" + n3[1] + "_" + o3[0] + "_" + o3[1]).replace(/\./g, "p");
        if (!s2[h3]) {
          var l2, p2, f2, c2, m2, d2, u2, y = getDefaultCurveSegments(), g2 = 0, v2 = null;
          2 === t3.length && (t3[0] !== r2[0] || t3[1] !== r2[1]) && e2(t3[0], t3[1], r2[0], r2[1], t3[0] + n3[0], t3[1] + n3[1]) && e2(t3[0], t3[1], r2[0], r2[1], r2[0] + o3[0], r2[1] + o3[1]) && (y = 2);
          var b = new i2(y);
          for (f2 = n3.length, l2 = 0; l2 < y; l2 += 1) {
            for (u2 = createSizedArray(f2), m2 = l2 / (y - 1), d2 = 0, p2 = 0; p2 < f2; p2 += 1) c2 = bmPow(1 - m2, 3) * t3[p2] + 3 * bmPow(1 - m2, 2) * m2 * (t3[p2] + n3[p2]) + 3 * (1 - m2) * bmPow(m2, 2) * (r2[p2] + o3[p2]) + bmPow(m2, 3) * r2[p2], u2[p2] = c2, null !== v2 && (d2 += bmPow(u2[p2] - v2[p2], 2));
            g2 += d2 = bmSqrt(d2), b.points[l2] = new a2(d2, u2), v2 = u2;
          }
          b.segmentLength = g2, s2[h3] = b;
        }
        return s2[h3];
      });
      function o2(t3, e3) {
        var r2 = e3.percents, i3 = e3.lengths, a3 = r2.length, s3 = bmFloor((a3 - 1) * t3), n3 = t3 * e3.addedLength, o3 = 0;
        if (s3 === a3 - 1 || 0 === s3 || n3 === i3[s3]) return r2[s3];
        for (var h3 = i3[s3] > n3 ? -1 : 1, l2 = true; l2; ) if (i3[s3] <= n3 && i3[s3 + 1] > n3 ? (o3 = (n3 - i3[s3]) / (i3[s3 + 1] - i3[s3]), l2 = false) : s3 += h3, s3 < 0 || s3 >= a3 - 1) {
          if (s3 === a3 - 1) return r2[s3];
          l2 = false;
        }
        return r2[s3] + (r2[s3 + 1] - r2[s3]) * o3;
      }
      var h2 = createTypedArray("float32", 8);
      return { getSegmentsLength: function(t3) {
        var e3, i3 = segmentsLengthPool.newElement(), a3 = t3.c, s3 = t3.v, n3 = t3.o, o3 = t3.i, h3 = t3._length, l2 = i3.lengths, p2 = 0;
        for (e3 = 0; e3 < h3 - 1; e3 += 1) l2[e3] = r(s3[e3], s3[e3 + 1], n3[e3], o3[e3 + 1]), p2 += l2[e3].addedLength;
        return a3 && h3 && (l2[e3] = r(s3[e3], s3[0], n3[e3], o3[0]), p2 += l2[e3].addedLength), i3.totalLength = p2, i3;
      }, getNewSegment: function(e3, r2, i3, a3, s3, n3, l2) {
        s3 < 0 ? s3 = 0 : s3 > 1 && (s3 = 1);
        var p2, f2 = o2(s3, l2), c2 = o2(n3 = n3 > 1 ? 1 : n3, l2), m2 = e3.length, d2 = 1 - f2, u2 = 1 - c2, y = d2 * d2 * d2, g2 = f2 * d2 * d2 * 3, v2 = f2 * f2 * d2 * 3, b = f2 * f2 * f2, x = d2 * d2 * u2, E2 = f2 * d2 * u2 + d2 * f2 * u2 + d2 * d2 * c2, S2 = f2 * f2 * u2 + d2 * f2 * c2 + f2 * d2 * c2, P2 = f2 * f2 * c2, C2 = d2 * u2 * u2, _2 = f2 * u2 * u2 + d2 * c2 * u2 + d2 * u2 * c2, k2 = f2 * c2 * u2 + d2 * c2 * c2 + f2 * u2 * c2, A = f2 * c2 * c2, T = u2 * u2 * u2, M = c2 * u2 * u2 + u2 * c2 * u2 + u2 * u2 * c2, w2 = c2 * c2 * u2 + u2 * c2 * c2 + c2 * u2 * c2, D2 = c2 * c2 * c2;
        for (p2 = 0; p2 < m2; p2 += 1) h2[4 * p2] = t2.round(1e3 * (y * e3[p2] + g2 * i3[p2] + v2 * a3[p2] + b * r2[p2])) / 1e3, h2[4 * p2 + 1] = t2.round(1e3 * (x * e3[p2] + E2 * i3[p2] + S2 * a3[p2] + P2 * r2[p2])) / 1e3, h2[4 * p2 + 2] = t2.round(1e3 * (C2 * e3[p2] + _2 * i3[p2] + k2 * a3[p2] + A * r2[p2])) / 1e3, h2[4 * p2 + 3] = t2.round(1e3 * (T * e3[p2] + M * i3[p2] + w2 * a3[p2] + D2 * r2[p2])) / 1e3;
        return h2;
      }, getPointInSegment: function(e3, r2, i3, a3, s3, n3) {
        var h3 = o2(s3, n3), l2 = 1 - h3;
        return [t2.round(1e3 * (l2 * l2 * l2 * e3[0] + (h3 * l2 * l2 + l2 * h3 * l2 + l2 * l2 * h3) * i3[0] + (h3 * h3 * l2 + l2 * h3 * h3 + h3 * l2 * h3) * a3[0] + h3 * h3 * h3 * r2[0])) / 1e3, t2.round(1e3 * (l2 * l2 * l2 * e3[1] + (h3 * l2 * l2 + l2 * h3 * l2 + l2 * l2 * h3) * i3[1] + (h3 * h3 * l2 + l2 * h3 * h3 + h3 * l2 * h3) * a3[1] + h3 * h3 * h3 * r2[1])) / 1e3];
      }, buildBezierData: n2, pointOnLine2D: e2, pointOnLine3D: function(r2, i3, a3, s3, n3, o3, h3, l2, p2) {
        if (0 === a3 && 0 === o3 && 0 === p2) return e2(r2, i3, s3, n3, h3, l2);
        var f2, c2 = t2.sqrt(t2.pow(s3 - r2, 2) + t2.pow(n3 - i3, 2) + t2.pow(o3 - a3, 2)), m2 = t2.sqrt(t2.pow(h3 - r2, 2) + t2.pow(l2 - i3, 2) + t2.pow(p2 - a3, 2)), d2 = t2.sqrt(t2.pow(h3 - s3, 2) + t2.pow(l2 - n3, 2) + t2.pow(p2 - o3, 2));
        return (f2 = c2 > m2 ? c2 > d2 ? c2 - m2 - d2 : d2 - m2 - c2 : d2 > m2 ? d2 - m2 - c2 : m2 - c2 - d2) > -1e-4 && f2 < 1e-4;
      } };
    }
    var bez = bezFunction(), initFrame = initialDefaultFrame, mathAbs = Math.abs;
    function interpolateValue(t2, e2) {
      var r, i2 = this.offsetTime;
      "multidimensional" === this.propType && (r = createTypedArray("float32", this.pv.length));
      for (var a2, s2, n2, o2, h2, l2, p2, f2, c2, m2 = e2.lastIndex, d2 = m2, u2 = this.keyframes.length - 1, y = true; y; ) {
        if (a2 = this.keyframes[d2], s2 = this.keyframes[d2 + 1], d2 === u2 - 1 && t2 >= s2.t - i2) {
          a2.h && (a2 = s2), m2 = 0;
          break;
        }
        if (s2.t - i2 > t2) {
          m2 = d2;
          break;
        }
        d2 < u2 - 1 ? d2 += 1 : (m2 = 0, y = false);
      }
      n2 = this.keyframesMetadata[d2] || {};
      var g2, v2 = s2.t - i2, b = a2.t - i2;
      if (a2.to) {
        n2.bezierData || (n2.bezierData = bez.buildBezierData(a2.s, s2.s || a2.e, a2.to, a2.ti));
        var x = n2.bezierData;
        if (t2 >= v2 || t2 < b) {
          var E2 = t2 >= v2 ? x.points.length - 1 : 0;
          for (h2 = x.points[E2].point.length, o2 = 0; o2 < h2; o2 += 1) r[o2] = x.points[E2].point[o2];
        } else {
          n2.__fnct ? c2 = n2.__fnct : (c2 = BezierFactory.getBezierEasing(a2.o.x, a2.o.y, a2.i.x, a2.i.y, a2.n).get, n2.__fnct = c2), l2 = c2((t2 - b) / (v2 - b));
          var S2, P2 = x.segmentLength * l2, C2 = e2.lastFrame < t2 && e2._lastKeyframeIndex === d2 ? e2._lastAddedLength : 0;
          for (f2 = e2.lastFrame < t2 && e2._lastKeyframeIndex === d2 ? e2._lastPoint : 0, y = true, p2 = x.points.length; y; ) {
            if (C2 += x.points[f2].partialLength, 0 === P2 || 0 === l2 || f2 === x.points.length - 1) {
              for (h2 = x.points[f2].point.length, o2 = 0; o2 < h2; o2 += 1) r[o2] = x.points[f2].point[o2];
              break;
            }
            if (P2 >= C2 && P2 < C2 + x.points[f2 + 1].partialLength) {
              for (S2 = (P2 - C2) / x.points[f2 + 1].partialLength, h2 = x.points[f2].point.length, o2 = 0; o2 < h2; o2 += 1) r[o2] = x.points[f2].point[o2] + (x.points[f2 + 1].point[o2] - x.points[f2].point[o2]) * S2;
              break;
            }
            f2 < p2 - 1 ? f2 += 1 : y = false;
          }
          e2._lastPoint = f2, e2._lastAddedLength = C2 - x.points[f2].partialLength, e2._lastKeyframeIndex = d2;
        }
      } else {
        var _2, k2, A, T, M;
        if (u2 = a2.s.length, g2 = s2.s || a2.e, this.sh && 1 !== a2.h) if (t2 >= v2) r[0] = g2[0], r[1] = g2[1], r[2] = g2[2];
        else if (t2 <= b) r[0] = a2.s[0], r[1] = a2.s[1], r[2] = a2.s[2];
        else {
          quaternionToEuler(r, slerp(createQuaternion(a2.s), createQuaternion(g2), (t2 - b) / (v2 - b)));
        }
        else for (d2 = 0; d2 < u2; d2 += 1) 1 !== a2.h && (t2 >= v2 ? l2 = 1 : t2 < b ? l2 = 0 : (a2.o.x.constructor === Array ? (n2.__fnct || (n2.__fnct = []), n2.__fnct[d2] ? c2 = n2.__fnct[d2] : (_2 = void 0 === a2.o.x[d2] ? a2.o.x[0] : a2.o.x[d2], k2 = void 0 === a2.o.y[d2] ? a2.o.y[0] : a2.o.y[d2], A = void 0 === a2.i.x[d2] ? a2.i.x[0] : a2.i.x[d2], T = void 0 === a2.i.y[d2] ? a2.i.y[0] : a2.i.y[d2], c2 = BezierFactory.getBezierEasing(_2, k2, A, T).get, n2.__fnct[d2] = c2)) : n2.__fnct ? c2 = n2.__fnct : (_2 = a2.o.x, k2 = a2.o.y, A = a2.i.x, T = a2.i.y, c2 = BezierFactory.getBezierEasing(_2, k2, A, T).get, a2.keyframeMetadata = c2), l2 = c2((t2 - b) / (v2 - b)))), g2 = s2.s || a2.e, M = 1 === a2.h ? a2.s[d2] : a2.s[d2] + (g2[d2] - a2.s[d2]) * l2, "multidimensional" === this.propType ? r[d2] = M : r = M;
      }
      return e2.lastIndex = m2, r;
    }
    function slerp(t2, e2, r) {
      var i2, a2, s2, n2, o2, h2 = [], l2 = t2[0], p2 = t2[1], f2 = t2[2], c2 = t2[3], m2 = e2[0], d2 = e2[1], u2 = e2[2], y = e2[3];
      return (a2 = l2 * m2 + p2 * d2 + f2 * u2 + c2 * y) < 0 && (a2 = -a2, m2 = -m2, d2 = -d2, u2 = -u2, y = -y), 1 - a2 > 1e-6 ? (i2 = Math.acos(a2), s2 = Math.sin(i2), n2 = Math.sin((1 - r) * i2) / s2, o2 = Math.sin(r * i2) / s2) : (n2 = 1 - r, o2 = r), h2[0] = n2 * l2 + o2 * m2, h2[1] = n2 * p2 + o2 * d2, h2[2] = n2 * f2 + o2 * u2, h2[3] = n2 * c2 + o2 * y, h2;
    }
    function quaternionToEuler(t2, e2) {
      var r = e2[0], i2 = e2[1], a2 = e2[2], s2 = e2[3], n2 = Math.atan2(2 * i2 * s2 - 2 * r * a2, 1 - 2 * i2 * i2 - 2 * a2 * a2), o2 = Math.asin(2 * r * i2 + 2 * a2 * s2), h2 = Math.atan2(2 * r * s2 - 2 * i2 * a2, 1 - 2 * r * r - 2 * a2 * a2);
      t2[0] = n2 / degToRads, t2[1] = o2 / degToRads, t2[2] = h2 / degToRads;
    }
    function createQuaternion(t2) {
      var e2 = t2[0] * degToRads, r = t2[1] * degToRads, i2 = t2[2] * degToRads, a2 = Math.cos(e2 / 2), s2 = Math.cos(r / 2), n2 = Math.cos(i2 / 2), o2 = Math.sin(e2 / 2), h2 = Math.sin(r / 2), l2 = Math.sin(i2 / 2);
      return [o2 * h2 * n2 + a2 * s2 * l2, o2 * s2 * n2 + a2 * h2 * l2, a2 * h2 * n2 - o2 * s2 * l2, a2 * s2 * n2 - o2 * h2 * l2];
    }
    function getValueAtCurrentTime() {
      var t2 = this.comp.renderedFrame - this.offsetTime, e2 = this.keyframes[0].t - this.offsetTime, r = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
      if (!(t2 === this._caching.lastFrame || this._caching.lastFrame !== initFrame && (this._caching.lastFrame >= r && t2 >= r || this._caching.lastFrame < e2 && t2 < e2))) {
        this._caching.lastFrame >= t2 && (this._caching._lastKeyframeIndex = -1, this._caching.lastIndex = 0);
        var i2 = this.interpolateValue(t2, this._caching);
        this.pv = i2;
      }
      return this._caching.lastFrame = t2, this.pv;
    }
    function setVValue(t2) {
      var e2;
      if ("unidimensional" === this.propType) e2 = t2 * this.mult, mathAbs(this.v - e2) > 1e-5 && (this.v = e2, this._mdf = true);
      else for (var r = 0, i2 = this.v.length; r < i2; ) e2 = t2[r] * this.mult, mathAbs(this.v[r] - e2) > 1e-5 && (this.v[r] = e2, this._mdf = true), r += 1;
    }
    function processEffectsSequence() {
      if (this.elem.globalData.frameId !== this.frameId && this.effectsSequence.length) if (this.lock) this.setVValue(this.pv);
      else {
        var t2;
        this.lock = true, this._mdf = this._isFirstFrame;
        var e2 = this.effectsSequence.length, r = this.kf ? this.pv : this.data.k;
        for (t2 = 0; t2 < e2; t2 += 1) r = this.effectsSequence[t2](r);
        this.setVValue(r), this._isFirstFrame = false, this.lock = false, this.frameId = this.elem.globalData.frameId;
      }
    }
    function addEffect(t2) {
      this.effectsSequence.push(t2), this.container.addDynamicProperty(this);
    }
    function ValueProperty(t2, e2, r, i2) {
      this.propType = "unidimensional", this.mult = r || 1, this.data = e2, this.v = r ? e2.k * r : e2.k, this.pv = e2.k, this._mdf = false, this.elem = t2, this.container = i2, this.comp = t2.comp, this.k = false, this.kf = false, this.vel = 0, this.effectsSequence = [], this._isFirstFrame = true, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
    }
    function MultiDimensionalProperty(t2, e2, r, i2) {
      var a2;
      this.propType = "multidimensional", this.mult = r || 1, this.data = e2, this._mdf = false, this.elem = t2, this.container = i2, this.comp = t2.comp, this.k = false, this.kf = false, this.frameId = -1;
      var s2 = e2.k.length;
      for (this.v = createTypedArray("float32", s2), this.pv = createTypedArray("float32", s2), this.vel = createTypedArray("float32", s2), a2 = 0; a2 < s2; a2 += 1) this.v[a2] = e2.k[a2] * this.mult, this.pv[a2] = e2.k[a2];
      this._isFirstFrame = true, this.effectsSequence = [], this.getValue = processEffectsSequence, this.setVValue = setVValue, this.addEffect = addEffect;
    }
    function KeyframedValueProperty(t2, e2, r, i2) {
      this.propType = "unidimensional", this.keyframes = e2.k, this.keyframesMetadata = [], this.offsetTime = t2.data.st, this.frameId = -1, this._caching = { lastFrame: initFrame, lastIndex: 0, value: 0, _lastKeyframeIndex: -1 }, this.k = true, this.kf = true, this.data = e2, this.mult = r || 1, this.elem = t2, this.container = i2, this.comp = t2.comp, this.v = initFrame, this.pv = initFrame, this._isFirstFrame = true, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.addEffect = addEffect;
    }
    function KeyframedMultidimensionalProperty(t2, e2, r, i2) {
      var a2;
      this.propType = "multidimensional";
      var s2, n2, o2, h2, l2 = e2.k.length;
      for (a2 = 0; a2 < l2 - 1; a2 += 1) e2.k[a2].to && e2.k[a2].s && e2.k[a2 + 1] && e2.k[a2 + 1].s && (s2 = e2.k[a2].s, n2 = e2.k[a2 + 1].s, o2 = e2.k[a2].to, h2 = e2.k[a2].ti, (2 === s2.length && (s2[0] !== n2[0] || s2[1] !== n2[1]) && bez.pointOnLine2D(s2[0], s2[1], n2[0], n2[1], s2[0] + o2[0], s2[1] + o2[1]) && bez.pointOnLine2D(s2[0], s2[1], n2[0], n2[1], n2[0] + h2[0], n2[1] + h2[1]) || 3 === s2.length && (s2[0] !== n2[0] || s2[1] !== n2[1] || s2[2] !== n2[2]) && bez.pointOnLine3D(s2[0], s2[1], s2[2], n2[0], n2[1], n2[2], s2[0] + o2[0], s2[1] + o2[1], s2[2] + o2[2]) && bez.pointOnLine3D(s2[0], s2[1], s2[2], n2[0], n2[1], n2[2], n2[0] + h2[0], n2[1] + h2[1], n2[2] + h2[2])) && (e2.k[a2].to = null, e2.k[a2].ti = null), s2[0] === n2[0] && s2[1] === n2[1] && 0 === o2[0] && 0 === o2[1] && 0 === h2[0] && 0 === h2[1] && (2 === s2.length || s2[2] === n2[2] && 0 === o2[2] && 0 === h2[2]) && (e2.k[a2].to = null, e2.k[a2].ti = null));
      this.effectsSequence = [getValueAtCurrentTime.bind(this)], this.data = e2, this.keyframes = e2.k, this.keyframesMetadata = [], this.offsetTime = t2.data.st, this.k = true, this.kf = true, this._isFirstFrame = true, this.mult = r || 1, this.elem = t2, this.container = i2, this.comp = t2.comp, this.getValue = processEffectsSequence, this.setVValue = setVValue, this.interpolateValue = interpolateValue, this.frameId = -1;
      var p2 = e2.k[0].s.length;
      for (this.v = createTypedArray("float32", p2), this.pv = createTypedArray("float32", p2), a2 = 0; a2 < p2; a2 += 1) this.v[a2] = initFrame, this.pv[a2] = initFrame;
      this._caching = { lastFrame: initFrame, lastIndex: 0, value: createTypedArray("float32", p2) }, this.addEffect = addEffect;
    }
    var PropertyFactory = { getProp: function(t2, e2, r, i2, a2) {
      var s2;
      if (e2.sid && (e2 = t2.globalData.slotManager.getProp(e2)), e2.k.length) if ("number" == typeof e2.k[0]) s2 = new MultiDimensionalProperty(t2, e2, i2, a2);
      else switch (r) {
        case 0:
          s2 = new KeyframedValueProperty(t2, e2, i2, a2);
          break;
        case 1:
          s2 = new KeyframedMultidimensionalProperty(t2, e2, i2, a2);
      }
      else s2 = new ValueProperty(t2, e2, i2, a2);
      return s2.effectsSequence.length && a2.addDynamicProperty(s2), s2;
    } };
    function DynamicPropertyContainer() {
    }
    DynamicPropertyContainer.prototype = { addDynamicProperty: function(t2) {
      -1 === this.dynamicProperties.indexOf(t2) && (this.dynamicProperties.push(t2), this.container.addDynamicProperty(this), this._isAnimated = true);
    }, iterateDynamicProperties: function() {
      var t2;
      this._mdf = false;
      var e2 = this.dynamicProperties.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.dynamicProperties[t2].getValue(), this.dynamicProperties[t2]._mdf && (this._mdf = true);
    }, initDynamicPropertyContainer: function(t2) {
      this.container = t2, this.dynamicProperties = [], this._mdf = false, this._isAnimated = false;
    } };
    var pointPool = poolFactory(8, (function() {
      return createTypedArray("float32", 2);
    }));
    function ShapePath() {
      this.c = false, this._length = 0, this._maxLength = 8, this.v = createSizedArray(this._maxLength), this.o = createSizedArray(this._maxLength), this.i = createSizedArray(this._maxLength);
    }
    ShapePath.prototype.setPathData = function(t2, e2) {
      this.c = t2, this.setLength(e2);
      for (var r = 0; r < e2; ) this.v[r] = pointPool.newElement(), this.o[r] = pointPool.newElement(), this.i[r] = pointPool.newElement(), r += 1;
    }, ShapePath.prototype.setLength = function(t2) {
      for (; this._maxLength < t2; ) this.doubleArrayLength();
      this._length = t2;
    }, ShapePath.prototype.doubleArrayLength = function() {
      this.v = this.v.concat(createSizedArray(this._maxLength)), this.i = this.i.concat(createSizedArray(this._maxLength)), this.o = this.o.concat(createSizedArray(this._maxLength)), this._maxLength *= 2;
    }, ShapePath.prototype.setXYAt = function(t2, e2, r, i2, a2) {
      var s2;
      switch (this._length = Math.max(this._length, i2 + 1), this._length >= this._maxLength && this.doubleArrayLength(), r) {
        case "v":
          s2 = this.v;
          break;
        case "i":
          s2 = this.i;
          break;
        case "o":
          s2 = this.o;
          break;
        default:
          s2 = [];
      }
      (!s2[i2] || s2[i2] && !a2) && (s2[i2] = pointPool.newElement()), s2[i2][0] = t2, s2[i2][1] = e2;
    }, ShapePath.prototype.setTripleAt = function(t2, e2, r, i2, a2, s2, n2, o2) {
      this.setXYAt(t2, e2, "v", n2, o2), this.setXYAt(r, i2, "o", n2, o2), this.setXYAt(a2, s2, "i", n2, o2);
    }, ShapePath.prototype.reverse = function() {
      var t2 = new ShapePath();
      t2.setPathData(this.c, this._length);
      var e2 = this.v, r = this.o, i2 = this.i, a2 = 0;
      this.c && (t2.setTripleAt(e2[0][0], e2[0][1], i2[0][0], i2[0][1], r[0][0], r[0][1], 0, false), a2 = 1);
      var s2, n2 = this._length - 1, o2 = this._length;
      for (s2 = a2; s2 < o2; s2 += 1) t2.setTripleAt(e2[n2][0], e2[n2][1], i2[n2][0], i2[n2][1], r[n2][0], r[n2][1], s2, false), n2 -= 1;
      return t2;
    }, ShapePath.prototype.length = function() {
      return this._length;
    };
    var shapePool = (factory = poolFactory(4, (function() {
      return new ShapePath();
    }), (function(t2) {
      var e2, r = t2._length;
      for (e2 = 0; e2 < r; e2 += 1) pointPool.release(t2.v[e2]), pointPool.release(t2.i[e2]), pointPool.release(t2.o[e2]), t2.v[e2] = null, t2.i[e2] = null, t2.o[e2] = null;
      t2._length = 0, t2.c = false;
    })), factory.clone = function(t2) {
      var e2, r = factory.newElement(), i2 = void 0 === t2._length ? t2.v.length : t2._length;
      for (r.setLength(i2), r.c = t2.c, e2 = 0; e2 < i2; e2 += 1) r.setTripleAt(t2.v[e2][0], t2.v[e2][1], t2.o[e2][0], t2.o[e2][1], t2.i[e2][0], t2.i[e2][1], e2);
      return r;
    }, factory), factory;
    function ShapeCollection() {
      this._length = 0, this._maxLength = 4, this.shapes = createSizedArray(this._maxLength);
    }
    ShapeCollection.prototype.addShape = function(t2) {
      this._length === this._maxLength && (this.shapes = this.shapes.concat(createSizedArray(this._maxLength)), this._maxLength *= 2), this.shapes[this._length] = t2, this._length += 1;
    }, ShapeCollection.prototype.releaseShapes = function() {
      var t2;
      for (t2 = 0; t2 < this._length; t2 += 1) shapePool.release(this.shapes[t2]);
      this._length = 0;
    };
    var shapeCollectionPool = (ob = { newShapeCollection: function() {
      return _length ? pool[_length -= 1] : new ShapeCollection();
    }, release: function(t2) {
      var e2, r = t2._length;
      for (e2 = 0; e2 < r; e2 += 1) shapePool.release(t2.shapes[e2]);
      t2._length = 0, _length === _maxLength && (pool = pooling.double(pool), _maxLength *= 2), pool[_length] = t2, _length += 1;
    } }, _length = 0, _maxLength = 4, pool = createSizedArray(_maxLength), ob), ob, _length, _maxLength, pool, ShapePropertyFactory = (function() {
      function t2(t3, e3, r2) {
        var i3, a3, s3, n3, o3, h3, l3, p3, f3, c2 = r2.lastIndex, m2 = this.keyframes;
        if (t3 < m2[0].t - this.offsetTime) i3 = m2[0].s[0], s3 = true, c2 = 0;
        else if (t3 >= m2[m2.length - 1].t - this.offsetTime) i3 = m2[m2.length - 1].s ? m2[m2.length - 1].s[0] : m2[m2.length - 2].e[0], s3 = true;
        else {
          for (var d2, u2, y, g2 = c2, v2 = m2.length - 1, b = true; b && (d2 = m2[g2], !((u2 = m2[g2 + 1]).t - this.offsetTime > t3)); ) g2 < v2 - 1 ? g2 += 1 : b = false;
          if (y = this.keyframesMetadata[g2] || {}, c2 = g2, !(s3 = 1 === d2.h)) {
            if (t3 >= u2.t - this.offsetTime) p3 = 1;
            else if (t3 < d2.t - this.offsetTime) p3 = 0;
            else {
              var x;
              y.__fnct ? x = y.__fnct : (x = BezierFactory.getBezierEasing(d2.o.x, d2.o.y, d2.i.x, d2.i.y).get, y.__fnct = x), p3 = x((t3 - (d2.t - this.offsetTime)) / (u2.t - this.offsetTime - (d2.t - this.offsetTime)));
            }
            a3 = u2.s ? u2.s[0] : d2.e[0];
          }
          i3 = d2.s[0];
        }
        for (h3 = e3._length, l3 = i3.i[0].length, r2.lastIndex = c2, n3 = 0; n3 < h3; n3 += 1) for (o3 = 0; o3 < l3; o3 += 1) f3 = s3 ? i3.i[n3][o3] : i3.i[n3][o3] + (a3.i[n3][o3] - i3.i[n3][o3]) * p3, e3.i[n3][o3] = f3, f3 = s3 ? i3.o[n3][o3] : i3.o[n3][o3] + (a3.o[n3][o3] - i3.o[n3][o3]) * p3, e3.o[n3][o3] = f3, f3 = s3 ? i3.v[n3][o3] : i3.v[n3][o3] + (a3.v[n3][o3] - i3.v[n3][o3]) * p3, e3.v[n3][o3] = f3;
      }
      function e2() {
        var t3 = this.comp.renderedFrame - this.offsetTime, e3 = this.keyframes[0].t - this.offsetTime, r2 = this.keyframes[this.keyframes.length - 1].t - this.offsetTime, i3 = this._caching.lastFrame;
        return -999999 !== i3 && (i3 < e3 && t3 < e3 || i3 > r2 && t3 > r2) || (this._caching.lastIndex = i3 < t3 ? this._caching.lastIndex : 0, this.interpolateShape(t3, this.pv, this._caching)), this._caching.lastFrame = t3, this.pv;
      }
      function r() {
        this.paths = this.localShapeCollection;
      }
      function i2(t3) {
        (function(t4, e3) {
          if (t4._length !== e3._length || t4.c !== e3.c) return false;
          var r2, i3 = t4._length;
          for (r2 = 0; r2 < i3; r2 += 1) if (t4.v[r2][0] !== e3.v[r2][0] || t4.v[r2][1] !== e3.v[r2][1] || t4.o[r2][0] !== e3.o[r2][0] || t4.o[r2][1] !== e3.o[r2][1] || t4.i[r2][0] !== e3.i[r2][0] || t4.i[r2][1] !== e3.i[r2][1]) return false;
          return true;
        })(this.v, t3) || (this.v = shapePool.clone(t3), this.localShapeCollection.releaseShapes(), this.localShapeCollection.addShape(this.v), this._mdf = true, this.paths = this.localShapeCollection);
      }
      function a2() {
        if (this.elem.globalData.frameId !== this.frameId) if (this.effectsSequence.length) if (this.lock) this.setVValue(this.pv);
        else {
          var t3, e3;
          this.lock = true, this._mdf = false, t3 = this.kf ? this.pv : this.data.ks ? this.data.ks.k : this.data.pt.k;
          var r2 = this.effectsSequence.length;
          for (e3 = 0; e3 < r2; e3 += 1) t3 = this.effectsSequence[e3](t3);
          this.setVValue(t3), this.lock = false, this.frameId = this.elem.globalData.frameId;
        }
        else this._mdf = false;
      }
      function s2(t3, e3, i3) {
        this.propType = "shape", this.comp = t3.comp, this.container = t3, this.elem = t3, this.data = e3, this.k = false, this.kf = false, this._mdf = false;
        var a3 = 3 === i3 ? e3.pt.k : e3.ks.k;
        this.v = shapePool.clone(a3), this.pv = shapePool.clone(this.v), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(this.v), this.reset = r, this.effectsSequence = [];
      }
      function n2(t3) {
        this.effectsSequence.push(t3), this.container.addDynamicProperty(this);
      }
      function o2(t3, i3, a3) {
        this.propType = "shape", this.comp = t3.comp, this.elem = t3, this.container = t3, this.offsetTime = t3.data.st, this.keyframes = 3 === a3 ? i3.pt.k : i3.ks.k, this.keyframesMetadata = [], this.k = true, this.kf = true;
        var s3 = this.keyframes[0].s[0].i.length;
        this.v = shapePool.newElement(), this.v.setPathData(this.keyframes[0].s[0].c, s3), this.pv = shapePool.clone(this.v), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(this.v), this.lastFrame = -999999, this.reset = r, this._caching = { lastFrame: -999999, lastIndex: 0 }, this.effectsSequence = [e2.bind(this)];
      }
      s2.prototype.interpolateShape = t2, s2.prototype.getValue = a2, s2.prototype.setVValue = i2, s2.prototype.addEffect = n2, o2.prototype.getValue = a2, o2.prototype.interpolateShape = t2, o2.prototype.setVValue = i2, o2.prototype.addEffect = n2;
      var h2 = (function() {
        var t3 = roundCorner;
        function e3(t4, e4) {
          this.v = shapePool.newElement(), this.v.setPathData(true, 4), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.paths = this.localShapeCollection, this.localShapeCollection.addShape(this.v), this.d = e4.d, this.elem = t4, this.comp = t4.comp, this.frameId = -1, this.initDynamicPropertyContainer(t4), this.p = PropertyFactory.getProp(t4, e4.p, 1, 0, this), this.s = PropertyFactory.getProp(t4, e4.s, 1, 0, this), this.dynamicProperties.length ? this.k = true : (this.k = false, this.convertEllToPath());
        }
        return e3.prototype = { reset: r, getValue: function() {
          this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertEllToPath());
        }, convertEllToPath: function() {
          var e4 = this.p.v[0], r2 = this.p.v[1], i3 = this.s.v[0] / 2, a3 = this.s.v[1] / 2, s3 = 3 !== this.d, n3 = this.v;
          n3.v[0][0] = e4, n3.v[0][1] = r2 - a3, n3.v[1][0] = s3 ? e4 + i3 : e4 - i3, n3.v[1][1] = r2, n3.v[2][0] = e4, n3.v[2][1] = r2 + a3, n3.v[3][0] = s3 ? e4 - i3 : e4 + i3, n3.v[3][1] = r2, n3.i[0][0] = s3 ? e4 - i3 * t3 : e4 + i3 * t3, n3.i[0][1] = r2 - a3, n3.i[1][0] = s3 ? e4 + i3 : e4 - i3, n3.i[1][1] = r2 - a3 * t3, n3.i[2][0] = s3 ? e4 + i3 * t3 : e4 - i3 * t3, n3.i[2][1] = r2 + a3, n3.i[3][0] = s3 ? e4 - i3 : e4 + i3, n3.i[3][1] = r2 + a3 * t3, n3.o[0][0] = s3 ? e4 + i3 * t3 : e4 - i3 * t3, n3.o[0][1] = r2 - a3, n3.o[1][0] = s3 ? e4 + i3 : e4 - i3, n3.o[1][1] = r2 + a3 * t3, n3.o[2][0] = s3 ? e4 - i3 * t3 : e4 + i3 * t3, n3.o[2][1] = r2 + a3, n3.o[3][0] = s3 ? e4 - i3 : e4 + i3, n3.o[3][1] = r2 - a3 * t3;
        } }, extendPrototype([DynamicPropertyContainer], e3), e3;
      })(), l2 = (function() {
        function t3(t4, e3) {
          this.v = shapePool.newElement(), this.v.setPathData(true, 0), this.elem = t4, this.comp = t4.comp, this.data = e3, this.frameId = -1, this.d = e3.d, this.initDynamicPropertyContainer(t4), 1 === e3.sy ? (this.ir = PropertyFactory.getProp(t4, e3.ir, 0, 0, this), this.is = PropertyFactory.getProp(t4, e3.is, 0, 0.01, this), this.convertToPath = this.convertStarToPath) : this.convertToPath = this.convertPolygonToPath, this.pt = PropertyFactory.getProp(t4, e3.pt, 0, 0, this), this.p = PropertyFactory.getProp(t4, e3.p, 1, 0, this), this.r = PropertyFactory.getProp(t4, e3.r, 0, degToRads, this), this.or = PropertyFactory.getProp(t4, e3.or, 0, 0, this), this.os = PropertyFactory.getProp(t4, e3.os, 0, 0.01, this), this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.localShapeCollection.addShape(this.v), this.paths = this.localShapeCollection, this.dynamicProperties.length ? this.k = true : (this.k = false, this.convertToPath());
        }
        return t3.prototype = { reset: r, getValue: function() {
          this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertToPath());
        }, convertStarToPath: function() {
          var t4, e3, r2, i3, a3 = 2 * Math.floor(this.pt.v), s3 = 2 * Math.PI / a3, n3 = true, o3 = this.or.v, h3 = this.ir.v, l3 = this.os.v, p3 = this.is.v, f3 = 2 * Math.PI * o3 / (2 * a3), c2 = 2 * Math.PI * h3 / (2 * a3), m2 = -Math.PI / 2;
          m2 += this.r.v;
          var d2 = 3 === this.data.d ? -1 : 1;
          for (this.v._length = 0, t4 = 0; t4 < a3; t4 += 1) {
            r2 = n3 ? l3 : p3, i3 = n3 ? f3 : c2;
            var u2 = (e3 = n3 ? o3 : h3) * Math.cos(m2), y = e3 * Math.sin(m2), g2 = 0 === u2 && 0 === y ? 0 : y / Math.sqrt(u2 * u2 + y * y), v2 = 0 === u2 && 0 === y ? 0 : -u2 / Math.sqrt(u2 * u2 + y * y);
            u2 += +this.p.v[0], y += +this.p.v[1], this.v.setTripleAt(u2, y, u2 - g2 * i3 * r2 * d2, y - v2 * i3 * r2 * d2, u2 + g2 * i3 * r2 * d2, y + v2 * i3 * r2 * d2, t4, true), n3 = !n3, m2 += s3 * d2;
          }
        }, convertPolygonToPath: function() {
          var t4, e3 = Math.floor(this.pt.v), r2 = 2 * Math.PI / e3, i3 = this.or.v, a3 = this.os.v, s3 = 2 * Math.PI * i3 / (4 * e3), n3 = 0.5 * -Math.PI, o3 = 3 === this.data.d ? -1 : 1;
          for (n3 += this.r.v, this.v._length = 0, t4 = 0; t4 < e3; t4 += 1) {
            var h3 = i3 * Math.cos(n3), l3 = i3 * Math.sin(n3), p3 = 0 === h3 && 0 === l3 ? 0 : l3 / Math.sqrt(h3 * h3 + l3 * l3), f3 = 0 === h3 && 0 === l3 ? 0 : -h3 / Math.sqrt(h3 * h3 + l3 * l3);
            h3 += +this.p.v[0], l3 += +this.p.v[1], this.v.setTripleAt(h3, l3, h3 - p3 * s3 * a3 * o3, l3 - f3 * s3 * a3 * o3, h3 + p3 * s3 * a3 * o3, l3 + f3 * s3 * a3 * o3, t4, true), n3 += r2 * o3;
          }
          this.paths.length = 0, this.paths[0] = this.v;
        } }, extendPrototype([DynamicPropertyContainer], t3), t3;
      })(), p2 = (function() {
        function t3(t4, e3) {
          this.v = shapePool.newElement(), this.v.c = true, this.localShapeCollection = shapeCollectionPool.newShapeCollection(), this.localShapeCollection.addShape(this.v), this.paths = this.localShapeCollection, this.elem = t4, this.comp = t4.comp, this.frameId = -1, this.d = e3.d, this.initDynamicPropertyContainer(t4), this.p = PropertyFactory.getProp(t4, e3.p, 1, 0, this), this.s = PropertyFactory.getProp(t4, e3.s, 1, 0, this), this.r = PropertyFactory.getProp(t4, e3.r, 0, 0, this), this.dynamicProperties.length ? this.k = true : (this.k = false, this.convertRectToPath());
        }
        return t3.prototype = { convertRectToPath: function() {
          var t4 = this.p.v[0], e3 = this.p.v[1], r2 = this.s.v[0] / 2, i3 = this.s.v[1] / 2, a3 = bmMin(r2, i3, this.r.v), s3 = a3 * (1 - roundCorner);
          this.v._length = 0, 2 === this.d || 1 === this.d ? (this.v.setTripleAt(t4 + r2, e3 - i3 + a3, t4 + r2, e3 - i3 + a3, t4 + r2, e3 - i3 + s3, 0, true), this.v.setTripleAt(t4 + r2, e3 + i3 - a3, t4 + r2, e3 + i3 - s3, t4 + r2, e3 + i3 - a3, 1, true), 0 !== a3 ? (this.v.setTripleAt(t4 + r2 - a3, e3 + i3, t4 + r2 - a3, e3 + i3, t4 + r2 - s3, e3 + i3, 2, true), this.v.setTripleAt(t4 - r2 + a3, e3 + i3, t4 - r2 + s3, e3 + i3, t4 - r2 + a3, e3 + i3, 3, true), this.v.setTripleAt(t4 - r2, e3 + i3 - a3, t4 - r2, e3 + i3 - a3, t4 - r2, e3 + i3 - s3, 4, true), this.v.setTripleAt(t4 - r2, e3 - i3 + a3, t4 - r2, e3 - i3 + s3, t4 - r2, e3 - i3 + a3, 5, true), this.v.setTripleAt(t4 - r2 + a3, e3 - i3, t4 - r2 + a3, e3 - i3, t4 - r2 + s3, e3 - i3, 6, true), this.v.setTripleAt(t4 + r2 - a3, e3 - i3, t4 + r2 - s3, e3 - i3, t4 + r2 - a3, e3 - i3, 7, true)) : (this.v.setTripleAt(t4 - r2, e3 + i3, t4 - r2 + s3, e3 + i3, t4 - r2, e3 + i3, 2), this.v.setTripleAt(t4 - r2, e3 - i3, t4 - r2, e3 - i3 + s3, t4 - r2, e3 - i3, 3))) : (this.v.setTripleAt(t4 + r2, e3 - i3 + a3, t4 + r2, e3 - i3 + s3, t4 + r2, e3 - i3 + a3, 0, true), 0 !== a3 ? (this.v.setTripleAt(t4 + r2 - a3, e3 - i3, t4 + r2 - a3, e3 - i3, t4 + r2 - s3, e3 - i3, 1, true), this.v.setTripleAt(t4 - r2 + a3, e3 - i3, t4 - r2 + s3, e3 - i3, t4 - r2 + a3, e3 - i3, 2, true), this.v.setTripleAt(t4 - r2, e3 - i3 + a3, t4 - r2, e3 - i3 + a3, t4 - r2, e3 - i3 + s3, 3, true), this.v.setTripleAt(t4 - r2, e3 + i3 - a3, t4 - r2, e3 + i3 - s3, t4 - r2, e3 + i3 - a3, 4, true), this.v.setTripleAt(t4 - r2 + a3, e3 + i3, t4 - r2 + a3, e3 + i3, t4 - r2 + s3, e3 + i3, 5, true), this.v.setTripleAt(t4 + r2 - a3, e3 + i3, t4 + r2 - s3, e3 + i3, t4 + r2 - a3, e3 + i3, 6, true), this.v.setTripleAt(t4 + r2, e3 + i3 - a3, t4 + r2, e3 + i3 - a3, t4 + r2, e3 + i3 - s3, 7, true)) : (this.v.setTripleAt(t4 - r2, e3 - i3, t4 - r2 + s3, e3 - i3, t4 - r2, e3 - i3, 1, true), this.v.setTripleAt(t4 - r2, e3 + i3, t4 - r2, e3 + i3 - s3, t4 - r2, e3 + i3, 2, true), this.v.setTripleAt(t4 + r2, e3 + i3, t4 + r2 - s3, e3 + i3, t4 + r2, e3 + i3, 3, true)));
        }, getValue: function() {
          this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf && this.convertRectToPath());
        }, reset: r }, extendPrototype([DynamicPropertyContainer], t3), t3;
      })();
      var f2 = { getShapeProp: function(t3, e3, r2) {
        var i3;
        return 3 === r2 || 4 === r2 ? i3 = (3 === r2 ? e3.pt : e3.ks).k.length ? new o2(t3, e3, r2) : new s2(t3, e3, r2) : 5 === r2 ? i3 = new p2(t3, e3) : 6 === r2 ? i3 = new h2(t3, e3) : 7 === r2 && (i3 = new l2(t3, e3)), i3.k && t3.addDynamicProperty(i3), i3;
      }, getConstructorFunction: function() {
        return s2;
      }, getKeyframedConstructorFunction: function() {
        return o2;
      } };
      return f2;
    })(), Matrix = /* @__PURE__ */ (function() {
      var t2 = Math.cos, e2 = Math.sin, r = Math.tan, i2 = Math.round;
      function a2() {
        return this.props[0] = 1, this.props[1] = 0, this.props[2] = 0, this.props[3] = 0, this.props[4] = 0, this.props[5] = 1, this.props[6] = 0, this.props[7] = 0, this.props[8] = 0, this.props[9] = 0, this.props[10] = 1, this.props[11] = 0, this.props[12] = 0, this.props[13] = 0, this.props[14] = 0, this.props[15] = 1, this;
      }
      function s2(r2) {
        if (0 === r2) return this;
        var i3 = t2(r2), a3 = e2(r2);
        return this._t(i3, -a3, 0, 0, a3, i3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      }
      function n2(r2) {
        if (0 === r2) return this;
        var i3 = t2(r2), a3 = e2(r2);
        return this._t(1, 0, 0, 0, 0, i3, -a3, 0, 0, a3, i3, 0, 0, 0, 0, 1);
      }
      function o2(r2) {
        if (0 === r2) return this;
        var i3 = t2(r2), a3 = e2(r2);
        return this._t(i3, 0, a3, 0, 0, 1, 0, 0, -a3, 0, i3, 0, 0, 0, 0, 1);
      }
      function h2(r2) {
        if (0 === r2) return this;
        var i3 = t2(r2), a3 = e2(r2);
        return this._t(i3, -a3, 0, 0, a3, i3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      }
      function l2(t3, e3) {
        return this._t(1, e3, t3, 1, 0, 0);
      }
      function p2(t3, e3) {
        return this.shear(r(t3), r(e3));
      }
      function f2(i3, a3) {
        var s3 = t2(a3), n3 = e2(a3);
        return this._t(s3, n3, 0, 0, -n3, s3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, r(i3), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(s3, -n3, 0, 0, n3, s3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      }
      function c2(t3, e3, r2) {
        return r2 || 0 === r2 || (r2 = 1), 1 === t3 && 1 === e3 && 1 === r2 ? this : this._t(t3, 0, 0, 0, 0, e3, 0, 0, 0, 0, r2, 0, 0, 0, 0, 1);
      }
      function m2(t3, e3, r2, i3, a3, s3, n3, o3, h3, l3, p3, f3, c3, m3, d3, u3) {
        return this.props[0] = t3, this.props[1] = e3, this.props[2] = r2, this.props[3] = i3, this.props[4] = a3, this.props[5] = s3, this.props[6] = n3, this.props[7] = o3, this.props[8] = h3, this.props[9] = l3, this.props[10] = p3, this.props[11] = f3, this.props[12] = c3, this.props[13] = m3, this.props[14] = d3, this.props[15] = u3, this;
      }
      function d2(t3, e3, r2) {
        return r2 = r2 || 0, 0 !== t3 || 0 !== e3 || 0 !== r2 ? this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t3, e3, r2, 1) : this;
      }
      function u2(t3, e3, r2, i3, a3, s3, n3, o3, h3, l3, p3, f3, c3, m3, d3, u3) {
        var y2 = this.props;
        if (1 === t3 && 0 === e3 && 0 === r2 && 0 === i3 && 0 === a3 && 1 === s3 && 0 === n3 && 0 === o3 && 0 === h3 && 0 === l3 && 1 === p3 && 0 === f3) return y2[12] = y2[12] * t3 + y2[15] * c3, y2[13] = y2[13] * s3 + y2[15] * m3, y2[14] = y2[14] * p3 + y2[15] * d3, y2[15] *= u3, this._identityCalculated = false, this;
        var g3 = y2[0], v3 = y2[1], b2 = y2[2], x2 = y2[3], E3 = y2[4], S3 = y2[5], P3 = y2[6], C3 = y2[7], _3 = y2[8], k3 = y2[9], A2 = y2[10], T2 = y2[11], M2 = y2[12], w3 = y2[13], D3 = y2[14], F3 = y2[15];
        return y2[0] = g3 * t3 + v3 * a3 + b2 * h3 + x2 * c3, y2[1] = g3 * e3 + v3 * s3 + b2 * l3 + x2 * m3, y2[2] = g3 * r2 + v3 * n3 + b2 * p3 + x2 * d3, y2[3] = g3 * i3 + v3 * o3 + b2 * f3 + x2 * u3, y2[4] = E3 * t3 + S3 * a3 + P3 * h3 + C3 * c3, y2[5] = E3 * e3 + S3 * s3 + P3 * l3 + C3 * m3, y2[6] = E3 * r2 + S3 * n3 + P3 * p3 + C3 * d3, y2[7] = E3 * i3 + S3 * o3 + P3 * f3 + C3 * u3, y2[8] = _3 * t3 + k3 * a3 + A2 * h3 + T2 * c3, y2[9] = _3 * e3 + k3 * s3 + A2 * l3 + T2 * m3, y2[10] = _3 * r2 + k3 * n3 + A2 * p3 + T2 * d3, y2[11] = _3 * i3 + k3 * o3 + A2 * f3 + T2 * u3, y2[12] = M2 * t3 + w3 * a3 + D3 * h3 + F3 * c3, y2[13] = M2 * e3 + w3 * s3 + D3 * l3 + F3 * m3, y2[14] = M2 * r2 + w3 * n3 + D3 * p3 + F3 * d3, y2[15] = M2 * i3 + w3 * o3 + D3 * f3 + F3 * u3, this._identityCalculated = false, this;
      }
      function y(t3) {
        var e3 = t3.props;
        return this.transform(e3[0], e3[1], e3[2], e3[3], e3[4], e3[5], e3[6], e3[7], e3[8], e3[9], e3[10], e3[11], e3[12], e3[13], e3[14], e3[15]);
      }
      function g2() {
        return this._identityCalculated || (this._identity = !(1 !== this.props[0] || 0 !== this.props[1] || 0 !== this.props[2] || 0 !== this.props[3] || 0 !== this.props[4] || 1 !== this.props[5] || 0 !== this.props[6] || 0 !== this.props[7] || 0 !== this.props[8] || 0 !== this.props[9] || 1 !== this.props[10] || 0 !== this.props[11] || 0 !== this.props[12] || 0 !== this.props[13] || 0 !== this.props[14] || 1 !== this.props[15]), this._identityCalculated = true), this._identity;
      }
      function v2(t3) {
        for (var e3 = 0; e3 < 16; ) {
          if (t3.props[e3] !== this.props[e3]) return false;
          e3 += 1;
        }
        return true;
      }
      function b(t3) {
        var e3;
        for (e3 = 0; e3 < 16; e3 += 1) t3.props[e3] = this.props[e3];
        return t3;
      }
      function x(t3) {
        var e3;
        for (e3 = 0; e3 < 16; e3 += 1) this.props[e3] = t3[e3];
      }
      function E2(t3, e3, r2) {
        return { x: t3 * this.props[0] + e3 * this.props[4] + r2 * this.props[8] + this.props[12], y: t3 * this.props[1] + e3 * this.props[5] + r2 * this.props[9] + this.props[13], z: t3 * this.props[2] + e3 * this.props[6] + r2 * this.props[10] + this.props[14] };
      }
      function S2(t3, e3, r2) {
        return t3 * this.props[0] + e3 * this.props[4] + r2 * this.props[8] + this.props[12];
      }
      function P2(t3, e3, r2) {
        return t3 * this.props[1] + e3 * this.props[5] + r2 * this.props[9] + this.props[13];
      }
      function C2(t3, e3, r2) {
        return t3 * this.props[2] + e3 * this.props[6] + r2 * this.props[10] + this.props[14];
      }
      function _2() {
        var t3 = this.props[0] * this.props[5] - this.props[1] * this.props[4], e3 = this.props[5] / t3, r2 = -this.props[1] / t3, i3 = -this.props[4] / t3, a3 = this.props[0] / t3, s3 = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / t3, n3 = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / t3, o3 = new Matrix();
        return o3.props[0] = e3, o3.props[1] = r2, o3.props[4] = i3, o3.props[5] = a3, o3.props[12] = s3, o3.props[13] = n3, o3;
      }
      function k2(t3) {
        return this.getInverseMatrix().applyToPointArray(t3[0], t3[1], t3[2] || 0);
      }
      function A(t3) {
        var e3, r2 = t3.length, i3 = [];
        for (e3 = 0; e3 < r2; e3 += 1) i3[e3] = k2(t3[e3]);
        return i3;
      }
      function T(t3, e3, r2) {
        var i3 = createTypedArray("float32", 6);
        if (this.isIdentity()) i3[0] = t3[0], i3[1] = t3[1], i3[2] = e3[0], i3[3] = e3[1], i3[4] = r2[0], i3[5] = r2[1];
        else {
          var a3 = this.props[0], s3 = this.props[1], n3 = this.props[4], o3 = this.props[5], h3 = this.props[12], l3 = this.props[13];
          i3[0] = t3[0] * a3 + t3[1] * n3 + h3, i3[1] = t3[0] * s3 + t3[1] * o3 + l3, i3[2] = e3[0] * a3 + e3[1] * n3 + h3, i3[3] = e3[0] * s3 + e3[1] * o3 + l3, i3[4] = r2[0] * a3 + r2[1] * n3 + h3, i3[5] = r2[0] * s3 + r2[1] * o3 + l3;
        }
        return i3;
      }
      function M(t3, e3, r2) {
        return this.isIdentity() ? [t3, e3, r2] : [t3 * this.props[0] + e3 * this.props[4] + r2 * this.props[8] + this.props[12], t3 * this.props[1] + e3 * this.props[5] + r2 * this.props[9] + this.props[13], t3 * this.props[2] + e3 * this.props[6] + r2 * this.props[10] + this.props[14]];
      }
      function w2(t3, e3) {
        if (this.isIdentity()) return t3 + "," + e3;
        var r2 = this.props;
        return Math.round(100 * (t3 * r2[0] + e3 * r2[4] + r2[12])) / 100 + "," + Math.round(100 * (t3 * r2[1] + e3 * r2[5] + r2[13])) / 100;
      }
      function D2() {
        for (var t3 = 0, e3 = this.props, r2 = "matrix3d("; t3 < 16; ) r2 += i2(1e4 * e3[t3]) / 1e4, r2 += 15 === t3 ? ")" : ",", t3 += 1;
        return r2;
      }
      function F2(t3) {
        return t3 < 1e-6 && t3 > 0 || t3 > -1e-6 && t3 < 0 ? i2(1e4 * t3) / 1e4 : t3;
      }
      function I() {
        var t3 = this.props;
        return "matrix(" + F2(t3[0]) + "," + F2(t3[1]) + "," + F2(t3[4]) + "," + F2(t3[5]) + "," + F2(t3[12]) + "," + F2(t3[13]) + ")";
      }
      return function() {
        this.reset = a2, this.rotate = s2, this.rotateX = n2, this.rotateY = o2, this.rotateZ = h2, this.skew = p2, this.skewFromAxis = f2, this.shear = l2, this.scale = c2, this.setTransform = m2, this.translate = d2, this.transform = u2, this.multiply = y, this.applyToPoint = E2, this.applyToX = S2, this.applyToY = P2, this.applyToZ = C2, this.applyToPointArray = M, this.applyToTriplePoints = T, this.applyToPointStringified = w2, this.toCSS = D2, this.to2dCSS = I, this.clone = b, this.cloneFromProps = x, this.equals = v2, this.inversePoints = A, this.inversePoint = k2, this.getInverseMatrix = _2, this._t = this.transform, this.isIdentity = g2, this._identity = true, this._identityCalculated = false, this.props = createTypedArray("float32", 16), this.reset();
      };
    })();
    function _typeof$3(t2) {
      return (_typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    var lottie = {};
    function setLocation(t2) {
      setLocationHref(t2);
    }
    function searchAnimations() {
      animationManager.searchAnimations();
    }
    function setSubframeRendering(t2) {
      setSubframeEnabled(t2);
    }
    function setPrefix(t2) {
      setIdPrefix(t2);
    }
    function loadAnimation(t2) {
      return animationManager.loadAnimation(t2);
    }
    function setQuality(t2) {
      if ("string" == typeof t2) switch (t2) {
        case "high":
          setDefaultCurveSegments(200);
          break;
        default:
        case "medium":
          setDefaultCurveSegments(50);
          break;
        case "low":
          setDefaultCurveSegments(10);
      }
      else !isNaN(t2) && t2 > 1 && setDefaultCurveSegments(t2);
    }
    function inBrowser() {
      return "undefined" != typeof navigator;
    }
    function installPlugin(t2, e2) {
      "expressions" === t2 && setExpressionsPlugin(e2);
    }
    function getFactory(t2) {
      switch (t2) {
        case "propertyFactory":
          return PropertyFactory;
        case "shapePropertyFactory":
          return ShapePropertyFactory;
        case "matrix":
          return Matrix;
        default:
          return null;
      }
    }
    function checkReady() {
      "complete" === document.readyState && (clearInterval(readyStateCheckInterval), searchAnimations());
    }
    function getQueryVariable(t2) {
      for (var e2 = queryString.split("&"), r = 0; r < e2.length; r += 1) {
        var i2 = e2[r].split("=");
        if (decodeURIComponent(i2[0]) == t2) return decodeURIComponent(i2[1]);
      }
      return null;
    }
    lottie.play = animationManager.play, lottie.pause = animationManager.pause, lottie.setLocationHref = setLocation, lottie.togglePause = animationManager.togglePause, lottie.setSpeed = animationManager.setSpeed, lottie.setDirection = animationManager.setDirection, lottie.stop = animationManager.stop, lottie.searchAnimations = searchAnimations, lottie.registerAnimation = animationManager.registerAnimation, lottie.loadAnimation = loadAnimation, lottie.setSubframeRendering = setSubframeRendering, lottie.resize = animationManager.resize, lottie.goToAndStop = animationManager.goToAndStop, lottie.destroy = animationManager.destroy, lottie.setQuality = setQuality, lottie.inBrowser = inBrowser, lottie.installPlugin = installPlugin, lottie.freeze = animationManager.freeze, lottie.unfreeze = animationManager.unfreeze, lottie.setVolume = animationManager.setVolume, lottie.mute = animationManager.mute, lottie.unmute = animationManager.unmute, lottie.getRegisteredAnimations = animationManager.getRegisteredAnimations, lottie.useWebWorker = setWebWorker, lottie.setIDPrefix = setPrefix, lottie.__getFactory = getFactory, lottie.version = "5.12.2";
    var queryString = "";
    {
      var scripts = document.getElementsByTagName("script"), index = scripts.length - 1, myScript = scripts[index] || { src: "" };
      queryString = myScript.src ? myScript.src.replace(/^[^\?]+\??/, "") : "", getQueryVariable("renderer");
    }
    var readyStateCheckInterval = setInterval(checkReady, 100);
    try {
      "object" !== _typeof$3(exports) && (window.bodymovin = lottie);
    } catch (t2) {
    }
    var ShapeModifiers = (function() {
      var t2 = {}, e2 = {};
      return t2.registerModifier = function(t3, r) {
        e2[t3] || (e2[t3] = r);
      }, t2.getModifier = function(t3, r, i2) {
        return new e2[t3](r, i2);
      }, t2;
    })();
    function ShapeModifier() {
    }
    function TrimModifier() {
    }
    function PuckerAndBloatModifier() {
    }
    ShapeModifier.prototype.initModifierProperties = function() {
    }, ShapeModifier.prototype.addShapeToModifier = function() {
    }, ShapeModifier.prototype.addShape = function(t2) {
      if (!this.closed) {
        t2.sh.container.addDynamicProperty(t2.sh);
        var e2 = { shape: t2.sh, data: t2, localShapeCollection: shapeCollectionPool.newShapeCollection() };
        this.shapes.push(e2), this.addShapeToModifier(e2), this._isAnimated && t2.setAsAnimated();
      }
    }, ShapeModifier.prototype.init = function(t2, e2) {
      this.shapes = [], this.elem = t2, this.initDynamicPropertyContainer(t2), this.initModifierProperties(t2, e2), this.frameId = initialDefaultFrame, this.closed = false, this.k = false, this.dynamicProperties.length ? this.k = true : this.getValue(true);
    }, ShapeModifier.prototype.processKeys = function() {
      this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties());
    }, extendPrototype([DynamicPropertyContainer], ShapeModifier), extendPrototype([ShapeModifier], TrimModifier), TrimModifier.prototype.initModifierProperties = function(t2, e2) {
      this.s = PropertyFactory.getProp(t2, e2.s, 0, 0.01, this), this.e = PropertyFactory.getProp(t2, e2.e, 0, 0.01, this), this.o = PropertyFactory.getProp(t2, e2.o, 0, 0, this), this.sValue = 0, this.eValue = 0, this.getValue = this.processKeys, this.m = e2.m, this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
    }, TrimModifier.prototype.addShapeToModifier = function(t2) {
      t2.pathsData = [];
    }, TrimModifier.prototype.calculateShapeEdges = function(t2, e2, r, i2, a2) {
      var s2 = [];
      e2 <= 1 ? s2.push({ s: t2, e: e2 }) : t2 >= 1 ? s2.push({ s: t2 - 1, e: e2 - 1 }) : (s2.push({ s: t2, e: 1 }), s2.push({ s: 0, e: e2 - 1 }));
      var n2, o2, h2 = [], l2 = s2.length;
      for (n2 = 0; n2 < l2; n2 += 1) {
        var p2, f2;
        if (!((o2 = s2[n2]).e * a2 < i2 || o2.s * a2 > i2 + r)) p2 = o2.s * a2 <= i2 ? 0 : (o2.s * a2 - i2) / r, f2 = o2.e * a2 >= i2 + r ? 1 : (o2.e * a2 - i2) / r, h2.push([p2, f2]);
      }
      return h2.length || h2.push([0, 0]), h2;
    }, TrimModifier.prototype.releasePathsData = function(t2) {
      var e2, r = t2.length;
      for (e2 = 0; e2 < r; e2 += 1) segmentsLengthPool.release(t2[e2]);
      return t2.length = 0, t2;
    }, TrimModifier.prototype.processShapes = function(t2) {
      var e2, r, i2, a2;
      if (this._mdf || t2) {
        var s2 = this.o.v % 360 / 360;
        if (s2 < 0 && (s2 += 1), (e2 = this.s.v > 1 ? 1 + s2 : this.s.v < 0 ? 0 + s2 : this.s.v + s2) > (r = this.e.v > 1 ? 1 + s2 : this.e.v < 0 ? 0 + s2 : this.e.v + s2)) {
          var n2 = e2;
          e2 = r, r = n2;
        }
        e2 = 1e-4 * Math.round(1e4 * e2), r = 1e-4 * Math.round(1e4 * r), this.sValue = e2, this.eValue = r;
      } else e2 = this.sValue, r = this.eValue;
      var o2, h2, l2, p2, f2, c2 = this.shapes.length, m2 = 0;
      if (r === e2) for (a2 = 0; a2 < c2; a2 += 1) this.shapes[a2].localShapeCollection.releaseShapes(), this.shapes[a2].shape._mdf = true, this.shapes[a2].shape.paths = this.shapes[a2].localShapeCollection, this._mdf && (this.shapes[a2].pathsData.length = 0);
      else if (1 === r && 0 === e2 || 0 === r && 1 === e2) {
        if (this._mdf) for (a2 = 0; a2 < c2; a2 += 1) this.shapes[a2].pathsData.length = 0, this.shapes[a2].shape._mdf = true;
      } else {
        var d2, u2, y = [];
        for (a2 = 0; a2 < c2; a2 += 1) if ((d2 = this.shapes[a2]).shape._mdf || this._mdf || t2 || 2 === this.m) {
          if (h2 = (i2 = d2.shape.paths)._length, f2 = 0, !d2.shape._mdf && d2.pathsData.length) f2 = d2.totalShapeLength;
          else {
            for (l2 = this.releasePathsData(d2.pathsData), o2 = 0; o2 < h2; o2 += 1) p2 = bez.getSegmentsLength(i2.shapes[o2]), l2.push(p2), f2 += p2.totalLength;
            d2.totalShapeLength = f2, d2.pathsData = l2;
          }
          m2 += f2, d2.shape._mdf = true;
        } else d2.shape.paths = d2.localShapeCollection;
        var g2, v2 = e2, b = r, x = 0;
        for (a2 = c2 - 1; a2 >= 0; a2 -= 1) if ((d2 = this.shapes[a2]).shape._mdf) {
          for ((u2 = d2.localShapeCollection).releaseShapes(), 2 === this.m && c2 > 1 ? (g2 = this.calculateShapeEdges(e2, r, d2.totalShapeLength, x, m2), x += d2.totalShapeLength) : g2 = [[v2, b]], h2 = g2.length, o2 = 0; o2 < h2; o2 += 1) {
            v2 = g2[o2][0], b = g2[o2][1], y.length = 0, b <= 1 ? y.push({ s: d2.totalShapeLength * v2, e: d2.totalShapeLength * b }) : v2 >= 1 ? y.push({ s: d2.totalShapeLength * (v2 - 1), e: d2.totalShapeLength * (b - 1) }) : (y.push({ s: d2.totalShapeLength * v2, e: d2.totalShapeLength }), y.push({ s: 0, e: d2.totalShapeLength * (b - 1) }));
            var E2 = this.addShapes(d2, y[0]);
            if (y[0].s !== y[0].e) {
              if (y.length > 1) if (d2.shape.paths.shapes[d2.shape.paths._length - 1].c) {
                var S2 = E2.pop();
                this.addPaths(E2, u2), E2 = this.addShapes(d2, y[1], S2);
              } else this.addPaths(E2, u2), E2 = this.addShapes(d2, y[1]);
              this.addPaths(E2, u2);
            }
          }
          d2.shape.paths = u2;
        }
      }
    }, TrimModifier.prototype.addPaths = function(t2, e2) {
      var r, i2 = t2.length;
      for (r = 0; r < i2; r += 1) e2.addShape(t2[r]);
    }, TrimModifier.prototype.addSegment = function(t2, e2, r, i2, a2, s2, n2) {
      a2.setXYAt(e2[0], e2[1], "o", s2), a2.setXYAt(r[0], r[1], "i", s2 + 1), n2 && a2.setXYAt(t2[0], t2[1], "v", s2), a2.setXYAt(i2[0], i2[1], "v", s2 + 1);
    }, TrimModifier.prototype.addSegmentFromArray = function(t2, e2, r, i2) {
      e2.setXYAt(t2[1], t2[5], "o", r), e2.setXYAt(t2[2], t2[6], "i", r + 1), i2 && e2.setXYAt(t2[0], t2[4], "v", r), e2.setXYAt(t2[3], t2[7], "v", r + 1);
    }, TrimModifier.prototype.addShapes = function(t2, e2, r) {
      var i2, a2, s2, n2, o2, h2, l2, p2, f2 = t2.pathsData, c2 = t2.shape.paths.shapes, m2 = t2.shape.paths._length, d2 = 0, u2 = [], y = true;
      for (r ? (o2 = r._length, p2 = r._length) : (r = shapePool.newElement(), o2 = 0, p2 = 0), u2.push(r), i2 = 0; i2 < m2; i2 += 1) {
        for (h2 = f2[i2].lengths, r.c = c2[i2].c, s2 = c2[i2].c ? h2.length : h2.length + 1, a2 = 1; a2 < s2; a2 += 1) if (d2 + (n2 = h2[a2 - 1]).addedLength < e2.s) d2 += n2.addedLength, r.c = false;
        else {
          if (d2 > e2.e) {
            r.c = false;
            break;
          }
          e2.s <= d2 && e2.e >= d2 + n2.addedLength ? (this.addSegment(c2[i2].v[a2 - 1], c2[i2].o[a2 - 1], c2[i2].i[a2], c2[i2].v[a2], r, o2, y), y = false) : (l2 = bez.getNewSegment(c2[i2].v[a2 - 1], c2[i2].v[a2], c2[i2].o[a2 - 1], c2[i2].i[a2], (e2.s - d2) / n2.addedLength, (e2.e - d2) / n2.addedLength, h2[a2 - 1]), this.addSegmentFromArray(l2, r, o2, y), y = false, r.c = false), d2 += n2.addedLength, o2 += 1;
        }
        if (c2[i2].c && h2.length) {
          if (n2 = h2[a2 - 1], d2 <= e2.e) {
            var g2 = h2[a2 - 1].addedLength;
            e2.s <= d2 && e2.e >= d2 + g2 ? (this.addSegment(c2[i2].v[a2 - 1], c2[i2].o[a2 - 1], c2[i2].i[0], c2[i2].v[0], r, o2, y), y = false) : (l2 = bez.getNewSegment(c2[i2].v[a2 - 1], c2[i2].v[0], c2[i2].o[a2 - 1], c2[i2].i[0], (e2.s - d2) / g2, (e2.e - d2) / g2, h2[a2 - 1]), this.addSegmentFromArray(l2, r, o2, y), y = false, r.c = false);
          } else r.c = false;
          d2 += n2.addedLength, o2 += 1;
        }
        if (r._length && (r.setXYAt(r.v[p2][0], r.v[p2][1], "i", p2), r.setXYAt(r.v[r._length - 1][0], r.v[r._length - 1][1], "o", r._length - 1)), d2 > e2.e) break;
        i2 < m2 - 1 && (r = shapePool.newElement(), y = true, u2.push(r), o2 = 0);
      }
      return u2;
    }, extendPrototype([ShapeModifier], PuckerAndBloatModifier), PuckerAndBloatModifier.prototype.initModifierProperties = function(t2, e2) {
      this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(t2, e2.a, 0, null, this), this._isAnimated = !!this.amount.effectsSequence.length;
    }, PuckerAndBloatModifier.prototype.processPath = function(t2, e2) {
      var r = e2 / 100, i2 = [0, 0], a2 = t2._length, s2 = 0;
      for (s2 = 0; s2 < a2; s2 += 1) i2[0] += t2.v[s2][0], i2[1] += t2.v[s2][1];
      i2[0] /= a2, i2[1] /= a2;
      var n2, o2, h2, l2, p2, f2, c2 = shapePool.newElement();
      for (c2.c = t2.c, s2 = 0; s2 < a2; s2 += 1) n2 = t2.v[s2][0] + (i2[0] - t2.v[s2][0]) * r, o2 = t2.v[s2][1] + (i2[1] - t2.v[s2][1]) * r, h2 = t2.o[s2][0] + (i2[0] - t2.o[s2][0]) * -r, l2 = t2.o[s2][1] + (i2[1] - t2.o[s2][1]) * -r, p2 = t2.i[s2][0] + (i2[0] - t2.i[s2][0]) * -r, f2 = t2.i[s2][1] + (i2[1] - t2.i[s2][1]) * -r, c2.setTripleAt(n2, o2, h2, l2, p2, f2, s2);
      return c2;
    }, PuckerAndBloatModifier.prototype.processShapes = function(t2) {
      var e2, r, i2, a2, s2, n2, o2 = this.shapes.length, h2 = this.amount.v;
      if (0 !== h2) for (r = 0; r < o2; r += 1) {
        if (n2 = (s2 = this.shapes[r]).localShapeCollection, s2.shape._mdf || this._mdf || t2) for (n2.releaseShapes(), s2.shape._mdf = true, e2 = s2.shape.paths.shapes, a2 = s2.shape.paths._length, i2 = 0; i2 < a2; i2 += 1) n2.addShape(this.processPath(e2[i2], h2));
        s2.shape.paths = s2.localShapeCollection;
      }
      this.dynamicProperties.length || (this._mdf = false);
    };
    var TransformPropertyFactory = (function() {
      var t2 = [0, 0];
      function e2(t3, e3, r) {
        if (this.elem = t3, this.frameId = -1, this.propType = "transform", this.data = e3, this.v = new Matrix(), this.pre = new Matrix(), this.appliedTransformations = 0, this.initDynamicPropertyContainer(r || t3), e3.p && e3.p.s ? (this.px = PropertyFactory.getProp(t3, e3.p.x, 0, 0, this), this.py = PropertyFactory.getProp(t3, e3.p.y, 0, 0, this), e3.p.z && (this.pz = PropertyFactory.getProp(t3, e3.p.z, 0, 0, this))) : this.p = PropertyFactory.getProp(t3, e3.p || { k: [0, 0, 0] }, 1, 0, this), e3.rx) {
          if (this.rx = PropertyFactory.getProp(t3, e3.rx, 0, degToRads, this), this.ry = PropertyFactory.getProp(t3, e3.ry, 0, degToRads, this), this.rz = PropertyFactory.getProp(t3, e3.rz, 0, degToRads, this), e3.or.k[0].ti) {
            var i2, a2 = e3.or.k.length;
            for (i2 = 0; i2 < a2; i2 += 1) e3.or.k[i2].to = null, e3.or.k[i2].ti = null;
          }
          this.or = PropertyFactory.getProp(t3, e3.or, 1, degToRads, this), this.or.sh = true;
        } else this.r = PropertyFactory.getProp(t3, e3.r || { k: 0 }, 0, degToRads, this);
        e3.sk && (this.sk = PropertyFactory.getProp(t3, e3.sk, 0, degToRads, this), this.sa = PropertyFactory.getProp(t3, e3.sa, 0, degToRads, this)), this.a = PropertyFactory.getProp(t3, e3.a || { k: [0, 0, 0] }, 1, 0, this), this.s = PropertyFactory.getProp(t3, e3.s || { k: [100, 100, 100] }, 1, 0.01, this), e3.o ? this.o = PropertyFactory.getProp(t3, e3.o, 0, 0.01, t3) : this.o = { _mdf: false, v: 1 }, this._isDirty = true, this.dynamicProperties.length || this.getValue(true);
      }
      return e2.prototype = { applyToMatrix: function(t3) {
        var e3 = this._mdf;
        this.iterateDynamicProperties(), this._mdf = this._mdf || e3, this.a && t3.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.s && t3.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.sk && t3.skewFromAxis(-this.sk.v, this.sa.v), this.r ? t3.rotate(-this.r.v) : t3.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.data.p.s ? this.data.p.z ? t3.translate(this.px.v, this.py.v, -this.pz.v) : t3.translate(this.px.v, this.py.v, 0) : t3.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
      }, getValue: function(e3) {
        if (this.elem.globalData.frameId !== this.frameId) {
          if (this._isDirty && (this.precalculateMatrix(), this._isDirty = false), this.iterateDynamicProperties(), this._mdf || e3) {
            var r;
            if (this.v.cloneFromProps(this.pre.props), this.appliedTransformations < 1 && this.v.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.appliedTransformations < 2 && this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.sk && this.appliedTransformations < 3 && this.v.skewFromAxis(-this.sk.v, this.sa.v), this.r && this.appliedTransformations < 4 ? this.v.rotate(-this.r.v) : !this.r && this.appliedTransformations < 4 && this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.autoOriented) {
              var i2, a2;
              if (r = this.elem.globalData.frameRate, this.p && this.p.keyframes && this.p.getValueAtTime) this.p._caching.lastFrame + this.p.offsetTime <= this.p.keyframes[0].t ? (i2 = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / r, 0), a2 = this.p.getValueAtTime(this.p.keyframes[0].t / r, 0)) : this.p._caching.lastFrame + this.p.offsetTime >= this.p.keyframes[this.p.keyframes.length - 1].t ? (i2 = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t / r, 0), a2 = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.05) / r, 0)) : (i2 = this.p.pv, a2 = this.p.getValueAtTime((this.p._caching.lastFrame + this.p.offsetTime - 0.01) / r, this.p.offsetTime));
              else if (this.px && this.px.keyframes && this.py.keyframes && this.px.getValueAtTime && this.py.getValueAtTime) {
                i2 = [], a2 = [];
                var s2 = this.px, n2 = this.py;
                s2._caching.lastFrame + s2.offsetTime <= s2.keyframes[0].t ? (i2[0] = s2.getValueAtTime((s2.keyframes[0].t + 0.01) / r, 0), i2[1] = n2.getValueAtTime((n2.keyframes[0].t + 0.01) / r, 0), a2[0] = s2.getValueAtTime(s2.keyframes[0].t / r, 0), a2[1] = n2.getValueAtTime(n2.keyframes[0].t / r, 0)) : s2._caching.lastFrame + s2.offsetTime >= s2.keyframes[s2.keyframes.length - 1].t ? (i2[0] = s2.getValueAtTime(s2.keyframes[s2.keyframes.length - 1].t / r, 0), i2[1] = n2.getValueAtTime(n2.keyframes[n2.keyframes.length - 1].t / r, 0), a2[0] = s2.getValueAtTime((s2.keyframes[s2.keyframes.length - 1].t - 0.01) / r, 0), a2[1] = n2.getValueAtTime((n2.keyframes[n2.keyframes.length - 1].t - 0.01) / r, 0)) : (i2 = [s2.pv, n2.pv], a2[0] = s2.getValueAtTime((s2._caching.lastFrame + s2.offsetTime - 0.01) / r, s2.offsetTime), a2[1] = n2.getValueAtTime((n2._caching.lastFrame + n2.offsetTime - 0.01) / r, n2.offsetTime));
              } else i2 = a2 = t2;
              this.v.rotate(-Math.atan2(i2[1] - a2[1], i2[0] - a2[0]));
            }
            this.data.p && this.data.p.s ? this.data.p.z ? this.v.translate(this.px.v, this.py.v, -this.pz.v) : this.v.translate(this.px.v, this.py.v, 0) : this.v.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
          }
          this.frameId = this.elem.globalData.frameId;
        }
      }, precalculateMatrix: function() {
        if (this.appliedTransformations = 0, this.pre.reset(), !this.a.effectsSequence.length && (this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.appliedTransformations = 1, !this.s.effectsSequence.length)) {
          if (this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this.appliedTransformations = 2, this.sk) {
            if (this.sk.effectsSequence.length || this.sa.effectsSequence.length) return;
            this.pre.skewFromAxis(-this.sk.v, this.sa.v), this.appliedTransformations = 3;
          }
          this.r ? this.r.effectsSequence.length || (this.pre.rotate(-this.r.v), this.appliedTransformations = 4) : this.rz.effectsSequence.length || this.ry.effectsSequence.length || this.rx.effectsSequence.length || this.or.effectsSequence.length || (this.pre.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.appliedTransformations = 4);
        }
      }, autoOrient: function() {
      } }, extendPrototype([DynamicPropertyContainer], e2), e2.prototype.addDynamicProperty = function(t3) {
        this._addDynamicProperty(t3), this.elem.addDynamicProperty(t3), this._isDirty = true;
      }, e2.prototype._addDynamicProperty = DynamicPropertyContainer.prototype.addDynamicProperty, { getTransformProperty: function(t3, r, i2) {
        return new e2(t3, r, i2);
      } };
    })();
    function RepeaterModifier() {
    }
    function RoundCornersModifier() {
    }
    function floatEqual(t2, e2) {
      return 1e5 * Math.abs(t2 - e2) <= Math.min(Math.abs(t2), Math.abs(e2));
    }
    function floatZero(t2) {
      return Math.abs(t2) <= 1e-5;
    }
    function lerp(t2, e2, r) {
      return t2 * (1 - r) + e2 * r;
    }
    function lerpPoint(t2, e2, r) {
      return [lerp(t2[0], e2[0], r), lerp(t2[1], e2[1], r)];
    }
    function quadRoots(t2, e2, r) {
      if (0 === t2) return [];
      var i2 = e2 * e2 - 4 * t2 * r;
      if (i2 < 0) return [];
      var a2 = -e2 / (2 * t2);
      if (0 === i2) return [a2];
      var s2 = Math.sqrt(i2) / (2 * t2);
      return [a2 - s2, a2 + s2];
    }
    function polynomialCoefficients(t2, e2, r, i2) {
      return [3 * e2 - t2 - 3 * r + i2, 3 * t2 - 6 * e2 + 3 * r, -3 * t2 + 3 * e2, t2];
    }
    function singlePoint(t2) {
      return new PolynomialBezier(t2, t2, t2, t2, false);
    }
    function PolynomialBezier(t2, e2, r, i2, a2) {
      a2 && pointEqual(t2, e2) && (e2 = lerpPoint(t2, i2, 1 / 3)), a2 && pointEqual(r, i2) && (r = lerpPoint(t2, i2, 2 / 3));
      var s2 = polynomialCoefficients(t2[0], e2[0], r[0], i2[0]), n2 = polynomialCoefficients(t2[1], e2[1], r[1], i2[1]);
      this.a = [s2[0], n2[0]], this.b = [s2[1], n2[1]], this.c = [s2[2], n2[2]], this.d = [s2[3], n2[3]], this.points = [t2, e2, r, i2];
    }
    function extrema(t2, e2) {
      var r = t2.points[0][e2], i2 = t2.points[t2.points.length - 1][e2];
      if (r > i2) {
        var a2 = i2;
        i2 = r, r = a2;
      }
      for (var s2 = quadRoots(3 * t2.a[e2], 2 * t2.b[e2], t2.c[e2]), n2 = 0; n2 < s2.length; n2 += 1) if (s2[n2] > 0 && s2[n2] < 1) {
        var o2 = t2.point(s2[n2])[e2];
        o2 < r ? r = o2 : o2 > i2 && (i2 = o2);
      }
      return { min: r, max: i2 };
    }
    function intersectData(t2, e2, r) {
      var i2 = t2.boundingBox();
      return { cx: i2.cx, cy: i2.cy, width: i2.width, height: i2.height, bez: t2, t: (e2 + r) / 2, t1: e2, t2: r };
    }
    function splitData(t2) {
      var e2 = t2.bez.split(0.5);
      return [intersectData(e2[0], t2.t1, t2.t), intersectData(e2[1], t2.t, t2.t2)];
    }
    function boxIntersect(t2, e2) {
      return 2 * Math.abs(t2.cx - e2.cx) < t2.width + e2.width && 2 * Math.abs(t2.cy - e2.cy) < t2.height + e2.height;
    }
    function intersectsImpl(t2, e2, r, i2, a2, s2) {
      if (boxIntersect(t2, e2)) if (r >= s2 || t2.width <= i2 && t2.height <= i2 && e2.width <= i2 && e2.height <= i2) a2.push([t2.t, e2.t]);
      else {
        var n2 = splitData(t2), o2 = splitData(e2);
        intersectsImpl(n2[0], o2[0], r + 1, i2, a2, s2), intersectsImpl(n2[0], o2[1], r + 1, i2, a2, s2), intersectsImpl(n2[1], o2[0], r + 1, i2, a2, s2), intersectsImpl(n2[1], o2[1], r + 1, i2, a2, s2);
      }
    }
    function crossProduct(t2, e2) {
      return [t2[1] * e2[2] - t2[2] * e2[1], t2[2] * e2[0] - t2[0] * e2[2], t2[0] * e2[1] - t2[1] * e2[0]];
    }
    function lineIntersection(t2, e2, r, i2) {
      var a2 = [t2[0], t2[1], 1], s2 = [e2[0], e2[1], 1], n2 = [r[0], r[1], 1], o2 = [i2[0], i2[1], 1], h2 = crossProduct(crossProduct(a2, s2), crossProduct(n2, o2));
      return floatZero(h2[2]) ? null : [h2[0] / h2[2], h2[1] / h2[2]];
    }
    function polarOffset(t2, e2, r) {
      return [t2[0] + Math.cos(e2) * r, t2[1] - Math.sin(e2) * r];
    }
    function pointDistance(t2, e2) {
      return Math.hypot(t2[0] - e2[0], t2[1] - e2[1]);
    }
    function pointEqual(t2, e2) {
      return floatEqual(t2[0], e2[0]) && floatEqual(t2[1], e2[1]);
    }
    function ZigZagModifier() {
    }
    function setPoint(t2, e2, r, i2, a2, s2, n2) {
      var o2 = r - Math.PI / 2, h2 = r + Math.PI / 2, l2 = e2[0] + Math.cos(r) * i2 * a2, p2 = e2[1] - Math.sin(r) * i2 * a2;
      t2.setTripleAt(l2, p2, l2 + Math.cos(o2) * s2, p2 - Math.sin(o2) * s2, l2 + Math.cos(h2) * n2, p2 - Math.sin(h2) * n2, t2.length());
    }
    function getPerpendicularVector(t2, e2) {
      var r = [e2[0] - t2[0], e2[1] - t2[1]], i2 = 0.5 * -Math.PI;
      return [Math.cos(i2) * r[0] - Math.sin(i2) * r[1], Math.sin(i2) * r[0] + Math.cos(i2) * r[1]];
    }
    function getProjectingAngle(t2, e2) {
      var r = 0 === e2 ? t2.length() - 1 : e2 - 1, i2 = (e2 + 1) % t2.length(), a2 = getPerpendicularVector(t2.v[r], t2.v[i2]);
      return Math.atan2(0, 1) - Math.atan2(a2[1], a2[0]);
    }
    function zigZagCorner(t2, e2, r, i2, a2, s2, n2) {
      var o2 = getProjectingAngle(e2, r), h2 = e2.v[r % e2._length], l2 = e2.v[0 === r ? e2._length - 1 : r - 1], p2 = e2.v[(r + 1) % e2._length], f2 = 2 === s2 ? Math.sqrt(Math.pow(h2[0] - l2[0], 2) + Math.pow(h2[1] - l2[1], 2)) : 0, c2 = 2 === s2 ? Math.sqrt(Math.pow(h2[0] - p2[0], 2) + Math.pow(h2[1] - p2[1], 2)) : 0;
      setPoint(t2, e2.v[r % e2._length], o2, n2, i2, c2 / (2 * (a2 + 1)), f2 / (2 * (a2 + 1)));
    }
    function zigZagSegment(t2, e2, r, i2, a2, s2) {
      for (var n2 = 0; n2 < i2; n2 += 1) {
        var o2 = (n2 + 1) / (i2 + 1), h2 = 2 === a2 ? Math.sqrt(Math.pow(e2.points[3][0] - e2.points[0][0], 2) + Math.pow(e2.points[3][1] - e2.points[0][1], 2)) : 0, l2 = e2.normalAngle(o2);
        setPoint(t2, e2.point(o2), l2, s2, r, h2 / (2 * (i2 + 1)), h2 / (2 * (i2 + 1))), s2 = -s2;
      }
      return s2;
    }
    function linearOffset(t2, e2, r) {
      var i2 = Math.atan2(e2[0] - t2[0], e2[1] - t2[1]);
      return [polarOffset(t2, i2, r), polarOffset(e2, i2, r)];
    }
    function offsetSegment(t2, e2) {
      var r, i2, a2, s2, n2, o2, h2;
      r = (h2 = linearOffset(t2.points[0], t2.points[1], e2))[0], i2 = h2[1], a2 = (h2 = linearOffset(t2.points[1], t2.points[2], e2))[0], s2 = h2[1], n2 = (h2 = linearOffset(t2.points[2], t2.points[3], e2))[0], o2 = h2[1];
      var l2 = lineIntersection(r, i2, a2, s2);
      null === l2 && (l2 = i2);
      var p2 = lineIntersection(n2, o2, a2, s2);
      return null === p2 && (p2 = n2), new PolynomialBezier(r, l2, p2, o2);
    }
    function joinLines(t2, e2, r, i2, a2) {
      var s2 = e2.points[3], n2 = r.points[0];
      if (3 === i2) return s2;
      if (pointEqual(s2, n2)) return s2;
      if (2 === i2) {
        var o2 = -e2.tangentAngle(1), h2 = -r.tangentAngle(0) + Math.PI, l2 = lineIntersection(s2, polarOffset(s2, o2 + Math.PI / 2, 100), n2, polarOffset(n2, o2 + Math.PI / 2, 100)), p2 = l2 ? pointDistance(l2, s2) : pointDistance(s2, n2) / 2, f2 = polarOffset(s2, o2, 2 * p2 * roundCorner);
        return t2.setXYAt(f2[0], f2[1], "o", t2.length() - 1), f2 = polarOffset(n2, h2, 2 * p2 * roundCorner), t2.setTripleAt(n2[0], n2[1], n2[0], n2[1], f2[0], f2[1], t2.length()), n2;
      }
      var c2 = lineIntersection(pointEqual(s2, e2.points[2]) ? e2.points[0] : e2.points[2], s2, n2, pointEqual(n2, r.points[1]) ? r.points[3] : r.points[1]);
      return c2 && pointDistance(c2, s2) < a2 ? (t2.setTripleAt(c2[0], c2[1], c2[0], c2[1], c2[0], c2[1], t2.length()), c2) : s2;
    }
    function getIntersection(t2, e2) {
      var r = t2.intersections(e2);
      return r.length && floatEqual(r[0][0], 1) && r.shift(), r.length ? r[0] : null;
    }
    function pruneSegmentIntersection(t2, e2) {
      var r = t2.slice(), i2 = e2.slice(), a2 = getIntersection(t2[t2.length - 1], e2[0]);
      return a2 && (r[t2.length - 1] = t2[t2.length - 1].split(a2[0])[0], i2[0] = e2[0].split(a2[1])[1]), t2.length > 1 && e2.length > 1 && (a2 = getIntersection(t2[0], e2[e2.length - 1])) ? [[t2[0].split(a2[0])[0]], [e2[e2.length - 1].split(a2[1])[1]]] : [r, i2];
    }
    function pruneIntersections(t2) {
      for (var e2, r = 1; r < t2.length; r += 1) e2 = pruneSegmentIntersection(t2[r - 1], t2[r]), t2[r - 1] = e2[0], t2[r] = e2[1];
      return t2.length > 1 && (e2 = pruneSegmentIntersection(t2[t2.length - 1], t2[0]), t2[t2.length - 1] = e2[0], t2[0] = e2[1]), t2;
    }
    function offsetSegmentSplit(t2, e2) {
      var r, i2, a2, s2, n2 = t2.inflectionPoints();
      if (0 === n2.length) return [offsetSegment(t2, e2)];
      if (1 === n2.length || floatEqual(n2[1], 1)) return r = (a2 = t2.split(n2[0]))[0], i2 = a2[1], [offsetSegment(r, e2), offsetSegment(i2, e2)];
      r = (a2 = t2.split(n2[0]))[0];
      var o2 = (n2[1] - n2[0]) / (1 - n2[0]);
      return s2 = (a2 = a2[1].split(o2))[0], i2 = a2[1], [offsetSegment(r, e2), offsetSegment(s2, e2), offsetSegment(i2, e2)];
    }
    function OffsetPathModifier() {
    }
    function getFontProperties(t2) {
      for (var e2 = t2.fStyle ? t2.fStyle.split(" ") : [], r = "normal", i2 = "normal", a2 = e2.length, s2 = 0; s2 < a2; s2 += 1) switch (e2[s2].toLowerCase()) {
        case "italic":
          i2 = "italic";
          break;
        case "bold":
          r = "700";
          break;
        case "black":
          r = "900";
          break;
        case "medium":
          r = "500";
          break;
        case "regular":
        case "normal":
          r = "400";
          break;
        case "light":
        case "thin":
          r = "200";
      }
      return { style: i2, weight: t2.fWeight || r };
    }
    extendPrototype([ShapeModifier], RepeaterModifier), RepeaterModifier.prototype.initModifierProperties = function(t2, e2) {
      this.getValue = this.processKeys, this.c = PropertyFactory.getProp(t2, e2.c, 0, null, this), this.o = PropertyFactory.getProp(t2, e2.o, 0, null, this), this.tr = TransformPropertyFactory.getTransformProperty(t2, e2.tr, this), this.so = PropertyFactory.getProp(t2, e2.tr.so, 0, 0.01, this), this.eo = PropertyFactory.getProp(t2, e2.tr.eo, 0, 0.01, this), this.data = e2, this.dynamicProperties.length || this.getValue(true), this._isAnimated = !!this.dynamicProperties.length, this.pMatrix = new Matrix(), this.rMatrix = new Matrix(), this.sMatrix = new Matrix(), this.tMatrix = new Matrix(), this.matrix = new Matrix();
    }, RepeaterModifier.prototype.applyTransforms = function(t2, e2, r, i2, a2, s2) {
      var n2 = s2 ? -1 : 1, o2 = i2.s.v[0] + (1 - i2.s.v[0]) * (1 - a2), h2 = i2.s.v[1] + (1 - i2.s.v[1]) * (1 - a2);
      t2.translate(i2.p.v[0] * n2 * a2, i2.p.v[1] * n2 * a2, i2.p.v[2]), e2.translate(-i2.a.v[0], -i2.a.v[1], i2.a.v[2]), e2.rotate(-i2.r.v * n2 * a2), e2.translate(i2.a.v[0], i2.a.v[1], i2.a.v[2]), r.translate(-i2.a.v[0], -i2.a.v[1], i2.a.v[2]), r.scale(s2 ? 1 / o2 : o2, s2 ? 1 / h2 : h2), r.translate(i2.a.v[0], i2.a.v[1], i2.a.v[2]);
    }, RepeaterModifier.prototype.init = function(t2, e2, r, i2) {
      for (this.elem = t2, this.arr = e2, this.pos = r, this.elemsData = i2, this._currentCopies = 0, this._elements = [], this._groups = [], this.frameId = -1, this.initDynamicPropertyContainer(t2), this.initModifierProperties(t2, e2[r]); r > 0; ) r -= 1, this._elements.unshift(e2[r]);
      this.dynamicProperties.length ? this.k = true : this.getValue(true);
    }, RepeaterModifier.prototype.resetElements = function(t2) {
      var e2, r = t2.length;
      for (e2 = 0; e2 < r; e2 += 1) t2[e2]._processed = false, "gr" === t2[e2].ty && this.resetElements(t2[e2].it);
    }, RepeaterModifier.prototype.cloneElements = function(t2) {
      var e2 = JSON.parse(JSON.stringify(t2));
      return this.resetElements(e2), e2;
    }, RepeaterModifier.prototype.changeGroupRender = function(t2, e2) {
      var r, i2 = t2.length;
      for (r = 0; r < i2; r += 1) t2[r]._render = e2, "gr" === t2[r].ty && this.changeGroupRender(t2[r].it, e2);
    }, RepeaterModifier.prototype.processShapes = function(t2) {
      var e2, r, i2, a2, s2, n2 = false;
      if (this._mdf || t2) {
        var o2, h2 = Math.ceil(this.c.v);
        if (this._groups.length < h2) {
          for (; this._groups.length < h2; ) {
            var l2 = { it: this.cloneElements(this._elements), ty: "gr" };
            l2.it.push({ a: { a: 0, ix: 1, k: [0, 0] }, nm: "Transform", o: { a: 0, ix: 7, k: 100 }, p: { a: 0, ix: 2, k: [0, 0] }, r: { a: 1, ix: 6, k: [{ s: 0, e: 0, t: 0 }, { s: 0, e: 0, t: 1 }] }, s: { a: 0, ix: 3, k: [100, 100] }, sa: { a: 0, ix: 5, k: 0 }, sk: { a: 0, ix: 4, k: 0 }, ty: "tr" }), this.arr.splice(0, 0, l2), this._groups.splice(0, 0, l2), this._currentCopies += 1;
          }
          this.elem.reloadShapes(), n2 = true;
        }
        for (s2 = 0, i2 = 0; i2 <= this._groups.length - 1; i2 += 1) {
          if (o2 = s2 < h2, this._groups[i2]._render = o2, this.changeGroupRender(this._groups[i2].it, o2), !o2) {
            var p2 = this.elemsData[i2].it, f2 = p2[p2.length - 1];
            0 !== f2.transform.op.v ? (f2.transform.op._mdf = true, f2.transform.op.v = 0) : f2.transform.op._mdf = false;
          }
          s2 += 1;
        }
        this._currentCopies = h2;
        var c2 = this.o.v, m2 = c2 % 1, d2 = c2 > 0 ? Math.floor(c2) : Math.ceil(c2), u2 = this.pMatrix.props, y = this.rMatrix.props, g2 = this.sMatrix.props;
        this.pMatrix.reset(), this.rMatrix.reset(), this.sMatrix.reset(), this.tMatrix.reset(), this.matrix.reset();
        var v2, b, x = 0;
        if (c2 > 0) {
          for (; x < d2; ) this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false), x += 1;
          m2 && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, m2, false), x += m2);
        } else if (c2 < 0) {
          for (; x > d2; ) this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, true), x -= 1;
          m2 && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, -m2, true), x -= m2);
        }
        for (i2 = 1 === this.data.m ? 0 : this._currentCopies - 1, a2 = 1 === this.data.m ? 1 : -1, s2 = this._currentCopies; s2; ) {
          if (b = (r = (e2 = this.elemsData[i2].it)[e2.length - 1].transform.mProps.v.props).length, e2[e2.length - 1].transform.mProps._mdf = true, e2[e2.length - 1].transform.op._mdf = true, e2[e2.length - 1].transform.op.v = 1 === this._currentCopies ? this.so.v : this.so.v + (this.eo.v - this.so.v) * (i2 / (this._currentCopies - 1)), 0 !== x) {
            for ((0 !== i2 && 1 === a2 || i2 !== this._currentCopies - 1 && -1 === a2) && this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false), this.matrix.transform(y[0], y[1], y[2], y[3], y[4], y[5], y[6], y[7], y[8], y[9], y[10], y[11], y[12], y[13], y[14], y[15]), this.matrix.transform(g2[0], g2[1], g2[2], g2[3], g2[4], g2[5], g2[6], g2[7], g2[8], g2[9], g2[10], g2[11], g2[12], g2[13], g2[14], g2[15]), this.matrix.transform(u2[0], u2[1], u2[2], u2[3], u2[4], u2[5], u2[6], u2[7], u2[8], u2[9], u2[10], u2[11], u2[12], u2[13], u2[14], u2[15]), v2 = 0; v2 < b; v2 += 1) r[v2] = this.matrix.props[v2];
            this.matrix.reset();
          } else for (this.matrix.reset(), v2 = 0; v2 < b; v2 += 1) r[v2] = this.matrix.props[v2];
          x += 1, s2 -= 1, i2 += a2;
        }
      } else for (s2 = this._currentCopies, i2 = 0, a2 = 1; s2; ) r = (e2 = this.elemsData[i2].it)[e2.length - 1].transform.mProps.v.props, e2[e2.length - 1].transform.mProps._mdf = false, e2[e2.length - 1].transform.op._mdf = false, s2 -= 1, i2 += a2;
      return n2;
    }, RepeaterModifier.prototype.addShape = function() {
    }, extendPrototype([ShapeModifier], RoundCornersModifier), RoundCornersModifier.prototype.initModifierProperties = function(t2, e2) {
      this.getValue = this.processKeys, this.rd = PropertyFactory.getProp(t2, e2.r, 0, null, this), this._isAnimated = !!this.rd.effectsSequence.length;
    }, RoundCornersModifier.prototype.processPath = function(t2, e2) {
      var r, i2 = shapePool.newElement();
      i2.c = t2.c;
      var a2, s2, n2, o2, h2, l2, p2, f2, c2, m2, d2, u2, y = t2._length, g2 = 0;
      for (r = 0; r < y; r += 1) a2 = t2.v[r], n2 = t2.o[r], s2 = t2.i[r], a2[0] === n2[0] && a2[1] === n2[1] && a2[0] === s2[0] && a2[1] === s2[1] ? 0 !== r && r !== y - 1 || t2.c ? (o2 = 0 === r ? t2.v[y - 1] : t2.v[r - 1], l2 = (h2 = Math.sqrt(Math.pow(a2[0] - o2[0], 2) + Math.pow(a2[1] - o2[1], 2))) ? Math.min(h2 / 2, e2) / h2 : 0, p2 = d2 = a2[0] + (o2[0] - a2[0]) * l2, f2 = u2 = a2[1] - (a2[1] - o2[1]) * l2, c2 = p2 - (p2 - a2[0]) * roundCorner, m2 = f2 - (f2 - a2[1]) * roundCorner, i2.setTripleAt(p2, f2, c2, m2, d2, u2, g2), g2 += 1, o2 = r === y - 1 ? t2.v[0] : t2.v[r + 1], l2 = (h2 = Math.sqrt(Math.pow(a2[0] - o2[0], 2) + Math.pow(a2[1] - o2[1], 2))) ? Math.min(h2 / 2, e2) / h2 : 0, p2 = c2 = a2[0] + (o2[0] - a2[0]) * l2, f2 = m2 = a2[1] + (o2[1] - a2[1]) * l2, d2 = p2 - (p2 - a2[0]) * roundCorner, u2 = f2 - (f2 - a2[1]) * roundCorner, i2.setTripleAt(p2, f2, c2, m2, d2, u2, g2), g2 += 1) : (i2.setTripleAt(a2[0], a2[1], n2[0], n2[1], s2[0], s2[1], g2), g2 += 1) : (i2.setTripleAt(t2.v[r][0], t2.v[r][1], t2.o[r][0], t2.o[r][1], t2.i[r][0], t2.i[r][1], g2), g2 += 1);
      return i2;
    }, RoundCornersModifier.prototype.processShapes = function(t2) {
      var e2, r, i2, a2, s2, n2, o2 = this.shapes.length, h2 = this.rd.v;
      if (0 !== h2) for (r = 0; r < o2; r += 1) {
        if (n2 = (s2 = this.shapes[r]).localShapeCollection, s2.shape._mdf || this._mdf || t2) for (n2.releaseShapes(), s2.shape._mdf = true, e2 = s2.shape.paths.shapes, a2 = s2.shape.paths._length, i2 = 0; i2 < a2; i2 += 1) n2.addShape(this.processPath(e2[i2], h2));
        s2.shape.paths = s2.localShapeCollection;
      }
      this.dynamicProperties.length || (this._mdf = false);
    }, PolynomialBezier.prototype.point = function(t2) {
      return [((this.a[0] * t2 + this.b[0]) * t2 + this.c[0]) * t2 + this.d[0], ((this.a[1] * t2 + this.b[1]) * t2 + this.c[1]) * t2 + this.d[1]];
    }, PolynomialBezier.prototype.derivative = function(t2) {
      return [(3 * t2 * this.a[0] + 2 * this.b[0]) * t2 + this.c[0], (3 * t2 * this.a[1] + 2 * this.b[1]) * t2 + this.c[1]];
    }, PolynomialBezier.prototype.tangentAngle = function(t2) {
      var e2 = this.derivative(t2);
      return Math.atan2(e2[1], e2[0]);
    }, PolynomialBezier.prototype.normalAngle = function(t2) {
      var e2 = this.derivative(t2);
      return Math.atan2(e2[0], e2[1]);
    }, PolynomialBezier.prototype.inflectionPoints = function() {
      var t2 = this.a[1] * this.b[0] - this.a[0] * this.b[1];
      if (floatZero(t2)) return [];
      var e2 = -0.5 * (this.a[1] * this.c[0] - this.a[0] * this.c[1]) / t2, r = e2 * e2 - 1 / 3 * (this.b[1] * this.c[0] - this.b[0] * this.c[1]) / t2;
      if (r < 0) return [];
      var i2 = Math.sqrt(r);
      return floatZero(i2) ? i2 > 0 && i2 < 1 ? [e2] : [] : [e2 - i2, e2 + i2].filter((function(t3) {
        return t3 > 0 && t3 < 1;
      }));
    }, PolynomialBezier.prototype.split = function(t2) {
      if (t2 <= 0) return [singlePoint(this.points[0]), this];
      if (t2 >= 1) return [this, singlePoint(this.points[this.points.length - 1])];
      var e2 = lerpPoint(this.points[0], this.points[1], t2), r = lerpPoint(this.points[1], this.points[2], t2), i2 = lerpPoint(this.points[2], this.points[3], t2), a2 = lerpPoint(e2, r, t2), s2 = lerpPoint(r, i2, t2), n2 = lerpPoint(a2, s2, t2);
      return [new PolynomialBezier(this.points[0], e2, a2, n2, true), new PolynomialBezier(n2, s2, i2, this.points[3], true)];
    }, PolynomialBezier.prototype.bounds = function() {
      return { x: extrema(this, 0), y: extrema(this, 1) };
    }, PolynomialBezier.prototype.boundingBox = function() {
      var t2 = this.bounds();
      return { left: t2.x.min, right: t2.x.max, top: t2.y.min, bottom: t2.y.max, width: t2.x.max - t2.x.min, height: t2.y.max - t2.y.min, cx: (t2.x.max + t2.x.min) / 2, cy: (t2.y.max + t2.y.min) / 2 };
    }, PolynomialBezier.prototype.intersections = function(t2, e2, r) {
      void 0 === e2 && (e2 = 2), void 0 === r && (r = 7);
      var i2 = [];
      return intersectsImpl(intersectData(this, 0, 1), intersectData(t2, 0, 1), 0, e2, i2, r), i2;
    }, PolynomialBezier.shapeSegment = function(t2, e2) {
      var r = (e2 + 1) % t2.length();
      return new PolynomialBezier(t2.v[e2], t2.o[e2], t2.i[r], t2.v[r], true);
    }, PolynomialBezier.shapeSegmentInverted = function(t2, e2) {
      var r = (e2 + 1) % t2.length();
      return new PolynomialBezier(t2.v[r], t2.i[r], t2.o[e2], t2.v[e2], true);
    }, extendPrototype([ShapeModifier], ZigZagModifier), ZigZagModifier.prototype.initModifierProperties = function(t2, e2) {
      this.getValue = this.processKeys, this.amplitude = PropertyFactory.getProp(t2, e2.s, 0, null, this), this.frequency = PropertyFactory.getProp(t2, e2.r, 0, null, this), this.pointsType = PropertyFactory.getProp(t2, e2.pt, 0, null, this), this._isAnimated = 0 !== this.amplitude.effectsSequence.length || 0 !== this.frequency.effectsSequence.length || 0 !== this.pointsType.effectsSequence.length;
    }, ZigZagModifier.prototype.processPath = function(t2, e2, r, i2) {
      var a2 = t2._length, s2 = shapePool.newElement();
      if (s2.c = t2.c, t2.c || (a2 -= 1), 0 === a2) return s2;
      var n2 = -1, o2 = PolynomialBezier.shapeSegment(t2, 0);
      zigZagCorner(s2, t2, 0, e2, r, i2, n2);
      for (var h2 = 0; h2 < a2; h2 += 1) n2 = zigZagSegment(s2, o2, e2, r, i2, -n2), o2 = h2 !== a2 - 1 || t2.c ? PolynomialBezier.shapeSegment(t2, (h2 + 1) % a2) : null, zigZagCorner(s2, t2, h2 + 1, e2, r, i2, n2);
      return s2;
    }, ZigZagModifier.prototype.processShapes = function(t2) {
      var e2, r, i2, a2, s2, n2, o2 = this.shapes.length, h2 = this.amplitude.v, l2 = Math.max(0, Math.round(this.frequency.v)), p2 = this.pointsType.v;
      if (0 !== h2) for (r = 0; r < o2; r += 1) {
        if (n2 = (s2 = this.shapes[r]).localShapeCollection, s2.shape._mdf || this._mdf || t2) for (n2.releaseShapes(), s2.shape._mdf = true, e2 = s2.shape.paths.shapes, a2 = s2.shape.paths._length, i2 = 0; i2 < a2; i2 += 1) n2.addShape(this.processPath(e2[i2], h2, l2, p2));
        s2.shape.paths = s2.localShapeCollection;
      }
      this.dynamicProperties.length || (this._mdf = false);
    }, extendPrototype([ShapeModifier], OffsetPathModifier), OffsetPathModifier.prototype.initModifierProperties = function(t2, e2) {
      this.getValue = this.processKeys, this.amount = PropertyFactory.getProp(t2, e2.a, 0, null, this), this.miterLimit = PropertyFactory.getProp(t2, e2.ml, 0, null, this), this.lineJoin = e2.lj, this._isAnimated = 0 !== this.amount.effectsSequence.length;
    }, OffsetPathModifier.prototype.processPath = function(t2, e2, r, i2) {
      var a2 = shapePool.newElement();
      a2.c = t2.c;
      var s2, n2, o2, h2 = t2.length();
      t2.c || (h2 -= 1);
      var l2 = [];
      for (s2 = 0; s2 < h2; s2 += 1) o2 = PolynomialBezier.shapeSegment(t2, s2), l2.push(offsetSegmentSplit(o2, e2));
      if (!t2.c) for (s2 = h2 - 1; s2 >= 0; s2 -= 1) o2 = PolynomialBezier.shapeSegmentInverted(t2, s2), l2.push(offsetSegmentSplit(o2, e2));
      l2 = pruneIntersections(l2);
      var p2 = null, f2 = null;
      for (s2 = 0; s2 < l2.length; s2 += 1) {
        var c2 = l2[s2];
        for (f2 && (p2 = joinLines(a2, f2, c2[0], r, i2)), f2 = c2[c2.length - 1], n2 = 0; n2 < c2.length; n2 += 1) o2 = c2[n2], p2 && pointEqual(o2.points[0], p2) ? a2.setXYAt(o2.points[1][0], o2.points[1][1], "o", a2.length() - 1) : a2.setTripleAt(o2.points[0][0], o2.points[0][1], o2.points[1][0], o2.points[1][1], o2.points[0][0], o2.points[0][1], a2.length()), a2.setTripleAt(o2.points[3][0], o2.points[3][1], o2.points[3][0], o2.points[3][1], o2.points[2][0], o2.points[2][1], a2.length()), p2 = o2.points[3];
      }
      return l2.length && joinLines(a2, f2, l2[0][0], r, i2), a2;
    }, OffsetPathModifier.prototype.processShapes = function(t2) {
      var e2, r, i2, a2, s2, n2, o2 = this.shapes.length, h2 = this.amount.v, l2 = this.miterLimit.v, p2 = this.lineJoin;
      if (0 !== h2) for (r = 0; r < o2; r += 1) {
        if (n2 = (s2 = this.shapes[r]).localShapeCollection, s2.shape._mdf || this._mdf || t2) for (n2.releaseShapes(), s2.shape._mdf = true, e2 = s2.shape.paths.shapes, a2 = s2.shape.paths._length, i2 = 0; i2 < a2; i2 += 1) n2.addShape(this.processPath(e2[i2], h2, p2, l2));
        s2.shape.paths = s2.localShapeCollection;
      }
      this.dynamicProperties.length || (this._mdf = false);
    };
    var FontManager = (function() {
      var t2 = { w: 0, size: 0, shapes: [], data: { shapes: [] } }, e2 = [];
      e2 = e2.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403]);
      var r = ["d83cdffb", "d83cdffc", "d83cdffd", "d83cdffe", "d83cdfff"];
      function i2(t3, e3) {
        var r2 = createTag("span");
        r2.setAttribute("aria-hidden", true), r2.style.fontFamily = e3;
        var i3 = createTag("span");
        i3.innerText = "giItT1WQy@!-/#", r2.style.position = "absolute", r2.style.left = "-10000px", r2.style.top = "-10000px", r2.style.fontSize = "300px", r2.style.fontVariant = "normal", r2.style.fontStyle = "normal", r2.style.fontWeight = "normal", r2.style.letterSpacing = "0", r2.appendChild(i3), document.body.appendChild(r2);
        var a3 = i3.offsetWidth;
        return i3.style.fontFamily = (function(t4) {
          var e4, r3 = t4.split(","), i4 = r3.length, a4 = [];
          for (e4 = 0; e4 < i4; e4 += 1) "sans-serif" !== r3[e4] && "monospace" !== r3[e4] && a4.push(r3[e4]);
          return a4.join(",");
        })(t3) + ", " + e3, { node: i3, w: a3, parent: r2 };
      }
      function a2(t3, e3) {
        var r2, i3 = document.body && e3 ? "svg" : "canvas", a3 = getFontProperties(t3);
        if ("svg" === i3) {
          var s3 = createNS("text");
          s3.style.fontSize = "100px", s3.setAttribute("font-family", t3.fFamily), s3.setAttribute("font-style", a3.style), s3.setAttribute("font-weight", a3.weight), s3.textContent = "1", t3.fClass ? (s3.style.fontFamily = "inherit", s3.setAttribute("class", t3.fClass)) : s3.style.fontFamily = t3.fFamily, e3.appendChild(s3), r2 = s3;
        } else {
          var n3 = new OffscreenCanvas(500, 500).getContext("2d");
          n3.font = a3.style + " " + a3.weight + " 100px " + t3.fFamily, r2 = n3;
        }
        return { measureText: function(t4) {
          return "svg" === i3 ? (r2.textContent = t4, r2.getComputedTextLength()) : r2.measureText(t4).width;
        } };
      }
      function s2(t3) {
        var e3 = 0, r2 = t3.charCodeAt(0);
        if (r2 >= 55296 && r2 <= 56319) {
          var i3 = t3.charCodeAt(1);
          i3 >= 56320 && i3 <= 57343 && (e3 = 1024 * (r2 - 55296) + i3 - 56320 + 65536);
        }
        return e3;
      }
      function n2(t3) {
        var e3 = s2(t3);
        return e3 >= 127462 && e3 <= 127487;
      }
      var o2 = function() {
        this.fonts = [], this.chars = null, this.typekitLoaded = 0, this.isLoaded = false, this._warned = false, this.initTime = Date.now(), this.setIsLoadedBinded = this.setIsLoaded.bind(this), this.checkLoadedFontsBinded = this.checkLoadedFonts.bind(this);
      };
      return o2.isModifier = function(t3, e3) {
        var i3 = t3.toString(16) + e3.toString(16);
        return -1 !== r.indexOf(i3);
      }, o2.isZeroWidthJoiner = function(t3) {
        return 8205 === t3;
      }, o2.isFlagEmoji = function(t3) {
        return n2(t3.substr(0, 2)) && n2(t3.substr(2, 2));
      }, o2.isRegionalCode = n2, o2.isCombinedCharacter = function(t3) {
        return -1 !== e2.indexOf(t3);
      }, o2.isRegionalFlag = function(t3, e3) {
        var r2 = s2(t3.substr(e3, 2));
        if (127988 !== r2) return false;
        var i3 = 0;
        for (e3 += 2; i3 < 5; ) {
          if ((r2 = s2(t3.substr(e3, 2))) < 917601 || r2 > 917626) return false;
          i3 += 1, e3 += 2;
        }
        return 917631 === s2(t3.substr(e3, 2));
      }, o2.isVariationSelector = function(t3) {
        return 65039 === t3;
      }, o2.BLACK_FLAG_CODE_POINT = 127988, o2.prototype = { addChars: function(t3) {
        if (t3) {
          var e3;
          this.chars || (this.chars = []);
          var r2, i3, a3 = t3.length, s3 = this.chars.length;
          for (e3 = 0; e3 < a3; e3 += 1) {
            for (r2 = 0, i3 = false; r2 < s3; ) this.chars[r2].style === t3[e3].style && this.chars[r2].fFamily === t3[e3].fFamily && this.chars[r2].ch === t3[e3].ch && (i3 = true), r2 += 1;
            i3 || (this.chars.push(t3[e3]), s3 += 1);
          }
        }
      }, addFonts: function(t3, e3) {
        if (t3) {
          if (this.chars) return this.isLoaded = true, void (this.fonts = t3.list);
          if (!document.body) return this.isLoaded = true, t3.list.forEach((function(t4) {
            t4.helper = a2(t4), t4.cache = {};
          })), void (this.fonts = t3.list);
          var r2, s3 = t3.list, n3 = s3.length, o3 = n3;
          for (r2 = 0; r2 < n3; r2 += 1) {
            var h2, l2, p2 = true;
            if (s3[r2].loaded = false, s3[r2].monoCase = i2(s3[r2].fFamily, "monospace"), s3[r2].sansCase = i2(s3[r2].fFamily, "sans-serif"), s3[r2].fPath) {
              if ("p" === s3[r2].fOrigin || 3 === s3[r2].origin) {
                if ((h2 = document.querySelectorAll('style[f-forigin="p"][f-family="' + s3[r2].fFamily + '"], style[f-origin="3"][f-family="' + s3[r2].fFamily + '"]')).length > 0 && (p2 = false), p2) {
                  var f2 = createTag("style");
                  f2.setAttribute("f-forigin", s3[r2].fOrigin), f2.setAttribute("f-origin", s3[r2].origin), f2.setAttribute("f-family", s3[r2].fFamily), f2.type = "text/css", f2.innerText = "@font-face {font-family: " + s3[r2].fFamily + "; font-style: normal; src: url('" + s3[r2].fPath + "');}", e3.appendChild(f2);
                }
              } else if ("g" === s3[r2].fOrigin || 1 === s3[r2].origin) {
                for (h2 = document.querySelectorAll('link[f-forigin="g"], link[f-origin="1"]'), l2 = 0; l2 < h2.length; l2 += 1) -1 !== h2[l2].href.indexOf(s3[r2].fPath) && (p2 = false);
                if (p2) {
                  var c2 = createTag("link");
                  c2.setAttribute("f-forigin", s3[r2].fOrigin), c2.setAttribute("f-origin", s3[r2].origin), c2.type = "text/css", c2.rel = "stylesheet", c2.href = s3[r2].fPath, document.body.appendChild(c2);
                }
              } else if ("t" === s3[r2].fOrigin || 2 === s3[r2].origin) {
                for (h2 = document.querySelectorAll('script[f-forigin="t"], script[f-origin="2"]'), l2 = 0; l2 < h2.length; l2 += 1) s3[r2].fPath === h2[l2].src && (p2 = false);
                if (p2) {
                  var m2 = createTag("link");
                  m2.setAttribute("f-forigin", s3[r2].fOrigin), m2.setAttribute("f-origin", s3[r2].origin), m2.setAttribute("rel", "stylesheet"), m2.setAttribute("href", s3[r2].fPath), e3.appendChild(m2);
                }
              }
            } else s3[r2].loaded = true, o3 -= 1;
            s3[r2].helper = a2(s3[r2], e3), s3[r2].cache = {}, this.fonts.push(s3[r2]);
          }
          0 === o3 ? this.isLoaded = true : setTimeout(this.checkLoadedFonts.bind(this), 100);
        } else this.isLoaded = true;
      }, getCharData: function(e3, r2, i3) {
        for (var a3 = 0, s3 = this.chars.length; a3 < s3; ) {
          if (this.chars[a3].ch === e3 && this.chars[a3].style === r2 && this.chars[a3].fFamily === i3) return this.chars[a3];
          a3 += 1;
        }
        return ("string" == typeof e3 && 13 !== e3.charCodeAt(0) || !e3) && console && console.warn && !this._warned && (this._warned = true), t2;
      }, getFontByName: function(t3) {
        for (var e3 = 0, r2 = this.fonts.length; e3 < r2; ) {
          if (this.fonts[e3].fName === t3) return this.fonts[e3];
          e3 += 1;
        }
        return this.fonts[0];
      }, measureText: function(t3, e3, r2) {
        var i3 = this.getFontByName(e3), a3 = t3;
        if (!i3.cache[a3]) {
          var s3 = i3.helper;
          if (" " === t3) {
            var n3 = s3.measureText("|" + t3 + "|"), o3 = s3.measureText("||");
            i3.cache[a3] = (n3 - o3) / 100;
          } else i3.cache[a3] = s3.measureText(t3) / 100;
        }
        return i3.cache[a3] * r2;
      }, checkLoadedFonts: function() {
        var t3, e3, r2, i3 = this.fonts.length, a3 = i3;
        for (t3 = 0; t3 < i3; t3 += 1) this.fonts[t3].loaded ? a3 -= 1 : "n" === this.fonts[t3].fOrigin || 0 === this.fonts[t3].origin ? this.fonts[t3].loaded = true : (e3 = this.fonts[t3].monoCase.node, r2 = this.fonts[t3].monoCase.w, e3.offsetWidth !== r2 ? (a3 -= 1, this.fonts[t3].loaded = true) : (e3 = this.fonts[t3].sansCase.node, r2 = this.fonts[t3].sansCase.w, e3.offsetWidth !== r2 && (a3 -= 1, this.fonts[t3].loaded = true)), this.fonts[t3].loaded && (this.fonts[t3].sansCase.parent.parentNode.removeChild(this.fonts[t3].sansCase.parent), this.fonts[t3].monoCase.parent.parentNode.removeChild(this.fonts[t3].monoCase.parent)));
        0 !== a3 && Date.now() - this.initTime < 5e3 ? setTimeout(this.checkLoadedFontsBinded, 20) : setTimeout(this.setIsLoadedBinded, 10);
      }, setIsLoaded: function() {
        this.isLoaded = true;
      } }, o2;
    })();
    function SlotManager(t2) {
      this.animationData = t2;
    }
    function slotFactory(t2) {
      return new SlotManager(t2);
    }
    function RenderableElement() {
    }
    SlotManager.prototype.getProp = function(t2) {
      return this.animationData.slots && this.animationData.slots[t2.sid] ? Object.assign(t2, this.animationData.slots[t2.sid].p) : t2;
    }, RenderableElement.prototype = { initRenderable: function() {
      this.isInRange = false, this.hidden = false, this.isTransparent = false, this.renderableComponents = [];
    }, addRenderableComponent: function(t2) {
      -1 === this.renderableComponents.indexOf(t2) && this.renderableComponents.push(t2);
    }, removeRenderableComponent: function(t2) {
      -1 !== this.renderableComponents.indexOf(t2) && this.renderableComponents.splice(this.renderableComponents.indexOf(t2), 1);
    }, prepareRenderableFrame: function(t2) {
      this.checkLayerLimits(t2);
    }, checkTransparency: function() {
      this.finalTransform.mProp.o.v <= 0 ? !this.isTransparent && this.globalData.renderConfig.hideOnTransparent && (this.isTransparent = true, this.hide()) : this.isTransparent && (this.isTransparent = false, this.show());
    }, checkLayerLimits: function(t2) {
      this.data.ip - this.data.st <= t2 && this.data.op - this.data.st > t2 ? true !== this.isInRange && (this.globalData._mdf = true, this._mdf = true, this.isInRange = true, this.show()) : false !== this.isInRange && (this.globalData._mdf = true, this.isInRange = false, this.hide());
    }, renderRenderable: function() {
      var t2, e2 = this.renderableComponents.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.renderableComponents[t2].renderFrame(this._isFirstFrame);
    }, sourceRectAtTime: function() {
      return { top: 0, left: 0, width: 100, height: 100 };
    }, getLayerSize: function() {
      return 5 === this.data.ty ? { w: this.data.textData.width, h: this.data.textData.height } : { w: this.data.width, h: this.data.height };
    } };
    var getBlendMode = (blendModeEnums = { 0: "source-over", 1: "multiply", 2: "screen", 3: "overlay", 4: "darken", 5: "lighten", 6: "color-dodge", 7: "color-burn", 8: "hard-light", 9: "soft-light", 10: "difference", 11: "exclusion", 12: "hue", 13: "saturation", 14: "color", 15: "luminosity" }, function(t2) {
      return blendModeEnums[t2] || "";
    }), blendModeEnums;
    function SliderEffect(t2, e2, r) {
      this.p = PropertyFactory.getProp(e2, t2.v, 0, 0, r);
    }
    function AngleEffect(t2, e2, r) {
      this.p = PropertyFactory.getProp(e2, t2.v, 0, 0, r);
    }
    function ColorEffect(t2, e2, r) {
      this.p = PropertyFactory.getProp(e2, t2.v, 1, 0, r);
    }
    function PointEffect(t2, e2, r) {
      this.p = PropertyFactory.getProp(e2, t2.v, 1, 0, r);
    }
    function LayerIndexEffect(t2, e2, r) {
      this.p = PropertyFactory.getProp(e2, t2.v, 0, 0, r);
    }
    function MaskIndexEffect(t2, e2, r) {
      this.p = PropertyFactory.getProp(e2, t2.v, 0, 0, r);
    }
    function CheckboxEffect(t2, e2, r) {
      this.p = PropertyFactory.getProp(e2, t2.v, 0, 0, r);
    }
    function NoValueEffect() {
      this.p = {};
    }
    function EffectsManager(t2, e2) {
      var r, i2 = t2.ef || [];
      this.effectElements = [];
      var a2, s2 = i2.length;
      for (r = 0; r < s2; r += 1) a2 = new GroupEffect(i2[r], e2), this.effectElements.push(a2);
    }
    function GroupEffect(t2, e2) {
      this.init(t2, e2);
    }
    function BaseElement() {
    }
    function FrameElement() {
    }
    function FootageElement(t2, e2, r) {
      this.initFrame(), this.initRenderable(), this.assetData = e2.getAssetData(t2.refId), this.footageData = e2.imageLoader.getAsset(this.assetData), this.initBaseData(t2, e2, r);
    }
    function AudioElement(t2, e2, r) {
      this.initFrame(), this.initRenderable(), this.assetData = e2.getAssetData(t2.refId), this.initBaseData(t2, e2, r), this._isPlaying = false, this._canPlay = false;
      var i2 = this.globalData.getAssetsPath(this.assetData);
      this.audio = this.globalData.audioController.createAudio(i2), this._currentTime = 0, this.globalData.audioController.addAudio(this), this._volumeMultiplier = 1, this._volume = 1, this._previousVolume = null, this.tm = t2.tm ? PropertyFactory.getProp(this, t2.tm, 0, e2.frameRate, this) : { _placeholder: true }, this.lv = PropertyFactory.getProp(this, t2.au && t2.au.lv ? t2.au.lv : { k: [100] }, 1, 0.01, this);
    }
    function BaseRenderer() {
    }
    extendPrototype([DynamicPropertyContainer], GroupEffect), GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties, GroupEffect.prototype.init = function(t2, e2) {
      var r;
      this.data = t2, this.effectElements = [], this.initDynamicPropertyContainer(e2);
      var i2, a2 = this.data.ef.length, s2 = this.data.ef;
      for (r = 0; r < a2; r += 1) {
        switch (i2 = null, s2[r].ty) {
          case 0:
            i2 = new SliderEffect(s2[r], e2, this);
            break;
          case 1:
            i2 = new AngleEffect(s2[r], e2, this);
            break;
          case 2:
            i2 = new ColorEffect(s2[r], e2, this);
            break;
          case 3:
            i2 = new PointEffect(s2[r], e2, this);
            break;
          case 4:
          case 7:
            i2 = new CheckboxEffect(s2[r], e2, this);
            break;
          case 10:
            i2 = new LayerIndexEffect(s2[r], e2, this);
            break;
          case 11:
            i2 = new MaskIndexEffect(s2[r], e2, this);
            break;
          case 5:
            i2 = new EffectsManager(s2[r], e2);
            break;
          default:
            i2 = new NoValueEffect(s2[r]);
        }
        i2 && this.effectElements.push(i2);
      }
    }, BaseElement.prototype = { checkMasks: function() {
      if (!this.data.hasMask) return false;
      for (var t2 = 0, e2 = this.data.masksProperties.length; t2 < e2; ) {
        if ("n" !== this.data.masksProperties[t2].mode && false !== this.data.masksProperties[t2].cl) return true;
        t2 += 1;
      }
      return false;
    }, initExpressions: function() {
      var t2 = getExpressionInterfaces();
      if (t2) {
        var e2 = t2("layer"), r = t2("effects"), i2 = t2("shape"), a2 = t2("text"), s2 = t2("comp");
        this.layerInterface = e2(this), this.data.hasMask && this.maskManager && this.layerInterface.registerMaskInterface(this.maskManager);
        var n2 = r.createEffectsInterface(this, this.layerInterface);
        this.layerInterface.registerEffectsInterface(n2), 0 === this.data.ty || this.data.xt ? this.compInterface = s2(this) : 4 === this.data.ty ? (this.layerInterface.shapeInterface = i2(this.shapesData, this.itemsData, this.layerInterface), this.layerInterface.content = this.layerInterface.shapeInterface) : 5 === this.data.ty && (this.layerInterface.textInterface = a2(this), this.layerInterface.text = this.layerInterface.textInterface);
      }
    }, setBlendMode: function() {
      var t2 = getBlendMode(this.data.bm);
      (this.baseElement || this.layerElement).style["mix-blend-mode"] = t2;
    }, initBaseData: function(t2, e2, r) {
      this.globalData = e2, this.comp = r, this.data = t2, this.layerId = createElementID(), this.data.sr || (this.data.sr = 1), this.effectsManager = new EffectsManager(this.data, this, this.dynamicProperties);
    }, getType: function() {
      return this.type;
    }, sourceRectAtTime: function() {
    } }, FrameElement.prototype = { initFrame: function() {
      this._isFirstFrame = false, this.dynamicProperties = [], this._mdf = false;
    }, prepareProperties: function(t2, e2) {
      var r, i2 = this.dynamicProperties.length;
      for (r = 0; r < i2; r += 1) (e2 || this._isParent && "transform" === this.dynamicProperties[r].propType) && (this.dynamicProperties[r].getValue(), this.dynamicProperties[r]._mdf && (this.globalData._mdf = true, this._mdf = true));
    }, addDynamicProperty: function(t2) {
      -1 === this.dynamicProperties.indexOf(t2) && this.dynamicProperties.push(t2);
    } }, FootageElement.prototype.prepareFrame = function() {
    }, extendPrototype([RenderableElement, BaseElement, FrameElement], FootageElement), FootageElement.prototype.getBaseElement = function() {
      return null;
    }, FootageElement.prototype.renderFrame = function() {
    }, FootageElement.prototype.destroy = function() {
    }, FootageElement.prototype.initExpressions = function() {
      var t2 = getExpressionInterfaces();
      if (t2) {
        var e2 = t2("footage");
        this.layerInterface = e2(this);
      }
    }, FootageElement.prototype.getFootageData = function() {
      return this.footageData;
    }, AudioElement.prototype.prepareFrame = function(t2) {
      if (this.prepareRenderableFrame(t2, true), this.prepareProperties(t2, true), this.tm._placeholder) this._currentTime = t2 / this.data.sr;
      else {
        var e2 = this.tm.v;
        this._currentTime = e2;
      }
      this._volume = this.lv.v[0];
      var r = this._volume * this._volumeMultiplier;
      this._previousVolume !== r && (this._previousVolume = r, this.audio.volume(r));
    }, extendPrototype([RenderableElement, BaseElement, FrameElement], AudioElement), AudioElement.prototype.renderFrame = function() {
      this.isInRange && this._canPlay && (this._isPlaying ? (!this.audio.playing() || Math.abs(this._currentTime / this.globalData.frameRate - this.audio.seek()) > 0.1) && this.audio.seek(this._currentTime / this.globalData.frameRate) : (this.audio.play(), this.audio.seek(this._currentTime / this.globalData.frameRate), this._isPlaying = true));
    }, AudioElement.prototype.show = function() {
    }, AudioElement.prototype.hide = function() {
      this.audio.pause(), this._isPlaying = false;
    }, AudioElement.prototype.pause = function() {
      this.audio.pause(), this._isPlaying = false, this._canPlay = false;
    }, AudioElement.prototype.resume = function() {
      this._canPlay = true;
    }, AudioElement.prototype.setRate = function(t2) {
      this.audio.rate(t2);
    }, AudioElement.prototype.volume = function(t2) {
      this._volumeMultiplier = t2, this._previousVolume = t2 * this._volume, this.audio.volume(this._previousVolume);
    }, AudioElement.prototype.getBaseElement = function() {
      return null;
    }, AudioElement.prototype.destroy = function() {
    }, AudioElement.prototype.sourceRectAtTime = function() {
    }, AudioElement.prototype.initExpressions = function() {
    }, BaseRenderer.prototype.checkLayers = function(t2) {
      var e2, r, i2 = this.layers.length;
      for (this.completeLayers = true, e2 = i2 - 1; e2 >= 0; e2 -= 1) this.elements[e2] || (r = this.layers[e2]).ip - r.st <= t2 - this.layers[e2].st && r.op - r.st > t2 - this.layers[e2].st && this.buildItem(e2), this.completeLayers = !!this.elements[e2] && this.completeLayers;
      this.checkPendingElements();
    }, BaseRenderer.prototype.createItem = function(t2) {
      switch (t2.ty) {
        case 2:
          return this.createImage(t2);
        case 0:
          return this.createComp(t2);
        case 1:
          return this.createSolid(t2);
        case 3:
          return this.createNull(t2);
        case 4:
          return this.createShape(t2);
        case 5:
          return this.createText(t2);
        case 6:
          return this.createAudio(t2);
        case 13:
          return this.createCamera(t2);
        case 15:
          return this.createFootage(t2);
        default:
          return this.createNull(t2);
      }
    }, BaseRenderer.prototype.createCamera = function() {
      throw new Error("You're using a 3d camera. Try the html renderer.");
    }, BaseRenderer.prototype.createAudio = function(t2) {
      return new AudioElement(t2, this.globalData, this);
    }, BaseRenderer.prototype.createFootage = function(t2) {
      return new FootageElement(t2, this.globalData, this);
    }, BaseRenderer.prototype.buildAllItems = function() {
      var t2, e2 = this.layers.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.buildItem(t2);
      this.checkPendingElements();
    }, BaseRenderer.prototype.includeLayers = function(t2) {
      var e2;
      this.completeLayers = false;
      var r, i2 = t2.length, a2 = this.layers.length;
      for (e2 = 0; e2 < i2; e2 += 1) for (r = 0; r < a2; ) {
        if (this.layers[r].id === t2[e2].id) {
          this.layers[r] = t2[e2];
          break;
        }
        r += 1;
      }
    }, BaseRenderer.prototype.setProjectInterface = function(t2) {
      this.globalData.projectInterface = t2;
    }, BaseRenderer.prototype.initItems = function() {
      this.globalData.progressiveLoad || this.buildAllItems();
    }, BaseRenderer.prototype.buildElementParenting = function(t2, e2, r) {
      for (var i2 = this.elements, a2 = this.layers, s2 = 0, n2 = a2.length; s2 < n2; ) a2[s2].ind == e2 && (i2[s2] && true !== i2[s2] ? (r.push(i2[s2]), i2[s2].setAsParent(), void 0 !== a2[s2].parent ? this.buildElementParenting(t2, a2[s2].parent, r) : t2.setHierarchy(r)) : (this.buildItem(s2), this.addPendingElement(t2))), s2 += 1;
    }, BaseRenderer.prototype.addPendingElement = function(t2) {
      this.pendingElements.push(t2);
    }, BaseRenderer.prototype.searchExtraCompositions = function(t2) {
      var e2, r = t2.length;
      for (e2 = 0; e2 < r; e2 += 1) if (t2[e2].xt) {
        var i2 = this.createComp(t2[e2]);
        i2.initExpressions(), this.globalData.projectInterface.registerComposition(i2);
      }
    }, BaseRenderer.prototype.getElementById = function(t2) {
      var e2, r = this.elements.length;
      for (e2 = 0; e2 < r; e2 += 1) if (this.elements[e2].data.ind === t2) return this.elements[e2];
      return null;
    }, BaseRenderer.prototype.getElementByPath = function(t2) {
      var e2, r = t2.shift();
      if ("number" == typeof r) e2 = this.elements[r];
      else {
        var i2, a2 = this.elements.length;
        for (i2 = 0; i2 < a2; i2 += 1) if (this.elements[i2].data.nm === r) {
          e2 = this.elements[i2];
          break;
        }
      }
      return 0 === t2.length ? e2 : e2.getElementByPath(t2);
    }, BaseRenderer.prototype.setupGlobalData = function(t2, e2) {
      this.globalData.fontManager = new FontManager(), this.globalData.slotManager = slotFactory(t2), this.globalData.fontManager.addChars(t2.chars), this.globalData.fontManager.addFonts(t2.fonts, e2), this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem), this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem), this.globalData.imageLoader = this.animationItem.imagePreloader, this.globalData.audioController = this.animationItem.audioController, this.globalData.frameId = 0, this.globalData.frameRate = t2.fr, this.globalData.nm = t2.nm, this.globalData.compSize = { w: t2.w, h: t2.h };
    };
    var effectTypes = { TRANSFORM_EFFECT: "transformEFfect" };
    function TransformElement() {
    }
    function MaskElement(t2, e2, r) {
      this.data = t2, this.element = e2, this.globalData = r, this.storedData = [], this.masksProperties = this.data.masksProperties || [], this.maskElement = null;
      var i2, a2, s2 = this.globalData.defs, n2 = this.masksProperties ? this.masksProperties.length : 0;
      this.viewData = createSizedArray(n2), this.solidPath = "";
      var o2, h2, l2, p2, f2, c2, m2 = this.masksProperties, d2 = 0, u2 = [], y = createElementID(), g2 = "clipPath", v2 = "clip-path";
      for (i2 = 0; i2 < n2; i2 += 1) if (("a" !== m2[i2].mode && "n" !== m2[i2].mode || m2[i2].inv || 100 !== m2[i2].o.k || m2[i2].o.x) && (g2 = "mask", v2 = "mask"), "s" !== m2[i2].mode && "i" !== m2[i2].mode || 0 !== d2 ? l2 = null : ((l2 = createNS("rect")).setAttribute("fill", "#ffffff"), l2.setAttribute("width", this.element.comp.data.w || 0), l2.setAttribute("height", this.element.comp.data.h || 0), u2.push(l2)), a2 = createNS("path"), "n" === m2[i2].mode) this.viewData[i2] = { op: PropertyFactory.getProp(this.element, m2[i2].o, 0, 0.01, this.element), prop: ShapePropertyFactory.getShapeProp(this.element, m2[i2], 3), elem: a2, lastPath: "" }, s2.appendChild(a2);
      else {
        var b;
        if (d2 += 1, a2.setAttribute("fill", "s" === m2[i2].mode ? "#000000" : "#ffffff"), a2.setAttribute("clip-rule", "nonzero"), 0 !== m2[i2].x.k ? (g2 = "mask", v2 = "mask", c2 = PropertyFactory.getProp(this.element, m2[i2].x, 0, null, this.element), b = createElementID(), (p2 = createNS("filter")).setAttribute("id", b), (f2 = createNS("feMorphology")).setAttribute("operator", "erode"), f2.setAttribute("in", "SourceGraphic"), f2.setAttribute("radius", "0"), p2.appendChild(f2), s2.appendChild(p2), a2.setAttribute("stroke", "s" === m2[i2].mode ? "#000000" : "#ffffff")) : (f2 = null, c2 = null), this.storedData[i2] = { elem: a2, x: c2, expan: f2, lastPath: "", lastOperator: "", filterId: b, lastRadius: 0 }, "i" === m2[i2].mode) {
          h2 = u2.length;
          var x = createNS("g");
          for (o2 = 0; o2 < h2; o2 += 1) x.appendChild(u2[o2]);
          var E2 = createNS("mask");
          E2.setAttribute("mask-type", "alpha"), E2.setAttribute("id", y + "_" + d2), E2.appendChild(a2), s2.appendChild(E2), x.setAttribute("mask", "url(" + getLocationHref() + "#" + y + "_" + d2 + ")"), u2.length = 0, u2.push(x);
        } else u2.push(a2);
        m2[i2].inv && !this.solidPath && (this.solidPath = this.createLayerSolidPath()), this.viewData[i2] = { elem: a2, lastPath: "", op: PropertyFactory.getProp(this.element, m2[i2].o, 0, 0.01, this.element), prop: ShapePropertyFactory.getShapeProp(this.element, m2[i2], 3), invRect: l2 }, this.viewData[i2].prop.k || this.drawPath(m2[i2], this.viewData[i2].prop.v, this.viewData[i2]);
      }
      for (this.maskElement = createNS(g2), n2 = u2.length, i2 = 0; i2 < n2; i2 += 1) this.maskElement.appendChild(u2[i2]);
      d2 > 0 && (this.maskElement.setAttribute("id", y), this.element.maskedElement.setAttribute(v2, "url(" + getLocationHref() + "#" + y + ")"), s2.appendChild(this.maskElement)), this.viewData.length && this.element.addRenderableComponent(this);
    }
    TransformElement.prototype = { initTransform: function() {
      var t2 = new Matrix();
      this.finalTransform = { mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this, this.data.ks, this) : { o: 0 }, _matMdf: false, _localMatMdf: false, _opMdf: false, mat: t2, localMat: t2, localOpacity: 1 }, this.data.ao && (this.finalTransform.mProp.autoOriented = true), this.data.ty;
    }, renderTransform: function() {
      if (this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this._isFirstFrame, this.finalTransform._matMdf = this.finalTransform.mProp._mdf || this._isFirstFrame, this.hierarchy) {
        var t2, e2 = this.finalTransform.mat, r = 0, i2 = this.hierarchy.length;
        if (!this.finalTransform._matMdf) for (; r < i2; ) {
          if (this.hierarchy[r].finalTransform.mProp._mdf) {
            this.finalTransform._matMdf = true;
            break;
          }
          r += 1;
        }
        if (this.finalTransform._matMdf) for (t2 = this.finalTransform.mProp.v.props, e2.cloneFromProps(t2), r = 0; r < i2; r += 1) e2.multiply(this.hierarchy[r].finalTransform.mProp.v);
      }
      this.finalTransform._matMdf && (this.finalTransform._localMatMdf = this.finalTransform._matMdf), this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v);
    }, renderLocalTransform: function() {
      if (this.localTransforms) {
        var t2 = 0, e2 = this.localTransforms.length;
        if (this.finalTransform._localMatMdf = this.finalTransform._matMdf, !this.finalTransform._localMatMdf || !this.finalTransform._opMdf) for (; t2 < e2; ) this.localTransforms[t2]._mdf && (this.finalTransform._localMatMdf = true), this.localTransforms[t2]._opMdf && !this.finalTransform._opMdf && (this.finalTransform.localOpacity = this.finalTransform.mProp.o.v, this.finalTransform._opMdf = true), t2 += 1;
        if (this.finalTransform._localMatMdf) {
          var r = this.finalTransform.localMat;
          for (this.localTransforms[0].matrix.clone(r), t2 = 1; t2 < e2; t2 += 1) {
            var i2 = this.localTransforms[t2].matrix;
            r.multiply(i2);
          }
          r.multiply(this.finalTransform.mat);
        }
        if (this.finalTransform._opMdf) {
          var a2 = this.finalTransform.localOpacity;
          for (t2 = 0; t2 < e2; t2 += 1) a2 *= 0.01 * this.localTransforms[t2].opacity;
          this.finalTransform.localOpacity = a2;
        }
      }
    }, searchEffectTransforms: function() {
      if (this.renderableEffectsManager) {
        var t2 = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
        if (t2.length) {
          this.localTransforms = [], this.finalTransform.localMat = new Matrix();
          var e2 = 0, r = t2.length;
          for (e2 = 0; e2 < r; e2 += 1) this.localTransforms.push(t2[e2]);
        }
      }
    }, globalToLocal: function(t2) {
      var e2 = [];
      e2.push(this.finalTransform);
      for (var r, i2 = true, a2 = this.comp; i2; ) a2.finalTransform ? (a2.data.hasMask && e2.splice(0, 0, a2.finalTransform), a2 = a2.comp) : i2 = false;
      var s2, n2 = e2.length;
      for (r = 0; r < n2; r += 1) s2 = e2[r].mat.applyToPointArray(0, 0, 0), t2 = [t2[0] - s2[0], t2[1] - s2[1], 0];
      return t2;
    }, mHelper: new Matrix() }, MaskElement.prototype.getMaskProperty = function(t2) {
      return this.viewData[t2].prop;
    }, MaskElement.prototype.renderFrame = function(t2) {
      var e2, r = this.element.finalTransform.mat, i2 = this.masksProperties.length;
      for (e2 = 0; e2 < i2; e2 += 1) if ((this.viewData[e2].prop._mdf || t2) && this.drawPath(this.masksProperties[e2], this.viewData[e2].prop.v, this.viewData[e2]), (this.viewData[e2].op._mdf || t2) && this.viewData[e2].elem.setAttribute("fill-opacity", this.viewData[e2].op.v), "n" !== this.masksProperties[e2].mode && (this.viewData[e2].invRect && (this.element.finalTransform.mProp._mdf || t2) && this.viewData[e2].invRect.setAttribute("transform", r.getInverseMatrix().to2dCSS()), this.storedData[e2].x && (this.storedData[e2].x._mdf || t2))) {
        var a2 = this.storedData[e2].expan;
        this.storedData[e2].x.v < 0 ? ("erode" !== this.storedData[e2].lastOperator && (this.storedData[e2].lastOperator = "erode", this.storedData[e2].elem.setAttribute("filter", "url(" + getLocationHref() + "#" + this.storedData[e2].filterId + ")")), a2.setAttribute("radius", -this.storedData[e2].x.v)) : ("dilate" !== this.storedData[e2].lastOperator && (this.storedData[e2].lastOperator = "dilate", this.storedData[e2].elem.setAttribute("filter", null)), this.storedData[e2].elem.setAttribute("stroke-width", 2 * this.storedData[e2].x.v));
      }
    }, MaskElement.prototype.getMaskelement = function() {
      return this.maskElement;
    }, MaskElement.prototype.createLayerSolidPath = function() {
      var t2 = "M0,0 ";
      return t2 += " h" + this.globalData.compSize.w, t2 += " v" + this.globalData.compSize.h, t2 += " h-" + this.globalData.compSize.w, t2 += " v-" + this.globalData.compSize.h + " ";
    }, MaskElement.prototype.drawPath = function(t2, e2, r) {
      var i2, a2, s2 = " M" + e2.v[0][0] + "," + e2.v[0][1];
      for (a2 = e2._length, i2 = 1; i2 < a2; i2 += 1) s2 += " C" + e2.o[i2 - 1][0] + "," + e2.o[i2 - 1][1] + " " + e2.i[i2][0] + "," + e2.i[i2][1] + " " + e2.v[i2][0] + "," + e2.v[i2][1];
      if (e2.c && a2 > 1 && (s2 += " C" + e2.o[i2 - 1][0] + "," + e2.o[i2 - 1][1] + " " + e2.i[0][0] + "," + e2.i[0][1] + " " + e2.v[0][0] + "," + e2.v[0][1]), r.lastPath !== s2) {
        var n2 = "";
        r.elem && (e2.c && (n2 = t2.inv ? this.solidPath + s2 : s2), r.elem.setAttribute("d", n2)), r.lastPath = s2;
      }
    }, MaskElement.prototype.destroy = function() {
      this.element = null, this.globalData = null, this.maskElement = null, this.data = null, this.masksProperties = null;
    };
    var filtersFactory = (function() {
      var t2 = {};
      return t2.createFilter = function(t3, e2) {
        var r = createNS("filter");
        r.setAttribute("id", t3), true !== e2 && (r.setAttribute("filterUnits", "objectBoundingBox"), r.setAttribute("x", "0%"), r.setAttribute("y", "0%"), r.setAttribute("width", "100%"), r.setAttribute("height", "100%"));
        return r;
      }, t2.createAlphaToLuminanceFilter = function() {
        var t3 = createNS("feColorMatrix");
        return t3.setAttribute("type", "matrix"), t3.setAttribute("color-interpolation-filters", "sRGB"), t3.setAttribute("values", "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1"), t3;
      }, t2;
    })(), featureSupport = (function() {
      var t2 = { maskType: true, svgLumaHidden: true, offscreenCanvas: "undefined" != typeof OffscreenCanvas };
      return (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) && (t2.maskType = false), /firefox/i.test(navigator.userAgent) && (t2.svgLumaHidden = false), t2;
    })(), registeredEffects$1 = {}, idPrefix = "filter_result_";
    function SVGEffects(t2) {
      var e2, r, i2 = "SourceGraphic", a2 = t2.data.ef ? t2.data.ef.length : 0, s2 = createElementID(), n2 = filtersFactory.createFilter(s2, true), o2 = 0;
      for (this.filters = [], e2 = 0; e2 < a2; e2 += 1) {
        r = null;
        var h2 = t2.data.ef[e2].ty;
        if (registeredEffects$1[h2]) r = new registeredEffects$1[h2].effect(n2, t2.effectsManager.effectElements[e2], t2, idPrefix + o2, i2), i2 = idPrefix + o2, registeredEffects$1[h2].countsAsEffect && (o2 += 1);
        r && this.filters.push(r);
      }
      o2 && (t2.globalData.defs.appendChild(n2), t2.layerElement.setAttribute("filter", "url(" + getLocationHref() + "#" + s2 + ")")), this.filters.length && t2.addRenderableComponent(this);
    }
    function registerEffect$1(t2, e2, r) {
      registeredEffects$1[t2] = { effect: e2, countsAsEffect: r };
    }
    function SVGBaseElement() {
    }
    function HierarchyElement() {
    }
    function RenderableDOMElement() {
    }
    function IImageElement(t2, e2, r) {
      this.assetData = e2.getAssetData(t2.refId), this.assetData && this.assetData.sid && (this.assetData = e2.slotManager.getProp(this.assetData)), this.initElement(t2, e2, r), this.sourceRect = { top: 0, left: 0, width: this.assetData.w, height: this.assetData.h };
    }
    function ProcessedElement(t2, e2) {
      this.elem = t2, this.pos = e2;
    }
    function IShapeElement() {
    }
    SVGEffects.prototype.renderFrame = function(t2) {
      var e2, r = this.filters.length;
      for (e2 = 0; e2 < r; e2 += 1) this.filters[e2].renderFrame(t2);
    }, SVGEffects.prototype.getEffects = function(t2) {
      var e2, r = this.filters.length, i2 = [];
      for (e2 = 0; e2 < r; e2 += 1) this.filters[e2].type === t2 && i2.push(this.filters[e2]);
      return i2;
    }, SVGBaseElement.prototype = { initRendererElement: function() {
      this.layerElement = createNS("g");
    }, createContainerElements: function() {
      this.matteElement = createNS("g"), this.transformedElement = this.layerElement, this.maskedElement = this.layerElement, this._sizeChanged = false;
      var t2 = null;
      if (this.data.td) {
        this.matteMasks = {};
        var e2 = createNS("g");
        e2.setAttribute("id", this.layerId), e2.appendChild(this.layerElement), t2 = e2, this.globalData.defs.appendChild(e2);
      } else this.data.tt ? (this.matteElement.appendChild(this.layerElement), t2 = this.matteElement, this.baseElement = this.matteElement) : this.baseElement = this.layerElement;
      if (this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data.cl && this.layerElement.setAttribute("class", this.data.cl), 0 === this.data.ty && !this.data.hd) {
        var r = createNS("clipPath"), i2 = createNS("path");
        i2.setAttribute("d", "M0,0 L" + this.data.w + ",0 L" + this.data.w + "," + this.data.h + " L0," + this.data.h + "z");
        var a2 = createElementID();
        if (r.setAttribute("id", a2), r.appendChild(i2), this.globalData.defs.appendChild(r), this.checkMasks()) {
          var s2 = createNS("g");
          s2.setAttribute("clip-path", "url(" + getLocationHref() + "#" + a2 + ")"), s2.appendChild(this.layerElement), this.transformedElement = s2, t2 ? t2.appendChild(this.transformedElement) : this.baseElement = this.transformedElement;
        } else this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + a2 + ")");
      }
      0 !== this.data.bm && this.setBlendMode();
    }, renderElement: function() {
      this.finalTransform._localMatMdf && this.transformedElement.setAttribute("transform", this.finalTransform.localMat.to2dCSS()), this.finalTransform._opMdf && this.transformedElement.setAttribute("opacity", this.finalTransform.localOpacity);
    }, destroyBaseElement: function() {
      this.layerElement = null, this.matteElement = null, this.maskManager.destroy();
    }, getBaseElement: function() {
      return this.data.hd ? null : this.baseElement;
    }, createRenderableComponents: function() {
      this.maskManager = new MaskElement(this.data, this, this.globalData), this.renderableEffectsManager = new SVGEffects(this), this.searchEffectTransforms();
    }, getMatte: function(t2) {
      if (this.matteMasks || (this.matteMasks = {}), !this.matteMasks[t2]) {
        var e2, r, i2, a2, s2 = this.layerId + "_" + t2;
        if (1 === t2 || 3 === t2) {
          var n2 = createNS("mask");
          n2.setAttribute("id", s2), n2.setAttribute("mask-type", 3 === t2 ? "luminance" : "alpha"), (i2 = createNS("use")).setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId), n2.appendChild(i2), this.globalData.defs.appendChild(n2), featureSupport.maskType || 1 !== t2 || (n2.setAttribute("mask-type", "luminance"), e2 = createElementID(), r = filtersFactory.createFilter(e2), this.globalData.defs.appendChild(r), r.appendChild(filtersFactory.createAlphaToLuminanceFilter()), (a2 = createNS("g")).appendChild(i2), n2.appendChild(a2), a2.setAttribute("filter", "url(" + getLocationHref() + "#" + e2 + ")"));
        } else if (2 === t2) {
          var o2 = createNS("mask");
          o2.setAttribute("id", s2), o2.setAttribute("mask-type", "alpha");
          var h2 = createNS("g");
          o2.appendChild(h2), e2 = createElementID(), r = filtersFactory.createFilter(e2);
          var l2 = createNS("feComponentTransfer");
          l2.setAttribute("in", "SourceGraphic"), r.appendChild(l2);
          var p2 = createNS("feFuncA");
          p2.setAttribute("type", "table"), p2.setAttribute("tableValues", "1.0 0.0"), l2.appendChild(p2), this.globalData.defs.appendChild(r);
          var f2 = createNS("rect");
          f2.setAttribute("width", this.comp.data.w), f2.setAttribute("height", this.comp.data.h), f2.setAttribute("x", "0"), f2.setAttribute("y", "0"), f2.setAttribute("fill", "#ffffff"), f2.setAttribute("opacity", "0"), h2.setAttribute("filter", "url(" + getLocationHref() + "#" + e2 + ")"), h2.appendChild(f2), (i2 = createNS("use")).setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + this.layerId), h2.appendChild(i2), featureSupport.maskType || (o2.setAttribute("mask-type", "luminance"), r.appendChild(filtersFactory.createAlphaToLuminanceFilter()), a2 = createNS("g"), h2.appendChild(f2), a2.appendChild(this.layerElement), h2.appendChild(a2)), this.globalData.defs.appendChild(o2);
        }
        this.matteMasks[t2] = s2;
      }
      return this.matteMasks[t2];
    }, setMatte: function(t2) {
      this.matteElement && this.matteElement.setAttribute("mask", "url(" + getLocationHref() + "#" + t2 + ")");
    } }, HierarchyElement.prototype = { initHierarchy: function() {
      this.hierarchy = [], this._isParent = false, this.checkParenting();
    }, setHierarchy: function(t2) {
      this.hierarchy = t2;
    }, setAsParent: function() {
      this._isParent = true;
    }, checkParenting: function() {
      void 0 !== this.data.parent && this.comp.buildElementParenting(this, this.data.parent, []);
    } }, extendPrototype([RenderableElement, createProxyFunction({ initElement: function(t2, e2, r) {
      this.initFrame(), this.initBaseData(t2, e2, r), this.initTransform(t2, e2, r), this.initHierarchy(), this.initRenderable(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), this.createContent(), this.hide();
    }, hide: function() {
      this.hidden || this.isInRange && !this.isTransparent || ((this.baseElement || this.layerElement).style.display = "none", this.hidden = true);
    }, show: function() {
      this.isInRange && !this.isTransparent && (this.data.hd || ((this.baseElement || this.layerElement).style.display = "block"), this.hidden = false, this._isFirstFrame = true);
    }, renderFrame: function() {
      this.data.hd || this.hidden || (this.renderTransform(), this.renderRenderable(), this.renderLocalTransform(), this.renderElement(), this.renderInnerContent(), this._isFirstFrame && (this._isFirstFrame = false));
    }, renderInnerContent: function() {
    }, prepareFrame: function(t2) {
      this._mdf = false, this.prepareRenderableFrame(t2), this.prepareProperties(t2, this.isInRange), this.checkTransparency();
    }, destroy: function() {
      this.innerElem = null, this.destroyBaseElement();
    } })], RenderableDOMElement), extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], IImageElement), IImageElement.prototype.createContent = function() {
      var t2 = this.globalData.getAssetsPath(this.assetData);
      this.innerElem = createNS("image"), this.innerElem.setAttribute("width", this.assetData.w + "px"), this.innerElem.setAttribute("height", this.assetData.h + "px"), this.innerElem.setAttribute("preserveAspectRatio", this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio), this.innerElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", t2), this.layerElement.appendChild(this.innerElem);
    }, IImageElement.prototype.sourceRectAtTime = function() {
      return this.sourceRect;
    }, IShapeElement.prototype = { addShapeToModifiers: function(t2) {
      var e2, r = this.shapeModifiers.length;
      for (e2 = 0; e2 < r; e2 += 1) this.shapeModifiers[e2].addShape(t2);
    }, isShapeInAnimatedModifiers: function(t2) {
      for (var e2 = this.shapeModifiers.length; 0 < e2; ) if (this.shapeModifiers[0].isAnimatedWithShape(t2)) return true;
      return false;
    }, renderModifiers: function() {
      if (this.shapeModifiers.length) {
        var t2, e2 = this.shapes.length;
        for (t2 = 0; t2 < e2; t2 += 1) this.shapes[t2].sh.reset();
        for (t2 = (e2 = this.shapeModifiers.length) - 1; t2 >= 0 && !this.shapeModifiers[t2].processShapes(this._isFirstFrame); t2 -= 1) ;
      }
    }, searchProcessedElement: function(t2) {
      for (var e2 = this.processedElements, r = 0, i2 = e2.length; r < i2; ) {
        if (e2[r].elem === t2) return e2[r].pos;
        r += 1;
      }
      return 0;
    }, addProcessedElement: function(t2, e2) {
      for (var r = this.processedElements, i2 = r.length; i2; ) if (r[i2 -= 1].elem === t2) return void (r[i2].pos = e2);
      r.push(new ProcessedElement(t2, e2));
    }, prepareFrame: function(t2) {
      this.prepareRenderableFrame(t2), this.prepareProperties(t2, this.isInRange);
    } };
    var lineCapEnum = { 1: "butt", 2: "round", 3: "square" }, lineJoinEnum = { 1: "miter", 2: "round", 3: "bevel" };
    function SVGShapeData(t2, e2, r) {
      this.caches = [], this.styles = [], this.transformers = t2, this.lStr = "", this.sh = r, this.lvl = e2, this._isAnimated = !!r.k;
      for (var i2 = 0, a2 = t2.length; i2 < a2; ) {
        if (t2[i2].mProps.dynamicProperties.length) {
          this._isAnimated = true;
          break;
        }
        i2 += 1;
      }
    }
    function SVGStyleData(t2, e2) {
      this.data = t2, this.type = t2.ty, this.d = "", this.lvl = e2, this._mdf = false, this.closed = true === t2.hd, this.pElem = createNS("path"), this.msElem = null;
    }
    function DashProperty(t2, e2, r, i2) {
      var a2;
      this.elem = t2, this.frameId = -1, this.dataProps = createSizedArray(e2.length), this.renderer = r, this.k = false, this.dashStr = "", this.dashArray = createTypedArray("float32", e2.length ? e2.length - 1 : 0), this.dashoffset = createTypedArray("float32", 1), this.initDynamicPropertyContainer(i2);
      var s2, n2 = e2.length || 0;
      for (a2 = 0; a2 < n2; a2 += 1) s2 = PropertyFactory.getProp(t2, e2[a2].v, 0, 0, this), this.k = s2.k || this.k, this.dataProps[a2] = { n: e2[a2].n, p: s2 };
      this.k || this.getValue(true), this._isAnimated = this.k;
    }
    function SVGStrokeStyleData(t2, e2, r) {
      this.initDynamicPropertyContainer(t2), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(t2, e2.o, 0, 0.01, this), this.w = PropertyFactory.getProp(t2, e2.w, 0, null, this), this.d = new DashProperty(t2, e2.d || {}, "svg", this), this.c = PropertyFactory.getProp(t2, e2.c, 1, 255, this), this.style = r, this._isAnimated = !!this._isAnimated;
    }
    function SVGFillStyleData(t2, e2, r) {
      this.initDynamicPropertyContainer(t2), this.getValue = this.iterateDynamicProperties, this.o = PropertyFactory.getProp(t2, e2.o, 0, 0.01, this), this.c = PropertyFactory.getProp(t2, e2.c, 1, 255, this), this.style = r;
    }
    function SVGNoStyleData(t2, e2, r) {
      this.initDynamicPropertyContainer(t2), this.getValue = this.iterateDynamicProperties, this.style = r;
    }
    function GradientProperty(t2, e2, r) {
      this.data = e2, this.c = createTypedArray("uint8c", 4 * e2.p);
      var i2 = e2.k.k[0].s ? e2.k.k[0].s.length - 4 * e2.p : e2.k.k.length - 4 * e2.p;
      this.o = createTypedArray("float32", i2), this._cmdf = false, this._omdf = false, this._collapsable = this.checkCollapsable(), this._hasOpacity = i2, this.initDynamicPropertyContainer(r), this.prop = PropertyFactory.getProp(t2, e2.k, 1, null, this), this.k = this.prop.k, this.getValue(true);
    }
    function SVGGradientFillStyleData(t2, e2, r) {
      this.initDynamicPropertyContainer(t2), this.getValue = this.iterateDynamicProperties, this.initGradientData(t2, e2, r);
    }
    function SVGGradientStrokeStyleData(t2, e2, r) {
      this.initDynamicPropertyContainer(t2), this.getValue = this.iterateDynamicProperties, this.w = PropertyFactory.getProp(t2, e2.w, 0, null, this), this.d = new DashProperty(t2, e2.d || {}, "svg", this), this.initGradientData(t2, e2, r), this._isAnimated = !!this._isAnimated;
    }
    function ShapeGroupData() {
      this.it = [], this.prevViewData = [], this.gr = createNS("g");
    }
    function SVGTransformData(t2, e2, r) {
      this.transform = { mProps: t2, op: e2, container: r }, this.elements = [], this._isAnimated = this.transform.mProps.dynamicProperties.length || this.transform.op.effectsSequence.length;
    }
    SVGShapeData.prototype.setAsAnimated = function() {
      this._isAnimated = true;
    }, SVGStyleData.prototype.reset = function() {
      this.d = "", this._mdf = false;
    }, DashProperty.prototype.getValue = function(t2) {
      if ((this.elem.globalData.frameId !== this.frameId || t2) && (this.frameId = this.elem.globalData.frameId, this.iterateDynamicProperties(), this._mdf = this._mdf || t2, this._mdf)) {
        var e2 = 0, r = this.dataProps.length;
        for ("svg" === this.renderer && (this.dashStr = ""), e2 = 0; e2 < r; e2 += 1) "o" !== this.dataProps[e2].n ? "svg" === this.renderer ? this.dashStr += " " + this.dataProps[e2].p.v : this.dashArray[e2] = this.dataProps[e2].p.v : this.dashoffset[0] = this.dataProps[e2].p.v;
      }
    }, extendPrototype([DynamicPropertyContainer], DashProperty), extendPrototype([DynamicPropertyContainer], SVGStrokeStyleData), extendPrototype([DynamicPropertyContainer], SVGFillStyleData), extendPrototype([DynamicPropertyContainer], SVGNoStyleData), GradientProperty.prototype.comparePoints = function(t2, e2) {
      for (var r = 0, i2 = this.o.length / 2; r < i2; ) {
        if (Math.abs(t2[4 * r] - t2[4 * e2 + 2 * r]) > 0.01) return false;
        r += 1;
      }
      return true;
    }, GradientProperty.prototype.checkCollapsable = function() {
      if (this.o.length / 2 != this.c.length / 4) return false;
      if (this.data.k.k[0].s) for (var t2 = 0, e2 = this.data.k.k.length; t2 < e2; ) {
        if (!this.comparePoints(this.data.k.k[t2].s, this.data.p)) return false;
        t2 += 1;
      }
      else if (!this.comparePoints(this.data.k.k, this.data.p)) return false;
      return true;
    }, GradientProperty.prototype.getValue = function(t2) {
      if (this.prop.getValue(), this._mdf = false, this._cmdf = false, this._omdf = false, this.prop._mdf || t2) {
        var e2, r, i2, a2 = 4 * this.data.p;
        for (e2 = 0; e2 < a2; e2 += 1) r = e2 % 4 == 0 ? 100 : 255, i2 = Math.round(this.prop.v[e2] * r), this.c[e2] !== i2 && (this.c[e2] = i2, this._cmdf = !t2);
        if (this.o.length) for (a2 = this.prop.v.length, e2 = 4 * this.data.p; e2 < a2; e2 += 1) r = e2 % 2 == 0 ? 100 : 1, i2 = e2 % 2 == 0 ? Math.round(100 * this.prop.v[e2]) : this.prop.v[e2], this.o[e2 - 4 * this.data.p] !== i2 && (this.o[e2 - 4 * this.data.p] = i2, this._omdf = !t2);
        this._mdf = !t2;
      }
    }, extendPrototype([DynamicPropertyContainer], GradientProperty), SVGGradientFillStyleData.prototype.initGradientData = function(t2, e2, r) {
      this.o = PropertyFactory.getProp(t2, e2.o, 0, 0.01, this), this.s = PropertyFactory.getProp(t2, e2.s, 1, null, this), this.e = PropertyFactory.getProp(t2, e2.e, 1, null, this), this.h = PropertyFactory.getProp(t2, e2.h || { k: 0 }, 0, 0.01, this), this.a = PropertyFactory.getProp(t2, e2.a || { k: 0 }, 0, degToRads, this), this.g = new GradientProperty(t2, e2.g, this), this.style = r, this.stops = [], this.setGradientData(r.pElem, e2), this.setGradientOpacity(e2, r), this._isAnimated = !!this._isAnimated;
    }, SVGGradientFillStyleData.prototype.setGradientData = function(t2, e2) {
      var r = createElementID(), i2 = createNS(1 === e2.t ? "linearGradient" : "radialGradient");
      i2.setAttribute("id", r), i2.setAttribute("spreadMethod", "pad"), i2.setAttribute("gradientUnits", "userSpaceOnUse");
      var a2, s2, n2, o2 = [];
      for (n2 = 4 * e2.g.p, s2 = 0; s2 < n2; s2 += 4) a2 = createNS("stop"), i2.appendChild(a2), o2.push(a2);
      t2.setAttribute("gf" === e2.ty ? "fill" : "stroke", "url(" + getLocationHref() + "#" + r + ")"), this.gf = i2, this.cst = o2;
    }, SVGGradientFillStyleData.prototype.setGradientOpacity = function(t2, e2) {
      if (this.g._hasOpacity && !this.g._collapsable) {
        var r, i2, a2, s2 = createNS("mask"), n2 = createNS("path");
        s2.appendChild(n2);
        var o2 = createElementID(), h2 = createElementID();
        s2.setAttribute("id", h2);
        var l2 = createNS(1 === t2.t ? "linearGradient" : "radialGradient");
        l2.setAttribute("id", o2), l2.setAttribute("spreadMethod", "pad"), l2.setAttribute("gradientUnits", "userSpaceOnUse"), a2 = t2.g.k.k[0].s ? t2.g.k.k[0].s.length : t2.g.k.k.length;
        var p2 = this.stops;
        for (i2 = 4 * t2.g.p; i2 < a2; i2 += 2) (r = createNS("stop")).setAttribute("stop-color", "rgb(255,255,255)"), l2.appendChild(r), p2.push(r);
        n2.setAttribute("gf" === t2.ty ? "fill" : "stroke", "url(" + getLocationHref() + "#" + o2 + ")"), "gs" === t2.ty && (n2.setAttribute("stroke-linecap", lineCapEnum[t2.lc || 2]), n2.setAttribute("stroke-linejoin", lineJoinEnum[t2.lj || 2]), 1 === t2.lj && n2.setAttribute("stroke-miterlimit", t2.ml)), this.of = l2, this.ms = s2, this.ost = p2, this.maskId = h2, e2.msElem = n2;
      }
    }, extendPrototype([DynamicPropertyContainer], SVGGradientFillStyleData), extendPrototype([SVGGradientFillStyleData, DynamicPropertyContainer], SVGGradientStrokeStyleData);
    var buildShapeString = function(t2, e2, r, i2) {
      if (0 === e2) return "";
      var a2, s2 = t2.o, n2 = t2.i, o2 = t2.v, h2 = " M" + i2.applyToPointStringified(o2[0][0], o2[0][1]);
      for (a2 = 1; a2 < e2; a2 += 1) h2 += " C" + i2.applyToPointStringified(s2[a2 - 1][0], s2[a2 - 1][1]) + " " + i2.applyToPointStringified(n2[a2][0], n2[a2][1]) + " " + i2.applyToPointStringified(o2[a2][0], o2[a2][1]);
      return r && e2 && (h2 += " C" + i2.applyToPointStringified(s2[a2 - 1][0], s2[a2 - 1][1]) + " " + i2.applyToPointStringified(n2[0][0], n2[0][1]) + " " + i2.applyToPointStringified(o2[0][0], o2[0][1]), h2 += "z"), h2;
    }, SVGElementsRenderer = (function() {
      var t2 = new Matrix(), e2 = new Matrix();
      function r(t3, e3, r2) {
        (r2 || e3.transform.op._mdf) && e3.transform.container.setAttribute("opacity", e3.transform.op.v), (r2 || e3.transform.mProps._mdf) && e3.transform.container.setAttribute("transform", e3.transform.mProps.v.to2dCSS());
      }
      function i2() {
      }
      function a2(r2, i3, a3) {
        var s3, n3, o3, h3, l2, p2, f2, c2, m2, d2, u2 = i3.styles.length, y = i3.lvl;
        for (p2 = 0; p2 < u2; p2 += 1) {
          if (h3 = i3.sh._mdf || a3, i3.styles[p2].lvl < y) {
            for (c2 = e2.reset(), m2 = y - i3.styles[p2].lvl, d2 = i3.transformers.length - 1; !h3 && m2 > 0; ) h3 = i3.transformers[d2].mProps._mdf || h3, m2 -= 1, d2 -= 1;
            if (h3) for (m2 = y - i3.styles[p2].lvl, d2 = i3.transformers.length - 1; m2 > 0; ) c2.multiply(i3.transformers[d2].mProps.v), m2 -= 1, d2 -= 1;
          } else c2 = t2;
          if (n3 = (f2 = i3.sh.paths)._length, h3) {
            for (o3 = "", s3 = 0; s3 < n3; s3 += 1) (l2 = f2.shapes[s3]) && l2._length && (o3 += buildShapeString(l2, l2._length, l2.c, c2));
            i3.caches[p2] = o3;
          } else o3 = i3.caches[p2];
          i3.styles[p2].d += true === r2.hd ? "" : o3, i3.styles[p2]._mdf = h3 || i3.styles[p2]._mdf;
        }
      }
      function s2(t3, e3, r2) {
        var i3 = e3.style;
        (e3.c._mdf || r2) && i3.pElem.setAttribute("fill", "rgb(" + bmFloor(e3.c.v[0]) + "," + bmFloor(e3.c.v[1]) + "," + bmFloor(e3.c.v[2]) + ")"), (e3.o._mdf || r2) && i3.pElem.setAttribute("fill-opacity", e3.o.v);
      }
      function n2(t3, e3, r2) {
        o2(t3, e3, r2), h2(t3, e3, r2);
      }
      function o2(t3, e3, r2) {
        var i3, a3, s3, n3, o3, h3 = e3.gf, l2 = e3.g._hasOpacity, p2 = e3.s.v, f2 = e3.e.v;
        if (e3.o._mdf || r2) {
          var c2 = "gf" === t3.ty ? "fill-opacity" : "stroke-opacity";
          e3.style.pElem.setAttribute(c2, e3.o.v);
        }
        if (e3.s._mdf || r2) {
          var m2 = 1 === t3.t ? "x1" : "cx", d2 = "x1" === m2 ? "y1" : "cy";
          h3.setAttribute(m2, p2[0]), h3.setAttribute(d2, p2[1]), l2 && !e3.g._collapsable && (e3.of.setAttribute(m2, p2[0]), e3.of.setAttribute(d2, p2[1]));
        }
        if (e3.g._cmdf || r2) {
          i3 = e3.cst;
          var u2 = e3.g.c;
          for (s3 = i3.length, a3 = 0; a3 < s3; a3 += 1) (n3 = i3[a3]).setAttribute("offset", u2[4 * a3] + "%"), n3.setAttribute("stop-color", "rgb(" + u2[4 * a3 + 1] + "," + u2[4 * a3 + 2] + "," + u2[4 * a3 + 3] + ")");
        }
        if (l2 && (e3.g._omdf || r2)) {
          var y = e3.g.o;
          for (s3 = (i3 = e3.g._collapsable ? e3.cst : e3.ost).length, a3 = 0; a3 < s3; a3 += 1) n3 = i3[a3], e3.g._collapsable || n3.setAttribute("offset", y[2 * a3] + "%"), n3.setAttribute("stop-opacity", y[2 * a3 + 1]);
        }
        if (1 === t3.t) (e3.e._mdf || r2) && (h3.setAttribute("x2", f2[0]), h3.setAttribute("y2", f2[1]), l2 && !e3.g._collapsable && (e3.of.setAttribute("x2", f2[0]), e3.of.setAttribute("y2", f2[1])));
        else if ((e3.s._mdf || e3.e._mdf || r2) && (o3 = Math.sqrt(Math.pow(p2[0] - f2[0], 2) + Math.pow(p2[1] - f2[1], 2)), h3.setAttribute("r", o3), l2 && !e3.g._collapsable && e3.of.setAttribute("r", o3)), e3.e._mdf || e3.h._mdf || e3.a._mdf || r2) {
          o3 || (o3 = Math.sqrt(Math.pow(p2[0] - f2[0], 2) + Math.pow(p2[1] - f2[1], 2)));
          var g2 = Math.atan2(f2[1] - p2[1], f2[0] - p2[0]), v2 = e3.h.v;
          v2 >= 1 ? v2 = 0.99 : v2 <= -1 && (v2 = -0.99);
          var b = o3 * v2, x = Math.cos(g2 + e3.a.v) * b + p2[0], E2 = Math.sin(g2 + e3.a.v) * b + p2[1];
          h3.setAttribute("fx", x), h3.setAttribute("fy", E2), l2 && !e3.g._collapsable && (e3.of.setAttribute("fx", x), e3.of.setAttribute("fy", E2));
        }
      }
      function h2(t3, e3, r2) {
        var i3 = e3.style, a3 = e3.d;
        a3 && (a3._mdf || r2) && a3.dashStr && (i3.pElem.setAttribute("stroke-dasharray", a3.dashStr), i3.pElem.setAttribute("stroke-dashoffset", a3.dashoffset[0])), e3.c && (e3.c._mdf || r2) && i3.pElem.setAttribute("stroke", "rgb(" + bmFloor(e3.c.v[0]) + "," + bmFloor(e3.c.v[1]) + "," + bmFloor(e3.c.v[2]) + ")"), (e3.o._mdf || r2) && i3.pElem.setAttribute("stroke-opacity", e3.o.v), (e3.w._mdf || r2) && (i3.pElem.setAttribute("stroke-width", e3.w.v), i3.msElem && i3.msElem.setAttribute("stroke-width", e3.w.v));
      }
      return { createRenderFunction: function(t3) {
        switch (t3.ty) {
          case "fl":
            return s2;
          case "gf":
            return o2;
          case "gs":
            return n2;
          case "st":
            return h2;
          case "sh":
          case "el":
          case "rc":
          case "sr":
            return a2;
          case "tr":
            return r;
          case "no":
            return i2;
          default:
            return null;
        }
      } };
    })();
    function SVGShapeElement(t2, e2, r) {
      this.shapes = [], this.shapesData = t2.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.initElement(t2, e2, r), this.prevViewData = [];
    }
    function LetterProps(t2, e2, r, i2, a2, s2) {
      this.o = t2, this.sw = e2, this.sc = r, this.fc = i2, this.m = a2, this.p = s2, this._mdf = { o: true, sw: !!e2, sc: !!r, fc: !!i2, m: true, p: true };
    }
    function TextProperty(t2, e2) {
      this._frameId = initialDefaultFrame, this.pv = "", this.v = "", this.kf = false, this._isFirstFrame = true, this._mdf = false, e2.d && e2.d.sid && (e2.d = t2.globalData.slotManager.getProp(e2.d)), this.data = e2, this.elem = t2, this.comp = this.elem.comp, this.keysIndex = 0, this.canResize = false, this.minimumFontSize = 1, this.effectsSequence = [], this.currentData = { ascent: 0, boxWidth: this.defaultBoxWidth, f: "", fStyle: "", fWeight: "", fc: "", j: "", justifyOffset: "", l: [], lh: 0, lineWidths: [], ls: "", of: "", s: "", sc: "", sw: 0, t: 0, tr: 0, sz: 0, ps: null, fillColorAnim: false, strokeColorAnim: false, strokeWidthAnim: false, yOffset: 0, finalSize: 0, finalText: [], finalLineHeight: 0, __complete: false }, this.copyData(this.currentData, this.data.d.k[0].s), this.searchProperty() || this.completeTextData(this.currentData);
    }
    extendPrototype([BaseElement, TransformElement, SVGBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableDOMElement], SVGShapeElement), SVGShapeElement.prototype.initSecondaryElement = function() {
    }, SVGShapeElement.prototype.identityMatrix = new Matrix(), SVGShapeElement.prototype.buildExpressionInterface = function() {
    }, SVGShapeElement.prototype.createContent = function() {
      this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], true), this.filterUniqueShapes();
    }, SVGShapeElement.prototype.filterUniqueShapes = function() {
      var t2, e2, r, i2, a2 = this.shapes.length, s2 = this.stylesList.length, n2 = [], o2 = false;
      for (r = 0; r < s2; r += 1) {
        for (i2 = this.stylesList[r], o2 = false, n2.length = 0, t2 = 0; t2 < a2; t2 += 1) -1 !== (e2 = this.shapes[t2]).styles.indexOf(i2) && (n2.push(e2), o2 = e2._isAnimated || o2);
        n2.length > 1 && o2 && this.setShapesAsAnimated(n2);
      }
    }, SVGShapeElement.prototype.setShapesAsAnimated = function(t2) {
      var e2, r = t2.length;
      for (e2 = 0; e2 < r; e2 += 1) t2[e2].setAsAnimated();
    }, SVGShapeElement.prototype.createStyleElement = function(t2, e2) {
      var r, i2 = new SVGStyleData(t2, e2), a2 = i2.pElem;
      if ("st" === t2.ty) r = new SVGStrokeStyleData(this, t2, i2);
      else if ("fl" === t2.ty) r = new SVGFillStyleData(this, t2, i2);
      else if ("gf" === t2.ty || "gs" === t2.ty) {
        r = new ("gf" === t2.ty ? SVGGradientFillStyleData : SVGGradientStrokeStyleData)(this, t2, i2), this.globalData.defs.appendChild(r.gf), r.maskId && (this.globalData.defs.appendChild(r.ms), this.globalData.defs.appendChild(r.of), a2.setAttribute("mask", "url(" + getLocationHref() + "#" + r.maskId + ")"));
      } else "no" === t2.ty && (r = new SVGNoStyleData(this, t2, i2));
      return "st" !== t2.ty && "gs" !== t2.ty || (a2.setAttribute("stroke-linecap", lineCapEnum[t2.lc || 2]), a2.setAttribute("stroke-linejoin", lineJoinEnum[t2.lj || 2]), a2.setAttribute("fill-opacity", "0"), 1 === t2.lj && a2.setAttribute("stroke-miterlimit", t2.ml)), 2 === t2.r && a2.setAttribute("fill-rule", "evenodd"), t2.ln && a2.setAttribute("id", t2.ln), t2.cl && a2.setAttribute("class", t2.cl), t2.bm && (a2.style["mix-blend-mode"] = getBlendMode(t2.bm)), this.stylesList.push(i2), this.addToAnimatedContents(t2, r), r;
    }, SVGShapeElement.prototype.createGroupElement = function(t2) {
      var e2 = new ShapeGroupData();
      return t2.ln && e2.gr.setAttribute("id", t2.ln), t2.cl && e2.gr.setAttribute("class", t2.cl), t2.bm && (e2.gr.style["mix-blend-mode"] = getBlendMode(t2.bm)), e2;
    }, SVGShapeElement.prototype.createTransformElement = function(t2, e2) {
      var r = TransformPropertyFactory.getTransformProperty(this, t2, this), i2 = new SVGTransformData(r, r.o, e2);
      return this.addToAnimatedContents(t2, i2), i2;
    }, SVGShapeElement.prototype.createShapeElement = function(t2, e2, r) {
      var i2 = 4;
      "rc" === t2.ty ? i2 = 5 : "el" === t2.ty ? i2 = 6 : "sr" === t2.ty && (i2 = 7);
      var a2 = new SVGShapeData(e2, r, ShapePropertyFactory.getShapeProp(this, t2, i2, this));
      return this.shapes.push(a2), this.addShapeToModifiers(a2), this.addToAnimatedContents(t2, a2), a2;
    }, SVGShapeElement.prototype.addToAnimatedContents = function(t2, e2) {
      for (var r = 0, i2 = this.animatedContents.length; r < i2; ) {
        if (this.animatedContents[r].element === e2) return;
        r += 1;
      }
      this.animatedContents.push({ fn: SVGElementsRenderer.createRenderFunction(t2), element: e2, data: t2 });
    }, SVGShapeElement.prototype.setElementStyles = function(t2) {
      var e2, r = t2.styles, i2 = this.stylesList.length;
      for (e2 = 0; e2 < i2; e2 += 1) this.stylesList[e2].closed || r.push(this.stylesList[e2]);
    }, SVGShapeElement.prototype.reloadShapes = function() {
      var t2;
      this._isFirstFrame = true;
      var e2 = this.itemsData.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.prevViewData[t2] = this.itemsData[t2];
      for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], true), this.filterUniqueShapes(), e2 = this.dynamicProperties.length, t2 = 0; t2 < e2; t2 += 1) this.dynamicProperties[t2].getValue();
      this.renderModifiers();
    }, SVGShapeElement.prototype.searchShapes = function(t2, e2, r, i2, a2, s2, n2) {
      var o2, h2, l2, p2, f2, c2, m2 = [].concat(s2), d2 = t2.length - 1, u2 = [], y = [];
      for (o2 = d2; o2 >= 0; o2 -= 1) {
        if ((c2 = this.searchProcessedElement(t2[o2])) ? e2[o2] = r[c2 - 1] : t2[o2]._render = n2, "fl" === t2[o2].ty || "st" === t2[o2].ty || "gf" === t2[o2].ty || "gs" === t2[o2].ty || "no" === t2[o2].ty) c2 ? e2[o2].style.closed = false : e2[o2] = this.createStyleElement(t2[o2], a2), t2[o2]._render && e2[o2].style.pElem.parentNode !== i2 && i2.appendChild(e2[o2].style.pElem), u2.push(e2[o2].style);
        else if ("gr" === t2[o2].ty) {
          if (c2) for (l2 = e2[o2].it.length, h2 = 0; h2 < l2; h2 += 1) e2[o2].prevViewData[h2] = e2[o2].it[h2];
          else e2[o2] = this.createGroupElement(t2[o2]);
          this.searchShapes(t2[o2].it, e2[o2].it, e2[o2].prevViewData, e2[o2].gr, a2 + 1, m2, n2), t2[o2]._render && e2[o2].gr.parentNode !== i2 && i2.appendChild(e2[o2].gr);
        } else "tr" === t2[o2].ty ? (c2 || (e2[o2] = this.createTransformElement(t2[o2], i2)), p2 = e2[o2].transform, m2.push(p2)) : "sh" === t2[o2].ty || "rc" === t2[o2].ty || "el" === t2[o2].ty || "sr" === t2[o2].ty ? (c2 || (e2[o2] = this.createShapeElement(t2[o2], m2, a2)), this.setElementStyles(e2[o2])) : "tm" === t2[o2].ty || "rd" === t2[o2].ty || "ms" === t2[o2].ty || "pb" === t2[o2].ty || "zz" === t2[o2].ty || "op" === t2[o2].ty ? (c2 ? (f2 = e2[o2]).closed = false : ((f2 = ShapeModifiers.getModifier(t2[o2].ty)).init(this, t2[o2]), e2[o2] = f2, this.shapeModifiers.push(f2)), y.push(f2)) : "rp" === t2[o2].ty && (c2 ? (f2 = e2[o2]).closed = true : (f2 = ShapeModifiers.getModifier(t2[o2].ty), e2[o2] = f2, f2.init(this, t2, o2, e2), this.shapeModifiers.push(f2), n2 = false), y.push(f2));
        this.addProcessedElement(t2[o2], o2 + 1);
      }
      for (d2 = u2.length, o2 = 0; o2 < d2; o2 += 1) u2[o2].closed = true;
      for (d2 = y.length, o2 = 0; o2 < d2; o2 += 1) y[o2].closed = true;
    }, SVGShapeElement.prototype.renderInnerContent = function() {
      var t2;
      this.renderModifiers();
      var e2 = this.stylesList.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.stylesList[t2].reset();
      for (this.renderShape(), t2 = 0; t2 < e2; t2 += 1) (this.stylesList[t2]._mdf || this._isFirstFrame) && (this.stylesList[t2].msElem && (this.stylesList[t2].msElem.setAttribute("d", this.stylesList[t2].d), this.stylesList[t2].d = "M0 0" + this.stylesList[t2].d), this.stylesList[t2].pElem.setAttribute("d", this.stylesList[t2].d || "M0 0"));
    }, SVGShapeElement.prototype.renderShape = function() {
      var t2, e2, r = this.animatedContents.length;
      for (t2 = 0; t2 < r; t2 += 1) e2 = this.animatedContents[t2], (this._isFirstFrame || e2.element._isAnimated) && true !== e2.data && e2.fn(e2.data, e2.element, this._isFirstFrame);
    }, SVGShapeElement.prototype.destroy = function() {
      this.destroyBaseElement(), this.shapesData = null, this.itemsData = null;
    }, LetterProps.prototype.update = function(t2, e2, r, i2, a2, s2) {
      this._mdf.o = false, this._mdf.sw = false, this._mdf.sc = false, this._mdf.fc = false, this._mdf.m = false, this._mdf.p = false;
      var n2 = false;
      return this.o !== t2 && (this.o = t2, this._mdf.o = true, n2 = true), this.sw !== e2 && (this.sw = e2, this._mdf.sw = true, n2 = true), this.sc !== r && (this.sc = r, this._mdf.sc = true, n2 = true), this.fc !== i2 && (this.fc = i2, this._mdf.fc = true, n2 = true), this.m !== a2 && (this.m = a2, this._mdf.m = true, n2 = true), !s2.length || this.p[0] === s2[0] && this.p[1] === s2[1] && this.p[4] === s2[4] && this.p[5] === s2[5] && this.p[12] === s2[12] && this.p[13] === s2[13] || (this.p = s2, this._mdf.p = true, n2 = true), n2;
    }, TextProperty.prototype.defaultBoxWidth = [0, 0], TextProperty.prototype.copyData = function(t2, e2) {
      for (var r in e2) Object.prototype.hasOwnProperty.call(e2, r) && (t2[r] = e2[r]);
      return t2;
    }, TextProperty.prototype.setCurrentData = function(t2) {
      t2.__complete || this.completeTextData(t2), this.currentData = t2, this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth, this._mdf = true;
    }, TextProperty.prototype.searchProperty = function() {
      return this.searchKeyframes();
    }, TextProperty.prototype.searchKeyframes = function() {
      return this.kf = this.data.d.k.length > 1, this.kf && this.addEffect(this.getKeyframeValue.bind(this)), this.kf;
    }, TextProperty.prototype.addEffect = function(t2) {
      this.effectsSequence.push(t2), this.elem.addDynamicProperty(this);
    }, TextProperty.prototype.getValue = function(t2) {
      if (this.elem.globalData.frameId !== this.frameId && this.effectsSequence.length || t2) {
        this.currentData.t = this.data.d.k[this.keysIndex].s.t;
        var e2 = this.currentData, r = this.keysIndex;
        if (this.lock) this.setCurrentData(this.currentData);
        else {
          var i2;
          this.lock = true, this._mdf = false;
          var a2 = this.effectsSequence.length, s2 = t2 || this.data.d.k[this.keysIndex].s;
          for (i2 = 0; i2 < a2; i2 += 1) s2 = r !== this.keysIndex ? this.effectsSequence[i2](s2, s2.t) : this.effectsSequence[i2](this.currentData, s2.t);
          e2 !== s2 && this.setCurrentData(s2), this.v = this.currentData, this.pv = this.v, this.lock = false, this.frameId = this.elem.globalData.frameId;
        }
      }
    }, TextProperty.prototype.getKeyframeValue = function() {
      for (var t2 = this.data.d.k, e2 = this.elem.comp.renderedFrame, r = 0, i2 = t2.length; r <= i2 - 1 && !(r === i2 - 1 || t2[r + 1].t > e2); ) r += 1;
      return this.keysIndex !== r && (this.keysIndex = r), this.data.d.k[this.keysIndex].s;
    }, TextProperty.prototype.buildFinalText = function(t2) {
      for (var e2, r, i2 = [], a2 = 0, s2 = t2.length, n2 = false, o2 = false, h2 = ""; a2 < s2; ) n2 = o2, o2 = false, e2 = t2.charCodeAt(a2), h2 = t2.charAt(a2), FontManager.isCombinedCharacter(e2) ? n2 = true : e2 >= 55296 && e2 <= 56319 ? FontManager.isRegionalFlag(t2, a2) ? h2 = t2.substr(a2, 14) : (r = t2.charCodeAt(a2 + 1)) >= 56320 && r <= 57343 && (FontManager.isModifier(e2, r) ? (h2 = t2.substr(a2, 2), n2 = true) : h2 = FontManager.isFlagEmoji(t2.substr(a2, 4)) ? t2.substr(a2, 4) : t2.substr(a2, 2)) : e2 > 56319 ? (r = t2.charCodeAt(a2 + 1), FontManager.isVariationSelector(e2) && (n2 = true)) : FontManager.isZeroWidthJoiner(e2) && (n2 = true, o2 = true), n2 ? (i2[i2.length - 1] += h2, n2 = false) : i2.push(h2), a2 += h2.length;
      return i2;
    }, TextProperty.prototype.completeTextData = function(t2) {
      t2.__complete = true;
      var e2, r, i2, a2, s2, n2, o2, h2 = this.elem.globalData.fontManager, l2 = this.data, p2 = [], f2 = 0, c2 = l2.m.g, m2 = 0, d2 = 0, u2 = 0, y = [], g2 = 0, v2 = 0, b = h2.getFontByName(t2.f), x = 0, E2 = getFontProperties(b);
      t2.fWeight = E2.weight, t2.fStyle = E2.style, t2.finalSize = t2.s, t2.finalText = this.buildFinalText(t2.t), r = t2.finalText.length, t2.finalLineHeight = t2.lh;
      var S2, P2 = t2.tr / 1e3 * t2.finalSize;
      if (t2.sz) for (var C2, _2, k2 = true, A = t2.sz[0], T = t2.sz[1]; k2; ) {
        C2 = 0, g2 = 0, r = (_2 = this.buildFinalText(t2.t)).length, P2 = t2.tr / 1e3 * t2.finalSize;
        var M = -1;
        for (e2 = 0; e2 < r; e2 += 1) S2 = _2[e2].charCodeAt(0), i2 = false, " " === _2[e2] ? M = e2 : 13 !== S2 && 3 !== S2 || (g2 = 0, i2 = true, C2 += t2.finalLineHeight || 1.2 * t2.finalSize), h2.chars ? (o2 = h2.getCharData(_2[e2], b.fStyle, b.fFamily), x = i2 ? 0 : o2.w * t2.finalSize / 100) : x = h2.measureText(_2[e2], t2.f, t2.finalSize), g2 + x > A && " " !== _2[e2] ? (-1 === M ? r += 1 : e2 = M, C2 += t2.finalLineHeight || 1.2 * t2.finalSize, _2.splice(e2, M === e2 ? 1 : 0, "\r"), M = -1, g2 = 0) : (g2 += x, g2 += P2);
        C2 += b.ascent * t2.finalSize / 100, this.canResize && t2.finalSize > this.minimumFontSize && T < C2 ? (t2.finalSize -= 1, t2.finalLineHeight = t2.finalSize * t2.lh / t2.s) : (t2.finalText = _2, r = t2.finalText.length, k2 = false);
      }
      g2 = -P2, x = 0;
      var w2, D2 = 0;
      for (e2 = 0; e2 < r; e2 += 1) if (i2 = false, 13 === (S2 = (w2 = t2.finalText[e2]).charCodeAt(0)) || 3 === S2 ? (D2 = 0, y.push(g2), v2 = g2 > v2 ? g2 : v2, g2 = -2 * P2, a2 = "", i2 = true, u2 += 1) : a2 = w2, h2.chars ? (o2 = h2.getCharData(w2, b.fStyle, h2.getFontByName(t2.f).fFamily), x = i2 ? 0 : o2.w * t2.finalSize / 100) : x = h2.measureText(a2, t2.f, t2.finalSize), " " === w2 ? D2 += x + P2 : (g2 += x + P2 + D2, D2 = 0), p2.push({ l: x, an: x, add: m2, n: i2, anIndexes: [], val: a2, line: u2, animatorJustifyOffset: 0 }), 2 == c2) {
        if (m2 += x, "" === a2 || " " === a2 || e2 === r - 1) {
          for ("" !== a2 && " " !== a2 || (m2 -= x); d2 <= e2; ) p2[d2].an = m2, p2[d2].ind = f2, p2[d2].extra = x, d2 += 1;
          f2 += 1, m2 = 0;
        }
      } else if (3 == c2) {
        if (m2 += x, "" === a2 || e2 === r - 1) {
          for ("" === a2 && (m2 -= x); d2 <= e2; ) p2[d2].an = m2, p2[d2].ind = f2, p2[d2].extra = x, d2 += 1;
          m2 = 0, f2 += 1;
        }
      } else p2[f2].ind = f2, p2[f2].extra = 0, f2 += 1;
      if (t2.l = p2, v2 = g2 > v2 ? g2 : v2, y.push(g2), t2.sz) t2.boxWidth = t2.sz[0], t2.justifyOffset = 0;
      else switch (t2.boxWidth = v2, t2.j) {
        case 1:
          t2.justifyOffset = -t2.boxWidth;
          break;
        case 2:
          t2.justifyOffset = -t2.boxWidth / 2;
          break;
        default:
          t2.justifyOffset = 0;
      }
      t2.lineWidths = y;
      var F2, I, R, V2, B = l2.a;
      n2 = B.length;
      var L2 = [];
      for (s2 = 0; s2 < n2; s2 += 1) {
        for ((F2 = B[s2]).a.sc && (t2.strokeColorAnim = true), F2.a.sw && (t2.strokeWidthAnim = true), (F2.a.fc || F2.a.fh || F2.a.fs || F2.a.fb) && (t2.fillColorAnim = true), V2 = 0, R = F2.s.b, e2 = 0; e2 < r; e2 += 1) (I = p2[e2]).anIndexes[s2] = V2, (1 == R && "" !== I.val || 2 == R && "" !== I.val && " " !== I.val || 3 == R && (I.n || " " == I.val || e2 == r - 1) || 4 == R && (I.n || e2 == r - 1)) && (1 === F2.s.rn && L2.push(V2), V2 += 1);
        l2.a[s2].s.totalChars = V2;
        var z, G = -1;
        if (1 === F2.s.rn) for (e2 = 0; e2 < r; e2 += 1) G != (I = p2[e2]).anIndexes[s2] && (G = I.anIndexes[s2], z = L2.splice(Math.floor(Math.random() * L2.length), 1)[0]), I.anIndexes[s2] = z;
      }
      t2.yOffset = t2.finalLineHeight || 1.2 * t2.finalSize, t2.ls = t2.ls || 0, t2.ascent = b.ascent * t2.finalSize / 100;
    }, TextProperty.prototype.updateDocumentData = function(t2, e2) {
      e2 = void 0 === e2 ? this.keysIndex : e2;
      var r = this.copyData({}, this.data.d.k[e2].s);
      r = this.copyData(r, t2), this.data.d.k[e2].s = r, this.recalculate(e2), this.setCurrentData(r), this.elem.addDynamicProperty(this);
    }, TextProperty.prototype.recalculate = function(t2) {
      var e2 = this.data.d.k[t2].s;
      e2.__complete = false, this.keysIndex = 0, this._isFirstFrame = true, this.getValue(e2);
    }, TextProperty.prototype.canResizeFont = function(t2) {
      this.canResize = t2, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
    }, TextProperty.prototype.setMinimumFontSize = function(t2) {
      this.minimumFontSize = Math.floor(t2) || 1, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this);
    };
    var TextSelectorProp = (function() {
      var t2 = Math.max, e2 = Math.min, r = Math.floor;
      function i2(t3, e3) {
        this._currentTextLength = -1, this.k = false, this.data = e3, this.elem = t3, this.comp = t3.comp, this.finalS = 0, this.finalE = 0, this.initDynamicPropertyContainer(t3), this.s = PropertyFactory.getProp(t3, e3.s || { k: 0 }, 0, 0, this), this.e = "e" in e3 ? PropertyFactory.getProp(t3, e3.e, 0, 0, this) : { v: 100 }, this.o = PropertyFactory.getProp(t3, e3.o || { k: 0 }, 0, 0, this), this.xe = PropertyFactory.getProp(t3, e3.xe || { k: 0 }, 0, 0, this), this.ne = PropertyFactory.getProp(t3, e3.ne || { k: 0 }, 0, 0, this), this.sm = PropertyFactory.getProp(t3, e3.sm || { k: 100 }, 0, 0, this), this.a = PropertyFactory.getProp(t3, e3.a, 0, 0.01, this), this.dynamicProperties.length || this.getValue();
      }
      return i2.prototype = { getMult: function(i3) {
        this._currentTextLength !== this.elem.textProperty.currentData.l.length && this.getValue();
        var a2 = 0, s2 = 0, n2 = 1, o2 = 1;
        this.ne.v > 0 ? a2 = this.ne.v / 100 : s2 = -this.ne.v / 100, this.xe.v > 0 ? n2 = 1 - this.xe.v / 100 : o2 = 1 + this.xe.v / 100;
        var h2 = BezierFactory.getBezierEasing(a2, s2, n2, o2).get, l2 = 0, p2 = this.finalS, f2 = this.finalE, c2 = this.data.sh;
        if (2 === c2) l2 = h2(l2 = f2 === p2 ? i3 >= f2 ? 1 : 0 : t2(0, e2(0.5 / (f2 - p2) + (i3 - p2) / (f2 - p2), 1)));
        else if (3 === c2) l2 = h2(l2 = f2 === p2 ? i3 >= f2 ? 0 : 1 : 1 - t2(0, e2(0.5 / (f2 - p2) + (i3 - p2) / (f2 - p2), 1)));
        else if (4 === c2) f2 === p2 ? l2 = 0 : (l2 = t2(0, e2(0.5 / (f2 - p2) + (i3 - p2) / (f2 - p2), 1))) < 0.5 ? l2 *= 2 : l2 = 1 - 2 * (l2 - 0.5), l2 = h2(l2);
        else if (5 === c2) {
          if (f2 === p2) l2 = 0;
          else {
            var m2 = f2 - p2, d2 = -m2 / 2 + (i3 = e2(t2(0, i3 + 0.5 - p2), f2 - p2)), u2 = m2 / 2;
            l2 = Math.sqrt(1 - d2 * d2 / (u2 * u2));
          }
          l2 = h2(l2);
        } else 6 === c2 ? (f2 === p2 ? l2 = 0 : (i3 = e2(t2(0, i3 + 0.5 - p2), f2 - p2), l2 = (1 + Math.cos(Math.PI + 2 * Math.PI * i3 / (f2 - p2))) / 2), l2 = h2(l2)) : (i3 >= r(p2) && (l2 = t2(0, e2(i3 - p2 < 0 ? e2(f2, 1) - (p2 - i3) : f2 - i3, 1))), l2 = h2(l2));
        if (100 !== this.sm.v) {
          var y = 0.01 * this.sm.v;
          0 === y && (y = 1e-8);
          var g2 = 0.5 - 0.5 * y;
          l2 < g2 ? l2 = 0 : (l2 = (l2 - g2) / y) > 1 && (l2 = 1);
        }
        return l2 * this.a.v;
      }, getValue: function(t3) {
        this.iterateDynamicProperties(), this._mdf = t3 || this._mdf, this._currentTextLength = this.elem.textProperty.currentData.l.length || 0, t3 && 2 === this.data.r && (this.e.v = this._currentTextLength);
        var e3 = 2 === this.data.r ? 1 : 100 / this.data.totalChars, r2 = this.o.v / e3, i3 = this.s.v / e3 + r2, a2 = this.e.v / e3 + r2;
        if (i3 > a2) {
          var s2 = i3;
          i3 = a2, a2 = s2;
        }
        this.finalS = i3, this.finalE = a2;
      } }, extendPrototype([DynamicPropertyContainer], i2), { getTextSelectorProp: function(t3, e3, r2) {
        return new i2(t3, e3);
      } };
    })();
    function TextAnimatorDataProperty(t2, e2, r) {
      var i2 = { propType: false }, a2 = PropertyFactory.getProp, s2 = e2.a;
      this.a = { r: s2.r ? a2(t2, s2.r, 0, degToRads, r) : i2, rx: s2.rx ? a2(t2, s2.rx, 0, degToRads, r) : i2, ry: s2.ry ? a2(t2, s2.ry, 0, degToRads, r) : i2, sk: s2.sk ? a2(t2, s2.sk, 0, degToRads, r) : i2, sa: s2.sa ? a2(t2, s2.sa, 0, degToRads, r) : i2, s: s2.s ? a2(t2, s2.s, 1, 0.01, r) : i2, a: s2.a ? a2(t2, s2.a, 1, 0, r) : i2, o: s2.o ? a2(t2, s2.o, 0, 0.01, r) : i2, p: s2.p ? a2(t2, s2.p, 1, 0, r) : i2, sw: s2.sw ? a2(t2, s2.sw, 0, 0, r) : i2, sc: s2.sc ? a2(t2, s2.sc, 1, 0, r) : i2, fc: s2.fc ? a2(t2, s2.fc, 1, 0, r) : i2, fh: s2.fh ? a2(t2, s2.fh, 0, 0, r) : i2, fs: s2.fs ? a2(t2, s2.fs, 0, 0.01, r) : i2, fb: s2.fb ? a2(t2, s2.fb, 0, 0.01, r) : i2, t: s2.t ? a2(t2, s2.t, 0, 0, r) : i2 }, this.s = TextSelectorProp.getTextSelectorProp(t2, e2.s, r), this.s.t = e2.s.t;
    }
    function TextAnimatorProperty(t2, e2, r) {
      this._isFirstFrame = true, this._hasMaskedPath = false, this._frameId = -1, this._textData = t2, this._renderType = e2, this._elem = r, this._animatorsData = createSizedArray(this._textData.a.length), this._pathData = {}, this._moreOptions = { alignment: {} }, this.renderedLetters = [], this.lettersChangedFlag = false, this.initDynamicPropertyContainer(r);
    }
    function ITextElement() {
    }
    TextAnimatorProperty.prototype.searchProperties = function() {
      var t2, e2, r = this._textData.a.length, i2 = PropertyFactory.getProp;
      for (t2 = 0; t2 < r; t2 += 1) e2 = this._textData.a[t2], this._animatorsData[t2] = new TextAnimatorDataProperty(this._elem, e2, this);
      this._textData.p && "m" in this._textData.p ? (this._pathData = { a: i2(this._elem, this._textData.p.a, 0, 0, this), f: i2(this._elem, this._textData.p.f, 0, 0, this), l: i2(this._elem, this._textData.p.l, 0, 0, this), r: i2(this._elem, this._textData.p.r, 0, 0, this), p: i2(this._elem, this._textData.p.p, 0, 0, this), m: this._elem.maskManager.getMaskProperty(this._textData.p.m) }, this._hasMaskedPath = true) : this._hasMaskedPath = false, this._moreOptions.alignment = i2(this._elem, this._textData.m.a, 1, 0, this);
    }, TextAnimatorProperty.prototype.getMeasures = function(t2, e2) {
      if (this.lettersChangedFlag = e2, this._mdf || this._isFirstFrame || e2 || this._hasMaskedPath && this._pathData.m._mdf) {
        this._isFirstFrame = false;
        var r, i2, a2, s2, n2, o2, h2, l2, p2, f2, c2, m2, d2, u2, y, g2, v2, b, x, E2 = this._moreOptions.alignment.v, S2 = this._animatorsData, P2 = this._textData, C2 = this.mHelper, _2 = this._renderType, k2 = this.renderedLetters.length, A = t2.l;
        if (this._hasMaskedPath) {
          if (x = this._pathData.m, !this._pathData.n || this._pathData._mdf) {
            var T, M = x.v;
            for (this._pathData.r.v && (M = M.reverse()), n2 = { tLength: 0, segments: [] }, s2 = M._length - 1, g2 = 0, a2 = 0; a2 < s2; a2 += 1) T = bez.buildBezierData(M.v[a2], M.v[a2 + 1], [M.o[a2][0] - M.v[a2][0], M.o[a2][1] - M.v[a2][1]], [M.i[a2 + 1][0] - M.v[a2 + 1][0], M.i[a2 + 1][1] - M.v[a2 + 1][1]]), n2.tLength += T.segmentLength, n2.segments.push(T), g2 += T.segmentLength;
            a2 = s2, x.v.c && (T = bez.buildBezierData(M.v[a2], M.v[0], [M.o[a2][0] - M.v[a2][0], M.o[a2][1] - M.v[a2][1]], [M.i[0][0] - M.v[0][0], M.i[0][1] - M.v[0][1]]), n2.tLength += T.segmentLength, n2.segments.push(T), g2 += T.segmentLength), this._pathData.pi = n2;
          }
          if (n2 = this._pathData.pi, o2 = this._pathData.f.v, c2 = 0, f2 = 1, l2 = 0, p2 = true, u2 = n2.segments, o2 < 0 && x.v.c) for (n2.tLength < Math.abs(o2) && (o2 = -Math.abs(o2) % n2.tLength), f2 = (d2 = u2[c2 = u2.length - 1].points).length - 1; o2 < 0; ) o2 += d2[f2].partialLength, (f2 -= 1) < 0 && (f2 = (d2 = u2[c2 -= 1].points).length - 1);
          m2 = (d2 = u2[c2].points)[f2 - 1], y = (h2 = d2[f2]).partialLength;
        }
        s2 = A.length, r = 0, i2 = 0;
        var w2, D2, F2, I, R, V2 = 1.2 * t2.finalSize * 0.714, B = true;
        F2 = S2.length;
        var L2, z, G, O, N2, H2, j2, q, W2, $2, Y2, J, X = -1, Z2 = o2, K = c2, U = f2, Q2 = -1, tt = "", et = this.defaultPropsArray;
        if (2 === t2.j || 1 === t2.j) {
          var rt = 0, it = 0, at = 2 === t2.j ? -0.5 : -1, st = 0, nt = true;
          for (a2 = 0; a2 < s2; a2 += 1) if (A[a2].n) {
            for (rt && (rt += it); st < a2; ) A[st].animatorJustifyOffset = rt, st += 1;
            rt = 0, nt = true;
          } else {
            for (D2 = 0; D2 < F2; D2 += 1) (w2 = S2[D2].a).t.propType && (nt && 2 === t2.j && (it += w2.t.v * at), (R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars)).length ? rt += w2.t.v * R[0] * at : rt += w2.t.v * R * at);
            nt = false;
          }
          for (rt && (rt += it); st < a2; ) A[st].animatorJustifyOffset = rt, st += 1;
        }
        for (a2 = 0; a2 < s2; a2 += 1) {
          if (C2.reset(), O = 1, A[a2].n) r = 0, i2 += t2.yOffset, i2 += B ? 1 : 0, o2 = Z2, B = false, this._hasMaskedPath && (f2 = U, m2 = (d2 = u2[c2 = K].points)[f2 - 1], y = (h2 = d2[f2]).partialLength, l2 = 0), tt = "", Y2 = "", W2 = "", J = "", et = this.defaultPropsArray;
          else {
            if (this._hasMaskedPath) {
              if (Q2 !== A[a2].line) {
                switch (t2.j) {
                  case 1:
                    o2 += g2 - t2.lineWidths[A[a2].line];
                    break;
                  case 2:
                    o2 += (g2 - t2.lineWidths[A[a2].line]) / 2;
                }
                Q2 = A[a2].line;
              }
              X !== A[a2].ind && (A[X] && (o2 += A[X].extra), o2 += A[a2].an / 2, X = A[a2].ind), o2 += E2[0] * A[a2].an * 5e-3;
              var ot = 0;
              for (D2 = 0; D2 < F2; D2 += 1) (w2 = S2[D2].a).p.propType && ((R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars)).length ? ot += w2.p.v[0] * R[0] : ot += w2.p.v[0] * R), w2.a.propType && ((R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars)).length ? ot += w2.a.v[0] * R[0] : ot += w2.a.v[0] * R);
              for (p2 = true, this._pathData.a.v && (o2 = 0.5 * A[0].an + (g2 - this._pathData.f.v - 0.5 * A[0].an - 0.5 * A[A.length - 1].an) * X / (s2 - 1), o2 += this._pathData.f.v); p2; ) l2 + y >= o2 + ot || !d2 ? (v2 = (o2 + ot - l2) / h2.partialLength, z = m2.point[0] + (h2.point[0] - m2.point[0]) * v2, G = m2.point[1] + (h2.point[1] - m2.point[1]) * v2, C2.translate(-E2[0] * A[a2].an * 5e-3, -E2[1] * V2 * 0.01), p2 = false) : d2 && (l2 += h2.partialLength, (f2 += 1) >= d2.length && (f2 = 0, u2[c2 += 1] ? d2 = u2[c2].points : x.v.c ? (f2 = 0, d2 = u2[c2 = 0].points) : (l2 -= h2.partialLength, d2 = null)), d2 && (m2 = h2, y = (h2 = d2[f2]).partialLength));
              L2 = A[a2].an / 2 - A[a2].add, C2.translate(-L2, 0, 0);
            } else L2 = A[a2].an / 2 - A[a2].add, C2.translate(-L2, 0, 0), C2.translate(-E2[0] * A[a2].an * 5e-3, -E2[1] * V2 * 0.01, 0);
            for (D2 = 0; D2 < F2; D2 += 1) (w2 = S2[D2].a).t.propType && (R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars), 0 === r && 0 === t2.j || (this._hasMaskedPath ? R.length ? o2 += w2.t.v * R[0] : o2 += w2.t.v * R : R.length ? r += w2.t.v * R[0] : r += w2.t.v * R));
            for (t2.strokeWidthAnim && (H2 = t2.sw || 0), t2.strokeColorAnim && (N2 = t2.sc ? [t2.sc[0], t2.sc[1], t2.sc[2]] : [0, 0, 0]), t2.fillColorAnim && t2.fc && (j2 = [t2.fc[0], t2.fc[1], t2.fc[2]]), D2 = 0; D2 < F2; D2 += 1) (w2 = S2[D2].a).a.propType && ((R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars)).length ? C2.translate(-w2.a.v[0] * R[0], -w2.a.v[1] * R[1], w2.a.v[2] * R[2]) : C2.translate(-w2.a.v[0] * R, -w2.a.v[1] * R, w2.a.v[2] * R));
            for (D2 = 0; D2 < F2; D2 += 1) (w2 = S2[D2].a).s.propType && ((R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars)).length ? C2.scale(1 + (w2.s.v[0] - 1) * R[0], 1 + (w2.s.v[1] - 1) * R[1], 1) : C2.scale(1 + (w2.s.v[0] - 1) * R, 1 + (w2.s.v[1] - 1) * R, 1));
            for (D2 = 0; D2 < F2; D2 += 1) {
              if (w2 = S2[D2].a, R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars), w2.sk.propType && (R.length ? C2.skewFromAxis(-w2.sk.v * R[0], w2.sa.v * R[1]) : C2.skewFromAxis(-w2.sk.v * R, w2.sa.v * R)), w2.r.propType && (R.length ? C2.rotateZ(-w2.r.v * R[2]) : C2.rotateZ(-w2.r.v * R)), w2.ry.propType && (R.length ? C2.rotateY(w2.ry.v * R[1]) : C2.rotateY(w2.ry.v * R)), w2.rx.propType && (R.length ? C2.rotateX(w2.rx.v * R[0]) : C2.rotateX(w2.rx.v * R)), w2.o.propType && (R.length ? O += (w2.o.v * R[0] - O) * R[0] : O += (w2.o.v * R - O) * R), t2.strokeWidthAnim && w2.sw.propType && (R.length ? H2 += w2.sw.v * R[0] : H2 += w2.sw.v * R), t2.strokeColorAnim && w2.sc.propType) for (q = 0; q < 3; q += 1) R.length ? N2[q] += (w2.sc.v[q] - N2[q]) * R[0] : N2[q] += (w2.sc.v[q] - N2[q]) * R;
              if (t2.fillColorAnim && t2.fc) {
                if (w2.fc.propType) for (q = 0; q < 3; q += 1) R.length ? j2[q] += (w2.fc.v[q] - j2[q]) * R[0] : j2[q] += (w2.fc.v[q] - j2[q]) * R;
                w2.fh.propType && (j2 = R.length ? addHueToRGB(j2, w2.fh.v * R[0]) : addHueToRGB(j2, w2.fh.v * R)), w2.fs.propType && (j2 = R.length ? addSaturationToRGB(j2, w2.fs.v * R[0]) : addSaturationToRGB(j2, w2.fs.v * R)), w2.fb.propType && (j2 = R.length ? addBrightnessToRGB(j2, w2.fb.v * R[0]) : addBrightnessToRGB(j2, w2.fb.v * R));
              }
            }
            for (D2 = 0; D2 < F2; D2 += 1) (w2 = S2[D2].a).p.propType && (R = S2[D2].s.getMult(A[a2].anIndexes[D2], P2.a[D2].s.totalChars), this._hasMaskedPath ? R.length ? C2.translate(0, w2.p.v[1] * R[0], -w2.p.v[2] * R[1]) : C2.translate(0, w2.p.v[1] * R, -w2.p.v[2] * R) : R.length ? C2.translate(w2.p.v[0] * R[0], w2.p.v[1] * R[1], -w2.p.v[2] * R[2]) : C2.translate(w2.p.v[0] * R, w2.p.v[1] * R, -w2.p.v[2] * R));
            if (t2.strokeWidthAnim && (W2 = H2 < 0 ? 0 : H2), t2.strokeColorAnim && ($2 = "rgb(" + Math.round(255 * N2[0]) + "," + Math.round(255 * N2[1]) + "," + Math.round(255 * N2[2]) + ")"), t2.fillColorAnim && t2.fc && (Y2 = "rgb(" + Math.round(255 * j2[0]) + "," + Math.round(255 * j2[1]) + "," + Math.round(255 * j2[2]) + ")"), this._hasMaskedPath) {
              if (C2.translate(0, -t2.ls), C2.translate(0, E2[1] * V2 * 0.01 + i2, 0), this._pathData.p.v) {
                b = (h2.point[1] - m2.point[1]) / (h2.point[0] - m2.point[0]);
                var ht = 180 * Math.atan(b) / Math.PI;
                h2.point[0] < m2.point[0] && (ht += 180), C2.rotate(-ht * Math.PI / 180);
              }
              C2.translate(z, G, 0), o2 -= E2[0] * A[a2].an * 5e-3, A[a2 + 1] && X !== A[a2 + 1].ind && (o2 += A[a2].an / 2, o2 += 1e-3 * t2.tr * t2.finalSize);
            } else {
              switch (C2.translate(r, i2, 0), t2.ps && C2.translate(t2.ps[0], t2.ps[1] + t2.ascent, 0), t2.j) {
                case 1:
                  C2.translate(A[a2].animatorJustifyOffset + t2.justifyOffset + (t2.boxWidth - t2.lineWidths[A[a2].line]), 0, 0);
                  break;
                case 2:
                  C2.translate(A[a2].animatorJustifyOffset + t2.justifyOffset + (t2.boxWidth - t2.lineWidths[A[a2].line]) / 2, 0, 0);
              }
              C2.translate(0, -t2.ls), C2.translate(L2, 0, 0), C2.translate(E2[0] * A[a2].an * 5e-3, E2[1] * V2 * 0.01, 0), r += A[a2].l + 1e-3 * t2.tr * t2.finalSize;
            }
            "html" === _2 ? tt = C2.toCSS() : "svg" === _2 ? tt = C2.to2dCSS() : et = [C2.props[0], C2.props[1], C2.props[2], C2.props[3], C2.props[4], C2.props[5], C2.props[6], C2.props[7], C2.props[8], C2.props[9], C2.props[10], C2.props[11], C2.props[12], C2.props[13], C2.props[14], C2.props[15]], J = O;
          }
          k2 <= a2 ? (I = new LetterProps(J, W2, $2, Y2, tt, et), this.renderedLetters.push(I), k2 += 1, this.lettersChangedFlag = true) : (I = this.renderedLetters[a2], this.lettersChangedFlag = I.update(J, W2, $2, Y2, tt, et) || this.lettersChangedFlag);
        }
      }
    }, TextAnimatorProperty.prototype.getValue = function() {
      this._elem.globalData.frameId !== this._frameId && (this._frameId = this._elem.globalData.frameId, this.iterateDynamicProperties());
    }, TextAnimatorProperty.prototype.mHelper = new Matrix(), TextAnimatorProperty.prototype.defaultPropsArray = [], extendPrototype([DynamicPropertyContainer], TextAnimatorProperty), ITextElement.prototype.initElement = function(t2, e2, r) {
      this.lettersChangedFlag = true, this.initFrame(), this.initBaseData(t2, e2, r), this.textProperty = new TextProperty(this, t2.t, this.dynamicProperties), this.textAnimator = new TextAnimatorProperty(t2.t, this.renderType, this), this.initTransform(t2, e2, r), this.initHierarchy(), this.initRenderable(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), this.createContent(), this.hide(), this.textAnimator.searchProperties(this.dynamicProperties);
    }, ITextElement.prototype.prepareFrame = function(t2) {
      this._mdf = false, this.prepareRenderableFrame(t2), this.prepareProperties(t2, this.isInRange);
    }, ITextElement.prototype.createPathShape = function(t2, e2) {
      var r, i2, a2 = e2.length, s2 = "";
      for (r = 0; r < a2; r += 1) "sh" === e2[r].ty && (i2 = e2[r].ks.k, s2 += buildShapeString(i2, i2.i.length, true, t2));
      return s2;
    }, ITextElement.prototype.updateDocumentData = function(t2, e2) {
      this.textProperty.updateDocumentData(t2, e2);
    }, ITextElement.prototype.canResizeFont = function(t2) {
      this.textProperty.canResizeFont(t2);
    }, ITextElement.prototype.setMinimumFontSize = function(t2) {
      this.textProperty.setMinimumFontSize(t2);
    }, ITextElement.prototype.applyTextPropertiesToMatrix = function(t2, e2, r, i2, a2) {
      switch (t2.ps && e2.translate(t2.ps[0], t2.ps[1] + t2.ascent, 0), e2.translate(0, -t2.ls, 0), t2.j) {
        case 1:
          e2.translate(t2.justifyOffset + (t2.boxWidth - t2.lineWidths[r]), 0, 0);
          break;
        case 2:
          e2.translate(t2.justifyOffset + (t2.boxWidth - t2.lineWidths[r]) / 2, 0, 0);
      }
      e2.translate(i2, a2, 0);
    }, ITextElement.prototype.buildColor = function(t2) {
      return "rgb(" + Math.round(255 * t2[0]) + "," + Math.round(255 * t2[1]) + "," + Math.round(255 * t2[2]) + ")";
    }, ITextElement.prototype.emptyProp = new LetterProps(), ITextElement.prototype.destroy = function() {
    }, ITextElement.prototype.validateText = function() {
      (this.textProperty._mdf || this.textProperty._isFirstFrame) && (this.buildNewText(), this.textProperty._isFirstFrame = false, this.textProperty._mdf = false);
    };
    var emptyShapeData = { shapes: [] };
    function SVGTextLottieElement(t2, e2, r) {
      this.textSpans = [], this.renderType = "svg", this.initElement(t2, e2, r);
    }
    function ISolidElement(t2, e2, r) {
      this.initElement(t2, e2, r);
    }
    function NullElement(t2, e2, r) {
      this.initFrame(), this.initBaseData(t2, e2, r), this.initFrame(), this.initTransform(t2, e2, r), this.initHierarchy();
    }
    function SVGRendererBase() {
    }
    function ICompElement() {
    }
    function SVGCompElement(t2, e2, r) {
      this.layers = t2.layers, this.supports3d = true, this.completeLayers = false, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(t2, e2, r), this.tm = t2.tm ? PropertyFactory.getProp(this, t2.tm, 0, e2.frameRate, this) : { _placeholder: true };
    }
    function SVGRenderer(t2, e2) {
      this.animationItem = t2, this.layers = null, this.renderedFrame = -1, this.svgElement = createNS("svg");
      var r = "";
      if (e2 && e2.title) {
        var i2 = createNS("title"), a2 = createElementID();
        i2.setAttribute("id", a2), i2.textContent = e2.title, this.svgElement.appendChild(i2), r += a2;
      }
      if (e2 && e2.description) {
        var s2 = createNS("desc"), n2 = createElementID();
        s2.setAttribute("id", n2), s2.textContent = e2.description, this.svgElement.appendChild(s2), r += " " + n2;
      }
      r && this.svgElement.setAttribute("aria-labelledby", r);
      var o2 = createNS("defs");
      this.svgElement.appendChild(o2);
      var h2 = createNS("g");
      this.svgElement.appendChild(h2), this.layerElement = h2, this.renderConfig = { preserveAspectRatio: e2 && e2.preserveAspectRatio || "xMidYMid meet", imagePreserveAspectRatio: e2 && e2.imagePreserveAspectRatio || "xMidYMid slice", contentVisibility: e2 && e2.contentVisibility || "visible", progressiveLoad: e2 && e2.progressiveLoad || false, hideOnTransparent: !(e2 && false === e2.hideOnTransparent), viewBoxOnly: e2 && e2.viewBoxOnly || false, viewBoxSize: e2 && e2.viewBoxSize || false, className: e2 && e2.className || "", id: e2 && e2.id || "", focusable: e2 && e2.focusable, filterSize: { width: e2 && e2.filterSize && e2.filterSize.width || "100%", height: e2 && e2.filterSize && e2.filterSize.height || "100%", x: e2 && e2.filterSize && e2.filterSize.x || "0%", y: e2 && e2.filterSize && e2.filterSize.y || "0%" }, width: e2 && e2.width, height: e2 && e2.height, runExpressions: !e2 || void 0 === e2.runExpressions || e2.runExpressions }, this.globalData = { _mdf: false, frameNum: -1, defs: o2, renderConfig: this.renderConfig }, this.elements = [], this.pendingElements = [], this.destroyed = false, this.rendererType = "svg";
    }
    function ShapeTransformManager() {
      this.sequences = {}, this.sequenceList = [], this.transform_key_count = 0;
    }
    extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], SVGTextLottieElement), SVGTextLottieElement.prototype.createContent = function() {
      this.data.singleShape && !this.globalData.fontManager.chars && (this.textContainer = createNS("text"));
    }, SVGTextLottieElement.prototype.buildTextContents = function(t2) {
      for (var e2 = 0, r = t2.length, i2 = [], a2 = ""; e2 < r; ) t2[e2] === String.fromCharCode(13) || t2[e2] === String.fromCharCode(3) ? (i2.push(a2), a2 = "") : a2 += t2[e2], e2 += 1;
      return i2.push(a2), i2;
    }, SVGTextLottieElement.prototype.buildShapeData = function(t2, e2) {
      if (t2.shapes && t2.shapes.length) {
        var r = t2.shapes[0];
        if (r.it) {
          var i2 = r.it[r.it.length - 1];
          i2.s && (i2.s.k[0] = e2, i2.s.k[1] = e2);
        }
      }
      return t2;
    }, SVGTextLottieElement.prototype.buildNewText = function() {
      var t2, e2;
      this.addDynamicProperty(this);
      var r = this.textProperty.currentData;
      this.renderedLetters = createSizedArray(r ? r.l.length : 0), r.fc ? this.layerElement.setAttribute("fill", this.buildColor(r.fc)) : this.layerElement.setAttribute("fill", "rgba(0,0,0,0)"), r.sc && (this.layerElement.setAttribute("stroke", this.buildColor(r.sc)), this.layerElement.setAttribute("stroke-width", r.sw)), this.layerElement.setAttribute("font-size", r.finalSize);
      var i2 = this.globalData.fontManager.getFontByName(r.f);
      if (i2.fClass) this.layerElement.setAttribute("class", i2.fClass);
      else {
        this.layerElement.setAttribute("font-family", i2.fFamily);
        var a2 = r.fWeight, s2 = r.fStyle;
        this.layerElement.setAttribute("font-style", s2), this.layerElement.setAttribute("font-weight", a2);
      }
      this.layerElement.setAttribute("aria-label", r.t);
      var n2, o2 = r.l || [], h2 = !!this.globalData.fontManager.chars;
      e2 = o2.length;
      var l2 = this.mHelper, p2 = this.data.singleShape, f2 = 0, c2 = 0, m2 = true, d2 = 1e-3 * r.tr * r.finalSize;
      if (!p2 || h2 || r.sz) {
        var u2, y = this.textSpans.length;
        for (t2 = 0; t2 < e2; t2 += 1) {
          if (this.textSpans[t2] || (this.textSpans[t2] = { span: null, childSpan: null, glyph: null }), !h2 || !p2 || 0 === t2) {
            if (n2 = y > t2 ? this.textSpans[t2].span : createNS(h2 ? "g" : "text"), y <= t2) {
              if (n2.setAttribute("stroke-linecap", "butt"), n2.setAttribute("stroke-linejoin", "round"), n2.setAttribute("stroke-miterlimit", "4"), this.textSpans[t2].span = n2, h2) {
                var g2 = createNS("g");
                n2.appendChild(g2), this.textSpans[t2].childSpan = g2;
              }
              this.textSpans[t2].span = n2, this.layerElement.appendChild(n2);
            }
            n2.style.display = "inherit";
          }
          if (l2.reset(), p2 && (o2[t2].n && (f2 = -d2, c2 += r.yOffset, c2 += m2 ? 1 : 0, m2 = false), this.applyTextPropertiesToMatrix(r, l2, o2[t2].line, f2, c2), f2 += o2[t2].l || 0, f2 += d2), h2) {
            var v2;
            if (1 === (u2 = this.globalData.fontManager.getCharData(r.finalText[t2], i2.fStyle, this.globalData.fontManager.getFontByName(r.f).fFamily)).t) v2 = new SVGCompElement(u2.data, this.globalData, this);
            else {
              var b = emptyShapeData;
              u2.data && u2.data.shapes && (b = this.buildShapeData(u2.data, r.finalSize)), v2 = new SVGShapeElement(b, this.globalData, this);
            }
            if (this.textSpans[t2].glyph) {
              var x = this.textSpans[t2].glyph;
              this.textSpans[t2].childSpan.removeChild(x.layerElement), x.destroy();
            }
            this.textSpans[t2].glyph = v2, v2._debug = true, v2.prepareFrame(0), v2.renderFrame(), this.textSpans[t2].childSpan.appendChild(v2.layerElement), 1 === u2.t && this.textSpans[t2].childSpan.setAttribute("transform", "scale(" + r.finalSize / 100 + "," + r.finalSize / 100 + ")");
          } else p2 && n2.setAttribute("transform", "translate(" + l2.props[12] + "," + l2.props[13] + ")"), n2.textContent = o2[t2].val, n2.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
        }
        p2 && n2 && n2.setAttribute("d", "");
      } else {
        var E2 = this.textContainer, S2 = "start";
        switch (r.j) {
          case 1:
            S2 = "end";
            break;
          case 2:
            S2 = "middle";
            break;
          default:
            S2 = "start";
        }
        E2.setAttribute("text-anchor", S2), E2.setAttribute("letter-spacing", d2);
        var P2 = this.buildTextContents(r.finalText);
        for (e2 = P2.length, c2 = r.ps ? r.ps[1] + r.ascent : 0, t2 = 0; t2 < e2; t2 += 1) (n2 = this.textSpans[t2].span || createNS("tspan")).textContent = P2[t2], n2.setAttribute("x", 0), n2.setAttribute("y", c2), n2.style.display = "inherit", E2.appendChild(n2), this.textSpans[t2] || (this.textSpans[t2] = { span: null, glyph: null }), this.textSpans[t2].span = n2, c2 += r.finalLineHeight;
        this.layerElement.appendChild(E2);
      }
      for (; t2 < this.textSpans.length; ) this.textSpans[t2].span.style.display = "none", t2 += 1;
      this._sizeChanged = true;
    }, SVGTextLottieElement.prototype.sourceRectAtTime = function() {
      if (this.prepareFrame(this.comp.renderedFrame - this.data.st), this.renderInnerContent(), this._sizeChanged) {
        this._sizeChanged = false;
        var t2 = this.layerElement.getBBox();
        this.bbox = { top: t2.y, left: t2.x, width: t2.width, height: t2.height };
      }
      return this.bbox;
    }, SVGTextLottieElement.prototype.getValue = function() {
      var t2, e2, r = this.textSpans.length;
      for (this.renderedFrame = this.comp.renderedFrame, t2 = 0; t2 < r; t2 += 1) (e2 = this.textSpans[t2].glyph) && (e2.prepareFrame(this.comp.renderedFrame - this.data.st), e2._mdf && (this._mdf = true));
    }, SVGTextLottieElement.prototype.renderInnerContent = function() {
      if (this.validateText(), (!this.data.singleShape || this._mdf) && (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag), this.lettersChangedFlag || this.textAnimator.lettersChangedFlag)) {
        var t2, e2;
        this._sizeChanged = true;
        var r, i2, a2, s2 = this.textAnimator.renderedLetters, n2 = this.textProperty.currentData.l;
        for (e2 = n2.length, t2 = 0; t2 < e2; t2 += 1) n2[t2].n || (r = s2[t2], i2 = this.textSpans[t2].span, (a2 = this.textSpans[t2].glyph) && a2.renderFrame(), r._mdf.m && i2.setAttribute("transform", r.m), r._mdf.o && i2.setAttribute("opacity", r.o), r._mdf.sw && i2.setAttribute("stroke-width", r.sw), r._mdf.sc && i2.setAttribute("stroke", r.sc), r._mdf.fc && i2.setAttribute("fill", r.fc));
      }
    }, extendPrototype([IImageElement], ISolidElement), ISolidElement.prototype.createContent = function() {
      var t2 = createNS("rect");
      t2.setAttribute("width", this.data.sw), t2.setAttribute("height", this.data.sh), t2.setAttribute("fill", this.data.sc), this.layerElement.appendChild(t2);
    }, NullElement.prototype.prepareFrame = function(t2) {
      this.prepareProperties(t2, true);
    }, NullElement.prototype.renderFrame = function() {
    }, NullElement.prototype.getBaseElement = function() {
      return null;
    }, NullElement.prototype.destroy = function() {
    }, NullElement.prototype.sourceRectAtTime = function() {
    }, NullElement.prototype.hide = function() {
    }, extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement], NullElement), extendPrototype([BaseRenderer], SVGRendererBase), SVGRendererBase.prototype.createNull = function(t2) {
      return new NullElement(t2, this.globalData, this);
    }, SVGRendererBase.prototype.createShape = function(t2) {
      return new SVGShapeElement(t2, this.globalData, this);
    }, SVGRendererBase.prototype.createText = function(t2) {
      return new SVGTextLottieElement(t2, this.globalData, this);
    }, SVGRendererBase.prototype.createImage = function(t2) {
      return new IImageElement(t2, this.globalData, this);
    }, SVGRendererBase.prototype.createSolid = function(t2) {
      return new ISolidElement(t2, this.globalData, this);
    }, SVGRendererBase.prototype.configAnimation = function(t2) {
      this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg"), this.svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"), this.renderConfig.viewBoxSize ? this.svgElement.setAttribute("viewBox", this.renderConfig.viewBoxSize) : this.svgElement.setAttribute("viewBox", "0 0 " + t2.w + " " + t2.h), this.renderConfig.viewBoxOnly || (this.svgElement.setAttribute("width", t2.w), this.svgElement.setAttribute("height", t2.h), this.svgElement.style.width = "100%", this.svgElement.style.height = "100%", this.svgElement.style.transform = "translate3d(0,0,0)", this.svgElement.style.contentVisibility = this.renderConfig.contentVisibility), this.renderConfig.width && this.svgElement.setAttribute("width", this.renderConfig.width), this.renderConfig.height && this.svgElement.setAttribute("height", this.renderConfig.height), this.renderConfig.className && this.svgElement.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.svgElement.setAttribute("id", this.renderConfig.id), void 0 !== this.renderConfig.focusable && this.svgElement.setAttribute("focusable", this.renderConfig.focusable), this.svgElement.setAttribute("preserveAspectRatio", this.renderConfig.preserveAspectRatio), this.animationItem.wrapper.appendChild(this.svgElement);
      var e2 = this.globalData.defs;
      this.setupGlobalData(t2, e2), this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.data = t2;
      var r = createNS("clipPath"), i2 = createNS("rect");
      i2.setAttribute("width", t2.w), i2.setAttribute("height", t2.h), i2.setAttribute("x", 0), i2.setAttribute("y", 0);
      var a2 = createElementID();
      r.setAttribute("id", a2), r.appendChild(i2), this.layerElement.setAttribute("clip-path", "url(" + getLocationHref() + "#" + a2 + ")"), e2.appendChild(r), this.layers = t2.layers, this.elements = createSizedArray(t2.layers.length);
    }, SVGRendererBase.prototype.destroy = function() {
      var t2;
      this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.layerElement = null, this.globalData.defs = null;
      var e2 = this.layers ? this.layers.length : 0;
      for (t2 = 0; t2 < e2; t2 += 1) this.elements[t2] && this.elements[t2].destroy && this.elements[t2].destroy();
      this.elements.length = 0, this.destroyed = true, this.animationItem = null;
    }, SVGRendererBase.prototype.updateContainerSize = function() {
    }, SVGRendererBase.prototype.findIndexByInd = function(t2) {
      var e2 = 0, r = this.layers.length;
      for (e2 = 0; e2 < r; e2 += 1) if (this.layers[e2].ind === t2) return e2;
      return -1;
    }, SVGRendererBase.prototype.buildItem = function(t2) {
      var e2 = this.elements;
      if (!e2[t2] && 99 !== this.layers[t2].ty) {
        e2[t2] = true;
        var r = this.createItem(this.layers[t2]);
        if (e2[t2] = r, getExpressionsPlugin() && (0 === this.layers[t2].ty && this.globalData.projectInterface.registerComposition(r), r.initExpressions()), this.appendElementInPos(r, t2), this.layers[t2].tt) {
          var i2 = "tp" in this.layers[t2] ? this.findIndexByInd(this.layers[t2].tp) : t2 - 1;
          if (-1 === i2) return;
          if (this.elements[i2] && true !== this.elements[i2]) {
            var a2 = e2[i2].getMatte(this.layers[t2].tt);
            r.setMatte(a2);
          } else this.buildItem(i2), this.addPendingElement(r);
        }
      }
    }, SVGRendererBase.prototype.checkPendingElements = function() {
      for (; this.pendingElements.length; ) {
        var t2 = this.pendingElements.pop();
        if (t2.checkParenting(), t2.data.tt) for (var e2 = 0, r = this.elements.length; e2 < r; ) {
          if (this.elements[e2] === t2) {
            var i2 = "tp" in t2.data ? this.findIndexByInd(t2.data.tp) : e2 - 1, a2 = this.elements[i2].getMatte(this.layers[e2].tt);
            t2.setMatte(a2);
            break;
          }
          e2 += 1;
        }
      }
    }, SVGRendererBase.prototype.renderFrame = function(t2) {
      if (this.renderedFrame !== t2 && !this.destroyed) {
        var e2;
        null === t2 ? t2 = this.renderedFrame : this.renderedFrame = t2, this.globalData.frameNum = t2, this.globalData.frameId += 1, this.globalData.projectInterface.currentFrame = t2, this.globalData._mdf = false;
        var r = this.layers.length;
        for (this.completeLayers || this.checkLayers(t2), e2 = r - 1; e2 >= 0; e2 -= 1) (this.completeLayers || this.elements[e2]) && this.elements[e2].prepareFrame(t2 - this.layers[e2].st);
        if (this.globalData._mdf) for (e2 = 0; e2 < r; e2 += 1) (this.completeLayers || this.elements[e2]) && this.elements[e2].renderFrame();
      }
    }, SVGRendererBase.prototype.appendElementInPos = function(t2, e2) {
      var r = t2.getBaseElement();
      if (r) {
        for (var i2, a2 = 0; a2 < e2; ) this.elements[a2] && true !== this.elements[a2] && this.elements[a2].getBaseElement() && (i2 = this.elements[a2].getBaseElement()), a2 += 1;
        i2 ? this.layerElement.insertBefore(r, i2) : this.layerElement.appendChild(r);
      }
    }, SVGRendererBase.prototype.hide = function() {
      this.layerElement.style.display = "none";
    }, SVGRendererBase.prototype.show = function() {
      this.layerElement.style.display = "block";
    }, extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement, RenderableDOMElement], ICompElement), ICompElement.prototype.initElement = function(t2, e2, r) {
      this.initFrame(), this.initBaseData(t2, e2, r), this.initTransform(t2, e2, r), this.initRenderable(), this.initHierarchy(), this.initRendererElement(), this.createContainerElements(), this.createRenderableComponents(), !this.data.xt && e2.progressiveLoad || this.buildAllItems(), this.hide();
    }, ICompElement.prototype.prepareFrame = function(t2) {
      if (this._mdf = false, this.prepareRenderableFrame(t2), this.prepareProperties(t2, this.isInRange), this.isInRange || this.data.xt) {
        if (this.tm._placeholder) this.renderedFrame = t2 / this.data.sr;
        else {
          var e2 = this.tm.v;
          e2 === this.data.op && (e2 = this.data.op - 1), this.renderedFrame = e2;
        }
        var r, i2 = this.elements.length;
        for (this.completeLayers || this.checkLayers(this.renderedFrame), r = i2 - 1; r >= 0; r -= 1) (this.completeLayers || this.elements[r]) && (this.elements[r].prepareFrame(this.renderedFrame - this.layers[r].st), this.elements[r]._mdf && (this._mdf = true));
      }
    }, ICompElement.prototype.renderInnerContent = function() {
      var t2, e2 = this.layers.length;
      for (t2 = 0; t2 < e2; t2 += 1) (this.completeLayers || this.elements[t2]) && this.elements[t2].renderFrame();
    }, ICompElement.prototype.setElements = function(t2) {
      this.elements = t2;
    }, ICompElement.prototype.getElements = function() {
      return this.elements;
    }, ICompElement.prototype.destroyElements = function() {
      var t2, e2 = this.layers.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.elements[t2] && this.elements[t2].destroy();
    }, ICompElement.prototype.destroy = function() {
      this.destroyElements(), this.destroyBaseElement();
    }, extendPrototype([SVGRendererBase, ICompElement, SVGBaseElement], SVGCompElement), SVGCompElement.prototype.createComp = function(t2) {
      return new SVGCompElement(t2, this.globalData, this);
    }, extendPrototype([SVGRendererBase], SVGRenderer), SVGRenderer.prototype.createComp = function(t2) {
      return new SVGCompElement(t2, this.globalData, this);
    }, ShapeTransformManager.prototype = { addTransformSequence: function(t2) {
      var e2, r = t2.length, i2 = "_";
      for (e2 = 0; e2 < r; e2 += 1) i2 += t2[e2].transform.key + "_";
      var a2 = this.sequences[i2];
      return a2 || (a2 = { transforms: [].concat(t2), finalTransform: new Matrix(), _mdf: false }, this.sequences[i2] = a2, this.sequenceList.push(a2)), a2;
    }, processSequence: function(t2, e2) {
      for (var r = 0, i2 = t2.transforms.length, a2 = e2; r < i2 && !e2; ) {
        if (t2.transforms[r].transform.mProps._mdf) {
          a2 = true;
          break;
        }
        r += 1;
      }
      if (a2) for (t2.finalTransform.reset(), r = i2 - 1; r >= 0; r -= 1) t2.finalTransform.multiply(t2.transforms[r].transform.mProps.v);
      t2._mdf = a2;
    }, processSequences: function(t2) {
      var e2, r = this.sequenceList.length;
      for (e2 = 0; e2 < r; e2 += 1) this.processSequence(this.sequenceList[e2], t2);
    }, getNewKey: function() {
      return this.transform_key_count += 1, "_" + this.transform_key_count;
    } };
    var lumaLoader = function() {
      var t2 = "__lottie_element_luma_buffer", e2 = null, r = null, i2 = null;
      function a2() {
        var a3, s2, n2;
        e2 || (a3 = createNS("svg"), s2 = createNS("filter"), n2 = createNS("feColorMatrix"), s2.setAttribute("id", t2), n2.setAttribute("type", "matrix"), n2.setAttribute("color-interpolation-filters", "sRGB"), n2.setAttribute("values", "0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0"), s2.appendChild(n2), a3.appendChild(s2), a3.setAttribute("id", t2 + "_svg"), featureSupport.svgLumaHidden && (a3.style.display = "none"), i2 = a3, document.body.appendChild(i2), e2 = createTag("canvas"), (r = e2.getContext("2d")).filter = "url(#" + t2 + ")", r.fillStyle = "rgba(0,0,0,0)", r.fillRect(0, 0, 1, 1));
      }
      return { load: a2, get: function(i3) {
        return e2 || a2(), e2.width = i3.width, e2.height = i3.height, r.filter = "url(#" + t2 + ")", e2;
      } };
    };
    function createCanvas(t2, e2) {
      if (featureSupport.offscreenCanvas) return new OffscreenCanvas(t2, e2);
      var r = createTag("canvas");
      return r.width = t2, r.height = e2, r;
    }
    var assetLoader = { loadLumaCanvas: lumaLoader.load, getLumaCanvas: lumaLoader.get, createCanvas }, registeredEffects = {};
    function CVEffects(t2) {
      var e2, r, i2 = t2.data.ef ? t2.data.ef.length : 0;
      for (this.filters = [], e2 = 0; e2 < i2; e2 += 1) {
        r = null;
        var a2 = t2.data.ef[e2].ty;
        if (registeredEffects[a2]) r = new registeredEffects[a2].effect(t2.effectsManager.effectElements[e2], t2);
        r && this.filters.push(r);
      }
      this.filters.length && t2.addRenderableComponent(this);
    }
    function registerEffect(t2, e2) {
      registeredEffects[t2] = { effect: e2 };
    }
    function CVMaskElement(t2, e2) {
      var r;
      this.data = t2, this.element = e2, this.masksProperties = this.data.masksProperties || [], this.viewData = createSizedArray(this.masksProperties.length);
      var i2 = this.masksProperties.length, a2 = false;
      for (r = 0; r < i2; r += 1) "n" !== this.masksProperties[r].mode && (a2 = true), this.viewData[r] = ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[r], 3);
      this.hasMasks = a2, a2 && this.element.addRenderableComponent(this);
    }
    function CVBaseElement() {
    }
    CVEffects.prototype.renderFrame = function(t2) {
      var e2, r = this.filters.length;
      for (e2 = 0; e2 < r; e2 += 1) this.filters[e2].renderFrame(t2);
    }, CVEffects.prototype.getEffects = function(t2) {
      var e2, r = this.filters.length, i2 = [];
      for (e2 = 0; e2 < r; e2 += 1) this.filters[e2].type === t2 && i2.push(this.filters[e2]);
      return i2;
    }, CVMaskElement.prototype.renderFrame = function() {
      if (this.hasMasks) {
        var t2, e2, r, i2, a2 = this.element.finalTransform.mat, s2 = this.element.canvasContext, n2 = this.masksProperties.length;
        for (s2.beginPath(), t2 = 0; t2 < n2; t2 += 1) if ("n" !== this.masksProperties[t2].mode) {
          var o2;
          this.masksProperties[t2].inv && (s2.moveTo(0, 0), s2.lineTo(this.element.globalData.compSize.w, 0), s2.lineTo(this.element.globalData.compSize.w, this.element.globalData.compSize.h), s2.lineTo(0, this.element.globalData.compSize.h), s2.lineTo(0, 0)), i2 = this.viewData[t2].v, e2 = a2.applyToPointArray(i2.v[0][0], i2.v[0][1], 0), s2.moveTo(e2[0], e2[1]);
          var h2 = i2._length;
          for (o2 = 1; o2 < h2; o2 += 1) r = a2.applyToTriplePoints(i2.o[o2 - 1], i2.i[o2], i2.v[o2]), s2.bezierCurveTo(r[0], r[1], r[2], r[3], r[4], r[5]);
          r = a2.applyToTriplePoints(i2.o[o2 - 1], i2.i[0], i2.v[0]), s2.bezierCurveTo(r[0], r[1], r[2], r[3], r[4], r[5]);
        }
        this.element.globalData.renderer.save(true), s2.clip();
      }
    }, CVMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty, CVMaskElement.prototype.destroy = function() {
      this.element = null;
    };
    var operationsMap = { 1: "source-in", 2: "source-out", 3: "source-in", 4: "source-out" };
    function CVShapeData(t2, e2, r, i2) {
      this.styledShapes = [], this.tr = [0, 0, 0, 0, 0, 0];
      var a2, s2 = 4;
      "rc" === e2.ty ? s2 = 5 : "el" === e2.ty ? s2 = 6 : "sr" === e2.ty && (s2 = 7), this.sh = ShapePropertyFactory.getShapeProp(t2, e2, s2, t2);
      var n2, o2 = r.length;
      for (a2 = 0; a2 < o2; a2 += 1) r[a2].closed || (n2 = { transforms: i2.addTransformSequence(r[a2].transforms), trNodes: [] }, this.styledShapes.push(n2), r[a2].elements.push(n2));
    }
    function CVShapeElement(t2, e2, r) {
      this.shapes = [], this.shapesData = t2.shapes, this.stylesList = [], this.itemsData = [], this.prevViewData = [], this.shapeModifiers = [], this.processedElements = [], this.transformsManager = new ShapeTransformManager(), this.initElement(t2, e2, r);
    }
    function CVTextElement(t2, e2, r) {
      this.textSpans = [], this.yOffset = 0, this.fillColorAnim = false, this.strokeColorAnim = false, this.strokeWidthAnim = false, this.stroke = false, this.fill = false, this.justifyOffset = 0, this.currentRender = null, this.renderType = "canvas", this.values = { fill: "rgba(0,0,0,0)", stroke: "rgba(0,0,0,0)", sWidth: 0, fValue: "" }, this.initElement(t2, e2, r);
    }
    function CVImageElement(t2, e2, r) {
      this.assetData = e2.getAssetData(t2.refId), this.img = e2.imageLoader.getAsset(this.assetData), this.initElement(t2, e2, r);
    }
    function CVSolidElement(t2, e2, r) {
      this.initElement(t2, e2, r);
    }
    function CanvasRendererBase() {
    }
    function CanvasContext() {
      this.opacity = -1, this.transform = createTypedArray("float32", 16), this.fillStyle = "", this.strokeStyle = "", this.lineWidth = "", this.lineCap = "", this.lineJoin = "", this.miterLimit = "", this.id = Math.random();
    }
    function CVContextData() {
      var t2;
      this.stack = [], this.cArrPos = 0, this.cTr = new Matrix();
      for (t2 = 0; t2 < 15; t2 += 1) {
        var e2 = new CanvasContext();
        this.stack[t2] = e2;
      }
      this._length = 15, this.nativeContext = null, this.transformMat = new Matrix(), this.currentOpacity = 1, this.currentFillStyle = "", this.appliedFillStyle = "", this.currentStrokeStyle = "", this.appliedStrokeStyle = "", this.currentLineWidth = "", this.appliedLineWidth = "", this.currentLineCap = "", this.appliedLineCap = "", this.currentLineJoin = "", this.appliedLineJoin = "", this.appliedMiterLimit = "", this.currentMiterLimit = "";
    }
    function CVCompElement(t2, e2, r) {
      this.completeLayers = false, this.layers = t2.layers, this.pendingElements = [], this.elements = createSizedArray(this.layers.length), this.initElement(t2, e2, r), this.tm = t2.tm ? PropertyFactory.getProp(this, t2.tm, 0, e2.frameRate, this) : { _placeholder: true };
    }
    function CanvasRenderer(t2, e2) {
      this.animationItem = t2, this.renderConfig = { clearCanvas: !e2 || void 0 === e2.clearCanvas || e2.clearCanvas, context: e2 && e2.context || null, progressiveLoad: e2 && e2.progressiveLoad || false, preserveAspectRatio: e2 && e2.preserveAspectRatio || "xMidYMid meet", imagePreserveAspectRatio: e2 && e2.imagePreserveAspectRatio || "xMidYMid slice", contentVisibility: e2 && e2.contentVisibility || "visible", className: e2 && e2.className || "", id: e2 && e2.id || "", runExpressions: !e2 || void 0 === e2.runExpressions || e2.runExpressions }, this.renderConfig.dpr = e2 && e2.dpr || 1, this.animationItem.wrapper && (this.renderConfig.dpr = e2 && e2.dpr || window.devicePixelRatio || 1), this.renderedFrame = -1, this.globalData = { frameNum: -1, _mdf: false, renderConfig: this.renderConfig, currentGlobalAlpha: -1 }, this.contextData = new CVContextData(), this.elements = [], this.pendingElements = [], this.transformMat = new Matrix(), this.completeLayers = false, this.rendererType = "canvas", this.renderConfig.clearCanvas && (this.ctxTransform = this.contextData.transform.bind(this.contextData), this.ctxOpacity = this.contextData.opacity.bind(this.contextData), this.ctxFillStyle = this.contextData.fillStyle.bind(this.contextData), this.ctxStrokeStyle = this.contextData.strokeStyle.bind(this.contextData), this.ctxLineWidth = this.contextData.lineWidth.bind(this.contextData), this.ctxLineCap = this.contextData.lineCap.bind(this.contextData), this.ctxLineJoin = this.contextData.lineJoin.bind(this.contextData), this.ctxMiterLimit = this.contextData.miterLimit.bind(this.contextData), this.ctxFill = this.contextData.fill.bind(this.contextData), this.ctxFillRect = this.contextData.fillRect.bind(this.contextData), this.ctxStroke = this.contextData.stroke.bind(this.contextData), this.save = this.contextData.save.bind(this.contextData));
    }
    function HBaseElement() {
    }
    function HSolidElement(t2, e2, r) {
      this.initElement(t2, e2, r);
    }
    function HShapeElement(t2, e2, r) {
      this.shapes = [], this.shapesData = t2.shapes, this.stylesList = [], this.shapeModifiers = [], this.itemsData = [], this.processedElements = [], this.animatedContents = [], this.shapesContainer = createNS("g"), this.initElement(t2, e2, r), this.prevViewData = [], this.currentBBox = { x: 999999, y: -999999, h: 0, w: 0 };
    }
    function HTextElement(t2, e2, r) {
      this.textSpans = [], this.textPaths = [], this.currentBBox = { x: 999999, y: -999999, h: 0, w: 0 }, this.renderType = "svg", this.isMasked = false, this.initElement(t2, e2, r);
    }
    function HCameraElement(t2, e2, r) {
      this.initFrame(), this.initBaseData(t2, e2, r), this.initHierarchy();
      var i2 = PropertyFactory.getProp;
      if (this.pe = i2(this, t2.pe, 0, 0, this), t2.ks.p.s ? (this.px = i2(this, t2.ks.p.x, 1, 0, this), this.py = i2(this, t2.ks.p.y, 1, 0, this), this.pz = i2(this, t2.ks.p.z, 1, 0, this)) : this.p = i2(this, t2.ks.p, 1, 0, this), t2.ks.a && (this.a = i2(this, t2.ks.a, 1, 0, this)), t2.ks.or.k.length && t2.ks.or.k[0].to) {
        var a2, s2 = t2.ks.or.k.length;
        for (a2 = 0; a2 < s2; a2 += 1) t2.ks.or.k[a2].to = null, t2.ks.or.k[a2].ti = null;
      }
      this.or = i2(this, t2.ks.or, 1, degToRads, this), this.or.sh = true, this.rx = i2(this, t2.ks.rx, 0, degToRads, this), this.ry = i2(this, t2.ks.ry, 0, degToRads, this), this.rz = i2(this, t2.ks.rz, 0, degToRads, this), this.mat = new Matrix(), this._prevMat = new Matrix(), this._isFirstFrame = true, this.finalTransform = { mProp: this };
    }
    function HImageElement(t2, e2, r) {
      this.assetData = e2.getAssetData(t2.refId), this.initElement(t2, e2, r);
    }
    function HybridRendererBase(t2, e2) {
      this.animationItem = t2, this.layers = null, this.renderedFrame = -1, this.renderConfig = { className: e2 && e2.className || "", imagePreserveAspectRatio: e2 && e2.imagePreserveAspectRatio || "xMidYMid slice", hideOnTransparent: !(e2 && false === e2.hideOnTransparent), filterSize: { width: e2 && e2.filterSize && e2.filterSize.width || "400%", height: e2 && e2.filterSize && e2.filterSize.height || "400%", x: e2 && e2.filterSize && e2.filterSize.x || "-100%", y: e2 && e2.filterSize && e2.filterSize.y || "-100%" } }, this.globalData = { _mdf: false, frameNum: -1, renderConfig: this.renderConfig }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = false, this.camera = null, this.supports3d = true, this.rendererType = "html";
    }
    function HCompElement(t2, e2, r) {
      this.layers = t2.layers, this.supports3d = !t2.hasMask, this.completeLayers = false, this.pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) : [], this.initElement(t2, e2, r), this.tm = t2.tm ? PropertyFactory.getProp(this, t2.tm, 0, e2.frameRate, this) : { _placeholder: true };
    }
    function HybridRenderer(t2, e2) {
      this.animationItem = t2, this.layers = null, this.renderedFrame = -1, this.renderConfig = { className: e2 && e2.className || "", imagePreserveAspectRatio: e2 && e2.imagePreserveAspectRatio || "xMidYMid slice", hideOnTransparent: !(e2 && false === e2.hideOnTransparent), filterSize: { width: e2 && e2.filterSize && e2.filterSize.width || "400%", height: e2 && e2.filterSize && e2.filterSize.height || "400%", x: e2 && e2.filterSize && e2.filterSize.x || "-100%", y: e2 && e2.filterSize && e2.filterSize.y || "-100%" }, runExpressions: !e2 || void 0 === e2.runExpressions || e2.runExpressions }, this.globalData = { _mdf: false, frameNum: -1, renderConfig: this.renderConfig }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this.destroyed = false, this.camera = null, this.supports3d = true, this.rendererType = "html";
    }
    CVBaseElement.prototype = { createElements: function() {
    }, initRendererElement: function() {
    }, createContainerElements: function() {
      if (this.data.tt >= 1) {
        this.buffers = [];
        var t2 = this.globalData.canvasContext, e2 = assetLoader.createCanvas(t2.canvas.width, t2.canvas.height);
        this.buffers.push(e2);
        var r = assetLoader.createCanvas(t2.canvas.width, t2.canvas.height);
        this.buffers.push(r), this.data.tt >= 3 && !document._isProxy && assetLoader.loadLumaCanvas();
      }
      this.canvasContext = this.globalData.canvasContext, this.transformCanvas = this.globalData.transformCanvas, this.renderableEffectsManager = new CVEffects(this), this.searchEffectTransforms();
    }, createContent: function() {
    }, setBlendMode: function() {
      var t2 = this.globalData;
      if (t2.blendMode !== this.data.bm) {
        t2.blendMode = this.data.bm;
        var e2 = getBlendMode(this.data.bm);
        t2.canvasContext.globalCompositeOperation = e2;
      }
    }, createRenderableComponents: function() {
      this.maskManager = new CVMaskElement(this.data, this), this.transformEffects = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
    }, hideElement: function() {
      this.hidden || this.isInRange && !this.isTransparent || (this.hidden = true);
    }, showElement: function() {
      this.isInRange && !this.isTransparent && (this.hidden = false, this._isFirstFrame = true, this.maskManager._isFirstFrame = true);
    }, clearCanvas: function(t2) {
      t2.clearRect(this.transformCanvas.tx, this.transformCanvas.ty, this.transformCanvas.w * this.transformCanvas.sx, this.transformCanvas.h * this.transformCanvas.sy);
    }, prepareLayer: function() {
      if (this.data.tt >= 1) {
        var t2 = this.buffers[0].getContext("2d");
        this.clearCanvas(t2), t2.drawImage(this.canvasContext.canvas, 0, 0), this.currentTransform = this.canvasContext.getTransform(), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform);
      }
    }, exitLayer: function() {
      if (this.data.tt >= 1) {
        var t2 = this.buffers[1], e2 = t2.getContext("2d");
        if (this.clearCanvas(e2), e2.drawImage(this.canvasContext.canvas, 0, 0), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.setTransform(this.currentTransform), this.comp.getElementById("tp" in this.data ? this.data.tp : this.data.ind - 1).renderFrame(true), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0), this.data.tt >= 3 && !document._isProxy) {
          var r = assetLoader.getLumaCanvas(this.canvasContext.canvas);
          r.getContext("2d").drawImage(this.canvasContext.canvas, 0, 0), this.clearCanvas(this.canvasContext), this.canvasContext.drawImage(r, 0, 0);
        }
        this.canvasContext.globalCompositeOperation = operationsMap[this.data.tt], this.canvasContext.drawImage(t2, 0, 0), this.canvasContext.globalCompositeOperation = "destination-over", this.canvasContext.drawImage(this.buffers[0], 0, 0), this.canvasContext.setTransform(this.currentTransform), this.canvasContext.globalCompositeOperation = "source-over";
      }
    }, renderFrame: function(t2) {
      if (!this.hidden && !this.data.hd && (1 !== this.data.td || t2)) {
        this.renderTransform(), this.renderRenderable(), this.renderLocalTransform(), this.setBlendMode();
        var e2 = 0 === this.data.ty;
        this.prepareLayer(), this.globalData.renderer.save(e2), this.globalData.renderer.ctxTransform(this.finalTransform.localMat.props), this.globalData.renderer.ctxOpacity(this.finalTransform.localOpacity), this.renderInnerContent(), this.globalData.renderer.restore(e2), this.exitLayer(), this.maskManager.hasMasks && this.globalData.renderer.restore(true), this._isFirstFrame && (this._isFirstFrame = false);
      }
    }, destroy: function() {
      this.canvasContext = null, this.data = null, this.globalData = null, this.maskManager.destroy();
    }, mHelper: new Matrix() }, CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement, CVBaseElement.prototype.show = CVBaseElement.prototype.showElement, CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated, extendPrototype([BaseElement, TransformElement, CVBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableElement], CVShapeElement), CVShapeElement.prototype.initElement = RenderableDOMElement.prototype.initElement, CVShapeElement.prototype.transformHelper = { opacity: 1, _opMdf: false }, CVShapeElement.prototype.dashResetter = [], CVShapeElement.prototype.createContent = function() {
      this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
    }, CVShapeElement.prototype.createStyleElement = function(t2, e2) {
      var r = { data: t2, type: t2.ty, preTransforms: this.transformsManager.addTransformSequence(e2), transforms: [], elements: [], closed: true === t2.hd }, i2 = {};
      if ("fl" === t2.ty || "st" === t2.ty ? (i2.c = PropertyFactory.getProp(this, t2.c, 1, 255, this), i2.c.k || (r.co = "rgb(" + bmFloor(i2.c.v[0]) + "," + bmFloor(i2.c.v[1]) + "," + bmFloor(i2.c.v[2]) + ")")) : "gf" !== t2.ty && "gs" !== t2.ty || (i2.s = PropertyFactory.getProp(this, t2.s, 1, null, this), i2.e = PropertyFactory.getProp(this, t2.e, 1, null, this), i2.h = PropertyFactory.getProp(this, t2.h || { k: 0 }, 0, 0.01, this), i2.a = PropertyFactory.getProp(this, t2.a || { k: 0 }, 0, degToRads, this), i2.g = new GradientProperty(this, t2.g, this)), i2.o = PropertyFactory.getProp(this, t2.o, 0, 0.01, this), "st" === t2.ty || "gs" === t2.ty) {
        if (r.lc = lineCapEnum[t2.lc || 2], r.lj = lineJoinEnum[t2.lj || 2], 1 == t2.lj && (r.ml = t2.ml), i2.w = PropertyFactory.getProp(this, t2.w, 0, null, this), i2.w.k || (r.wi = i2.w.v), t2.d) {
          var a2 = new DashProperty(this, t2.d, "canvas", this);
          i2.d = a2, i2.d.k || (r.da = i2.d.dashArray, r.do = i2.d.dashoffset[0]);
        }
      } else r.r = 2 === t2.r ? "evenodd" : "nonzero";
      return this.stylesList.push(r), i2.style = r, i2;
    }, CVShapeElement.prototype.createGroupElement = function() {
      return { it: [], prevViewData: [] };
    }, CVShapeElement.prototype.createTransformElement = function(t2) {
      return { transform: { opacity: 1, _opMdf: false, key: this.transformsManager.getNewKey(), op: PropertyFactory.getProp(this, t2.o, 0, 0.01, this), mProps: TransformPropertyFactory.getTransformProperty(this, t2, this) } };
    }, CVShapeElement.prototype.createShapeElement = function(t2) {
      var e2 = new CVShapeData(this, t2, this.stylesList, this.transformsManager);
      return this.shapes.push(e2), this.addShapeToModifiers(e2), e2;
    }, CVShapeElement.prototype.reloadShapes = function() {
      var t2;
      this._isFirstFrame = true;
      var e2 = this.itemsData.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.prevViewData[t2] = this.itemsData[t2];
      for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []), e2 = this.dynamicProperties.length, t2 = 0; t2 < e2; t2 += 1) this.dynamicProperties[t2].getValue();
      this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame);
    }, CVShapeElement.prototype.addTransformToStyleList = function(t2) {
      var e2, r = this.stylesList.length;
      for (e2 = 0; e2 < r; e2 += 1) this.stylesList[e2].closed || this.stylesList[e2].transforms.push(t2);
    }, CVShapeElement.prototype.removeTransformFromStyleList = function() {
      var t2, e2 = this.stylesList.length;
      for (t2 = 0; t2 < e2; t2 += 1) this.stylesList[t2].closed || this.stylesList[t2].transforms.pop();
    }, CVShapeElement.prototype.closeStyles = function(t2) {
      var e2, r = t2.length;
      for (e2 = 0; e2 < r; e2 += 1) t2[e2].closed = true;
    }, CVShapeElement.prototype.searchShapes = function(t2, e2, r, i2, a2) {
      var s2, n2, o2, h2, l2, p2, f2 = t2.length - 1, c2 = [], m2 = [], d2 = [].concat(a2);
      for (s2 = f2; s2 >= 0; s2 -= 1) {
        if ((h2 = this.searchProcessedElement(t2[s2])) ? e2[s2] = r[h2 - 1] : t2[s2]._shouldRender = i2, "fl" === t2[s2].ty || "st" === t2[s2].ty || "gf" === t2[s2].ty || "gs" === t2[s2].ty) h2 ? e2[s2].style.closed = false : e2[s2] = this.createStyleElement(t2[s2], d2), c2.push(e2[s2].style);
        else if ("gr" === t2[s2].ty) {
          if (h2) for (o2 = e2[s2].it.length, n2 = 0; n2 < o2; n2 += 1) e2[s2].prevViewData[n2] = e2[s2].it[n2];
          else e2[s2] = this.createGroupElement(t2[s2]);
          this.searchShapes(t2[s2].it, e2[s2].it, e2[s2].prevViewData, i2, d2);
        } else "tr" === t2[s2].ty ? (h2 || (p2 = this.createTransformElement(t2[s2]), e2[s2] = p2), d2.push(e2[s2]), this.addTransformToStyleList(e2[s2])) : "sh" === t2[s2].ty || "rc" === t2[s2].ty || "el" === t2[s2].ty || "sr" === t2[s2].ty ? h2 || (e2[s2] = this.createShapeElement(t2[s2])) : "tm" === t2[s2].ty || "rd" === t2[s2].ty || "pb" === t2[s2].ty || "zz" === t2[s2].ty || "op" === t2[s2].ty ? (h2 ? (l2 = e2[s2]).closed = false : ((l2 = ShapeModifiers.getModifier(t2[s2].ty)).init(this, t2[s2]), e2[s2] = l2, this.shapeModifiers.push(l2)), m2.push(l2)) : "rp" === t2[s2].ty && (h2 ? (l2 = e2[s2]).closed = true : (l2 = ShapeModifiers.getModifier(t2[s2].ty), e2[s2] = l2, l2.init(this, t2, s2, e2), this.shapeModifiers.push(l2), i2 = false), m2.push(l2));
        this.addProcessedElement(t2[s2], s2 + 1);
      }
      for (this.removeTransformFromStyleList(), this.closeStyles(c2), f2 = m2.length, s2 = 0; s2 < f2; s2 += 1) m2[s2].closed = true;
    }, CVShapeElement.prototype.renderInnerContent = function() {
      this.transformHelper.opacity = 1, this.transformHelper._opMdf = false, this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame), this.renderShape(this.transformHelper, this.shapesData, this.itemsData, true);
    }, CVShapeElement.prototype.renderShapeTransform = function(t2, e2) {
      (t2._opMdf || e2.op._mdf || this._isFirstFrame) && (e2.opacity = t2.opacity, e2.opacity *= e2.op.v, e2._opMdf = true);
    }, CVShapeElement.prototype.drawLayer = function() {
      var t2, e2, r, i2, a2, s2, n2, o2, h2, l2 = this.stylesList.length, p2 = this.globalData.renderer, f2 = this.globalData.canvasContext;
      for (t2 = 0; t2 < l2; t2 += 1) if (("st" !== (o2 = (h2 = this.stylesList[t2]).type) && "gs" !== o2 || 0 !== h2.wi) && h2.data._shouldRender && 0 !== h2.coOp && 0 !== this.globalData.currentGlobalAlpha) {
        for (p2.save(), s2 = h2.elements, "st" === o2 || "gs" === o2 ? (p2.ctxStrokeStyle("st" === o2 ? h2.co : h2.grd), p2.ctxLineWidth(h2.wi), p2.ctxLineCap(h2.lc), p2.ctxLineJoin(h2.lj), p2.ctxMiterLimit(h2.ml || 0)) : p2.ctxFillStyle("fl" === o2 ? h2.co : h2.grd), p2.ctxOpacity(h2.coOp), "st" !== o2 && "gs" !== o2 && f2.beginPath(), p2.ctxTransform(h2.preTransforms.finalTransform.props), r = s2.length, e2 = 0; e2 < r; e2 += 1) {
          for ("st" !== o2 && "gs" !== o2 || (f2.beginPath(), h2.da && (f2.setLineDash(h2.da), f2.lineDashOffset = h2.do)), a2 = (n2 = s2[e2].trNodes).length, i2 = 0; i2 < a2; i2 += 1) "m" === n2[i2].t ? f2.moveTo(n2[i2].p[0], n2[i2].p[1]) : "c" === n2[i2].t ? f2.bezierCurveTo(n2[i2].pts[0], n2[i2].pts[1], n2[i2].pts[2], n2[i2].pts[3], n2[i2].pts[4], n2[i2].pts[5]) : f2.closePath();
          "st" !== o2 && "gs" !== o2 || (p2.ctxStroke(), h2.da && f2.setLineDash(this.dashResetter));
        }
        "st" !== o2 && "gs" !== o2 && this.globalData.renderer.ctxFill(h2.r), p2.restore();
      }
    }, CVShapeElement.prototype.renderShape = function(t2, e2, r, i2) {
      var a2, s2;
      for (s2 = t2, a2 = e2.length - 1; a2 >= 0; a2 -= 1) "tr" === e2[a2].ty ? (s2 = r[a2].transform, this.renderShapeTransform(t2, s2)) : "sh" === e2[a2].ty || "el" === e2[a2].ty || "rc" === e2[a2].ty || "sr" === e2[a2].ty ? this.renderPath(e2[a2], r[a2]) : "fl" === e2[a2].ty ? this.renderFill(e2[a2], r[a2], s2) : "st" === e2[a2].ty ? this.renderStroke(e2[a2], r[a2], s2) : "gf" === e2[a2].ty || "gs" === e2[a2].ty ? this.renderGradientFill(e2[a2], r[a2], s2) : "gr" === e2[a2].ty ? this.renderShape(s2, e2[a2].it, r[a2].it) : e2[a2].ty;
      i2 && this.drawLayer();
    }, CVShapeElement.prototype.renderStyledShape = function(t2, e2) {
      if (this._isFirstFrame || e2._mdf || t2.transforms._mdf) {
        var r, i2, a2, s2 = t2.trNodes, n2 = e2.paths, o2 = n2._length;
        s2.length = 0;
        var h2 = t2.transforms.finalTransform;
        for (a2 = 0; a2 < o2; a2 += 1) {
          var l2 = n2.shapes[a2];
          if (l2 && l2.v) {
            for (i2 = l2._length, r = 1; r < i2; r += 1) 1 === r && s2.push({ t: "m", p: h2.applyToPointArray(l2.v[0][0], l2.v[0][1], 0) }), s2.push({ t: "c", pts: h2.applyToTriplePoints(l2.o[r - 1], l2.i[r], l2.v[r]) });
            1 === i2 && s2.push({ t: "m", p: h2.applyToPointArray(l2.v[0][0], l2.v[0][1], 0) }), l2.c && i2 && (s2.push({ t: "c", pts: h2.applyToTriplePoints(l2.o[r - 1], l2.i[0], l2.v[0]) }), s2.push({ t: "z" }));
          }
        }
        t2.trNodes = s2;
      }
    }, CVShapeElement.prototype.renderPath = function(t2, e2) {
      if (true !== t2.hd && t2._shouldRender) {
        var r, i2 = e2.styledShapes.length;
        for (r = 0; r < i2; r += 1) this.renderStyledShape(e2.styledShapes[r], e2.sh);
      }
    }, CVShapeElement.prototype.renderFill = function(t2, e2, r) {
      var i2 = e2.style;
      (e2.c._mdf || this._isFirstFrame) && (i2.co = "rgb(" + bmFloor(e2.c.v[0]) + "," + bmFloor(e2.c.v[1]) + "," + bmFloor(e2.c.v[2]) + ")"), (e2.o._mdf || r._opMdf || this._isFirstFrame) && (i2.coOp = e2.o.v * r.opacity);
    }, CVShapeElement.prototype.renderGradientFill = function(t2, e2, r) {
      var i2, a2 = e2.style;
      if (!a2.grd || e2.g._mdf || e2.s._mdf || e2.e._mdf || 1 !== t2.t && (e2.h._mdf || e2.a._mdf)) {
        var s2, n2 = this.globalData.canvasContext, o2 = e2.s.v, h2 = e2.e.v;
        if (1 === t2.t) i2 = n2.createLinearGradient(o2[0], o2[1], h2[0], h2[1]);
        else {
          var l2 = Math.sqrt(Math.pow(o2[0] - h2[0], 2) + Math.pow(o2[1] - h2[1], 2)), p2 = Math.atan2(h2[1] - o2[1], h2[0] - o2[0]), f2 = e2.h.v;
          f2 >= 1 ? f2 = 0.99 : f2 <= -1 && (f2 = -0.99);
          var c2 = l2 * f2, m2 = Math.cos(p2 + e2.a.v) * c2 + o2[0], d2 = Math.sin(p2 + e2.a.v) * c2 + o2[1];
          i2 = n2.createRadialGradient(m2, d2, 0, o2[0], o2[1], l2);
        }
        var u2 = t2.g.p, y = e2.g.c, g2 = 1;
        for (s2 = 0; s2 < u2; s2 += 1) e2.g._hasOpacity && e2.g._collapsable && (g2 = e2.g.o[2 * s2 + 1]), i2.addColorStop(y[4 * s2] / 100, "rgba(" + y[4 * s2 + 1] + "," + y[4 * s2 + 2] + "," + y[4 * s2 + 3] + "," + g2 + ")");
        a2.grd = i2;
      }
      a2.coOp = e2.o.v * r.opacity;
    }, CVShapeElement.prototype.renderStroke = function(t2, e2, r) {
      var i2 = e2.style, a2 = e2.d;
      a2 && (a2._mdf || this._isFirstFrame) && (i2.da = a2.dashArray, i2.do = a2.dashoffset[0]), (e2.c._mdf || this._isFirstFrame) && (i2.co = "rgb(" + bmFloor(e2.c.v[0]) + "," + bmFloor(e2.c.v[1]) + "," + bmFloor(e2.c.v[2]) + ")"), (e2.o._mdf || r._opMdf || this._isFirstFrame) && (i2.coOp = e2.o.v * r.opacity), (e2.w._mdf || this._isFirstFrame) && (i2.wi = e2.w.v);
    }, CVShapeElement.prototype.destroy = function() {
      this.shapesData = null, this.globalData = null, this.canvasContext = null, this.stylesList.length = 0, this.itemsData.length = 0;
    }, extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement, ITextElement], CVTextElement), CVTextElement.prototype.tHelper = createTag("canvas").getContext("2d"), CVTextElement.prototype.buildNewText = function() {
      var t2 = this.textProperty.currentData;
      this.renderedLetters = createSizedArray(t2.l ? t2.l.length : 0);
      var e2 = false;
      t2.fc ? (e2 = true, this.values.fill = this.buildColor(t2.fc)) : this.values.fill = "rgba(0,0,0,0)", this.fill = e2;
      var r = false;
      t2.sc && (r = true, this.values.stroke = this.buildColor(t2.sc), this.values.sWidth = t2.sw);
      var i2, a2, s2, n2, o2, h2, l2, p2, f2, c2, m2, d2, u2 = this.globalData.fontManager.getFontByName(t2.f), y = t2.l, g2 = this.mHelper;
      this.stroke = r, this.values.fValue = t2.finalSize + "px " + this.globalData.fontManager.getFontByName(t2.f).fFamily, a2 = t2.finalText.length;
      var v2 = this.data.singleShape, b = 1e-3 * t2.tr * t2.finalSize, x = 0, E2 = 0, S2 = true, P2 = 0;
      for (i2 = 0; i2 < a2; i2 += 1) {
        n2 = (s2 = this.globalData.fontManager.getCharData(t2.finalText[i2], u2.fStyle, this.globalData.fontManager.getFontByName(t2.f).fFamily)) && s2.data || {}, g2.reset(), v2 && y[i2].n && (x = -b, E2 += t2.yOffset, E2 += S2 ? 1 : 0, S2 = false), f2 = (l2 = n2.shapes ? n2.shapes[0].it : []).length, g2.scale(t2.finalSize / 100, t2.finalSize / 100), v2 && this.applyTextPropertiesToMatrix(t2, g2, y[i2].line, x, E2), m2 = createSizedArray(f2 - 1);
        var C2 = 0;
        for (p2 = 0; p2 < f2; p2 += 1) if ("sh" === l2[p2].ty) {
          for (h2 = l2[p2].ks.k.i.length, c2 = l2[p2].ks.k, d2 = [], o2 = 1; o2 < h2; o2 += 1) 1 === o2 && d2.push(g2.applyToX(c2.v[0][0], c2.v[0][1], 0), g2.applyToY(c2.v[0][0], c2.v[0][1], 0)), d2.push(g2.applyToX(c2.o[o2 - 1][0], c2.o[o2 - 1][1], 0), g2.applyToY(c2.o[o2 - 1][0], c2.o[o2 - 1][1], 0), g2.applyToX(c2.i[o2][0], c2.i[o2][1], 0), g2.applyToY(c2.i[o2][0], c2.i[o2][1], 0), g2.applyToX(c2.v[o2][0], c2.v[o2][1], 0), g2.applyToY(c2.v[o2][0], c2.v[o2][1], 0));
          d2.push(g2.applyToX(c2.o[o2 - 1][0], c2.o[o2 - 1][1], 0), g2.applyToY(c2.o[o2 - 1][0], c2.o[o2 - 1][1], 0), g2.applyToX(c2.i[0][0], c2.i[0][1], 0), g2.applyToY(c2.i[0][0], c2.i[0][1], 0), g2.applyToX(c2.v[0][0], c2.v[0][1], 0), g2.applyToY(c2.v[0][0], c2.v[0][1], 0)), m2[C2] = d2, C2 += 1;
        }
        v2 && (x += y[i2].l, x += b), this.textSpans[P2] ? this.textSpans[P2].elem = m2 : this.textSpans[P2] = { elem: m2 }, P2 += 1;
      }
    }, CVTextElement.prototype.renderInnerContent = function() {
      var t2, e2, r, i2, a2, s2;
      this.validateText(), this.canvasContext.font = this.values.fValue, this.globalData.renderer.ctxLineCap("butt"), this.globalData.renderer.ctxLineJoin("miter"), this.globalData.renderer.ctxMiterLimit(4), this.data.singleShape || this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
      var n2, o2 = this.textAnimator.renderedLetters, h2 = this.textProperty.currentData.l;
      e2 = h2.length;
      var l2, p2, f2 = null, c2 = null, m2 = null, d2 = this.globalData.renderer;
      for (t2 = 0; t2 < e2; t2 += 1) if (!h2[t2].n) {
        if ((n2 = o2[t2]) && (d2.save(), d2.ctxTransform(n2.p), d2.ctxOpacity(n2.o)), this.fill) {
          for (n2 && n2.fc ? f2 !== n2.fc && (d2.ctxFillStyle(n2.fc), f2 = n2.fc) : f2 !== this.values.fill && (f2 = this.values.fill, d2.ctxFillStyle(this.values.fill)), i2 = (l2 = this.textSpans[t2].elem).length, this.globalData.canvasContext.beginPath(), r = 0; r < i2; r += 1) for (s2 = (p2 = l2[r]).length, this.globalData.canvasContext.moveTo(p2[0], p2[1]), a2 = 2; a2 < s2; a2 += 6) this.globalData.canvasContext.bezierCurveTo(p2[a2], p2[a2 + 1], p2[a2 + 2], p2[a2 + 3], p2[a2 + 4], p2[a2 + 5]);
          this.globalData.canvasContext.closePath(), d2.ctxFill();
        }
        if (this.stroke) {
          for (n2 && n2.sw ? m2 !== n2.sw && (m2 = n2.sw, d2.ctxLineWidth(n2.sw)) : m2 !== this.values.sWidth && (m2 = this.values.sWidth, d2.ctxLineWidth(this.values.sWidth)), n2 && n2.sc ? c2 !== n2.sc && (c2 = n2.sc, d2.ctxStrokeStyle(n2.sc)) : c2 !== this.values.stroke && (c2 = this.values.stroke, d2.ctxStrokeStyle(this.values.stroke)), i2 = (l2 = this.textSpans[t2].elem).length, this.globalData.canvasContext.beginPath(), r = 0; r < i2; r += 1) for (s2 = (p2 = l2[r]).length, this.globalData.canvasContext.moveTo(p2[0], p2[1]), a2 = 2; a2 < s2; a2 += 6) this.globalData.canvasContext.bezierCurveTo(p2[a2], p2[a2 + 1], p2[a2 + 2], p2[a2 + 3], p2[a2 + 4], p2[a2 + 5]);
          this.globalData.canvasContext.closePath(), d2.ctxStroke();
        }
        n2 && this.globalData.renderer.restore();
      }
    }, extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVImageElement), CVImageElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVImageElement.prototype.createContent = function() {
      if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height)) {
        var t2 = createTag("canvas");
        t2.width = this.assetData.w, t2.height = this.assetData.h;
        var e2, r, i2 = t2.getContext("2d"), a2 = this.img.width, s2 = this.img.height, n2 = a2 / s2, o2 = this.assetData.w / this.assetData.h, h2 = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;
        n2 > o2 && "xMidYMid slice" === h2 || n2 < o2 && "xMidYMid slice" !== h2 ? e2 = (r = s2) * o2 : r = (e2 = a2) / o2, i2.drawImage(this.img, (a2 - e2) / 2, (s2 - r) / 2, e2, r, 0, 0, this.assetData.w, this.assetData.h), this.img = t2;
      }
    }, CVImageElement.prototype.renderInnerContent = function() {
      this.canvasContext.drawImage(this.img, 0, 0);
    }, CVImageElement.prototype.destroy = function() {
      this.img = null;
    }, extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement), CVSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement, CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame, CVSolidElement.prototype.renderInnerContent = function() {
      this.globalData.renderer.ctxFillStyle(this.data.sc), this.globalData.renderer.ctxFillRect(0, 0, this.data.sw, this.data.sh);
    }, extendPrototype([BaseRenderer], CanvasRendererBase), CanvasRendererBase.prototype.createShape = function(t2) {
      return new CVShapeElement(t2, this.globalData, this);
    }, CanvasRendererBase.prototype.createText = function(t2) {
      return new CVTextElement(t2, this.globalData, this);
    }, CanvasRendererBase.prototype.createImage = function(t2) {
      return new CVImageElement(t2, this.globalData, this);
    }, CanvasRendererBase.prototype.createSolid = function(t2) {
      return new CVSolidElement(t2, this.globalData, this);
    }, CanvasRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, CanvasRendererBase.prototype.ctxTransform = function(t2) {
      1 === t2[0] && 0 === t2[1] && 0 === t2[4] && 1 === t2[5] && 0 === t2[12] && 0 === t2[13] || this.canvasContext.transform(t2[0], t2[1], t2[4], t2[5], t2[12], t2[13]);
    }, CanvasRendererBase.prototype.ctxOpacity = function(t2) {
      this.canvasContext.globalAlpha *= t2 < 0 ? 0 : t2;
    }, CanvasRendererBase.prototype.ctxFillStyle = function(t2) {
      this.canvasContext.fillStyle = t2;
    }, CanvasRendererBase.prototype.ctxStrokeStyle = function(t2) {
      this.canvasContext.strokeStyle = t2;
    }, CanvasRendererBase.prototype.ctxLineWidth = function(t2) {
      this.canvasContext.lineWidth = t2;
    }, CanvasRendererBase.prototype.ctxLineCap = function(t2) {
      this.canvasContext.lineCap = t2;
    }, CanvasRendererBase.prototype.ctxLineJoin = function(t2) {
      this.canvasContext.lineJoin = t2;
    }, CanvasRendererBase.prototype.ctxMiterLimit = function(t2) {
      this.canvasContext.miterLimit = t2;
    }, CanvasRendererBase.prototype.ctxFill = function(t2) {
      this.canvasContext.fill(t2);
    }, CanvasRendererBase.prototype.ctxFillRect = function(t2, e2, r, i2) {
      this.canvasContext.fillRect(t2, e2, r, i2);
    }, CanvasRendererBase.prototype.ctxStroke = function() {
      this.canvasContext.stroke();
    }, CanvasRendererBase.prototype.reset = function() {
      this.renderConfig.clearCanvas ? this.contextData.reset() : this.canvasContext.restore();
    }, CanvasRendererBase.prototype.save = function() {
      this.canvasContext.save();
    }, CanvasRendererBase.prototype.restore = function(t2) {
      this.renderConfig.clearCanvas ? (t2 && (this.globalData.blendMode = "source-over"), this.contextData.restore(t2)) : this.canvasContext.restore();
    }, CanvasRendererBase.prototype.configAnimation = function(t2) {
      if (this.animationItem.wrapper) {
        this.animationItem.container = createTag("canvas");
        var e2 = this.animationItem.container.style;
        e2.width = "100%", e2.height = "100%";
        var r = "0px 0px 0px";
        e2.transformOrigin = r, e2.mozTransformOrigin = r, e2.webkitTransformOrigin = r, e2["-webkit-transform"] = r, e2.contentVisibility = this.renderConfig.contentVisibility, this.animationItem.wrapper.appendChild(this.animationItem.container), this.canvasContext = this.animationItem.container.getContext("2d"), this.renderConfig.className && this.animationItem.container.setAttribute("class", this.renderConfig.className), this.renderConfig.id && this.animationItem.container.setAttribute("id", this.renderConfig.id);
      } else this.canvasContext = this.renderConfig.context;
      this.contextData.setContext(this.canvasContext), this.data = t2, this.layers = t2.layers, this.transformCanvas = { w: t2.w, h: t2.h, sx: 0, sy: 0, tx: 0, ty: 0 }, this.setupGlobalData(t2, document.body), this.globalData.canvasContext = this.canvasContext, this.globalData.renderer = this, this.globalData.isDashed = false, this.globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.globalData.transformCanvas = this.transformCanvas, this.elements = createSizedArray(t2.layers.length), this.updateContainerSize();
    }, CanvasRendererBase.prototype.updateContainerSize = function(t2, e2) {
      var r, i2, a2, s2;
      if (this.reset(), t2 ? (r = t2, i2 = e2, this.canvasContext.canvas.width = r, this.canvasContext.canvas.height = i2) : (this.animationItem.wrapper && this.animationItem.container ? (r = this.animationItem.wrapper.offsetWidth, i2 = this.animationItem.wrapper.offsetHeight) : (r = this.canvasContext.canvas.width, i2 = this.canvasContext.canvas.height), this.canvasContext.canvas.width = r * this.renderConfig.dpr, this.canvasContext.canvas.height = i2 * this.renderConfig.dpr), -1 !== this.renderConfig.preserveAspectRatio.indexOf("meet") || -1 !== this.renderConfig.preserveAspectRatio.indexOf("slice")) {
        var n2 = this.renderConfig.preserveAspectRatio.split(" "), o2 = n2[1] || "meet", h2 = n2[0] || "xMidYMid", l2 = h2.substr(0, 4), p2 = h2.substr(4);
        a2 = r / i2, (s2 = this.transformCanvas.w / this.transformCanvas.h) > a2 && "meet" === o2 || s2 < a2 && "slice" === o2 ? (this.transformCanvas.sx = r / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = r / (this.transformCanvas.w / this.renderConfig.dpr)) : (this.transformCanvas.sx = i2 / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.sy = i2 / (this.transformCanvas.h / this.renderConfig.dpr)), this.transformCanvas.tx = "xMid" === l2 && (s2 < a2 && "meet" === o2 || s2 > a2 && "slice" === o2) ? (r - this.transformCanvas.w * (i2 / this.transformCanvas.h)) / 2 * this.renderConfig.dpr : "xMax" === l2 && (s2 < a2 && "meet" === o2 || s2 > a2 && "slice" === o2) ? (r - this.transformCanvas.w * (i2 / this.transformCanvas.h)) * this.renderConfig.dpr : 0, this.transformCanvas.ty = "YMid" === p2 && (s2 > a2 && "meet" === o2 || s2 < a2 && "slice" === o2) ? (i2 - this.transformCanvas.h * (r / this.transformCanvas.w)) / 2 * this.renderConfig.dpr : "YMax" === p2 && (s2 > a2 && "meet" === o2 || s2 < a2 && "slice" === o2) ? (i2 - this.transformCanvas.h * (r / this.transformCanvas.w)) * this.renderConfig.dpr : 0;
      } else "none" === this.renderConfig.preserveAspectRatio ? (this.transformCanvas.sx = r / (this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = i2 / (this.transformCanvas.h / this.renderConfig.dpr), this.transformCanvas.tx = 0, this.transformCanvas.ty = 0) : (this.transformCanvas.sx = this.renderConfig.dpr, this.transformCanvas.sy = this.renderConfig.dpr, this.transformCanvas.tx = 0, this.transformCanvas.ty = 0);
      this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1], this.ctxTransform(this.transformCanvas.props), this.canvasContext.beginPath(), this.canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h), this.canvasContext.closePath(), this.canvasContext.clip(), this.renderFrame(this.renderedFrame, true);
    }, CanvasRendererBase.prototype.destroy = function() {
      var t2;
      for (this.renderConfig.clearCanvas && this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), t2 = (this.layers ? this.layers.length : 0) - 1; t2 >= 0; t2 -= 1) this.elements[t2] && this.elements[t2].destroy && this.elements[t2].destroy();
      this.elements.length = 0, this.globalData.canvasContext = null, this.animationItem.container = null, this.destroyed = true;
    }, CanvasRendererBase.prototype.renderFrame = function(t2, e2) {
      if ((this.renderedFrame !== t2 || true !== this.renderConfig.clearCanvas || e2) && !this.destroyed && -1 !== t2) {
        var r;
        this.renderedFrame = t2, this.globalData.frameNum = t2 - this.animationItem._isFirstFrame, this.globalData.frameId += 1, this.globalData._mdf = !this.renderConfig.clearCanvas || e2, this.globalData.projectInterface.currentFrame = t2;
        var i2 = this.layers.length;
        for (this.completeLayers || this.checkLayers(t2), r = i2 - 1; r >= 0; r -= 1) (this.completeLayers || this.elements[r]) && this.elements[r].prepareFrame(t2 - this.layers[r].st);
        if (this.globalData._mdf) {
          for (true === this.renderConfig.clearCanvas ? this.canvasContext.clearRect(0, 0, this.transformCanvas.w, this.transformCanvas.h) : this.save(), r = i2 - 1; r >= 0; r -= 1) (this.completeLayers || this.elements[r]) && this.elements[r].renderFrame();
          true !== this.renderConfig.clearCanvas && this.restore();
        }
      }
    }, CanvasRendererBase.prototype.buildItem = function(t2) {
      var e2 = this.elements;
      if (!e2[t2] && 99 !== this.layers[t2].ty) {
        var r = this.createItem(this.layers[t2], this, this.globalData);
        e2[t2] = r, r.initExpressions();
      }
    }, CanvasRendererBase.prototype.checkPendingElements = function() {
      for (; this.pendingElements.length; ) {
        this.pendingElements.pop().checkParenting();
      }
    }, CanvasRendererBase.prototype.hide = function() {
      this.animationItem.container.style.display = "none";
    }, CanvasRendererBase.prototype.show = function() {
      this.animationItem.container.style.display = "block";
    }, CVContextData.prototype.duplicate = function() {
      var t2 = 2 * this._length, e2 = 0;
      for (e2 = this._length; e2 < t2; e2 += 1) this.stack[e2] = new CanvasContext();
      this._length = t2;
    }, CVContextData.prototype.reset = function() {
      this.cArrPos = 0, this.cTr.reset(), this.stack[this.cArrPos].opacity = 1;
    }, CVContextData.prototype.restore = function(t2) {
      this.cArrPos -= 1;
      var e2, r = this.stack[this.cArrPos], i2 = r.transform, a2 = this.cTr.props;
      for (e2 = 0; e2 < 16; e2 += 1) a2[e2] = i2[e2];
      if (t2) {
        this.nativeContext.restore();
        var s2 = this.stack[this.cArrPos + 1];
        this.appliedFillStyle = s2.fillStyle, this.appliedStrokeStyle = s2.strokeStyle, this.appliedLineWidth = s2.lineWidth, this.appliedLineCap = s2.lineCap, this.appliedLineJoin = s2.lineJoin, this.appliedMiterLimit = s2.miterLimit;
      }
      this.nativeContext.setTransform(i2[0], i2[1], i2[4], i2[5], i2[12], i2[13]), (t2 || -1 !== r.opacity && this.currentOpacity !== r.opacity) && (this.nativeContext.globalAlpha = r.opacity, this.currentOpacity = r.opacity), this.currentFillStyle = r.fillStyle, this.currentStrokeStyle = r.strokeStyle, this.currentLineWidth = r.lineWidth, this.currentLineCap = r.lineCap, this.currentLineJoin = r.lineJoin, this.currentMiterLimit = r.miterLimit;
    }, CVContextData.prototype.save = function(t2) {
      t2 && this.nativeContext.save();
      var e2 = this.cTr.props;
      this._length <= this.cArrPos && this.duplicate();
      var r, i2 = this.stack[this.cArrPos];
      for (r = 0; r < 16; r += 1) i2.transform[r] = e2[r];
      this.cArrPos += 1;
      var a2 = this.stack[this.cArrPos];
      a2.opacity = i2.opacity, a2.fillStyle = i2.fillStyle, a2.strokeStyle = i2.strokeStyle, a2.lineWidth = i2.lineWidth, a2.lineCap = i2.lineCap, a2.lineJoin = i2.lineJoin, a2.miterLimit = i2.miterLimit;
    }, CVContextData.prototype.setOpacity = function(t2) {
      this.stack[this.cArrPos].opacity = t2;
    }, CVContextData.prototype.setContext = function(t2) {
      this.nativeContext = t2;
    }, CVContextData.prototype.fillStyle = function(t2) {
      this.stack[this.cArrPos].fillStyle !== t2 && (this.currentFillStyle = t2, this.stack[this.cArrPos].fillStyle = t2);
    }, CVContextData.prototype.strokeStyle = function(t2) {
      this.stack[this.cArrPos].strokeStyle !== t2 && (this.currentStrokeStyle = t2, this.stack[this.cArrPos].strokeStyle = t2);
    }, CVContextData.prototype.lineWidth = function(t2) {
      this.stack[this.cArrPos].lineWidth !== t2 && (this.currentLineWidth = t2, this.stack[this.cArrPos].lineWidth = t2);
    }, CVContextData.prototype.lineCap = function(t2) {
      this.stack[this.cArrPos].lineCap !== t2 && (this.currentLineCap = t2, this.stack[this.cArrPos].lineCap = t2);
    }, CVContextData.prototype.lineJoin = function(t2) {
      this.stack[this.cArrPos].lineJoin !== t2 && (this.currentLineJoin = t2, this.stack[this.cArrPos].lineJoin = t2);
    }, CVContextData.prototype.miterLimit = function(t2) {
      this.stack[this.cArrPos].miterLimit !== t2 && (this.currentMiterLimit = t2, this.stack[this.cArrPos].miterLimit = t2);
    }, CVContextData.prototype.transform = function(t2) {
      this.transformMat.cloneFromProps(t2);
      var e2 = this.cTr;
      this.transformMat.multiply(e2), e2.cloneFromProps(this.transformMat.props);
      var r = e2.props;
      this.nativeContext.setTransform(r[0], r[1], r[4], r[5], r[12], r[13]);
    }, CVContextData.prototype.opacity = function(t2) {
      var e2 = this.stack[this.cArrPos].opacity;
      e2 *= t2 < 0 ? 0 : t2, this.stack[this.cArrPos].opacity !== e2 && (this.currentOpacity !== t2 && (this.nativeContext.globalAlpha = t2, this.currentOpacity = t2), this.stack[this.cArrPos].opacity = e2);
    }, CVContextData.prototype.fill = function(t2) {
      this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fill(t2);
    }, CVContextData.prototype.fillRect = function(t2, e2, r, i2) {
      this.appliedFillStyle !== this.currentFillStyle && (this.appliedFillStyle = this.currentFillStyle, this.nativeContext.fillStyle = this.appliedFillStyle), this.nativeContext.fillRect(t2, e2, r, i2);
    }, CVContextData.prototype.stroke = function() {
      this.appliedStrokeStyle !== this.currentStrokeStyle && (this.appliedStrokeStyle = this.currentStrokeStyle, this.nativeContext.strokeStyle = this.appliedStrokeStyle), this.appliedLineWidth !== this.currentLineWidth && (this.appliedLineWidth = this.currentLineWidth, this.nativeContext.lineWidth = this.appliedLineWidth), this.appliedLineCap !== this.currentLineCap && (this.appliedLineCap = this.currentLineCap, this.nativeContext.lineCap = this.appliedLineCap), this.appliedLineJoin !== this.currentLineJoin && (this.appliedLineJoin = this.currentLineJoin, this.nativeContext.lineJoin = this.appliedLineJoin), this.appliedMiterLimit !== this.currentMiterLimit && (this.appliedMiterLimit = this.currentMiterLimit, this.nativeContext.miterLimit = this.appliedMiterLimit), this.nativeContext.stroke();
    }, extendPrototype([CanvasRendererBase, ICompElement, CVBaseElement], CVCompElement), CVCompElement.prototype.renderInnerContent = function() {
      var t2, e2 = this.canvasContext;
      for (e2.beginPath(), e2.moveTo(0, 0), e2.lineTo(this.data.w, 0), e2.lineTo(this.data.w, this.data.h), e2.lineTo(0, this.data.h), e2.lineTo(0, 0), e2.clip(), t2 = this.layers.length - 1; t2 >= 0; t2 -= 1) (this.completeLayers || this.elements[t2]) && this.elements[t2].renderFrame();
    }, CVCompElement.prototype.destroy = function() {
      var t2;
      for (t2 = this.layers.length - 1; t2 >= 0; t2 -= 1) this.elements[t2] && this.elements[t2].destroy();
      this.layers = null, this.elements = null;
    }, CVCompElement.prototype.createComp = function(t2) {
      return new CVCompElement(t2, this.globalData, this);
    }, extendPrototype([CanvasRendererBase], CanvasRenderer), CanvasRenderer.prototype.createComp = function(t2) {
      return new CVCompElement(t2, this.globalData, this);
    }, HBaseElement.prototype = { checkBlendMode: function() {
    }, initRendererElement: function() {
      this.baseElement = createTag(this.data.tg || "div"), this.data.hasMask ? (this.svgElement = createNS("svg"), this.layerElement = createNS("g"), this.maskedElement = this.layerElement, this.svgElement.appendChild(this.layerElement), this.baseElement.appendChild(this.svgElement)) : this.layerElement = this.baseElement, styleDiv(this.baseElement);
    }, createContainerElements: function() {
      this.renderableEffectsManager = new CVEffects(this), this.transformedElement = this.baseElement, this.maskedElement = this.layerElement, this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data.cl && this.layerElement.setAttribute("class", this.data.cl), 0 !== this.data.bm && this.setBlendMode();
    }, renderElement: function() {
      var t2 = this.transformedElement ? this.transformedElement.style : {};
      if (this.finalTransform._matMdf) {
        var e2 = this.finalTransform.mat.toCSS();
        t2.transform = e2, t2.webkitTransform = e2;
      }
      this.finalTransform._opMdf && (t2.opacity = this.finalTransform.mProp.o.v);
    }, renderFrame: function() {
      this.data.hd || this.hidden || (this.renderTransform(), this.renderRenderable(), this.renderElement(), this.renderInnerContent(), this._isFirstFrame && (this._isFirstFrame = false));
    }, destroy: function() {
      this.layerElement = null, this.transformedElement = null, this.matteElement && (this.matteElement = null), this.maskManager && (this.maskManager.destroy(), this.maskManager = null);
    }, createRenderableComponents: function() {
      this.maskManager = new MaskElement(this.data, this, this.globalData);
    }, addEffects: function() {
    }, setMatte: function() {
    } }, HBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement, HBaseElement.prototype.destroyBaseElement = HBaseElement.prototype.destroy, HBaseElement.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting, extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], HSolidElement), HSolidElement.prototype.createContent = function() {
      var t2;
      this.data.hasMask ? ((t2 = createNS("rect")).setAttribute("width", this.data.sw), t2.setAttribute("height", this.data.sh), t2.setAttribute("fill", this.data.sc), this.svgElement.setAttribute("width", this.data.sw), this.svgElement.setAttribute("height", this.data.sh)) : ((t2 = createTag("div")).style.width = this.data.sw + "px", t2.style.height = this.data.sh + "px", t2.style.backgroundColor = this.data.sc), this.layerElement.appendChild(t2);
    }, extendPrototype([BaseElement, TransformElement, HSolidElement, SVGShapeElement, HBaseElement, HierarchyElement, FrameElement, RenderableElement], HShapeElement), HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype.renderInnerContent, HShapeElement.prototype.createContent = function() {
      var t2;
      if (this.baseElement.style.fontSize = 0, this.data.hasMask) this.layerElement.appendChild(this.shapesContainer), t2 = this.svgElement;
      else {
        t2 = createNS("svg");
        var e2 = this.comp.data ? this.comp.data : this.globalData.compSize;
        t2.setAttribute("width", e2.w), t2.setAttribute("height", e2.h), t2.appendChild(this.shapesContainer), this.layerElement.appendChild(t2);
      }
      this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.shapesContainer, 0, [], true), this.filterUniqueShapes(), this.shapeCont = t2;
    }, HShapeElement.prototype.getTransformedPoint = function(t2, e2) {
      var r, i2 = t2.length;
      for (r = 0; r < i2; r += 1) e2 = t2[r].mProps.v.applyToPointArray(e2[0], e2[1], 0);
      return e2;
    }, HShapeElement.prototype.calculateShapeBoundingBox = function(t2, e2) {
      var r, i2, a2, s2, n2, o2 = t2.sh.v, h2 = t2.transformers, l2 = o2._length;
      if (!(l2 <= 1)) {
        for (r = 0; r < l2 - 1; r += 1) i2 = this.getTransformedPoint(h2, o2.v[r]), a2 = this.getTransformedPoint(h2, o2.o[r]), s2 = this.getTransformedPoint(h2, o2.i[r + 1]), n2 = this.getTransformedPoint(h2, o2.v[r + 1]), this.checkBounds(i2, a2, s2, n2, e2);
        o2.c && (i2 = this.getTransformedPoint(h2, o2.v[r]), a2 = this.getTransformedPoint(h2, o2.o[r]), s2 = this.getTransformedPoint(h2, o2.i[0]), n2 = this.getTransformedPoint(h2, o2.v[0]), this.checkBounds(i2, a2, s2, n2, e2));
      }
    }, HShapeElement.prototype.checkBounds = function(t2, e2, r, i2, a2) {
      this.getBoundsOfCurve(t2, e2, r, i2);
      var s2 = this.shapeBoundingBox;
      a2.x = bmMin(s2.left, a2.x), a2.xMax = bmMax(s2.right, a2.xMax), a2.y = bmMin(s2.top, a2.y), a2.yMax = bmMax(s2.bottom, a2.yMax);
    }, HShapeElement.prototype.shapeBoundingBox = { left: 0, right: 0, top: 0, bottom: 0 }, HShapeElement.prototype.tempBoundingBox = { x: 0, xMax: 0, y: 0, yMax: 0, width: 0, height: 0 }, HShapeElement.prototype.getBoundsOfCurve = function(t2, e2, r, i2) {
      for (var a2, s2, n2, o2, h2, l2, p2, f2 = [[t2[0], i2[0]], [t2[1], i2[1]]], c2 = 0; c2 < 2; ++c2) s2 = 6 * t2[c2] - 12 * e2[c2] + 6 * r[c2], a2 = -3 * t2[c2] + 9 * e2[c2] - 9 * r[c2] + 3 * i2[c2], n2 = 3 * e2[c2] - 3 * t2[c2], s2 |= 0, n2 |= 0, 0 === (a2 |= 0) && 0 === s2 || (0 === a2 ? (o2 = -n2 / s2) > 0 && o2 < 1 && f2[c2].push(this.calculateF(o2, t2, e2, r, i2, c2)) : (h2 = s2 * s2 - 4 * n2 * a2) >= 0 && ((l2 = (-s2 + bmSqrt(h2)) / (2 * a2)) > 0 && l2 < 1 && f2[c2].push(this.calculateF(l2, t2, e2, r, i2, c2)), (p2 = (-s2 - bmSqrt(h2)) / (2 * a2)) > 0 && p2 < 1 && f2[c2].push(this.calculateF(p2, t2, e2, r, i2, c2))));
      this.shapeBoundingBox.left = bmMin.apply(null, f2[0]), this.shapeBoundingBox.top = bmMin.apply(null, f2[1]), this.shapeBoundingBox.right = bmMax.apply(null, f2[0]), this.shapeBoundingBox.bottom = bmMax.apply(null, f2[1]);
    }, HShapeElement.prototype.calculateF = function(t2, e2, r, i2, a2, s2) {
      return bmPow(1 - t2, 3) * e2[s2] + 3 * bmPow(1 - t2, 2) * t2 * r[s2] + 3 * (1 - t2) * bmPow(t2, 2) * i2[s2] + bmPow(t2, 3) * a2[s2];
    }, HShapeElement.prototype.calculateBoundingBox = function(t2, e2) {
      var r, i2 = t2.length;
      for (r = 0; r < i2; r += 1) t2[r] && t2[r].sh ? this.calculateShapeBoundingBox(t2[r], e2) : t2[r] && t2[r].it ? this.calculateBoundingBox(t2[r].it, e2) : t2[r] && t2[r].style && t2[r].w && this.expandStrokeBoundingBox(t2[r].w, e2);
    }, HShapeElement.prototype.expandStrokeBoundingBox = function(t2, e2) {
      var r = 0;
      if (t2.keyframes) {
        for (var i2 = 0; i2 < t2.keyframes.length; i2 += 1) {
          var a2 = t2.keyframes[i2].s;
          a2 > r && (r = a2);
        }
        r *= t2.mult;
      } else r = t2.v * t2.mult;
      e2.x -= r, e2.xMax += r, e2.y -= r, e2.yMax += r;
    }, HShapeElement.prototype.currentBoxContains = function(t2) {
      return this.currentBBox.x <= t2.x && this.currentBBox.y <= t2.y && this.currentBBox.width + this.currentBBox.x >= t2.x + t2.width && this.currentBBox.height + this.currentBBox.y >= t2.y + t2.height;
    }, HShapeElement.prototype.renderInnerContent = function() {
      if (this._renderShapeFrame(), !this.hidden && (this._isFirstFrame || this._mdf)) {
        var t2 = this.tempBoundingBox, e2 = 999999;
        if (t2.x = e2, t2.xMax = -e2, t2.y = e2, t2.yMax = -e2, this.calculateBoundingBox(this.itemsData, t2), t2.width = t2.xMax < t2.x ? 0 : t2.xMax - t2.x, t2.height = t2.yMax < t2.y ? 0 : t2.yMax - t2.y, this.currentBoxContains(t2)) return;
        var r = false;
        if (this.currentBBox.w !== t2.width && (this.currentBBox.w = t2.width, this.shapeCont.setAttribute("width", t2.width), r = true), this.currentBBox.h !== t2.height && (this.currentBBox.h = t2.height, this.shapeCont.setAttribute("height", t2.height), r = true), r || this.currentBBox.x !== t2.x || this.currentBBox.y !== t2.y) {
          this.currentBBox.w = t2.width, this.currentBBox.h = t2.height, this.currentBBox.x = t2.x, this.currentBBox.y = t2.y, this.shapeCont.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h);
          var i2 = this.shapeCont.style, a2 = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
          i2.transform = a2, i2.webkitTransform = a2;
        }
      }
    }, extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement, RenderableDOMElement, ITextElement], HTextElement), HTextElement.prototype.createContent = function() {
      if (this.isMasked = this.checkMasks(), this.isMasked) {
        this.renderType = "svg", this.compW = this.comp.data.w, this.compH = this.comp.data.h, this.svgElement.setAttribute("width", this.compW), this.svgElement.setAttribute("height", this.compH);
        var t2 = createNS("g");
        this.maskedElement.appendChild(t2), this.innerElem = t2;
      } else this.renderType = "html", this.innerElem = this.layerElement;
      this.checkParenting();
    }, HTextElement.prototype.buildNewText = function() {
      var t2 = this.textProperty.currentData;
      this.renderedLetters = createSizedArray(t2.l ? t2.l.length : 0);
      var e2 = this.innerElem.style, r = t2.fc ? this.buildColor(t2.fc) : "rgba(0,0,0,0)";
      e2.fill = r, e2.color = r, t2.sc && (e2.stroke = this.buildColor(t2.sc), e2.strokeWidth = t2.sw + "px");
      var i2, a2, s2 = this.globalData.fontManager.getFontByName(t2.f);
      if (!this.globalData.fontManager.chars) if (e2.fontSize = t2.finalSize + "px", e2.lineHeight = t2.finalSize + "px", s2.fClass) this.innerElem.className = s2.fClass;
      else {
        e2.fontFamily = s2.fFamily;
        var n2 = t2.fWeight, o2 = t2.fStyle;
        e2.fontStyle = o2, e2.fontWeight = n2;
      }
      var h2, l2, p2, f2 = t2.l;
      a2 = f2.length;
      var c2, m2 = this.mHelper, d2 = "", u2 = 0;
      for (i2 = 0; i2 < a2; i2 += 1) {
        if (this.globalData.fontManager.chars ? (this.textPaths[u2] ? h2 = this.textPaths[u2] : ((h2 = createNS("path")).setAttribute("stroke-linecap", lineCapEnum[1]), h2.setAttribute("stroke-linejoin", lineJoinEnum[2]), h2.setAttribute("stroke-miterlimit", "4")), this.isMasked || (this.textSpans[u2] ? p2 = (l2 = this.textSpans[u2]).children[0] : ((l2 = createTag("div")).style.lineHeight = 0, (p2 = createNS("svg")).appendChild(h2), styleDiv(l2)))) : this.isMasked ? h2 = this.textPaths[u2] ? this.textPaths[u2] : createNS("text") : this.textSpans[u2] ? (l2 = this.textSpans[u2], h2 = this.textPaths[u2]) : (styleDiv(l2 = createTag("span")), styleDiv(h2 = createTag("span")), l2.appendChild(h2)), this.globalData.fontManager.chars) {
          var y, g2 = this.globalData.fontManager.getCharData(t2.finalText[i2], s2.fStyle, this.globalData.fontManager.getFontByName(t2.f).fFamily);
          if (y = g2 ? g2.data : null, m2.reset(), y && y.shapes && y.shapes.length && (c2 = y.shapes[0].it, m2.scale(t2.finalSize / 100, t2.finalSize / 100), d2 = this.createPathShape(m2, c2), h2.setAttribute("d", d2)), this.isMasked) this.innerElem.appendChild(h2);
          else {
            if (this.innerElem.appendChild(l2), y && y.shapes) {
              document.body.appendChild(p2);
              var v2 = p2.getBBox();
              p2.setAttribute("width", v2.width + 2), p2.setAttribute("height", v2.height + 2), p2.setAttribute("viewBox", v2.x - 1 + " " + (v2.y - 1) + " " + (v2.width + 2) + " " + (v2.height + 2));
              var b = p2.style, x = "translate(" + (v2.x - 1) + "px," + (v2.y - 1) + "px)";
              b.transform = x, b.webkitTransform = x, f2[i2].yOffset = v2.y - 1;
            } else p2.setAttribute("width", 1), p2.setAttribute("height", 1);
            l2.appendChild(p2);
          }
        } else if (h2.textContent = f2[i2].val, h2.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"), this.isMasked) this.innerElem.appendChild(h2);
        else {
          this.innerElem.appendChild(l2);
          var E2 = h2.style, S2 = "translate3d(0," + -t2.finalSize / 1.2 + "px,0)";
          E2.transform = S2, E2.webkitTransform = S2;
        }
        this.isMasked ? this.textSpans[u2] = h2 : this.textSpans[u2] = l2, this.textSpans[u2].style.display = "block", this.textPaths[u2] = h2, u2 += 1;
      }
      for (; u2 < this.textSpans.length; ) this.textSpans[u2].style.display = "none", u2 += 1;
    }, HTextElement.prototype.renderInnerContent = function() {
      var t2;
      if (this.validateText(), this.data.singleShape) {
        if (!this._isFirstFrame && !this.lettersChangedFlag) return;
        if (this.isMasked && this.finalTransform._matMdf) {
          this.svgElement.setAttribute("viewBox", -this.finalTransform.mProp.p.v[0] + " " + -this.finalTransform.mProp.p.v[1] + " " + this.compW + " " + this.compH), t2 = this.svgElement.style;
          var e2 = "translate(" + -this.finalTransform.mProp.p.v[0] + "px," + -this.finalTransform.mProp.p.v[1] + "px)";
          t2.transform = e2, t2.webkitTransform = e2;
        }
      }
      if (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag), this.lettersChangedFlag || this.textAnimator.lettersChangedFlag) {
        var r, i2, a2, s2, n2, o2 = 0, h2 = this.textAnimator.renderedLetters, l2 = this.textProperty.currentData.l;
        for (i2 = l2.length, r = 0; r < i2; r += 1) l2[r].n ? o2 += 1 : (s2 = this.textSpans[r], n2 = this.textPaths[r], a2 = h2[o2], o2 += 1, a2._mdf.m && (this.isMasked ? s2.setAttribute("transform", a2.m) : (s2.style.webkitTransform = a2.m, s2.style.transform = a2.m)), s2.style.opacity = a2.o, a2.sw && a2._mdf.sw && n2.setAttribute("stroke-width", a2.sw), a2.sc && a2._mdf.sc && n2.setAttribute("stroke", a2.sc), a2.fc && a2._mdf.fc && (n2.setAttribute("fill", a2.fc), n2.style.color = a2.fc));
        if (this.innerElem.getBBox && !this.hidden && (this._isFirstFrame || this._mdf)) {
          var p2 = this.innerElem.getBBox();
          this.currentBBox.w !== p2.width && (this.currentBBox.w = p2.width, this.svgElement.setAttribute("width", p2.width)), this.currentBBox.h !== p2.height && (this.currentBBox.h = p2.height, this.svgElement.setAttribute("height", p2.height));
          if (this.currentBBox.w !== p2.width + 2 || this.currentBBox.h !== p2.height + 2 || this.currentBBox.x !== p2.x - 1 || this.currentBBox.y !== p2.y - 1) {
            this.currentBBox.w = p2.width + 2, this.currentBBox.h = p2.height + 2, this.currentBBox.x = p2.x - 1, this.currentBBox.y = p2.y - 1, this.svgElement.setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " + this.currentBBox.h), t2 = this.svgElement.style;
            var f2 = "translate(" + this.currentBBox.x + "px," + this.currentBBox.y + "px)";
            t2.transform = f2, t2.webkitTransform = f2;
          }
        }
      }
    }, extendPrototype([BaseElement, FrameElement, HierarchyElement], HCameraElement), HCameraElement.prototype.setup = function() {
      var t2, e2, r, i2, a2 = this.comp.threeDElements.length;
      for (t2 = 0; t2 < a2; t2 += 1) if ("3d" === (e2 = this.comp.threeDElements[t2]).type) {
        r = e2.perspectiveElem.style, i2 = e2.container.style;
        var s2 = this.pe.v + "px", n2 = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
        r.perspective = s2, r.webkitPerspective = s2, i2.transformOrigin = "0px 0px 0px", i2.mozTransformOrigin = "0px 0px 0px", i2.webkitTransformOrigin = "0px 0px 0px", r.transform = n2, r.webkitTransform = n2;
      }
    }, HCameraElement.prototype.createElements = function() {
    }, HCameraElement.prototype.hide = function() {
    }, HCameraElement.prototype.renderFrame = function() {
      var t2, e2, r = this._isFirstFrame;
      if (this.hierarchy) for (e2 = this.hierarchy.length, t2 = 0; t2 < e2; t2 += 1) r = this.hierarchy[t2].finalTransform.mProp._mdf || r;
      if (r || this.pe._mdf || this.p && this.p._mdf || this.px && (this.px._mdf || this.py._mdf || this.pz._mdf) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or._mdf || this.a && this.a._mdf) {
        if (this.mat.reset(), this.hierarchy) for (t2 = e2 = this.hierarchy.length - 1; t2 >= 0; t2 -= 1) {
          var i2 = this.hierarchy[t2].finalTransform.mProp;
          this.mat.translate(-i2.p.v[0], -i2.p.v[1], i2.p.v[2]), this.mat.rotateX(-i2.or.v[0]).rotateY(-i2.or.v[1]).rotateZ(i2.or.v[2]), this.mat.rotateX(-i2.rx.v).rotateY(-i2.ry.v).rotateZ(i2.rz.v), this.mat.scale(1 / i2.s.v[0], 1 / i2.s.v[1], 1 / i2.s.v[2]), this.mat.translate(i2.a.v[0], i2.a.v[1], i2.a.v[2]);
        }
        if (this.p ? this.mat.translate(-this.p.v[0], -this.p.v[1], this.p.v[2]) : this.mat.translate(-this.px.v, -this.py.v, this.pz.v), this.a) {
          var a2;
          a2 = this.p ? [this.p.v[0] - this.a.v[0], this.p.v[1] - this.a.v[1], this.p.v[2] - this.a.v[2]] : [this.px.v - this.a.v[0], this.py.v - this.a.v[1], this.pz.v - this.a.v[2]];
          var s2 = Math.sqrt(Math.pow(a2[0], 2) + Math.pow(a2[1], 2) + Math.pow(a2[2], 2)), n2 = [a2[0] / s2, a2[1] / s2, a2[2] / s2], o2 = Math.sqrt(n2[2] * n2[2] + n2[0] * n2[0]), h2 = Math.atan2(n2[1], o2), l2 = Math.atan2(n2[0], -n2[2]);
          this.mat.rotateY(l2).rotateX(-h2);
        }
        this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v), this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]), this.mat.translate(this.globalData.compSize.w / 2, this.globalData.compSize.h / 2, 0), this.mat.translate(0, 0, this.pe.v);
        var p2 = !this._prevMat.equals(this.mat);
        if ((p2 || this.pe._mdf) && this.comp.threeDElements) {
          var f2, c2, m2;
          for (e2 = this.comp.threeDElements.length, t2 = 0; t2 < e2; t2 += 1) if ("3d" === (f2 = this.comp.threeDElements[t2]).type) {
            if (p2) {
              var d2 = this.mat.toCSS();
              (m2 = f2.container.style).transform = d2, m2.webkitTransform = d2;
            }
            this.pe._mdf && ((c2 = f2.perspectiveElem.style).perspective = this.pe.v + "px", c2.webkitPerspective = this.pe.v + "px");
          }
          this.mat.clone(this._prevMat);
        }
      }
      this._isFirstFrame = false;
    }, HCameraElement.prototype.prepareFrame = function(t2) {
      this.prepareProperties(t2, true);
    }, HCameraElement.prototype.destroy = function() {
    }, HCameraElement.prototype.getBaseElement = function() {
      return null;
    }, extendPrototype([BaseElement, TransformElement, HBaseElement, HSolidElement, HierarchyElement, FrameElement, RenderableElement], HImageElement), HImageElement.prototype.createContent = function() {
      var t2 = this.globalData.getAssetsPath(this.assetData), e2 = new Image();
      this.data.hasMask ? (this.imageElem = createNS("image"), this.imageElem.setAttribute("width", this.assetData.w + "px"), this.imageElem.setAttribute("height", this.assetData.h + "px"), this.imageElem.setAttributeNS("http://www.w3.org/1999/xlink", "href", t2), this.layerElement.appendChild(this.imageElem), this.baseElement.setAttribute("width", this.assetData.w), this.baseElement.setAttribute("height", this.assetData.h)) : this.layerElement.appendChild(e2), e2.crossOrigin = "anonymous", e2.src = t2, this.data.ln && this.baseElement.setAttribute("id", this.data.ln);
    }, extendPrototype([BaseRenderer], HybridRendererBase), HybridRendererBase.prototype.buildItem = SVGRenderer.prototype.buildItem, HybridRendererBase.prototype.checkPendingElements = function() {
      for (; this.pendingElements.length; ) {
        this.pendingElements.pop().checkParenting();
      }
    }, HybridRendererBase.prototype.appendElementInPos = function(t2, e2) {
      var r = t2.getBaseElement();
      if (r) {
        var i2 = this.layers[e2];
        if (i2.ddd && this.supports3d) this.addTo3dContainer(r, e2);
        else if (this.threeDElements) this.addTo3dContainer(r, e2);
        else {
          for (var a2, s2, n2 = 0; n2 < e2; ) this.elements[n2] && true !== this.elements[n2] && this.elements[n2].getBaseElement && (s2 = this.elements[n2], a2 = (this.layers[n2].ddd ? this.getThreeDContainerByPos(n2) : s2.getBaseElement()) || a2), n2 += 1;
          a2 ? i2.ddd && this.supports3d || this.layerElement.insertBefore(r, a2) : i2.ddd && this.supports3d || this.layerElement.appendChild(r);
        }
      }
    }, HybridRendererBase.prototype.createShape = function(t2) {
      return this.supports3d ? new HShapeElement(t2, this.globalData, this) : new SVGShapeElement(t2, this.globalData, this);
    }, HybridRendererBase.prototype.createText = function(t2) {
      return this.supports3d ? new HTextElement(t2, this.globalData, this) : new SVGTextLottieElement(t2, this.globalData, this);
    }, HybridRendererBase.prototype.createCamera = function(t2) {
      return this.camera = new HCameraElement(t2, this.globalData, this), this.camera;
    }, HybridRendererBase.prototype.createImage = function(t2) {
      return this.supports3d ? new HImageElement(t2, this.globalData, this) : new IImageElement(t2, this.globalData, this);
    }, HybridRendererBase.prototype.createSolid = function(t2) {
      return this.supports3d ? new HSolidElement(t2, this.globalData, this) : new ISolidElement(t2, this.globalData, this);
    }, HybridRendererBase.prototype.createNull = SVGRenderer.prototype.createNull, HybridRendererBase.prototype.getThreeDContainerByPos = function(t2) {
      for (var e2 = 0, r = this.threeDElements.length; e2 < r; ) {
        if (this.threeDElements[e2].startPos <= t2 && this.threeDElements[e2].endPos >= t2) return this.threeDElements[e2].perspectiveElem;
        e2 += 1;
      }
      return null;
    }, HybridRendererBase.prototype.createThreeDContainer = function(t2, e2) {
      var r, i2, a2 = createTag("div");
      styleDiv(a2);
      var s2 = createTag("div");
      if (styleDiv(s2), "3d" === e2) {
        (r = a2.style).width = this.globalData.compSize.w + "px", r.height = this.globalData.compSize.h + "px";
        r.webkitTransformOrigin = "50% 50%", r.mozTransformOrigin = "50% 50%", r.transformOrigin = "50% 50%";
        var n2 = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
        (i2 = s2.style).transform = n2, i2.webkitTransform = n2;
      }
      a2.appendChild(s2);
      var o2 = { container: s2, perspectiveElem: a2, startPos: t2, endPos: t2, type: e2 };
      return this.threeDElements.push(o2), o2;
    }, HybridRendererBase.prototype.build3dContainers = function() {
      var t2, e2, r = this.layers.length, i2 = "";
      for (t2 = 0; t2 < r; t2 += 1) this.layers[t2].ddd && 3 !== this.layers[t2].ty ? ("3d" !== i2 && (i2 = "3d", e2 = this.createThreeDContainer(t2, "3d")), e2.endPos = Math.max(e2.endPos, t2)) : ("2d" !== i2 && (i2 = "2d", e2 = this.createThreeDContainer(t2, "2d")), e2.endPos = Math.max(e2.endPos, t2));
      for (t2 = (r = this.threeDElements.length) - 1; t2 >= 0; t2 -= 1) this.resizerElem.appendChild(this.threeDElements[t2].perspectiveElem);
    }, HybridRendererBase.prototype.addTo3dContainer = function(t2, e2) {
      for (var r = 0, i2 = this.threeDElements.length; r < i2; ) {
        if (e2 <= this.threeDElements[r].endPos) {
          for (var a2, s2 = this.threeDElements[r].startPos; s2 < e2; ) this.elements[s2] && this.elements[s2].getBaseElement && (a2 = this.elements[s2].getBaseElement()), s2 += 1;
          a2 ? this.threeDElements[r].container.insertBefore(t2, a2) : this.threeDElements[r].container.appendChild(t2);
          break;
        }
        r += 1;
      }
    }, HybridRendererBase.prototype.configAnimation = function(t2) {
      var e2 = createTag("div"), r = this.animationItem.wrapper, i2 = e2.style;
      i2.width = t2.w + "px", i2.height = t2.h + "px", this.resizerElem = e2, styleDiv(e2), i2.transformStyle = "flat", i2.mozTransformStyle = "flat", i2.webkitTransformStyle = "flat", this.renderConfig.className && e2.setAttribute("class", this.renderConfig.className), r.appendChild(e2), i2.overflow = "hidden";
      var a2 = createNS("svg");
      a2.setAttribute("width", "1"), a2.setAttribute("height", "1"), styleDiv(a2), this.resizerElem.appendChild(a2);
      var s2 = createNS("defs");
      a2.appendChild(s2), this.data = t2, this.setupGlobalData(t2, a2), this.globalData.defs = s2, this.layers = t2.layers, this.layerElement = this.resizerElem, this.build3dContainers(), this.updateContainerSize();
    }, HybridRendererBase.prototype.destroy = function() {
      var t2;
      this.animationItem.wrapper && (this.animationItem.wrapper.innerText = ""), this.animationItem.container = null, this.globalData.defs = null;
      var e2 = this.layers ? this.layers.length : 0;
      for (t2 = 0; t2 < e2; t2 += 1) this.elements[t2] && this.elements[t2].destroy && this.elements[t2].destroy();
      this.elements.length = 0, this.destroyed = true, this.animationItem = null;
    }, HybridRendererBase.prototype.updateContainerSize = function() {
      var t2, e2, r, i2, a2 = this.animationItem.wrapper.offsetWidth, s2 = this.animationItem.wrapper.offsetHeight, n2 = a2 / s2;
      this.globalData.compSize.w / this.globalData.compSize.h > n2 ? (t2 = a2 / this.globalData.compSize.w, e2 = a2 / this.globalData.compSize.w, r = 0, i2 = (s2 - this.globalData.compSize.h * (a2 / this.globalData.compSize.w)) / 2) : (t2 = s2 / this.globalData.compSize.h, e2 = s2 / this.globalData.compSize.h, r = (a2 - this.globalData.compSize.w * (s2 / this.globalData.compSize.h)) / 2, i2 = 0);
      var o2 = this.resizerElem.style;
      o2.webkitTransform = "matrix3d(" + t2 + ",0,0,0,0," + e2 + ",0,0,0,0,1,0," + r + "," + i2 + ",0,1)", o2.transform = o2.webkitTransform;
    }, HybridRendererBase.prototype.renderFrame = SVGRenderer.prototype.renderFrame, HybridRendererBase.prototype.hide = function() {
      this.resizerElem.style.display = "none";
    }, HybridRendererBase.prototype.show = function() {
      this.resizerElem.style.display = "block";
    }, HybridRendererBase.prototype.initItems = function() {
      if (this.buildAllItems(), this.camera) this.camera.setup();
      else {
        var t2, e2 = this.globalData.compSize.w, r = this.globalData.compSize.h, i2 = this.threeDElements.length;
        for (t2 = 0; t2 < i2; t2 += 1) {
          var a2 = this.threeDElements[t2].perspectiveElem.style;
          a2.webkitPerspective = Math.sqrt(Math.pow(e2, 2) + Math.pow(r, 2)) + "px", a2.perspective = a2.webkitPerspective;
        }
      }
    }, HybridRendererBase.prototype.searchExtraCompositions = function(t2) {
      var e2, r = t2.length, i2 = createTag("div");
      for (e2 = 0; e2 < r; e2 += 1) if (t2[e2].xt) {
        var a2 = this.createComp(t2[e2], i2, this.globalData.comp, null);
        a2.initExpressions(), this.globalData.projectInterface.registerComposition(a2);
      }
    }, extendPrototype([HybridRendererBase, ICompElement, HBaseElement], HCompElement), HCompElement.prototype._createBaseContainerElements = HCompElement.prototype.createContainerElements, HCompElement.prototype.createContainerElements = function() {
      this._createBaseContainerElements(), this.data.hasMask ? (this.svgElement.setAttribute("width", this.data.w), this.svgElement.setAttribute("height", this.data.h), this.transformedElement = this.baseElement) : this.transformedElement = this.layerElement;
    }, HCompElement.prototype.addTo3dContainer = function(t2, e2) {
      for (var r, i2 = 0; i2 < e2; ) this.elements[i2] && this.elements[i2].getBaseElement && (r = this.elements[i2].getBaseElement()), i2 += 1;
      r ? this.layerElement.insertBefore(t2, r) : this.layerElement.appendChild(t2);
    }, HCompElement.prototype.createComp = function(t2) {
      return this.supports3d ? new HCompElement(t2, this.globalData, this) : new SVGCompElement(t2, this.globalData, this);
    }, extendPrototype([HybridRendererBase], HybridRenderer), HybridRenderer.prototype.createComp = function(t2) {
      return this.supports3d ? new HCompElement(t2, this.globalData, this) : new SVGCompElement(t2, this.globalData, this);
    };
    var CompExpressionInterface = function(t2) {
      function e2(e3) {
        for (var r = 0, i2 = t2.layers.length; r < i2; ) {
          if (t2.layers[r].nm === e3 || t2.layers[r].ind === e3) return t2.elements[r].layerInterface;
          r += 1;
        }
        return null;
      }
      return Object.defineProperty(e2, "_name", { value: t2.data.nm }), e2.layer = e2, e2.pixelAspect = 1, e2.height = t2.data.h || t2.globalData.compSize.h, e2.width = t2.data.w || t2.globalData.compSize.w, e2.pixelAspect = 1, e2.frameDuration = 1 / t2.globalData.frameRate, e2.displayStartTime = 0, e2.numLayers = t2.layers.length, e2;
    };
    function _typeof$2(t2) {
      return (_typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    function seedRandom(t2, e2) {
      var r = this, i2 = e2.pow(256, 6), a2 = e2.pow(2, 52), s2 = 2 * a2;
      function n2(t3) {
        var e3, r2 = t3.length, i3 = this, a3 = 0, s3 = i3.i = i3.j = 0, n3 = i3.S = [];
        for (r2 || (t3 = [r2++]); a3 < 256; ) n3[a3] = a3++;
        for (a3 = 0; a3 < 256; a3++) n3[a3] = n3[s3 = 255 & s3 + t3[a3 % r2] + (e3 = n3[a3])], n3[s3] = e3;
        i3.g = function(t4) {
          for (var e4, r3 = 0, a4 = i3.i, s4 = i3.j, n4 = i3.S; t4--; ) e4 = n4[a4 = 255 & a4 + 1], r3 = 256 * r3 + n4[255 & (n4[a4] = n4[s4 = 255 & s4 + e4]) + (n4[s4] = e4)];
          return i3.i = a4, i3.j = s4, r3;
        };
      }
      function o2(t3, e3) {
        return e3.i = t3.i, e3.j = t3.j, e3.S = t3.S.slice(), e3;
      }
      function h2(t3, e3) {
        for (var r2, i3 = t3 + "", a3 = 0; a3 < i3.length; ) e3[255 & a3] = 255 & (r2 ^= 19 * e3[255 & a3]) + i3.charCodeAt(a3++);
        return l2(e3);
      }
      function l2(t3) {
        return String.fromCharCode.apply(0, t3);
      }
      e2.seedrandom = function(p2, f2, c2) {
        var m2 = [], d2 = h2((function t3(e3, r2) {
          var i3, a3 = [], s3 = _typeof$2(e3);
          if (r2 && "object" == s3) for (i3 in e3) try {
            a3.push(t3(e3[i3], r2 - 1));
          } catch (t4) {
          }
          return a3.length ? a3 : "string" == s3 ? e3 : e3 + "\0";
        })((f2 = true === f2 ? { entropy: true } : f2 || {}).entropy ? [p2, l2(t2)] : null === p2 ? (function() {
          try {
            var e3 = new Uint8Array(256);
            return (r.crypto || r.msCrypto).getRandomValues(e3), l2(e3);
          } catch (e4) {
            var i3 = r.navigator, a3 = i3 && i3.plugins;
            return [+/* @__PURE__ */ new Date(), r, a3, r.screen, l2(t2)];
          }
        })() : p2, 3), m2), u2 = new n2(m2), y = function() {
          for (var t3 = u2.g(6), e3 = i2, r2 = 0; t3 < a2; ) t3 = 256 * (t3 + r2), e3 *= 256, r2 = u2.g(1);
          for (; t3 >= s2; ) t3 /= 2, e3 /= 2, r2 >>>= 1;
          return (t3 + r2) / e3;
        };
        return y.int32 = function() {
          return 0 | u2.g(4);
        }, y.quick = function() {
          return u2.g(4) / 4294967296;
        }, y.double = y, h2(l2(u2.S), t2), (f2.pass || c2 || function(t3, r2, i3, a3) {
          return a3 && (a3.S && o2(a3, u2), t3.state = function() {
            return o2(u2, {});
          }), i3 ? (e2.random = t3, r2) : t3;
        })(y, d2, "global" in f2 ? f2.global : this == e2, f2.state);
      }, h2(e2.random(), t2);
    }
    function initialize$2(t2) {
      seedRandom([], t2);
    }
    var propTypes = { SHAPE: "shape" };
    function _typeof$1(t2) {
      return (_typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    var ExpressionManager = (function() {
      var ob = {}, Math = BMMath, window = null, document = null, XMLHttpRequest = null, fetch = null, frames = null, _lottieGlobal = {};
      function resetFrame() {
        _lottieGlobal = {};
      }
      function $bm_isInstanceOfArray(t2) {
        return t2.constructor === Array || t2.constructor === Float32Array;
      }
      function isNumerable(t2, e2) {
        return "number" === t2 || e2 instanceof Number || "boolean" === t2 || "string" === t2;
      }
      function $bm_neg(t2) {
        var e2 = _typeof$1(t2);
        if ("number" === e2 || t2 instanceof Number || "boolean" === e2) return -t2;
        if ($bm_isInstanceOfArray(t2)) {
          var r, i2 = t2.length, a2 = [];
          for (r = 0; r < i2; r += 1) a2[r] = -t2[r];
          return a2;
        }
        return t2.propType ? t2.v : -t2;
      }
      initialize$2(BMMath);
      var easeInBez = BezierFactory.getBezierEasing(0.333, 0, 0.833, 0.833, "easeIn").get, easeOutBez = BezierFactory.getBezierEasing(0.167, 0.167, 0.667, 1, "easeOut").get, easeInOutBez = BezierFactory.getBezierEasing(0.33, 0, 0.667, 1, "easeInOut").get;
      function sum(t2, e2) {
        var r = _typeof$1(t2), i2 = _typeof$1(e2);
        if (isNumerable(r, t2) && isNumerable(i2, e2) || "string" === r || "string" === i2) return t2 + e2;
        if ($bm_isInstanceOfArray(t2) && isNumerable(i2, e2)) return (t2 = t2.slice(0))[0] += e2, t2;
        if (isNumerable(r, t2) && $bm_isInstanceOfArray(e2)) return (e2 = e2.slice(0))[0] = t2 + e2[0], e2;
        if ($bm_isInstanceOfArray(t2) && $bm_isInstanceOfArray(e2)) {
          for (var a2 = 0, s2 = t2.length, n2 = e2.length, o2 = []; a2 < s2 || a2 < n2; ) ("number" == typeof t2[a2] || t2[a2] instanceof Number) && ("number" == typeof e2[a2] || e2[a2] instanceof Number) ? o2[a2] = t2[a2] + e2[a2] : o2[a2] = void 0 === e2[a2] ? t2[a2] : t2[a2] || e2[a2], a2 += 1;
          return o2;
        }
        return 0;
      }
      var add = sum;
      function sub(t2, e2) {
        var r = _typeof$1(t2), i2 = _typeof$1(e2);
        if (isNumerable(r, t2) && isNumerable(i2, e2)) return "string" === r && (t2 = parseInt(t2, 10)), "string" === i2 && (e2 = parseInt(e2, 10)), t2 - e2;
        if ($bm_isInstanceOfArray(t2) && isNumerable(i2, e2)) return (t2 = t2.slice(0))[0] -= e2, t2;
        if (isNumerable(r, t2) && $bm_isInstanceOfArray(e2)) return (e2 = e2.slice(0))[0] = t2 - e2[0], e2;
        if ($bm_isInstanceOfArray(t2) && $bm_isInstanceOfArray(e2)) {
          for (var a2 = 0, s2 = t2.length, n2 = e2.length, o2 = []; a2 < s2 || a2 < n2; ) ("number" == typeof t2[a2] || t2[a2] instanceof Number) && ("number" == typeof e2[a2] || e2[a2] instanceof Number) ? o2[a2] = t2[a2] - e2[a2] : o2[a2] = void 0 === e2[a2] ? t2[a2] : t2[a2] || e2[a2], a2 += 1;
          return o2;
        }
        return 0;
      }
      function mul(t2, e2) {
        var r, i2, a2, s2 = _typeof$1(t2), n2 = _typeof$1(e2);
        if (isNumerable(s2, t2) && isNumerable(n2, e2)) return t2 * e2;
        if ($bm_isInstanceOfArray(t2) && isNumerable(n2, e2)) {
          for (a2 = t2.length, r = createTypedArray("float32", a2), i2 = 0; i2 < a2; i2 += 1) r[i2] = t2[i2] * e2;
          return r;
        }
        if (isNumerable(s2, t2) && $bm_isInstanceOfArray(e2)) {
          for (a2 = e2.length, r = createTypedArray("float32", a2), i2 = 0; i2 < a2; i2 += 1) r[i2] = t2 * e2[i2];
          return r;
        }
        return 0;
      }
      function div(t2, e2) {
        var r, i2, a2, s2 = _typeof$1(t2), n2 = _typeof$1(e2);
        if (isNumerable(s2, t2) && isNumerable(n2, e2)) return t2 / e2;
        if ($bm_isInstanceOfArray(t2) && isNumerable(n2, e2)) {
          for (a2 = t2.length, r = createTypedArray("float32", a2), i2 = 0; i2 < a2; i2 += 1) r[i2] = t2[i2] / e2;
          return r;
        }
        if (isNumerable(s2, t2) && $bm_isInstanceOfArray(e2)) {
          for (a2 = e2.length, r = createTypedArray("float32", a2), i2 = 0; i2 < a2; i2 += 1) r[i2] = t2 / e2[i2];
          return r;
        }
        return 0;
      }
      function mod(t2, e2) {
        return "string" == typeof t2 && (t2 = parseInt(t2, 10)), "string" == typeof e2 && (e2 = parseInt(e2, 10)), t2 % e2;
      }
      var $bm_sum = sum, $bm_sub = sub, $bm_mul = mul, $bm_div = div, $bm_mod = mod;
      function clamp(t2, e2, r) {
        if (e2 > r) {
          var i2 = r;
          r = e2, e2 = i2;
        }
        return Math.min(Math.max(t2, e2), r);
      }
      function radiansToDegrees(t2) {
        return t2 / degToRads;
      }
      var radians_to_degrees = radiansToDegrees;
      function degreesToRadians(t2) {
        return t2 * degToRads;
      }
      var degrees_to_radians = radiansToDegrees, helperLengthArray = [0, 0, 0, 0, 0, 0];
      function length(t2, e2) {
        if ("number" == typeof t2 || t2 instanceof Number) return e2 = e2 || 0, Math.abs(t2 - e2);
        var r;
        e2 || (e2 = helperLengthArray);
        var i2 = Math.min(t2.length, e2.length), a2 = 0;
        for (r = 0; r < i2; r += 1) a2 += Math.pow(e2[r] - t2[r], 2);
        return Math.sqrt(a2);
      }
      function normalize(t2) {
        return div(t2, length(t2));
      }
      function rgbToHsl(t2) {
        var e2, r, i2 = t2[0], a2 = t2[1], s2 = t2[2], n2 = Math.max(i2, a2, s2), o2 = Math.min(i2, a2, s2), h2 = (n2 + o2) / 2;
        if (n2 === o2) e2 = 0, r = 0;
        else {
          var l2 = n2 - o2;
          switch (r = h2 > 0.5 ? l2 / (2 - n2 - o2) : l2 / (n2 + o2), n2) {
            case i2:
              e2 = (a2 - s2) / l2 + (a2 < s2 ? 6 : 0);
              break;
            case a2:
              e2 = (s2 - i2) / l2 + 2;
              break;
            case s2:
              e2 = (i2 - a2) / l2 + 4;
          }
          e2 /= 6;
        }
        return [e2, r, h2, t2[3]];
      }
      function hue2rgb(t2, e2, r) {
        return r < 0 && (r += 1), r > 1 && (r -= 1), r < 1 / 6 ? t2 + 6 * (e2 - t2) * r : r < 0.5 ? e2 : r < 2 / 3 ? t2 + (e2 - t2) * (2 / 3 - r) * 6 : t2;
      }
      function hslToRgb(t2) {
        var e2, r, i2, a2 = t2[0], s2 = t2[1], n2 = t2[2];
        if (0 === s2) e2 = n2, i2 = n2, r = n2;
        else {
          var o2 = n2 < 0.5 ? n2 * (1 + s2) : n2 + s2 - n2 * s2, h2 = 2 * n2 - o2;
          e2 = hue2rgb(h2, o2, a2 + 1 / 3), r = hue2rgb(h2, o2, a2), i2 = hue2rgb(h2, o2, a2 - 1 / 3);
        }
        return [e2, r, i2, t2[3]];
      }
      function linear(t2, e2, r, i2, a2) {
        if (void 0 !== i2 && void 0 !== a2 || (i2 = e2, a2 = r, e2 = 0, r = 1), r < e2) {
          var s2 = r;
          r = e2, e2 = s2;
        }
        if (t2 <= e2) return i2;
        if (t2 >= r) return a2;
        var n2, o2 = r === e2 ? 0 : (t2 - e2) / (r - e2);
        if (!i2.length) return i2 + (a2 - i2) * o2;
        var h2 = i2.length, l2 = createTypedArray("float32", h2);
        for (n2 = 0; n2 < h2; n2 += 1) l2[n2] = i2[n2] + (a2[n2] - i2[n2]) * o2;
        return l2;
      }
      function random(t2, e2) {
        if (void 0 === e2 && (void 0 === t2 ? (t2 = 0, e2 = 1) : (e2 = t2, t2 = void 0)), e2.length) {
          var r, i2 = e2.length;
          t2 || (t2 = createTypedArray("float32", i2));
          var a2 = createTypedArray("float32", i2), s2 = BMMath.random();
          for (r = 0; r < i2; r += 1) a2[r] = t2[r] + s2 * (e2[r] - t2[r]);
          return a2;
        }
        return void 0 === t2 && (t2 = 0), t2 + BMMath.random() * (e2 - t2);
      }
      function createPath(t2, e2, r, i2) {
        var a2, s2 = t2.length, n2 = shapePool.newElement();
        n2.setPathData(!!i2, s2);
        var o2, h2, l2 = [0, 0];
        for (a2 = 0; a2 < s2; a2 += 1) o2 = e2 && e2[a2] ? e2[a2] : l2, h2 = r && r[a2] ? r[a2] : l2, n2.setTripleAt(t2[a2][0], t2[a2][1], h2[0] + t2[a2][0], h2[1] + t2[a2][1], o2[0] + t2[a2][0], o2[1] + t2[a2][1], a2, true);
        return n2;
      }
      function initiateExpression(elem, data, property) {
        function noOp(t2) {
          return t2;
        }
        if (!elem.globalData.renderConfig.runExpressions) return noOp;
        var val = data.x, needsVelocity = /velocity(?![\w\d])/.test(val), _needsRandom = -1 !== val.indexOf("random"), elemType = elem.data.ty, transform, $bm_transform, content, effect, thisProperty = property;
        thisProperty.valueAtTime = thisProperty.getValueAtTime, Object.defineProperty(thisProperty, "value", { get: function() {
          return thisProperty.v;
        } }), elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate, elem.comp.displayStartTime = 0;
        var inPoint = elem.data.ip / elem.comp.globalData.frameRate, outPoint = elem.data.op / elem.comp.globalData.frameRate, width = elem.data.sw ? elem.data.sw : 0, height = elem.data.sh ? elem.data.sh : 0, name = elem.data.nm, loopIn, loop_in, loopOut, loop_out, smooth, toWorld, fromWorld, fromComp, toComp, fromCompToSurface, position, rotation, anchorPoint, scale, thisLayer, thisComp, mask, valueAtTime, velocityAtTime, scoped_bm_rt, expression_function = eval("[function _expression_function(){" + val + ";scoped_bm_rt=$bm_rt}]")[0], numKeys = property.kf ? data.k.length : 0, active = !this.data || true !== this.data.hd, wiggle = function(t2, e2) {
          var r, i2, a2 = this.pv.length ? this.pv.length : 1, s2 = createTypedArray("float32", a2);
          var n2 = Math.floor(5 * time);
          for (r = 0, i2 = 0; r < n2; ) {
            for (i2 = 0; i2 < a2; i2 += 1) s2[i2] += -e2 + 2 * e2 * BMMath.random();
            r += 1;
          }
          var o2 = 5 * time, h2 = o2 - Math.floor(o2), l2 = createTypedArray("float32", a2);
          if (a2 > 1) {
            for (i2 = 0; i2 < a2; i2 += 1) l2[i2] = this.pv[i2] + s2[i2] + (-e2 + 2 * e2 * BMMath.random()) * h2;
            return l2;
          }
          return this.pv + s2[0] + (-e2 + 2 * e2 * BMMath.random()) * h2;
        }.bind(this);
        function loopInDuration(t2, e2) {
          return loopIn(t2, e2, true);
        }
        function loopOutDuration(t2, e2) {
          return loopOut(t2, e2, true);
        }
        thisProperty.loopIn && (loopIn = thisProperty.loopIn.bind(thisProperty), loop_in = loopIn), thisProperty.loopOut && (loopOut = thisProperty.loopOut.bind(thisProperty), loop_out = loopOut), thisProperty.smooth && (smooth = thisProperty.smooth.bind(thisProperty)), this.getValueAtTime && (valueAtTime = this.getValueAtTime.bind(this)), this.getVelocityAtTime && (velocityAtTime = this.getVelocityAtTime.bind(this));
        var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface), time, velocity, value, text, textIndex, textTotal, selectorValue;
        function lookAt(t2, e2) {
          var r = [e2[0] - t2[0], e2[1] - t2[1], e2[2] - t2[2]], i2 = Math.atan2(r[0], Math.sqrt(r[1] * r[1] + r[2] * r[2])) / degToRads;
          return [-Math.atan2(r[1], r[2]) / degToRads, i2, 0];
        }
        function easeOut(t2, e2, r, i2, a2) {
          return applyEase(easeOutBez, t2, e2, r, i2, a2);
        }
        function easeIn(t2, e2, r, i2, a2) {
          return applyEase(easeInBez, t2, e2, r, i2, a2);
        }
        function ease(t2, e2, r, i2, a2) {
          return applyEase(easeInOutBez, t2, e2, r, i2, a2);
        }
        function applyEase(t2, e2, r, i2, a2, s2) {
          void 0 === a2 ? (a2 = r, s2 = i2) : e2 = (e2 - r) / (i2 - r), e2 > 1 ? e2 = 1 : e2 < 0 && (e2 = 0);
          var n2 = t2(e2);
          if ($bm_isInstanceOfArray(a2)) {
            var o2, h2 = a2.length, l2 = createTypedArray("float32", h2);
            for (o2 = 0; o2 < h2; o2 += 1) l2[o2] = (s2[o2] - a2[o2]) * n2 + a2[o2];
            return l2;
          }
          return (s2 - a2) * n2 + a2;
        }
        function nearestKey(t2) {
          var e2, r, i2, a2 = data.k.length;
          if (data.k.length && "number" != typeof data.k[0]) if (r = -1, (t2 *= elem.comp.globalData.frameRate) < data.k[0].t) r = 1, i2 = data.k[0].t;
          else {
            for (e2 = 0; e2 < a2 - 1; e2 += 1) {
              if (t2 === data.k[e2].t) {
                r = e2 + 1, i2 = data.k[e2].t;
                break;
              }
              if (t2 > data.k[e2].t && t2 < data.k[e2 + 1].t) {
                t2 - data.k[e2].t > data.k[e2 + 1].t - t2 ? (r = e2 + 2, i2 = data.k[e2 + 1].t) : (r = e2 + 1, i2 = data.k[e2].t);
                break;
              }
            }
            -1 === r && (r = e2 + 1, i2 = data.k[e2].t);
          }
          else r = 0, i2 = 0;
          var s2 = {};
          return s2.index = r, s2.time = i2 / elem.comp.globalData.frameRate, s2;
        }
        function key(t2) {
          var e2, r, i2;
          if (!data.k.length || "number" == typeof data.k[0]) throw new Error("The property has no keyframe at index " + t2);
          t2 -= 1, e2 = { time: data.k[t2].t / elem.comp.globalData.frameRate, value: [] };
          var a2 = Object.prototype.hasOwnProperty.call(data.k[t2], "s") ? data.k[t2].s : data.k[t2 - 1].e;
          for (i2 = a2.length, r = 0; r < i2; r += 1) e2[r] = a2[r], e2.value[r] = a2[r];
          return e2;
        }
        function framesToTime(t2, e2) {
          return e2 || (e2 = elem.comp.globalData.frameRate), t2 / e2;
        }
        function timeToFrames(t2, e2) {
          return t2 || 0 === t2 || (t2 = time), e2 || (e2 = elem.comp.globalData.frameRate), t2 * e2;
        }
        function seedRandom(t2) {
          BMMath.seedrandom(randSeed + t2);
        }
        function sourceRectAtTime() {
          return elem.sourceRectAtTime();
        }
        function substring(t2, e2) {
          return "string" == typeof value ? void 0 === e2 ? value.substring(t2) : value.substring(t2, e2) : "";
        }
        function substr(t2, e2) {
          return "string" == typeof value ? void 0 === e2 ? value.substr(t2) : value.substr(t2, e2) : "";
        }
        function posterizeTime(t2) {
          time = 0 === t2 ? 0 : Math.floor(time * t2) / t2, value = valueAtTime(time);
        }
        var index = elem.data.ind;
        !(!elem.hierarchy || !elem.hierarchy.length);
        var parent, randSeed = Math.floor(1e6 * Math.random()), globalData = elem.globalData;
        function executeExpression(t2) {
          return value = t2, this.frameExpressionId === elem.globalData.frameId && "textSelector" !== this.propType ? value : ("textSelector" === this.propType && (textIndex = this.textIndex, textTotal = this.textTotal, selectorValue = this.selectorValue), thisLayer || (text = elem.layerInterface.text, thisLayer = elem.layerInterface, thisComp = elem.comp.compInterface, toWorld = thisLayer.toWorld.bind(thisLayer), fromWorld = thisLayer.fromWorld.bind(thisLayer), fromComp = thisLayer.fromComp.bind(thisLayer), toComp = thisLayer.toComp.bind(thisLayer), mask = thisLayer.mask ? thisLayer.mask.bind(thisLayer) : null, fromCompToSurface = fromComp), transform || (transform = elem.layerInterface("ADBE Transform Group"), $bm_transform = transform, transform && (anchorPoint = transform.anchorPoint)), 4 !== elemType || content || (content = thisLayer("ADBE Root Vectors Group")), effect || (effect = thisLayer(4)), !(!elem.hierarchy || !elem.hierarchy.length) && !parent && (parent = elem.hierarchy[0].layerInterface), time = this.comp.renderedFrame / this.comp.globalData.frameRate, _needsRandom && seedRandom(randSeed + time), needsVelocity && (velocity = velocityAtTime(time)), expression_function(), this.frameExpressionId = elem.globalData.frameId, scoped_bm_rt = scoped_bm_rt.propType === propTypes.SHAPE ? scoped_bm_rt.v : scoped_bm_rt);
        }
        return executeExpression.__preventDeadCodeRemoval = [$bm_transform, anchorPoint, time, velocity, inPoint, outPoint, width, height, name, loop_in, loop_out, smooth, toComp, fromCompToSurface, toWorld, fromWorld, mask, position, rotation, scale, thisComp, numKeys, active, wiggle, loopInDuration, loopOutDuration, comp, lookAt, easeOut, easeIn, ease, nearestKey, key, text, textIndex, textTotal, selectorValue, framesToTime, timeToFrames, sourceRectAtTime, substring, substr, posterizeTime, index, globalData], executeExpression;
      }
      return ob.initiateExpression = initiateExpression, ob.__preventDeadCodeRemoval = [window, document, XMLHttpRequest, fetch, frames, $bm_neg, add, $bm_sum, $bm_sub, $bm_mul, $bm_div, $bm_mod, clamp, radians_to_degrees, degreesToRadians, degrees_to_radians, normalize, rgbToHsl, hslToRgb, linear, random, createPath, _lottieGlobal], ob.resetFrame = resetFrame, ob;
    })(), Expressions = (function() {
      var t2 = {};
      return t2.initExpressions = function(t3) {
        var e2 = 0, r = [];
        t3.renderer.compInterface = CompExpressionInterface(t3.renderer), t3.renderer.globalData.projectInterface.registerComposition(t3.renderer), t3.renderer.globalData.pushExpression = function() {
          e2 += 1;
        }, t3.renderer.globalData.popExpression = function() {
          0 === (e2 -= 1) && (function() {
            var t4, e3 = r.length;
            for (t4 = 0; t4 < e3; t4 += 1) r[t4].release();
            r.length = 0;
          })();
        }, t3.renderer.globalData.registerExpressionProperty = function(t4) {
          -1 === r.indexOf(t4) && r.push(t4);
        };
      }, t2.resetFrame = ExpressionManager.resetFrame, t2;
    })(), MaskManagerInterface = (function() {
      function t2(t3, e2) {
        this._mask = t3, this._data = e2;
      }
      Object.defineProperty(t2.prototype, "maskPath", { get: function() {
        return this._mask.prop.k && this._mask.prop.getValue(), this._mask.prop;
      } }), Object.defineProperty(t2.prototype, "maskOpacity", { get: function() {
        return this._mask.op.k && this._mask.op.getValue(), 100 * this._mask.op.v;
      } });
      return function(e2) {
        var r, i2 = createSizedArray(e2.viewData.length), a2 = e2.viewData.length;
        for (r = 0; r < a2; r += 1) i2[r] = new t2(e2.viewData[r], e2.masksProperties[r]);
        return function(t3) {
          for (r = 0; r < a2; ) {
            if (e2.masksProperties[r].nm === t3) return i2[r];
            r += 1;
          }
          return null;
        };
      };
    })(), ExpressionPropertyInterface = /* @__PURE__ */ (function() {
      var t2 = { pv: 0, v: 0, mult: 1 }, e2 = { pv: [0, 0, 0], v: [0, 0, 0], mult: 1 };
      function r(t3, e3, r2) {
        Object.defineProperty(t3, "velocity", { get: function() {
          return e3.getVelocityAtTime(e3.comp.currentFrame);
        } }), t3.numKeys = e3.keyframes ? e3.keyframes.length : 0, t3.key = function(i3) {
          if (!t3.numKeys) return 0;
          var a2 = "";
          a2 = "s" in e3.keyframes[i3 - 1] ? e3.keyframes[i3 - 1].s : "e" in e3.keyframes[i3 - 2] ? e3.keyframes[i3 - 2].e : e3.keyframes[i3 - 2].s;
          var s2 = "unidimensional" === r2 ? new Number(a2) : Object.assign({}, a2);
          return s2.time = e3.keyframes[i3 - 1].t / e3.elem.comp.globalData.frameRate, s2.value = "unidimensional" === r2 ? a2[0] : a2, s2;
        }, t3.valueAtTime = e3.getValueAtTime, t3.speedAtTime = e3.getSpeedAtTime, t3.velocityAtTime = e3.getVelocityAtTime, t3.propertyGroup = e3.propertyGroup;
      }
      function i2() {
        return t2;
      }
      return function(a2) {
        return a2 ? "unidimensional" === a2.propType ? (function(e3) {
          e3 && "pv" in e3 || (e3 = t2);
          var i3 = 1 / e3.mult, a3 = e3.pv * i3, s2 = new Number(a3);
          return s2.value = a3, r(s2, e3, "unidimensional"), function() {
            return e3.k && e3.getValue(), a3 = e3.v * i3, s2.value !== a3 && ((s2 = new Number(a3)).value = a3, r(s2, e3, "unidimensional")), s2;
          };
        })(a2) : (function(t3) {
          t3 && "pv" in t3 || (t3 = e2);
          var i3 = 1 / t3.mult, a3 = t3.data && t3.data.l || t3.pv.length, s2 = createTypedArray("float32", a3), n2 = createTypedArray("float32", a3);
          return s2.value = n2, r(s2, t3, "multidimensional"), function() {
            t3.k && t3.getValue();
            for (var e3 = 0; e3 < a3; e3 += 1) n2[e3] = t3.v[e3] * i3, s2[e3] = n2[e3];
            return s2;
          };
        })(a2) : i2;
      };
    })(), TransformExpressionInterface = function(t2) {
      function e2(t3) {
        switch (t3) {
          case "scale":
          case "Scale":
          case "ADBE Scale":
          case 6:
            return e2.scale;
          case "rotation":
          case "Rotation":
          case "ADBE Rotation":
          case "ADBE Rotate Z":
          case 10:
            return e2.rotation;
          case "ADBE Rotate X":
            return e2.xRotation;
          case "ADBE Rotate Y":
            return e2.yRotation;
          case "position":
          case "Position":
          case "ADBE Position":
          case 2:
            return e2.position;
          case "ADBE Position_0":
            return e2.xPosition;
          case "ADBE Position_1":
            return e2.yPosition;
          case "ADBE Position_2":
            return e2.zPosition;
          case "anchorPoint":
          case "AnchorPoint":
          case "Anchor Point":
          case "ADBE AnchorPoint":
          case 1:
            return e2.anchorPoint;
          case "opacity":
          case "Opacity":
          case 11:
            return e2.opacity;
          default:
            return null;
        }
      }
      var r, i2, a2, s2;
      return Object.defineProperty(e2, "rotation", { get: ExpressionPropertyInterface(t2.r || t2.rz) }), Object.defineProperty(e2, "zRotation", { get: ExpressionPropertyInterface(t2.rz || t2.r) }), Object.defineProperty(e2, "xRotation", { get: ExpressionPropertyInterface(t2.rx) }), Object.defineProperty(e2, "yRotation", { get: ExpressionPropertyInterface(t2.ry) }), Object.defineProperty(e2, "scale", { get: ExpressionPropertyInterface(t2.s) }), t2.p ? s2 = ExpressionPropertyInterface(t2.p) : (r = ExpressionPropertyInterface(t2.px), i2 = ExpressionPropertyInterface(t2.py), t2.pz && (a2 = ExpressionPropertyInterface(t2.pz))), Object.defineProperty(e2, "position", { get: function() {
        return t2.p ? s2() : [r(), i2(), a2 ? a2() : 0];
      } }), Object.defineProperty(e2, "xPosition", { get: ExpressionPropertyInterface(t2.px) }), Object.defineProperty(e2, "yPosition", { get: ExpressionPropertyInterface(t2.py) }), Object.defineProperty(e2, "zPosition", { get: ExpressionPropertyInterface(t2.pz) }), Object.defineProperty(e2, "anchorPoint", { get: ExpressionPropertyInterface(t2.a) }), Object.defineProperty(e2, "opacity", { get: ExpressionPropertyInterface(t2.o) }), Object.defineProperty(e2, "skew", { get: ExpressionPropertyInterface(t2.sk) }), Object.defineProperty(e2, "skewAxis", { get: ExpressionPropertyInterface(t2.sa) }), Object.defineProperty(e2, "orientation", { get: ExpressionPropertyInterface(t2.or) }), e2;
    }, LayerExpressionInterface = /* @__PURE__ */ (function() {
      function t2(t3) {
        var e3 = new Matrix();
        void 0 !== t3 ? this._elem.finalTransform.mProp.getValueAtTime(t3).clone(e3) : this._elem.finalTransform.mProp.applyToMatrix(e3);
        return e3;
      }
      function e2(t3, e3) {
        var r2 = this.getMatrix(e3);
        return r2.props[12] = 0, r2.props[13] = 0, r2.props[14] = 0, this.applyPoint(r2, t3);
      }
      function r(t3, e3) {
        var r2 = this.getMatrix(e3);
        return this.applyPoint(r2, t3);
      }
      function i2(t3, e3) {
        var r2 = this.getMatrix(e3);
        return r2.props[12] = 0, r2.props[13] = 0, r2.props[14] = 0, this.invertPoint(r2, t3);
      }
      function a2(t3, e3) {
        var r2 = this.getMatrix(e3);
        return this.invertPoint(r2, t3);
      }
      function s2(t3, e3) {
        if (this._elem.hierarchy && this._elem.hierarchy.length) {
          var r2, i3 = this._elem.hierarchy.length;
          for (r2 = 0; r2 < i3; r2 += 1) this._elem.hierarchy[r2].finalTransform.mProp.applyToMatrix(t3);
        }
        return t3.applyToPointArray(e3[0], e3[1], e3[2] || 0);
      }
      function n2(t3, e3) {
        if (this._elem.hierarchy && this._elem.hierarchy.length) {
          var r2, i3 = this._elem.hierarchy.length;
          for (r2 = 0; r2 < i3; r2 += 1) this._elem.hierarchy[r2].finalTransform.mProp.applyToMatrix(t3);
        }
        return t3.inversePoint(e3);
      }
      function o2(t3) {
        var e3 = new Matrix();
        if (e3.reset(), this._elem.finalTransform.mProp.applyToMatrix(e3), this._elem.hierarchy && this._elem.hierarchy.length) {
          var r2, i3 = this._elem.hierarchy.length;
          for (r2 = 0; r2 < i3; r2 += 1) this._elem.hierarchy[r2].finalTransform.mProp.applyToMatrix(e3);
          return e3.inversePoint(t3);
        }
        return e3.inversePoint(t3);
      }
      function h2() {
        return [1, 1, 1, 1];
      }
      return function(l2) {
        var p2;
        function f2(t3) {
          switch (t3) {
            case "ADBE Root Vectors Group":
            case "Contents":
            case 2:
              return f2.shapeInterface;
            case 1:
            case 6:
            case "Transform":
            case "transform":
            case "ADBE Transform Group":
              return p2;
            case 4:
            case "ADBE Effect Parade":
            case "effects":
            case "Effects":
              return f2.effect;
            case "ADBE Text Properties":
              return f2.textInterface;
            default:
              return null;
          }
        }
        f2.getMatrix = t2, f2.invertPoint = n2, f2.applyPoint = s2, f2.toWorld = r, f2.toWorldVec = e2, f2.fromWorld = a2, f2.fromWorldVec = i2, f2.toComp = r, f2.fromComp = o2, f2.sampleImage = h2, f2.sourceRectAtTime = l2.sourceRectAtTime.bind(l2), f2._elem = l2;
        var c2 = getDescriptor(p2 = TransformExpressionInterface(l2.finalTransform.mProp), "anchorPoint");
        return Object.defineProperties(f2, { hasParent: { get: function() {
          return l2.hierarchy.length;
        } }, parent: { get: function() {
          return l2.hierarchy[0].layerInterface;
        } }, rotation: getDescriptor(p2, "rotation"), scale: getDescriptor(p2, "scale"), position: getDescriptor(p2, "position"), opacity: getDescriptor(p2, "opacity"), anchorPoint: c2, anchor_point: c2, transform: { get: function() {
          return p2;
        } }, active: { get: function() {
          return l2.isInRange;
        } } }), f2.startTime = l2.data.st, f2.index = l2.data.ind, f2.source = l2.data.refId, f2.height = 0 === l2.data.ty ? l2.data.h : 100, f2.width = 0 === l2.data.ty ? l2.data.w : 100, f2.inPoint = l2.data.ip / l2.comp.globalData.frameRate, f2.outPoint = l2.data.op / l2.comp.globalData.frameRate, f2._name = l2.data.nm, f2.registerMaskInterface = function(t3) {
          f2.mask = new MaskManagerInterface(t3, l2);
        }, f2.registerEffectsInterface = function(t3) {
          f2.effect = t3;
        }, f2;
      };
    })(), propertyGroupFactory = function(t2, e2) {
      return function(r) {
        return (r = void 0 === r ? 1 : r) <= 0 ? t2 : e2(r - 1);
      };
    }, PropertyInterface = function(t2, e2) {
      var r = { _name: t2 };
      return function(t3) {
        return (t3 = void 0 === t3 ? 1 : t3) <= 0 ? r : e2(t3 - 1);
      };
    }, EffectsExpressionInterface = /* @__PURE__ */ (function() {
      function t2(r, i2, a2, s2) {
        function n2(t3) {
          for (var e3 = r.ef, i3 = 0, a3 = e3.length; i3 < a3; ) {
            if (t3 === e3[i3].nm || t3 === e3[i3].mn || t3 === e3[i3].ix) return 5 === e3[i3].ty ? l2[i3] : l2[i3]();
            i3 += 1;
          }
          throw new Error();
        }
        var o2, h2 = propertyGroupFactory(n2, a2), l2 = [], p2 = r.ef.length;
        for (o2 = 0; o2 < p2; o2 += 1) 5 === r.ef[o2].ty ? l2.push(t2(r.ef[o2], i2.effectElements[o2], i2.effectElements[o2].propertyGroup, s2)) : l2.push(e2(i2.effectElements[o2], r.ef[o2].ty, s2, h2));
        return "ADBE Color Control" === r.mn && Object.defineProperty(n2, "color", { get: function() {
          return l2[0]();
        } }), Object.defineProperties(n2, { numProperties: { get: function() {
          return r.np;
        } }, _name: { value: r.nm }, propertyGroup: { value: h2 } }), n2.enabled = 0 !== r.en, n2.active = n2.enabled, n2;
      }
      function e2(t3, e3, r, i2) {
        var a2 = ExpressionPropertyInterface(t3.p);
        return t3.p.setGroupProperty && t3.p.setGroupProperty(PropertyInterface("", i2)), function() {
          return 10 === e3 ? r.comp.compInterface(t3.p.v) : a2();
        };
      }
      return { createEffectsInterface: function(e3, r) {
        if (e3.effectsManager) {
          var i2, a2 = [], s2 = e3.data.ef, n2 = e3.effectsManager.effectElements.length;
          for (i2 = 0; i2 < n2; i2 += 1) a2.push(t2(s2[i2], e3.effectsManager.effectElements[i2], r, e3));
          var o2 = e3.data.ef || [], h2 = function(t3) {
            for (i2 = 0, n2 = o2.length; i2 < n2; ) {
              if (t3 === o2[i2].nm || t3 === o2[i2].mn || t3 === o2[i2].ix) return a2[i2];
              i2 += 1;
            }
            return null;
          };
          return Object.defineProperty(h2, "numProperties", { get: function() {
            return o2.length;
          } }), h2;
        }
        return null;
      } };
    })(), ShapePathInterface = function(t2, e2, r) {
      var i2 = e2.sh;
      function a2(t3) {
        return "Shape" === t3 || "shape" === t3 || "Path" === t3 || "path" === t3 || "ADBE Vector Shape" === t3 || 2 === t3 ? a2.path : null;
      }
      var s2 = propertyGroupFactory(a2, r);
      return i2.setGroupProperty(PropertyInterface("Path", s2)), Object.defineProperties(a2, { path: { get: function() {
        return i2.k && i2.getValue(), i2;
      } }, shape: { get: function() {
        return i2.k && i2.getValue(), i2;
      } }, _name: { value: t2.nm }, ix: { value: t2.ix }, propertyIndex: { value: t2.ix }, mn: { value: t2.mn }, propertyGroup: { value: r } }), a2;
    }, ShapeExpressionInterface = /* @__PURE__ */ (function() {
      function t2(t3, o3, m2) {
        var d2, u2 = [], y = t3 ? t3.length : 0;
        for (d2 = 0; d2 < y; d2 += 1) "gr" === t3[d2].ty ? u2.push(e2(t3[d2], o3[d2], m2)) : "fl" === t3[d2].ty ? u2.push(r(t3[d2], o3[d2], m2)) : "st" === t3[d2].ty ? u2.push(s2(t3[d2], o3[d2], m2)) : "tm" === t3[d2].ty ? u2.push(n2(t3[d2], o3[d2], m2)) : "tr" === t3[d2].ty || ("el" === t3[d2].ty ? u2.push(h2(t3[d2], o3[d2], m2)) : "sr" === t3[d2].ty ? u2.push(l2(t3[d2], o3[d2], m2)) : "sh" === t3[d2].ty ? u2.push(ShapePathInterface(t3[d2], o3[d2], m2)) : "rc" === t3[d2].ty ? u2.push(p2(t3[d2], o3[d2], m2)) : "rd" === t3[d2].ty ? u2.push(f2(t3[d2], o3[d2], m2)) : "rp" === t3[d2].ty ? u2.push(c2(t3[d2], o3[d2], m2)) : "gf" === t3[d2].ty ? u2.push(i2(t3[d2], o3[d2], m2)) : u2.push(a2(t3[d2], o3[d2])));
        return u2;
      }
      function e2(e3, r2, i3) {
        var a3 = function(t3) {
          switch (t3) {
            case "ADBE Vectors Group":
            case "Contents":
            case 2:
              return a3.content;
            default:
              return a3.transform;
          }
        };
        a3.propertyGroup = propertyGroupFactory(a3, i3);
        var s3 = (function(e4, r3, i4) {
          var a4, s4 = function(t3) {
            for (var e5 = 0, r4 = a4.length; e5 < r4; ) {
              if (a4[e5]._name === t3 || a4[e5].mn === t3 || a4[e5].propertyIndex === t3 || a4[e5].ix === t3 || a4[e5].ind === t3) return a4[e5];
              e5 += 1;
            }
            return "number" == typeof t3 ? a4[t3 - 1] : null;
          };
          s4.propertyGroup = propertyGroupFactory(s4, i4), a4 = t2(e4.it, r3.it, s4.propertyGroup), s4.numProperties = a4.length;
          var n4 = o2(e4.it[e4.it.length - 1], r3.it[r3.it.length - 1], s4.propertyGroup);
          return s4.transform = n4, s4.propertyIndex = e4.cix, s4._name = e4.nm, s4;
        })(e3, r2, a3.propertyGroup), n3 = o2(e3.it[e3.it.length - 1], r2.it[r2.it.length - 1], a3.propertyGroup);
        return a3.content = s3, a3.transform = n3, Object.defineProperty(a3, "_name", { get: function() {
          return e3.nm;
        } }), a3.numProperties = e3.np, a3.propertyIndex = e3.ix, a3.nm = e3.nm, a3.mn = e3.mn, a3;
      }
      function r(t3, e3, r2) {
        function i3(t4) {
          return "Color" === t4 || "color" === t4 ? i3.color : "Opacity" === t4 || "opacity" === t4 ? i3.opacity : null;
        }
        return Object.defineProperties(i3, { color: { get: ExpressionPropertyInterface(e3.c) }, opacity: { get: ExpressionPropertyInterface(e3.o) }, _name: { value: t3.nm }, mn: { value: t3.mn } }), e3.c.setGroupProperty(PropertyInterface("Color", r2)), e3.o.setGroupProperty(PropertyInterface("Opacity", r2)), i3;
      }
      function i2(t3, e3, r2) {
        function i3(t4) {
          return "Start Point" === t4 || "start point" === t4 ? i3.startPoint : "End Point" === t4 || "end point" === t4 ? i3.endPoint : "Opacity" === t4 || "opacity" === t4 ? i3.opacity : null;
        }
        return Object.defineProperties(i3, { startPoint: { get: ExpressionPropertyInterface(e3.s) }, endPoint: { get: ExpressionPropertyInterface(e3.e) }, opacity: { get: ExpressionPropertyInterface(e3.o) }, type: { get: function() {
          return "a";
        } }, _name: { value: t3.nm }, mn: { value: t3.mn } }), e3.s.setGroupProperty(PropertyInterface("Start Point", r2)), e3.e.setGroupProperty(PropertyInterface("End Point", r2)), e3.o.setGroupProperty(PropertyInterface("Opacity", r2)), i3;
      }
      function a2() {
        return function() {
          return null;
        };
      }
      function s2(t3, e3, r2) {
        var i3, a3 = propertyGroupFactory(l3, r2), s3 = propertyGroupFactory(h3, a3);
        function n3(r3) {
          Object.defineProperty(h3, t3.d[r3].nm, { get: ExpressionPropertyInterface(e3.d.dataProps[r3].p) });
        }
        var o3 = t3.d ? t3.d.length : 0, h3 = {};
        for (i3 = 0; i3 < o3; i3 += 1) n3(i3), e3.d.dataProps[i3].p.setGroupProperty(s3);
        function l3(t4) {
          return "Color" === t4 || "color" === t4 ? l3.color : "Opacity" === t4 || "opacity" === t4 ? l3.opacity : "Stroke Width" === t4 || "stroke width" === t4 ? l3.strokeWidth : null;
        }
        return Object.defineProperties(l3, { color: { get: ExpressionPropertyInterface(e3.c) }, opacity: { get: ExpressionPropertyInterface(e3.o) }, strokeWidth: { get: ExpressionPropertyInterface(e3.w) }, dash: { get: function() {
          return h3;
        } }, _name: { value: t3.nm }, mn: { value: t3.mn } }), e3.c.setGroupProperty(PropertyInterface("Color", a3)), e3.o.setGroupProperty(PropertyInterface("Opacity", a3)), e3.w.setGroupProperty(PropertyInterface("Stroke Width", a3)), l3;
      }
      function n2(t3, e3, r2) {
        function i3(e4) {
          return e4 === t3.e.ix || "End" === e4 || "end" === e4 ? i3.end : e4 === t3.s.ix ? i3.start : e4 === t3.o.ix ? i3.offset : null;
        }
        var a3 = propertyGroupFactory(i3, r2);
        return i3.propertyIndex = t3.ix, e3.s.setGroupProperty(PropertyInterface("Start", a3)), e3.e.setGroupProperty(PropertyInterface("End", a3)), e3.o.setGroupProperty(PropertyInterface("Offset", a3)), i3.propertyIndex = t3.ix, i3.propertyGroup = r2, Object.defineProperties(i3, { start: { get: ExpressionPropertyInterface(e3.s) }, end: { get: ExpressionPropertyInterface(e3.e) }, offset: { get: ExpressionPropertyInterface(e3.o) }, _name: { value: t3.nm } }), i3.mn = t3.mn, i3;
      }
      function o2(t3, e3, r2) {
        function i3(e4) {
          return t3.a.ix === e4 || "Anchor Point" === e4 ? i3.anchorPoint : t3.o.ix === e4 || "Opacity" === e4 ? i3.opacity : t3.p.ix === e4 || "Position" === e4 ? i3.position : t3.r.ix === e4 || "Rotation" === e4 || "ADBE Vector Rotation" === e4 ? i3.rotation : t3.s.ix === e4 || "Scale" === e4 ? i3.scale : t3.sk && t3.sk.ix === e4 || "Skew" === e4 ? i3.skew : t3.sa && t3.sa.ix === e4 || "Skew Axis" === e4 ? i3.skewAxis : null;
        }
        var a3 = propertyGroupFactory(i3, r2);
        return e3.transform.mProps.o.setGroupProperty(PropertyInterface("Opacity", a3)), e3.transform.mProps.p.setGroupProperty(PropertyInterface("Position", a3)), e3.transform.mProps.a.setGroupProperty(PropertyInterface("Anchor Point", a3)), e3.transform.mProps.s.setGroupProperty(PropertyInterface("Scale", a3)), e3.transform.mProps.r.setGroupProperty(PropertyInterface("Rotation", a3)), e3.transform.mProps.sk && (e3.transform.mProps.sk.setGroupProperty(PropertyInterface("Skew", a3)), e3.transform.mProps.sa.setGroupProperty(PropertyInterface("Skew Angle", a3))), e3.transform.op.setGroupProperty(PropertyInterface("Opacity", a3)), Object.defineProperties(i3, { opacity: { get: ExpressionPropertyInterface(e3.transform.mProps.o) }, position: { get: ExpressionPropertyInterface(e3.transform.mProps.p) }, anchorPoint: { get: ExpressionPropertyInterface(e3.transform.mProps.a) }, scale: { get: ExpressionPropertyInterface(e3.transform.mProps.s) }, rotation: { get: ExpressionPropertyInterface(e3.transform.mProps.r) }, skew: { get: ExpressionPropertyInterface(e3.transform.mProps.sk) }, skewAxis: { get: ExpressionPropertyInterface(e3.transform.mProps.sa) }, _name: { value: t3.nm } }), i3.ty = "tr", i3.mn = t3.mn, i3.propertyGroup = r2, i3;
      }
      function h2(t3, e3, r2) {
        function i3(e4) {
          return t3.p.ix === e4 ? i3.position : t3.s.ix === e4 ? i3.size : null;
        }
        var a3 = propertyGroupFactory(i3, r2);
        i3.propertyIndex = t3.ix;
        var s3 = "tm" === e3.sh.ty ? e3.sh.prop : e3.sh;
        return s3.s.setGroupProperty(PropertyInterface("Size", a3)), s3.p.setGroupProperty(PropertyInterface("Position", a3)), Object.defineProperties(i3, { size: { get: ExpressionPropertyInterface(s3.s) }, position: { get: ExpressionPropertyInterface(s3.p) }, _name: { value: t3.nm } }), i3.mn = t3.mn, i3;
      }
      function l2(t3, e3, r2) {
        function i3(e4) {
          return t3.p.ix === e4 ? i3.position : t3.r.ix === e4 ? i3.rotation : t3.pt.ix === e4 ? i3.points : t3.or.ix === e4 || "ADBE Vector Star Outer Radius" === e4 ? i3.outerRadius : t3.os.ix === e4 ? i3.outerRoundness : !t3.ir || t3.ir.ix !== e4 && "ADBE Vector Star Inner Radius" !== e4 ? t3.is && t3.is.ix === e4 ? i3.innerRoundness : null : i3.innerRadius;
        }
        var a3 = propertyGroupFactory(i3, r2), s3 = "tm" === e3.sh.ty ? e3.sh.prop : e3.sh;
        return i3.propertyIndex = t3.ix, s3.or.setGroupProperty(PropertyInterface("Outer Radius", a3)), s3.os.setGroupProperty(PropertyInterface("Outer Roundness", a3)), s3.pt.setGroupProperty(PropertyInterface("Points", a3)), s3.p.setGroupProperty(PropertyInterface("Position", a3)), s3.r.setGroupProperty(PropertyInterface("Rotation", a3)), t3.ir && (s3.ir.setGroupProperty(PropertyInterface("Inner Radius", a3)), s3.is.setGroupProperty(PropertyInterface("Inner Roundness", a3))), Object.defineProperties(i3, { position: { get: ExpressionPropertyInterface(s3.p) }, rotation: { get: ExpressionPropertyInterface(s3.r) }, points: { get: ExpressionPropertyInterface(s3.pt) }, outerRadius: { get: ExpressionPropertyInterface(s3.or) }, outerRoundness: { get: ExpressionPropertyInterface(s3.os) }, innerRadius: { get: ExpressionPropertyInterface(s3.ir) }, innerRoundness: { get: ExpressionPropertyInterface(s3.is) }, _name: { value: t3.nm } }), i3.mn = t3.mn, i3;
      }
      function p2(t3, e3, r2) {
        function i3(e4) {
          return t3.p.ix === e4 ? i3.position : t3.r.ix === e4 ? i3.roundness : t3.s.ix === e4 || "Size" === e4 || "ADBE Vector Rect Size" === e4 ? i3.size : null;
        }
        var a3 = propertyGroupFactory(i3, r2), s3 = "tm" === e3.sh.ty ? e3.sh.prop : e3.sh;
        return i3.propertyIndex = t3.ix, s3.p.setGroupProperty(PropertyInterface("Position", a3)), s3.s.setGroupProperty(PropertyInterface("Size", a3)), s3.r.setGroupProperty(PropertyInterface("Rotation", a3)), Object.defineProperties(i3, { position: { get: ExpressionPropertyInterface(s3.p) }, roundness: { get: ExpressionPropertyInterface(s3.r) }, size: { get: ExpressionPropertyInterface(s3.s) }, _name: { value: t3.nm } }), i3.mn = t3.mn, i3;
      }
      function f2(t3, e3, r2) {
        function i3(e4) {
          return t3.r.ix === e4 || "Round Corners 1" === e4 ? i3.radius : null;
        }
        var a3 = propertyGroupFactory(i3, r2), s3 = e3;
        return i3.propertyIndex = t3.ix, s3.rd.setGroupProperty(PropertyInterface("Radius", a3)), Object.defineProperties(i3, { radius: { get: ExpressionPropertyInterface(s3.rd) }, _name: { value: t3.nm } }), i3.mn = t3.mn, i3;
      }
      function c2(t3, e3, r2) {
        function i3(e4) {
          return t3.c.ix === e4 || "Copies" === e4 ? i3.copies : t3.o.ix === e4 || "Offset" === e4 ? i3.offset : null;
        }
        var a3 = propertyGroupFactory(i3, r2), s3 = e3;
        return i3.propertyIndex = t3.ix, s3.c.setGroupProperty(PropertyInterface("Copies", a3)), s3.o.setGroupProperty(PropertyInterface("Offset", a3)), Object.defineProperties(i3, { copies: { get: ExpressionPropertyInterface(s3.c) }, offset: { get: ExpressionPropertyInterface(s3.o) }, _name: { value: t3.nm } }), i3.mn = t3.mn, i3;
      }
      return function(e3, r2, i3) {
        var a3;
        function s3(t3) {
          if ("number" == typeof t3) return 0 === (t3 = void 0 === t3 ? 1 : t3) ? i3 : a3[t3 - 1];
          for (var e4 = 0, r3 = a3.length; e4 < r3; ) {
            if (a3[e4]._name === t3) return a3[e4];
            e4 += 1;
          }
          return null;
        }
        return s3.propertyGroup = propertyGroupFactory(s3, (function() {
          return i3;
        })), a3 = t2(e3, r2, s3.propertyGroup), s3.numProperties = a3.length, s3._name = "Contents", s3;
      };
    })(), TextExpressionInterface = function(t2) {
      var e2;
      function r(t3) {
        switch (t3) {
          case "ADBE Text Document":
            return r.sourceText;
          default:
            return null;
        }
      }
      return Object.defineProperty(r, "sourceText", { get: function() {
        t2.textProperty.getValue();
        var r2 = t2.textProperty.currentData.t;
        return e2 && r2 === e2.value || ((e2 = new String(r2)).value = r2 || new String(r2), Object.defineProperty(e2, "style", { get: function() {
          return { fillColor: t2.textProperty.currentData.fc };
        } })), e2;
      } }), r;
    };
    function _typeof(t2) {
      return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t3) {
        return typeof t3;
      } : function(t3) {
        return t3 && "function" == typeof Symbol && t3.constructor === Symbol && t3 !== Symbol.prototype ? "symbol" : typeof t3;
      })(t2);
    }
    var FootageInterface = (dataInterfaceFactory = function(t2) {
      function e2(t3) {
        return "Outline" === t3 ? e2.outlineInterface() : null;
      }
      return e2._name = "Outline", e2.outlineInterface = (function(t3) {
        var e3 = "", r = t3.getFootageData();
        function i2(t4) {
          if (r[t4]) return e3 = t4, "object" === _typeof(r = r[t4]) ? i2 : r;
          var a2 = t4.indexOf(e3);
          if (-1 !== a2) {
            var s2 = parseInt(t4.substr(a2 + e3.length), 10);
            return "object" === _typeof(r = r[s2]) ? i2 : r;
          }
          return "";
        }
        return function() {
          return e3 = "", r = t3.getFootageData(), i2;
        };
      })(t2), e2;
    }, function(t2) {
      function e2(t3) {
        return "Data" === t3 ? e2.dataInterface : null;
      }
      return e2._name = "Data", e2.dataInterface = dataInterfaceFactory(t2), e2;
    }), dataInterfaceFactory, interfaces = { layer: LayerExpressionInterface, effects: EffectsExpressionInterface, comp: CompExpressionInterface, shape: ShapeExpressionInterface, text: TextExpressionInterface, footage: FootageInterface };
    function getInterface(t2) {
      return interfaces[t2] || null;
    }
    var expressionHelpers = { searchExpressions: function(t2, e2, r) {
      e2.x && (r.k = true, r.x = true, r.initiateExpression = ExpressionManager.initiateExpression, r.effectsSequence.push(r.initiateExpression(t2, e2, r).bind(r)));
    }, getSpeedAtTime: function(t2) {
      var e2 = this.getValueAtTime(t2), r = this.getValueAtTime(t2 + -0.01), i2 = 0;
      if (e2.length) {
        var a2;
        for (a2 = 0; a2 < e2.length; a2 += 1) i2 += Math.pow(r[a2] - e2[a2], 2);
        i2 = 100 * Math.sqrt(i2);
      } else i2 = 0;
      return i2;
    }, getVelocityAtTime: function(t2) {
      if (void 0 !== this.vel) return this.vel;
      var e2, r, i2 = this.getValueAtTime(t2), a2 = this.getValueAtTime(t2 + -1e-3);
      if (i2.length) for (e2 = createTypedArray("float32", i2.length), r = 0; r < i2.length; r += 1) e2[r] = (a2[r] - i2[r]) / -1e-3;
      else e2 = (a2 - i2) / -1e-3;
      return e2;
    }, getValueAtTime: function(t2) {
      return t2 *= this.elem.globalData.frameRate, (t2 -= this.offsetTime) !== this._cachingAtTime.lastFrame && (this._cachingAtTime.lastIndex = this._cachingAtTime.lastFrame < t2 ? this._cachingAtTime.lastIndex : 0, this._cachingAtTime.value = this.interpolateValue(t2, this._cachingAtTime), this._cachingAtTime.lastFrame = t2), this._cachingAtTime.value;
    }, getStaticValueAtTime: function() {
      return this.pv;
    }, setGroupProperty: function(t2) {
      this.propertyGroup = t2;
    } };
    function addPropertyDecorator() {
      function t2(t3, e3, r2) {
        if (!this.k || !this.keyframes) return this.pv;
        t3 = t3 ? t3.toLowerCase() : "";
        var i3, a3, s3, n3, o3, h3 = this.comp.renderedFrame, l3 = this.keyframes, p3 = l3[l3.length - 1].t;
        if (h3 <= p3) return this.pv;
        if (r2 ? a3 = p3 - (i3 = e3 ? Math.abs(p3 - this.elem.comp.globalData.frameRate * e3) : Math.max(0, p3 - this.elem.data.ip)) : ((!e3 || e3 > l3.length - 1) && (e3 = l3.length - 1), i3 = p3 - (a3 = l3[l3.length - 1 - e3].t)), "pingpong" === t3) {
          if (Math.floor((h3 - a3) / i3) % 2 != 0) return this.getValueAtTime((i3 - (h3 - a3) % i3 + a3) / this.comp.globalData.frameRate, 0);
        } else {
          if ("offset" === t3) {
            var f2 = this.getValueAtTime(a3 / this.comp.globalData.frameRate, 0), c2 = this.getValueAtTime(p3 / this.comp.globalData.frameRate, 0), m2 = this.getValueAtTime(((h3 - a3) % i3 + a3) / this.comp.globalData.frameRate, 0), d2 = Math.floor((h3 - a3) / i3);
            if (this.pv.length) {
              for (n3 = (o3 = new Array(f2.length)).length, s3 = 0; s3 < n3; s3 += 1) o3[s3] = (c2[s3] - f2[s3]) * d2 + m2[s3];
              return o3;
            }
            return (c2 - f2) * d2 + m2;
          }
          if ("continue" === t3) {
            var u2 = this.getValueAtTime(p3 / this.comp.globalData.frameRate, 0), y = this.getValueAtTime((p3 - 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (n3 = (o3 = new Array(u2.length)).length, s3 = 0; s3 < n3; s3 += 1) o3[s3] = u2[s3] + (u2[s3] - y[s3]) * ((h3 - p3) / this.comp.globalData.frameRate) / 5e-4;
              return o3;
            }
            return u2 + (h3 - p3) / 1e-3 * (u2 - y);
          }
        }
        return this.getValueAtTime(((h3 - a3) % i3 + a3) / this.comp.globalData.frameRate, 0);
      }
      function e2(t3, e3, r2) {
        if (!this.k) return this.pv;
        t3 = t3 ? t3.toLowerCase() : "";
        var i3, a3, s3, n3, o3, h3 = this.comp.renderedFrame, l3 = this.keyframes, p3 = l3[0].t;
        if (h3 >= p3) return this.pv;
        if (r2 ? a3 = p3 + (i3 = e3 ? Math.abs(this.elem.comp.globalData.frameRate * e3) : Math.max(0, this.elem.data.op - p3)) : ((!e3 || e3 > l3.length - 1) && (e3 = l3.length - 1), i3 = (a3 = l3[e3].t) - p3), "pingpong" === t3) {
          if (Math.floor((p3 - h3) / i3) % 2 == 0) return this.getValueAtTime(((p3 - h3) % i3 + p3) / this.comp.globalData.frameRate, 0);
        } else {
          if ("offset" === t3) {
            var f2 = this.getValueAtTime(p3 / this.comp.globalData.frameRate, 0), c2 = this.getValueAtTime(a3 / this.comp.globalData.frameRate, 0), m2 = this.getValueAtTime((i3 - (p3 - h3) % i3 + p3) / this.comp.globalData.frameRate, 0), d2 = Math.floor((p3 - h3) / i3) + 1;
            if (this.pv.length) {
              for (n3 = (o3 = new Array(f2.length)).length, s3 = 0; s3 < n3; s3 += 1) o3[s3] = m2[s3] - (c2[s3] - f2[s3]) * d2;
              return o3;
            }
            return m2 - (c2 - f2) * d2;
          }
          if ("continue" === t3) {
            var u2 = this.getValueAtTime(p3 / this.comp.globalData.frameRate, 0), y = this.getValueAtTime((p3 + 1e-3) / this.comp.globalData.frameRate, 0);
            if (this.pv.length) {
              for (n3 = (o3 = new Array(u2.length)).length, s3 = 0; s3 < n3; s3 += 1) o3[s3] = u2[s3] + (u2[s3] - y[s3]) * (p3 - h3) / 1e-3;
              return o3;
            }
            return u2 + (u2 - y) * (p3 - h3) / 1e-3;
          }
        }
        return this.getValueAtTime((i3 - ((p3 - h3) % i3 + p3)) / this.comp.globalData.frameRate, 0);
      }
      function r(t3, e3) {
        if (!this.k) return this.pv;
        if (t3 = 0.5 * (t3 || 0.4), (e3 = Math.floor(e3 || 5)) <= 1) return this.pv;
        var r2, i3, a3 = this.comp.renderedFrame / this.comp.globalData.frameRate, s3 = a3 - t3, n3 = e3 > 1 ? (a3 + t3 - s3) / (e3 - 1) : 1, o3 = 0, h3 = 0;
        for (r2 = this.pv.length ? createTypedArray("float32", this.pv.length) : 0; o3 < e3; ) {
          if (i3 = this.getValueAtTime(s3 + o3 * n3), this.pv.length) for (h3 = 0; h3 < this.pv.length; h3 += 1) r2[h3] += i3[h3];
          else r2 += i3;
          o3 += 1;
        }
        if (this.pv.length) for (h3 = 0; h3 < this.pv.length; h3 += 1) r2[h3] /= e3;
        else r2 /= e3;
        return r2;
      }
      function i2(t3) {
        this._transformCachingAtTime || (this._transformCachingAtTime = { v: new Matrix() });
        var e3 = this._transformCachingAtTime.v;
        if (e3.cloneFromProps(this.pre.props), this.appliedTransformations < 1) {
          var r2 = this.a.getValueAtTime(t3);
          e3.translate(-r2[0] * this.a.mult, -r2[1] * this.a.mult, r2[2] * this.a.mult);
        }
        if (this.appliedTransformations < 2) {
          var i3 = this.s.getValueAtTime(t3);
          e3.scale(i3[0] * this.s.mult, i3[1] * this.s.mult, i3[2] * this.s.mult);
        }
        if (this.sk && this.appliedTransformations < 3) {
          var a3 = this.sk.getValueAtTime(t3), s3 = this.sa.getValueAtTime(t3);
          e3.skewFromAxis(-a3 * this.sk.mult, s3 * this.sa.mult);
        }
        if (this.r && this.appliedTransformations < 4) {
          var n3 = this.r.getValueAtTime(t3);
          e3.rotate(-n3 * this.r.mult);
        } else if (!this.r && this.appliedTransformations < 4) {
          var o3 = this.rz.getValueAtTime(t3), h3 = this.ry.getValueAtTime(t3), l3 = this.rx.getValueAtTime(t3), p3 = this.or.getValueAtTime(t3);
          e3.rotateZ(-o3 * this.rz.mult).rotateY(h3 * this.ry.mult).rotateX(l3 * this.rx.mult).rotateZ(-p3[2] * this.or.mult).rotateY(p3[1] * this.or.mult).rotateX(p3[0] * this.or.mult);
        }
        if (this.data.p && this.data.p.s) {
          var f2 = this.px.getValueAtTime(t3), c2 = this.py.getValueAtTime(t3);
          if (this.data.p.z) {
            var m2 = this.pz.getValueAtTime(t3);
            e3.translate(f2 * this.px.mult, c2 * this.py.mult, -m2 * this.pz.mult);
          } else e3.translate(f2 * this.px.mult, c2 * this.py.mult, 0);
        } else {
          var d2 = this.p.getValueAtTime(t3);
          e3.translate(d2[0] * this.p.mult, d2[1] * this.p.mult, -d2[2] * this.p.mult);
        }
        return e3;
      }
      function a2() {
        return this.v.clone(new Matrix());
      }
      var s2 = TransformPropertyFactory.getTransformProperty;
      TransformPropertyFactory.getTransformProperty = function(t3, e3, r2) {
        var n3 = s2(t3, e3, r2);
        return n3.dynamicProperties.length ? n3.getValueAtTime = i2.bind(n3) : n3.getValueAtTime = a2.bind(n3), n3.setGroupProperty = expressionHelpers.setGroupProperty, n3;
      };
      var n2 = PropertyFactory.getProp;
      PropertyFactory.getProp = function(i3, a3, s3, o3, h3) {
        var l3 = n2(i3, a3, s3, o3, h3);
        l3.kf ? l3.getValueAtTime = expressionHelpers.getValueAtTime.bind(l3) : l3.getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(l3), l3.setGroupProperty = expressionHelpers.setGroupProperty, l3.loopOut = t2, l3.loopIn = e2, l3.smooth = r, l3.getVelocityAtTime = expressionHelpers.getVelocityAtTime.bind(l3), l3.getSpeedAtTime = expressionHelpers.getSpeedAtTime.bind(l3), l3.numKeys = 1 === a3.a ? a3.k.length : 0, l3.propertyIndex = a3.ix;
        var p3 = 0;
        return 0 !== s3 && (p3 = createTypedArray("float32", 1 === a3.a ? a3.k[0].s.length : a3.k.length)), l3._cachingAtTime = { lastFrame: initialDefaultFrame, lastIndex: 0, value: p3 }, expressionHelpers.searchExpressions(i3, a3, l3), l3.k && h3.addDynamicProperty(l3), l3;
      };
      var o2 = ShapePropertyFactory.getConstructorFunction(), h2 = ShapePropertyFactory.getKeyframedConstructorFunction();
      function l2() {
      }
      l2.prototype = { vertices: function(t3, e3) {
        this.k && this.getValue();
        var r2, i3 = this.v;
        void 0 !== e3 && (i3 = this.getValueAtTime(e3, 0));
        var a3 = i3._length, s3 = i3[t3], n3 = i3.v, o3 = createSizedArray(a3);
        for (r2 = 0; r2 < a3; r2 += 1) o3[r2] = "i" === t3 || "o" === t3 ? [s3[r2][0] - n3[r2][0], s3[r2][1] - n3[r2][1]] : [s3[r2][0], s3[r2][1]];
        return o3;
      }, points: function(t3) {
        return this.vertices("v", t3);
      }, inTangents: function(t3) {
        return this.vertices("i", t3);
      }, outTangents: function(t3) {
        return this.vertices("o", t3);
      }, isClosed: function() {
        return this.v.c;
      }, pointOnPath: function(t3, e3) {
        var r2 = this.v;
        void 0 !== e3 && (r2 = this.getValueAtTime(e3, 0)), this._segmentsLength || (this._segmentsLength = bez.getSegmentsLength(r2));
        for (var i3, a3 = this._segmentsLength, s3 = a3.lengths, n3 = a3.totalLength * t3, o3 = 0, h3 = s3.length, l3 = 0; o3 < h3; ) {
          if (l3 + s3[o3].addedLength > n3) {
            var p3 = o3, f2 = r2.c && o3 === h3 - 1 ? 0 : o3 + 1, c2 = (n3 - l3) / s3[o3].addedLength;
            i3 = bez.getPointInSegment(r2.v[p3], r2.v[f2], r2.o[p3], r2.i[f2], c2, s3[o3]);
            break;
          }
          l3 += s3[o3].addedLength, o3 += 1;
        }
        return i3 || (i3 = r2.c ? [r2.v[0][0], r2.v[0][1]] : [r2.v[r2._length - 1][0], r2.v[r2._length - 1][1]]), i3;
      }, vectorOnPath: function(t3, e3, r2) {
        1 == t3 ? t3 = this.v.c : 0 == t3 && (t3 = 0.999);
        var i3 = this.pointOnPath(t3, e3), a3 = this.pointOnPath(t3 + 1e-3, e3), s3 = a3[0] - i3[0], n3 = a3[1] - i3[1], o3 = Math.sqrt(Math.pow(s3, 2) + Math.pow(n3, 2));
        return 0 === o3 ? [0, 0] : "tangent" === r2 ? [s3 / o3, n3 / o3] : [-n3 / o3, s3 / o3];
      }, tangentOnPath: function(t3, e3) {
        return this.vectorOnPath(t3, e3, "tangent");
      }, normalOnPath: function(t3, e3) {
        return this.vectorOnPath(t3, e3, "normal");
      }, setGroupProperty: expressionHelpers.setGroupProperty, getValueAtTime: expressionHelpers.getStaticValueAtTime }, extendPrototype([l2], o2), extendPrototype([l2], h2), h2.prototype.getValueAtTime = function(t3) {
        return this._cachingAtTime || (this._cachingAtTime = { shapeValue: shapePool.clone(this.pv), lastIndex: 0, lastTime: initialDefaultFrame }), t3 *= this.elem.globalData.frameRate, (t3 -= this.offsetTime) !== this._cachingAtTime.lastTime && (this._cachingAtTime.lastIndex = this._cachingAtTime.lastTime < t3 ? this._caching.lastIndex : 0, this._cachingAtTime.lastTime = t3, this.interpolateShape(t3, this._cachingAtTime.shapeValue, this._cachingAtTime)), this._cachingAtTime.shapeValue;
      }, h2.prototype.initiateExpression = ExpressionManager.initiateExpression;
      var p2 = ShapePropertyFactory.getShapeProp;
      ShapePropertyFactory.getShapeProp = function(t3, e3, r2, i3, a3) {
        var s3 = p2(t3, e3, r2, i3, a3);
        return s3.propertyIndex = e3.ix, s3.lock = false, 3 === r2 ? expressionHelpers.searchExpressions(t3, e3.pt, s3) : 4 === r2 && expressionHelpers.searchExpressions(t3, e3.ks, s3), s3.k && t3.addDynamicProperty(s3), s3;
      };
    }
    function initialize$1() {
      addPropertyDecorator();
    }
    function addDecorator() {
      TextProperty.prototype.getExpressionValue = function(t2, e2) {
        var r = this.calculateExpression(e2);
        if (t2.t !== r) {
          var i2 = {};
          return this.copyData(i2, t2), i2.t = r.toString(), i2.__complete = false, i2;
        }
        return t2;
      }, TextProperty.prototype.searchProperty = function() {
        var t2 = this.searchKeyframes(), e2 = this.searchExpressions();
        return this.kf = t2 || e2, this.kf;
      }, TextProperty.prototype.searchExpressions = function() {
        return this.data.d.x ? (this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem, this.data.d, this), this.addEffect(this.getExpressionValue.bind(this)), true) : null;
      };
    }
    function initialize() {
      addDecorator();
    }
    function SVGComposableEffect() {
    }
    SVGComposableEffect.prototype = { createMergeNode: function(t2, e2) {
      var r, i2, a2 = createNS("feMerge");
      for (a2.setAttribute("result", t2), i2 = 0; i2 < e2.length; i2 += 1) (r = createNS("feMergeNode")).setAttribute("in", e2[i2]), a2.appendChild(r), a2.appendChild(r);
      return a2;
    } };
    var linearFilterValue = "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0";
    function SVGTintFilter(t2, e2, r, i2, a2) {
      this.filterManager = e2;
      var s2 = createNS("feColorMatrix");
      s2.setAttribute("type", "matrix"), s2.setAttribute("color-interpolation-filters", "linearRGB"), s2.setAttribute("values", linearFilterValue + " 1 0"), this.linearFilter = s2, s2.setAttribute("result", i2 + "_tint_1"), t2.appendChild(s2), (s2 = createNS("feColorMatrix")).setAttribute("type", "matrix"), s2.setAttribute("color-interpolation-filters", "sRGB"), s2.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), s2.setAttribute("result", i2 + "_tint_2"), t2.appendChild(s2), this.matrixFilter = s2;
      var n2 = this.createMergeNode(i2, [a2, i2 + "_tint_1", i2 + "_tint_2"]);
      t2.appendChild(n2);
    }
    function SVGFillFilter(t2, e2, r, i2) {
      this.filterManager = e2;
      var a2 = createNS("feColorMatrix");
      a2.setAttribute("type", "matrix"), a2.setAttribute("color-interpolation-filters", "sRGB"), a2.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), a2.setAttribute("result", i2), t2.appendChild(a2), this.matrixFilter = a2;
    }
    function SVGStrokeEffect(t2, e2, r) {
      this.initialized = false, this.filterManager = e2, this.elem = r, this.paths = [];
    }
    function SVGTritoneFilter(t2, e2, r, i2) {
      this.filterManager = e2;
      var a2 = createNS("feColorMatrix");
      a2.setAttribute("type", "matrix"), a2.setAttribute("color-interpolation-filters", "linearRGB"), a2.setAttribute("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"), t2.appendChild(a2);
      var s2 = createNS("feComponentTransfer");
      s2.setAttribute("color-interpolation-filters", "sRGB"), s2.setAttribute("result", i2), this.matrixFilter = s2;
      var n2 = createNS("feFuncR");
      n2.setAttribute("type", "table"), s2.appendChild(n2), this.feFuncR = n2;
      var o2 = createNS("feFuncG");
      o2.setAttribute("type", "table"), s2.appendChild(o2), this.feFuncG = o2;
      var h2 = createNS("feFuncB");
      h2.setAttribute("type", "table"), s2.appendChild(h2), this.feFuncB = h2, t2.appendChild(s2);
    }
    function SVGProLevelsFilter(t2, e2, r, i2) {
      this.filterManager = e2;
      var a2 = this.filterManager.effectElements, s2 = createNS("feComponentTransfer");
      (a2[10].p.k || 0 !== a2[10].p.v || a2[11].p.k || 1 !== a2[11].p.v || a2[12].p.k || 1 !== a2[12].p.v || a2[13].p.k || 0 !== a2[13].p.v || a2[14].p.k || 1 !== a2[14].p.v) && (this.feFuncR = this.createFeFunc("feFuncR", s2)), (a2[17].p.k || 0 !== a2[17].p.v || a2[18].p.k || 1 !== a2[18].p.v || a2[19].p.k || 1 !== a2[19].p.v || a2[20].p.k || 0 !== a2[20].p.v || a2[21].p.k || 1 !== a2[21].p.v) && (this.feFuncG = this.createFeFunc("feFuncG", s2)), (a2[24].p.k || 0 !== a2[24].p.v || a2[25].p.k || 1 !== a2[25].p.v || a2[26].p.k || 1 !== a2[26].p.v || a2[27].p.k || 0 !== a2[27].p.v || a2[28].p.k || 1 !== a2[28].p.v) && (this.feFuncB = this.createFeFunc("feFuncB", s2)), (a2[31].p.k || 0 !== a2[31].p.v || a2[32].p.k || 1 !== a2[32].p.v || a2[33].p.k || 1 !== a2[33].p.v || a2[34].p.k || 0 !== a2[34].p.v || a2[35].p.k || 1 !== a2[35].p.v) && (this.feFuncA = this.createFeFunc("feFuncA", s2)), (this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA) && (s2.setAttribute("color-interpolation-filters", "sRGB"), t2.appendChild(s2)), (a2[3].p.k || 0 !== a2[3].p.v || a2[4].p.k || 1 !== a2[4].p.v || a2[5].p.k || 1 !== a2[5].p.v || a2[6].p.k || 0 !== a2[6].p.v || a2[7].p.k || 1 !== a2[7].p.v) && ((s2 = createNS("feComponentTransfer")).setAttribute("color-interpolation-filters", "sRGB"), s2.setAttribute("result", i2), t2.appendChild(s2), this.feFuncRComposed = this.createFeFunc("feFuncR", s2), this.feFuncGComposed = this.createFeFunc("feFuncG", s2), this.feFuncBComposed = this.createFeFunc("feFuncB", s2));
    }
    function SVGDropShadowEffect(t2, e2, r, i2, a2) {
      var s2 = e2.container.globalData.renderConfig.filterSize, n2 = e2.data.fs || s2;
      t2.setAttribute("x", n2.x || s2.x), t2.setAttribute("y", n2.y || s2.y), t2.setAttribute("width", n2.width || s2.width), t2.setAttribute("height", n2.height || s2.height), this.filterManager = e2;
      var o2 = createNS("feGaussianBlur");
      o2.setAttribute("in", "SourceAlpha"), o2.setAttribute("result", i2 + "_drop_shadow_1"), o2.setAttribute("stdDeviation", "0"), this.feGaussianBlur = o2, t2.appendChild(o2);
      var h2 = createNS("feOffset");
      h2.setAttribute("dx", "25"), h2.setAttribute("dy", "0"), h2.setAttribute("in", i2 + "_drop_shadow_1"), h2.setAttribute("result", i2 + "_drop_shadow_2"), this.feOffset = h2, t2.appendChild(h2);
      var l2 = createNS("feFlood");
      l2.setAttribute("flood-color", "#00ff00"), l2.setAttribute("flood-opacity", "1"), l2.setAttribute("result", i2 + "_drop_shadow_3"), this.feFlood = l2, t2.appendChild(l2);
      var p2 = createNS("feComposite");
      p2.setAttribute("in", i2 + "_drop_shadow_3"), p2.setAttribute("in2", i2 + "_drop_shadow_2"), p2.setAttribute("operator", "in"), p2.setAttribute("result", i2 + "_drop_shadow_4"), t2.appendChild(p2);
      var f2 = this.createMergeNode(i2, [i2 + "_drop_shadow_4", a2]);
      t2.appendChild(f2);
    }
    extendPrototype([SVGComposableEffect], SVGTintFilter), SVGTintFilter.prototype.renderFrame = function(t2) {
      if (t2 || this.filterManager._mdf) {
        var e2 = this.filterManager.effectElements[0].p.v, r = this.filterManager.effectElements[1].p.v, i2 = this.filterManager.effectElements[2].p.v / 100;
        this.linearFilter.setAttribute("values", linearFilterValue + " " + i2 + " 0"), this.matrixFilter.setAttribute("values", r[0] - e2[0] + " 0 0 0 " + e2[0] + " " + (r[1] - e2[1]) + " 0 0 0 " + e2[1] + " " + (r[2] - e2[2]) + " 0 0 0 " + e2[2] + " 0 0 0 1 0");
      }
    }, SVGFillFilter.prototype.renderFrame = function(t2) {
      if (t2 || this.filterManager._mdf) {
        var e2 = this.filterManager.effectElements[2].p.v, r = this.filterManager.effectElements[6].p.v;
        this.matrixFilter.setAttribute("values", "0 0 0 0 " + e2[0] + " 0 0 0 0 " + e2[1] + " 0 0 0 0 " + e2[2] + " 0 0 0 " + r + " 0");
      }
    }, SVGStrokeEffect.prototype.initialize = function() {
      var t2, e2, r, i2, a2 = this.elem.layerElement.children || this.elem.layerElement.childNodes;
      for (1 === this.filterManager.effectElements[1].p.v ? (i2 = this.elem.maskManager.masksProperties.length, r = 0) : i2 = (r = this.filterManager.effectElements[0].p.v - 1) + 1, (e2 = createNS("g")).setAttribute("fill", "none"), e2.setAttribute("stroke-linecap", "round"), e2.setAttribute("stroke-dashoffset", 1); r < i2; r += 1) t2 = createNS("path"), e2.appendChild(t2), this.paths.push({ p: t2, m: r });
      if (3 === this.filterManager.effectElements[10].p.v) {
        var s2 = createNS("mask"), n2 = createElementID();
        s2.setAttribute("id", n2), s2.setAttribute("mask-type", "alpha"), s2.appendChild(e2), this.elem.globalData.defs.appendChild(s2);
        var o2 = createNS("g");
        for (o2.setAttribute("mask", "url(" + getLocationHref() + "#" + n2 + ")"); a2[0]; ) o2.appendChild(a2[0]);
        this.elem.layerElement.appendChild(o2), this.masker = s2, e2.setAttribute("stroke", "#fff");
      } else if (1 === this.filterManager.effectElements[10].p.v || 2 === this.filterManager.effectElements[10].p.v) {
        if (2 === this.filterManager.effectElements[10].p.v) for (a2 = this.elem.layerElement.children || this.elem.layerElement.childNodes; a2.length; ) this.elem.layerElement.removeChild(a2[0]);
        this.elem.layerElement.appendChild(e2), this.elem.layerElement.removeAttribute("mask"), e2.setAttribute("stroke", "#fff");
      }
      this.initialized = true, this.pathMasker = e2;
    }, SVGStrokeEffect.prototype.renderFrame = function(t2) {
      var e2;
      this.initialized || this.initialize();
      var r, i2, a2 = this.paths.length;
      for (e2 = 0; e2 < a2; e2 += 1) if (-1 !== this.paths[e2].m && (r = this.elem.maskManager.viewData[this.paths[e2].m], i2 = this.paths[e2].p, (t2 || this.filterManager._mdf || r.prop._mdf) && i2.setAttribute("d", r.lastPath), t2 || this.filterManager.effectElements[9].p._mdf || this.filterManager.effectElements[4].p._mdf || this.filterManager.effectElements[7].p._mdf || this.filterManager.effectElements[8].p._mdf || r.prop._mdf)) {
        var s2;
        if (0 !== this.filterManager.effectElements[7].p.v || 100 !== this.filterManager.effectElements[8].p.v) {
          var n2 = 0.01 * Math.min(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v), o2 = 0.01 * Math.max(this.filterManager.effectElements[7].p.v, this.filterManager.effectElements[8].p.v), h2 = i2.getTotalLength();
          s2 = "0 0 0 " + h2 * n2 + " ";
          var l2, p2 = h2 * (o2 - n2), f2 = 1 + 2 * this.filterManager.effectElements[4].p.v * this.filterManager.effectElements[9].p.v * 0.01, c2 = Math.floor(p2 / f2);
          for (l2 = 0; l2 < c2; l2 += 1) s2 += "1 " + 2 * this.filterManager.effectElements[4].p.v * this.filterManager.effectElements[9].p.v * 0.01 + " ";
          s2 += "0 " + 10 * h2 + " 0 0";
        } else s2 = "1 " + 2 * this.filterManager.effectElements[4].p.v * this.filterManager.effectElements[9].p.v * 0.01;
        i2.setAttribute("stroke-dasharray", s2);
      }
      if ((t2 || this.filterManager.effectElements[4].p._mdf) && this.pathMasker.setAttribute("stroke-width", 2 * this.filterManager.effectElements[4].p.v), (t2 || this.filterManager.effectElements[6].p._mdf) && this.pathMasker.setAttribute("opacity", this.filterManager.effectElements[6].p.v), (1 === this.filterManager.effectElements[10].p.v || 2 === this.filterManager.effectElements[10].p.v) && (t2 || this.filterManager.effectElements[3].p._mdf)) {
        var m2 = this.filterManager.effectElements[3].p.v;
        this.pathMasker.setAttribute("stroke", "rgb(" + bmFloor(255 * m2[0]) + "," + bmFloor(255 * m2[1]) + "," + bmFloor(255 * m2[2]) + ")");
      }
    }, SVGTritoneFilter.prototype.renderFrame = function(t2) {
      if (t2 || this.filterManager._mdf) {
        var e2 = this.filterManager.effectElements[0].p.v, r = this.filterManager.effectElements[1].p.v, i2 = this.filterManager.effectElements[2].p.v, a2 = i2[0] + " " + r[0] + " " + e2[0], s2 = i2[1] + " " + r[1] + " " + e2[1], n2 = i2[2] + " " + r[2] + " " + e2[2];
        this.feFuncR.setAttribute("tableValues", a2), this.feFuncG.setAttribute("tableValues", s2), this.feFuncB.setAttribute("tableValues", n2);
      }
    }, SVGProLevelsFilter.prototype.createFeFunc = function(t2, e2) {
      var r = createNS(t2);
      return r.setAttribute("type", "table"), e2.appendChild(r), r;
    }, SVGProLevelsFilter.prototype.getTableValue = function(t2, e2, r, i2, a2) {
      for (var s2, n2, o2 = 0, h2 = Math.min(t2, e2), l2 = Math.max(t2, e2), p2 = Array.call(null, { length: 256 }), f2 = 0, c2 = a2 - i2, m2 = e2 - t2; o2 <= 256; ) n2 = (s2 = o2 / 256) <= h2 ? m2 < 0 ? a2 : i2 : s2 >= l2 ? m2 < 0 ? i2 : a2 : i2 + c2 * Math.pow((s2 - t2) / m2, 1 / r), p2[f2] = n2, f2 += 1, o2 += 256 / 255;
      return p2.join(" ");
    }, SVGProLevelsFilter.prototype.renderFrame = function(t2) {
      if (t2 || this.filterManager._mdf) {
        var e2, r = this.filterManager.effectElements;
        this.feFuncRComposed && (t2 || r[3].p._mdf || r[4].p._mdf || r[5].p._mdf || r[6].p._mdf || r[7].p._mdf) && (e2 = this.getTableValue(r[3].p.v, r[4].p.v, r[5].p.v, r[6].p.v, r[7].p.v), this.feFuncRComposed.setAttribute("tableValues", e2), this.feFuncGComposed.setAttribute("tableValues", e2), this.feFuncBComposed.setAttribute("tableValues", e2)), this.feFuncR && (t2 || r[10].p._mdf || r[11].p._mdf || r[12].p._mdf || r[13].p._mdf || r[14].p._mdf) && (e2 = this.getTableValue(r[10].p.v, r[11].p.v, r[12].p.v, r[13].p.v, r[14].p.v), this.feFuncR.setAttribute("tableValues", e2)), this.feFuncG && (t2 || r[17].p._mdf || r[18].p._mdf || r[19].p._mdf || r[20].p._mdf || r[21].p._mdf) && (e2 = this.getTableValue(r[17].p.v, r[18].p.v, r[19].p.v, r[20].p.v, r[21].p.v), this.feFuncG.setAttribute("tableValues", e2)), this.feFuncB && (t2 || r[24].p._mdf || r[25].p._mdf || r[26].p._mdf || r[27].p._mdf || r[28].p._mdf) && (e2 = this.getTableValue(r[24].p.v, r[25].p.v, r[26].p.v, r[27].p.v, r[28].p.v), this.feFuncB.setAttribute("tableValues", e2)), this.feFuncA && (t2 || r[31].p._mdf || r[32].p._mdf || r[33].p._mdf || r[34].p._mdf || r[35].p._mdf) && (e2 = this.getTableValue(r[31].p.v, r[32].p.v, r[33].p.v, r[34].p.v, r[35].p.v), this.feFuncA.setAttribute("tableValues", e2));
      }
    }, extendPrototype([SVGComposableEffect], SVGDropShadowEffect), SVGDropShadowEffect.prototype.renderFrame = function(t2) {
      if (t2 || this.filterManager._mdf) {
        if ((t2 || this.filterManager.effectElements[4].p._mdf) && this.feGaussianBlur.setAttribute("stdDeviation", this.filterManager.effectElements[4].p.v / 4), t2 || this.filterManager.effectElements[0].p._mdf) {
          var e2 = this.filterManager.effectElements[0].p.v;
          this.feFlood.setAttribute("flood-color", rgbToHex(Math.round(255 * e2[0]), Math.round(255 * e2[1]), Math.round(255 * e2[2])));
        }
        if ((t2 || this.filterManager.effectElements[1].p._mdf) && this.feFlood.setAttribute("flood-opacity", this.filterManager.effectElements[1].p.v / 255), t2 || this.filterManager.effectElements[2].p._mdf || this.filterManager.effectElements[3].p._mdf) {
          var r = this.filterManager.effectElements[3].p.v, i2 = (this.filterManager.effectElements[2].p.v - 90) * degToRads, a2 = r * Math.cos(i2), s2 = r * Math.sin(i2);
          this.feOffset.setAttribute("dx", a2), this.feOffset.setAttribute("dy", s2);
        }
      }
    };
    var _svgMatteSymbols = [];
    function SVGMatte3Effect(t2, e2, r) {
      this.initialized = false, this.filterManager = e2, this.filterElem = t2, this.elem = r, r.matteElement = createNS("g"), r.matteElement.appendChild(r.layerElement), r.matteElement.appendChild(r.transformedElement), r.baseElement = r.matteElement;
    }
    function SVGGaussianBlurEffect(t2, e2, r, i2) {
      t2.setAttribute("x", "-100%"), t2.setAttribute("y", "-100%"), t2.setAttribute("width", "300%"), t2.setAttribute("height", "300%"), this.filterManager = e2;
      var a2 = createNS("feGaussianBlur");
      a2.setAttribute("result", i2), t2.appendChild(a2), this.feGaussianBlur = a2;
    }
    function TransformEffect() {
    }
    function SVGTransformEffect(t2, e2) {
      this.init(e2);
    }
    function CVTransformEffect(t2) {
      this.init(t2);
    }
    return SVGMatte3Effect.prototype.findSymbol = function(t2) {
      for (var e2 = 0, r = _svgMatteSymbols.length; e2 < r; ) {
        if (_svgMatteSymbols[e2] === t2) return _svgMatteSymbols[e2];
        e2 += 1;
      }
      return null;
    }, SVGMatte3Effect.prototype.replaceInParent = function(t2, e2) {
      var r = t2.layerElement.parentNode;
      if (r) {
        for (var i2, a2 = r.children, s2 = 0, n2 = a2.length; s2 < n2 && a2[s2] !== t2.layerElement; ) s2 += 1;
        s2 <= n2 - 2 && (i2 = a2[s2 + 1]);
        var o2 = createNS("use");
        o2.setAttribute("href", "#" + e2), i2 ? r.insertBefore(o2, i2) : r.appendChild(o2);
      }
    }, SVGMatte3Effect.prototype.setElementAsMask = function(t2, e2) {
      if (!this.findSymbol(e2)) {
        var r = createElementID(), i2 = createNS("mask");
        i2.setAttribute("id", e2.layerId), i2.setAttribute("mask-type", "alpha"), _svgMatteSymbols.push(e2);
        var a2 = t2.globalData.defs;
        a2.appendChild(i2);
        var s2 = createNS("symbol");
        s2.setAttribute("id", r), this.replaceInParent(e2, r), s2.appendChild(e2.layerElement), a2.appendChild(s2);
        var n2 = createNS("use");
        n2.setAttribute("href", "#" + r), i2.appendChild(n2), e2.data.hd = false, e2.show();
      }
      t2.setMatte(e2.layerId);
    }, SVGMatte3Effect.prototype.initialize = function() {
      for (var t2 = this.filterManager.effectElements[0].p.v, e2 = this.elem.comp.elements, r = 0, i2 = e2.length; r < i2; ) e2[r] && e2[r].data.ind === t2 && this.setElementAsMask(this.elem, e2[r]), r += 1;
      this.initialized = true;
    }, SVGMatte3Effect.prototype.renderFrame = function() {
      this.initialized || this.initialize();
    }, SVGGaussianBlurEffect.prototype.renderFrame = function(t2) {
      if (t2 || this.filterManager._mdf) {
        var e2 = 0.3 * this.filterManager.effectElements[0].p.v, r = this.filterManager.effectElements[1].p.v, i2 = 3 == r ? 0 : e2, a2 = 2 == r ? 0 : e2;
        this.feGaussianBlur.setAttribute("stdDeviation", i2 + " " + a2);
        var s2 = 1 == this.filterManager.effectElements[2].p.v ? "wrap" : "duplicate";
        this.feGaussianBlur.setAttribute("edgeMode", s2);
      }
    }, TransformEffect.prototype.init = function(t2) {
      this.effectsManager = t2, this.type = effectTypes.TRANSFORM_EFFECT, this.matrix = new Matrix(), this.opacity = -1, this._mdf = false, this._opMdf = false;
    }, TransformEffect.prototype.renderFrame = function(t2) {
      if (this._opMdf = false, this._mdf = false, t2 || this.effectsManager._mdf) {
        var e2 = this.effectsManager.effectElements, r = e2[0].p.v, i2 = e2[1].p.v, a2 = 1 === e2[2].p.v, s2 = e2[3].p.v, n2 = a2 ? s2 : e2[4].p.v, o2 = e2[5].p.v, h2 = e2[6].p.v, l2 = e2[7].p.v;
        this.matrix.reset(), this.matrix.translate(-r[0], -r[1], r[2]), this.matrix.scale(0.01 * n2, 0.01 * s2, 1), this.matrix.rotate(-l2 * degToRads), this.matrix.skewFromAxis(-o2 * degToRads, (h2 + 90) * degToRads), this.matrix.translate(i2[0], i2[1], 0), this._mdf = true, this.opacity !== e2[8].p.v && (this.opacity = e2[8].p.v, this._opMdf = true);
      }
    }, extendPrototype([TransformEffect], SVGTransformEffect), extendPrototype([TransformEffect], CVTransformEffect), registerRenderer("canvas", CanvasRenderer), registerRenderer("html", HybridRenderer), registerRenderer("svg", SVGRenderer), ShapeModifiers.registerModifier("tm", TrimModifier), ShapeModifiers.registerModifier("pb", PuckerAndBloatModifier), ShapeModifiers.registerModifier("rp", RepeaterModifier), ShapeModifiers.registerModifier("rd", RoundCornersModifier), ShapeModifiers.registerModifier("zz", ZigZagModifier), ShapeModifiers.registerModifier("op", OffsetPathModifier), setExpressionsPlugin(Expressions), setExpressionInterfaces(getInterface), initialize$1(), initialize(), registerEffect$1(20, SVGTintFilter, true), registerEffect$1(21, SVGFillFilter, true), registerEffect$1(22, SVGStrokeEffect, false), registerEffect$1(23, SVGTritoneFilter, true), registerEffect$1(24, SVGProLevelsFilter, true), registerEffect$1(25, SVGDropShadowEffect, true), registerEffect$1(28, SVGMatte3Effect, false), registerEffect$1(29, SVGGaussianBlurEffect, true), registerEffect$1(35, SVGTransformEffect, false), registerEffect(35, CVTransformEffect), lottie;
  }));
})), REACT_LOTTIE_PLAYER_VERSION = "3.6.0", LOTTIE_WEB_VERSION = "^5.12.2", PlayerState, PlayerEvent;
function parseSrc(t2) {
  if ("object" == typeof t2) return t2;
  try {
    return JSON.parse(t2);
  } catch (t3) {
  }
  try {
    return new URL(t2).toString();
  } catch (t3) {
  }
  return t2;
}
!(function(t2) {
  t2.Loading = "loading", t2.Playing = "playing", t2.Paused = "paused", t2.Stopped = "stopped", t2.Frozen = "frozen", t2.Error = "error";
})(PlayerState || (PlayerState = {})), (function(t2) {
  t2.Load = "load", t2.InstanceSaved = "instanceSaved", t2.Error = "error", t2.Ready = "ready", t2.Play = "play", t2.Pause = "pause", t2.Stop = "stop", t2.Freeze = "freeze", t2.Loop = "loop", t2.Complete = "complete", t2.Frame = "frame";
})(PlayerEvent || (PlayerEvent = {}));
var defaultOptions = { clearCanvas: false, hideOnTransparent: true, progressiveLoad: true }, Player = (function(t2) {
  function e2(e3) {
    var r = t2.call(this, e3) || this;
    return r.container = null, r.unmounted = false, r.handleBgChange = function(t3) {
      r.setState({ background: t3 });
    }, r.triggerDownload = function(t3, e4) {
      var r2 = document.createElement("a");
      r2.href = t3, r2.download = e4, document.body.appendChild(r2), r2.click(), document.body.removeChild(r2);
    }, r.snapshot = function(t3) {
      var e4;
      void 0 === t3 && (t3 = true);
      var i2 = r.props.id ? r.props.id : "lottie", a2 = document.getElementById(i2);
      if ("svg" === r.props.renderer) {
        if (a2) {
          var s2 = a2.querySelector("svg");
          if (s2) {
            var n2 = new XMLSerializer().serializeToString(s2);
            e4 = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(n2);
          }
        }
        t3 && r.triggerDownload(e4, "snapshot.svg");
      } else if ("canvas" === r.props.renderer) {
        if (a2) {
          var o2 = a2.querySelector("canvas");
          o2 && (e4 = o2.toDataURL("image/png"));
        }
        t3 && r.triggerDownload(e4, "snapshot.png");
      }
      return e4;
    }, "undefined" != typeof window && (window.lottie = lottie), r.state = { animationData: null, background: "transparent", containerRef: reactExports.createRef(), debug: true, instance: null, playerState: PlayerState.Loading, seeker: 0 }, r;
  }
  return __extends(e2, t2), e2.getDerivedStateFromProps = function(t3, e3) {
    return __awaiter(this, void 0, void 0, (function() {
      return __generator(this, (function(r) {
        return t3.background !== e3.background ? [2, { background: t3.background }] : [2, null];
      }));
    }));
  }, e2.prototype.getVersions = function() {
    return { lottieWebVersion: LOTTIE_WEB_VERSION, lottiePlayerVersion: REACT_LOTTIE_PLAYER_VERSION };
  }, e2.prototype.componentDidMount = function() {
    return __awaiter(this, void 0, void 0, (function() {
      return __generator(this, (function(t3) {
        switch (t3.label) {
          case 0:
            return this.unmounted ? [3, 2] : [4, this.createLottie()];
          case 1:
            t3.sent(), t3.label = 2;
          case 2:
            return [2];
        }
      }));
    }));
  }, e2.prototype.componentWillUnmount = function() {
    this.unmounted = true, this.state.instance && this.state.instance.destroy();
  }, e2.prototype.componentDidUpdate = function(t3) {
    return __awaiter(this, void 0, void 0, (function() {
      return __generator(this, (function(e3) {
        switch (e3.label) {
          case 0:
            return this.props.src === t3.src ? [3, 2] : (this.state.instance && this.state.instance.destroy(), [4, this.createLottie()]);
          case 1:
            e3.sent(), e3.label = 2;
          case 2:
            return [2];
        }
      }));
    }));
  }, e2.prototype.render = function() {
    var t3 = this, e3 = this.props, r = e3.children, i2 = e3.loop, a2 = e3.style, s2 = e3.onBackgroundChange, n2 = e3.className, o2 = this.state, h2 = o2.animationData, l2 = o2.instance, p2 = o2.playerState, f2 = o2.seeker, c2 = o2.debug, m2 = o2.background;
    return reactExports.createElement("div", { className: "lf-player-container" }, this.state.playerState === PlayerState.Error ? reactExports.createElement("div", { className: "lf-error" }, reactExports.createElement("span", { "aria-label": "error-symbol", role: "img" }, "⚠️")) : reactExports.createElement("div", { id: this.props.id ? this.props.id : "lottie", ref: function(e4) {
      return t3.container = e4;
    }, style: __assign({ background: m2, margin: "0 auto", outline: "none", overflow: "hidden" }, a2), className: n2 }), reactExports.Children.map(r, (function(e4) {
      return reactExports.isValidElement(e4) ? reactExports.cloneElement(e4, { animationData: h2, background: m2, debug: c2, instance: l2, loop: i2, pause: function() {
        return t3.pause();
      }, play: function() {
        return t3.play();
      }, playerState: p2, seeker: f2, setBackground: function(e5) {
        t3.setState({ background: e5 }), "function" == typeof s2 && s2(e5);
      }, setSeeker: function(e5, r2) {
        return t3.setSeeker(e5, r2);
      }, stop: function() {
        return t3.stop();
      }, toggleDebug: function() {
        return t3.toggleDebug();
      }, setLoop: function(e5) {
        return t3.setLoop(e5);
      }, colorChangedEvent: function(e5) {
        t3.handleBgChange(e5);
      }, snapshot: function() {
        t3.snapshot();
      } }) : null;
    })));
  }, e2.prototype.toggleDebug = function() {
    this.setState({ debug: !this.state.debug });
  }, e2.prototype.createLottie = function() {
    return __awaiter(this, void 0, void 0, (function() {
      var t3, e3, r, i2, a2, s2, n2, o2, h2, l2, p2, f2, c2, m2, d2 = this;
      return __generator(this, (function(u2) {
        switch (u2.label) {
          case 0:
            if (t3 = this.props, e3 = t3.autoplay, r = t3.direction, i2 = t3.loop, a2 = t3.lottieRef, s2 = t3.renderer, n2 = t3.speed, o2 = t3.src, h2 = t3.background, l2 = t3.rendererSettings, p2 = t3.hover, f2 = this.state.instance, !o2 || !this.container) return [2];
            u2.label = 1;
          case 1:
            return u2.trys.push([1, 5, , 6]), "string" != typeof (c2 = parseSrc(o2)) ? [3, 4] : [4, fetch(c2).catch((function() {
              throw d2.setState({ playerState: PlayerState.Error }), d2.triggerEvent(PlayerEvent.Error), new Error("@LottieFiles/lottie-react: Animation data could not be fetched.");
            }))];
          case 2:
            return [4, u2.sent().json().catch((function() {
              throw d2.setState({ playerState: PlayerState.Error }), d2.triggerEvent(PlayerEvent.Error), new Error("@LottieFiles/lottie-react: Animation data could not be fetched.");
            }))];
          case 3:
            c2 = u2.sent(), u2.label = 4;
          case 4:
            return f2 && f2.destroy(), m2 = lottie.loadAnimation({ rendererSettings: l2 || defaultOptions, animationData: c2, autoplay: e3 || false, container: this.container, loop: i2 || false, renderer: s2 }), n2 && m2.setSpeed(n2), this.setState({ animationData: c2 }), this.setState({ instance: m2 }, (function() {
              d2.triggerEvent(PlayerEvent.InstanceSaved), "function" == typeof a2 && a2(m2), e3 && d2.play();
            })), m2.addEventListener("enterFrame", (function() {
              d2.triggerEvent(PlayerEvent.Frame), d2.setState({ seeker: Math.floor(m2.currentFrame) });
            })), m2.addEventListener("DOMLoaded", (function() {
              d2.triggerEvent(PlayerEvent.Load);
            })), m2.addEventListener("data_ready", (function() {
              d2.triggerEvent(PlayerEvent.Ready);
            })), m2.addEventListener("data_failed", (function() {
              d2.setState({ playerState: PlayerState.Error }), d2.triggerEvent(PlayerEvent.Error);
            })), m2.addEventListener("loopComplete", (function() {
              d2.triggerEvent(PlayerEvent.Loop);
            })), m2.addEventListener("complete", (function() {
              d2.triggerEvent(PlayerEvent.Complete), d2.setState({ playerState: PlayerState.Paused }), d2.props.keepLastFrame && !d2.props.loop || d2.setSeeker(0);
            })), this.container && (this.container.addEventListener("mouseenter", (function() {
              p2 && d2.state.playerState !== PlayerState.Playing && (d2.props.keepLastFrame && d2.stop(), d2.play());
            })), this.container.addEventListener("mouseleave", (function() {
              p2 && d2.state.playerState === PlayerState.Playing && d2.stop();
            }))), n2 && this.setPlayerSpeed(n2), r && this.setPlayerDirection(r), h2 && this.setState({ background: h2 }), [3, 6];
          case 5:
            return u2.sent(), this.setState({ playerState: PlayerState.Error }), this.triggerEvent(PlayerEvent.Error), [3, 6];
          case 6:
            return [2];
        }
      }));
    }));
  }, e2.prototype.play = function() {
    var t3 = this.state.instance;
    t3 && (this.triggerEvent(PlayerEvent.Play), t3.play(), this.setState({ playerState: PlayerState.Playing }));
  }, e2.prototype.pause = function() {
    var t3 = this.state.instance;
    t3 && (this.triggerEvent(PlayerEvent.Pause), t3.pause(), this.setState({ playerState: PlayerState.Paused }));
  }, e2.prototype.stop = function() {
    var t3 = this.state.instance;
    t3 && (this.triggerEvent(PlayerEvent.Stop), t3.stop(), this.setState({ playerState: PlayerState.Stopped }));
  }, e2.prototype.setPlayerSpeed = function(t3) {
    var e3 = this.state.instance;
    e3 && e3.setSpeed(t3);
  }, e2.prototype.setPlayerDirection = function(t3) {
    var e3 = this.state.instance;
    e3 && e3.setDirection(t3);
  }, e2.prototype.setSeeker = function(t3, e3) {
    void 0 === e3 && (e3 = false);
    var r = this.state, i2 = r.instance, a2 = r.playerState;
    i2 && (e3 && a2 === PlayerState.Playing ? i2.goToAndPlay(t3, true) : (i2.goToAndStop(t3, true), this.triggerEvent(PlayerEvent.Pause), this.setState({ playerState: PlayerState.Paused })));
  }, e2.prototype.setLoop = function(t3) {
    var e3 = this.state.instance;
    e3 && (e3.loop = t3, this.setState({ instance: e3 }));
  }, e2.prototype.triggerEvent = function(t3) {
    var e3 = this.props.onEvent;
    e3 && e3(t3);
  }, e2.defaultProps = { loop: false }, e2;
})(reactExports.Component);
function styleInject(t2, e2) {
  void 0 === e2 && (e2 = {});
  var r = e2.insertAt;
  if ("undefined" != typeof document) {
    var i2 = document.head || document.getElementsByTagName("head")[0], a2 = document.createElement("style");
    a2.type = "text/css", "top" === r && i2.firstChild ? i2.insertBefore(a2, i2.firstChild) : i2.appendChild(a2), a2.styleSheet ? a2.styleSheet.cssText = t2 : a2.appendChild(document.createTextNode(t2));
  }
}
var css_248z = ".lf-progress {\n  -webkit-appearance: none;\n  -moz-apperance: none;\n  width: 100%;\n  /* margin: 0 10px; */\n  height: 4px;\n  border-radius: 3px;\n  cursor: pointer;\n}\n.lf-progress:focus {\n  outline: none;\n  border: none;\n}\n.lf-progress::-moz-range-track {\n  cursor: pointer;\n  background: none;\n  border: none;\n  outline: none;\n}\n.lf-progress::-webkit-slider-thumb {\n  -webkit-appearance: none !important;\n  height: 13px;\n  width: 13px;\n  border: 0;\n  border-radius: 50%;\n  background: #0fccce;\n  cursor: pointer;\n}\n.lf-progress::-moz-range-thumb {\n  -moz-appearance: none !important;\n  height: 13px;\n  width: 13px;\n  border: 0;\n  border-radius: 50%;\n  background: #0fccce;\n  cursor: pointer;\n}\n.lf-progress::-ms-track {\n  width: 100%;\n  height: 3px;\n  cursor: pointer;\n  background: transparent;\n  border-color: transparent;\n  color: transparent;\n}\n.lf-progress::-ms-fill-lower {\n  background: #ccc;\n  border-radius: 3px;\n}\n.lf-progress::-ms-fill-upper {\n  background: #ccc;\n  border-radius: 3px;\n}\n.lf-progress::-ms-thumb {\n  border: 0;\n  height: 15px;\n  width: 15px;\n  border-radius: 50%;\n  background: #0fccce;\n  cursor: pointer;\n}\n.lf-progress:focus::-ms-fill-lower {\n  background: #ccc;\n}\n.lf-progress:focus::-ms-fill-upper {\n  background: #ccc;\n}\n.lf-player-container :focus {\n  outline: 0;\n}\n.lf-popover {\n  position: relative;\n}\n\n.lf-popover-content {\n  display: inline-block;\n  position: absolute;\n  opacity: 1;\n  visibility: visible;\n  transform: translate(0, -10px);\n  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);\n  transition: all 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97);\n}\n\n.lf-popover-content.hidden {\n  opacity: 0;\n  visibility: hidden;\n  transform: translate(0, 0px);\n}\n\n.lf-player-btn-container {\n  display: flex;\n  align-items: center;\n}\n.lf-player-btn {\n  cursor: pointer;\n  fill: #999;\n  width: 14px;\n}\n\n.lf-player-btn.active {\n  fill: #555;\n}\n\n.lf-popover {\n  position: relative;\n}\n\n.lf-popover-content {\n  display: inline-block;\n  position: absolute;\n  background-color: #ffffff;\n  opacity: 1;\n\n  transform: translate(0, -10px);\n  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);\n  transition: all 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97);\n  padding: 10px;\n}\n\n.lf-popover-content.hidden {\n  opacity: 0;\n  visibility: hidden;\n  transform: translate(0, 0px);\n}\n\n.lf-arrow {\n  position: absolute;\n  z-index: -1;\n  content: '';\n  bottom: -9px;\n  border-style: solid;\n  border-width: 10px 10px 0px 10px;\n}\n\n.lf-left-align,\n.lf-left-align .lfarrow {\n  left: 0;\n  right: unset;\n}\n\n.lf-right-align,\n.lf-right-align .lf-arrow {\n  right: 0;\n  left: unset;\n}\n\n.lf-text-input {\n  border: 1px #ccc solid;\n  border-radius: 5px;\n  padding: 3px;\n  width: 60px;\n  margin: 0;\n}\n\n.lf-color-picker {\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  height: 90px;\n}\n\n.lf-color-selectors {\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n\n.lf-color-component {\n  display: flex;\n  flex-direction: row;\n  font-size: 12px;\n  align-items: center;\n  justify-content: center;\n}\n\n.lf-color-component strong {\n  width: 40px;\n}\n\n.lf-color-component input[type='range'] {\n  margin: 0 0 0 10px;\n}\n\n.lf-color-component input[type='number'] {\n  width: 50px;\n  margin: 0 0 0 10px;\n}\n\n.lf-color-preview {\n  font-size: 12px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  padding-left: 5px;\n}\n\n.lf-preview {\n  height: 60px;\n  width: 60px;\n}\n\n.lf-popover-snapshot {\n  width: 150px;\n}\n.lf-popover-snapshot h5 {\n  margin: 5px 0 10px 0;\n  font-size: 0.75rem;\n}\n.lf-popover-snapshot a {\n  display: block;\n  text-decoration: none;\n}\n.lf-popover-snapshot a:before {\n  content: '⥼';\n  margin-right: 5px;\n}\n.lf-popover-snapshot .lf-note {\n  display: block;\n  margin-top: 10px;\n  color: #999;\n}\n.lf-player-controls > div {\n  margin-right: 5px;\n  margin-left: 5px;\n}\n.lf-player-controls > div:first-child {\n  margin-left: 0px;\n}\n.lf-player-controls > div:last-child {\n  margin-right: 0px;\n}\n";
styleInject(css_248z);
var ColorPicker = (function(t2) {
  function e2() {
    var e3 = null !== t2 && t2.apply(this, arguments) || this;
    return e3.state = { red: 0, green: 0, blue: 0, rgba: null, hex: "#000000", colorComponents: [] }, e3.handleChange = function(t3, r) {
      if ("r" === t3) {
        var i2 = "#" + (256 | r).toString(16).slice(1) + (256 | e3.state.green).toString(16).slice(1) + (256 | e3.state.blue).toString(16).slice(1);
        e3.setState({ hex: i2 });
      } else if ("g" === t3) {
        i2 = "#" + (256 | e3.state.red).toString(16).slice(1) + (256 | r).toString(16).slice(1) + (256 | e3.state.blue).toString(16).slice(1);
        e3.setState({ hex: i2 });
      } else if ("b" === t3) {
        i2 = "#" + (256 | e3.state.red).toString(16).slice(1) + (256 | e3.state.green).toString(16).slice(1) + (256 | r).toString(16).slice(1);
        e3.setState({ hex: i2 });
      }
    }, e3.parseColor = function(t3) {
      var r;
      if ("string" == typeof t3) {
        if ("#" === t3[0]) {
          var i2 = 4 === t3.length ? [t3.slice(1, 2), t3.slice(2, 3), t3.slice(3, 4)].map((function(t4) {
            return parseInt("" + t4 + t4, 16);
          })) : [t3.slice(1, 3), t3.slice(3, 5), t3.slice(5, 7)].map((function(t4) {
            return parseInt(t4, 16);
          }));
          e3.setState({ colorComponents: i2 });
        } else if (t3.startsWith("rgb")) {
          void 0 !== (i2 = null === (r = t3.match(/\d+/g)) || void 0 === r ? void 0 : r.map((function(t4) {
            return parseInt(t4);
          }))) && e3.setState({ colorComponents: i2 });
        }
        e3.state.colorComponents.length && (e3.setState({ red: e3.state.colorComponents[0] }), e3.setState({ green: e3.state.colorComponents[1] }), e3.setState({ blue: e3.state.colorComponents[2] }));
      }
    }, e3;
  }
  return __extends(e2, t2), e2.prototype.componentDidUpdate = function(t3, e3) {
    return this.props.colorChangedEvent && this.state.hex !== e3.hex && this.props.colorChangedEvent(this.state.hex), true;
  }, e2.prototype.render = function() {
    var t3 = this;
    return reactExports.createElement("div", { className: "lf-color-picker" }, reactExports.createElement("div", { className: "lf-color-selectors" }, reactExports.createElement("div", { className: "lf-color-component" }, reactExports.createElement("strong", null, "Red"), reactExports.createElement("input", { type: "range", min: "0", max: "255", value: this.state.red, onChange: function(e3) {
      t3.setState({ red: e3.target.value }), t3.handleChange("r", e3.target.value);
    } }), reactExports.createElement("input", { className: "lf-text-input", type: "number", min: "0", max: "255", value: this.state.red, onChange: function(e3) {
      t3.setState({ red: e3.target.value }), t3.handleChange("r", e3.target.value);
    } })), reactExports.createElement("div", { className: "lf-color-component" }, reactExports.createElement("strong", null, "Green"), reactExports.createElement("input", { type: "range", min: "0", max: "255", value: this.state.green, onChange: function(e3) {
      t3.setState({ green: e3.target.value }), t3.handleChange("g", e3.target.value);
    } }), reactExports.createElement("input", { className: "lf-text-input", type: "number", min: "0", max: "255", value: this.state.green, onChange: function(e3) {
      t3.setState({ green: e3.target.value }), t3.handleChange("g", e3.target.value);
    } })), reactExports.createElement("div", { className: "lf-color-component" }, reactExports.createElement("strong", null, "Blue"), reactExports.createElement("input", { type: "range", min: "0", max: "255", value: this.state.blue, onChange: function(e3) {
      t3.setState({ blue: e3.target.value }), t3.handleChange("b", e3.target.value);
    } }), reactExports.createElement("input", { className: "lf-text-input", type: "number", min: "0", max: "255", value: this.state.blue, onChange: function(e3) {
      t3.setState({ blue: e3.target.value }), t3.handleChange("b", e3.target.value);
    } }))), reactExports.createElement("div", { className: "lf-color-preview" }, reactExports.createElement("div", { className: "lf-preview", style: { background: "rgb(" + this.state.red + ", " + this.state.green + ", " + this.state.blue + ")" } }), reactExports.createElement("div", null, reactExports.createElement("input", { className: "lf-text-input", type: "text", value: this.state.hex, onChange: function(e3) {
      t3.setState({ hex: e3.target.value }), t3.parseColor(e3.target.value);
    } }))));
  }, e2;
})(reactExports.Component), Popover = function(t2) {
  var e2 = t2.children, r = t2.icon, i2 = reactExports.useState(null), a2 = i2[0], s2 = i2[1], n2 = reactExports.useState(null), o2 = n2[0], h2 = n2[1], l2 = reactExports.useState(null), p2 = l2[0], f2 = l2[1], c2 = reactExports.useState(false), m2 = c2[0], d2 = c2[1];
  reactExports.useEffect((function() {
    if (a2 && o2) {
      var t3 = a2.getBoundingClientRect(), e3 = o2.getBoundingClientRect(), r2 = t3.left + e3.width > window.innerWidth ? -1 : 0;
      f2(r2);
    }
  }), [p2, o2, a2]);
  return reactExports.createElement("div", { className: "lf-popover", onMouseOver: function() {
    d2(true);
  }, onMouseLeave: function() {
    d2(false);
  }, ref: function(t3) {
    s2(t3);
  } }, reactExports.createElement("div", { className: " lf-player-btn" }, r), reactExports.createElement("div", { className: "lf-popover-content", ref: function(t3) {
    h2(t3);
  }, style: { bottom: "22px", right: "0px", zIndex: 2, visibility: m2 ? "visible" : "hidden" } }, e2));
}, Seeker = (function(t2) {
  function e2(e3) {
    var r = t2.call(this, e3) || this;
    return r.inputRef = reactExports.createRef(), r.handleChange = function() {
      return function(t3) {
        var e4 = t3.target.value, i2 = Math.floor(e4 / 100 * r.props.max);
        r.props.onChange(i2);
      };
    }, r.state = { value: 0 }, r;
  }
  return __extends(e2, t2), e2.prototype.render = function() {
    var t3 = this.props.value / this.props.max * 100, e3 = { backgroundImage: "-webkit-gradient(linear, left top, right top, color-stop(" + t3 + "%, rgba(15, 204, 206, 0.4)), color-stop(" + t3 + "%, #DAE1E7))" }, r = { position: "absolute", left: 0, marginTop: "8px", width: "20px", display: "block", border: "0px", backgroundColor: this.props.darkTheme ? "#505050" : "rgb(218, 225, 231)", color: this.props.darkTheme ? "#B9B9B9" : "#555", padding: "2px", textAlign: "center", borderRadius: "3px", fontSize: "8px", fontWeight: "bold" }, i2 = { position: "absolute", right: 0, marginTop: "8px", width: "20px", display: "block", border: "0px", backgroundColor: this.props.darkTheme ? "#505050" : "rgb(218, 225, 231)", color: this.props.darkTheme ? "#B9B9B9" : "#555", padding: "2px", textAlign: "center", borderRadius: "3px", fontSize: "8px", fontWeight: "bold" };
    return reactExports.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginRight: "5px", marginLeft: "5px", position: "relative" } }, reactExports.createElement("input", { ref: this.inputRef, id: "track", className: "lf-progress", name: "progress", "aria-label": "progress", type: "range", min: "0", max: "100", step: "0.1", value: t3, onInput: this.handleChange(), onChange: this.handleChange(), style: e3 }), this.props.showLabels && reactExports.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, reactExports.createElement("div", { style: r }, this.props.min), reactExports.createElement("div", { style: i2 }, this.props.max)));
  }, e2;
})(reactExports.Component), ControlButtonStyle = { display: "inline-flex", cursor: "pointer" };
(function(t2) {
  function e2(e3) {
    var r = t2.call(this, e3) || this;
    return r.state = { activeFrame: 0, mouseDown: false }, r;
  }
  return __extends(e2, t2), e2.prototype.render = function() {
    var t3 = this, e3 = this.props, r = e3.instance, i2 = e3.playerState, a2 = e3.seeker, s2 = e3.setLoop, n2 = e3.setSeeker, o2 = e3.play, h2 = e3.pause, l2 = e3.stop, p2 = e3.visible, f2 = e3.buttons;
    if (!r) return null;
    if (!p2) return null;
    var c2 = !f2 || f2.includes("play"), m2 = !f2 || f2.includes("stop"), d2 = !f2 || f2.includes("repeat"), u2 = !f2 || f2.includes("frame"), y = !f2 || f2.includes("background"), g2 = !f2 || f2.includes("snapshot"), v2 = { width: 14, height: 14, viewBox: "0 0 24 24" }, b = Math.round(r.currentFrame);
    return reactExports.createElement("div", { className: "lf-player-controls", style: { display: "flex", justifyContent: "space-between", height: "60px", alignItems: "center", backgroundColor: this.props.transparentTheme ? "transparent" : this.props.darkTheme ? "#3C3C3C" : "#ffffff", paddingLeft: "10px", paddingRight: "10px" } }, c2 && reactExports.createElement("div", { role: "button", "aria-label": i2 === PlayerState.Playing ? PlayerEvent.Pause : PlayerEvent.Play, tabIndex: 0, onClick: function() {
      i2 === PlayerState.Playing ? "function" == typeof h2 && h2() : "function" == typeof o2 && o2();
    }, onKeyDown: function() {
      i2 === PlayerState.Playing ? "function" == typeof h2 && h2() : "function" == typeof o2 && o2();
    }, className: "lf-player-btn", style: ControlButtonStyle }, i2 === PlayerState.Playing ? reactExports.createElement("svg", __assign({}, v2), reactExports.createElement("rect", { height: "22.9", rx: "1.9", width: "7.6", x: "14", y: ".5" }), reactExports.createElement("rect", { height: "22.9", rx: "1.9", width: "7.6", x: "2", y: ".5" })) : reactExports.createElement("svg", __assign({}, v2), reactExports.createElement("path", { d: "M2 3.4C2 1.9 3.5 1 4.8 1.8l16.5 9.6c1.2.7 1.2 2.5 0 3.2L4.8 24.2C3.5 25 2 24.1 2 22.6V3.4z" }))), m2 && reactExports.createElement("div", { tabIndex: 0, role: "button", "aria-label": PlayerEvent.Stop, onClick: function() {
      return l2 && l2();
    }, onKeyDown: function() {
      return l2 && l2();
    }, className: i2 === PlayerState.Stopped ? "lf-player-btn active" : "lf-player-btn", style: ControlButtonStyle }, reactExports.createElement("svg", __assign({}, v2), reactExports.createElement("path", { d: "M2 3.667A1.67 1.67 0 0 1 3.667 2h16.666A1.67 1.67 0 0 1 22 3.667v16.666A1.67 1.67 0 0 1 20.333\n            22H3.667A1.67 1.67 0 0 1 2 20.333z" }))), reactExports.createElement(Seeker, { min: 0, step: 1, max: r ? r.totalFrames : 1, value: a2 || 0, onChange: function(e4) {
      n2 && t3.setState({ activeFrame: e4 }, (function() {
        n2(e4, false);
      }));
    }, onChangeEnd: function(e4) {
      n2 && t3.setState({ activeFrame: e4 }, (function() {
        n2(e4, false);
      }));
    }, showLabels: this.props.showLabels, darkTheme: this.props.darkTheme }), u2 && reactExports.createElement("div", { role: "button", className: "lf-player-btn-container" }, reactExports.createElement("input", { style: { outline: "none", border: this.props.darkTheme ? "1px #505050 solid" : "1px #ccc solid", borderRadius: "3px", width: "40px", textAlign: "center", backgroundColor: this.props.darkTheme ? "#505050" : "#ffffff", color: this.props.darkTheme ? "#B9B9B9" : "#999", fontSize: "0.7rem", padding: "0", fontFamily: "inherit" }, type: "text", value: b, readOnly: true })), d2 && reactExports.createElement("div", { role: "button", "aria-label": PlayerEvent.Loop, tabIndex: 0, onClick: function() {
      r && s2 && s2(!r.loop);
    }, onKeyDown: function() {
      r && s2 && s2(!r.loop);
    }, className: r.loop ? "lf-player-btn active" : "lf-player-btn", style: ControlButtonStyle }, reactExports.createElement("svg", __assign({}, v2), reactExports.createElement("path", { d: "M12.5 16.8137h-.13v1.8939h4.9696c3.6455 0 6.6113-2.9658 6.6113-6.6116\n            0-3.64549-2.9658-6.61131-6.6113-6.61131-.5231 0-.947.42391-.947.94696 0 .52304.4239.94696.947.94696 2.6011 0\n            4.7174 2.11634 4.7174 4.71739 0 2.6014-2.1166 4.7177-4.7174 4.7177H12.5zM13.6025\n            5.61469v-.13H7.48137C3.83582 5.48469.87 8.45051.87 12.096c0 3.6509 3.17269 6.6117 6.81304 6.6117.52304 0\n            .94696-.424.94696-.947 0-.5231-.42392-.947-.94696-.947-2.60804 0-4.91907-2.1231-4.91907-4.7176 0-2.60115\n            2.11634-4.71744 4.7174-4.71744h6.12113V5.61469z", stroke: "#8795A1", strokeWidth: ".26" }), reactExports.createElement("path", { d: "M11.1482\n            2.20355h0l-.001-.00116c-.3412-.40061-.9405-.44558-1.33668-.0996h-.00001c-.39526.34519-.43936.94795-.09898\n            1.34767l2.51487 3.03683-2.51894 3.06468c-.33872.40088-.29282 1.00363.10347\n            1.34723l.08517-.0982-.08517.0982c.17853.1549.39807.2308.61647.2308.2671 0 .5328-.114.72-.3347h0l.0011-.0014\n            3.0435-3.68655.0006-.00068c.3035-.35872.3025-.88754-.0019-1.24526l-3.0425-3.65786zM13.9453\n            21.7965h0l.001.0011c.3413.4006.9407.4456 1.337.0996h0c.3953-.3452.4395-.9479.099-1.3477l-2.5154-3.0368\n            2.5195-3.0647c.3388-.4008.2929-1.0036-.1035-1.3472l-.0852.0982.0852-.0982c-.1786-.1549-.3981-.2308-.6166-.2308-.2671\n            0-.5329.114-.7202.3347h0l-.0011.0014-3.0442\n            3.6865c-.0001.0003-.0003.0005-.0005.0007-.3036.3587-.3027.8876.0019 1.2453l3.0431 3.6579z", fill: "#8795A1", stroke: "#8795A1", strokeWidth: ".26" }))), y && reactExports.createElement(Popover, { icon: reactExports.createElement("svg", __assign({}, v2), reactExports.createElement("path", { d: "M12 3.1L6.1 8.6a7.6 7.6 0 00-2.2 4 7.2 7.2 0 00.4 4.4 7.9 7.9 0 003 3.5 8.7 8.7 0 004.7 1.3c1.6 0\n            3.2-.5 4.6-1.3s2.4-2 3-3.5a7.2 7.2 0 00.5-4.5 7.6 7.6 0 00-2.2-4L12 3.2zM12 0l7.5 7a9.8 9.8 0 013 5.1\n            9.3 9.3 0 01-.6 5.8c-.9 1.8-2.2 3.3-4 4.4A11.2 11.2 0 0112 24a11.2 11.2 0\n            01-6-1.7c-1.7-1-3-2.6-3.9-4.4a9.3 9.3 0 01-.6-5.8c.4-2 1.5-3.7 3-5L12 0zM6 14h12c0 1.5-.7 3-1.8 4s-2.6\n            1.6-4.2 1.6S9 19 7.8 18s-1.7-2.5-1.7-4z" })) }, reactExports.createElement("div", { slot: "content", className: "lf-popover popover-background" }, reactExports.createElement(ColorPicker, { colorChangedEvent: this.props.colorChangedEvent }))), g2 && reactExports.createElement(Popover, { icon: reactExports.createElement("svg", __assign({}, v2), reactExports.createElement("path", { clipRule: "evenodd", d: "M0 3.01A2.983 2.983 0 012.983.027H16.99a2.983 2.983 0 012.983 2.983v14.008a2.982 2.982 0 01-2.983\n              2.983H2.983A2.983 2.983 0 010 17.018zm2.983-.941a.941.941 0 00-.942.94v14.01c0\n              .52.422.94.942.94H16.99a.94.94 0 00.941-.94V3.008a.941.941 0 00-.94-.94H2.981z", fillRule: "evenodd" }), reactExports.createElement("path", { d: "M12.229 7.945l-2.07 4.598-2.586-2.605-2.414 2.758v2.146h9.656V11.93z" }), reactExports.createElement("circle", { cx: "7.444", cy: "6.513", r: "2.032" }), reactExports.createElement("path", { d: "M9.561 23.916h11.25a2.929 2.929 0 002.926-2.927V9.954a1.06 1.06 0 10-2.122 0v11.035a.805.805 0\n              01-.803.804H9.562a1.061 1.061 0 100 2.123z", stroke: "#8795a1", strokeWidth: ".215" })) }, reactExports.createElement("div", { slot: "content", className: "lf-popover lf-popover-snapshot", onWheel: function(t4) {
      n2 && n2(b + (t4.deltaY > 0 ? -1 : 1), false);
    } }, reactExports.createElement("h5", null, "Frame ", b), reactExports.createElement("div", { style: { cursor: "pointer", color: "#0FCCCE" }, onClick: this.props.snapshot }, "Download SVG"), reactExports.createElement("div", { style: { cursor: "pointer", color: "#0FCCCE" }, onClick: this.props.snapshot }, "Download PNG"), reactExports.createElement("i", { className: "lf-note" }, "Scroll with mousewheel to find exact frame"))));
  }, e2;
})(reactExports.Component);
let e = { data: "" }, t = (t2) => {
  if ("object" == typeof window) {
    let e2 = (t2 ? t2.querySelector("#_goober") : window._goober) || Object.assign(document.createElement("style"), { innerHTML: " ", id: "_goober" });
    return e2.nonce = window.__nonce__, e2.parentNode || (t2 || document.head).appendChild(e2), e2.firstChild;
  }
  return t2 || e;
}, l = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g, a = /\/\*[^]*?\*\/|  +/g, n$1 = /\n+/g, o = (e2, t2) => {
  let r = "", l2 = "", a2 = "";
  for (let n2 in e2) {
    let c2 = e2[n2];
    "@" == n2[0] ? "i" == n2[1] ? r = n2 + " " + c2 + ";" : l2 += "f" == n2[1] ? o(c2, n2) : n2 + "{" + o(c2, "k" == n2[1] ? "" : t2) + "}" : "object" == typeof c2 ? l2 += o(c2, t2 ? t2.replace(/([^,])+/g, (e3) => n2.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t3) => /&/.test(t3) ? t3.replace(/&/g, e3) : e3 ? e3 + " " + t3 : t3)) : n2) : null != c2 && (n2 = /^--/.test(n2) ? n2 : n2.replace(/[A-Z]/g, "-$&").toLowerCase(), a2 += o.p ? o.p(n2, c2) : n2 + ":" + c2 + ";");
  }
  return r + (t2 && a2 ? t2 + "{" + a2 + "}" : a2) + l2;
}, c = {}, s = (e2) => {
  if ("object" == typeof e2) {
    let t2 = "";
    for (let r in e2) t2 += r + s(e2[r]);
    return t2;
  }
  return e2;
}, i = (e2, t2, r, i2, p2) => {
  let u2 = s(e2), d2 = c[u2] || (c[u2] = ((e3) => {
    let t3 = 0, r2 = 11;
    for (; t3 < e3.length; ) r2 = 101 * r2 + e3.charCodeAt(t3++) >>> 0;
    return "go" + r2;
  })(u2));
  if (!c[d2]) {
    let t3 = u2 !== e2 ? e2 : ((e3) => {
      let t4, r2, o2 = [{}];
      for (; t4 = l.exec(e3.replace(a, "")); ) t4[4] ? o2.shift() : t4[3] ? (r2 = t4[3].replace(n$1, " ").trim(), o2.unshift(o2[0][r2] = o2[0][r2] || {})) : o2[0][t4[1]] = t4[2].replace(n$1, " ").trim();
      return o2[0];
    })(e2);
    c[d2] = o(p2 ? { ["@keyframes " + d2]: t3 } : t3, r ? "" : "." + d2);
  }
  let f2 = r && c.g ? c.g : null;
  return r && (c.g = c[d2]), ((e3, t3, r2, l2) => {
    l2 ? t3.data = t3.data.replace(l2, e3) : -1 === t3.data.indexOf(e3) && (t3.data = r2 ? e3 + t3.data : t3.data + e3);
  })(c[d2], t2, i2, f2), d2;
}, p = (e2, t2, r) => e2.reduce((e3, l2, a2) => {
  let n2 = t2[a2];
  if (n2 && n2.call) {
    let e4 = n2(r), t3 = e4 && e4.props && e4.props.className || /^go/.test(e4) && e4;
    n2 = t3 ? "." + t3 : e4 && "object" == typeof e4 ? e4.props ? "" : o(e4, "") : false === e4 ? "" : e4;
  }
  return e3 + l2 + (null == n2 ? "" : n2);
}, "");
function u(e2) {
  let r = this || {}, l2 = e2.call ? e2(r.p) : e2;
  return i(l2.unshift ? l2.raw ? p(l2, [].slice.call(arguments, 1), r.p) : l2.reduce((e3, t2) => Object.assign(e3, t2 && t2.call ? t2(r.p) : t2), {}) : l2, t(r.target), r.g, r.o, r.k);
}
let d, f$1, g;
u.bind({ g: 1 });
let h$1 = u.bind({ k: 1 });
function m(e2, t2, r, l2) {
  o.p = t2, d = e2, f$1 = r, g = l2;
}
function w$1(e2, t2) {
  let r = this || {};
  return function() {
    let l2 = arguments;
    function a2(n2, o2) {
      let c2 = Object.assign({}, n2), s2 = c2.className || a2.className;
      r.p = Object.assign({ theme: f$1 && f$1() }, c2), r.o = / *go\d+/.test(s2), c2.className = u.apply(r, l2) + (s2 ? " " + s2 : "");
      let i2 = e2;
      return e2[0] && (i2 = c2.as || e2, delete c2.as), g && i2[0] && g(c2), d(i2, c2);
    }
    return t2 ? t2(a2) : a2;
  };
}
var Z = (e2) => typeof e2 == "function", h = (e2, t2) => Z(e2) ? e2(t2) : e2;
var W = /* @__PURE__ */ (() => {
  let e2 = 0;
  return () => (++e2).toString();
})(), E = /* @__PURE__ */ (() => {
  let e2;
  return () => {
    if (e2 === void 0 && typeof window < "u") {
      let t2 = matchMedia("(prefers-reduced-motion: reduce)");
      e2 = !t2 || t2.matches;
    }
    return e2;
  };
})();
var re = 20, k = "default";
var H = (e2, t2) => {
  let { toastLimit: o2 } = e2.settings;
  switch (t2.type) {
    case 0:
      return { ...e2, toasts: [t2.toast, ...e2.toasts].slice(0, o2) };
    case 1:
      return { ...e2, toasts: e2.toasts.map((r) => r.id === t2.toast.id ? { ...r, ...t2.toast } : r) };
    case 2:
      let { toast: s2 } = t2;
      return H(e2, { type: e2.toasts.find((r) => r.id === s2.id) ? 1 : 0, toast: s2 });
    case 3:
      let { toastId: a2 } = t2;
      return { ...e2, toasts: e2.toasts.map((r) => r.id === a2 || a2 === void 0 ? { ...r, dismissed: true, visible: false } : r) };
    case 4:
      return t2.toastId === void 0 ? { ...e2, toasts: [] } : { ...e2, toasts: e2.toasts.filter((r) => r.id !== t2.toastId) };
    case 5:
      return { ...e2, pausedAt: t2.time };
    case 6:
      let i2 = t2.time - (e2.pausedAt || 0);
      return { ...e2, pausedAt: void 0, toasts: e2.toasts.map((r) => ({ ...r, pauseDuration: r.pauseDuration + i2 })) };
  }
}, v = [], j = { toasts: [], pausedAt: void 0, settings: { toastLimit: re } }, f = {}, Y = (e2, t2 = k) => {
  f[t2] = H(f[t2] || j, e2), v.forEach(([o2, s2]) => {
    o2 === t2 && s2(f[t2]);
  });
}, _ = (e2) => Object.keys(f).forEach((t2) => Y(e2, t2)), Q = (e2) => Object.keys(f).find((t2) => f[t2].toasts.some((o2) => o2.id === e2)), S = (e2 = k) => (t2) => {
  Y(t2, e2);
}, se = { blank: 4e3, error: 4e3, success: 2e3, loading: 1 / 0, custom: 4e3 }, V = (e2 = {}, t2 = k) => {
  let [o2, s2] = reactExports.useState(f[t2] || j), a2 = reactExports.useRef(f[t2]);
  reactExports.useEffect(() => (a2.current !== f[t2] && s2(f[t2]), v.push([t2, s2]), () => {
    let r = v.findIndex(([l2]) => l2 === t2);
    r > -1 && v.splice(r, 1);
  }), [t2]);
  let i2 = o2.toasts.map((r) => {
    var l2, g2, T;
    return { ...e2, ...e2[r.type], ...r, removeDelay: r.removeDelay || ((l2 = e2[r.type]) == null ? void 0 : l2.removeDelay) || (e2 == null ? void 0 : e2.removeDelay), duration: r.duration || ((g2 = e2[r.type]) == null ? void 0 : g2.duration) || (e2 == null ? void 0 : e2.duration) || se[r.type], style: { ...e2.style, ...(T = e2[r.type]) == null ? void 0 : T.style, ...r.style } };
  });
  return { ...o2, toasts: i2 };
};
var ie = (e2, t2 = "blank", o2) => ({ createdAt: Date.now(), visible: true, dismissed: false, type: t2, ariaProps: { role: "status", "aria-live": "polite" }, message: e2, pauseDuration: 0, ...o2, id: (o2 == null ? void 0 : o2.id) || W() }), P = (e2) => (t2, o2) => {
  let s2 = ie(t2, e2, o2);
  return S(s2.toasterId || Q(s2.id))({ type: 2, toast: s2 }), s2.id;
}, n = (e2, t2) => P("blank")(e2, t2);
n.error = P("error");
n.success = P("success");
n.loading = P("loading");
n.custom = P("custom");
n.dismiss = (e2, t2) => {
  let o2 = { type: 3, toastId: e2 };
  t2 ? S(t2)(o2) : _(o2);
};
n.dismissAll = (e2) => n.dismiss(void 0, e2);
n.remove = (e2, t2) => {
  let o2 = { type: 4, toastId: e2 };
  t2 ? S(t2)(o2) : _(o2);
};
n.removeAll = (e2) => n.remove(void 0, e2);
n.promise = (e2, t2, o2) => {
  let s2 = n.loading(t2.loading, { ...o2, ...o2 == null ? void 0 : o2.loading });
  return typeof e2 == "function" && (e2 = e2()), e2.then((a2) => {
    let i2 = t2.success ? h(t2.success, a2) : void 0;
    return i2 ? n.success(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.success }) : n.dismiss(s2), a2;
  }).catch((a2) => {
    let i2 = t2.error ? h(t2.error, a2) : void 0;
    i2 ? n.error(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.error }) : n.dismiss(s2);
  }), e2;
};
var ce = 1e3, w = (e2, t2 = "default") => {
  let { toasts: o2, pausedAt: s2 } = V(e2, t2), a2 = reactExports.useRef(/* @__PURE__ */ new Map()).current, i2 = reactExports.useCallback((c2, m2 = ce) => {
    if (a2.has(c2)) return;
    let p2 = setTimeout(() => {
      a2.delete(c2), r({ type: 4, toastId: c2 });
    }, m2);
    a2.set(c2, p2);
  }, []);
  reactExports.useEffect(() => {
    if (s2) return;
    let c2 = Date.now(), m2 = o2.map((p2) => {
      if (p2.duration === 1 / 0) return;
      let R = (p2.duration || 0) + p2.pauseDuration - (c2 - p2.createdAt);
      if (R < 0) {
        p2.visible && n.dismiss(p2.id);
        return;
      }
      return setTimeout(() => n.dismiss(p2.id, t2), R);
    });
    return () => {
      m2.forEach((p2) => p2 && clearTimeout(p2));
    };
  }, [o2, s2, t2]);
  let r = reactExports.useCallback(S(t2), [t2]), l2 = reactExports.useCallback(() => {
    r({ type: 5, time: Date.now() });
  }, [r]), g2 = reactExports.useCallback((c2, m2) => {
    r({ type: 1, toast: { id: c2, height: m2 } });
  }, [r]), T = reactExports.useCallback(() => {
    s2 && r({ type: 6, time: Date.now() });
  }, [s2, r]), d2 = reactExports.useCallback((c2, m2) => {
    let { reverseOrder: p2 = false, gutter: R = 8, defaultPosition: z } = m2 || {}, O = o2.filter((u2) => (u2.position || z) === (c2.position || z) && u2.height), K = O.findIndex((u2) => u2.id === c2.id), B = O.filter((u2, I) => I < K && u2.visible).length;
    return O.filter((u2) => u2.visible).slice(...p2 ? [B + 1] : [0, B]).reduce((u2, I) => u2 + (I.height || 0) + R, 0);
  }, [o2]);
  return reactExports.useEffect(() => {
    o2.forEach((c2) => {
      if (c2.dismissed) i2(c2.id, c2.removeDelay);
      else {
        let m2 = a2.get(c2.id);
        m2 && (clearTimeout(m2), a2.delete(c2.id));
      }
    });
  }, [o2, i2]), { toasts: o2, handlers: { updateHeight: g2, startPause: l2, endPause: T, calculateOffset: d2 } };
};
var de = h$1`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`, me = h$1`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`, le = h$1`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`, C = w$1("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${de} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${me} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${(e2) => e2.secondary || "#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${le} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`;
var Te = h$1`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`, F = w$1("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${(e2) => e2.secondary || "#e0e0e0"};
  border-right-color: ${(e2) => e2.primary || "#616161"};
  animation: ${Te} 1s linear infinite;
`;
var ge = h$1`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`, he = h$1`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`, L = w$1("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ge} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${he} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${(e2) => e2.secondary || "#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`;
var be = w$1("div")`
  position: absolute;
`, Se = w$1("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`, Ae = h$1`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`, Pe = w$1("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ae} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`, $ = ({ toast: e2 }) => {
  let { icon: t2, type: o2, iconTheme: s2 } = e2;
  return t2 !== void 0 ? typeof t2 == "string" ? reactExports.createElement(Pe, null, t2) : t2 : o2 === "blank" ? null : reactExports.createElement(Se, null, reactExports.createElement(F, { ...s2 }), o2 !== "loading" && reactExports.createElement(be, null, o2 === "error" ? reactExports.createElement(C, { ...s2 }) : reactExports.createElement(L, { ...s2 })));
};
var Re = (e2) => `
0% {transform: translate3d(0,${e2 * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`, Ee = (e2) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e2 * -150}%,-1px) scale(.6); opacity:0;}
`, ve = "0%{opacity:0;} 100%{opacity:1;}", De = "0%{opacity:1;} 100%{opacity:0;}", Oe = w$1("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`, Ie = w$1("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`, ke = (e2, t2) => {
  let s2 = e2.includes("top") ? 1 : -1, [a2, i2] = E() ? [ve, De] : [Re(s2), Ee(s2)];
  return { animation: t2 ? `${h$1(a2)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards` : `${h$1(i2)} 0.4s forwards cubic-bezier(.06,.71,.55,1)` };
}, N = reactExports.memo(({ toast: e2, position: t2, style: o2, children: s2 }) => {
  let a2 = e2.height ? ke(e2.position || t2 || "top-center", e2.visible) : { opacity: 0 }, i2 = reactExports.createElement($, { toast: e2 }), r = reactExports.createElement(Ie, { ...e2.ariaProps }, h(e2.message, e2));
  return reactExports.createElement(Oe, { className: e2.className, style: { ...a2, ...o2, ...e2.style } }, typeof s2 == "function" ? s2({ icon: i2, message: r }) : reactExports.createElement(reactExports.Fragment, null, i2, r));
});
m(reactExports.createElement);
var we = ({ id: e2, className: t2, style: o2, onHeightUpdate: s2, children: a2 }) => {
  let i2 = reactExports.useCallback((r) => {
    if (r) {
      let l2 = () => {
        let g2 = r.getBoundingClientRect().height;
        s2(e2, g2);
      };
      l2(), new MutationObserver(l2).observe(r, { subtree: true, childList: true, characterData: true });
    }
  }, [e2, s2]);
  return reactExports.createElement("div", { ref: i2, className: t2, style: o2 }, a2);
}, Me = (e2, t2) => {
  let o2 = e2.includes("top"), s2 = o2 ? { top: 0 } : { bottom: 0 }, a2 = e2.includes("center") ? { justifyContent: "center" } : e2.includes("right") ? { justifyContent: "flex-end" } : {};
  return { left: 0, right: 0, display: "flex", position: "absolute", transition: E() ? void 0 : "all 230ms cubic-bezier(.21,1.02,.73,1)", transform: `translateY(${t2 * (o2 ? 1 : -1)}px)`, ...s2, ...a2 };
}, Ce = u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`, D = 16, Fe = ({ reverseOrder: e2, position: t2 = "top-center", toastOptions: o2, gutter: s2, children: a2, toasterId: i2, containerStyle: r, containerClassName: l2 }) => {
  let { toasts: g2, handlers: T } = w(o2, i2);
  return reactExports.createElement("div", { "data-rht-toaster": i2 || "", style: { position: "fixed", zIndex: 9999, top: D, left: D, right: D, bottom: D, pointerEvents: "none", ...r }, className: l2, onMouseEnter: T.startPause, onMouseLeave: T.endPause }, g2.map((d2) => {
    let c2 = d2.position || t2, m2 = T.calculateOffset(d2, { reverseOrder: e2, gutter: s2, defaultPosition: t2 }), p2 = Me(c2, m2);
    return reactExports.createElement(we, { id: d2.id, key: d2.id, onHeightUpdate: T.updateHeight, className: d2.visible ? Ce : "", style: p2 }, d2.type === "custom" ? h(d2.message, d2) : a2 ? a2(d2) : reactExports.createElement(N, { toast: d2, position: c2 }));
  }));
};
var zt = n;
const musicMatchData = /* @__PURE__ */ JSON.parse(`[{"country":"Argentina","style":"Tango","flag":"🇦🇷","audio":"music/ARGENTINA DRUMS AND HORNS_1.2.wav","image":"art/country_images/Juan Manuel Benitez_Argentina.jpg","image2":"art/country_images/Sebastian Oreschuk_Argentina.jpg","fact":"Tango was born in Buenos Aires in the late 1800s - a passionate dance and music style that tells stories through movement.","clues":["This country is in South America and is famous for its wide-open grasslands called the pampas.","Its capital city, Buenos Aires, is one of the largest and most vibrant cities in all of South America.","A dramatic, passionate dance music was born in the port neighbourhoods of this capital city in the late 1800s."]},{"country":"Australia","style":"Orchestral Music","flag":"🇦🇺","audio":"music/Jamie Jangles_Daniel_Australia.wav","image":"art/country_images/DanOBrien_Australia.jpg","fact":"The Sydney Opera House is one of the most famous concert halls in the world - home to the Sydney Symphony Orchestra, it has hosted thousands of live orchestral performances since it opened in 1973.","clues":["This country is also a continent — the only nation that takes up an entire landmass, home to kangaroos and koalas.","Its most famous city sits on a stunning harbour and has one of the world's most recognised buildings on its waterfront.","That iconic waterfront building has a roof shaped like sails — and inside is one of the world's great concert halls."]},{"country":"Barbados","style":"Dancehall","flag":"🇧🇧","audio":"music/BARBADOS_2.wav","image":"art/country_images/Kahlil Worrell_Barbados.jpg","fact":"Dancehall is a high-energy Caribbean music style closely linked to Jamaica, known for its strong rhythms and dance culture enjoyed across islands like Barbados.","clues":["This small island nation sits in the Caribbean Sea, surrounded by warm blue water and white sand beaches.","It is the most easterly island in the Caribbean — the first to feel the Atlantic winds blowing in from Africa.","Its music scene is deeply connected to neighbouring Caribbean islands, full of heavy beats made for dancing."]},{"country":"France","style":"Accordion","flag":"🇫🇷","audio":"music/FRANCE.wav","image":"art/country_images/Alexx Schroll_France.jpg","fact":"The accordion became the soul of French street music in the 1800s, filling the cafés and cobblestone squares of Paris with a sound so distinctly French it became known as musette - the heartbeat of the city.","clues":["This country in Western Europe is famous for its food, fashion, the Eiffel Tower, and its romantic capital city.","Street musicians once filled every cobblestone square and café terrace of Paris with the sound of a squeezebox instrument.","That instrument — pushed and pulled to make air flow through reeds — became the heartbeat of this country's street music."]},{"country":"Ghana","style":"Azonto","flag":"🇬🇭","audio":"music/GHANA.wav","image":"art/country_images/Dery Korbieh_Ghana.jpg","fact":"Azonto is a popular Ghanaian music and dance style known for expressive movements that tell stories through rhythm.","clues":["This country sits on the west coast of Africa, with a warm tropical climate and a long Atlantic coastline.","In 1957, it became the first country in sub-Saharan Africa to gain independence — a proud moment for the whole continent.","Its hugely popular music and dance style swept the world — where every move you make tells a story through rhythm."]},{"country":"Indonesia","style":"Gamelan","flag":"🇮🇩","audio":"music/INDONESIA.wav","image":"art/country_images/Ivan Maulana Malik Ibrahim_Indonesia.jpg","fact":"Gamelan is an ensemble of gongs, drums, and metallophones that create layered, shimmering rhythms.","clues":["This is the world's largest archipelago — a country made up of over 17,000 islands in Southeast Asia.","Its islands include Bali, Java, and Sumatra, stretching across the sea between the Pacific and Indian Oceans.","Its ancient orchestra uses bronze gongs, wooden drums, and bell-like metal bars to build shimmering, layered sound."]},{"country":"Italy","style":"Opera","flag":"🇮🇹","audio":"music/ITALY.wav","image":"art/country_images/Etorre Sapienza_Italy.jpg","image2":"art/country_images/Michele Boni_Italy.jpg","fact":"Opera began in Italy around 1600 - combining singing, acting, and orchestral music into dramatic performances.","clues":["This southern European country is shaped like a boot kicking into the Mediterranean Sea.","It is home to the Colosseum, the Leaning Tower of Pisa, pizza, pasta, and some of the world's greatest art.","Around 400 years ago, musicians here invented a dramatic new art form — where singers act out powerful stories on stage."]},{"country":"Jamaica","style":"Reggae","flag":"🇯🇲","audio":"music/JAMAICA.wav","image":"art/country_images/Jelliss_Jamica.jpg","fact":"Reggae developed in Jamaica in the late 1960s - known for its offbeat rhythms and messages of unity and social change.","clues":["This island nation in the Caribbean Sea lies south of Cuba, known for its mountains, jerk chicken, and warm people.","It has produced world-famous athletes and musicians who have shaped global culture far beyond its small size.","In the late 1960s, a laid-back music style full of offbeat rhythms and messages of peace and unity was born here."]},{"country":"Japan","style":"Shakuhachi","flag":"🇯🇵","audio":"music/JAPAN.wav","image":"art/country_images/Seimo Yamaguchi_Japan.jpg","fact":"The shakuhachi is a traditional Japanese bamboo flute known for its soft, breathy sound often used in meditation music.","clues":["This island nation in East Asia has four main islands and thousands of smaller ones, with Mount Fuji at its heart.","It is famous for ancient temples, cherry blossom season, bullet trains, sushi, and manga comics.","One of its most ancient instruments is a simple bamboo flute — its breathy, flowing sound is used in peaceful meditation."]},{"country":"Kenya","style":"Benga","flag":"🇰🇪","audio":"music/KENYA.wav","image":"art/country_images/Rodgers Bob_Kenya.jpg","fact":"Benga music blends Luo traditional rhythms with electric guitar - a popular and energetic style in Kenya.","clues":["This East African country sits right on the equator, home to the Maasai Mara and the Big Five wild animals.","It is world-famous for its long-distance runners — athletes from here have won countless Olympic medals.","Its vibrant popular music mixes the traditional rhythms of the Luo people with electric guitar for an infectious, upbeat sound."]},{"country":"Mexico","style":"Mariachi","flag":"🇲🇽","audio":"music/MEXICO.wav","image":"art/country_images/Rigoberto Baez_Los Mochis.jpg","fact":"Mariachi music features guitars, trumpets, and violins - commonly played at celebrations across Mexico.","clues":["This North American country borders the United States to the north and is home to ancient Aztec and Maya civilisations.","It is famous for the Day of the Dead festival, colourful markets, chocolate, chillies, and vibrant street culture.","At every birthday, wedding, and fiesta you'll hear a band of musicians in wide-brimmed hats playing guitars, trumpets, and violins."]},{"country":"Nepal","style":"Sarangi","flag":"🇳🇵","audio":"music/NEPAL.wav","image":"art/country_images/Aruna Gandharba_Nepal.jpg","fact":"The sarangi is a traditional Nepali string instrument played with a bow, known for its expressive, voice-like sound.","clues":["This landlocked country in Asia is home to the highest mountains on Earth — including the tallest of all.","Eight of the world's ten highest peaks, including Mount Everest, rise within its borders.","A traditional bowed string instrument here produces a rich, singing tone — passed down for centuries by travelling musicians."]},{"country":"Peru","style":"Indigenous Flutes","flag":"🇵🇪","audio":"music/PERU.wav","image":"art/country_images/Carlos Carty_Peru.jpg","fact":"Peruvian Andean music features indigenous flutes like the panpipe, creating airy, mountain-inspired melodies.","clues":["This South American country runs along the Pacific coast and contains some of the highest plateaus on the planet.","It was the heart of the mighty Inca Empire, and the ancient mountaintop city of Machu Picchu still stands here today.","High in the Andes, indigenous musicians play bundled-pipe flutes that produce an airy sound like wind through the mountains."]},{"country":"South Africa","style":"Goema","flag":"🇿🇦","audio":"music/SOUTH AFRICA_1.2.wav","image":"art/country_images/Chris Murray_South Africa.jpg","fact":"Goema is a rhythmic music style from Cape Town, rooted in street parades and local cultural traditions.","clues":["This country sits at the very southern tip of the African continent, where two great oceans meet.","It has three capital cities and is famous for its wildlife, including the Big Five, in its national parks.","Every new year, the streets of its oldest and most beautiful city fill with colourful parades and infectious drum rhythms."]},{"country":"South Korea","style":"K-pop","flag":"🇰🇷","audio":"music/SOUTH KOREA.wav","image":"art/country_images/Young illy_South Korea.jpg","fact":"K-pop blends pop, hip-hop, and dance - and has become a global music phenomenon.","clues":["This country occupies the southern half of a peninsula in East Asia, surrounded by sea on three sides.","It is famous for its technology brands, kimchi, bibimbap, and one of the most passionate fan cultures in the world.","Its music industry launched a global takeover — perfectly choreographed pop groups selling out stadiums on every continent."]},{"country":"Spain","style":"Flamenco","flag":"🇪🇸","audio":"music/SPAIN1.2.wav","image":"art/country_images/Pablo Dominguez_Spain.jpg","fact":"Flamenco combines singing, guitar, dancing, and rhythmic clapping - rooted in Andalusian culture.","clues":["This country sits on the Iberian Peninsula in southwestern Europe, with both the Atlantic Ocean and Mediterranean Sea as its neighbours.","It is famous for its festivals, tapas, bullfighting traditions, and a warm southern region called Andalusia.","From that southern region comes a fiery art form — guitar, singing, stamping feet, and rhythmic hand-clapping all at once."]},{"country":"Sri Lanka","style":"Sitar & Tabla","flag":"🇱🇰","audio":"music/SRI LANKA_1.1.wav","image":"art/country_images/Mahesh Pathumkumara_Sri_Lanka.jpg","fact":"Sri Lankan music often features instruments like the sitar and tabla, blending melody with intricate hand-played rhythms.","clues":["This teardrop-shaped island sits just off the southern tip of India in the warm waters of the Indian Ocean.","It is famous for its tea plantations, ancient Buddhist temples, tropical rainforests, elephants, and leopards.","Its music weaves together a long-necked string instrument and a pair of hand-played drums into intricate, hypnotic rhythms."]},{"country":"Switzerland","style":"Alphorn","flag":"🇨🇭","audio":"music/SWISS.wav","image":"art/country_images/Enrico Lenzin_Switzerland.jpg","fact":"The alphorn is a long wooden horn used in the Swiss Alps, producing deep, resonant tones that carry across mountains.","clues":["This small landlocked country in central Europe is ringed by the Alps and borders France, Germany, Italy, and Austria.","It is famous for its chocolate, cheese with holes in it, cuckoo clocks, precise watches, and stunning mountain scenery.","Mountain shepherds here once used a very long wooden horn — sometimes 4 metres! — to call across the snowy Alpine valleys."]},{"country":"United Kingdom","style":"Orchestral Music","flag":"🇬🇧","audio":"music/UK.wav","image":"art/country_images/Daniel Squires_England.jpg","fact":"The UK is home to some of the world's oldest orchestras - the BBC Symphony Orchestra was founded in 1930, and the London Symphony Orchestra dates back to 1904, making it one of the longest-running in the world.","clues":["This nation is made up of four countries — England, Scotland, Wales, and Northern Ireland — on islands off northwest Europe.","Its capital, London, is home to Buckingham Palace, the Tower of London, red double-decker buses, and the River Thames.","London has nurtured some of the world's greatest orchestras for over a century — one has been playing since 1904."]},{"country":"U.S.A.","style":"Jazz & Blues","flag":"🇺🇸","audio":"music/NEW ORLEANS.wav","image":"art/country_images/Isamael Muniz_Usa.jpg","fact":"Jazz and blues began in the United States in the early 1900s - blending African and European musical traditions.","clues":["This large country in North America stretches from the Atlantic to the Pacific Ocean and is made up of 50 states.","One of its most musical cities sits on the Gulf of Mexico in the south — famous for food, festivals, and street performers.","In the early 1900s, that city gave birth to a soulful, improvised music style born from African and European traditions meeting."]}]`);
const FACTS = musicMatchData;
const PALETTE = ["#FF4EAB", "#3B82F6", "#FBBF24", "#22C55E", "#FB923C", "#EF4444"];
function flagCdnUrl(flag) {
  const codes = [...flag].map((c2) => c2.codePointAt(0) - 127462 + 97);
  if (codes.some((c2) => c2 < 97 || c2 > 122)) return "";
  const code = String.fromCharCode(...codes);
  return `https://flagcdn.com/w160/${code}.png`;
}
const CDN = "https://cdn.jsdelivr.net/npm/openmoji@15.1.0/color/svg";
const EMOJI = {
  check: "2705",
  cross: "274C",
  fire: "1F525",
  star: "2B50",
  music: "1F3B5",
  globe: "1F30D",
  trophy: "1F3C6",
  party: "1F389"
};
function OpenMoji({ name: name2, size = 32, alt = "", style, ...rest }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.img,
    {
      src: `${CDN}/${EMOJI[name2]}.svg`,
      alt,
      width: size,
      height: size,
      draggable: false,
      style: { display: "inline-block", width: size, height: size, ...style },
      ...rest
    }
  );
}
const EXCLAMATION_SRCS = [exclamHurray, exclamWayToGo, exclamYouDidIt, exclamYouGotIt];
const LOTTIE = {
  sparkle: "https://assets2.lottiefiles.com/packages/lf20_obhph3sh.json",
  flame: "https://assets10.lottiefiles.com/packages/lf20_4kx2q32n.json",
  fireworks: "https://assets3.lottiefiles.com/packages/lf20_u4yrau.json"
};
function shuffle(items) {
  const copy = [...items];
  for (let i2 = copy.length - 1; i2 > 0; i2--) {
    const j2 = Math.floor(Math.random() * (i2 + 1));
    [copy[i2], copy[j2]] = [copy[j2], copy[i2]];
  }
  return copy;
}
function pickChoices(correct, all) {
  const choices = [correct];
  shuffle(all.filter((f2) => f2.country !== correct.country)).forEach((f2) => {
    if (choices.length < 4) choices.push(f2);
  });
  return shuffle(choices);
}
function fmtTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m2 = Math.floor(seconds / 60);
  const s2 = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m2}:${s2}`;
}
const palette = PALETTE;
const colorAt = (i2) => palette[i2 % palette.length];
function buildTimedClues(round) {
  return round.clues;
}
function musicFlagStyle(flag) {
  if (flag === "🇳🇵") return void 0;
  return { border: "2px solid #1a1a1a" };
}
function musicFlagClassName(flag, size) {
  if (flag === "🇳🇵") {
    return size === "medium" ? "h-8 w-auto max-w-12 object-contain" : "h-6 w-auto max-w-9 object-contain";
  }
  return size === "medium" ? "h-8 w-12 rounded-sm object-cover" : "h-6 w-9 rounded-sm object-cover";
}
const BG_CHARACTERS = [
  "/characters/guitar-jaime-jeff.png",
  "/characters/horns-jaime-jeff.png",
  "/characters/guitar2-jaime-jeff.png"
];
const BG_INSTANCES = [
  { src: BG_CHARACTERS[0], top: "2%", left: "1%", height: 180, rotate: -8 },
  { src: BG_CHARACTERS[1], top: "5%", left: "72%", height: 160, rotate: 6 },
  { src: BG_CHARACTERS[2], top: "1%", left: "38%", height: 170, rotate: -4 },
  { src: BG_CHARACTERS[0], top: "38%", left: "-2%", height: 200, rotate: 10 },
  { src: BG_CHARACTERS[1], top: "35%", left: "80%", height: 175, rotate: -7 },
  { src: BG_CHARACTERS[2], top: "55%", left: "45%", height: 165, rotate: 5 },
  { src: BG_CHARACTERS[0], top: "68%", left: "18%", height: 190, rotate: -5 },
  { src: BG_CHARACTERS[1], top: "72%", left: "62%", height: 180, rotate: 8 },
  { src: BG_CHARACTERS[2], top: "82%", left: "-1%", height: 170, rotate: -9 },
  { src: BG_CHARACTERS[0], top: "80%", left: "78%", height: 185, rotate: 4 },
  { src: BG_CHARACTERS[1], top: "20%", left: "25%", height: 155, rotate: -6 },
  { src: BG_CHARACTERS[2], top: "50%", left: "88%", height: 160, rotate: 7 }
];
function BackgroundCircles() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none fixed inset-0 z-[1] overflow-hidden", children: BG_INSTANCES.map((c2, i2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src: c2.src,
      alt: "",
      style: {
        position: "absolute",
        top: c2.top,
        left: c2.left,
        height: c2.height,
        width: "auto",
        transform: `rotate(${c2.rotate}deg)`,
        opacity: 0.22,
        filter: "sepia(40%) saturate(70%) brightness(0.97)",
        objectFit: "contain"
      }
    },
    i2
  )) });
}
function Multicolor({ text: text2, className = "", offset = 0 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `chunky-text ${className}`, children: [...text2].map((ch, i2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: ch === " " ? "transparent" : colorAt(i2 + offset) }, children: ch }, i2)) });
}
function blockToastStyle(c2) {
  return {
    background: c2,
    color: "#1a1a1a",
    border: "3px solid #1a1a1a",
    borderBottomWidth: 6,
    borderRightWidth: 5,
    borderRadius: 14,
    fontFamily: '"Baloo 2", system-ui, sans-serif',
    fontWeight: 800,
    padding: "10px 14px",
    boxShadow: "none"
  };
}
function showCorrectToast() {
  zt.custom(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: blockToastStyle("#22C55E"), className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(OpenMoji, { name: "check", size: 28 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nice match!" })
  ] }));
}
function showWrongToast(correctCountry) {
  zt.custom(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: blockToastStyle("#EF4444"), className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(OpenMoji, { name: "cross", size: 28 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      "Not quite — it was ",
      correctCountry,
      "."
    ] })
  ] }));
}
function showStreakToast(streak) {
  zt.custom(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: blockToastStyle("#FBBF24"), className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(OpenMoji, { name: "fire", size: 28 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      streak,
      " in a row!"
    ] })
  ] }));
}
function JanglesGame() {
  const [view, setView] = reactExports.useState("play");
  const [phase, setPhase] = reactExports.useState("boot");
  const [rounds, setRounds] = reactExports.useState([]);
  const [choicesByRound, setChoicesByRound] = reactExports.useState([]);
  const [roundStatuses, setRoundStatuses] = reactExports.useState([]);
  const [currentRound, setCurrentRound] = reactExports.useState(0);
  const [score, setScore] = reactExports.useState(0);
  const [streak, setStreak] = reactExports.useState(0);
  const [answered, setAnswered] = reactExports.useState(false);
  const [missedThisRound, setMissedThisRound] = reactExports.useState(false);
  const [wrongPicks, setWrongPicks] = reactExports.useState(/* @__PURE__ */ new Set());
  const [showSparkle, setShowSparkle] = reactExports.useState(false);
  const [showFlame, setShowFlame] = reactExports.useState(false);
  const [, addStamps] = useStamps();
  const audioRef = reactExports.useRef(null);
  const exclamQueueRef = reactExports.useRef([]);
  function playExclamation() {
    if (exclamQueueRef.current.length === 0) {
      exclamQueueRef.current = shuffle([...EXCLAMATION_SRCS]);
    }
    const src = exclamQueueRef.current.shift();
    new Audio(src).play().catch(() => void 0);
  }
  const [isPlaying, setIsPlaying] = reactExports.useState(false);
  const [audioErr, setAudioErr] = reactExports.useState(null);
  const [currentTime, setCurrentTime] = reactExports.useState(0);
  const [duration, setDuration] = reactExports.useState(0);
  const round = rounds[currentRound];
  const choices = choicesByRound[currentRound] ?? [];
  const isLast = currentRound === rounds.length - 1;
  const startGame = reactExports.useCallback(() => {
    const r = shuffle(FACTS.filter((f2) => f2.audio));
    const c2 = r.map((round2) => pickChoices(round2, FACTS));
    setRounds(r);
    setChoicesByRound(c2);
    setRoundStatuses(r.map(() => "pending"));
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setMissedThisRound(false);
    setWrongPicks(/* @__PURE__ */ new Set());
    setAudioErr(null);
    setPhase("play");
  }, []);
  const resetToBoot = reactExports.useCallback(() => {
    setPhase("boot");
    setRounds([]);
    setRoundStatuses([]);
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setMissedThisRound(false);
    setWrongPicks(/* @__PURE__ */ new Set());
  }, []);
  const handlePick = reactExports.useCallback(
    (country) => {
      if (answered || !round) return;
      const isCorrect = country === round.country;
      if (!isCorrect) {
        setMissedThisRound(true);
        setStreak(0);
        setWrongPicks((s2) => new Set(s2).add(country));
        showWrongToast(round.country);
        return;
      }
      setAnswered(true);
      setRoundStatuses(
        (statuses) => statuses.map(
          (status, index2) => index2 === currentRound ? missedThisRound ? "wrong" : "correct" : status
        )
      );
      playExclamation();
      if (!missedThisRound) {
        const newScore = score + 1;
        const newStreak = streak + 1;
        setScore(newScore);
        setStreak(newStreak);
        burstCorrect();
        setShowSparkle(true);
        window.setTimeout(() => setShowSparkle(false), 1400);
        showCorrectToast();
        if (newStreak > 0 && newStreak % 5 === 0) {
          showStreakToast(newStreak);
          setShowFlame(true);
          window.setTimeout(() => setShowFlame(false), 1600);
        }
      } else {
        showCorrectToast();
      }
    },
    [answered, currentRound, round, missedThisRound, score, streak]
  );
  const goNext = reactExports.useCallback(() => {
    if (currentRound >= rounds.length - 1) {
      setPhase("result");
      addStamps(score);
      burstFinale();
      return;
    }
    setCurrentRound((i2) => i2 + 1);
    setAnswered(false);
    setMissedThisRound(false);
    setWrongPicks(/* @__PURE__ */ new Set());
    setAudioErr(null);
    setCurrentTime(0);
    setDuration(0);
  }, [currentRound, rounds.length, score, addStamps]);
  reactExports.useEffect(() => {
    const a2 = audioRef.current;
    if (!a2 || !round) return;
    a2.src = "/" + encodeURI(round.audio);
    a2.load();
    setIsPlaying(false);
  }, [round]);
  reactExports.useEffect(() => {
    const a2 = audioRef.current;
    if (!a2) return;
    const onTime = () => {
      setCurrentTime(a2.currentTime);
      setDuration(a2.duration || 0);
    };
    const onMeta = () => setDuration(a2.duration || 0);
    const onEnd = () => setIsPlaying(false);
    const onErr = () => setAudioErr(round ? `The music file for ${round.country} could not load.` : "Audio failed to load.");
    a2.addEventListener("timeupdate", onTime);
    a2.addEventListener("loadedmetadata", onMeta);
    a2.addEventListener("ended", onEnd);
    a2.addEventListener("error", onErr);
    return () => {
      a2.removeEventListener("timeupdate", onTime);
      a2.removeEventListener("loadedmetadata", onMeta);
      a2.removeEventListener("ended", onEnd);
      a2.removeEventListener("error", onErr);
    };
  }, [round]);
  const togglePlay = reactExports.useCallback(async () => {
    const a2 = audioRef.current;
    if (!a2) return;
    if (a2.paused) {
      try {
        await a2.play();
        setIsPlaying(true);
        setAudioErr(null);
      } catch {
        setAudioErr("This music could not start. Tap the play button again.");
      }
    } else {
      a2.pause();
      setIsPlaying(false);
    }
  }, []);
  const seek = (e2) => {
    const a2 = audioRef.current;
    if (!a2 || !Number.isFinite(a2.duration)) return;
    const rect = e2.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e2.clientX - rect.left) / rect.width));
    a2.currentTime = ratio * a2.duration;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen text-ink", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackgroundCircles, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-[2]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Fe, { position: "top-center", toastOptions: { duration: 2200 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
        showSparkle && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "pointer-events-none fixed inset-0 z-40 flex items-center justify-center",
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Player, { autoplay: true, keepLastFrame: false, src: LOTTIE.sparkle, style: { height: 320, width: 320 } })
          },
          "sparkle"
        ),
        showFlame && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2",
            initial: { scale: 0 },
            animate: { scale: 1 },
            exit: { scale: 0 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Player, { autoplay: true, keepLastFrame: false, src: LOTTIE.flame, style: { height: 160, width: 160 } })
          },
          "flame"
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-5xl items-center gap-3 px-4 pt-3 sm:pt-4", children: [
        phase !== "boot" && /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: view === "play", onClick: () => setView("play"), color: "#FF4EAB", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(OpenMoji, { name: "music", size: 20 }),
            " Play"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: view === "facts", onClick: () => setView("facts"), color: "#3B82F6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(OpenMoji, { name: "globe", size: 20 }),
            " Facts"
          ] })
        ] }),
        phase === "play" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StopsPanel, { roundIndex: currentRound, total: rounds.length, roundStatuses }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: "🎫", value: `${score}/${rounds.length}`, bg: "#FFF8E0", color: "#1a1a1a" }),
          streak > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: "🔥", value: String(streak), bg: "#FFECEC", color: "#EF4444" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-5xl px-4 pb-6 pt-3 sm:pb-10 sm:pt-4", children: view === "facts" ? /* @__PURE__ */ jsxRuntimeExports.jsx(FactsView, { onResetGame: resetToBoot }) : phase === "boot" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BootScreen, { onStart: startGame }) : phase === "result" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        ResultScreen,
        {
          score,
          total: rounds.length,
          onReplay: startGame,
          onLearn: () => setView("facts")
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        PlayScreen,
        {
          round,
          choices,
          roundIndex: currentRound,
          totalRounds: rounds.length,
          roundStatuses,
          score,
          streak,
          answered,
          missedThisRound,
          wrongPicks,
          isLast,
          onPick: handlePick,
          onNext: goNext,
          onTryAgain: () => {
          },
          isPlaying,
          togglePlay,
          currentTime,
          duration,
          audioErr,
          seek,
          audioRef
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { ref: audioRef, preload: "auto", playsInline: true })
    ] })
  ] });
}
function StatChip({ icon, value: value2, bg, color }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-black",
      style: { background: bg, color, border: "3px solid #1a1a1a", borderBottomWidth: 5, borderRightWidth: 4 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value2 })
      ]
    }
  );
}
function TabButton({
  active: active2,
  onClick,
  color,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.button,
    {
      type: "button",
      onClick,
      whileTap: { y: 3 },
      className: "block-btn flex items-center gap-2 !py-2 !px-3 text-sm sm:text-base",
      style: { ["--c"]: active2 ? color : "#FFFBF0", opacity: active2 ? 1 : 0.85 },
      children
    }
  );
}
function BootScreen({ onStart }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center gap-4 text-center sm:min-h-[calc(100dvh-7.5rem)] sm:gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        animate: { rotate: 360 },
        transition: { repeat: Infinity, duration: 9, ease: "linear" },
        className: "w-[340px] sm:w-[420px]",
        style: {
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          position: "relative",
          background: `
            radial-gradient(circle at 42% 38%, rgba(255,255,255,0.07) 0%, transparent 45%),
            repeating-radial-gradient(circle at 50% 50%,
              #0d0d0d 0px, #0d0d0d 2px,
              #1e1e1e 2px, #1e1e1e 4px,
              #141414 4px, #141414 5.5px)
          `,
          boxShadow: "0 10px 40px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: "72%",
            height: "72%",
            borderRadius: "50%",
            background: "#FFF3CD",
            border: "3px solid rgba(0,0,0,0.15)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 12px rgba(0,0,0,0.1)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: "/art/jangles international orchestra (WHITE BACKGROUND).png.jpg",
              alt: "Jangles International Orchestra",
              style: { width: "90%", height: "90%", objectFit: "contain", display: "block", mixBlendMode: "multiply" }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#d6cbb8",
            border: "1px solid #888",
            zIndex: 2
          } })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/art/world_tour.png", alt: "The World Tour", className: "h-20 sm:h-28" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-md text-base leading-snug text-ink/80 sm:text-lg", children: "Travel the world through music. Listen to a clip and guess the country it comes from!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        type: "button",
        onClick: onStart,
        whileTap: { y: 3 },
        whileHover: { scale: 1.03 },
        className: "block-btn !px-8 !py-3 !text-xl sm:!px-10 sm:!py-4 sm:!text-2xl",
        style: { ["--c"]: "#FF4EAB", color: "#fff" },
        children: "Start Game"
      }
    )
  ] });
}
function StopsPanel({
  roundIndex,
  total,
  roundStatuses
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: Array.from({ length: total }, (_2, index2) => {
    const status = roundStatuses[index2] ?? "pending";
    const isCurrent = index2 === roundIndex;
    const background = status === "correct" ? "#22C55E" : status === "wrong" ? "#EF4444" : isCurrent ? "#FBBF24" : "#fff";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-4 w-4 rounded-full",
        style: { background, border: "3px solid #1a1a1a", borderBottomWidth: 4, borderRightWidth: 4 },
        "aria-label": `Stop ${index2 + 1} ${status}`
      },
      index2
    );
  }) });
}
function PlayScreen(p2) {
  if (!p2.round) return null;
  const showFeedback = p2.answered;
  const revealedClueCount = Math.min(3, Math.floor(p2.currentTime / 3));
  const CLUE_EMOJIS = ["🎵", "📖", "💡"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-col gap-3 sm:gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-3 sm:p-4", style: { border: "3px solid #1a1a1a", borderBottomWidth: 6, borderRightWidth: 5 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm uppercase tracking-wide text-ink/60", children: [
        "Stop ",
        p2.roundIndex + 1
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-black text-ink sm:text-2xl", children: showFeedback ? /* @__PURE__ */ jsxRuntimeExports.jsx(Multicolor, { text: p2.round.country }) : "What country is this music from?" }),
      !showFeedback && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-ink/70 sm:text-base", children: p2.audioErr ?? (p2.missedThisRound ? "Not that country. Try another!" : "Play the music, then choose one of the four countries.") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-col gap-2.5 sm:gap-3", children: [
        !showFeedback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-[#FFF8E1] p-2.5 sm:p-3", style: { border: "2px solid #1a1a1a" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black uppercase tracking-wide text-ink/70", children: "🔍 Clues" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid gap-1.5 sm:gap-2", children: buildTimedClues(p2.round).map((clue, i2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: false,
              animate: i2 < revealedClueCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 },
              transition: { duration: 0.32 },
              className: "grid items-start gap-2 rounded-xl bg-[#FFFBF0] px-3 py-2 text-sm font-bold leading-snug text-ink/85",
              style: { gridTemplateColumns: "auto 1fr", border: "2px solid #1a1a1a", borderLeft: "4px solid #FBBF24" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-snug", children: CLUE_EMOJIS[i2] ?? "💡" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: clue })
              ]
            },
            clue
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 rounded-2xl bg-white p-2.5 sm:gap-3 sm:p-3", style: { border: "3px solid #1a1a1a", borderBottomWidth: 6, borderRightWidth: 5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              type: "button",
              onClick: p2.togglePlay,
              whileTap: { scale: 0.92 },
              whileHover: { scale: 1.05 },
              className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14",
              style: { background: "#FBBF24", border: "3px solid #1a1a1a", borderBottomWidth: 6, borderRightWidth: 5 },
              "aria-label": p2.isPlaying ? "Pause audio" : "Play audio",
              children: p2.isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "❚❚" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "▶" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              WaveformVisualizer,
              {
                audioRef: p2.audioRef,
                isPlaying: p2.isPlaying,
                currentTime: p2.currentTime,
                duration: p2.duration,
                onSeek: p2.seek
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex justify-between text-xs text-ink/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtTime(p2.currentTime) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtTime(p2.duration) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showFeedback && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0 },
          className: "mt-5 grid gap-4 sm:grid-cols-[auto_1fr]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [p2.round.image, p2.round.image2].filter(Boolean).map((src, i2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/" + src,
                alt: `Artist from ${p2.round.country}`,
                onError: (e2) => {
                  e2.currentTarget.src = "/art/styleimage_a.png";
                },
                className: "h-32 w-32 rounded-2xl object-cover sm:h-40 sm:w-40",
                style: { border: "3px solid #1a1a1a", borderBottomWidth: 6, borderRightWidth: 5 }
              },
              i2
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xl", children: [
                flagCdnUrl(p2.round.flag) && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: flagCdnUrl(p2.round.flag), alt: "", className: "h-6 w-9 rounded-sm", style: { border: "2px solid #1a1a1a" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold", children: p2.round.country })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "mt-1 inline-block rounded-full px-3 py-1 text-sm",
                  style: { background: "#FBBF24", border: "3px solid #1a1a1a" },
                  children: p2.round.style
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 leading-relaxed text-ink/85", children: p2.round.fact })
            ] })
          ]
        }
      ) })
    ] }),
    !showFeedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2.5 sm:gap-3", children: p2.choices.map((c2, i2) => {
      const isWrong = p2.wrongPicks.has(c2.country);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.button,
        {
          type: "button",
          disabled: isWrong,
          onClick: () => p2.onPick(c2.country),
          whileHover: isWrong ? void 0 : { y: -4 },
          whileTap: isWrong ? void 0 : { scale: 0.95 },
          animate: isWrong ? { x: [-8, 8, -8, 8, 0], backgroundColor: "#EF4444" } : {},
          transition: { duration: 0.4 },
          className: "block-card flex items-center gap-2 px-3 py-3 text-left text-base sm:gap-3 sm:px-4 sm:py-4 sm:text-lg",
          style: { ["--c"]: isWrong ? "#EF4444" : colorAt(i2 + p2.roundIndex), opacity: isWrong ? 0.7 : 1 },
          children: [
            flagCdnUrl(c2.flag) && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: flagCdnUrl(c2.flag), alt: "", className: musicFlagClassName(c2.flag, "medium"), style: musicFlagStyle(c2.flag) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-extrabold", children: c2.country })
          ]
        },
        c2.country
      );
    }) }),
    showFeedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.button,
      {
        type: "button",
        onClick: p2.onNext,
        whileTap: { y: 3 },
        whileHover: { scale: 1.03 },
        className: "block-btn",
        style: { ["--c"]: "#22C55E", color: "#fff" },
        children: p2.isLast ? "Finish Tour" : "Next Stop →"
      }
    ) })
  ] });
}
function ResultScreen({
  score,
  total,
  onReplay,
  onLearn
}) {
  const percent = total ? Math.round(score / total * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-col items-center gap-6 pt-4 text-center sm:gap-8 sm:pt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Player, { autoplay: true, loop: true, src: LOTTIE.fireworks, style: { height: 240, width: 240 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl sm:text-5xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Multicolor, { text: "Tour Complete!" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl sm:text-8xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Multicolor, { text: `${score}/${total}`, className: "chunky-text-lg" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "max-w-md text-lg text-ink/80", children: [
      "You identified ",
      percent,
      "% of the music stops on the first try."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.button,
        {
          type: "button",
          onClick: onReplay,
          whileTap: { y: 3 },
          whileHover: { scale: 1.03 },
          className: "block-btn",
          style: { ["--c"]: "#FF4EAB", color: "#fff" },
          children: "Play again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.button,
        {
          type: "button",
          onClick: onLearn,
          whileTap: { y: 3 },
          whileHover: { scale: 1.03 },
          className: "block-btn",
          style: { ["--c"]: "#3B82F6", color: "#fff" },
          children: "Learn more"
        }
      )
    ] })
  ] });
}
function FactsView({ onResetGame }) {
  const sorted = reactExports.useMemo(() => [...FACTS].sort((a2, b) => a2.country.localeCompare(b.country)), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg", children: [
        FACTS.length,
        " tour stops to learn"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.button,
        {
          type: "button",
          onClick: onResetGame,
          whileTap: { y: 3 },
          className: "block-btn !text-base !py-2",
          style: { ["--c"]: "#FBBF24" },
          children: "Reset game"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: sorted.map((item, i2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "article",
      {
        className: "block-card overflow-hidden p-0",
        style: { ["--c"]: "#fff" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 bg-paper", children: [item.image, item.image2].filter(Boolean).map((src, j2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: "/" + src,
              alt: `Artist from ${item.country}`,
              onError: (e2) => {
                e2.currentTarget.src = "/art/styleimage_a.png";
              },
              className: "h-40 w-full object-cover"
            },
            j2
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              flagCdnUrl(item.flag) && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: flagCdnUrl(item.flag), alt: "", className: "h-6 w-9 rounded-sm", style: { border: "2px solid #1a1a1a" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-extrabold text-ink", children: item.country })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "mt-2 inline-block rounded-full px-3 py-1 text-sm",
                style: { background: colorAt(i2 + 2), border: "3px solid #1a1a1a" },
                children: item.style
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-ink/85", children: item.fact })
          ] })
        ]
      },
      item.country
    )) })
  ] });
}
function MusicMatchRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(JanglesGame, {});
}
export {
  MusicMatchRoute as component
};
