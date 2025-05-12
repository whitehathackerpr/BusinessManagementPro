import Anthropic from '@anthropic-ai/sdk';
import { storage } from './storage';

// Initialize Anthropic client
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define interfaces for insights requests/responses
export interface BusinessInsightRequest {
  dataType: 'sales' | 'inventory' | 'customers' | 'overall';
  timespan: 'day' | 'week' | 'month' | 'quarter' | 'year';
  customFilters?: Record<string, any>;
}

export interface BusinessInsight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'opportunity';
  metrics?: {
    name: string;
    value: string | number;
    change?: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  tags?: string[];
}

export interface BusinessRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  potentialImpact: string;
  implementation: string;
  tags?: string[];
}

export interface BusinessInsightsResponse {
  insights: BusinessInsight[];
  recommendations: BusinessRecommendation[];
  summary: string;
  analysisDate: string;
}

// Function to generate insights from sales data
export async function generateSalesInsights(
  timespan: BusinessInsightRequest['timespan']
): Promise<BusinessInsightsResponse> {
  try {
    // Get relevant data for analysis
    const products = await storage.listProducts();
    const recentOrders = await storage.listRecentOrders(getOrderCountForTimespan(timespan));
    const customers = await storage.listCustomers();
    
    // Prepare data summary for Claude
    const dataSummary = {
      totalOrders: recentOrders.length,
      totalRevenue: recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      averageOrderValue: recentOrders.length > 0 
        ? recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / recentOrders.length 
        : 0,
      topSellingProducts: await getTopSellingProducts(recentOrders),
      customerRetentionRate: calculateCustomerRetentionRate(recentOrders, customers),
      timespan,
    };

    // Analysis prompt for Claude
    const prompt = `
      I need you to analyze business sales data and provide insights and recommendations.
      
      Data Summary:
      - Timespan: ${timespan}
      - Total Orders: ${dataSummary.totalOrders}
      - Total Revenue: $${dataSummary.totalRevenue.toFixed(2)}
      - Average Order Value: $${dataSummary.averageOrderValue.toFixed(2)}
      - Top Selling Products: ${JSON.stringify(dataSummary.topSellingProducts)}
      - Customer Retention Rate: ${dataSummary.customerRetentionRate}%
      
      Based on this data, please identify 3-5 key business insights and 2-3 actionable recommendations.
      
      For each insight, include:
      - A brief title
      - A detailed description with supporting data
      - The type (positive, negative, neutral, or opportunity)
      - Any key metrics or data points
      
      For each recommendation, include:
      - A brief title
      - A detailed description
      - Priority level (low, medium, or high)
      - Potential business impact
      - Implementation guidance
      
      Also provide a brief summary of the overall business health.
      
      Format your response as a JSON object with the following structure:
      {
        "insights": [
          {
            "title": "string",
            "description": "string",
            "type": "positive|negative|neutral|opportunity",
            "metrics": [
              {
                "name": "string",
                "value": "string or number",
                "change": "string or number (optional)",
                "trend": "up|down|stable (optional)"
              }
            ],
            "tags": ["tag1", "tag2"]
          }
        ],
        "recommendations": [
          {
            "title": "string",
            "description": "string",
            "priority": "low|medium|high",
            "potentialImpact": "string",
            "implementation": "string",
            "tags": ["tag1", "tag2"]
          }
        ],
        "summary": "string",
        "analysisDate": "ISO string of current date"
      }
    `;

    // Make request to Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 3000,
      temperature: 0.2,
      system: "You are a business analytics AI specializing in sales data analysis. You provide clear, actionable insights and recommendations based on business data. Always format your response as valid JSON exactly matching the specified structure.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extract and parse JSON from Claude's response
    const content = response.content[0].text;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsedResponse = JSON.parse(jsonStr) as BusinessInsightsResponse;
      return parsedResponse;
    } else {
      throw new Error('Failed to extract JSON from Claude response');
    }
  } catch (error) {
    console.error('Error generating sales insights:', error);
    // Return fallback response if Claude fails
    return {
      insights: [
        {
          title: 'Error Generating Insights',
          description: 'There was an error processing your data. Please try again later.',
          type: 'neutral'
        }
      ],
      recommendations: [],
      summary: 'Unable to analyze data at this time.',
      analysisDate: new Date().toISOString()
    };
  }
}

