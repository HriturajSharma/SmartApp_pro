import "dotenv/config";
import mongoose from "mongoose";

import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

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

const products = [
    {
        name: "4.5L Digital Air Fryer",
        brand: "HomePro",
        description: "Prepare crispy and delicious meals with less oil using this digital air fryer.",
        categoryName: "Cooking Appliances",
        price: 4999,
        mrp: 6499,
        images: [
            {
                url: "https://placehold.co/600x600?text=Digital+Air+Fryer",
                public_id: ""
            }
        ],
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
            { step: 4, instruction: "Allow cooking to finish before removing food." }
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
        images: [
            {
                url: "https://placehold.co/600x600?text=Electric+Kettle",
                public_id: ""
            }
        ],
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
            "Do not operate the kettle without water.",
            "Avoid immersing the kettle in water.",
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
        images: [
            {
                url: "https://placehold.co/600x600?text=Pop+Up+Toaster",
                public_id: ""
            }
        ],
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
            "Keep away from curtains and flammable materials.",
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
        images: [
            {
                url: "https://placehold.co/600x600?text=Infrared+Cooker",
                public_id: ""
            }
        ],
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
            "Use on a stable and heat-resistant surface.",
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
        images: [
            {
                url: "https://placehold.co/600x600?text=Electric+Rice+Cooker",
                public_id: ""
            }
        ],
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

const seedProducts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from server/.env");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");

        // Create categories if they do not exist
        const categoryMap = {};

        for (const categoryData of categories) {
            const category = await Category.findOneAndUpdate(
                { name: categoryData.name },
                { $set: categoryData },
                {
                    upsert: true,
                    runValidators: true
                }
            );

            categoryMap[categoryData.name] = category._id;
        }

        console.log("Categories ready.");

        // Insert or update products by name
        for (const productData of products) {
            const { categoryName, ...product } = productData;

            product.category = categoryMap[categoryName];

            await Product.findOneAndUpdate(
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

            console.log(`Seeded: ${product.name}`);
        }

        console.log("All dummy products added successfully.");

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
};

seedProducts();
