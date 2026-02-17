
export interface Calculation {
    id: number;
    totalAmount: string | number;
    createdAt: Date | string;
    [key: string]: any;
}

export function calculateAnalytics(history: Calculation[] | undefined | null, days: string) {
    if (!history || history.length === 0) return null;

    const dayCount = parseInt(days);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayCount);

    const startTime = startDate.getTime();
    const endTime = today.getTime();

    // Data structures
    // Key: YYYY-M-D (faster than toLocaleDateString)
    const dailyMap = new Map<string, { date: string, fullDate: Date, amount: number, count: number }>();

    // Initialize week map
    const weekMap = new Array(7).fill(0).map((_, i) => ({
        dayIndex: i,
        total: 0,
        count: 0
    }));

    // Initialize month map
    const monthMap = new Map<string, { name: string, date: Date, amount: number, count: number }>();

    // Initialize bins
    const bins = [
        { label: "€0-50", min: 0, max: 50, count: 0 },
        { label: "€50-100", min: 50, max: 100, count: 0 },
        { label: "€100-150", min: 100, max: 150, count: 0 },
        { label: "€150-200", min: 150, max: 200, count: 0 },
        { label: "€200+", min: 200, max: Infinity, count: 0 }
    ];

    // Single pass over history
    for (const calc of history) {
        // calc.createdAt is likely a Date object (from useCalculations)
        // If it's a string, we create a new Date.
        const d = calc.createdAt instanceof Date ? calc.createdAt : new Date(calc.createdAt);
        const time = d.getTime();

        if (time >= startTime && time <= endTime) {
            const amount = typeof calc.totalAmount === 'string' ? parseFloat(calc.totalAmount) : Number(calc.totalAmount);

            // 1. Daily Trend
            // Optimization: Use YYYY-M-D as key to avoid slow toLocaleDateString() on every iteration
            const year = d.getFullYear();
            const month = d.getMonth();
            const day = d.getDate();
            const dateKey = `${year}-${month}-${day}`;

            let dailyEntry = dailyMap.get(dateKey);
            if (!dailyEntry) {
                dailyEntry = {
                    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    fullDate: d,
                    amount: 0,
                    count: 0
                };
                dailyMap.set(dateKey, dailyEntry);
            }
            dailyEntry.amount += amount;
            dailyEntry.count += 1;

            // 2. Weekly Pattern
            const dayIndex = d.getDay();
            const weekEntry = weekMap[dayIndex];
            weekEntry.total += amount;
            weekEntry.count += 1;

            // 3. Monthly Trends
            const monthKey = `${year}-${month}`;
            let monthEntry = monthMap.get(monthKey);
            if (!monthEntry) {
                monthEntry = {
                    name: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
                    date: new Date(year, month, 1),
                    amount: 0,
                    count: 0
                };
                monthMap.set(monthKey, monthEntry);
            }
            monthEntry.amount += amount;
            monthEntry.count += 1;

            // 4. Tip Distribution
            if (amount < 50) bins[0].count++;
            else if (amount < 100) bins[1].count++;
            else if (amount < 150) bins[2].count++;
            else if (amount < 200) bins[3].count++;
            else bins[4].count++;
        }
    }

    // Post-processing (Trend Data filling)
    const trendData = [];
    for (let i = dayCount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);

        // Must use same key format as above
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();
        const dateKey = `${year}-${month}-${day}`;

        if (dailyMap.has(dateKey)) {
            trendData.push(dailyMap.get(dateKey)!);
        } else {
            trendData.push({
                date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: d,
                amount: 0,
                count: 0
            });
        }
    }

    const totalAmount = trendData.reduce((sum, item) => sum + item.amount, 0);
    const nonZeroDays = trendData.filter(d => d.amount > 0).length;
    const average = nonZeroDays > 0 ? totalAmount / nonZeroDays : 0;

    // Post-processing (Weekly Data)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = weekMap.map(d => ({
        name: dayNames[d.dayIndex],
        amount: d.count > 0 ? d.total / d.count : 0,
        count: d.count,
        originalIndex: d.dayIndex
    })).sort((a, b) => {
        const getSortIndex = (idx: number) => idx === 0 ? 7 : idx;
        return getSortIndex(a.originalIndex) - getSortIndex(b.originalIndex);
    });

    // Post-processing (Monthly Data)
    const monthlyData = Array.from(monthMap.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Post-processing (Distribution Data)
    const distributionData = bins.map(b => ({ name: b.label, count: b.count }));

    return {
        trendData,
        average,
        weeklyData,
        monthlyData,
        distributionData
    };
}