// Function to generate insights from inventory data
export async function generateInventoryInsights(
  timespan: BusinessInsightRequest['timespan']
): Promise<BusinessInsightsResponse> {
  try {
    // Get relevant data for analysis
    const products = await storage.listProducts();
    const inventoryItems = await storage.listLowStockItems(5); // Get items with low stock
    const branches = await storage.listBranches();
    
    // Prepare data summary for Claude
    const dataSummary = {
      totalProducts: products.length,
      lowStockItems: inventoryItems.length,
      stockOutRisk: inventoryItems.length > 0 ? inventoryItems.map(item => ({
        productId: item.productId,
        productName: products.find(p => p.id === item.productId)?.name || 'Unknown Product',
        quantity: item.quantity,
        branchId: item.branchId,
        branchName: branches.find(b => b.id === item.branchId)?.name || 'Unknown Branch'
      })) : [],
      timespan,
    };

    // Analysis prompt for Claude
    const prompt = `
      I need you to analyze business inventory data and provide insights and recommendations.
      
      Data Summary:
      - Timespan: ${timespan}
      - Total Products: ${dataSummary.totalProducts}
      - Low Stock Items: ${dataSummary.lowStockItems}
      - Stock Out Risk Items: ${JSON.stringify(dataSummary.stockOutRisk)}
      
      Based on this data, please identify 3-5 key business insights and 2-3 actionable recommendations.
      
      For each insight, include:
      - A brief title
      - A detailed description with supporting data
      - The type (positive, negative, neutral, or opportunity)
      - Any key metrics or data points
      
      For each recommendation, include:
      - A brief title
      - A detailed description
      - Priority level (low, medium, or high)
      - Potential business impact
      - Implementation guidance
      
      Also provide a brief summary of the overall inventory health.
      
      Format your response as a JSON object with the following structure:
      {
        "insights": [
          {
            "title": "string",
            "description": "string",
            "type": "positive|negative|neutral|opportunity",
            "metrics": [
              {
                "name": "string",
                "value": "string or number",
                "change": "string or number (optional)",
                "trend": "up|down|stable (optional)"
              }
            ],
            "tags": ["tag1", "tag2"]
          }
        ],
        "recommendations": [
          {
            "title": "string",
            "description": "string",
            "priority": "low|medium|high",
            "potentialImpact": "string",
            "implementation": "string",
            "tags": ["tag1", "tag2"]
          }
        ],
        "summary": "string",
        "analysisDate": "ISO string of current date"
      }
    `;

    // Make request to Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 3000,
      temperature: 0.2,
      system: "You are a business analytics AI specializing in inventory management analysis. You provide clear, actionable insights and recommendations based on business data. Always format your response as valid JSON exactly matching the specified structure.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extract and parse JSON from Claude's response
    const content = response.content[0].text;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsedResponse = JSON.parse(jsonStr) as BusinessInsightsResponse;
      return parsedResponse;
    } else {
      throw new Error('Failed to extract JSON from Claude response');
    }
  } catch (error) {
    console.error('Error generating inventory insights:', error);
    // Return fallback response if Claude fails
    return {
      insights: [
        {
          title: 'Error Generating Insights',
          description: 'There was an error processing your data. Please try again later.',
          type: 'neutral'
        }
      ],
      recommendations: [],
      summary: 'Unable to analyze data at this time.',
      analysisDate: new Date().toISOString()
    };
  }
}

