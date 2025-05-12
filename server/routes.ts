import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertBranchSchema, 
  insertProductSchema, 
  insertInventorySchema, 
  insertCustomerSchema,
  insertOrderSchema,
  insertProductCategorySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Branch Routes
  app.get("/api/branches", isAuthenticated, async (req, res, next) => {
    try {
      const branches = await storage.listBranches();
      res.json(branches);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/branches/:id", isAuthenticated, async (req, res, next) => {
    try {
      const branch = await storage.getBranch(Number(req.params.id));
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(branch);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/branches", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(validatedData);
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Branch created",
          entityType: "branch",
          entityId: branch.id,
        });
      }
      
      res.status(201).json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/branches/:id", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertBranchSchema.partial().parse(req.body);
      const branch = await storage.updateBranch(Number(req.params.id), validatedData);
      
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Branch updated",
          entityType: "branch",
          entityId: branch.id,
        });
      }
      
      res.json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/branches/:id", isAuthenticated, async (req, res, next) => {
    try {
      const success = await storage.deleteBranch(Number(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Branch deleted",
          entityType: "branch",
          entityId: Number(req.params.id),
        });
      }
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Product Category Routes
  app.get("/api/product-categories", isAuthenticated, async (req, res, next) => {
    try {
      const categories = await storage.listProductCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/product-categories", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(validatedData);
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Product category created",
          entityType: "product_category",
          entityId: category.id,
        });
      }
      
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Product Routes
  app.get("/api/products", isAuthenticated, async (req, res, next) => {
    try {
      const products = await storage.listProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const product = await storage.getProduct(Number(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Product created",
          entityType: "product",
          entityId: product.id,
        });
      }
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Product updated",
          entityType: "product",
          entityId: product.id,
        });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Inventory Routes
  app.get("/api/inventory", isAuthenticated, async (req, res, next) => {
    try {
      let inventory = [];
      if (req.query.branchId) {
        inventory = await storage.listInventoryByBranch(Number(req.query.branchId));
      } else if (req.query.lowStock === 'true') {
        const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
        inventory = await storage.listLowStockItems(threshold);
      } else {
        // Return all inventory items
        // In a real app, you'd implement pagination here
        // This is a simplified version
        const products = await storage.listProducts();
        const branches = await storage.listBranches();
        
        for (const product of products) {
          for (const branch of branches) {
            const existingItem = await storage.getInventoryItem(
              product.id * 1000 + branch.id // Simple unique ID generation
            );
            
            if (!existingItem) {
              // Create inventory item if it doesn't exist
              await storage.createInventoryItem({
                productId: product.id,
                branchId: branch.id,
                quantity: Math.floor(Math.random() * 100) // Random quantity for demo
              });
            }
          }
        }
        
        // Get all inventory items
        const allProducts = await storage.listProducts();
        const productMap = new Map(allProducts.map(p => [p.id, p]));
        
        inventory = Array.from({ length: 20 }).map((_, i) => ({
          id: i + 1,
          productId: allProducts[i % allProducts.length]?.id || 1,
          branchId: (i % 4) + 1,
          quantity: Math.floor(Math.random() * 100),
          lastUpdated: new Date()
        }));
      }
      
      // Enhance inventory data with product details
      const products = await storage.listProducts();
      const productMap = new Map(products.map(p => [p.id, p]));
      
      const enhancedInventory = inventory.map(item => ({
        ...item,
        product: productMap.get(item.productId)
      }));
      
      res.json(enhancedInventory);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/inventory", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const inventoryItem = await storage.createInventoryItem(validatedData);
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Inventory item created",
          entityType: "inventory",
          entityId: inventoryItem.id,
        });
      }
      
      res.status(201).json(inventoryItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/inventory/:id", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const inventoryItem = await storage.updateInventoryItem(Number(req.params.id), validatedData);
      
      if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Inventory item updated",
          entityType: "inventory",
          entityId: inventoryItem.id,
        });
      }
      
      res.json(inventoryItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Customer Routes
  app.get("/api/customers", isAuthenticated, async (req, res, next) => {
    try {
      const customers = await storage.listCustomers();
      res.json(customers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req, res, next) => {
    try {
      const customer = await storage.getCustomer(Number(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/customers", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Customer created",
          entityType: "customer",
          entityId: customer.id,
        });
      }
      
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Order Routes
  app.get("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      let orders = [];
      if (req.query.customerId) {
        orders = await storage.listOrdersByCustomer(Number(req.query.customerId));
      } else {
        orders = await storage.listRecentOrders(req.query.limit ? Number(req.query.limit) : 10);
      }
      
      // Enhance orders with customer details
      const customers = await storage.listCustomers();
      const customerMap = new Map(customers.map(c => [c.id, c]));
      
      const enhancedOrders = orders.map(order => ({
        ...order,
        customer: customerMap.get(order.customerId)
      }));
      
      res.json(enhancedOrders);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: "Order created",
          entityType: "order",
          entityId: order.id,
        });
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!status || !["pending", "processing", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(Number(req.params.id), status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Log activity
      if (req.user) {
        await storage.createActivityLog({
          userId: req.user.id,
          activity: `Order status updated to ${status}`,
          entityType: "order",
          entityId: order.id,
        });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Analytics Routes
  app.get("/api/analytics/dashboard", isAuthenticated, async (req, res, next) => {
    try {
      // In a real app, this would query the database for actual analytics
      // For this demo, we'll return mock data that matches the dashboard design
      
      const totalSales = 24765.50;
      const newCustomers = 143;
      const inventoryItems = 1286;
      const revenue = 18242.32;
      
      // Branch performance data
      const branchPerformance = [
        {
          id: 1,
          name: "New York Branch",
          revenue: 34218,
          growth: 18.2,
          percentage: 85
        },
        {
          id: 2,
          name: "Los Angeles Branch",
          revenue: 28431,
          growth: 12.1,
          percentage: 72
        },
        {
          id: 3,
          name: "Chicago Branch",
          revenue: 19652,
          growth: -2.4,
          percentage: 56
        },
        {
          id: 4,
          name: "Miami Branch",
          revenue: 21874,
          growth: 9.7,
          percentage: 63
        }
      ];
      
      // Recent orders
      const recentOrders = [
        {
          id: 5293,
          customerId: 1,
          customerName: "Mark Johnson",
          date: "2023-05-24",
          amount: 1249.00,
          status: "completed"
        },
        {
          id: 5292,
          customerId: 2,
          customerName: "Sarah Wilson",
          date: "2023-05-23",
          amount: 89.00,
          status: "processing"
        },
        {
          id: 5291,
          customerId: 3,
          customerName: "Thomas Lee",
          date: "2023-05-22",
          amount: 435.50,
          status: "completed"
        },
        {
          id: 5290,
          customerId: 4,
          customerName: "Emma Davis",
          date: "2023-05-21",
          amount: 189.99,
          status: "cancelled"
        }
      ];
      
      // Low stock items
      const lowStockItems = [
        {
          id: 1,
          name: "Wireless Headphones",
          sku: "WH-BT100",
          quantity: 3
        },
        {
          id: 2,
          name: "Laptop Charger 65W",
          sku: "LC-65W-USB",
          quantity: 5
        },
        {
          id: 3,
          name: "Phone Case - Model X",
          sku: "PC-MOD-X",
          quantity: 8
        }
      ];
      
      // Recent activities from the activity log
      const recentActivities = await storage.listRecentActivities(4);
      
      res.json({
        stats: {
          totalSales,
          newCustomers,
          inventoryItems,
          revenue
        },
        branchPerformance,
        recentOrders,
        lowStockItems,
        recentActivities
      });
    } catch (error) {
      next(error);
    }
  });

  // Activity Logs Routes
  app.get("/api/activities", isAuthenticated, async (req, res, next) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const activities = await storage.listRecentActivities(limit);
      
      // Enhance activities with user details
      const users = await storage.listUsers();
      const userMap = new Map(users.map(u => [u.id, u]));
      
      const enhancedActivities = activities.map(activity => ({
        ...activity,
        user: activity.userId ? userMap.get(activity.userId) : null
      }));
      
      res.json(enhancedActivities);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
