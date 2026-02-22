import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  totalAmount: numeric("total_amount").notNull(),
  waiterCount: integer("waiter_count").notNull(),
  cookCount: integer("cook_count").notNull(),
  dishwasherCount: integer("dishwasher_count").notNull(),
  waiterPerPerson: numeric("waiter_per_person").notNull(),
  cookPerPerson: numeric("cook_per_person").notNull(),
  dishwasherPerPerson: numeric("dishwasher_per_person").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drinkOrders = pgTable("drink_orders", {
  id: serial("id").primaryKey(),
  items: text("items").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalculationSchema = createInsertSchema(calculations, {
  totalAmount: z.string().regex(/^\d*\.?\d+$/, "Must be a valid positive number"),
  waiterPerPerson: z.string().regex(/^\d*\.?\d+$/, "Must be a valid positive number"),
  cookPerPerson: z.string().regex(/^\d*\.?\d+$/, "Must be a valid positive number"),
  dishwasherPerPerson: z.string().regex(/^\d*\.?\d+$/, "Must be a valid positive number"),
}).omit({ id: true, createdAt: true });
export const insertDrinkOrderSchema = createInsertSchema(drinkOrders).omit({ id: true, createdAt: true });

export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type DrinkOrder = typeof drinkOrders.$inferSelect;
export type InsertDrinkOrder = z.infer<typeof insertDrinkOrderSchema>;
