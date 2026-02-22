import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type InsertCalculation } from "@shared/schema";

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.calculations.list.path, asyncHandler(async (req, res) => {
    const calculations = await storage.getCalculations();
    res.json(calculations);
  }));

  app.post(api.calculations.create.path, asyncHandler(async (req, res) => {
    try {
      const input = api.calculations.create.input.parse(req.body);
      const calculation = await storage.createCalculation(input);
      res.status(201).json(calculation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  }));

  // Drink order routes
  app.post(api.drinkOrders.create.path, async (req, res) => {
    try {
      const input = api.drinkOrders.create.input.parse(req.body);
      const order = await storage.createDrinkOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.drinkOrders.report.path, async (req, res) => {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const orders = await storage.getDrinkOrderReport(month, year);

    // Aggregate items across all orders for the month
    const aggregated: Record<string, { name: string; category: string; quantity: number }> = {};
    for (const order of orders) {
      const items = JSON.parse(order.items) as Array<{ name: string; category: string; quantity: number }>;
      for (const item of items) {
        const key = `${item.category}::${item.name}`;
        if (aggregated[key]) {
          aggregated[key].quantity += item.quantity;
        } else {
          aggregated[key] = { name: item.name, category: item.category, quantity: item.quantity };
        }
      }
    }

    res.json({
      month,
      year,
      totalOrders: orders.length,
      items: Object.values(aggregated).sort((a, b) => a.category.localeCompare(b.category)),
      orders,
    });
  });

  // Seed data
  const existing = await storage.getCalculations();
  if (existing.length === 0) {
    const SEED_DATA: InsertCalculation[] = [
      {
        totalAmount: "100",
        waiterCount: 2,
        cookCount: 1,
        dishwasherCount: 1,
        waiterPerPerson: "37.50",
        cookPerPerson: "20",
        dishwasherPerPerson: "5",
      },
      {
        totalAmount: "50.50",
        waiterCount: 1,
        cookCount: 2,
        dishwasherCount: 0,
        waiterPerPerson: "37.875",
        cookPerPerson: "6.3125",
        dishwasherPerPerson: "0",
      },
    ];

    for (const calculation of SEED_DATA) {
      await storage.createCalculation(calculation);
    }
  }

  return httpServer;
}
