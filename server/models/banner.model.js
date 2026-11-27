
import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        subtitle: {
            type: String,
            default: ""
        },

        image: {
            url: {
                type: String,
                required: true
            },
            public_id: String
        },

        buttonText: {
            type: String,
            default: "Shop Now"
        },

        link: {
            type: String,
            default: "/products"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        startDate: {
            type: Date
        },

        endDate: {
            type: Date
        },

        displayOrder: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
