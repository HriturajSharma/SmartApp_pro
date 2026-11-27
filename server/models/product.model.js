
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        brand: {
            type: String,
            required: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        mrp: {
            type: Number,
            required: true,
            min: 0
        },

        images: [{
            url: String,
            public_id: String
        }],

        specifications: {
            power: {
                type: Number,
                required: true
            },

            capacity: {
                type: Number,
                required: true
            },

            capacityUnit: {
                type: String,
                enum: ["L", "kg", "ml", "cups"],
                required: true
            },

            safetyFeatures: [{
                type: String
            }],

            certifications: [{
                type: String
            }]
        },

        safetyPrecautions: [{
            type: String
        }],

        usageInstructions: [{
            step: Number,
            instruction: String
        }],

        warrantyMonths: {
            type: Number,
            required: true,
            min: 0
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
