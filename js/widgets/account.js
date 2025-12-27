import {
  ACCOUNT_SHEET_ID, ACCOUNT_SHEET_URL, ACCOUNT_SHEET_BASE,
  EXTRA_SHEET_ID, EXTRA_GID, EXTRA_SHEET_BASE,
  SHOP_GIDS, OTHER_GID
} from "../config/constants.js";

import {
  parseCsvGeneric, splitAgKeywords, splitQueryKeywords,
  tokenMatchAny, tokenMatchAll, textMatchAny, textMatchAll
} from "../modules/utils.js";

export function initAccountWidget(){
  const accountWidget = document.getElementById("accountWidget");
  const accountWidgetBtn = document.getElementById("accountWidgetBtn");
  const accountClose = document.getElementById("accountClose");
  const accountQuery = document.getElementById("accountQuery");
  const accountMatchAll = document.getElementById("accountMatchAll");
  const accountResult = document.getElementById("accountResult");
  const accountCount = document.getElementById("accountCount");
  const accountToast = document.getElementById("accountToast");
  const accountSheetBtn = document.getElementById("accountSheetBtn");

  function hideAccount(){ accountWidget.classList.remove("visible"); }

  function openAccountSheetAt(gid, a1){
    const url = `${ACCOUNT_SHEET_BASE}?gid=${gid}#gid=${gid}&range=${encodeURIComponent(a1)}`;
    window.open(url, "_blank");
  }
  function openExtraSheetAt(gid, a1){
    const url = `${EXTRA_SHEET_BASE}?gid=${gid}#gid=${gid}&range=${encodeURIComponent(a1)}`;
    window.open(url, "_blank");
  }

  let SHOP_SITES = [];
  let OTHER_SITES = [];
  let EXTRA_SITES = [];
  let accountLoaded = false;

  function accountCsvUrl(gid){
    return `https://docs.google.com/spreadsheets/d/${ACCOUNT_SHEET_ID}/export?format=csv&gid=${gid}`;
  }
  function extraCsvUrl(gid){
    return `https://docs.google.com/spreadsheets/d/${EXTRA_SHEET_ID}/export?format=csv&gid=${gid}`;
  }

  async function fetchAccountCsv(gid){
    const res = await fetch(accountCsvUrl(gid), { cache:"no-store" });
    if(!res.ok) throw new Error("account csv fetch failed");
    const text = await res.text();
    return parseCsvGeneric(text);
  }
  async function fetchExtraCsv(gid){
    const res = await fetch(extraCsvUrl(gid), { cache:"no-store" });
    if(!res.ok) throw new Error("extra csv fetch failed");
    const text = await res.text();
    return parseCsvGeneric(text);
  }

  async function loadAccountData(){
    accountResult.innerHTML = '<div class="account-empty">데이터 불러오는 중...</div>';
    accountCount.textContent = "";

    try{
      const shopSheetsRows = await Promise.all(SHOP_GIDS.map(gid => fetchAccountCsv(gid)));
      SHOP_SITES = [];

      shopSheetsRows.forEach((rows, idx)=>{
        const gid = SHOP_GIDS[idx];
        if(!rows || rows.length <= 1) return;

        const groupLabel = (gid === 0) ? "JH" : (gid === 618725932) ? "NH" : (gid === 1481873109) ? "HTY" : "기타";

        rows.slice(1).forEach((cols, rIdx)=>{
          const rowNumber = rIdx + 2;
          const colA = (cols[0] || "").toString().trim();
          if(colA === "매장") return;

          const ag = cols[32] || "";
          const agKeywords = splitAgKeywords(ag);
          if(!agKeywords.length) return;

          let storeId = "", loginId = "", pw = "";
          if(gid === 0 || gid === 618725932){
            storeId = cols[13];
            loginId = cols[14];
            pw      = cols[15];
          }else if(gid === 1481873109){
            storeId = cols[12];
            loginId = cols[13];
            pw      = cols[14];
          }

          SHOP_SITES.push({
            source: "main",
            gid,
            rowNumber,
            group: groupLabel,
            siteName: ag || "",
            agKeywords,
            storeId: storeId || "",
            loginId: loginId || "",
            pw: pw || ""
          });
        });
      });

      OTHER_SITES = [];
      if(OTHER_GID != null){
        const otherRows = await fetchAccountCsv(OTHER_GID);
        if(otherRows && otherRows.length > 1){
          otherRows.slice(1).forEach((cols, rIdx)=>{
            const rowNumber = rIdx + 2;
            const colA = (cols[0] || "").toString().trim();
            if(colA === "매장") return;

            const siteName = cols[0];
            const loginId  = cols[3];
            const pw       = cols[4];
            if(!siteName) return;

            OTHER_SITES.push({
              source: "main",
              gid: OTHER_GID,
              rowNumber,
              group: "기타",
              siteName: siteName || "",
              agKeywords: splitAgKeywords(siteName),
              storeId: "",
              loginId: loginId || "",
              pw: pw || ""
            });
          });
        }
      }

      EXTRA_SITES = [];
      const extraRows = await fetchExtraCsv(EXTRA_GID);
      if(extraRows && extraRows.length > 1){
        extraRows.slice(1).forEach((cols, rIdx)=>{
          const rowNumber = rIdx + 2;

          const searchText = (cols || []).map(c => (c || "").toString()).join(" ");
          if(!searchText.trim()) return;

          const siteName = (cols?.[0] || "").toString().trim() || "(추가DB)";
          const loginId  = cols?.[7] || ""; // H
          const pw       = cols?.[8] || ""; // I

          EXTRA_SITES.push({
            source: "extra",
            gid: EXTRA_GID,
            rowNumber,
            group: "추가DB",
            siteName,
            searchText,
            storeId: "",
            loginId: loginId || "",
            pw: pw || ""
          });
        });
      }

      accountLoaded = true;
      accountResult.innerHTML = '<div class="account-empty">검색어를 입력하세요. (Enter)</div>';
      accountCount.textContent = "0건";
    }catch(err){
      console.error(err);
      accountLoaded = false;
      accountResult.innerHTML = '<div class="account-empty">데이터를 불러오지 못했습니다. (시트 공개 권한 확인 필요)</div>';
      accountCount.textContent = "";
    }
  }

  function searchAccountSites(query, matchAll){
    const queryTokens = splitQueryKeywords(query);
    if(!queryTokens.length) return [];

    const results = [];

    const tokenMatcher = matchAll ? tokenMatchAll : tokenMatchAny;
    SHOP_SITES.forEach(item=>{
      if(tokenMatcher(item.agKeywords, queryTokens)){
        results.push({
          source: item.source,
          gid: item.gid,
          rowNumber: item.rowNumber,
          group: item.group || "기타",
          siteName: item.siteName || "",
          storeId: item.storeId || "",
          loginId: item.loginId || "",
          pw: item.pw || ""
        });
      }
    });
    OTHER_SITES.forEach(item=>{
      if(tokenMatcher(item.agKeywords, queryTokens)){
        results.push({
          source: item.source,
          gid: item.gid,
          rowNumber: item.rowNumber,
          group: item.group || "기타",
          siteName: item.siteName || "",
          storeId: "",
          loginId: item.loginId || "",
          pw: item.pw || ""
        });
      }
    });

    const textMatcher = matchAll ? textMatchAll : textMatchAny;
    EXTRA_SITES.forEach(item=>{
      if(textMatcher(item.searchText, queryTokens)){
        results.push({
          source: item.source,
          gid: item.gid,
          rowNumber: item.rowNumber,
          group: item.group || "기타",
          siteName: item.siteName || "",
          storeId: "",
          loginId: item.loginId || "",
          pw: item.pw || ""
        });
      }
    });

    results.sort((a,b)=>(a.siteName||"").localeCompare(b.siteName||""));
    return results;
  }

  let accountToastTimer = null;
  function showAccountToast(){
    accountToast.classList.add("show");
    if(accountToastTimer) clearTimeout(accountToastTimer);
    accountToastTimer = setTimeout(()=> accountToast.classList.remove("show"), 1100);
  }

  function copyToClipboard(text){
    if(!text) return;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(showAccountToast).catch(()=>{});
    }else{
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try{ document.execCommand("copy"); showAccountToast(); }catch{}
      document.body.removeChild(ta);
    }
  }

  function makeAccountChip(label, value){
    const chip = document.createElement("div");
    chip.className = "account-chip";

    const k = document.createElement("div");
    k.className = "k";
    k.textContent = label;

    const v = document.createElement("div");
    v.className = "v";
    v.textContent = value;

    chip.appendChild(k);
    chip.appendChild(v);

    chip.addEventListener("click", (e)=>{
      e.stopPropagation();
      copyToClipboard(value);
    });

    return chip;
  }

  function renderAccountResults(list){
    if(!list || list.length === 0){
      accountResult.innerHTML = '<div class="account-empty">검색 결과가 없습니다.</div>';
      accountCount.textContent = "0건";
      return;
    }

    accountCount.textContent = list.length + "건";
    accountResult.innerHTML = "";
    const frag = document.createDocumentFragment();

    list.forEach(item=>{
      const card = document.createElement("div");
      card.className = "account-card";

      const head = document.createElement("div");
      head.className = "account-card-head";

      const site = document.createElement("div");
      site.className = "account-site";
      site.textContent = item.siteName || "(사이트명 없음)";

      const grp = document.createElement("div");
      grp.className = "account-group";
      grp.textContent = (item.group || "기타").toUpperCase();

      head.appendChild(site);
      head.appendChild(grp);

      const fields = document.createElement("div");
      fields.className = "account-fields";

      const store = (item.storeId || "").toString().trim();
      const hasStore = store !== "" && store !== "-" && store !== "없음";
      if(hasStore) fields.appendChild(makeAccountChip("상점", item.storeId));
      if(item.loginId) fields.appendChild(makeAccountChip("ID", item.loginId));
      if(item.pw) fields.appendChild(makeAccountChip("PW", item.pw));

      card.appendChild(head);
      card.appendChild(fields);
      frag.appendChild(card);

      card.addEventListener("dblclick", (e)=>{
        e.stopPropagation();
        const a1 = `A${item.rowNumber}`;
        if(item.source === "extra"){
          openExtraSheetAt(item.gid, a1);
        }else{
          openAccountSheetAt(item.gid, a1);
        }
      });
    });

    accountResult.appendChild(frag);
  }

  function doAccountSearch(){
    if(!accountLoaded){
      accountResult.innerHTML = '<div class="account-empty">아직 데이터 로딩 중입니다.</div>';
      accountCount.textContent = "";
      return;
    }
    const q = accountQuery.value.trim();
    if(!q){
      accountResult.innerHTML = '<div class="account-empty">검색어를 입력하세요.</div>';
      accountCount.textContent = "0건";
      return;
    }
    const results = searchAccountSites(q, !!accountMatchAll.checked);
    renderAccountResults(results);
  }

  function toggleAccount(){
    const v = accountWidget.classList.contains("visible");
    if(v) hideAccount();
    else{
      accountWidget.classList.add("visible");
      if(!accountLoaded) loadAccountData();
      accountQuery.focus();
    }
  }

  accountWidgetBtn.addEventListener("click",(e)=>{ toggleAccount(); e.stopPropagation(); });
  accountClose.addEventListener("click",(e)=>{ hideAccount(); e.stopPropagation(); });
  accountWidget.addEventListener("click",(e)=> e.stopPropagation());
  accountWidget.addEventListener("mouseleave", ()=> hideAccount());

  accountQuery.addEventListener("keydown",(e)=>{ if(e.key === "Enter") doAccountSearch(); });
  accountMatchAll.addEventListener("change", ()=>{ if(accountQuery.value.trim()) doAccountSearch(); });

  accountSheetBtn.addEventListener("click", (e) => {
    window.open(ACCOUNT_SHEET_URL, "_blank");
    e.stopPropagation();
  });

  return { hideAccount, toggleAccount };
}
