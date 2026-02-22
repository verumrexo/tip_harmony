import { db } from "./db";
import {
  calculations,
  drinkOrders,
  type InsertCalculation,
  type Calculation,
  type InsertDrinkOrder,
  type DrinkOrder,
} from "@shared/schema";
import { desc, sql } from "drizzle-orm";

export interface IStorage {
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculations(): Promise<Calculation[]>;
  createDrinkOrder(order: InsertDrinkOrder): Promise<DrinkOrder>;
  getDrinkOrderReport(month: number, year: number): Promise<DrinkOrder[]>;
}

export class DatabaseStorage implements IStorage {
  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const [calculation] = await db
      .insert(calculations)
      .values(insertCalculation)
      .returning();
    return calculation;
  }

  async getCalculations(): Promise<Calculation[]> {
    return await db.select().from(calculations).orderBy(desc(calculations.createdAt));
  }

  async createDrinkOrder(order: InsertDrinkOrder): Promise<DrinkOrder> {
    const [drinkOrder] = await db
      .insert(drinkOrders)
      .values(order)
      .returning();
    return drinkOrder;
  }

  async getDrinkOrderReport(month: number, year: number): Promise<DrinkOrder[]> {
    return await db
      .select()
      .from(drinkOrders)
      .where(
        sql`EXTRACT(MONTH FROM ${drinkOrders.createdAt}) = ${month} AND EXTRACT(YEAR FROM ${drinkOrders.createdAt}) = ${year}`
      )
      .orderBy(desc(drinkOrders.createdAt));
  }
}

export const storage = new DatabaseStorage();
