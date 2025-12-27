import { restoreLastFrame, rememberFrame } from "../modules/storage.js";

export function initNav({ closeAllPanels } = {}){
  const mainFrame = document.getElementById("mainFrame");
  const navItems = document.querySelectorAll(".nav-item");

  mainFrame.src = restoreLastFrame("https://wskimkj.github.io/search/");

  mainFrame.addEventListener("load", () => {
    rememberFrame(mainFrame.src);
    try{
      const real = mainFrame.contentWindow.location.href;
      if(real) rememberFrame(real);
    }catch{}
  });

  function setActive(btn){
    navItems.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  }

  navItems.forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      const id = btn.dataset.id;
      const href = btn.dataset.href;

      // sub sidebar buttons handled elsewhere
      if(id === "google" || id === "util"){
        e.stopPropagation();
        return;
      }

      setActive(btn);
      if(typeof closeAllPanels === "function") closeAllPanels();

      if(href){
        mainFrame.src = href;
        rememberFrame(href);
      }
      e.stopPropagation();
    });
  });

  return { mainFrame };
}
