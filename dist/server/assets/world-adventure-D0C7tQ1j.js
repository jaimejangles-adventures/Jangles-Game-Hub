import { a1 as getDefaultExportFromCjs, r as reactExports, U as React, V as jsxRuntimeExports } from "./server-HtPeGmJD.js";
import { u as useStamps, b as burstFinale, m as motion, a as burstCorrect, e as exclamHurray, c as exclamWayToGo, d as exclamYouDidIt, f as exclamYouGotIt } from "./JEFF_-_Exclamations_-_You_got_it_-DDyK2YH4.js";
import { A as AnimatePresence } from "./index-BPt5m5eS.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
var propTypes = { exports: {} };
var ReactPropTypesSecret_1;
var hasRequiredReactPropTypesSecret;
function requireReactPropTypesSecret() {
  if (hasRequiredReactPropTypesSecret) return ReactPropTypesSecret_1;
  hasRequiredReactPropTypesSecret = 1;
  var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  ReactPropTypesSecret_1 = ReactPropTypesSecret;
  return ReactPropTypesSecret_1;
}
var factoryWithThrowingShims;
var hasRequiredFactoryWithThrowingShims;
function requireFactoryWithThrowingShims() {
  if (hasRequiredFactoryWithThrowingShims) return factoryWithThrowingShims;
  hasRequiredFactoryWithThrowingShims = 1;
  var ReactPropTypesSecret = /* @__PURE__ */ requireReactPropTypesSecret();
  function emptyFunction() {
  }
  function emptyFunctionWithReset() {
  }
  emptyFunctionWithReset.resetWarningCache = emptyFunction;
  factoryWithThrowingShims = function() {
    function shim(props, propName, componentName, location, propFullName, secret) {
      if (secret === ReactPropTypesSecret) {
        return;
      }
      var err = new Error(
        "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
      );
      err.name = "Invariant Violation";
      throw err;
    }
    shim.isRequired = shim;
    function getShim() {
      return shim;
    }
    var ReactPropTypes = {
      array: shim,
      bigint: shim,
      bool: shim,
      func: shim,
      number: shim,
      object: shim,
      string: shim,
      symbol: shim,
      any: shim,
      arrayOf: getShim,
      element: shim,
      elementType: shim,
      instanceOf: getShim,
      node: shim,
      objectOf: getShim,
      oneOf: getShim,
      oneOfType: getShim,
      shape: getShim,
      exact: getShim,
      checkPropTypes: emptyFunctionWithReset,
      resetWarningCache: emptyFunction
    };
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };
  return factoryWithThrowingShims;
}
var hasRequiredPropTypes;
function requirePropTypes() {
  if (hasRequiredPropTypes) return propTypes.exports;
  hasRequiredPropTypes = 1;
  {
    propTypes.exports = /* @__PURE__ */ requireFactoryWithThrowingShims()();
  }
  return propTypes.exports;
}
var propTypesExports = /* @__PURE__ */ requirePropTypes();
const PropTypes = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo) p[i++] = lo;
      x = hi;
    }
    p[i] = x;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x, y, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo) break;
      }
      if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi) hi = x;
      }
    }
    return hi;
  }
}
function* flatten(arrays) {
  for (const array2 of arrays) {
    yield* array2;
  }
}
function merge(arrays) {
  return Array.from(flatten(arrays));
}
function range$1(start2, stop, step) {
  start2 = +start2, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start2 + i * step;
  }
  return range2;
}
var epsilon = 1e-6;
var epsilon2$1 = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var quarterPi = pi / 4;
var tau = pi * 2;
var degrees$1 = 180 / pi;
var radians = pi / 180;
var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;
var ceil = Math.ceil;
var exp = Math.exp;
var hypot = Math.hypot;
var log = Math.log;
var pow = Math.pow;
var sin = Math.sin;
var sign = Math.sign || function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};
var sqrt = Math.sqrt;
var tan = Math.tan;
function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}
function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}
function haversin(x) {
  return (x = sin(x / 2)) * x;
}
function noop$1() {
}
function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}
var streamObjectType = {
  Feature: function(object2, stream) {
    streamGeometry(object2.geometry, stream);
  },
  FeatureCollection: function(object2, stream) {
    var features = object2.features, i = -1, n = features.length;
    while (++i < n) streamGeometry(features[i].geometry, stream);
  }
};
var streamGeometryType = {
  Sphere: function(object2, stream) {
    stream.sphere();
  },
  Point: function(object2, stream) {
    object2 = object2.coordinates;
    stream.point(object2[0], object2[1], object2[2]);
  },
  MultiPoint: function(object2, stream) {
    var coordinates2 = object2.coordinates, i = -1, n = coordinates2.length;
    while (++i < n) object2 = coordinates2[i], stream.point(object2[0], object2[1], object2[2]);
  },
  LineString: function(object2, stream) {
    streamLine(object2.coordinates, stream, 0);
  },
  MultiLineString: function(object2, stream) {
    var coordinates2 = object2.coordinates, i = -1, n = coordinates2.length;
    while (++i < n) streamLine(coordinates2[i], stream, 0);
  },
  Polygon: function(object2, stream) {
    streamPolygon(object2.coordinates, stream);
  },
  MultiPolygon: function(object2, stream) {
    var coordinates2 = object2.coordinates, i = -1, n = coordinates2.length;
    while (++i < n) streamPolygon(coordinates2[i], stream);
  },
  GeometryCollection: function(object2, stream) {
    var geometries = object2.geometries, i = -1, n = geometries.length;
    while (++i < n) streamGeometry(geometries[i], stream);
  }
};
function streamLine(coordinates2, stream, closed) {
  var i = -1, n = coordinates2.length - closed, coordinate;
  stream.lineStart();
  while (++i < n) coordinate = coordinates2[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}
function streamPolygon(coordinates2, stream) {
  var i = -1, n = coordinates2.length;
  stream.polygonStart();
  while (++i < n) streamLine(coordinates2[i], stream, 1);
  stream.polygonEnd();
}
function geoStream(object2, stream) {
  if (object2 && streamObjectType.hasOwnProperty(object2.type)) {
    streamObjectType[object2.type](object2, stream);
  } else {
    streamGeometry(object2, stream);
  }
}
var areaRingSum$1 = new Adder();
var areaSum$1 = new Adder(), lambda00$2, phi00$2, lambda0$2, cosPhi0$1, sinPhi0$1;
var areaStream$1 = {
  point: noop$1,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: function() {
    areaRingSum$1 = new Adder();
    areaStream$1.lineStart = areaRingStart$1;
    areaStream$1.lineEnd = areaRingEnd$1;
  },
  polygonEnd: function() {
    var areaRing = +areaRingSum$1;
    areaSum$1.add(areaRing < 0 ? tau + areaRing : areaRing);
    this.lineStart = this.lineEnd = this.point = noop$1;
  },
  sphere: function() {
    areaSum$1.add(tau);
  }
};
function areaRingStart$1() {
  areaStream$1.point = areaPointFirst$1;
}
function areaRingEnd$1() {
  areaPoint$1(lambda00$2, phi00$2);
}
function areaPointFirst$1(lambda, phi) {
  areaStream$1.point = areaPoint$1;
  lambda00$2 = lambda, phi00$2 = phi;
  lambda *= radians, phi *= radians;
  lambda0$2 = lambda, cosPhi0$1 = cos(phi = phi / 2 + quarterPi), sinPhi0$1 = sin(phi);
}
function areaPoint$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  phi = phi / 2 + quarterPi;
  var dLambda = lambda - lambda0$2, sdLambda = dLambda >= 0 ? 1 : -1, adLambda = sdLambda * dLambda, cosPhi = cos(phi), sinPhi = sin(phi), k = sinPhi0$1 * sinPhi, u = cosPhi0$1 * cosPhi + k * cos(adLambda), v = k * sdLambda * sin(adLambda);
  areaRingSum$1.add(atan2(v, u));
  lambda0$2 = lambda, cosPhi0$1 = cosPhi, sinPhi0$1 = sinPhi;
}
function area(object2) {
  areaSum$1 = new Adder();
  geoStream(object2, areaStream$1);
  return areaSum$1 * 2;
}
function spherical(cartesian2) {
  return [atan2(cartesian2[1], cartesian2[0]), asin(cartesian2[2])];
}
function cartesian(spherical2) {
  var lambda = spherical2[0], phi = spherical2[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}
function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}
function cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}
function cartesianNormalizeInPlace(d) {
  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}
var lambda0$1, phi0, lambda1, phi1, lambda2, lambda00$1, phi00$1, p0, deltaSum, ranges, range;
var boundsStream$1 = {
  point: boundsPoint$1,
  lineStart: boundsLineStart,
  lineEnd: boundsLineEnd,
  polygonStart: function() {
    boundsStream$1.point = boundsRingPoint;
    boundsStream$1.lineStart = boundsRingStart;
    boundsStream$1.lineEnd = boundsRingEnd;
    deltaSum = new Adder();
    areaStream$1.polygonStart();
  },
  polygonEnd: function() {
    areaStream$1.polygonEnd();
    boundsStream$1.point = boundsPoint$1;
    boundsStream$1.lineStart = boundsLineStart;
    boundsStream$1.lineEnd = boundsLineEnd;
    if (areaRingSum$1 < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
    else if (deltaSum > epsilon) phi1 = 90;
    else if (deltaSum < -epsilon) phi0 = -90;
    range[0] = lambda0$1, range[1] = lambda1;
  },
  sphere: function() {
    lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
  }
};
function boundsPoint$1(lambda, phi) {
  ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
}
function linePoint(lambda, phi) {
  var p = cartesian([lambda * radians, phi * radians]);
  if (p0) {
    var normal = cartesianCross(p0, p), equatorial = [normal[1], -normal[0], 0], inflection = cartesianCross(equatorial, normal);
    cartesianNormalizeInPlace(inflection);
    inflection = spherical(inflection);
    var delta = lambda - lambda2, sign2 = delta > 0 ? 1 : -1, lambdai = inflection[0] * degrees$1 * sign2, phii, antimeridian = abs(delta) > 180;
    if (antimeridian ^ (sign2 * lambda2 < lambdai && lambdai < sign2 * lambda)) {
      phii = inflection[1] * degrees$1;
      if (phii > phi1) phi1 = phii;
    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign2 * lambda2 < lambdai && lambdai < sign2 * lambda)) {
      phii = -inflection[1] * degrees$1;
      if (phii < phi0) phi0 = phii;
    } else {
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
    }
    if (antimeridian) {
      if (lambda < lambda2) {
        if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
      } else {
        if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
      }
    } else {
      if (lambda1 >= lambda0$1) {
        if (lambda < lambda0$1) lambda0$1 = lambda;
        if (lambda > lambda1) lambda1 = lambda;
      } else {
        if (lambda > lambda2) {
          if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
        } else {
          if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
        }
      }
    }
  } else {
    ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
  }
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
  p0 = p, lambda2 = lambda;
}
function boundsLineStart() {
  boundsStream$1.point = linePoint;
}
function boundsLineEnd() {
  range[0] = lambda0$1, range[1] = lambda1;
  boundsStream$1.point = boundsPoint$1;
  p0 = null;
}
function boundsRingPoint(lambda, phi) {
  if (p0) {
    var delta = lambda - lambda2;
    deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
  } else {
    lambda00$1 = lambda, phi00$1 = phi;
  }
  areaStream$1.point(lambda, phi);
  linePoint(lambda, phi);
}
function boundsRingStart() {
  areaStream$1.lineStart();
}
function boundsRingEnd() {
  boundsRingPoint(lambda00$1, phi00$1);
  areaStream$1.lineEnd();
  if (abs(deltaSum) > epsilon) lambda0$1 = -(lambda1 = 180);
  range[0] = lambda0$1, range[1] = lambda1;
  p0 = null;
}
function angle(lambda02, lambda12) {
  return (lambda12 -= lambda02) < 0 ? lambda12 + 360 : lambda12;
}
function rangeCompare(a, b) {
  return a[0] - b[0];
}
function rangeContains(range2, x) {
  return range2[0] <= range2[1] ? range2[0] <= x && x <= range2[1] : x < range2[0] || range2[1] < x;
}
function bounds(feature2) {
  var i, n, a, b, merged, deltaMax, delta;
  phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
  ranges = [];
  geoStream(feature2, boundsStream$1);
  if (n = ranges.length) {
    ranges.sort(rangeCompare);
    for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
      b = ranges[i];
      if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
        if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
        if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
      } else {
        merged.push(a = b);
      }
    }
    for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
      b = merged[i];
      if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
    }
  }
  ranges = range = null;
  return lambda0$1 === Infinity || phi0 === Infinity ? [[NaN, NaN], [NaN, NaN]] : [[lambda0$1, phi0], [lambda1, phi1]];
}
var W0, W1, X0$1, Y0$1, Z0$1, X1$1, Y1$1, Z1$1, X2$1, Y2$1, Z2$1, lambda00, phi00, x0$4, y0$4, z0;
var centroidStream$1 = {
  sphere: noop$1,
  point: centroidPoint$1,
  lineStart: centroidLineStart$1,
  lineEnd: centroidLineEnd$1,
  polygonStart: function() {
    centroidStream$1.lineStart = centroidRingStart$1;
    centroidStream$1.lineEnd = centroidRingEnd$1;
  },
  polygonEnd: function() {
    centroidStream$1.lineStart = centroidLineStart$1;
    centroidStream$1.lineEnd = centroidLineEnd$1;
  }
};
function centroidPoint$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi));
}
function centroidPointCartesian(x, y, z) {
  ++W0;
  X0$1 += (x - X0$1) / W0;
  Y0$1 += (y - Y0$1) / W0;
  Z0$1 += (z - Z0$1) / W0;
}
function centroidLineStart$1() {
  centroidStream$1.point = centroidLinePointFirst;
}
function centroidLinePointFirst(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  x0$4 = cosPhi * cos(lambda);
  y0$4 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidStream$1.point = centroidLinePoint;
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroidLinePoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi), x = cosPhi * cos(lambda), y = cosPhi * sin(lambda), z = sin(phi), w = atan2(sqrt((w = y0$4 * z - z0 * y) * w + (w = z0 * x - x0$4 * z) * w + (w = x0$4 * y - y0$4 * x) * w), x0$4 * x + y0$4 * y + z0 * z);
  W1 += w;
  X1$1 += w * (x0$4 + (x0$4 = x));
  Y1$1 += w * (y0$4 + (y0$4 = y));
  Z1$1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroidLineEnd$1() {
  centroidStream$1.point = centroidPoint$1;
}
function centroidRingStart$1() {
  centroidStream$1.point = centroidRingPointFirst;
}
function centroidRingEnd$1() {
  centroidRingPoint(lambda00, phi00);
  centroidStream$1.point = centroidPoint$1;
}
function centroidRingPointFirst(lambda, phi) {
  lambda00 = lambda, phi00 = phi;
  lambda *= radians, phi *= radians;
  centroidStream$1.point = centroidRingPoint;
  var cosPhi = cos(phi);
  x0$4 = cosPhi * cos(lambda);
  y0$4 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroidRingPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi), x = cosPhi * cos(lambda), y = cosPhi * sin(lambda), z = sin(phi), cx = y0$4 * z - z0 * y, cy = z0 * x - x0$4 * z, cz = x0$4 * y - y0$4 * x, m = hypot(cx, cy, cz), w = asin(m), v = m && -w / m;
  X2$1.add(v * cx);
  Y2$1.add(v * cy);
  Z2$1.add(v * cz);
  W1 += w;
  X1$1 += w * (x0$4 + (x0$4 = x));
  Y1$1 += w * (y0$4 + (y0$4 = y));
  Z1$1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0$4, y0$4, z0);
}
function centroid(object2) {
  W0 = W1 = X0$1 = Y0$1 = Z0$1 = X1$1 = Y1$1 = Z1$1 = 0;
  X2$1 = new Adder();
  Y2$1 = new Adder();
  Z2$1 = new Adder();
  geoStream(object2, centroidStream$1);
  var x = +X2$1, y = +Y2$1, z = +Z2$1, m = hypot(x, y, z);
  if (m < epsilon2$1) {
    x = X1$1, y = Y1$1, z = Z1$1;
    if (W1 < epsilon) x = X0$1, y = Y0$1, z = Z0$1;
    m = hypot(x, y, z);
    if (m < epsilon2$1) return [NaN, NaN];
  }
  return [atan2(y, x) * degrees$1, asin(z / m) * degrees$1];
}
function constant$3(x) {
  return function() {
    return x;
  };
}
function compose(a, b) {
  function compose2(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }
  if (a.invert && b.invert) compose2.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };
  return compose2;
}
function rotationIdentity(lambda, phi) {
  return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
}
rotationIdentity.invert = rotationIdentity;
function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
}
function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
  };
}
function rotationLambda(deltaLambda) {
  var rotation2 = forwardRotationLambda(deltaLambda);
  rotation2.invert = forwardRotationLambda(-deltaLambda);
  return rotation2;
}
function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos(deltaPhi), sinDeltaPhi = sin(deltaPhi), cosDeltaGamma = cos(deltaGamma), sinDeltaGamma = sin(deltaGamma);
  function rotation2(lambda, phi) {
    var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }
  rotation2.invert = function(lambda, phi) {
    var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };
  return rotation2;
}
function rotation(rotate) {
  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);
  function forward(coordinates2) {
    coordinates2 = rotate(coordinates2[0] * radians, coordinates2[1] * radians);
    return coordinates2[0] *= degrees$1, coordinates2[1] *= degrees$1, coordinates2;
  }
  forward.invert = function(coordinates2) {
    coordinates2 = rotate.invert(coordinates2[0] * radians, coordinates2[1] * radians);
    return coordinates2[0] *= degrees$1, coordinates2[1] *= degrees$1, coordinates2;
  };
  return forward;
}
function circleStream(stream, radius, delta, direction, t0, t1) {
  if (!delta) return;
  var cosRadius = cos(radius), sinRadius = sin(radius), step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius(cosRadius, t0);
    t1 = circleRadius(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
    stream.point(point[0], point[1]);
  }
}
function circleRadius(cosRadius, point) {
  point = cartesian(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace(point);
  var radius = acos(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}
function circle$1() {
  var center = constant$3([0, 0]), radius = constant$3(90), precision = constant$3(6), ring, rotate, stream = { point };
  function point(x, y) {
    ring.push(x = rotate(x, y));
    x[0] *= degrees$1, x[1] *= degrees$1;
  }
  function circle2() {
    var c = center.apply(this, arguments), r = radius.apply(this, arguments) * radians, p = precision.apply(this, arguments) * radians;
    ring = [];
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
    circleStream(stream, r, p, 1);
    c = { type: "Polygon", coordinates: [ring] };
    ring = rotate = null;
    return c;
  }
  circle2.center = function(_) {
    return arguments.length ? (center = typeof _ === "function" ? _ : constant$3([+_[0], +_[1]]), circle2) : center;
  };
  circle2.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$3(+_), circle2) : radius;
  };
  circle2.precision = function(_) {
    return arguments.length ? (precision = typeof _ === "function" ? _ : constant$3(+_), circle2) : precision;
  };
  return circle2;
}
function clipBuffer() {
  var lines = [], line;
  return {
    point: function(x, y, m) {
      line.push([x, y, m]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop$1,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}
function pointEqual(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
}
function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other;
  this.e = entry;
  this.v = false;
  this.n = this.p = null;
}
function clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream) {
  var subject = [], clip2 = [], i, n;
  segments.forEach(function(segment) {
    if ((n2 = segment.length - 1) <= 0) return;
    var n2, p02 = segment[0], p1 = segment[n2], x;
    if (pointEqual(p02, p1)) {
      if (!p02[2] && !p1[2]) {
        stream.lineStart();
        for (i = 0; i < n2; ++i) stream.point((p02 = segment[i])[0], p02[1]);
        stream.lineEnd();
        return;
      }
      p1[0] += 2 * epsilon;
    }
    subject.push(x = new Intersection(p02, segment, null, true));
    clip2.push(x.o = new Intersection(p02, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip2.push(x.o = new Intersection(p1, null, x, true));
  });
  if (!subject.length) return;
  clip2.sort(compareIntersection2);
  link(subject);
  link(clip2);
  for (i = 0, n = clip2.length; i < n; ++i) {
    clip2[i].e = startInside = !startInside;
  }
  var start2 = subject[0], points, point;
  while (1) {
    var current = start2, isSubject = true;
    while (current.v) if ((current = current.n) === start2) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate2(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate2(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}
function link(array2) {
  if (!(n = array2.length)) return;
  var n, i = 0, a = array2[0], b;
  while (++i < n) {
    a.n = b = array2[i];
    b.p = a;
    a = b;
  }
  a.n = b = array2[0];
  b.p = a;
}
function longitude(point) {
  if (abs(point[0]) <= pi)
    return point[0];
  else
    return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
}
function polygonContains(polygon, point) {
  var lambda = longitude(point), phi = point[1], sinPhi = sin(phi), normal = [sin(lambda), -cos(lambda), 0], angle2 = 0, winding = 0;
  var sum = new Adder();
  if (sinPhi === 1) phi = halfPi + epsilon;
  else if (sinPhi === -1) phi = -halfPi - epsilon;
  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring, m, point0 = ring[m - 1], lambda02 = longitude(point0), phi02 = point0[1] / 2 + quarterPi, sinPhi02 = sin(phi02), cosPhi02 = cos(phi02);
    for (var j = 0; j < m; ++j, lambda02 = lambda12, sinPhi02 = sinPhi1, cosPhi02 = cosPhi1, point0 = point1) {
      var point1 = ring[j], lambda12 = longitude(point1), phi12 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi12), cosPhi1 = cos(phi12), delta = lambda12 - lambda02, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi, k = sinPhi02 * sinPhi1;
      sum.add(atan2(k * sign2 * sin(absDelta), cosPhi02 * cosPhi1 + k * cos(absDelta)));
      angle2 += antimeridian ? delta + sign2 * tau : delta;
      if (antimeridian ^ lambda02 >= lambda ^ lambda12 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }
  return (angle2 < -epsilon || angle2 < epsilon && sum < -epsilon2$1) ^ winding & 1;
}
function clip(pointVisible, clipLine2, interpolate2, start2) {
  return function(sink) {
    var line = clipLine2(sink), ringBuffer = clipBuffer(), ringSink = clipLine2(ringBuffer), polygonStarted = false, polygon, segments, ring;
    var clip2 = {
      point,
      lineStart,
      lineEnd,
      polygonStart: function() {
        clip2.point = pointRing;
        clip2.lineStart = ringStart;
        clip2.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip2.point = point;
        clip2.lineStart = lineStart;
        clip2.lineEnd = lineEnd;
        segments = merge(segments);
        var startInside = polygonContains(polygon, start2);
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          clipRejoin(segments, compareIntersection, startInside, interpolate2, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          interpolate2(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate2(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };
    function point(lambda, phi) {
      if (pointVisible(lambda, phi)) sink.point(lambda, phi);
    }
    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }
    function lineStart() {
      clip2.point = pointLine;
      line.lineStart();
    }
    function lineEnd() {
      clip2.point = point;
      line.lineEnd();
    }
    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi);
    }
    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }
    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();
      var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i, n = ringSegments.length, m, segment, point2;
      ring.pop();
      polygon.push(ring);
      ring = null;
      if (!n) return;
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i) sink.point((point2 = segment[i])[0], point2[1]);
          sink.lineEnd();
        }
        return;
      }
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
      segments.push(ringSegments.filter(validSegment));
    }
    return clip2;
  };
}
function validSegment(segment) {
  return segment.length > 1;
}
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}
const clipAntimeridian = clip(
  function() {
    return true;
  },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi, -halfPi]
);
function clipAntimeridianLine(stream) {
  var lambda02 = NaN, phi02 = NaN, sign0 = NaN, clean;
  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda12, phi12) {
      var sign1 = lambda12 > 0 ? pi : -pi, delta = abs(lambda12 - lambda02);
      if (abs(delta - pi) < epsilon) {
        stream.point(lambda02, phi02 = (phi02 + phi12) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi02);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi02);
        stream.point(lambda12, phi02);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi) {
        if (abs(lambda02 - sign0) < epsilon) lambda02 -= sign0 * epsilon;
        if (abs(lambda12 - sign1) < epsilon) lambda12 -= sign1 * epsilon;
        phi02 = clipAntimeridianIntersect(lambda02, phi02, lambda12, phi12);
        stream.point(sign0, phi02);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi02);
        clean = 0;
      }
      stream.point(lambda02 = lambda12, phi02 = phi12);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda02 = phi02 = NaN;
    },
    clean: function() {
      return 2 - clean;
    }
  };
}
function clipAntimeridianIntersect(lambda02, phi02, lambda12, phi12) {
  var cosPhi02, cosPhi1, sinLambda0Lambda1 = sin(lambda02 - lambda12);
  return abs(sinLambda0Lambda1) > epsilon ? atan((sin(phi02) * (cosPhi1 = cos(phi12)) * sin(lambda12) - sin(phi12) * (cosPhi02 = cos(phi02)) * sin(lambda02)) / (cosPhi02 * cosPhi1 * sinLambda0Lambda1)) : (phi02 + phi12) / 2;
}
function clipAntimeridianInterpolate(from, to, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * halfPi;
    stream.point(-pi, phi);
    stream.point(0, phi);
    stream.point(pi, phi);
    stream.point(pi, 0);
    stream.point(pi, -phi);
    stream.point(0, -phi);
    stream.point(-pi, -phi);
    stream.point(-pi, 0);
    stream.point(-pi, phi);
  } else if (abs(from[0] - to[0]) > epsilon) {
    var lambda = from[0] < to[0] ? pi : -pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}
