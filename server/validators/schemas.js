const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'provider']).default('customer'),
  
  // For provider registration
  businessName: z.string().optional(),
  businessCategory: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional()
}).refine(data => {
  if (data.role === 'provider') {
    return data.businessName && data.businessCategory;
  }
  return true;
}, {
  message: "Business name and category are required for providers",
  path: ["businessName"]
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().optional(),
  expectedDurationMinutes: z.number().min(1, 'Duration must be at least 1 minute'),
  price: z.number().min(0, 'Price must be positive'),
  active: z.boolean().optional()
});

const staffSchema = z.object({
  name: z.string().min(2, 'Staff name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  services: z.array(z.string()).optional(),
  active: z.boolean().optional()
});

const appointmentSchema = z.object({
  businessId: z.string().min(1, 'Business is required'),
  serviceId: z.string().min(1, 'Service is required'),
  staffId: z.string().optional(),
  date: z.string(), // ISO date string
  scheduledStart: z.string(), // ISO date string
});

module.exports = {
  registerSchema,
  loginSchema,
  serviceSchema,
  staffSchema,
  appointmentSchema
};
