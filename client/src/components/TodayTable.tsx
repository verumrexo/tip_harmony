import { type Calculation } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TodayTableProps {
  splits: Calculation[];
}

interface Role {
  key: string;
  one: string;
  many: string;
  count: (calc: Calculation) => number;
  perPerson: (calc: Calculation) => string;
  // Full class names: Tailwind only generates classes it can find in the source
  textClass: string;
  tintClass: string;
}

const ROLES: Role[] = [
  { key: "waiter", one: "Waiter", many: "Waiters", count: (c) => c.waiterCount, perPerson: (c) => c.waiterPerPerson, textClass: "text-role-waiter", tintClass: "bg-role-waiter/15" },
  { key: "cook", one: "Cook", many: "Cooks", count: (c) => c.cookCount, perPerson: (c) => c.cookPerPerson, textClass: "text-role-cook", tintClass: "bg-role-cook/15" },
  { key: "dish", one: "Dish", many: "Dish", count: (c) => c.dishwasherCount, perPerson: (c) => c.dishwasherPerPerson, textClass: "text-role-dish", tintClass: "bg-role-dish/15" },
];

// Whole cents, so each total adds up to exactly the amounts shown above it
const toCents = (value: string) => Math.round(Number(value) * 100);
const euros = (cents: number) => (cents / 100).toFixed(2);

// Today's splits in one table: a row per split, a column per person, day totals at the bottom.
// Nobody is named, so people are numbered: waiter 2 is in every split saved with 2 or more
// waiters, which makes waiter 1 whoever was there longest. Same for cooks and dishwashers.
export function TodayTable({ splits }: TodayTableProps) {
  // Oldest first, so the day reads down to the totals
  const rows = [...splits].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });

  const groups = ROLES.map((role) => {
    const size = Math.max(0, ...rows.map(role.count));
    const totals = Array.from({ length: size }, (_, i) =>
      rows.reduce((sum, calc) => sum + (role.count(calc) > i ? toCents(role.perPerson(calc)) : 0), 0),
    );
    return { ...role, size, totals };
  }).filter((group) => group.size > 0);

  // People only get numbers when a role had more than one of them
  const numbered = groups.some((group) => group.size > 1);
  const hasGaps = rows.some((calc) => groups.some((group) => group.count(calc) < group.size));
  const columnCount = 1 + groups.reduce((sum, group) => sum + group.size, 0);
  const allTips = rows.reduce((sum, calc) => sum + toCents(calc.totalAmount), 0);

  return (
    <section aria-labelledby="today-table-title" className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="today-table-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">Today, per person</h2>
        <span className="text-xs text-muted-foreground">in €</span>
      </div>

      <div className="border-2 border-border bg-card brutal-shadow">
        {/* With a lot of people the table scrolls sideways instead of squeezing the numbers */}
        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse font-mono whitespace-nowrap", columnCount > 6 ? "text-[12px]" : "text-[13px]")}>
            <colgroup>
              <col className="w-14" />
            </colgroup>
            {groups.map((group) => (
              <colgroup key={group.key} span={group.size} />
            ))}
            <thead>
              <tr>
                <th
                  scope="col"
                  rowSpan={numbered ? 2 : 1}
                  className="pl-2.5 pb-[7px] border-b-2 border-border text-left align-bottom font-sans text-[11px] font-semibold text-muted-foreground"
                >
                  Split
                </th>
                {groups.map((group) => (
                  <th
                    key={group.key}
                    scope={group.size > 1 ? "colgroup" : "col"}
                    colSpan={group.size}
                    rowSpan={numbered && group.size === 1 ? 2 : 1}
                    className={cn(
                      "px-[7px] pt-2 border-l-2 border-border text-left align-top font-sans text-xs font-semibold",
                      group.size === 1 && "pb-[7px] border-b-2",
                      group.tintClass,
                      group.textClass,
                    )}
                  >
                    {group.size > 1 ? group.many : group.one}
                  </th>
                ))}
              </tr>
              {numbered && (
                <tr>
                  {groups.filter((group) => group.size > 1).flatMap((group) =>
                    Array.from({ length: group.size }, (_, i) => (
                      <th
                        key={`${group.key}-${i}`}
                        scope="col"
                        className={cn(
                          "pr-[7px] pt-[3px] pb-[7px] border-b-2 border-border text-right text-xs font-bold text-foreground/85",
                          i === 0 && "border-l-2",
                          group.tintClass,
                        )}
                      >
                        {i + 1}
                      </th>
                    )),
                  )}
                </tr>
              )}
            </thead>
            <tbody>
              {rows.map((calc, r) => (
                <tr key={calc.id} className={cn("align-top", r > 0 && "border-t border-border/50")}>
                  <th scope="row" className="pl-2.5 py-2.5 text-left font-normal text-muted-foreground">
                    {calc.createdAt && new Date(calc.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    <span className="block text-[11px] leading-4 text-foreground/85">€{euros(toCents(calc.totalAmount))}</span>
                  </th>
                  {groups.flatMap((group) =>
                    Array.from({ length: group.size }, (_, i) => {
                      const wasThere = group.count(calc) > i;
                      return (
                        <td
                          key={`${group.key}-${i}`}
                          className={cn("pr-[7px] py-2.5 text-right", i === 0 && "border-l-2 border-border", !wasThere && "text-muted-foreground")}
                        >
                          {wasThere ? euros(toCents(group.perPerson(calc))) : (
                            <>
                              <span aria-hidden="true">–</span>
                              <span className="sr-only">not there</span>
                            </>
                          )}
                        </td>
                      );
                    }),
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted">
                <th scope="row" className="pl-2.5 py-[11px] text-left font-sans text-[13px] font-bold">Total</th>
                {groups.flatMap((group) =>
                  group.totals.map((cents, i) => (
                    <td
                      key={`${group.key}-${i}`}
                      className={cn("pr-[7px] py-[11px] text-right font-extrabold", i === 0 && "border-l-2 border-border", group.textClass)}
                    >
                      {euros(cents)}
                    </td>
                  )),
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Outside the scrolling part, so the day's total never ends up off screen */}
        <div className="flex items-baseline justify-between gap-3 p-2.5 border-t-2 border-border">
          <span className="text-[13px] font-semibold text-foreground/85">
            All tips today <span className="font-medium text-muted-foreground">· {rows.length} {rows.length === 1 ? "split" : "splits"}</span>
          </span>
          <span className="text-[15px] font-bold font-mono">€{euros(allTips)}</span>
        </div>
      </div>

      {hasGaps && (
        <p className="text-xs leading-snug text-muted-foreground">
          Number 1 is whoever was there longest, then 2, and so on. A dash means they weren't there for that split.
        </p>
      )}
    </section>
  );
}
