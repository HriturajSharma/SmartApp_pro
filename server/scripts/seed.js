import dotenv from "dotenv";
import mongoose from "mongoose";

import Banner from "../models/banner.model.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

dotenv.config();

// ========================================
// USERS
// ========================================

const users = [
    {
        name: "Admin",
        email: "admin@example.com",
        password: "Admin@123",
        role: "admin"
    },
    {
        name: "User1",
        email: "john@example.com",
        password: "User@123",
        role: "user"
    },
    {
        name: "User2",
        email: "jane@example.com",
        password: "User@456",
        role: "user"
    }
];

// ========================================
// CATEGORIES
// ========================================

const categories = [
    {
        name: "Cooking Appliances",
        slug: "cooking-appliances",
        description: "Smart appliances for everyday cooking."
    },
    {
        name: "Breakfast Essentials",
        slug: "breakfast-essentials",
        description: "Appliances for quick and easy breakfasts."
    },
    {
        name: "Heating & Comfort",
        slug: "heating-and-comfort",
        description: "Appliances for heating and home comfort."
    },
    {
        name: "Kitchen Accessories",
        slug: "kitchen-accessories",
        description: "Useful accessories for your kitchen."
    }
];

// ========================================
// PRODUCTS
// ========================================

const products = [
    {
        name: "4.5L Digital Air Fryer",
        brand: "HomePro",
        description: "Prepare crispy and delicious meals with less oil using this digital air fryer.",
        categoryName: "Cooking Appliances",
        price: 4999,
        mrp: 6499,
        images: [{
            url: "https://i.pinimg.com/1200x/05/fa/30/05fa30bc52668558013df79d8e4acd65.jpg",
            public_id: ""
        }],
        specifications: {
            power: 1500,
            capacity: 4.5,
            capacityUnit: "L",
            safetyFeatures: [
                "Auto shut-off",
                "Overheat protection",
                "Cool touch handle"
            ],
            certifications: ["ISI"]
        },
        safetyPrecautions: [
            "Keep the appliance away from water.",
            "Do not block the air outlet.",
            "Allow the appliance to cool before cleaning."
        ],
        usageInstructions: [
            { step: 1, instruction: "Place the air fryer on a flat surface." },
            { step: 2, instruction: "Add food to the basket." },
            { step: 3, instruction: "Select temperature and cooking time." },
            { step: 4, instruction: "Wait for cooking to finish." }
        ],
        warrantyMonths: 12,
        stock: 25,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Stainless Steel Electric Kettle",
        brand: "KitchenMate",
        description: "A durable electric kettle for quickly boiling water at home or in the office.",
        categoryName: "Breakfast Essentials",
        price: 1299,
        mrp: 1799,
        images: [{
            url: "https://i.pinimg.com/1200x/09/e8/e1/09e8e154d86c75fc8314e62db07db18e.jpg",
            public_id: ""
        }],
        specifications: {
            power: 1500,
            capacity: 1.8,
            capacityUnit: "L",
            safetyFeatures: [
                "Auto shut-off",
                "Boil dry protection",
                "Cool touch handle"
            ],
            certifications: ["ISI"]
        },
        safetyPrecautions: [
            "Do not operate without water.",
            "Do not immerse the kettle in water.",
            "Keep the lid closed while boiling."
        ],
        usageInstructions: [
            { step: 1, instruction: "Fill the kettle with water." },
            { step: 2, instruction: "Connect it to the power supply." },
            { step: 3, instruction: "Switch it on." },
            { step: 4, instruction: "Wait for automatic shut-off." }
        ],
        warrantyMonths: 12,
        stock: 40,
        isFeatured: true,
        isActive: true
    },
    {
        name: "2-Slice Pop-Up Toaster",
        brand: "Toastify",
        description: "Enjoy perfectly toasted bread with adjustable browning settings.",
        categoryName: "Breakfast Essentials",
        price: 1599,
        mrp: 2199,
        images: [{
            url: "https://i.pinimg.com/736x/0a/7a/62/0a7a62c2eac2ac20de118aa7b39a9a35.jpg",
            public_id: ""
        }],
        specifications: {
            power: 800,
            capacity: 2,
            capacityUnit: "cups",
            safetyFeatures: [
                "Auto pop-up",
                "Overheat protection",
                "Cancel function"
            ],
            certifications: ["ISI"]
        },
        safetyPrecautions: [
            "Never insert metal objects into the toaster.",
            "Keep away from flammable materials.",
            "Unplug before cleaning."
        ],
        usageInstructions: [
            { step: 1, instruction: "Insert bread slices." },
            { step: 2, instruction: "Choose the browning level." },
            { step: 3, instruction: "Press the lever down." },
            { step: 4, instruction: "Remove toast after it pops up." }
        ],
        warrantyMonths: 12,
        stock: 30,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Infrared Cooker",
        brand: "CookSmart",
        description: "A compact infrared cooker suitable for everyday cooking.",
        categoryName: "Cooking Appliances",
        price: 2999,
        mrp: 3999,
        images: [{
            url: "https://i.pinimg.com/736x/a7/9b/3b/a79b3bcd71d732ff0e7138011cb1b703.jpg",
            public_id: ""
        }],
        specifications: {
            power: 2000,
            capacity: 1,
            capacityUnit: "L",
            safetyFeatures: [
                "Overheat protection",
                "Temperature control",
                "Auto shut-off"
            ],
            certifications: ["ISI"]
        },
        safetyPrecautions: [
            "Use on a stable heat-resistant surface.",
            "Do not touch the heating surface while hot.",
            "Keep the power cord away from heat."
        ],
        usageInstructions: [
            { step: 1, instruction: "Place suitable cookware on the cooker." },
            { step: 2, instruction: "Connect the cooker to power." },
            { step: 3, instruction: "Select the required temperature." },
            { step: 4, instruction: "Switch off after cooking." }
        ],
        warrantyMonths: 12,
        stock: 15,
        isFeatured: true,
        isActive: true
    },
    {
        name: "Electric Rice Cooker",
        brand: "HomePro",
        description: "Cook rice conveniently with an automatic keep-warm function.",
        categoryName: "Kitchen Accessories",
        price: 1899,
        mrp: 2499,
        images: [{
            url: "https://i.pinimg.com/1200x/c9/3a/83/c93a83332bf32e5ea7fa7650f6f7b316.jpg",
            public_id: ""
        }],
        specifications: {
            power: 700,
            capacity: 1.8,
            capacityUnit: "L",
            safetyFeatures: [
                "Auto keep warm",
                "Overheat protection",
                "Thermal fuse"
            ],
            certifications: ["ISI"]
        },
        safetyPrecautions: [
            "Do not immerse the cooker body in water.",
            "Use the supplied inner cooking pot.",
            "Unplug before cleaning."
        ],
        usageInstructions: [
            { step: 1, instruction: "Measure and wash the rice." },
            { step: 2, instruction: "Add rice and water to the inner pot." },
            { step: 3, instruction: "Place the pot inside the cooker." },
            { step: 4, instruction: "Switch on and wait for cooking to finish." }
        ],
        warrantyMonths: 12,
        stock: 20,
        isFeatured: true,
        isActive: true
    }
];

