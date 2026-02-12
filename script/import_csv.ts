import fs from "fs";
import path from "path";

// Load .env manually since we're running specific script
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const [key, ...value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.join("=").trim().replace(/^["']|["']$/g, "");
        }
    });
}

async function main() {
    // Dynamic imports to ensure env is loaded first
    const { db } = await import("../server/db");
    const { calculations } = await import("../shared/schema");

    const csvPath = path.resolve(process.cwd(), "calculations.csv");
    console.log(`Reading CSV from ${csvPath}...`);

    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.trim().split("\n");

    // Skip header
    const dataRows = lines.slice(1);

    console.log(`Found ${dataRows.length} rows.`);

    const records = dataRows.map(line => {
        // Basic CSV parsing
        const parts: string[] = [];
        let current = "";
        let inQuote = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                parts.push(current);
                current = "";
                continue;
            }
            current += char;
        }
        parts.push(current);

        const clean = (val: string) => {
            let cleanVal = val.trim();
            if (cleanVal.startsWith('"') && cleanVal.endsWith('"')) {
                cleanVal = cleanVal.slice(1, -1);
            }
            if (cleanVal.startsWith('""') && cleanVal.endsWith('""')) {
                cleanVal = cleanVal.slice(2, -2);
            }
            return cleanVal;
        };

        // "id","total_amount","waiter_count","cook_count","dishwasher_count","created_at","waiter_per_person","cook_per_person","dishwasher_per_person"
        const [
            id, totalAmount, waiterCount, cookCount, dishwasherCount, createdAt,
            waiterPerPerson, cookPerPerson, dishwasherPerPerson
        ] = parts.map(clean);

        return {
            totalAmount: totalAmount,
            waiterCount: parseInt(waiterCount),
            cookCount: parseInt(cookCount),
            dishwasherCount: parseInt(dishwasherCount),
            createdAt: new Date(createdAt),
            waiterPerPerson: waiterPerPerson,
            cookPerPerson: cookPerPerson,
            dishwasherPerPerson: dishwasherPerPerson
        };
    });

    console.log("Inserting records...");

    await db.insert(calculations).values(records);

    console.log("Done!");
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
