const STAR_CLASS = "cStar-icon";
const MENU_ITEM_CLASS = "cStar-menu-item";

function getChatId(chatLink) {
  return chatLink.getAttribute("href");
}

function toggleStar(chatId, chatEl, isCurrentlyStarred) {
  chrome.storage.local.get(["starredChats"], (result) => {
    const starred = result.starredChats || {};
    starred[chatId] = !isCurrentlyStarred;
    chrome.storage.local.set({ starredChats: starred }, () => {
      updateStarUI(chatEl, !isCurrentlyStarred);
    });
  });
}

function updateStarUI(chatEl, starred) {
  const existing = chatEl.querySelector("." + STAR_CLASS);
  if (starred && !existing) {
    const star = document.createElement("span");
    star.textContent = "⭐";
    star.className = STAR_CLASS;
    star.style.marginLeft = "0.4em";
    chatEl.querySelector("div").appendChild(star);
  } else if (!starred && existing) {
    existing.remove();
  }
}

function addStarMenuItem() {
  const observer = new MutationObserver(() => {
    const chatLinks = document.querySelectorAll('a[href^="/c/"]');

    chrome.storage.local.get(["starredChats"], (result) => {
      const starred = result.starredChats || {};

      chatLinks.forEach((link) => {
        const chatId = getChatId(link);
        const isStarred = starred[chatId] || false;
        updateStarUI(link, isStarred);

        const menuBtn = link.querySelector("button");
        if (menuBtn && !menuBtn.dataset.starMenuHooked) {
          menuBtn.dataset.starMenuHooked = "true";
          menuBtn.addEventListener("click", () => {
            setTimeout(() => {
              const menu = document.querySelector('[role="menu"]');
              if (!menu || menu.querySelector(`.${MENU_ITEM_CLASS}`)) return;

              const menuItem = document.createElement("div");
              menuItem.className = MENU_ITEM_CLASS;
              menuItem.setAttribute("role", "menuitem");
              menuItem.style.cursor = "pointer";
              menuItem.style.padding = "0.5em 1em";
              menuItem.textContent = isStarred ? "Un-star" : "Star";

              menuItem.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleStar(chatId, link, isStarred);
                menu.remove();
              });

              menu.appendChild(menuItem);
            }, 50);
          });
        }
      });
    });
  });

  const nav = document.querySelector("nav");
  if (nav) observer.observe(nav, { childList: true, subtree: true });
}

addStarMenuItem();