// ========================================
// BANNERS
// ========================================

const banners = [
    {
        title: "Upgrade Your Kitchen",
        subtitle: "Discover smart appliances for everyday cooking.",
        image: {
            url: "https://placehold.co/1200x500?text=Upgrade+Your+Kitchen",
            public_id: ""
        },
        buttonText: "Shop Now",
        link: "/products",
        isActive: true,
        displayOrder: 1
    },
    {
        title: "Smart Cooking Made Easy",
        subtitle: "Explore our collection of modern kitchen appliances.",
        image: {
            url: "https://placehold.co/1200x500?text=Smart+Cooking",
            public_id: ""
        },
        buttonText: "Explore Products",
        link: "/products",
        isActive: true,
        displayOrder: 2
    }
];

// ========================================
// SEED USERS
// ========================================

const seedUsers = async () => {
    const userMap = {};

    for (const userData of users) {
        let user = await User.findOne({
            email: userData.email
        });

        if (!user) {
            // User model hashes password automatically
            user = await User.create(userData);
            console.log(`User created: ${user.email}`);
        } else {
            user.password = userData.password;
            await user.save();
            console.log(`User password updated: ${user.email}`);
        }

        userMap[user.email] = user._id;
    }

    return userMap;
};

// ========================================
// SEED CATEGORIES
// ========================================

