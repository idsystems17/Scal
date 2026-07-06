(function () {
  var STORAGE_KEY = 'scal_click_id';
  var MAX_AGE_DAYS = 30;

  function getParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  var fromUrl = getParam('scal_click');
  if (fromUrl) {
    setCookie(STORAGE_KEY, fromUrl, MAX_AGE_DAYS);
    try { window.localStorage.setItem(STORAGE_KEY, fromUrl); } catch (e) {}
  }

  window.getScalClickId = function () {
    var cookieValue = getCookie(STORAGE_KEY);
    if (cookieValue) return cookieValue;
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  };
})();
