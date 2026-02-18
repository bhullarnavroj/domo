import { storage } from "./storage";
import { db } from "./db";
import { profiles, serviceRequests, users } from "@shared/schema";

async function seed() {
  // Check if we already have profiles
  const existingProfiles = await db.select().from(profiles).limit(1);
  if (existingProfiles.length > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database...");

  // Create a homeowner user (simulated)
  // In a real scenario, we'd need to create the auth user first. 
  // Since we use Replit Auth, we can't easily create auth users programmatically without their login.
  // However, we can create profiles for existing users if we knew their IDs.
  // For now, let's create a "demo" service request that is unassigned, or skip seeding if no users exist.
  
  // Actually, we can't seed much without users.
  // But we can create some "open" service requests if we had a user.
  // Let's create a dummy user in the auth table just for demonstration if it's allowed.
  
  // Insert a dummy homeowner
  const [homeowner] = await db.insert(users).values({
    email: "homeowner@example.com",
    firstName: "Alice",
    lastName: "Smith",
  }).returning();

  await storage.createProfile({
    userId: homeowner.id,
    role: "homeowner",
    address: "123 Main St, Springfield",
    phoneNumber: "555-0101"
  });

  // Insert a dummy contractor
  const [contractor] = await db.insert(users).values({
    email: "contractor@example.com",
    firstName: "Bob",
    lastName: "Builder",
  }).returning();

  await storage.createProfile({
    userId: contractor.id,
    role: "contractor",
    businessName: "Bob's Building Services",
    description: "General contractor with 10 years of experience.",
    skills: ["General Repair", "Carpentry", "Plumbing"],
    isVerified: true,
    phoneNumber: "555-0102"
  });

  // Create a service request
  await storage.createServiceRequest({
    homeownerId: homeowner.id,
    title: "Fix Leaky Faucet",
    description: "The kitchen faucet is dripping constantly. Need someone to fix it ASAP.",
    category: "Plumbing",
    location: "Kitchen",
    status: "open",
    photos: []
  });

  await storage.createServiceRequest({
    homeownerId: homeowner.id,
    title: "Install Ceiling Fan",
    description: "Need to replace an old light fixture with a new ceiling fan in the master bedroom.",
    category: "Electrical",
    location: "Master Bedroom",
    status: "open",
    photos: []
  });

  console.log("Database seeded successfully");
}

seed().catch(console.error);
