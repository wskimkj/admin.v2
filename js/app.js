import { initNav } from "./features/nav.js";
import { initSidebars } from "./features/sidebars.js";
import { initPhoneWidget } from "./widgets/phone.js";
import { initTrackingWidget } from "./widgets/tracking.js";
import { initAccountWidget } from "./widgets/account.js";
import { initCalendarWidget } from "./widgets/calendar.js";

document.addEventListener("DOMContentLoaded", () => {
  const phone = initPhoneWidget();
  const tracking = initTrackingWidget();
  const account = initAccountWidget();
  const calendar = initCalendarWidget();

  function hideAllSubSidebars(){
    document.getElementById("subSidebar").classList.remove("visible");
    document.getElementById("utilSidebar").classList.remove("visible");
  }

  function closeAllPanels(){
    hideAllSubSidebars();
    calendar.closePopup();
    calendar.hideCalendar();
    phone.hidePhone();
    tracking.hideTracking();
    account.hideAccount();
  }

  initNav({ closeAllPanels });

  initSidebars({
    closeAllPanels,
    toggleCalendar: calendar.toggleCalendar
  });

  // ESC closes all
  document.addEventListener("keydown",(e)=>{
    if(e.key === "Escape"){
      closeAllPanels();
      hideAllSubSidebars();
    }
  });
});