const seedCategories = async () => {
    const categoryMap = {};

    for (const categoryData of categories) {
        const category = await Category.findOneAndUpdate(
            { name: categoryData.name },
            { $set: categoryData },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true
            }
        );

        categoryMap[categoryData.name] = category._id;
        console.log(`Category ready: ${category.name}`);
    }

    return categoryMap;
};

// ========================================
// SEED PRODUCTS
// ========================================

const seedProducts = async (categoryMap) => {
    const productMap = {};

    for (const productData of products) {
        const { categoryName, ...product } = productData;

        product.category = categoryMap[categoryName];

        const savedProduct = await Product.findOneAndUpdate(
            {
                name: product.name,
                brand: product.brand
            },
            { $set: product },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true
            }
        );

        productMap[product.name] = savedProduct;

        console.log(`Product ready: ${savedProduct.name}`);
    }

    return productMap;
};

// ========================================
// SEED BANNERS
// ========================================

const seedBanners = async () => {
    for (const bannerData of banners) {
        const banner = await Banner.findOneAndUpdate(
            { title: bannerData.title },
            { $set: bannerData },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true
            }
        );

        console.log(`Banner ready: ${banner.title}`);
    }
};

// ========================================
// SEED ORDERS
// ========================================

const seedOrders = async (userMap, productMap) => {
    const johnId = userMap["john@example.com"];
    const janeId = userMap["jane@example.com"];

    const airFryer = productMap["4.5L Digital Air Fryer"];
    const kettle = productMap["Stainless Steel Electric Kettle"];
    const riceCooker = productMap["Electric Rice Cooker"];

    const orders = [
        {
            orderNumber: "DEMO-ORDER-1001",
            user: johnId,
            items: [
                {
                    product: airFryer._id,
                    name: airFryer.name,
                    image: airFryer.images[0]?.url || "",
                    quantity: 1,
                    price: airFryer.price,
                    warrantyMonths: airFryer.warrantyMonths
                },
                {
                    product: kettle._id,
                    name: kettle.name,
                    image: kettle.images[0]?.url || "",
                    quantity: 1,
                    price: kettle.price,
                    warrantyMonths: kettle.warrantyMonths
                }
            ],
            shippingAddress: {
                fullName: "John Doe",
                phone: "9876543210",
                email: "john@example.com",
                address: "101 Demo Street",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001"
            },
            subtotal: airFryer.price + kettle.price,
            shippingCharge: 0,
            totalAmount: airFryer.price + kettle.price,
            paymentMethod: "razorpay",
            paymentStatus: "paid",
            paymentId: "DEMO-PAYMENT-1001",
            orderStatus: "paid"
        },
        {
            orderNumber: "DEMO-ORDER-1002",
            user: janeId,
            items: [
                {
                    product: riceCooker._id,
                    name: riceCooker.name,
                    image: riceCooker.images[0]?.url || "",
                    quantity: 1,
                    price: riceCooker.price,
                    warrantyMonths: riceCooker.warrantyMonths
                }
            ],
            shippingAddress: {
                fullName: "Jane Smith",
                phone: "9876543211",
                email: "jane@example.com",
                address: "202 Sample Avenue",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400002"
            },
            subtotal: riceCooker.price,
            shippingCharge: 0,
            totalAmount: riceCooker.price,
            paymentMethod: "razorpay",
            paymentStatus: "paid",
            paymentId: "DEMO-PAYMENT-1002",
            orderStatus: "delivered",
            deliveredAt: new Date("2026-11-20T12:00:00.000Z")
        }
    ];

    for (const orderData of orders) {
        const order = await Order.findOneAndUpdate(
            { orderNumber: orderData.orderNumber },
            { $set: orderData },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true
            }
        );

        console.log(`Order ready: ${order.orderNumber}`);
    }
};

// ========================================
// MAIN SEED FUNCTION
// ========================================

const seedDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        const userMap = await seedUsers();

        const categoryMap = await seedCategories();

        const productMap = await seedProducts(categoryMap);

        await seedBanners();

        await seedOrders(userMap, productMap);

        console.log("\n================================");
        console.log("DATABASE SEEDING COMPLETED");
        console.log("================================");
        console.log("Users: 3");
        console.log("Categories: 4");
        console.log("Products: 5");
        console.log("Banners: 2");
        console.log("Orders: 2");

    } catch (error) {
        console.error("Seeding error:", error);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected");
    }
};

seedDatabase();
