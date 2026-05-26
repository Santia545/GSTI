function checkJWT() {
    const jwt = sessionStorage.getItem('jwt');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const accountButton = document.getElementById('account-button');
    const carritoButton = document.getElementById('cart-button');

    if (jwt) {
        try {
            const decode = jwt_decode(jwt);
            if (decode.exp < Date.now() / 1000) {
                sessionStorage.removeItem('jwt');
                loginButton.style.display = 'block';
                logoutButton.style.display = 'none';
            }
        } catch (error) {
            sessionStorage.removeItem('jwt');
        }
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        accountButton.style.display = 'block';
        carritoButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        accountButton.style.display = 'none';
        carritoButton.style.display = 'none';
    }
}

function setJWT(jwt) {
    sessionStorage.setItem('jwt', jwt);
    checkJWT();
}

function removeJWT() {
    sessionStorage.removeItem('jwt');
    checkJWT();
}
function decodeJWT() {
    try {
        const jwt = sessionStorage.getItem('jwt');
        return jwt_decode(jwt);
    } catch (error) {
        return null;
    }
}
/**
 * Minified by jsDelivr using Terser v5.19.2.
 * Original file: /npm/jwt-decode@3.1.2/build/jwt-decode.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!function (e) { "function" == typeof define && define.amd ? define(e) : e() }((function () { "use strict"; function e(e) { this.message = e } e.prototype = new Error, e.prototype.name = "InvalidCharacterError"; var n = "undefined" != typeof window && window.atob && window.atob.bind(window) || function (n) { var t = String(n).replace(/=+$/, ""); if (t.length % 4 == 1) throw new e("'atob' failed: The string to be decoded is not correctly encoded."); for (var r, o, i = 0, a = 0, d = ""; o = t.charAt(a++); ~o && (r = i % 4 ? 64 * r + o : o, i++ % 4) ? d += String.fromCharCode(255 & r >> (-2 * i & 6)) : 0)o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o); return d }; function t(e) { var t = e.replace(/-/g, "+").replace(/_/g, "/"); switch (t.length % 4) { case 0: break; case 2: t += "=="; break; case 3: t += "="; break; default: throw "Illegal base64url string!" }try { return function (e) { return decodeURIComponent(n(e).replace(/(.)/g, (function (e, n) { var t = n.charCodeAt(0).toString(16).toUpperCase(); return t.length < 2 && (t = "0" + t), "%" + t }))) }(t) } catch (e) { return n(t) } } function r(e) { this.message = e } function o(e, n) { if ("string" != typeof e) throw new r("Invalid token specified"); var o = !0 === (n = n || {}).header ? 0 : 1; try { return JSON.parse(t(e.split(".")[o])) } catch (e) { throw new r("Invalid token specified: " + e.message) } } r.prototype = new Error, r.prototype.name = "InvalidTokenError", window && ("function" == typeof window.define && window.define.amd ? window.define("jwt_decode", (function () { return o })) : window && (window.jwt_decode = o)) }));

export { checkJWT, setJWT, removeJWT, decodeJWT };