// Function to generate overall business insights
export async function generateOverallInsights(
  timespan: BusinessInsightRequest['timespan']
): Promise<BusinessInsightsResponse> {
  try {
    // Get relevant data for analysis
    const products = await storage.listProducts();
    const orders = await storage.listRecentOrders(getOrderCountForTimespan(timespan));
    const customers = await storage.listCustomers();
    const lowStockItems = await storage.listLowStockItems(5);
    const suppliers = await storage.listSuppliers();
    const branches = await storage.listBranches();
    
    // Prepare data summary for Claude
    const dataSummary = {
      timespan,
      // Sales data
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length 
        : 0,
      // Customer data
      totalCustomers: customers.length,
      // Inventory data
      totalProducts: products.length,
      lowStockItems: lowStockItems.length,
      // Business structure
      totalSuppliers: suppliers.length,
      totalBranches: branches.length,
    };

    // Analysis prompt for Claude
    const prompt = `
      I need you to analyze overall business data and provide holistic insights and recommendations.
      
      Data Summary:
      - Timespan: ${timespan}
      - Total Orders: ${dataSummary.totalOrders}
      - Total Revenue: $${dataSummary.totalRevenue.toFixed(2)}
      - Average Order Value: $${dataSummary.averageOrderValue.toFixed(2)}
      - Total Customers: ${dataSummary.totalCustomers}
      - Total Products: ${dataSummary.totalProducts}
      - Low Stock Items: ${dataSummary.lowStockItems}
      - Total Suppliers: ${dataSummary.totalSuppliers}
      - Total Branches: ${dataSummary.totalBranches}
      
      Based on this data, please identify 3-5 key business insights and 2-3 actionable recommendations
      that take a holistic view of the business operations.
      
      For each insight, include:
      - A brief title
      - A detailed description with supporting data
      - The type (positive, negative, neutral, or opportunity)
      - Any key metrics or data points
      
      For each recommendation, include:
      - A brief title
      - A detailed description
      - Priority level (low, medium, or high)
      - Potential business impact
      - Implementation guidance
      
      Also provide a brief summary of the overall business health.
      
      Format your response as a JSON object with the following structure:
      {
        "insights": [
          {
            "title": "string",
            "description": "string",
            "type": "positive|negative|neutral|opportunity",
            "metrics": [
              {
                "name": "string",
                "value": "string or number",
                "change": "string or number (optional)",
                "trend": "up|down|stable (optional)"
              }
            ],
            "tags": ["tag1", "tag2"]
          }
        ],
        "recommendations": [
          {
            "title": "string",
            "description": "string",
            "priority": "low|medium|high",
            "potentialImpact": "string",
            "implementation": "string",
            "tags": ["tag1", "tag2"]
          }
        ],
        "summary": "string",
        "analysisDate": "ISO string of current date"
      }
    `;

    // Make request to Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 3000,
      temperature: 0.2,
      system: "You are a business analytics AI specializing in holistic business analysis. You provide clear, actionable insights and recommendations based on business data across multiple departments. Always format your response as valid JSON exactly matching the specified structure.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extract and parse JSON from Claude's response
    const content = response.content[0].text;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsedResponse = JSON.parse(jsonStr) as BusinessInsightsResponse;
      return parsedResponse;
    } else {
      throw new Error('Failed to extract JSON from Claude response');
    }
  } catch (error) {
    console.error('Error generating overall insights:', error);
    // Return fallback response if Claude fails
    return {
      insights: [
        {
          title: 'Error Generating Insights',
          description: 'There was an error processing your data. Please try again later.',
          type: 'neutral'
        }
      ],
      recommendations: [],
      summary: 'Unable to analyze data at this time.',
      analysisDate: new Date().toISOString()
    };
  }
}

