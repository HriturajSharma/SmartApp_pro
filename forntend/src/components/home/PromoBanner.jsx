
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const PromoBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await api.get("/banners");

                const activeBanners = (
                    response.data.banners || []
                ).filter(banner => banner.isActive);

                setBanners(activeBanners);
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading || banners.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
                {banners.map(banner => (
                    <div
                        key={banner._id}
                        className="group relative min-h-64 overflow-hidden rounded-2xl bg-slate-900"
                    >
                        <img
                            src={banner.image}
                            alt={banner.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                        <div className="relative flex min-h-64 max-w-lg flex-col items-start justify-center p-6 text-white sm:p-8">
                            <h2 className="text-2xl font-bold sm:text-3xl">
                                {banner.title}
                            </h2>

                            {banner.subtitle && (
                                <p className="mt-3 text-sm text-white/80 sm:text-base">
                                    {banner.subtitle}
                                </p>
                            )}

                            {banner.link && (
                                <Link
                                    to={banner.link}
                                    className="mt-6 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                                >
                                    Explore Now
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PromoBanner;