function clipCircle(radius) {
  var cr = cos(radius), delta = 6 * radians, smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon;
  function interpolate2(from, to, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to);
  }
  function visible(lambda, phi) {
    return cos(lambda) * cos(phi) > cr;
  }
  function clipLine2(stream) {
    var point0, c0, v0, v00, clean;
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi], point2, v = visible(lambda, phi), c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v)) stream.lineStart();
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
            point1[2] = 1;
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1], 2);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          if (!(c & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1], 3);
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c;
      },
      lineEnd: function() {
        if (v0) stream.lineEnd();
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | (v00 && v0) << 1;
      }
    };
  }
  function intersect(a, b, two) {
    var pa = cartesian(a), pb = cartesian(b);
    var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
    if (!determinant) return !two && a;
    var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A = cartesianScale(n1, c1), B = cartesianScale(n2, c2);
    cartesianAddInPlace(A, B);
    var u = n1xn2, w = cartesianDot(A, u), uu = cartesianDot(u, u), t2 = w * w - uu * (cartesianDot(A, A) - 1);
    if (t2 < 0) return;
    var t = sqrt(t2), q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A);
    q = spherical(q);
    if (!two) return q;
    var lambda02 = a[0], lambda12 = b[0], phi02 = a[1], phi12 = b[1], z;
    if (lambda12 < lambda02) z = lambda02, lambda02 = lambda12, lambda12 = z;
    var delta2 = lambda12 - lambda02, polar = abs(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
    if (!polar && phi12 < phi02) z = phi02, phi02 = phi12, phi12 = z;
    if (meridian ? polar ? phi02 + phi12 > 0 ^ q[1] < (abs(q[0] - lambda02) < epsilon ? phi02 : phi12) : phi02 <= q[1] && q[1] <= phi12 : delta2 > pi ^ (lambda02 <= q[0] && q[0] <= lambda12)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A);
      return [q, spherical(q1)];
    }
  }
  function code(lambda, phi) {
    var r = smallRadius ? radius : pi - radius, code2 = 0;
    if (lambda < -r) code2 |= 1;
    else if (lambda > r) code2 |= 2;
    if (phi < -r) code2 |= 4;
    else if (phi > r) code2 |= 8;
    return code2;
  }
  return clip(visible, clipLine2, interpolate2, smallRadius ? [0, -radius] : [-pi, radius - pi]);
}
function clipLine(a, b, x02, y02, x12, y12) {
  var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
  r = x02 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = x12 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }
  r = y02 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = y12 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }
  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
  return true;
}
var clipMax = 1e9, clipMin = -clipMax;
function clipRectangle(x02, y02, x12, y12) {
  function visible(x, y) {
    return x02 <= x && x <= x12 && y02 <= y && y <= y12;
  }
  function interpolate2(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
      do
        stream.point(a === 0 || a === 3 ? x02 : x12, a > 1 ? y12 : y02);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }
  function corner(p, direction) {
    return abs(p[0] - x02) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y02) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
  }
  function compareIntersection2(a, b) {
    return comparePoint(a.x, b.x);
  }
  function comparePoint(a, b) {
    var ca = corner(a, 1), cb = corner(b, 1);
    return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
  }
  return function(stream) {
    var activeStream = stream, bufferStream = clipBuffer(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
    var clipStream = {
      point,
      lineStart,
      lineEnd,
      polygonStart,
      polygonEnd
    };
    function point(x, y) {
      if (visible(x, y)) activeStream.point(x, y);
    }
    function polygonInside() {
      var winding = 0;
      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring2 = polygon[i], j = 1, m = ring2.length, point2 = ring2[0], a0, a1, b0 = point2[0], b1 = point2[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point2 = ring2[j], b0 = point2[0], b1 = point2[1];
          if (a1 <= y12) {
            if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x02 - a0)) ++winding;
          } else {
            if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x02 - a0)) --winding;
          }
        }
      }
      return winding;
    }
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }
    function polygonEnd() {
      var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = merge(segments)).length;
      if (cleanInside || visible2) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate2(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible2) {
          clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }
    function lineStart() {
      clipStream.point = linePoint2;
      if (polygon) polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }
    function lineEnd() {
      if (segments) {
        linePoint2(x__, y__);
        if (v__ && v_) bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_) activeStream.lineEnd();
    }
    function linePoint2(x, y) {
      var v = visible(x, y);
      if (polygon) ring.push([x, y]);
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_) activeStream.point(x, y);
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a, b, x02, y02, x12, y12)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v) activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }
    return clipStream;
  };
}
function extent() {
  var x02 = 0, y02 = 0, x12 = 960, y12 = 500, cache, cacheStream, clip2;
  return clip2 = {
    stream: function(stream) {
      return cache && cacheStream === stream ? cache : cache = clipRectangle(x02, y02, x12, y12)(cacheStream = stream);
    },
    extent: function(_) {
      return arguments.length ? (x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1], cache = cacheStream = null, clip2) : [[x02, y02], [x12, y12]];
    }
  };
}
var lengthSum$1, lambda0, sinPhi0, cosPhi0;
var lengthStream$1 = {
  sphere: noop$1,
  point: noop$1,
  lineStart: lengthLineStart,
  lineEnd: noop$1,
  polygonStart: noop$1,
  polygonEnd: noop$1
};
function lengthLineStart() {
  lengthStream$1.point = lengthPointFirst$1;
  lengthStream$1.lineEnd = lengthLineEnd;
}
function lengthLineEnd() {
  lengthStream$1.point = lengthStream$1.lineEnd = noop$1;
}
function lengthPointFirst$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  lambda0 = lambda, sinPhi0 = sin(phi), cosPhi0 = cos(phi);
  lengthStream$1.point = lengthPoint$1;
}
function lengthPoint$1(lambda, phi) {
  lambda *= radians, phi *= radians;
  var sinPhi = sin(phi), cosPhi = cos(phi), delta = abs(lambda - lambda0), cosDelta = cos(delta), sinDelta = sin(delta), x = cosPhi * sinDelta, y = cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDelta, z = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDelta;
  lengthSum$1.add(atan2(sqrt(x * x + y * y), z));
  lambda0 = lambda, sinPhi0 = sinPhi, cosPhi0 = cosPhi;
}
function length(object2) {
  lengthSum$1 = new Adder();
  geoStream(object2, lengthStream$1);
  return +lengthSum$1;
}
var coordinates = [null, null], object$1 = { type: "LineString", coordinates };
function distance(a, b) {
  coordinates[0] = a;
  coordinates[1] = b;
  return length(object$1);
}
var containsObjectType = {
  Feature: function(object2, point) {
    return containsGeometry(object2.geometry, point);
  },
  FeatureCollection: function(object2, point) {
    var features = object2.features, i = -1, n = features.length;
    while (++i < n) if (containsGeometry(features[i].geometry, point)) return true;
    return false;
  }
};
var containsGeometryType = {
  Sphere: function() {
    return true;
  },
  Point: function(object2, point) {
    return containsPoint(object2.coordinates, point);
  },
  MultiPoint: function(object2, point) {
    var coordinates2 = object2.coordinates, i = -1, n = coordinates2.length;
    while (++i < n) if (containsPoint(coordinates2[i], point)) return true;
    return false;
  },
  LineString: function(object2, point) {
    return containsLine(object2.coordinates, point);
  },
  MultiLineString: function(object2, point) {
    var coordinates2 = object2.coordinates, i = -1, n = coordinates2.length;
    while (++i < n) if (containsLine(coordinates2[i], point)) return true;
    return false;
  },
  Polygon: function(object2, point) {
    return containsPolygon(object2.coordinates, point);
  },
  MultiPolygon: function(object2, point) {
    var coordinates2 = object2.coordinates, i = -1, n = coordinates2.length;
    while (++i < n) if (containsPolygon(coordinates2[i], point)) return true;
    return false;
  },
  GeometryCollection: function(object2, point) {
    var geometries = object2.geometries, i = -1, n = geometries.length;
    while (++i < n) if (containsGeometry(geometries[i], point)) return true;
    return false;
  }
};
function containsGeometry(geometry, point) {
  return geometry && containsGeometryType.hasOwnProperty(geometry.type) ? containsGeometryType[geometry.type](geometry, point) : false;
}
function containsPoint(coordinates2, point) {
  return distance(coordinates2, point) === 0;
}
function containsLine(coordinates2, point) {
  var ao, bo, ab;
  for (var i = 0, n = coordinates2.length; i < n; i++) {
    bo = distance(coordinates2[i], point);
    if (bo === 0) return true;
    if (i > 0) {
      ab = distance(coordinates2[i], coordinates2[i - 1]);
      if (ab > 0 && ao <= ab && bo <= ab && (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < epsilon2$1 * ab)
        return true;
    }
    ao = bo;
  }
  return false;
}
function containsPolygon(coordinates2, point) {
  return !!polygonContains(coordinates2.map(ringRadians), pointRadians(point));
}
function ringRadians(ring) {
  return ring = ring.map(pointRadians), ring.pop(), ring;
}
function pointRadians(point) {
  return [point[0] * radians, point[1] * radians];
}
function contains(object2, point) {
  return (object2 && containsObjectType.hasOwnProperty(object2.type) ? containsObjectType[object2.type] : containsGeometry)(object2, point);
}
function graticuleX(y02, y12, dy) {
  var y = range$1(y02, y12 - epsilon, dy).concat(y12);
  return function(x) {
    return y.map(function(y2) {
      return [x, y2];
    });
  };
}
function graticuleY(x02, x12, dx) {
  var x = range$1(x02, x12 - epsilon, dx).concat(x12);
  return function(y) {
    return x.map(function(x2) {
      return [x2, y];
    });
  };
}
function graticule() {
  var x12, x02, X12, X02, y12, y02, Y12, Y02, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
  function graticule2() {
    return { type: "MultiLineString", coordinates: lines() };
  }
  function lines() {
    return range$1(ceil(X02 / DX) * DX, X12, DX).map(X).concat(range$1(ceil(Y02 / DY) * DY, Y12, DY).map(Y)).concat(range$1(ceil(x02 / dx) * dx, x12, dx).filter(function(x2) {
      return abs(x2 % DX) > epsilon;
    }).map(x)).concat(range$1(ceil(y02 / dy) * dy, y12, dy).filter(function(y2) {
      return abs(y2 % DY) > epsilon;
    }).map(y));
  }
  graticule2.lines = function() {
    return lines().map(function(coordinates2) {
      return { type: "LineString", coordinates: coordinates2 };
    });
  };
  graticule2.outline = function() {
    return {
      type: "Polygon",
      coordinates: [
        X(X02).concat(
          Y(Y12).slice(1),
          X(X12).reverse().slice(1),
          Y(Y02).reverse().slice(1)
        )
      ]
    };
  };
  graticule2.extent = function(_) {
    if (!arguments.length) return graticule2.extentMinor();
    return graticule2.extentMajor(_).extentMinor(_);
  };
  graticule2.extentMajor = function(_) {
    if (!arguments.length) return [[X02, Y02], [X12, Y12]];
    X02 = +_[0][0], X12 = +_[1][0];
    Y02 = +_[0][1], Y12 = +_[1][1];
    if (X02 > X12) _ = X02, X02 = X12, X12 = _;
    if (Y02 > Y12) _ = Y02, Y02 = Y12, Y12 = _;
    return graticule2.precision(precision);
  };
  graticule2.extentMinor = function(_) {
    if (!arguments.length) return [[x02, y02], [x12, y12]];
    x02 = +_[0][0], x12 = +_[1][0];
    y02 = +_[0][1], y12 = +_[1][1];
    if (x02 > x12) _ = x02, x02 = x12, x12 = _;
    if (y02 > y12) _ = y02, y02 = y12, y12 = _;
    return graticule2.precision(precision);
  };
  graticule2.step = function(_) {
    if (!arguments.length) return graticule2.stepMinor();
    return graticule2.stepMajor(_).stepMinor(_);
  };
  graticule2.stepMajor = function(_) {
    if (!arguments.length) return [DX, DY];
    DX = +_[0], DY = +_[1];
    return graticule2;
  };
  graticule2.stepMinor = function(_) {
    if (!arguments.length) return [dx, dy];
    dx = +_[0], dy = +_[1];
    return graticule2;
  };
  graticule2.precision = function(_) {
    if (!arguments.length) return precision;
    precision = +_;
    x = graticuleX(y02, y12, 90);
    y = graticuleY(x02, x12, precision);
    X = graticuleX(Y02, Y12, 90);
    Y = graticuleY(X02, X12, precision);
    return graticule2;
  };
  return graticule2.extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]]).extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
}
function graticule10() {
  return graticule()();
}
function interpolate$1(a, b) {
  var x02 = a[0] * radians, y02 = a[1] * radians, x12 = b[0] * radians, y12 = b[1] * radians, cy0 = cos(y02), sy0 = sin(y02), cy1 = cos(y12), sy1 = sin(y12), kx0 = cy0 * cos(x02), ky0 = cy0 * sin(x02), kx1 = cy1 * cos(x12), ky1 = cy1 * sin(x12), d = 2 * asin(sqrt(haversin(y12 - y02) + cy0 * cy1 * haversin(x12 - x02))), k = sin(d);
  var interpolate2 = d ? function(t) {
    var B = sin(t *= d) / k, A = sin(d - t) / k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
    return [
      atan2(y, x) * degrees$1,
      atan2(z, sqrt(x * x + y * y)) * degrees$1
    ];
  } : function() {
    return [x02 * degrees$1, y02 * degrees$1];
  };
  interpolate2.distance = d;
  return interpolate2;
}
const identity$4 = (x) => x;
var areaSum = new Adder(), areaRingSum = new Adder(), x00$2, y00$2, x0$3, y0$3;
var areaStream = {
  point: noop$1,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: function() {
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
    areaSum.add(abs(areaRingSum));
    areaRingSum = new Adder();
  },
  result: function() {
    var area2 = areaSum / 2;
    areaSum = new Adder();
    return area2;
  }
};
function areaRingStart() {
  areaStream.point = areaPointFirst;
}
function areaPointFirst(x, y) {
  areaStream.point = areaPoint;
  x00$2 = x0$3 = x, y00$2 = y0$3 = y;
}
function areaPoint(x, y) {
  areaRingSum.add(y0$3 * x - x0$3 * y);
  x0$3 = x, y0$3 = y;
}
function areaRingEnd() {
  areaPoint(x00$2, y00$2);
}
var x0$2 = Infinity, y0$2 = x0$2, x1 = -x0$2, y1 = x1;
var boundsStream = {
  point: boundsPoint,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: noop$1,
  polygonEnd: noop$1,
  result: function() {
    var bounds2 = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds2;
  }
};
function boundsPoint(x, y) {
  if (x < x0$2) x0$2 = x;
  if (x > x1) x1 = x;
  if (y < y0$2) y0$2 = y;
  if (y > y1) y1 = y;
}
var X0 = 0, Y0 = 0, Z0 = 0, X1 = 0, Y1 = 0, Z1 = 0, X2 = 0, Y2 = 0, Z2 = 0, x00$1, y00$1, x0$1, y0$1;
var centroidStream = {
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.point = centroidPoint;
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  },
  result: function() {
    var centroid2 = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0 / Z0, Y0 / Z0] : [NaN, NaN];
    X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
    return centroid2;
  }
};
function centroidPoint(x, y) {
  X0 += x;
  Y0 += y;
  ++Z0;
}
function centroidLineStart() {
  centroidStream.point = centroidPointFirstLine;
}
function centroidPointFirstLine(x, y) {
  centroidStream.point = centroidPointLine;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function centroidPointLine(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}
function centroidRingStart() {
  centroidStream.point = centroidPointFirstRing;
}
function centroidRingEnd() {
  centroidPointRing(x00$1, y00$1);
}
function centroidPointFirstRing(x, y) {
  centroidStream.point = centroidPointRing;
  centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
}
function centroidPointRing(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  z = y0$1 * x - x0$1 * y;
  X2 += z * (x0$1 + x);
  Y2 += z * (y0$1 + y);
  Z2 += z * 3;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function PathContext(context) {
  this._context = context;
}
PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop$1
};
var lengthSum = new Adder(), lengthRing, x00, y00, x0, y0;
var lengthStream = {
  point: noop$1,
  lineStart: function() {
    lengthStream.point = lengthPointFirst;
  },
  lineEnd: function() {
    if (lengthRing) lengthPoint(x00, y00);
    lengthStream.point = noop$1;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length2 = +lengthSum;
    lengthSum = new Adder();
    return length2;
  }
};
function lengthPointFirst(x, y) {
  lengthStream.point = lengthPoint;
  x00 = x0 = x, y00 = y0 = y;
}
function lengthPoint(x, y) {
  x0 -= x, y0 -= y;
  lengthSum.add(sqrt(x0 * x0 + y0 * y0));
  x0 = x, y0 = y;
}
function PathString() {
  this._string = [];
}
PathString.prototype = {
  _radius: 4.5,
  _circle: circle(4.5),
  pointRadius: function(_) {
    if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
    return this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._string.push("Z");
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._string.push("M", x, ",", y);
        this._point = 1;
        break;
      }
      case 1: {
        this._string.push("L", x, ",", y);
        break;
      }
      default: {
        if (this._circle == null) this._circle = circle(this._radius);
        this._string.push("M", x, ",", y, this._circle);
        break;
      }
    }
  },
  result: function() {
    if (this._string.length) {
      var result = this._string.join("");
      this._string = [];
      return result;
    } else {
      return null;
    }
  }
};
function circle(radius) {
  return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
}
function index(projection2, context) {
  var pointRadius = 4.5, projectionStream, contextStream;
  function path(object2) {
    if (object2) {
      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
      geoStream(object2, projectionStream(contextStream));
    }
    return contextStream.result();
  }
  path.area = function(object2) {
    geoStream(object2, projectionStream(areaStream));
    return areaStream.result();
  };
  path.measure = function(object2) {
    geoStream(object2, projectionStream(lengthStream));
    return lengthStream.result();
  };
  path.bounds = function(object2) {
    geoStream(object2, projectionStream(boundsStream));
    return boundsStream.result();
  };
  path.centroid = function(object2) {
    geoStream(object2, projectionStream(centroidStream));
    return centroidStream.result();
  };
  path.projection = function(_) {
    return arguments.length ? (projectionStream = _ == null ? (projection2 = null, identity$4) : (projection2 = _).stream, path) : projection2;
  };
  path.context = function(_) {
    if (!arguments.length) return context;
    contextStream = _ == null ? (context = null, new PathString()) : new PathContext(context = _);
    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
    return path;
  };
  path.pointRadius = function(_) {
    if (!arguments.length) return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };
  return path.projection(projection2).context(context);
}
function transform$1(methods) {
  return {
    stream: transformer(methods)
  };
}
function transformer(methods) {
  return function(stream) {
    var s = new TransformStream();
    for (var key in methods) s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}
function TransformStream() {
}
TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) {
    this.stream.point(x, y);
  },
  sphere: function() {
    this.stream.sphere();
  },
  lineStart: function() {
    this.stream.lineStart();
  },
  lineEnd: function() {
    this.stream.lineEnd();
  },
  polygonStart: function() {
    this.stream.polygonStart();
  },
  polygonEnd: function() {
    this.stream.polygonEnd();
  }
};
function fit(projection2, fitBounds, object2) {
  var clip2 = projection2.clipExtent && projection2.clipExtent();
  projection2.scale(150).translate([0, 0]);
  if (clip2 != null) projection2.clipExtent(null);
  geoStream(object2, projection2.stream(boundsStream));
  fitBounds(boundsStream.result());
  if (clip2 != null) projection2.clipExtent(clip2);
  return projection2;
}
function fitExtent(projection2, extent2, object2) {
  return fit(projection2, function(b) {
    var w = extent2[1][0] - extent2[0][0], h = extent2[1][1] - extent2[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent2[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent2[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitSize(projection2, size, object2) {
  return fitExtent(projection2, [[0, 0], size], object2);
}
function fitWidth(projection2, width, object2) {
  return fit(projection2, function(b) {
    var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitHeight(projection2, height, object2) {
  return fit(projection2, function(b) {
    var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
var maxDepth = 16, cosMinDistance = cos(30 * radians);
function resample(project, delta2) {
  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
}
function resampleNone(project) {
  return transformer({
    point: function(x, y) {
      x = project(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}
function resample$1(project, delta2) {
  function resampleLineTo(x02, y02, lambda02, a0, b0, c0, x12, y12, lambda12, a1, b1, c1, depth, stream) {
    var dx = x12 - x02, dy = y12 - y02, d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda22 = abs(abs(c) - 1) < epsilon || abs(lambda02 - lambda12) < epsilon ? (lambda02 + lambda12) / 2 : atan2(b, a), p = project(lambda22, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x02, dy2 = y2 - y02, dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
        resampleLineTo(x02, y02, lambda02, a0, b0, c0, x2, y2, lambda22, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda22, a, b, c, x12, y12, lambda12, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda002, x002, y002, a00, b00, c00, lambda02, x02, y02, a0, b0, c0;
    var resampleStream = {
      point,
      lineStart,
      lineEnd,
      polygonStart: function() {
        stream.polygonStart();
        resampleStream.lineStart = ringStart;
      },
      polygonEnd: function() {
        stream.polygonEnd();
        resampleStream.lineStart = lineStart;
      }
    };
    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }
    function lineStart() {
      x02 = NaN;
      resampleStream.point = linePoint2;
      stream.lineStart();
    }
    function linePoint2(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x02, y02, lambda02, a0, b0, c0, x02 = p[0], y02 = p[1], lambda02 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x02, y02);
    }
    function lineEnd() {
      resampleStream.point = point;
      stream.lineEnd();
    }
    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }
    function ringPoint(lambda, phi) {
      linePoint2(lambda002 = lambda, phi), x002 = x02, y002 = y02, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint2;
    }
    function ringEnd() {
      resampleLineTo(x02, y02, lambda02, a0, b0, c0, x002, y002, lambda002, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }
    return resampleStream;
  };
}
var transformRadians = transformer({
  point: function(x, y) {
    this.stream.point(x * radians, y * radians);
  }
});
function transformRotate(rotate) {
  return transformer({
    point: function(x, y) {
      var r = rotate(x, y);
      return this.stream.point(r[0], r[1]);
    }
  });
}
function scaleTranslate(k, dx, dy, sx, sy) {
  function transform2(x, y) {
    x *= sx;
    y *= sy;
    return [dx + k * x, dy - k * y];
  }
  transform2.invert = function(x, y) {
    return [(x - dx) / k * sx, (dy - y) / k * sy];
  };
  return transform2;
}
function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
  if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
  var cosAlpha = cos(alpha), sinAlpha = sin(alpha), a = cosAlpha * k, b = sinAlpha * k, ai = cosAlpha / k, bi = sinAlpha / k, ci = (sinAlpha * dy - cosAlpha * dx) / k, fi = (sinAlpha * dx + cosAlpha * dy) / k;
  function transform2(x, y) {
    x *= sx;
    y *= sy;
    return [a * x - b * y + dx, dy - b * x - a * y];
  }
  transform2.invert = function(x, y) {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
  };
  return transform2;
}
function projection(project) {
  return projectionMutator(function() {
    return project;
  })();
}
function projectionMutator(projectAt) {
  var project, k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = clipAntimeridian, x02 = null, y02, x12, y12, postclip = identity$4, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
  function projection2(point) {
    return projectRotateTransform(point[0] * radians, point[1] * radians);
  }
  function invert(point) {
    point = projectRotateTransform.invert(point[0], point[1]);
    return point && [point[0] * degrees$1, point[1] * degrees$1];
  }
  projection2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
  };
  projection2.preclip = function(_) {
    return arguments.length ? (preclip = _, theta = void 0, reset()) : preclip;
  };
  projection2.postclip = function(_) {
    return arguments.length ? (postclip = _, x02 = y02 = x12 = y12 = null, reset()) : postclip;
  };
  projection2.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees$1;
  };
  projection2.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x02 = y02 = x12 = y12 = null, identity$4) : clipRectangle(x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  projection2.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };
  projection2.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };
  projection2.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees$1, phi * degrees$1];
  };
  projection2.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees$1, deltaPhi * degrees$1, deltaGamma * degrees$1];
  };
  projection2.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees$1;
  };
  projection2.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
  };
  projection2.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
  };
  projection2.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };
  projection2.fitExtent = function(extent2, object2) {
    return fitExtent(projection2, extent2, object2);
  };
  projection2.fitSize = function(size, object2) {
    return fitSize(projection2, size, object2);
  };
  projection2.fitWidth = function(width, object2) {
    return fitWidth(projection2, width, object2);
  };
  projection2.fitHeight = function(height, object2) {
    return fitHeight(projection2, height, object2);
  };
  function recenter() {
    var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)), transform2 = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
    projectTransform = compose(project, transform2);
    projectRotateTransform = compose(rotate, projectTransform);
    projectResample = resample(projectTransform, delta2);
    return reset();
  }
  function reset() {
    cache = cacheStream = null;
    return projection2;
  }
  return function() {
    project = projectAt.apply(this, arguments);
    projection2.invert = project.invert && invert;
    return recenter();
  };
}
function conicProjection(projectAt) {
  var phi02 = 0, phi12 = pi / 3, m = projectionMutator(projectAt), p = m(phi02, phi12);
  p.parallels = function(_) {
    return arguments.length ? m(phi02 = _[0] * radians, phi12 = _[1] * radians) : [phi02 * degrees$1, phi12 * degrees$1];
  };
  return p;
}
function cylindricalEqualAreaRaw(phi02) {
  var cosPhi02 = cos(phi02);
  function forward(lambda, phi) {
    return [lambda * cosPhi02, sin(phi) / cosPhi02];
  }
  forward.invert = function(x, y) {
    return [x / cosPhi02, asin(y * cosPhi02)];
  };
  return forward;
}
function conicEqualAreaRaw(y02, y12) {
  var sy0 = sin(y02), n = (sy0 + sin(y12)) / 2;
  if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y02);
  var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;
  function project(x, y) {
    var r = sqrt(c - 2 * n * sin(y)) / n;
    return [r * sin(x *= n), r0 - r * cos(x)];
  }
  project.invert = function(x, y) {
    var r0y = r0 - y, l = atan2(x, abs(r0y)) * sign(r0y);
    if (r0y * n < 0)
      l -= pi * sign(x) * sign(r0y);
    return [l / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
  };
  return project;
}
function conicEqualArea() {
  return conicProjection(conicEqualAreaRaw).scale(155.424).center([0, 33.6442]);
}
function albers() {
  return conicEqualArea().parallels([29.5, 45.5]).scale(1070).translate([480, 250]).rotate([96, 0]).center([-0.6, 38.7]);
}
function multiplex(streams) {
  var n = streams.length;
  return {
    point: function(x, y) {
      var i = -1;
      while (++i < n) streams[i].point(x, y);
    },
    sphere: function() {
      var i = -1;
      while (++i < n) streams[i].sphere();
    },
    lineStart: function() {
      var i = -1;
      while (++i < n) streams[i].lineStart();
    },
    lineEnd: function() {
      var i = -1;
      while (++i < n) streams[i].lineEnd();
    },
    polygonStart: function() {
      var i = -1;
      while (++i < n) streams[i].polygonStart();
    },
    polygonEnd: function() {
      var i = -1;
      while (++i < n) streams[i].polygonEnd();
    }
  };
}
function albersUsa() {
  var cache, cacheStream, lower48 = albers(), lower48Point, alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, point, pointStream = { point: function(x, y) {
    point = [x, y];
  } };
  function albersUsa2(coordinates2) {
    var x = coordinates2[0], y = coordinates2[1];
    return point = null, (lower48Point.point(x, y), point) || (alaskaPoint.point(x, y), point) || (hawaiiPoint.point(x, y), point);
  }
  albersUsa2.invert = function(coordinates2) {
    var k = lower48.scale(), t = lower48.translate(), x = (coordinates2[0] - t[0]) / k, y = (coordinates2[1] - t[1]) / k;
    return (y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates2);
  };
  albersUsa2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
  };
  albersUsa2.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
    return reset();
  };
  albersUsa2.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
    return albersUsa2.translate(lower48.translate());
  };
  albersUsa2.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];
    lower48Point = lower48.translate(_).clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]]).stream(pointStream);
    alaskaPoint = alaska.translate([x - 0.307 * k, y + 0.201 * k]).clipExtent([[x - 0.425 * k + epsilon, y + 0.12 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
    hawaiiPoint = hawaii.translate([x - 0.205 * k, y + 0.212 * k]).clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
    return reset();
  };
  albersUsa2.fitExtent = function(extent2, object2) {
    return fitExtent(albersUsa2, extent2, object2);
  };
  albersUsa2.fitSize = function(size, object2) {
    return fitSize(albersUsa2, size, object2);
  };
  albersUsa2.fitWidth = function(width, object2) {
    return fitWidth(albersUsa2, width, object2);
  };
  albersUsa2.fitHeight = function(height, object2) {
    return fitHeight(albersUsa2, height, object2);
  };
  function reset() {
    cache = cacheStream = null;
    return albersUsa2;
  }
  return albersUsa2.scale(1070);
}
function azimuthalRaw(scale) {
  return function(x, y) {
    var cx = cos(x), cy = cos(y), k = scale(cx * cy);
    if (k === Infinity) return [2, 0];
    return [
      k * cy * sin(x),
      k * sin(y)
    ];
  };
}
function azimuthalInvert(angle2) {
  return function(x, y) {
    var z = sqrt(x * x + y * y), c = angle2(z), sc = sin(c), cc = cos(c);
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ];
  };
}
var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt(2 / (1 + cxcy));
});
azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * asin(z / 2);
});
function azimuthalEqualArea() {
  return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
}
var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
  return (c = acos(c)) && c / sin(c);
});
azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});
function azimuthalEquidistant() {
  return projection(azimuthalEquidistantRaw).scale(79.4188).clipAngle(180 - 1e-3);
}
function mercatorRaw(lambda, phi) {
  return [lambda, log(tan((halfPi + phi) / 2))];
}
mercatorRaw.invert = function(x, y) {
  return [x, 2 * atan(exp(y)) - halfPi];
};
function mercator() {
  return mercatorProjection(mercatorRaw).scale(961 / tau);
}
function mercatorProjection(project) {
  var m = projection(project), center = m.center, scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, x02 = null, y02, x12, y12;
  m.scale = function(_) {
    return arguments.length ? (scale(_), reclip()) : scale();
  };
  m.translate = function(_) {
    return arguments.length ? (translate(_), reclip()) : translate();
  };
  m.center = function(_) {
    return arguments.length ? (center(_), reclip()) : center();
  };
  m.clipExtent = function(_) {
    return arguments.length ? (_ == null ? x02 = y02 = x12 = y12 = null : (x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reclip()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  function reclip() {
    var k = pi * scale(), t = m(rotation(m.rotate()).invert([0, 0]));
    return clipExtent(x02 == null ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw ? [[Math.max(t[0] - k, x02), y02], [Math.min(t[0] + k, x12), y12]] : [[x02, Math.max(t[1] - k, y02)], [x12, Math.min(t[1] + k, y12)]]);
  }
  return reclip();
}
function tany(y) {
  return tan((halfPi + y) / 2);
}
function conicConformalRaw(y02, y12) {
  var cy0 = cos(y02), n = y02 === y12 ? sin(y02) : log(cy0 / cos(y12)) / log(tany(y12) / tany(y02)), f = cy0 * pow(tany(y02), n) / n;
  if (!n) return mercatorRaw;
  function project(x, y) {
    if (f > 0) {
      if (y < -halfPi + epsilon) y = -halfPi + epsilon;
    } else {
      if (y > halfPi - epsilon) y = halfPi - epsilon;
    }
    var r = f / pow(tany(y), n);
    return [r * sin(n * x), f - r * cos(n * x)];
  }
  project.invert = function(x, y) {
    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy), l = atan2(x, abs(fy)) * sign(fy);
    if (fy * n < 0)
      l -= pi * sign(x) * sign(fy);
    return [l / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
  };
  return project;
}
function conicConformal() {
  return conicProjection(conicConformalRaw).scale(109.5).parallels([30, 30]);
}
function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}
equirectangularRaw.invert = equirectangularRaw;
function equirectangular() {
  return projection(equirectangularRaw).scale(152.63);
}
function conicEquidistantRaw(y02, y12) {
  var cy0 = cos(y02), n = y02 === y12 ? sin(y02) : (cy0 - cos(y12)) / (y12 - y02), g = cy0 / n + y02;
  if (abs(n) < epsilon) return equirectangularRaw;
  function project(x, y) {
    var gy = g - y, nx = n * x;
    return [gy * sin(nx), g - gy * cos(nx)];
  }
  project.invert = function(x, y) {
    var gy = g - y, l = atan2(x, abs(gy)) * sign(gy);
    if (gy * n < 0)
      l -= pi * sign(x) * sign(gy);
    return [l / n, g - sign(n) * sqrt(x * x + gy * gy)];
  };
  return project;
}
function conicEquidistant() {
  return conicProjection(conicEquidistantRaw).scale(131.154).center([0, 13.9389]);
}
var A1 = 1.340264, A2 = -0.081106, A3 = 893e-6, A4 = 3796e-6, M = sqrt(3) / 2, iterations = 12;
function equalEarthRaw(lambda, phi) {
  var l = asin(M * sin(phi)), l2 = l * l, l6 = l2 * l2 * l2;
  return [
    lambda * cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
  ];
}
equalEarthRaw.invert = function(x, y) {
  var l = y, l2 = l * l, l6 = l2 * l2 * l2;
  for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
    fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
    fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
    l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
    if (abs(delta) < epsilon2$1) break;
  }
  return [
    M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos(l),
    asin(sin(l) / M)
  ];
};
function equalEarth() {
  return projection(equalEarthRaw).scale(177.158);
}
function gnomonicRaw(x, y) {
  var cy = cos(y), k = cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}
gnomonicRaw.invert = azimuthalInvert(atan);
function gnomonic() {
  return projection(gnomonicRaw).scale(144.049).clipAngle(60);
}
function identity$3() {
  var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, alpha = 0, ca, sa, x02 = null, y02, x12, y12, kx = 1, ky = 1, transform2 = transformer({
    point: function(x, y) {
      var p = projection2([x, y]);
      this.stream.point(p[0], p[1]);
    }
  }), postclip = identity$4, cache, cacheStream;
  function reset() {
    kx = k * sx;
    ky = k * sy;
    cache = cacheStream = null;
    return projection2;
  }
  function projection2(p) {
    var x = p[0] * kx, y = p[1] * ky;
    if (alpha) {
      var t = y * ca - x * sa;
      x = x * ca + y * sa;
      y = t;
    }
    return [x + tx, y + ty];
  }
  projection2.invert = function(p) {
    var x = p[0] - tx, y = p[1] - ty;
    if (alpha) {
      var t = y * ca + x * sa;
      x = x * ca - y * sa;
      y = t;
    }
    return [x / kx, y / ky];
  };
  projection2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transform2(postclip(cacheStream = stream));
  };
  projection2.postclip = function(_) {
    return arguments.length ? (postclip = _, x02 = y02 = x12 = y12 = null, reset()) : postclip;
  };
  projection2.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x02 = y02 = x12 = y12 = null, identity$4) : clipRectangle(x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  projection2.scale = function(_) {
    return arguments.length ? (k = +_, reset()) : k;
  };
  projection2.translate = function(_) {
    return arguments.length ? (tx = +_[0], ty = +_[1], reset()) : [tx, ty];
  };
  projection2.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees$1;
  };
  projection2.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, reset()) : sx < 0;
  };
  projection2.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, reset()) : sy < 0;
  };
  projection2.fitExtent = function(extent2, object2) {
    return fitExtent(projection2, extent2, object2);
  };
  projection2.fitSize = function(size, object2) {
    return fitSize(projection2, size, object2);
  };
  projection2.fitWidth = function(width, object2) {
    return fitWidth(projection2, width, object2);
  };
  projection2.fitHeight = function(height, object2) {
    return fitHeight(projection2, height, object2);
  };
  return projection2;
}
function naturalEarth1Raw(lambda, phi) {
  var phi2 = phi * phi, phi4 = phi2 * phi2;
  return [
    lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (3971e-6 * phi2 - 1529e-6 * phi4))),
    phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4)))
  ];
}
naturalEarth1Raw.invert = function(x, y) {
  var phi = y, i = 25, delta;
  do {
    var phi2 = phi * phi, phi4 = phi2 * phi2;
    phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4))) - y) / (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 5916e-6 * 11 * phi4)));
  } while (abs(delta) > epsilon && --i > 0);
  return [
    x / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (3971e-6 - 1529e-6 * phi2)))),
    phi
  ];
};
function naturalEarth1() {
  return projection(naturalEarth1Raw).scale(175.295);
}
function orthographicRaw(x, y) {
  return [cos(y) * sin(x), sin(y)];
}
orthographicRaw.invert = azimuthalInvert(asin);
function orthographic() {
  return projection(orthographicRaw).scale(249.5).clipAngle(90 + epsilon);
}
function stereographicRaw(x, y) {
  var cy = cos(y), k = 1 + cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}
