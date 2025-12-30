import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  totalAmount: numeric("total_amount").notNull(),
  waiterCount: integer("waiter_count").notNull(),
  cookCount: integer("cook_count").notNull(),
  dishwasherCount: integer("dishwasher_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({ id: true, createdAt: true });

export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
