// Photo lightbox
(function () {
  var box = document.getElementById("lightbox");
  if (!box) return;
  var img = box.querySelector("img");
  document.querySelectorAll(".photo[data-full]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      img.src = btn.getAttribute("data-full");
      img.alt = btn.querySelector("img").alt;
      box.classList.add("open");
      box.setAttribute("aria-hidden", "false");
    });
  });
  function close() {
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
  }
  box.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();

// Home page search
(function () {
  var q = document.getElementById("q");
  if (!q) return;
  var cards = document.querySelectorAll("#grid .card");
  var empty = document.getElementById("empty");
  q.addEventListener("input", function () {
    var term = q.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var hit = !term || c.getAttribute("data-search").indexOf(term) !== -1;
      c.style.display = hit ? "" : "none";
      if (hit) shown++;
    });
    empty.style.display = shown ? "none" : "block";
  });
})();