stereographicRaw.invert = azimuthalInvert(function(z) {
  return 2 * atan(z);
});
function stereographic() {
  return projection(stereographicRaw).scale(250).clipAngle(142);
}
function transverseMercatorRaw(lambda, phi) {
  return [log(tan((halfPi + phi) / 2)), -lambda];
}
transverseMercatorRaw.invert = function(x, y) {
  return [-y, 2 * atan(exp(x)) - halfPi];
};
function transverseMercator() {
  var m = mercatorProjection(transverseMercatorRaw), center = m.center, rotate = m.rotate;
  m.center = function(_) {
    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
  };
  m.rotate = function(_) {
    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
  };
  return rotate([0, 0, 90]).scale(159.155);
}
const d3Geo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  geoAlbers: albers,
  geoAlbersUsa: albersUsa,
  geoArea: area,
  geoAzimuthalEqualArea: azimuthalEqualArea,
  geoAzimuthalEqualAreaRaw: azimuthalEqualAreaRaw,
  geoAzimuthalEquidistant: azimuthalEquidistant,
  geoAzimuthalEquidistantRaw: azimuthalEquidistantRaw,
  geoBounds: bounds,
  geoCentroid: centroid,
  geoCircle: circle$1,
  geoClipAntimeridian: clipAntimeridian,
  geoClipCircle: clipCircle,
  geoClipExtent: extent,
  geoClipRectangle: clipRectangle,
  geoConicConformal: conicConformal,
  geoConicConformalRaw: conicConformalRaw,
  geoConicEqualArea: conicEqualArea,
  geoConicEqualAreaRaw: conicEqualAreaRaw,
  geoConicEquidistant: conicEquidistant,
  geoConicEquidistantRaw: conicEquidistantRaw,
  geoContains: contains,
  geoDistance: distance,
  geoEqualEarth: equalEarth,
  geoEqualEarthRaw: equalEarthRaw,
  geoEquirectangular: equirectangular,
  geoEquirectangularRaw: equirectangularRaw,
  geoGnomonic: gnomonic,
  geoGnomonicRaw: gnomonicRaw,
  geoGraticule: graticule,
  geoGraticule10: graticule10,
  geoIdentity: identity$3,
  geoInterpolate: interpolate$1,
  geoLength: length,
  geoMercator: mercator,
  geoMercatorRaw: mercatorRaw,
  geoNaturalEarth1: naturalEarth1,
  geoNaturalEarth1Raw: naturalEarth1Raw,
  geoOrthographic: orthographic,
  geoOrthographicRaw: orthographicRaw,
  geoPath: index,
  geoProjection: projection,
  geoProjectionMutator: projectionMutator,
  geoRotation: rotation,
  geoStereographic: stereographic,
  geoStereographicRaw: stereographicRaw,
  geoStream,
  geoTransform: transform$1,
  geoTransverseMercator: transverseMercator,
  geoTransverseMercatorRaw: transverseMercatorRaw
}, Symbol.toStringTag, { value: "Module" }));
function identity$2(x) {
  return x;
}
function transform(transform2) {
  if (transform2 == null) return identity$2;
  var x02, y02, kx = transform2.scale[0], ky = transform2.scale[1], dx = transform2.translate[0], dy = transform2.translate[1];
  return function(input, i) {
    if (!i) x02 = y02 = 0;
    var j = 2, n = input.length, output = new Array(n);
    output[0] = (x02 += input[0]) * kx + dx;
    output[1] = (y02 += input[1]) * ky + dy;
    while (j < n) output[j] = input[j], ++j;
    return output;
  };
}
function reverse(array2, n) {
  var t, j = array2.length, i = j - n;
  while (i < --j) t = array2[i], array2[i++] = array2[j], array2[j] = t;
}
function feature(topology, o) {
  if (typeof o === "string") o = topology.objects[o];
  return o.type === "GeometryCollection" ? { type: "FeatureCollection", features: o.geometries.map(function(o2) {
    return feature$1(topology, o2);
  }) } : feature$1(topology, o);
}
function feature$1(topology, o) {
  var id2 = o.id, bbox = o.bbox, properties = o.properties == null ? {} : o.properties, geometry = object(topology, o);
  return id2 == null && bbox == null ? { type: "Feature", properties, geometry } : bbox == null ? { type: "Feature", id: id2, properties, geometry } : { type: "Feature", id: id2, bbox, properties, geometry };
}
function object(topology, o) {
  var transformPoint = transform(topology.transform), arcs = topology.arcs;
  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k], k));
    }
    if (i < 0) reverse(points, n);
  }
  function point(p) {
    return transformPoint(p);
  }
  function line(arcs2) {
    var points = [];
    for (var i = 0, n = arcs2.length; i < n; ++i) arc(arcs2[i], points);
    if (points.length < 2) points.push(points[0]);
    return points;
  }
  function ring(arcs2) {
    var points = line(arcs2);
    while (points.length < 4) points.push(points[0]);
    return points;
  }
  function polygon(arcs2) {
    return arcs2.map(ring);
  }
  function geometry(o2) {
    var type = o2.type, coordinates2;
    switch (type) {
      case "GeometryCollection":
        return { type, geometries: o2.geometries.map(geometry) };
      case "Point":
        coordinates2 = point(o2.coordinates);
        break;
      case "MultiPoint":
        coordinates2 = o2.coordinates.map(point);
        break;
      case "LineString":
        coordinates2 = line(o2.arcs);
        break;
      case "MultiLineString":
        coordinates2 = o2.arcs.map(line);
        break;
      case "Polygon":
        coordinates2 = polygon(o2.arcs);
        break;
      case "MultiPolygon":
        coordinates2 = o2.arcs.map(polygon);
        break;
      default:
        return null;
    }
    return { type, coordinates: coordinates2 };
  }
  return geometry(o);
}
function stitch(topology, arcs) {
  var stitchedArcs = {}, fragmentByStart = {}, fragmentByEnd = {}, fragments = [], emptyIndex = -1;
  arcs.forEach(function(i, j) {
    var arc = topology.arcs[i < 0 ? ~i : i], t;
    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
    }
  });
  arcs.forEach(function(i) {
    var e = ends(i), start2 = e[0], end = e[1], f, g;
    if (f = fragmentByEnd[start2]) {
      delete fragmentByEnd[f.end];
      f.push(i);
      f.end = end;
      if (g = fragmentByStart[end]) {
        delete fragmentByStart[g.start];
        var fg = g === f ? f : f.concat(g);
        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else if (f = fragmentByStart[end]) {
      delete fragmentByStart[f.start];
      f.unshift(i);
      f.start = start2;
      if (g = fragmentByEnd[start2]) {
        delete fragmentByEnd[g.end];
        var gf = g === f ? f : g.concat(f);
        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
      } else {
        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
      }
    } else {
      f = [i];
      fragmentByStart[f.start = start2] = fragmentByEnd[f.end = end] = f;
    }
  });
  function ends(i) {
    var arc = topology.arcs[i < 0 ? ~i : i], p02 = arc[0], p1;
    if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) {
      p1[0] += dp[0], p1[1] += dp[1];
    });
    else p1 = arc[arc.length - 1];
    return i < 0 ? [p1, p02] : [p02, p1];
  }
  function flush(fragmentByEnd2, fragmentByStart2) {
    for (var k in fragmentByEnd2) {
      var f = fragmentByEnd2[k];
      delete fragmentByStart2[f.start];
      delete f.start;
      delete f.end;
      f.forEach(function(i) {
        stitchedArcs[i < 0 ? ~i : i] = 1;
      });
      fragments.push(f);
    }
  }
  flush(fragmentByEnd, fragmentByStart);
  flush(fragmentByStart, fragmentByEnd);
  arcs.forEach(function(i) {
    if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]);
  });
  return fragments;
}
function mesh(topology) {
  return object(topology, meshArcs.apply(this, arguments));
}
function meshArcs(topology, object2, filter2) {
  var arcs, i, n;
  if (arguments.length > 1) arcs = extractArcs(topology, object2, filter2);
  else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
  return { type: "MultiLineString", arcs: stitch(topology, arcs) };
}
function extractArcs(topology, object2, filter2) {
  var arcs = [], geomsByArc = [], geom;
  function extract0(i) {
    var j = i < 0 ? ~i : i;
    (geomsByArc[j] || (geomsByArc[j] = [])).push({ i, g: geom });
  }
  function extract1(arcs2) {
    arcs2.forEach(extract0);
  }
  function extract2(arcs2) {
    arcs2.forEach(extract1);
  }
  function extract3(arcs2) {
    arcs2.forEach(extract2);
  }
  function geometry(o) {
    switch (geom = o, o.type) {
      case "GeometryCollection":
        o.geometries.forEach(geometry);
        break;
      case "LineString":
        extract1(o.arcs);
        break;
      case "MultiLineString":
      case "Polygon":
        extract2(o.arcs);
        break;
      case "MultiPolygon":
        extract3(o.arcs);
        break;
    }
  }
  geometry(object2);
  geomsByArc.forEach(filter2 == null ? function(geoms) {
    arcs.push(geoms[0].i);
  } : function(geoms) {
    if (filter2(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i);
  });
  return arcs;
}
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames$1(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}
function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name, value: callback });
  return type;
}
var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function array(x) {
  return typeof x === "object" && "length" in x ? x : Array.from(x);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    var group = select2.apply(this, arguments);
    return group == null ? [] : array(group);
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function") select2 = arrayAll(select2);
  else select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection$1(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children() {
  return this.children;
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$2(x) {
  return function() {
    return x;
  };
}
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant$2(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = array(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
  if (onupdate != null) update = onupdate(update);
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(selection2) {
  if (!(selection2 instanceof Selection$1)) throw new Error("invalid merge");
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection$1(merges, this._parents);
}
function selection_order() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare) compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection$1(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create2 = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create2 = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window2 = defaultView(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}
var root = [null];
function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection$1([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
function select(selector2) {
  return typeof selector2 === "string" ? new Selection$1([[document.querySelector(selector2)]], [document.documentElement]) : new Selection$1([[selector2]], root);
}
function sourceEvent(event) {
  let sourceEvent2;
  while (sourceEvent2 = event.sourceEvent) event = sourceEvent2;
  return event;
}
function pointer(event, node) {
  event = sourceEvent(event);
  if (node === void 0) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}
function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function dragDisable(view) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", noevent$1, true);
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", noevent$1, true);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent$1, true);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}
var epsilon2 = 1e-12;
function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}
function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}
function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}
const interpolateZoom = (function zoomRho(rho, rho2, rho4) {
  function zoom2(p02, p1) {
    var ux0 = p02[0], uy0 = p02[1], w0 = p02[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom2.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom2;
})(Math.SQRT2, 2, 4);
var frame = 0, timeout$1 = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}
function timeout(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule(node, name, id2, index2, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name,
    index: index2,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > CREATED) throw new Error("too late; already scheduled");
  return schedule2;
}
function set(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > STARTED) throw new Error("too late; already running");
  return schedule2;
}
function get(node, id2) {
  var schedule2 = node.__transition;
  if (!schedule2 || !(schedule2 = schedule2[id2])) throw new Error("transition not found");
  return schedule2;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule2, 0, self.time);
  function schedule2(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed) start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;
      if (o.state === STARTED) return timeout(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}
function interrupt(node, name) {
  var schedules = node.__transition, schedule2, active, empty2 = true, i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule2 = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule2.state > STARTING && schedule2.state < ENDING;
    schedule2.state = ENDED;
    schedule2.timer.stop();
    schedule2.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule2.index, schedule2.group);
    delete schedules[i];
  }
  if (empty2) delete node.__transition;
}
function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}
function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"), reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"), reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"), reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"), reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"), reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color, color, {
  copy: function(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
}
function rgb_formatRgb() {
  var a = this.opacity;
  a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(") + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.b) || 0)) + (a === 1 ? ")" : ", " + a + ")");
}
function hex(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity;
    a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(") + (this.h || 0) + ", " + (this.s || 0) * 100 + "%, " + (this.l || 0) * 100 + "%" + (a === 1 ? ")" : ", " + a + ")");
  }
}));
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
const constant$1 = (x) => () => x;
function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
}
const interpolateRgb = (function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb$1(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb$1.gamma = rgbGamma;
  return rgb$1;
})(1);
function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function interpolateString(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i]) s[i] += bm;
      else s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: interpolateNumber(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs;
    else s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}
