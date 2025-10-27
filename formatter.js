(() => {
  console.log("🇩🇪 StayAI Formatter + Translator — Efficient Production Version");

  // ✅ Cached currency formatter
  const currencyFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

  const monthMap = {
    Jan: "Januar", Feb: "Februar", Mar: "März", Apr: "April",
    May: "Mai", Jun: "Juni", Jul: "Juli", Aug: "August",
    Sep: "September", Oct: "Oktober", Nov: "November", Dec: "Dezember"
  };
  const monthMapFull = {
    January: "Januar", February: "Februar", March: "März", April: "April",
    May: "Mai", June: "Juni", July: "Juli", August: "August",
    September: "September", October: "Oktober", November: "November", December: "Dezember"
  };

  const translationMap = {
    "Next delivery": "Nächste Lieferung",
    "weeks": "Wochen", "week": "Woche", "day": "Tag", "days": "Tage",
    "month": "Monat", "months": "Monate", "Subtotal": "Zwischensumme",
    "Shipping": "Versand", "Total": "Gesamt", "Discount": "Rabatt",
    "Cancel": "Abbrechen",
    "Update your delivery address for subscriptions": "Aktualisiere deine Lieferadresse für Subscriptions",
    "Select a date until when you want to pause your subscription": "Wählen Sie ein Datum aus, bis zu dem Sie Ihr Abonnement pausieren möchten.",
    "Active Subscriptions": "Aktive Subscriptions",
    "New Subscription": "Neues Subscription",
    "You have selected 0 of 4 flavors": "Du hast 0 von 4 Geschmacksrichtungen ausgewählt",
    "Subscription Preis": "Abonnementpreis",
    "Billed every": "Abgerechnet alle",
    "Started on": "Gestartet am",
    "Selected flavors": "Ausgewählte Geschmacksrichtungen",
    "flavors": "Geschmacksrichtungen",
    "Delivery Address": "Lieferadresse",
    "Street Address": "Straße und Hausnummer",
    "City": "Stadt",
    "Postal Code": "Postleitzahl",
    "Country": "Land",
    "Edit Address": "Adresse bearbeiten",
    "Save Address": "Adresse speichern",
    "Navigation": "Navigation",
    "Skipped": "Übersprungen",
    "Paused": "Pausiert",
    "Pause Subscription": "Subscription Pausieren",
    "Pause": "Pausiere",
    "for": "für",
    "until": "bis",
    "Monday": "Montag", "Mon": "Mo", "Tuesday": "Dienstag", "Tue": "Di",
    "Wednesday": "Mittwoch", "Wed": "Mi", "Thursday": "Donnerstag", "Thu": "Do",
    "Friday": "Freitag", "Fri": "Fr", "Saturday": "Samstag", "Sat": "Sa",
    "Sunday": "Sonntag", "Sun": "So"
  };

  const translateWords = text => {
    let result = text;
    for (const [en, de] of Object.entries(translationMap)) {
      const regex = new RegExp(`\\b${en}\\b`, "gi");
      result = result.replace(regex, de);
    }
    return result;
  };

  const formatDate = text => {
    text = text.replace(/([A-Za-z]{3}) (\d{1,2}), (\d{4})/g,
      (_, m, d, y) => `${parseInt(d)}. ${monthMap[m] || m} ${y}`);
    text = text.replace(/([A-Za-z]+) (\d{1,2})(st|nd|rd|th)?, (\d{4})/g,
      (_, m, d, __, y) => `${parseInt(d)}. ${monthMapFull[m] || m} ${y}`);
    return text;
  };

  const formatCurrencyInline = text =>
    text.replace(/(€\s*[\d.,]+|[\d.,]+\s*€)/g, match => {
      const clean = match.replace(/[^\d.,-]/g, "").replace(",", ".");
      const value = parseFloat(clean);
      if (isNaN(value)) return match;
      return currencyFormatter.format(value);
    });

  const processText = text => {
    if (!text.trim()) return text;
    let result = text;
    result = formatDate(result);
    result = formatCurrencyInline(result);
    result = translateWords(result);
    return result;
  };

  const formatTextNodes = root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentNode || ["SCRIPT","STYLE"].includes(node.parentNode.tagName)) continue;
      const style = window.getComputedStyle(node.parentNode);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const newVal = processText(node.nodeValue);
      if (newVal !== node.nodeValue) node.nodeValue = newVal;
    }
  };

  const fixSplitPrices = () => {
    document.querySelectorAll("span, div, p, strong, td").forEach(el => {
      const children = Array.from(el.childNodes);
      if (children.length === 2 &&
          children[0].textContent.trim() === "€" &&
          /^[\d.,]+$/.test(children[1].textContent.trim())) {
        const num = parseFloat(children[1].textContent.trim().replace(",", "."));
        if (!isNaN(num)) el.textContent = currencyFormatter.format(num);
      }
    });
  };

  const runAll = () => {
    formatTextNodes(document.body);
    fixSplitPrices();
  };

  const observeDynamicChanges = () => {
    const observer = new MutationObserver(() => runAll());
    observer.observe(document.body, { childList: true, subtree: true });
  };

  const init = () => {
    if (!document.body) return setTimeout(init, 50);
    runAll();
    observeDynamicChanges();
    console.log("✅ German formatter active — optimized version");
  };

  init();
})();
