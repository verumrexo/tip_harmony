// Monthly Drink Report Script
// Queries Supabase for drink orders and sends a summary email via Resend
// Runs standalone with zero npm install — uses built-in fetch (Node 18+)

import { processDrinkOrders, formatDrinkReport, formatDrinkReportHtml, type Order } from "../shared/drink-utils";

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
            'apikey': SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY!}`,
        },
    });

    if (!res.ok) {
        console.error('Supabase query failed:', res.status, await res.text());
        process.exit(1);
    }

    const orders = await res.json() as Order[];

    if (orders.length === 0) {
        console.log('No orders found for this period. Skipping email.');
        return;
    }

    const processedItems = processDrinkOrders(orders);
    const textReport = formatDrinkReport(processedItems, orders.length, month, year);
    const html = formatDrinkReportHtml(processedItems, orders.length, month, year);

    // Send via Resend
    console.log(`Sending report with ${processedItems.length} items to ${REPORT_EMAIL}...`);
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
            text: textReport,
        }),
    });

    if (!emailRes.ok) {
        console.error('Resend failed:', emailRes.status, await emailRes.text());
        process.exit(1);
    }

    const result = await emailRes.json();
    console.log('Email sent successfully:', result); // result usually has 'id'
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
