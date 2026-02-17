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
