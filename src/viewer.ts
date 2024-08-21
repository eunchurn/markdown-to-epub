import { Book } from "epubjs";
import "./viewer.css";

const book = new Book("book.epub");
const rendition = book.renderTo("viewer", {
  width: "100%",
  height: 600,
  spread: "always",
});
const displayed = rendition.display();
console.log(book);
book.ready.then(function () {
  const next = document.getElementById("next");
  if (!next) return;
  next.addEventListener(
    "click",
    (e) => {
      rendition.next();
      e.preventDefault();
    },
    false
  );

  const prev = document.getElementById("prev");
  if (!prev) return;
  prev.addEventListener(
    "click",
    (e) => {
      rendition.prev();
      e.preventDefault();
    },
    false
  );

  const keyListener = (e: KeyboardEvent) => {
    // Left Key
    if (e.key === "ArrowLeft") {
      rendition.prev();
    }
    // Right Key
    if (e.key === "ArrowRight") {
      rendition.next();
    }
  };

  rendition.on("keyup", keyListener);
  document.addEventListener("keyup", keyListener, false);
});

const title = document.getElementById("title");

rendition.on("rendered", (section: any) => {
  const current = book.navigation && book.navigation.get(section.href);

  if (current) {
    const $select = document.getElementById("toc") as HTMLSelectElement;
    if (!$select) return;
    const $selected = $select.querySelector("option[selected]");
    if ($selected) {
      $selected.removeAttribute("selected");
    }

    const $options = $select.querySelectorAll("option");
    $options.forEach(($option) => {
      let selected = $option.getAttribute("ref") === current.href;
      if (selected) {
        $option.setAttribute("selected", "");
      }
    });
  }
});

rendition.on("relocated", (location: any) => {
  console.log(location);
  const next = document.getElementById("next");
  const prev = document.getElementById("prev");
  if (next) {
    if (location.atEnd) {
      next.style.visibility = "hidden";
    } else {
      next.style.visibility = "visible";
    }
  }
  if (prev) {
    if (location.atStart) {
      prev.style.visibility = "hidden";
    } else {
      prev.style.visibility = "visible";
    }
  }
});

rendition.on("layout", (layout: any) => {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;
  if (layout.spread) {
    viewer.classList.remove("single");
  } else {
    viewer.classList.add("single");
  }
});

window.addEventListener("unload", () => {
  console.log("unloading");
  book.destroy();
});

book.loaded.navigation.then((toc) => {
  const $select = document.getElementById("toc") as HTMLSelectElement,
    docfrag = document.createDocumentFragment();

  toc.forEach((chapter) => {
    const option = document.createElement("option");
    option.textContent = chapter.label;
    option.setAttribute("ref", chapter.href);

    docfrag.appendChild(option);
    return {};
  });
  if (!$select) return;
  $select.appendChild(docfrag);

  $select.onchange = function () {
    const index = $select.selectedIndex,
      url = $select.options[index].getAttribute("ref");
    if (!url) return false;
    rendition.display(url);
    return false;
  };
});