var degrees = 180 / Math.PI;
var identity$1 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$1 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null) return identity$1;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;
      else if (b - a > 180) a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule2.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }
    schedule2.tween = tween1;
  };
}
function transition_tween(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition, name, value) {
  var id2 = transition._id;
  transition.each(function() {
    var schedule2 = set(this, id2);
    (schedule2.value || (schedule2.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get(node, id2).value[name];
  };
}
function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c = color(b)) ? (b = c, interpolateRgb) : interpolateString)(a, b);
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function transition_delay(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get(this.node(), id2).delay;
}
function durationFunction(id2, value) {
  return function() {
    set(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set(this, id2).duration = value;
  };
}
function transition_duration(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get(this.node(), id2).duration;
}
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set(this, id2).ease = value;
  };
}
function transition_ease(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get(this.node(), id2).ease;
}
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set(this, id2).ease = v;
  };
}
function transition_easeVarying(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}
function transition_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}
function transition_merge(transition) {
  if (transition._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule2 = sit(this, id2), on = schedule2.on;
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule2.on = on1;
  };
}
function transition_on(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}
function transition_select(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id2, i, subgroup, get(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}
function transition_selectAll(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select2.call(node, node.__data__, i, group), child, inherit2 = get(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}
var Selection = selection.prototype.constructor;
function transition_selection() {
  return new Selection(this._groups, this._parents);
}
function styleNull(name, interpolate2) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule2 = set(this, id2), on = schedule2.on, listener = schedule2.value[key] == null ? remove2 || (remove2 = styleRemove(name)) : void 0;
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule2.on = on1;
  };
}
function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text(value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}
function transition_transition() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}
function transition_end() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule2 = set(this, id2), on = schedule2.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule2.on = on1;
    });
    if (size === 0) resolve();
  });
}
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function selection_transition(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}
selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;
const constant = (x) => () => x;
function ZoomEvent(type, {
  sourceEvent: sourceEvent2,
  target,
  transform: transform2,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform2, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity = new Transform(1, 0, 0);
Transform.prototype;
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === "wheel") && !event.button;
}
function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
  return this.__zoom || identity;
}
function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform2, extent2, translateExtent) {
  var dx0 = transform2.invertX(extent2[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent2[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent2[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent2[1][1]) - translateExtent[1][1];
  return transform2.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}
function zoom() {
  var filter2 = defaultFilter, extent2 = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate2 = interpolateZoom, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
  function zoom2(selection2) {
    selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  zoom2.transform = function(collection, transform2, point, event) {
    var selection2 = collection.selection ? collection.selection() : collection;
    selection2.property("__zoom", defaultTransform);
    if (collection !== selection2) {
      schedule2(collection, transform2, point, event);
    } else {
      selection2.interrupt().each(function() {
        gesture(this, arguments).event(event).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
      });
    }
  };
  zoom2.scaleBy = function(selection2, k, p, event) {
    zoom2.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };
  zoom2.scaleTo = function(selection2, k, p, event) {
    zoom2.transform(selection2, function() {
      var e = extent2.apply(this, arguments), t0 = this.__zoom, p02 = p == null ? centroid2(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p02), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p02, p1), e, translateExtent);
    }, p, event);
  };
  zoom2.translateBy = function(selection2, x, y, event) {
    zoom2.transform(selection2, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent2.apply(this, arguments), translateExtent);
    }, null, event);
  };
  zoom2.translateTo = function(selection2, x, y, p, event) {
    zoom2.transform(selection2, function() {
      var e = extent2.apply(this, arguments), t = this.__zoom, p02 = p == null ? centroid2(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity.translate(p02[0], p02[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };
  function scale(transform2, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform2.k ? transform2 : new Transform(k, transform2.x, transform2.y);
  }
  function translate(transform2, p02, p1) {
    var x = p02[0] - p1[0] * transform2.k, y = p02[1] - p1[1] * transform2.k;
    return x === transform2.x && y === transform2.y ? transform2 : new Transform(transform2.k, x, y);
  }
  function centroid2(extent3) {
    return [(+extent3[0][0] + +extent3[1][0]) / 2, (+extent3[0][1] + +extent3[1][1]) / 2];
  }
  function schedule2(transition, transform2, point, event) {
    transition.on("start.zoom", function() {
      gesture(this, arguments).event(event).start();
    }).on("interrupt.zoom end.zoom", function() {
      gesture(this, arguments).event(event).end();
    }).tween("zoom", function() {
      var that = this, args = arguments, g = gesture(that, args).event(event), e = extent2.apply(that, args), p = point == null ? centroid2(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate2(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
      return function(t) {
        if (t === 1) t = b;
        else {
          var l = i(t), k = w / l[2];
          t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
        }
        g.zoom(null, t);
      };
    });
  }
  function gesture(that, args, clean) {
    return !clean && that.__zooming || new Gesture(that, args);
  }
  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent2.apply(that, args);
    this.taps = 0;
  }
  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform2) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform2.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform2.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform2.invert(this.touch1[0]);
      this.that.__zoom = transform2;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom2,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function wheeled(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer(event);
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    } else if (t.k === k) return;
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }
    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }
  function mousedowned(event, ...args) {
    if (touchending || !filter2.apply(this, arguments)) return;
    var g = gesture(this, args, true).event(event), v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer(event, currentTarget), currentTarget = event.currentTarget, x02 = event.clientX, y02 = event.clientY;
    dragDisable(event.view);
    nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();
    function mousemoved(event2) {
      noevent(event2);
      if (!g.moved) {
        var dx = event2.clientX - x02, dy = event2.clientY - y02;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }
    function mouseupped(event2) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event2.view, g.moved);
      noevent(event2);
      g.event(event2).end();
    }
  }
  function dblclicked(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var t0 = this.__zoom, p02 = pointer(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p02), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p02, p1), extent2.apply(this, args), translateExtent);
    noevent(event);
    if (duration > 0) select(this).transition().duration(duration).call(schedule2, t1, p02, event);
    else select(this).call(zoom2.transform, t1, p02, event);
  }
  function touchstarted(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }
    if (touchstarting) touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
        touchstarting = null;
      }, touchDelay);
      interrupt(this);
      g.start();
    }
  }
  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
    noevent(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p02 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p02[0]) * dp + (dp = p1[1] - p02[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p02[0] + p1[0]) / 2, (p02[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;
    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }
  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
    nopropagation(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }
  zoom2.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom2) : wheelDelta;
  };
  zoom2.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant(!!_), zoom2) : filter2;
  };
  zoom2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom2) : touchable;
  };
  zoom2.extent = function(_) {
    return arguments.length ? (extent2 = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom2) : extent2;
  };
  zoom2.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom2) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom2.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom2) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom2.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom2) : constrain;
  };
  zoom2.duration = function(_) {
    return arguments.length ? (duration = +_, zoom2) : duration;
  };
  zoom2.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, zoom2) : interpolate2;
  };
  zoom2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom2 : value;
  };
  zoom2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom2) : Math.sqrt(clickDistance2);
  };
  zoom2.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom2) : tapDistance;
  };
  return zoom2;
}
function ownKeys(object2, enumerableOnly) {
  var keys = Object.keys(object2);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object2);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object2, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof(obj);
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var _excluded$a = ["width", "height", "projection", "projectionConfig"];
var geoPath = index, projections = _objectWithoutProperties(d3Geo, ["geoPath"]);
var MapContext = reactExports.createContext();
var makeProjection = function makeProjection2(_ref) {
  var _ref$projectionConfig = _ref.projectionConfig, projectionConfig = _ref$projectionConfig === void 0 ? {} : _ref$projectionConfig, _ref$projection = _ref.projection, projection2 = _ref$projection === void 0 ? "geoEqualEarth" : _ref$projection, _ref$width = _ref.width, width = _ref$width === void 0 ? 800 : _ref$width, _ref$height = _ref.height, height = _ref$height === void 0 ? 600 : _ref$height;
  var isFunc = typeof projection2 === "function";
  if (isFunc) return projection2;
  var proj = projections[projection2]().translate([width / 2, height / 2]);
  var supported = [proj.center ? "center" : null, proj.rotate ? "rotate" : null, proj.scale ? "scale" : null, proj.parallels ? "parallels" : null];
  supported.forEach(function(d) {
    if (!d) return;
    proj = proj[d](projectionConfig[d] || proj[d]());
  });
  return proj;
};
var MapProvider = function MapProvider2(_ref2) {
  var width = _ref2.width, height = _ref2.height, projection2 = _ref2.projection, projectionConfig = _ref2.projectionConfig, restProps = _objectWithoutProperties(_ref2, _excluded$a);
  var _ref3 = projectionConfig.center || [], _ref4 = _slicedToArray(_ref3, 2), cx = _ref4[0], cy = _ref4[1];
  var _ref5 = projectionConfig.rotate || [], _ref6 = _slicedToArray(_ref5, 3), rx = _ref6[0], ry = _ref6[1], rz = _ref6[2];
  var _ref7 = projectionConfig.parallels || [], _ref8 = _slicedToArray(_ref7, 2), p1 = _ref8[0], p2 = _ref8[1];
  var s = projectionConfig.scale || null;
  var projMemo = reactExports.useMemo(function() {
    return makeProjection({
      projectionConfig: {
        center: cx || cx === 0 || cy || cy === 0 ? [cx, cy] : null,
        rotate: rx || rx === 0 || ry || ry === 0 ? [rx, ry, rz] : null,
        parallels: p1 || p1 === 0 || p2 || p2 === 0 ? [p1, p2] : null,
        scale: s
      },
      projection: projection2,
      width,
      height
    });
  }, [width, height, projection2, cx, cy, rx, ry, rz, p1, p2, s]);
  var proj = reactExports.useCallback(projMemo, [projMemo]);
  var value = reactExports.useMemo(function() {
    return {
      width,
      height,
      projection: proj,
      path: geoPath().projection(proj)
    };
  }, [width, height, proj]);
  return /* @__PURE__ */ React.createElement(MapContext.Provider, _extends({
    value
  }, restProps));
};
MapProvider.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  projection: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  projectionConfig: PropTypes.object
};
var useMapContext = function useMapContext2() {
  return reactExports.useContext(MapContext);
};
var _excluded$9 = ["width", "height", "projection", "projectionConfig", "className"];
var ComposableMap = reactExports.forwardRef(function(_ref, ref) {
  var _ref$width = _ref.width, width = _ref$width === void 0 ? 800 : _ref$width, _ref$height = _ref.height, height = _ref$height === void 0 ? 600 : _ref$height, _ref$projection = _ref.projection, projection2 = _ref$projection === void 0 ? "geoEqualEarth" : _ref$projection, _ref$projectionConfig = _ref.projectionConfig, projectionConfig = _ref$projectionConfig === void 0 ? {} : _ref$projectionConfig, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded$9);
  return /* @__PURE__ */ React.createElement(MapProvider, {
    width,
    height,
    projection: projection2,
    projectionConfig
  }, /* @__PURE__ */ React.createElement("svg", _extends({
    ref,
    viewBox: "0 0 ".concat(width, " ").concat(height),
    className: "rsm-svg ".concat(className)
  }, restProps)));
});
ComposableMap.displayName = "ComposableMap";
ComposableMap.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  projection: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  projectionConfig: PropTypes.object,
  className: PropTypes.string
};
function getCoords(w, h, t) {
  var xOffset = (w * t.k - w) / 2;
  var yOffset = (h * t.k - h) / 2;
  return [w / 2 - (xOffset + t.x) / t.k, h / 2 - (yOffset + t.y) / t.k];
}
function fetchGeographies(url) {
  return fetch(url).then(function(res) {
    if (!res.ok) {
      throw Error(res.statusText);
    }
    return res.json();
  })["catch"](function(error) {
    console.log("There was a problem when fetching the data: ", error);
  });
}
function getFeatures(geographies, parseGeographies) {
  var isTopojson = geographies.type === "Topology";
  if (!isTopojson) {
    return parseGeographies ? parseGeographies(geographies.features || geographies) : geographies.features || geographies;
  }
  var feats = feature(geographies, geographies.objects[Object.keys(geographies.objects)[0]]).features;
  return parseGeographies ? parseGeographies(feats) : feats;
}
function getMesh(geographies) {
  var isTopojson = geographies.type === "Topology";
  if (!isTopojson) return null;
  var outline = mesh(geographies, geographies.objects[Object.keys(geographies.objects)[0]], function(a, b) {
    return a === b;
  });
  var borders = mesh(geographies, geographies.objects[Object.keys(geographies.objects)[0]], function(a, b) {
    return a !== b;
  });
  return {
    outline,
    borders
  };
}
function prepareMesh(outline, borders, path) {
  return outline && borders ? {
    outline: _objectSpread2(_objectSpread2({}, outline), {}, {
      rsmKey: "outline",
      svgPath: path(outline)
    }),
    borders: _objectSpread2(_objectSpread2({}, borders), {}, {
      rsmKey: "borders",
      svgPath: path(borders)
    })
  } : {};
}
function prepareFeatures(geographies, path) {
  return geographies ? geographies.map(function(d, i) {
    return _objectSpread2(_objectSpread2({}, d), {}, {
      rsmKey: "geo-".concat(i),
      svgPath: path(d)
    });
  }) : [];
}
function createConnectorPath() {
  var dx = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 30;
  var dy = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 30;
  var curve = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.5;
  var curvature = Array.isArray(curve) ? curve : [curve, curve];
  var curveX = dx / 2 * curvature[0];
  var curveY = dy / 2 * curvature[1];
  return "M".concat(0, ",", 0, " Q", -dx / 2 - curveX, ",").concat(-dy / 2 + curveY, " ").concat(-dx, ",").concat(-dy);
}
function isString(geo) {
  return typeof geo === "string";
}
function useGeographies(_ref) {
  var geography = _ref.geography, parseGeographies = _ref.parseGeographies;
  var _useContext = reactExports.useContext(MapContext), path = _useContext.path;
  var _useState = reactExports.useState({}), _useState2 = _slicedToArray(_useState, 2), output = _useState2[0], setOutput = _useState2[1];
  reactExports.useEffect(function() {
    if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "undefined") return;
    if (!geography) return;
    if (isString(geography)) {
      fetchGeographies(geography).then(function(geos) {
        if (geos) {
          setOutput({
            geographies: getFeatures(geos, parseGeographies),
            mesh: getMesh(geos)
          });
        }
      });
    } else {
      setOutput({
        geographies: getFeatures(geography, parseGeographies),
        mesh: getMesh(geography)
      });
    }
  }, [geography, parseGeographies]);
  var _useMemo = reactExports.useMemo(function() {
    var mesh2 = output.mesh || {};
    var preparedMesh = prepareMesh(mesh2.outline, mesh2.borders, path);
    return {
      geographies: prepareFeatures(output.geographies, path),
      outline: preparedMesh.outline,
      borders: preparedMesh.borders
    };
  }, [output, path]), geographies = _useMemo.geographies, outline = _useMemo.outline, borders = _useMemo.borders;
  return {
    geographies,
    outline,
    borders
  };
}
var _excluded$8 = ["geography", "children", "parseGeographies", "className"];
var Geographies = reactExports.forwardRef(function(_ref, ref) {
  var geography = _ref.geography, children2 = _ref.children, parseGeographies = _ref.parseGeographies, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded$8);
  var _useContext = reactExports.useContext(MapContext), path = _useContext.path, projection2 = _useContext.projection;
  var _useGeographies = useGeographies({
    geography,
    parseGeographies
  }), geographies = _useGeographies.geographies, outline = _useGeographies.outline, borders = _useGeographies.borders;
  return /* @__PURE__ */ React.createElement("g", _extends({
    ref,
    className: "rsm-geographies ".concat(className)
  }, restProps), geographies && geographies.length > 0 && children2({
    geographies,
    outline,
    borders,
    path,
    projection: projection2
  }));
});
Geographies.displayName = "Geographies";
Geographies.propTypes = {
  geography: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  children: PropTypes.func,
  parseGeographies: PropTypes.func,
  className: PropTypes.string
};
var _excluded$7 = ["geography", "onMouseEnter", "onMouseLeave", "onMouseDown", "onMouseUp", "onFocus", "onBlur", "style", "className"];
var Geography = reactExports.forwardRef(function(_ref, ref) {
  var geography = _ref.geography, onMouseEnter = _ref.onMouseEnter, onMouseLeave = _ref.onMouseLeave, onMouseDown = _ref.onMouseDown, onMouseUp = _ref.onMouseUp, onFocus = _ref.onFocus, onBlur = _ref.onBlur, _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded$7);
  var _useState = reactExports.useState(false), _useState2 = _slicedToArray(_useState, 2), isPressed = _useState2[0], setPressed = _useState2[1];
  var _useState3 = reactExports.useState(false), _useState4 = _slicedToArray(_useState3, 2), isFocused = _useState4[0], setFocus = _useState4[1];
  function handleMouseEnter(evt) {
    setFocus(true);
    if (onMouseEnter) onMouseEnter(evt);
  }
  function handleMouseLeave(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onMouseLeave) onMouseLeave(evt);
  }
  function handleFocus(evt) {
    setFocus(true);
    if (onFocus) onFocus(evt);
  }
  function handleBlur(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onBlur) onBlur(evt);
  }
  function handleMouseDown(evt) {
    setPressed(true);
    if (onMouseDown) onMouseDown(evt);
  }
  function handleMouseUp(evt) {
    setPressed(false);
    if (onMouseUp) onMouseUp(evt);
  }
  return /* @__PURE__ */ React.createElement("path", _extends({
    ref,
    tabIndex: "0",
    className: "rsm-geography ".concat(className),
    d: geography.svgPath,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    style: style[isPressed || isFocused ? isPressed ? "pressed" : "hover" : "default"]
  }, restProps));
});
Geography.displayName = "Geography";
Geography.propTypes = {
  geography: PropTypes.object,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string
};
var Geography$1 = reactExports.memo(Geography);
var _excluded$6 = ["fill", "stroke", "step", "className"];
var Graticule = reactExports.forwardRef(function(_ref, ref) {
  var _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, _ref$stroke = _ref.stroke, stroke = _ref$stroke === void 0 ? "currentcolor" : _ref$stroke, _ref$step = _ref.step, step = _ref$step === void 0 ? [10, 10] : _ref$step, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded$6);
  var _useContext = reactExports.useContext(MapContext), path = _useContext.path;
  return /* @__PURE__ */ React.createElement("path", _extends({
    ref,
    d: path(graticule().step(step)()),
    fill,
    stroke,
    className: "rsm-graticule ".concat(className)
  }, restProps));
});
Graticule.displayName = "Graticule";
Graticule.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
  step: PropTypes.array,
  className: PropTypes.string
};
reactExports.memo(Graticule);
var _excluded$5 = ["value"];
var ZoomPanContext = reactExports.createContext();
var defaultValue = {
  x: 0,
  y: 0,
  k: 1,
  transformString: "translate(0 0) scale(1)"
};
var ZoomPanProvider = function ZoomPanProvider2(_ref) {
  var _ref$value = _ref.value, value = _ref$value === void 0 ? defaultValue : _ref$value, restProps = _objectWithoutProperties(_ref, _excluded$5);
  return /* @__PURE__ */ React.createElement(ZoomPanContext.Provider, _extends({
    value
  }, restProps));
};
ZoomPanProvider.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  k: PropTypes.number,
  transformString: PropTypes.string
};
function useZoomPan(_ref) {
  var center = _ref.center, filterZoomEvent = _ref.filterZoomEvent, onMoveStart = _ref.onMoveStart, onMoveEnd = _ref.onMoveEnd, onMove = _ref.onMove, _ref$translateExtent = _ref.translateExtent, translateExtent = _ref$translateExtent === void 0 ? [[-Infinity, -Infinity], [Infinity, Infinity]] : _ref$translateExtent, _ref$scaleExtent = _ref.scaleExtent, scaleExtent = _ref$scaleExtent === void 0 ? [1, 8] : _ref$scaleExtent, _ref$zoom = _ref.zoom, zoom$1 = _ref$zoom === void 0 ? 1 : _ref$zoom;
  var _useContext = reactExports.useContext(MapContext), width = _useContext.width, height = _useContext.height, projection2 = _useContext.projection;
  var _center = _slicedToArray(center, 2), lon = _center[0], lat = _center[1];
  var _useState = reactExports.useState({
    x: 0,
    y: 0,
    k: 1
  }), _useState2 = _slicedToArray(_useState, 2), position = _useState2[0], setPosition = _useState2[1];
  var lastPosition = reactExports.useRef({
    x: 0,
    y: 0,
    k: 1
  });
  var mapRef = reactExports.useRef();
  var zoomRef = reactExports.useRef();
  var bypassEvents = reactExports.useRef(false);
  var _translateExtent = _slicedToArray(translateExtent, 2), a = _translateExtent[0], b = _translateExtent[1];
  var _a = _slicedToArray(a, 2), a1 = _a[0], a2 = _a[1];
  var _b = _slicedToArray(b, 2), b1 = _b[0], b2 = _b[1];
  var _scaleExtent = _slicedToArray(scaleExtent, 2), minZoom = _scaleExtent[0], maxZoom = _scaleExtent[1];
  reactExports.useEffect(function() {
    var svg = select(mapRef.current);
    function handleZoomStart(d3Event) {
      if (!onMoveStart || bypassEvents.current) return;
      onMoveStart({
        coordinates: projection2.invert(getCoords(width, height, d3Event.transform)),
        zoom: d3Event.transform.k
      }, d3Event);
    }
    function handleZoom(d3Event) {
      if (bypassEvents.current) return;
      var transform2 = d3Event.transform, sourceEvent2 = d3Event.sourceEvent;
      setPosition({
        x: transform2.x,
        y: transform2.y,
        k: transform2.k,
        dragging: sourceEvent2
      });
      if (!onMove) return;
      onMove({
        x: transform2.x,
        y: transform2.y,
        zoom: transform2.k,
        dragging: sourceEvent2
      }, d3Event);
    }
    function handleZoomEnd(d3Event) {
      if (bypassEvents.current) {
        bypassEvents.current = false;
        return;
      }
      var _projection$invert = projection2.invert(getCoords(width, height, d3Event.transform)), _projection$invert2 = _slicedToArray(_projection$invert, 2), x = _projection$invert2[0], y = _projection$invert2[1];
      lastPosition.current = {
        x,
        y,
        k: d3Event.transform.k
      };
      if (!onMoveEnd) return;
      onMoveEnd({
        coordinates: [x, y],
        zoom: d3Event.transform.k
      }, d3Event);
    }
    function filterFunc(d3Event) {
      if (filterZoomEvent) {
        return filterZoomEvent(d3Event);
      }
      return d3Event ? !d3Event.ctrlKey && !d3Event.button : false;
    }
    var zoom$12 = zoom().filter(filterFunc).scaleExtent([minZoom, maxZoom]).translateExtent([[a1, a2], [b1, b2]]).on("start", handleZoomStart).on("zoom", handleZoom).on("end", handleZoomEnd);
    zoomRef.current = zoom$12;
    svg.call(zoom$12);
  }, [width, height, a1, a2, b1, b2, minZoom, maxZoom, projection2, onMoveStart, onMove, onMoveEnd, filterZoomEvent]);
  reactExports.useEffect(function() {
    if (lon === lastPosition.current.x && lat === lastPosition.current.y && zoom$1 === lastPosition.current.k) return;
    var coords = projection2([lon, lat]);
    var x = coords[0] * zoom$1;
    var y = coords[1] * zoom$1;
    var svg = select(mapRef.current);
    bypassEvents.current = true;
    svg.call(zoomRef.current.transform, identity.translate(width / 2 - x, height / 2 - y).scale(zoom$1));
    setPosition({
      x: width / 2 - x,
      y: height / 2 - y,
      k: zoom$1
    });
    lastPosition.current = {
      x: lon,
      y: lat,
      k: zoom$1
    };
  }, [lon, lat, zoom$1, width, height, projection2]);
  return {
    mapRef,
    position,
    transformString: "translate(".concat(position.x, " ").concat(position.y, ") scale(").concat(position.k, ")")
  };
}
var _excluded$4 = ["center", "zoom", "minZoom", "maxZoom", "translateExtent", "filterZoomEvent", "onMoveStart", "onMove", "onMoveEnd", "className"];
var ZoomableGroup = reactExports.forwardRef(function(_ref, ref) {
  var _ref$center = _ref.center, center = _ref$center === void 0 ? [0, 0] : _ref$center, _ref$zoom = _ref.zoom, zoom2 = _ref$zoom === void 0 ? 1 : _ref$zoom, _ref$minZoom = _ref.minZoom, minZoom = _ref$minZoom === void 0 ? 1 : _ref$minZoom, _ref$maxZoom = _ref.maxZoom, maxZoom = _ref$maxZoom === void 0 ? 8 : _ref$maxZoom, translateExtent = _ref.translateExtent, filterZoomEvent = _ref.filterZoomEvent, onMoveStart = _ref.onMoveStart, onMove = _ref.onMove, onMoveEnd = _ref.onMoveEnd, className = _ref.className, restProps = _objectWithoutProperties(_ref, _excluded$4);
  var _useContext = reactExports.useContext(MapContext), width = _useContext.width, height = _useContext.height;
  var _useZoomPan = useZoomPan({
    center,
    filterZoomEvent,
    onMoveStart,
    onMove,
    onMoveEnd,
    scaleExtent: [minZoom, maxZoom],
    translateExtent,
    zoom: zoom2
  }), mapRef = _useZoomPan.mapRef, transformString = _useZoomPan.transformString, position = _useZoomPan.position;
  return /* @__PURE__ */ React.createElement(ZoomPanProvider, {
    value: {
      x: position.x,
      y: position.y,
      k: position.k,
      transformString
    }
  }, /* @__PURE__ */ React.createElement("g", {
    ref: mapRef
  }, /* @__PURE__ */ React.createElement("rect", {
    width,
    height,
    fill: "transparent"
  }), /* @__PURE__ */ React.createElement("g", _extends({
    ref,
    transform: transformString,
    className: "rsm-zoomable-group ".concat(className)
  }, restProps))));
});
ZoomableGroup.displayName = "ZoomableGroup";
ZoomableGroup.propTypes = {
  center: PropTypes.array,
  zoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  translateExtent: PropTypes.arrayOf(PropTypes.array),
  onMoveStart: PropTypes.func,
  onMove: PropTypes.func,
  onMoveEnd: PropTypes.func,
  className: PropTypes.string
};
var _excluded$3 = ["id", "fill", "stroke", "strokeWidth", "className"];
var Sphere = reactExports.forwardRef(function(_ref, ref) {
  var _ref$id = _ref.id, id2 = _ref$id === void 0 ? "rsm-sphere" : _ref$id, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, _ref$stroke = _ref.stroke, stroke = _ref$stroke === void 0 ? "currentcolor" : _ref$stroke, _ref$strokeWidth = _ref.strokeWidth, strokeWidth = _ref$strokeWidth === void 0 ? 0.5 : _ref$strokeWidth, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded$3);
  var _useContext = reactExports.useContext(MapContext), path = _useContext.path;
  var spherePath = reactExports.useMemo(function() {
    return path({
      type: "Sphere"
    });
  }, [path]);
  return /* @__PURE__ */ React.createElement(reactExports.Fragment, null, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", {
    id: id2
  }, /* @__PURE__ */ React.createElement("path", {
    d: spherePath
  }))), /* @__PURE__ */ React.createElement("path", _extends({
    ref,
    d: spherePath,
    fill,
    stroke,
    strokeWidth,
    style: {
      pointerEvents: "none"
    },
    className: "rsm-sphere ".concat(className)
  }, restProps)));
});
Sphere.displayName = "Sphere";
Sphere.propTypes = {
  id: PropTypes.string,
  fill: PropTypes.string,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  className: PropTypes.string
};
reactExports.memo(Sphere);
var _excluded$2 = ["coordinates", "children", "onMouseEnter", "onMouseLeave", "onMouseDown", "onMouseUp", "onFocus", "onBlur", "style", "className"];
var Marker = reactExports.forwardRef(function(_ref, ref) {
  var coordinates2 = _ref.coordinates, children2 = _ref.children, onMouseEnter = _ref.onMouseEnter, onMouseLeave = _ref.onMouseLeave, onMouseDown = _ref.onMouseDown, onMouseUp = _ref.onMouseUp, onFocus = _ref.onFocus, onBlur = _ref.onBlur, _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded$2);
  var _useContext = reactExports.useContext(MapContext), projection2 = _useContext.projection;
  var _useState = reactExports.useState(false), _useState2 = _slicedToArray(_useState, 2), isPressed = _useState2[0], setPressed = _useState2[1];
  var _useState3 = reactExports.useState(false), _useState4 = _slicedToArray(_useState3, 2), isFocused = _useState4[0], setFocus = _useState4[1];
  var _projection = projection2(coordinates2), _projection2 = _slicedToArray(_projection, 2), x = _projection2[0], y = _projection2[1];
  function handleMouseEnter(evt) {
    setFocus(true);
    if (onMouseEnter) onMouseEnter(evt);
  }
  function handleMouseLeave(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onMouseLeave) onMouseLeave(evt);
  }
  function handleFocus(evt) {
    setFocus(true);
    if (onFocus) onFocus(evt);
  }
  function handleBlur(evt) {
    setFocus(false);
    if (isPressed) setPressed(false);
    if (onBlur) onBlur(evt);
  }
  function handleMouseDown(evt) {
    setPressed(true);
    if (onMouseDown) onMouseDown(evt);
  }
  function handleMouseUp(evt) {
    setPressed(false);
    if (onMouseUp) onMouseUp(evt);
  }
  return /* @__PURE__ */ React.createElement("g", _extends({
    ref,
    transform: "translate(".concat(x, ", ").concat(y, ")"),
    className: "rsm-marker ".concat(className),
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    style: style[isPressed || isFocused ? isPressed ? "pressed" : "hover" : "default"]
  }, restProps), children2);
});
Marker.displayName = "Marker";
Marker.propTypes = {
  coordinates: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string
};
var _excluded$1 = ["from", "to", "coordinates", "stroke", "strokeWidth", "fill", "className"];
var Line = reactExports.forwardRef(function(_ref, ref) {
  var _ref$from = _ref.from, from = _ref$from === void 0 ? [0, 0] : _ref$from, _ref$to = _ref.to, to = _ref$to === void 0 ? [0, 0] : _ref$to, coordinates2 = _ref.coordinates, _ref$stroke = _ref.stroke, stroke = _ref$stroke === void 0 ? "currentcolor" : _ref$stroke, _ref$strokeWidth = _ref.strokeWidth, strokeWidth = _ref$strokeWidth === void 0 ? 3 : _ref$strokeWidth, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded$1);
  var _useContext = reactExports.useContext(MapContext), path = _useContext.path;
  var lineData = {
    type: "LineString",
    coordinates: coordinates2 || [from, to]
  };
  return /* @__PURE__ */ React.createElement("path", _extends({
    ref,
    d: path(lineData),
    className: "rsm-line ".concat(className),
    stroke,
    strokeWidth,
    fill
  }, restProps));
});
Line.displayName = "Line";
Line.propTypes = {
  from: PropTypes.array,
  to: PropTypes.array,
  coordinates: PropTypes.array,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  fill: PropTypes.string,
  className: PropTypes.string
};
var _excluded = ["subject", "children", "connectorProps", "dx", "dy", "curve", "className"];
var Annotation = reactExports.forwardRef(function(_ref, ref) {
  var subject = _ref.subject, children2 = _ref.children, connectorProps = _ref.connectorProps, _ref$dx = _ref.dx, dx = _ref$dx === void 0 ? 30 : _ref$dx, _ref$dy = _ref.dy, dy = _ref$dy === void 0 ? 30 : _ref$dy, _ref$curve = _ref.curve, curve = _ref$curve === void 0 ? 0 : _ref$curve, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, restProps = _objectWithoutProperties(_ref, _excluded);
  var _useContext = reactExports.useContext(MapContext), projection2 = _useContext.projection;
  var _projection = projection2(subject), _projection2 = _slicedToArray(_projection, 2), x = _projection2[0], y = _projection2[1];
  var connectorPath = createConnectorPath(dx, dy, curve);
  return /* @__PURE__ */ React.createElement("g", _extends({
    ref,
    transform: "translate(".concat(x + dx, ", ").concat(y + dy, ")"),
    className: "rsm-annotation ".concat(className)
  }, restProps), /* @__PURE__ */ React.createElement("path", _extends({
    d: connectorPath,
    fill: "transparent",
    stroke: "#000"
  }, connectorProps)), children2);
});
Annotation.displayName = "Annotation";
Annotation.propTypes = {
  subject: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  dx: PropTypes.number,
  dy: PropTypes.number,
  curve: PropTypes.number,
  connectorProps: PropTypes.object,
  className: PropTypes.string
};
const cities = [{ "cityId": "tokyo", "cityName": "Tokyo, Japan", "continent": "asia", "lat": 35.6762, "lng": 139.6503, "funFact": "Tokyo is the world's most populated metropolitan area, home to over 37 million people — that's more than the entire country of Canada!", "clues": [{ "emoji": "🍣", "text": "Jaime watched chefs at a world-famous fish market auction off an enormous tuna in the early hours of the morning." }, { "emoji": "🌸", "text": "Thousands of people gathered under trees bursting with pink blossoms, picnicking and celebrating the arrival of spring." }, { "emoji": "🚅", "text": "Jeff zoomed through the countryside on a bullet train so fast that a famous snow-capped mountain was just a white blur out the window!" }] }, { "cityId": "london", "cityName": "London, England", "continent": "europe", "lat": 51.5074, "lng": -0.1276, "funFact": "London's underground railway — called the Tube — is the oldest metro system in the world, opening all the way back in 1863!", "clues": [{ "emoji": "🚌", "text": "Jaime spotted bright red double-decker buses weaving through busy streets lined with enormous museums on every corner." }, { "emoji": "🕐", "text": "Jeff photographed a giant clock tower that chimes every quarter hour — its deep bells can be heard all across the city." }, { "emoji": "👑", "text": "A guard in a tall furry black hat stood perfectly still outside a royal palace — he was not allowed to smile, no matter what!" }] }, { "cityId": "buenos-aires", "cityName": "Buenos Aires, Argentina", "continent": "southAmerica", "lat": -34.6037, "lng": -58.3816, "funFact": "Buenos Aires is called the 'Paris of South America' because of its wide tree-lined boulevards and European-style architecture!", "clues": [{ "emoji": "💃", "text": "They spotted couples dancing cheek to cheek in a dramatic style, dipping and spinning to passionate music right in the street." }, { "emoji": "🥩", "text": "Jeff wrote home: 'We had the most amazing grilled beef at a cookout called an asado — everyone here loves it!'" }, { "emoji": "⚽", "text": "A fan showed Jaime a jersey from a football legend — many call him the greatest of all time, and he was born right here in this city." }] }, { "cityId": "sydney", "cityName": "Sydney, Australia", "continent": "oceania", "lat": -33.8688, "lng": 151.2093, "funFact": "Sydney is home to the famous Opera House — one of the most recognisable buildings in the world, with its iconic sail-like roof sitting right on Sydney Harbour!", "clues": [{ "emoji": "🎭", "text": "Jaime saw a building shaped like giant white shells sitting on the edge of a sparkling harbour — one of the most photographed buildings on Earth." }, { "emoji": "🦘", "text": "Jeff spotted an animal hopping along a dusty trail — this creature lives naturally in only one country in the whole world." }, { "emoji": "🏄", "text": "A surf instructor told them people here have been riding ocean waves since before it was recognised as a sport anywhere else." }] }, { "cityId": "lima", "cityName": "Lima, Peru", "continent": "southAmerica", "lat": -12.0464, "lng": -77.0428, "funFact": "Lima is one of the largest cities in South America and sits right on the Pacific coast — you can watch the sun set over the ocean every evening!", "clues": [{ "emoji": "🌊", "text": "Jeff stood on a high cliff and watched paragliders soaring out over the Pacific Ocean — the city stretches right to the edge of the coast." }, { "emoji": "🍋", "text": "Jaime tasted ceviche — fresh raw fish marinated in citrus juice and chilli — a dish said to have been invented right here in this city." }, { "emoji": "🏛️", "text": "They explored a grand historic main square surrounded by a cathedral and colonial palaces built hundreds of years ago." }] }, { "cityId": "rome", "cityName": "Rome, Italy", "continent": "europe", "lat": 41.9028, "lng": 12.4964, "funFact": "Rome is called the 'Eternal City' and has been continuously inhabited for over 2,800 years — making it one of the oldest cities in the world!", "clues": [{ "emoji": "🏟️", "text": "They bought tickets to visit a huge oval stone arena where thousands once watched gladiators battle — still standing after nearly 2,000 years!" }, { "emoji": "🍕", "text": "Jeff found the original pizza — just flatbread with tomato and melted cheese, no extra toppings, eaten folded in half in the street." }, { "emoji": "⛲", "text": "Jaime threw a coin into an enormous ornate fountain to make a wish — over a million coins are tossed in by visitors every single year." }] }, { "cityId": "seoul", "cityName": "Seoul, South Korea", "continent": "asia", "lat": 37.5665, "lng": 126.978, "funFact": "Seoul is one of the most connected cities in the world — South Korea has the fastest average internet speeds on the planet!", "clues": [{ "emoji": "🎭", "text": "Jeff bought a colourful Talchum mask at a street market — used in traditional performances he watched in the old palace grounds." }, { "emoji": "🎵", "text": "Jaime spent an hour listening to K-Pop in a music shop and asked the owner for a poster of her favourite group." }, { "emoji": "📱", "text": "A tech journalist spotted them at an electronics fair in a city famous for being home to one of the world's biggest phone companies." }] }, { "cityId": "madrid", "cityName": "Madrid, Spain", "continent": "europe", "lat": 40.4168, "lng": -3.7038, "funFact": "Madrid is the highest capital city in the European Union, sitting 667 metres above sea level — and it's home to the Prado Museum, one of the world's greatest art galleries!", "clues": [{ "emoji": "💃", "text": "Jeff watched performers on a street corner stomping their feet and clicking castanets in a fiery, passionate dance." }, { "emoji": "🐂", "text": "Jaime read a poster about a famous festival where brave runners dash through narrow streets with bulls charging right behind them." }, { "emoji": "🥘", "text": "A chef served them paella — a colourful dish of rice, seafood, and vegetables all cooked together in one giant flat pan." }] }, { "cityId": "paris", "cityName": "Paris, France", "continent": "europe", "lat": 48.8566, "lng": 2.3522, "funFact": "Paris has more than 1,800 patisseries (pastry shops) and is considered the world capital of fashion and fine art!", "clues": [{ "emoji": "🗼", "text": "Jaime looked up at a giant iron tower twinkling with thousands of lights — after dark it sparkles every hour for five whole minutes!" }, { "emoji": "🥐", "text": "Jeff stopped at a bakery and tried a buttery, flaky crescent-shaped pastry that people here eat for breakfast every single morning." }, { "emoji": "🎨", "text": "They spent an afternoon in the world's most visited art museum, gazing at a famous portrait of a woman with a mysterious smile." }] }, { "cityId": "nairobi", "cityName": "Nairobi, Kenya", "continent": "africa", "lat": -1.2921, "lng": 36.8219, "funFact": "Nairobi is the only capital city in the world with a national park right inside its boundaries — you can watch lions and giraffes roam with city skyscrapers in the background!", "clues": [{ "emoji": "🦁", "text": "Jeff saw a lion resting in the shade while zebras grazed nearby — with the glittering city skyline visible right behind them." }, { "emoji": "🌍", "text": "Jaime spoke to a safari guide who said this city is the only capital in the world with a national park right inside its boundaries." }, { "emoji": "🏃", "text": "A coach told them this country produces some of the world's greatest long-distance runners — with more Olympic gold medals than almost anywhere else." }] }, { "cityId": "cape-town", "cityName": "Cape Town, South Africa", "continent": "africa", "lat": -33.9249, "lng": 18.4241, "funFact": "Cape Town sits at the foot of Table Mountain — a famous flat-topped mountain that often has a 'tablecloth' of cloud rolling over it!", "clues": [{ "emoji": "🐧", "text": "Jeff spotted a whole colony of penguins waddling along a beach — the only place in Africa where they live in the wild." }, { "emoji": "🏔️", "text": "Jaime looked up and saw a famous flat-topped mountain standing right over the city, like a giant natural table in the sky." }, { "emoji": "🌈", "text": "A local told them their country is called the 'Rainbow Nation' because so many different cultures, languages, and peoples live side by side here." }] }, { "cityId": "mexico-city", "cityName": "Mexico City, Mexico", "continent": "northAmerica", "lat": 19.4326, "lng": -99.1332, "funFact": "Mexico City was built on the ruins of the ancient Aztec capital Tenochtitlan — and incredible pyramids are just a short drive away!", "clues": [{ "emoji": "🌮", "text": "Jeff tried a soft corn tortilla filled with spiced meat and fresh herbs — sold from a street stall on practically every single corner." }, { "emoji": "🎺", "text": "Jaime heard a mariachi band playing guitars, trumpets, and violins in the main square — everyone nearby clapping and singing along." }, { "emoji": "🏛️", "text": "They visited ancient stone pyramids just outside the city — built over a thousand years ago by one of the world's most powerful civilisations." }] }];
const rawData = {
  cities
};
const CITIES = rawData.cities;
const ROUTE_LENGTH = 8;
const MAX_MOVES = 14;
const TRAVEL_MS = 1600;
const EXCLAMATION_SRCS = [exclamHurray, exclamWayToGo, exclamYouDidIt, exclamYouGotIt];
const GEO_URL = "/data/world-110m.json";
const HQ_COORD = [-79.38, 43.65];
const CITY_MUSIC = {
  "tokyo": "/music/JAPAN.wav",
  "london": "/music/UK.wav",
  "buenos-aires": "/music/ARGENTINA DRUMS AND HORNS_1.2.wav",
  "sydney": "/music/Jamie Jangles_Daniel_Australia.wav",
  "lima": "/music/PERU.wav",
  "rome": "/music/ITALY.wav",
  "seoul": "/music/SOUTH KOREA.wav",
  "madrid": "/music/SPAIN1.2.wav",
  "paris": "/music/FRANCE.wav",
  "nairobi": "/music/KENYA.wav",
  "cape-town": "/music/SOUTH AFRICA_1.2.wav",
  "mexico-city": "/music/MEXICO.wav"
};
const CITY_INFO = {
  "tokyo": { flag: "🇯🇵", country: "Japan", musicStyle: "J-Pop & Taiko", musicFact: "Taiko drumming goes back over 1,000 years and was used to signal armies in battle!" },
  "london": { flag: "🇬🇧", country: "England", musicStyle: "Rock & Pop", musicFact: "London is the birthplace of some of the world's most famous rock bands!" },
  "buenos-aires": { flag: "🇦🇷", country: "Argentina", musicStyle: "Tango", musicFact: "Tango was born in Buenos Aires in the late 1800s and is now danced worldwide!" },
  "sydney": { flag: "🇦🇺", country: "Australia", musicStyle: "Didgeridoo & Pop", musicFact: "The didgeridoo is one of the oldest wind instruments on Earth — over 1,500 years old!" },
  "lima": { flag: "🇵🇪", country: "Peru", musicStyle: "Andean Folk", musicFact: "The pan flute (zampoña) has been played in the Andes mountains for thousands of years!" },
  "rome": { flag: "🇮🇹", country: "Italy", musicStyle: "Opera & Folk", musicFact: "Italy invented the piano and opera — two of the most popular musical forms in history!" },
  "seoul": { flag: "🇰🇷", country: "South Korea", musicStyle: "K-Pop", musicFact: "K-Pop groups like BTS have millions of fans in every country on the planet!" },
  "madrid": { flag: "🇪🇸", country: "Spain", musicStyle: "Flamenco", musicFact: "Flamenco is so special that UNESCO listed it as an Intangible Cultural Heritage of Humanity!" },
  "paris": { flag: "🇫🇷", country: "France", musicStyle: "Chanson & Accordion", musicFact: "The accordion is the sound of Paris — street musicians have played it here for over 200 years!" },
  "nairobi": { flag: "🇰🇪", country: "Kenya", musicStyle: "Benga & Afropop", musicFact: "Benga music started in Kenya in the 1940s and blends traditional rhythms with electric guitar!" },
  "cape-town": { flag: "🇿🇦", country: "South Africa", musicStyle: "Kwaito & Mbaqanga", musicFact: "South Africa has 11 official languages — and almost as many music styles to match!" },
  "mexico-city": { flag: "🇲🇽", country: "Mexico", musicStyle: "Mariachi", musicFact: "Mariachi bands traditionally wear charro suits and sombrero hats when they perform!" }
};
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function generateRoute() {
  const byContinent = {};
  for (const c of CITIES) {
    if (!byContinent[c.continent]) byContinent[c.continent] = [];
    byContinent[c.continent].push(c);
  }
  const picked = [];
  const usedIds = /* @__PURE__ */ new Set();
  for (const cont of shuffle(Object.keys(byContinent))) {
    const choice = shuffle(byContinent[cont])[0];
    picked.push(choice);
    usedIds.add(choice.cityId);
  }
  for (const city of shuffle(CITIES)) {
    if (picked.length >= ROUTE_LENGTH) break;
    if (!usedIds.has(city.cityId)) {
      picked.push(city);
      usedIds.add(city.cityId);
    }
  }
  return shuffle(picked);
}
function playTone() {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return;
  const ctx = new Ctor();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(660, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(1e-3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.28);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
  void ctx.resume().catch(() => void 0);
}
function MapContents({
  route,
  stopIndex,
  visitedCityIds,
  phase,
  facingRight,
  travelingToId,
  choices,
  onTravelComplete,
  onCityClick
}) {
  const { projection: projection2 } = useMapContext();
  const project = reactExports.useCallback(
    (lng, lat) => {
      const result = projection2([lng, lat]);
      return result ? { x: result[0], y: result[1] } : { x: 400, y: 250 };
    },
    [projection2]
  );
  const planeTarget = reactExports.useMemo(() => {
    if (travelingToId) {
      const stop = route.find((s) => s.cityId === travelingToId);
      if (stop) return project(stop.lng, stop.lat);
    }
    if (stopIndex >= 0 && stopIndex < route.length) {
      return project(route[stopIndex].lng, route[stopIndex].lat);
    }
    return project(HQ_COORD[0], HQ_COORD[1]);
  }, [travelingToId, stopIndex, route, project]);
  const trailPairs = reactExports.useMemo(() => {
    const pairs = [];
    for (let i = 1; i < visitedCityIds.length; i++) {
      const prev = route.find((s) => s.cityId === visitedCityIds[i - 1]);
      const curr = route.find((s) => s.cityId === visitedCityIds[i]);
      if (prev && curr) pairs.push([prev, curr]);
    }
    return pairs;
  }, [visitedCityIds, route]);
  const currentStop = stopIndex >= 0 && stopIndex < route.length ? route[stopIndex] : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Geographies, { geography: GEO_URL, children: ({ geographies }) => geographies.map((geo) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Geography$1,
      {
        geography: geo,
        fill: "#d4e9c2",
        stroke: "#ffffff",
        strokeWidth: 0.5,
        style: { outline: "none" }
      },
      geo.rsmKey
    )) }),
    trailPairs.map(([from, to], i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Line,
      {
        from: [from.lng, from.lat],
        to: [to.lng, to.lat],
        stroke: "#fbbf24",
        strokeWidth: 2.5,
        strokeDasharray: "8 5",
        strokeLinecap: "round"
      },
      `trail-${i}`
    )),
    visitedCityIds.slice(0, -1).map((cityId) => {
      const stop = route.find((s) => s.cityId === cityId);
      if (!stop) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { coordinates: [stop.lng, stop.lat], children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: 5, fill: "#fbbf24", stroke: "#1a1a1a", strokeWidth: 2 }) }, `visited-${cityId}`);
    }),
    currentStop && /* @__PURE__ */ jsxRuntimeExports.jsxs(Marker, { coordinates: [currentStop.lng, currentStop.lat], children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          r: 18,
          fill: "none",
          stroke: "#ff4eab",
          strokeWidth: 2,
          style: { animation: "wc-pulse-ring 1.6s ease-out infinite" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: 7, fill: "#ff4eab", stroke: "#1a1a1a", strokeWidth: 2.5 })
    ] }),
    phase === "guessing" && choices.map((choice) => /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { coordinates: [choice.lng, choice.lat], children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "g",
      {
        onClick: () => onCityClick(choice.cityId),
        style: { cursor: "pointer" },
        role: "button",
        tabIndex: 0,
        className: "wc-pin",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "0,0 -1.5,-14 1.5,-14", fill: "#2a2a2a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: 0, cy: -21, r: 7, fill: "#ff4eab", className: "wc-pin__body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: -2, cy: -24, r: 2.5, fill: "rgba(255,255,255,0.45)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "text",
            {
              x: 10,
              y: -21,
              dominantBaseline: "middle",
              textAnchor: "start",
              fontSize: 9,
              fontWeight: 800,
              fill: "#1a1a1a",
              stroke: "white",
              strokeWidth: 3,
              paintOrder: "stroke",
              style: { fontFamily: "'Baloo 2', system-ui, sans-serif", pointerEvents: "none" },
              children: choice.cityName.split(",")[0]
            }
          )
        ]
      }
    ) }, choice.cityId)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.g,
      {
        animate: planeTarget,
        transition: { duration: TRAVEL_MS / 1e3, ease: "easeInOut" },
        onAnimationComplete: phase === "traveling" ? onTravelComplete : void 0,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("g", { transform: facingRight ? "scale(-1,1)" : void 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "image",
          {
            href: "/characters/air-fante-plane.png",
            x: -23,
            y: -13,
            width: 46,
            height: 25,
            style: { userSelect: "none" }
          }
        ) })
      }
    )
  ] });
}
function WorldChaseGame() {
  const [phase, setPhase] = reactExports.useState("briefing");
  const [stopIndex, setStopIndex] = reactExports.useState(-1);
  const [movesLeft, setMovesLeft] = reactExports.useState(MAX_MOVES);
  const [visitedCityIds, setVisitedCityIds] = reactExports.useState([]);
  const [travelingToId, setTravelingToId] = reactExports.useState(null);
  const [isShaking, setIsShaking] = reactExports.useState(false);
  const [facingRight, setFacingRight] = reactExports.useState(false);
  const [showCluesReview, setShowCluesReview] = reactExports.useState(false);
  const [, addGlobalStamps] = useStamps();
  const exclamQueueRef = reactExports.useRef([]);
  const shakeTimerRef = reactExports.useRef(null);
  const arrivalAudioRef = reactExports.useRef(null);
  const [route, setRoute] = reactExports.useState(() => generateRoute());
  const choices = reactExports.useMemo(() => {
    if (stopIndex < 0 || stopIndex >= route.length - 1) return [];
    const nextCity = route[stopIndex + 1];
    const wrongPool = CITIES.filter((c) => c.cityId !== nextCity.cityId);
    const wrongPicks = shuffle(wrongPool).slice(0, 3);
    return shuffle([
      { cityId: nextCity.cityId, cityName: nextCity.cityName, lat: nextCity.lat, lng: nextCity.lng },
      ...wrongPicks.map((c) => ({ cityId: c.cityId, cityName: c.cityName, lat: c.lat, lng: c.lng }))
    ]);
  }, [stopIndex, route]);
  function stopArrivalMusic() {
    if (arrivalAudioRef.current) {
      arrivalAudioRef.current.pause();
      arrivalAudioRef.current = null;
    }
  }
  function playArrivalMusic(cityId) {
    stopArrivalMusic();
    const src = CITY_MUSIC[cityId];
    if (!src) return;
    const audio = new Audio(src);
    arrivalAudioRef.current = audio;
    audio.play().catch(() => void 0);
  }
  function playExclamation() {
    if (exclamQueueRef.current.length === 0) {
      exclamQueueRef.current = shuffle([...EXCLAMATION_SRCS]);
    }
    const src = exclamQueueRef.current.shift();
    new Audio(src).play().catch(() => void 0);
  }
  function handleStartChase() {
    setStopIndex(-1);
    setVisitedCityIds([]);
    setMovesLeft(MAX_MOVES);
    setFacingRight(route[0].lng > HQ_COORD[0]);
    setTravelingToId(route[0].cityId);
    setPhase("traveling");
  }
  const handleTravelComplete = reactExports.useCallback(() => {
    if (!travelingToId) return;
    const idx = route.findIndex((s) => s.cityId === travelingToId);
    setStopIndex(idx);
    setVisitedCityIds(
      (prev) => prev.includes(travelingToId) ? prev : [...prev, travelingToId]
    );
    setTravelingToId(null);
    playArrivalMusic(travelingToId);
    if (idx === route.length - 1) {
      burstFinale();
      addGlobalStamps(1);
      setPhase("found");
    } else {
      setPhase("arrived");
    }
  }, [travelingToId, route, addGlobalStamps]);
  function handleLeadButton() {
    setShowCluesReview(false);
    setPhase("guessing");
  }
  function handleCityClick(cityId) {
    if (phase !== "guessing") return;
    const correctId = route[stopIndex + 1]?.cityId;
    if (cityId === correctId) {
      playTone();
      playExclamation();
      burstCorrect();
      const dest = route.find((s) => s.cityId === cityId);
      const origin = route[stopIndex];
      if (dest && origin) setFacingRight(dest.lng > origin.lng);
      stopArrivalMusic();
      setShowCluesReview(false);
      setTravelingToId(cityId);
      setPhase("traveling");
    } else {
      const remaining = movesLeft - 1;
      setMovesLeft(remaining);
      setIsShaking(true);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => {
        setIsShaking(false);
        if (remaining <= 0) {
          setPhase("failure");
        } else {
          setPhase("wrong-guess");
          shakeTimerRef.current = window.setTimeout(() => {
            setPhase("guessing");
          }, 1600);
        }
      }, 500);
    }
  }
  function handleReset(newRoute = true) {
    stopArrivalMusic();
    if (newRoute) setRoute(generateRoute());
    setPhase("briefing");
    setStopIndex(-1);
    setVisitedCityIds([]);
    setMovesLeft(MAX_MOVES);
    setTravelingToId(null);
    setShowCluesReview(false);
  }
  reactExports.useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      stopArrivalMusic();
    };
  }, []);
  const currentStop = stopIndex >= 0 && stopIndex < route.length ? route[stopIndex] : null;
  const showHud = phase === "arrived" || phase === "guessing" || phase === "wrong-guess";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "world-chase", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "world-chase__bg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "world-chase__content", children: [
      showHud && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "world-chase__hud", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "world-chase__stat-chip", children: [
          "🗺️ Stop ",
          stopIndex + 1,
          " of ",
          route.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `world-chase__stat-chip${movesLeft <= 3 ? " world-chase__stat-chip--warning" : ""}`, children: [
          "🔍 ",
          movesLeft,
          " guess",
          movesLeft !== 1 ? "es" : "",
          " left"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "world-chase__map-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ComposableMap,
          {
            width: 960,
            height: 480,
            projectionConfig: { scale: 160, center: [0, 15] },
            style: { width: "100%", height: "100%" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              MapContents,
              {
                route,
                stopIndex,
                visitedCityIds,
                phase,
                travelingToId,
                choices,
                facingRight,
                onTravelComplete: handleTravelComplete,
                onCityClick: handleCityClick
              }
            )
          }
        ),
        phase === "traveling" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "world-chase__travel-caption",
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            children: "✈️ Flying to the next stop…"
          }
        ),
        (phase === "guessing" || phase === "wrong-guess") && currentStop && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            style: { position: "absolute", bottom: "0.85rem", left: "0.85rem", zIndex: 20 },
            children: [
              phase === "wrong-guess" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                background: "#ffecec",
                border: "2px solid #1a1a1a",
                borderRadius: "0.6rem",
                padding: "0.3rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 800,
                marginBottom: "0.4rem"
              }, children: "🤔 Not quite — try again!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  onClick: () => setShowCluesReview(true),
                  whileTap: { y: 2, scale: 0.97 },
                  style: {
                    background: "#ff4eab",
                    color: "#fff",
                    border: "3px solid #1a1a1a",
                    borderBottomWidth: 5,
                    borderRightWidth: 4,
                    borderRadius: "9999px",
                    padding: "0.55rem 1.1rem",
                    fontSize: "0.9rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  },
                  children: "📋 Clues"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
          phase === "briefing" && /* @__PURE__ */ jsxRuntimeExports.jsx(BriefingPanel, { onStart: handleStartChase }),
          phase === "arrived" && currentStop && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ArrivedPanel,
            {
              stop: currentStop,
              nextStop: route[stopIndex + 1] ?? null,
              isLastStop: stopIndex === route.length - 1,
              onLead: handleLeadButton
            }
          ),
          (phase === "guessing" || phase === "wrong-guess") && showCluesReview && currentStop && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ArrivedPanel,
            {
              stop: currentStop,
              nextStop: route[stopIndex + 1] ?? null,
              isLastStop: false,
              isReview: true,
              onLead: handleLeadButton,
              onClose: () => setShowCluesReview(false)
            },
            "review"
          ),
          phase === "found" && currentStop && /* @__PURE__ */ jsxRuntimeExports.jsx(
            FoundPanel,
            {
              route,
              visitedCityIds,
              onNext: () => handleReset(true),
              onReplay: () => handleReset(false)
            }
          ),
          phase === "failure" && /* @__PURE__ */ jsxRuntimeExports.jsx(FailurePanel, { onTryAgain: () => handleReset(false) })
        ] })
      ] })
    ] })
  ] });
}
function BriefingPanel({ onStart }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className: "world-chase__overlay",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "world-chase__panel world-chase__panel--pop",
          initial: { scale: 0.88, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.88, opacity: 0 },
          transition: { type: "spring", stiffness: 300, damping: 24 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              background: "#fff",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 6,
              borderRightWidth: 5,
              borderRadius: "1.25rem",
              padding: "1.25rem",
              marginBottom: "1rem",
              textAlign: "center"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: "/characters/spaceship-jaime-jeff.png",
                  alt: "Jaime and Jeff in their rocket",
                  style: {
                    width: "100%",
                    maxWidth: 220,
                    display: "block",
                    margin: "0 auto 0.5rem",
                    maskImage: "linear-gradient(to right, transparent 0%, black 22%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 22%)"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.5rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.6rem" }, children: "Find Jaime & Jeff!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.5 }, children: "Jaime and Jeff have been spotted across eight cities on different continents! Follow their trail around the world and track them down!" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              background: "#fff9c4",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 5,
              borderRightWidth: 4,
              borderRadius: "1rem",
              padding: "0.7rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "1rem"
            }, children: [
              "🔍 Read the clues at each city, then pick where they went next on the map. You have ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                MAX_MOVES,
                " guesses"
              ] }),
              " — use them wisely!"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.button,
              {
                onClick: onStart,
                whileTap: { y: 3, scale: 0.97 },
                style: {
                  width: "100%",
                  background: "#fbbf24",
                  border: "3px solid #1a1a1a",
                  borderBottomWidth: 6,
                  borderRightWidth: 5,
                  borderRadius: "9999px",
                  padding: "0.85rem 1rem",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  cursor: "pointer"
                },
                children: "Find Them! 🌍"
              }
            )
          ]
        }
      )
    }
  );
}
function Equalizer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "wc-equalizer", "aria-hidden": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-equalizer__bar", style: { animationDelay: "0s" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-equalizer__bar", style: { animationDelay: "0.18s" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-equalizer__bar", style: { animationDelay: "0.36s" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-equalizer__bar", style: { animationDelay: "0.12s" } })
  ] });
}
function ArrivedPanel({
  stop,
  nextStop,
  isLastStop,
  isReview = false,
  onLead,
  onClose
}) {
  const info = CITY_INFO[stop.cityId];
  const [countdown, setCountdown] = reactExports.useState(isReview ? 0 : 5);
  const [showClues, setShowClues] = reactExports.useState(isReview);
  reactExports.useEffect(() => {
    if (isReview) {
      setCountdown(0);
      setShowClues(true);
      return;
    }
    setCountdown(5);
    setShowClues(false);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          setShowClues(true);
          return 0;
        }
        return c - 1;
      });
    }, 1e3);
    return () => clearInterval(iv);
  }, [stop.cityId, isReview]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className: "world-chase__overlay",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "world-chase__panel",
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -20, opacity: 0 },
          transition: { type: "spring", stiffness: 280, damping: 22 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: "0.65rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              flex: "0 0 auto",
              width: "44%",
              background: "#e0f9f5",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 5,
              borderRightWidth: 4,
              borderRadius: "1.25rem",
              padding: "0.9rem 0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
                info && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "2.2rem", lineHeight: 1, flexShrink: 0 }, children: info.flag }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.15rem", fontWeight: 900, lineHeight: 1.2 }, children: info ? `You're in ${info.country}!` : stop.cityName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#444" }, children: [
                    "📍 ",
                    stop.cityName
                  ] })
                ] })
              ] }),
              info && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#fbbf24",
                border: "2px solid #1a1a1a",
                borderRadius: "0.6rem",
                padding: "0.3rem 0.5rem"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Equalizer, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", fontWeight: 900 }, children: info.musicStyle })
              ] }),
              info && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.85rem", fontWeight: 600, color: "#333", lineHeight: 1.4 }, children: [
                "🎵 ",
                info.musicFact
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                background: "#fffbf0",
                border: "2px solid #1a1a1a",
                borderRadius: "0.65rem",
                padding: "0.4rem 0.55rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                lineHeight: 1.4
              }, children: [
                "💡 ",
                stop.funFact
              ] })
            ] }),
            !isLastStop && /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: !showClues ? (
              /* Countdown placeholder */
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.9 },
                  style: {
                    flex: 1,
                    alignSelf: "stretch",
                    background: "#fff3f9",
                    border: "3px dashed #ff4eab",
                    borderRadius: "1.25rem",
                    padding: "0.9rem 0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    minHeight: 180
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "2rem" }, children: "🔍" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.85rem", fontWeight: 800, color: "#ff4eab", textAlign: "center" }, children: "Clues coming in" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        initial: { scale: 1.5, opacity: 0 },
                        animate: { scale: 1, opacity: 1 },
                        transition: { type: "spring", stiffness: 400, damping: 20 },
                        style: { fontSize: "3.5rem", fontWeight: 900, color: "#ff4eab", lineHeight: 1 },
                        children: countdown
                      },
                      countdown
                    )
                  ]
                },
                "countdown"
              )
            ) : (
              /* Clues pill */
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.88, x: 20 },
                  animate: { opacity: 1, scale: 1, x: 0 },
                  transition: { type: "spring", stiffness: 300, damping: 24 },
                  style: {
                    flex: 1,
                    background: "#fff3f9",
                    border: "3px solid #1a1a1a",
                    borderBottomWidth: 5,
                    borderRightWidth: 4,
                    borderRadius: "1.25rem",
                    padding: "0.9rem 0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "2.2rem", lineHeight: 1, flexShrink: 0 }, children: "🕵️" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.15rem", fontWeight: 900, lineHeight: 1.2 }, children: "Where did they go NEXT?" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#ff4eab" }, children: "Follow the clues!" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 2, background: "#ff4eab", opacity: 0.2, borderRadius: 9999 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.85rem", fontWeight: 700, color: "#555" }, children: "Witnesses spotted Jaime & Jeff…" }),
                    (nextStop?.clues ?? []).map((clue, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "world-chase__clue",
                        style: { animationDelay: `${i * 0.15}s` },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "world-chase__clue-emoji", children: clue.emoji }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "world-chase__clue-text", children: clue.text })
                        ]
                      },
                      i
                    )),
                    isReview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.button,
                      {
                        onClick: onClose,
                        whileTap: { y: 2, scale: 0.97 },
                        style: {
                          marginTop: "0.25rem",
                          width: "100%",
                          background: "#1a1a1a",
                          color: "#fff",
                          border: "3px solid #1a1a1a",
                          borderBottomWidth: 5,
                          borderRightWidth: 4,
                          borderRadius: "9999px",
                          padding: "0.7rem 0.5rem",
                          fontSize: "0.9rem",
                          fontWeight: 900,
                          cursor: "pointer"
                        },
                        children: "← Back to map"
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.button,
                      {
                        onClick: onLead,
                        whileTap: { y: 2, scale: 0.97 },
                        style: {
                          marginTop: "0.25rem",
                          width: "100%",
                          background: "#ff4eab",
                          color: "#fff",
                          border: "3px solid #1a1a1a",
                          borderBottomWidth: 5,
                          borderRightWidth: 4,
                          borderRadius: "9999px",
                          padding: "0.7rem 0.5rem",
                          fontSize: "0.9rem",
                          fontWeight: 900,
                          cursor: "pointer"
                        },
                        children: "I know where they went! 🗺️"
                      }
                    )
                  ]
                },
                "clues"
              )
            ) })
          ] })
        }
      )
    }
  );
}
function FoundPanel({
  route,
  visitedCityIds,
  onNext,
  onReplay
}) {
  const finalStop = route[route.length - 1];
  const finalInfo = CITY_INFO[finalStop.cityId];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className: "world-chase__overlay",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "world-chase__panel",
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: "spring", stiffness: 260, damping: 20 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "3.5rem" }, children: "🎉🕵️‍♀️🎉" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.5rem", fontWeight: 900, margin: "0.5rem 0" }, children: "You found them!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.95rem", fontWeight: 700, color: "#555", marginBottom: "0.5rem" }, children: [
                "Jaime & Jeff were in ",
                finalInfo ? finalInfo.country : finalStop.cityName,
                " all along!"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              background: "#fff",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 5,
              borderRightWidth: 4,
              borderRadius: "1.25rem",
              padding: "0.85rem 1rem",
              marginBottom: "1rem"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }, children: "🗺️ Your Route" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }, children: visitedCityIds.map((id2, i) => {
                const stop = route.find((s) => s.cityId === id2);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    background: id2 === finalStop.cityId ? "#fbbf24" : "#e0f2fe",
                    border: "2px solid #1a1a1a",
                    borderRadius: "9999px",
                    padding: "0.15rem 0.6rem",
                    fontSize: "0.78rem",
                    fontWeight: 800
                  }, children: stop?.cityName ?? id2 }),
                  i < visitedCityIds.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", margin: "0 0.15rem" }, children: "→" })
                ] }, id2);
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              background: "#fff9c4",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 5,
              borderRightWidth: 4,
              borderRadius: "1rem",
              padding: "0.6rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "1rem",
              textAlign: "center"
            }, children: "🏆 You earned a passport stamp!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.6rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  onClick: onNext,
                  whileTap: { y: 3, scale: 0.97 },
                  style: {
                    flex: 1,
                    background: "#fbbf24",
                    border: "3px solid #1a1a1a",
                    borderBottomWidth: 6,
                    borderRightWidth: 5,
                    borderRadius: "9999px",
                    padding: "0.75rem 1rem",
                    fontSize: "0.95rem",
                    fontWeight: 900,
                    cursor: "pointer"
                  },
                  children: "New Adventure ✈️"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  onClick: onReplay,
                  whileTap: { y: 3, scale: 0.97 },
                  style: {
                    flex: 1,
                    background: "#fff",
                    border: "3px solid #1a1a1a",
                    borderBottomWidth: 6,
                    borderRightWidth: 5,
                    borderRadius: "9999px",
                    padding: "0.75rem 1rem",
                    fontSize: "0.95rem",
                    fontWeight: 900,
                    cursor: "pointer"
                  },
                  children: "Play Again 🔄"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function FailurePanel({ onTryAgain }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className: "world-chase__overlay",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "world-chase__panel",
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          style: { textAlign: "center", maxWidth: 380 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "3.5rem", marginBottom: "0.5rem" }, children: "😅🗺️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.5rem" }, children: "They got too far ahead!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.9rem", fontWeight: 700, color: "#555", marginBottom: "1rem" }, children: "Jaime & Jeff are explorers — they move fast! Try following their clues again and you'll catch them this time." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.button,
              {
                onClick: onTryAgain,
                whileTap: { y: 3, scale: 0.97 },
                style: {
                  width: "100%",
                  background: "#ff4eab",
                  color: "#fff",
                  border: "3px solid #1a1a1a",
                  borderBottomWidth: 6,
                  borderRightWidth: 5,
                  borderRadius: "9999px",
                  padding: "0.85rem 1rem",
                  fontSize: "1.05rem",
                  fontWeight: 900,
                  cursor: "pointer"
                },
                children: "Try Again 🔍"
              }
            )
          ]
        }
      )
    }
  );
}
function WorldAdventureRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(WorldChaseGame, {});
}
export {
  WorldAdventureRoute as component
};
