import { 
  User, InsertUser, 
  Branch, InsertBranch,
  Product, InsertProduct,
  ProductCategory, InsertProductCategory,
  Inventory, InsertInventory,
  Customer, InsertCustomer,
  Supplier, InsertSupplier,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  ActivityLog, InsertActivityLog
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Branch operations
  getBranch(id: number): Promise<Branch | undefined>;
  getBranchByName(name: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;
  listBranches(): Promise<Branch[]>;
  deleteBranch(id: number): Promise<boolean>;

  // Product Category operations
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  listProductCategories(): Promise<ProductCategory[]>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  listProducts(): Promise<Product[]>;
  deleteProduct(id: number): Promise<boolean>;

  // Inventory operations
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  listInventoryByBranch(branchId: number): Promise<Inventory[]>;
  listLowStockItems(threshold?: number): Promise<Inventory[]>;

  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  listCustomers(): Promise<Customer[]>;
  deleteCustomer(id: number): Promise<boolean>;

  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSupplierByName(name: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  listSuppliers(): Promise<Supplier[]>;
  deleteSupplier(id: number): Promise<boolean>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  listOrdersByCustomer(customerId: number): Promise<Order[]>;
  listRecentOrders(limit?: number): Promise<Order[]>;

  // Order Item operations
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  listOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;

  // Activity Log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  listRecentActivities(limit?: number): Promise<ActivityLog[]>;

  // Session store for authentication
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private branches: Map<number, Branch>;
  private productCategories: Map<number, ProductCategory>;
  private products: Map<number, Product>;
  private inventory: Map<number, Inventory>;
  private customers: Map<number, Customer>;
  private suppliers: Map<number, Supplier>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private activityLogs: Map<number, ActivityLog>;
  
  // Counters for IDs
  private userIdCounter: number;
  private branchIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private inventoryIdCounter: number;
  private customerIdCounter: number;
  private supplierIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private activityLogIdCounter: number;
  
  // Session store
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.branches = new Map();
    this.productCategories = new Map();
    this.products = new Map();
    this.inventory = new Map();
    this.customers = new Map();
    this.suppliers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.activityLogs = new Map();
    
    this.userIdCounter = 1;
    this.branchIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.inventoryIdCounter = 1;
    this.customerIdCounter = 1;
    this.supplierIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.activityLogIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with some default data
    this.initializeData();
  }

  private initializeData() {
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This will get hashed in the auth.ts file
      fullName: "System Administrator",
      email: "admin@bizmanagepro.com",
      role: "admin",
      branchId: null
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, active: true };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Branch operations
  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async getBranchByName(name: string): Promise<Branch | undefined> {
    return Array.from(this.branches.values()).find(
      (branch) => branch.name === name
    );
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    const id = this.branchIdCounter++;
    const branch: Branch = { ...branchData, id, active: true };
    this.branches.set(id, branch);
    return branch;
  }

  async updateBranch(id: number, branchData: Partial<InsertBranch>): Promise<Branch | undefined> {
    const branch = this.branches.get(id);
    if (!branch) return undefined;
    
    const updatedBranch = { ...branch, ...branchData };
    this.branches.set(id, updatedBranch);
    return updatedBranch;
  }

  async listBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async deleteBranch(id: number): Promise<boolean> {
    return this.branches.delete(id);
  }

  // Product Category operations
  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    return this.productCategories.get(id);
  }

  async createProductCategory(categoryData: InsertProductCategory): Promise<ProductCategory> {
    const id = this.categoryIdCounter++;
    const category: ProductCategory = { ...categoryData, id };
    this.productCategories.set(id, category);
    return category;
  }

  async listProductCategories(): Promise<ProductCategory[]> {
    return Array.from(this.productCategories.values());
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.sku === sku
    );
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { ...productData, id, inStock: true };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async listProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Inventory operations
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(itemData: InsertInventory): Promise<Inventory> {
    const id = this.inventoryIdCounter++;
    const now = new Date();
    const item: Inventory = { ...itemData, id, lastUpdated: now };
    this.inventory.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const item = this.inventory.get(id);
    if (!item) return undefined;
    
    const now = new Date();
    const updatedItem = { ...item, ...itemData, lastUpdated: now };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }

  async listInventoryByBranch(branchId: number): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      (item) => item.branchId === branchId
    );
  }

  async listLowStockItems(threshold: number = 10): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      (item) => item.quantity <= threshold
    );
  }

  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const now = new Date();
    const customer: Customer = { ...customerData, id, loyaltyPoints: 0, registeredDate: now };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async listCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { ...orderData, id, orderDate: now, status: "pending", paymentStatus: false };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status: status as any }; // Type cast for simplicity
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async listOrdersByCustomer(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
    );
  }

  async listRecentOrders(limit: number = 10): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
      .slice(0, limit);
  }

  // Order Item operations
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    return this.orderItems.get(id);
  }

  async createOrderItem(itemData: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const item: OrderItem = { ...itemData, id };
    this.orderItems.set(id, item);
    return item;
  }

  async listOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  // Activity Log operations
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogIdCounter++;
    const now = new Date();
    const log: ActivityLog = { ...logData, id, timestamp: now };
    this.activityLogs.set(id, log);
    return log;
  }

  async listRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