// Function to generate insights from customer data
export async function generateCustomerInsights(
  timespan: BusinessInsightRequest['timespan']
): Promise<BusinessInsightsResponse> {
  try {
    // Get relevant data for analysis
    const customers = await storage.listCustomers();
    const orders = await storage.listRecentOrders(getOrderCountForTimespan(timespan));
    
    // Calculate customer metrics
    const customerOrderCounts: Record<number, number> = {};
    const customerSpend: Record<number, number> = {};
    
    orders.forEach(order => {
      if (order.customerId) {
        customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
        customerSpend[order.customerId] = (customerSpend[order.customerId] || 0) + (order.totalAmount || 0);
      }
    });
    
    const customerWithOrders = Object.keys(customerOrderCounts).length;
    const totalCustomers = customers.length;
    const customerEngagementRate = totalCustomers > 0 ? (customerWithOrders / totalCustomers) * 100 : 0;
    
    // Find top customers
    const topCustomers = Object.entries(customerSpend)
      .map(([customerId, totalSpent]) => {
        const customer = customers.find(c => c.id === parseInt(customerId));
        return {
          customerId: parseInt(customerId),
          customerName: customer ? customer.name : 'Unknown Customer',
          totalSpent,
          orderCount: customerOrderCounts[parseInt(customerId)]
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    // Prepare data summary for Claude
    const dataSummary = {
      timespan,
      totalCustomers,
      activeCustomers: customerWithOrders,
      customerEngagementRate: `${customerEngagementRate.toFixed(2)}%`,
      topCustomers,
      averageCustomerSpend: customerWithOrders > 0 
        ? (Object.values(customerSpend).reduce((sum, val) => sum + val, 0) / customerWithOrders) 
        : 0
    };

    // Analysis prompt for Claude
    const prompt = `
      I need you to analyze business customer data and provide insights and recommendations.
      
      Data Summary:
      - Timespan: ${timespan}
      - Total Customers: ${dataSummary.totalCustomers}
      - Active Customers: ${dataSummary.activeCustomers}
      - Customer Engagement Rate: ${dataSummary.customerEngagementRate}
      - Average Customer Spend: $${dataSummary.averageCustomerSpend.toFixed(2)}
      - Top Customers: ${JSON.stringify(dataSummary.topCustomers)}
      
      Based on this data, please identify 3-5 key business insights and 2-3 actionable recommendations
      for improving customer relationships and engagement.
      
      For each insight, include:
      - A brief title
      - A detailed description with supporting data
      - The type (positive, negative, neutral, or opportunity)
      - Any key metrics or data points
      
      For each recommendation, include:
      - A brief title
      - A detailed description
      - Priority level (low, medium, or high)
      - Potential business impact
      - Implementation guidance
      
      Also provide a brief summary of the overall customer health.
      
      Format your response as a JSON object with the following structure:
      {
        "insights": [
          {
            "title": "string",
            "description": "string",
            "type": "positive|negative|neutral|opportunity",
            "metrics": [
              {
                "name": "string",
                "value": "string or number",
                "change": "string or number (optional)",
                "trend": "up|down|stable (optional)"
              }
            ],
            "tags": ["tag1", "tag2"]
          }
        ],
        "recommendations": [
          {
            "title": "string",
            "description": "string",
            "priority": "low|medium|high",
            "potentialImpact": "string",
            "implementation": "string",
            "tags": ["tag1", "tag2"]
          }
        ],
        "summary": "string",
        "analysisDate": "ISO string of current date"
      }
    `;

    // Make request to Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 3000,
      temperature: 0.2,
      system: "You are a business analytics AI specializing in customer relationship management. You provide clear, actionable insights and recommendations based on customer data. Always format your response as valid JSON exactly matching the specified structure.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extract and parse JSON from Claude's response
    const content = response.content[0].text;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsedResponse = JSON.parse(jsonStr) as BusinessInsightsResponse;
      return parsedResponse;
    } else {
      throw new Error('Failed to extract JSON from Claude response');
    }
  } catch (error) {
    console.error('Error generating customer insights:', error);
    // Return fallback response if Claude fails
    return {
      insights: [
        {
          title: 'Error Generating Insights',
          description: 'There was an error processing your data. Please try again later.',
          type: 'neutral'
        }
      ],
      recommendations: [],
      summary: 'Unable to analyze data at this time.',
      analysisDate: new Date().toISOString()
    };
  }
}

// Helper functions
function getOrderCountForTimespan(timespan: BusinessInsightRequest['timespan']): number {
  switch (timespan) {
    case 'day': return 30; // Last 30 orders for daily analysis
    case 'week': return 50; // Last 50 orders for weekly analysis
    case 'month': return 100; // Last 100 orders for monthly analysis
    case 'quarter': return 300; // Last 300 orders for quarterly analysis
    case 'year': return 500; // Last 500 orders for yearly analysis
    default: return 100;
  }
}

async function getTopSellingProducts(orders: any[]): Promise<any[]> {
  try {
    // Get all order items
    const orderItemsPromises = orders.map(order => storage.listOrderItemsByOrder(order.id));
    const orderItemsArrays = await Promise.all(orderItemsPromises);
    const allOrderItems = orderItemsArrays.flat();

    // Count product occurrences
    const productCounts: Record<number, number> = {};
    allOrderItems.forEach(item => {
      if (item.productId) {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + (item.quantity || 1);
      }
    });

    // Get product information and sort by count
    const products = await storage.listProducts();
    const topProducts = Object.entries(productCounts)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === parseInt(productId));
        return {
          productId: parseInt(productId),
          productName: product ? product.name : 'Unknown Product',
          quantity,
          revenue: product ? (parseInt(product.price) * quantity) : 0
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    return topProducts;
  } catch (error) {
    console.error('Error getting top selling products:', error);
    return [];
  }
}

function calculateCustomerRetentionRate(orders: any[], customers: any[]): number {
  // Simple approximation of retention rate
  // In a real system, this would be more sophisticated
  const customersWithMultipleOrders = new Set();
  const customerOrderCounts: Record<number, number> = {};
  
  orders.forEach(order => {
    if (order.customerId) {
      customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
      if (customerOrderCounts[order.customerId] > 1) {
        customersWithMultipleOrders.add(order.customerId);
      }
    }
  });
  
  const uniqueCustomers = new Set(orders.map(order => order.customerId).filter(Boolean)).size;
  return uniqueCustomers > 0 ? (customersWithMultipleOrders.size / uniqueCustomers) * 100 : 0;
}