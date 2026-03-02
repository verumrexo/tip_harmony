export interface DrinkOrderItem {
  name: string;
  category: string;
  quantity: number;
}

export interface Order {
  items: string; // JSON string
  [key: string]: any;
}

export interface ProcessedItem {
  name: string;
  category: string;
  display: string;
  quantity: number; // raw quantity, used for aggregation if needed
}

export const WINE_CATS = new Set([
  "DZIRKSTOŠIE VĪNI",
  "ŠAMPANIETIS",
  "SĀRTVĪNS",
  "BALTVĪNI",
  "SARKANVĪNI",
]);
export const SPIRIT_CATS = new Set([
  "DŽINS",
  "KONJAKI",
  "VODKA",
  "TEKILA",
  "VISKIJS",
  "VERMUTS",
  "RUMS",
  "CITI DZĒRIENI",
]);

const parseVol = (n: string) => {
  const m = n.match(/^(.+?)\s+([\d.]+)\s*(ml|cl|l|g)?$/i);
  if (!m) return null;
  const v = parseFloat(m[2]);
  const u = (m[3] || "l").toLowerCase();
  return {
    base: m[1].trim(),
    L: u === "g" ? v : u === "ml" ? v / 1000 : u === "cl" ? v / 100 : v,
    unit: u,
  };
};

/**
 * Aggregates raw orders, applies volume stacking logic, and returns sorted display items.
 */
export function processDrinkOrders(orders: Order[]): ProcessedItem[] {
  // Aggregate items
  const aggregated: Record<
    string,
    { name: string; category: string; quantity: number }
  > = {};
  for (const order of orders) {
    let items: DrinkOrderItem[] = [];
    try {
      items = JSON.parse(order.items);
    } catch (e) {
      console.error("Failed to parse order items:", e);
      continue;
    }

    for (const item of items) {
      const key = `${item.category}::${item.name}`;
      if (aggregated[key]) {
        aggregated[key].quantity += item.quantity;
      } else {
        aggregated[key] = { ...item };
      }
    }
  }

  const sortedItems = Object.values(aggregated).sort((a, b) =>
    a.category.localeCompare(b.category)
  );

  const volGroups: Record<
    string,
    { base: string; cat: string; totalL: number; unit: string }
  > = {};
  const displayItems: ProcessedItem[] = [];

  for (const item of sortedItems) {
    const stack =
      item.name.startsWith("Kvass") ||
      item.category === "ALUS — IZLEJAMAIS" ||
      item.category === "SULAS" ||
      item.category === "AUGĻI" ||
      SPIRIT_CATS.has(item.category) ||
      (WINE_CATS.has(item.category) && item.name.includes("150ml"));
    const p = stack ? parseVol(item.name) : null;
    if (p) {
      const k = `${item.category}::${p.base}`;
      if (!volGroups[k])
        volGroups[k] = { base: p.base, cat: item.category, totalL: 0, unit: p.unit };
      volGroups[k].totalL += p.L * item.quantity;
    } else {
      displayItems.push({
        name: item.name,
        category: item.category,
        display: String(item.quantity),
        quantity: item.quantity,
      });
    }
  }

  for (const g of Object.values(volGroups)) {
    let v: string;
    if (g.unit === "g") {
      v = `${Math.round(g.totalL)}g`;
    } else {
      const ml = Math.round(g.totalL * 1000);
      v = g.totalL >= 1
        ? (g.totalL % 1 === 0 ? `${g.totalL}l` : `${parseFloat(g.totalL.toFixed(2))}l`)
        : `${ml}ml`;
    }
    displayItems.push({
      name: g.base,
      category: g.cat,
      display: v,
      quantity: 0, // Volume stacked items don't have a simple quantity in this view
    });
  }

  displayItems.sort((a, b) => a.category.localeCompare(b.category));
  return displayItems;
}

/**
 * Generates the plain text report string from processed items.
 */
export function formatDrinkReport(
  items: ProcessedItem[],
  totalOrders: number,
  month: number,
  year: number
): string {
  let report = `Dzērienu atskaite — ${month}/${year}\n`;
  report += `Kopā ieraksti: ${totalOrders}\n\n`;
  let currentCat = "";
  for (const item of items) {
    if (item.category !== currentCat) {
      currentCat = item.category;
      report += `\n${currentCat}\n`;
    }
    report += `  ${item.name}: ${item.display}\n`;
  }
  return report;
}

const MONTH_NAMES = [
  'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
  'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris',
];

/**
 * Generates the HTML email report from processed items.
 */
export function formatDrinkReportHtml(
  items: ProcessedItem[],
  totalOrders: number,
  month: number,
  year: number,
): string {
  const monthName = MONTH_NAMES[month - 1];
  let html = `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">`;
  html += `<h2 style="color: #f59e0b;">🍷 Dzērienu atskaite — ${monthName} ${year}</h2>`;
  html += `<p style="color: #666;">Kopā ieraksti: <strong>${totalOrders}</strong></p>`;
  html += `<table style="width: 100%; border-collapse: collapse; margin-top: 16px;">`;
  html += `<tr style="background: #1a1a2e; color: #fff;"><th style="padding: 8px 12px; text-align: left;">Dzēriens</th><th style="padding: 8px 12px; text-align: left;">Kategorija</th><th style="padding: 8px 12px; text-align: right;">Daudzums</th></tr>`;

  let currentCat = '';
  for (const item of items) {
    if (item.category !== currentCat) {
      currentCat = item.category;
      html += `<tr><td colspan="3" style="padding: 12px 12px 4px; font-weight: bold; color: #f59e0b; border-top: 1px solid #eee;">${currentCat}</td></tr>`;
    }
    html += `<tr style="border-bottom: 1px solid #f0f0f0;">`;
    html += `<td style="padding: 6px 12px;">${item.name}</td>`;
    html += `<td style="padding: 6px 12px; color: #999; font-size: 12px;">${item.category}</td>`;
    html += `<td style="padding: 6px 12px; text-align: right; font-weight: bold;">${item.display}</td>`;
    html += `</tr>`;
  }

  html += `</table>`;
  html += `<p style="color: #999; font-size: 12px; margin-top: 24px;">Automātiski ģenerēts ar Tip Harmony</p>`;
  html += `</div>`;
  return html;
}
