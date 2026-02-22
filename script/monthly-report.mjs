// Monthly Drink Report Script
// Queries Supabase for drink orders and sends a summary email via Resend
// Runs standalone with zero npm install — uses built-in fetch (Node 18+)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REPORT_EMAIL = process.env.REPORT_EMAIL || 'patriksjulijsadamovs@gmail.com';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RESEND_API_KEY) {
    console.error('Missing env vars: SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY');
    process.exit(1);
}

// Get previous month's date range
const now = new Date();
const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
const month = now.getMonth() === 0 ? 12 : now.getMonth(); // previous month (1-indexed)
const startDate = new Date(year, month - 1, 1).toISOString();
const endDate = new Date(year, month, 1).toISOString();

const monthNames = [
    'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
    'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
];
const monthName = monthNames[month - 1];

async function main() {
    console.log(`Generating report for ${monthName} ${year}...`);

    // Query Supabase REST API
    const url = `${SUPABASE_URL}/rest/v1/drink_orders?select=*&created_at=gte.${startDate}&created_at=lt.${endDate}&order=created_at.desc`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });

    if (!res.ok) {
        console.error('Supabase query failed:', res.status, await res.text());
        process.exit(1);
    }

    const orders = await res.json();

    if (orders.length === 0) {
        console.log('No orders found for this period. Skipping email.');
        return;
    }

    // Aggregate items
    const aggregated = {};
    for (const order of orders) {
        const items = JSON.parse(order.items);
        for (const item of items) {
            const key = `${item.category}::${item.name}`;
            if (aggregated[key]) {
                aggregated[key].quantity += item.quantity;
            } else {
                aggregated[key] = { name: item.name, category: item.category, quantity: item.quantity };
            }
        }
    }

    const sortedItems = Object.values(aggregated).sort((a, b) => a.category.localeCompare(b.category));

    // Build HTML email
    let html = `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">`;
    html += `<h2 style="color: #f59e0b;">🍷 Dzērienu atskaite — ${monthName} ${year}</h2>`;
    html += `<p style="color: #666;">Kopā ieraksti: <strong>${orders.length}</strong></p>`;
    html += `<table style="width: 100%; border-collapse: collapse; margin-top: 16px;">`;
    html += `<tr style="background: #1a1a2e; color: #fff;"><th style="padding: 8px 12px; text-align: left;">Dzēriens</th><th style="padding: 8px 12px; text-align: left;">Kategorija</th><th style="padding: 8px 12px; text-align: right;">Daudzums</th></tr>`;

    let currentCat = '';
    for (const item of sortedItems) {
        if (item.category !== currentCat) {
            currentCat = item.category;
            html += `<tr><td colspan="3" style="padding: 12px 12px 4px; font-weight: bold; color: #f59e0b; border-top: 1px solid #eee;">${currentCat}</td></tr>`;
        }
        html += `<tr style="border-bottom: 1px solid #f0f0f0;">`;
        html += `<td style="padding: 6px 12px;">${item.name}</td>`;
        html += `<td style="padding: 6px 12px; color: #999; font-size: 12px;">${item.category}</td>`;
        html += `<td style="padding: 6px 12px; text-align: right; font-weight: bold;">${item.quantity}</td>`;
        html += `</tr>`;
    }

    html += `</table>`;
    html += `<p style="color: #999; font-size: 12px; margin-top: 24px;">Automātiski ģenerēts ar Tip Harmony</p>`;
    html += `</div>`;

    // Also build plain text
    let text = `Dzērienu atskaite — ${monthName} ${year}\n`;
    text += `Kopā ieraksti: ${orders.length}\n\n`;
    currentCat = '';
    for (const item of sortedItems) {
        if (item.category !== currentCat) {
            currentCat = item.category;
            text += `\n${currentCat}\n`;
        }
        text += `  ${item.name}: ${item.quantity}\n`;
    }

    // Send via Resend
    console.log(`Sending report with ${sortedItems.length} items to ${REPORT_EMAIL}...`);
    const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'Tip Harmony <onboarding@resend.dev>',
            to: [REPORT_EMAIL],
            subject: `🍷 Dzērienu atskaite — ${monthName} ${year}`,
            html,
            text,
        }),
    });

    if (!emailRes.ok) {
        console.error('Resend failed:', emailRes.status, await emailRes.text());
        process.exit(1);
    }

    const result = await emailRes.json();
    console.log('Email sent successfully:', result.id);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
