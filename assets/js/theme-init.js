/** Apply saved theme before paint (include in <head> after main.css) */
(function () {
  var stored = localStorage.getItem('hotel-theme');
  document.documentElement.setAttribute('data-theme', stored === 'light' ? 'light' : 'dark');
})();
