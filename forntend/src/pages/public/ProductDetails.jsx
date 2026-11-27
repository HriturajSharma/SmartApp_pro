
import {
  ArrowLeft,
  Award,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { addToCart } from "../../services/cart.service";
import { getProductById } from "../../services/product.service";


const ProductDetails = () => {

    const navigate = useNavigate();

const [adding, setAdding] = useState(false);
const [message, setMessage] = useState("");
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProductById(id);

        setProduct(response.product);
        setSelectedImage(0);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {error || "Product not found"}
        </h2>

        <Link
          to="/products"
          className="mt-5 inline-block text-orange-600 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const specifications = product.specifications || {};

  const hasAutoShutOff = specifications.safetyFeatures?.some(
    (feature) => /auto shut.?off/i.test(feature)
  );

  const handleAddToCart = async () => {
    try {
        setAdding(true);
        setMessage("");

        await addToCart(product._id, 1);

        setMessage("Product added to cart successfully!");
    } catch (error) {
        if (error.response?.status === 401) {
            navigate("/login");
            return;
        }

        setMessage(
            error.response?.data?.message || "Unable to add product to cart."
        );
    } finally {
        setAdding(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* Breadcrumb */}
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        {/* Product Information */}
        <div className="grid grid-cols-1 gap-10 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">

          {/* Product Images */}
          <div>
            <div className="overflow-hidden rounded-xl bg-gray-100">
              <img
                src={
                  images[selectedImage]?.url ||
                  "https://placehold.co/600x500?text=Appliance"
                }
                alt={product.name}
                className="h-80 w-full object-contain md:h-[450px]"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.public_id || index}
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? "border-orange-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="h-20 w-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              {product.category?.name || "Appliance"}
            </p>

            <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Brand: {product.brand}
            </p>

            <p className="mt-5 leading-7 text-gray-600">
              {product.description}
            </p>

            {/* Price */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>

              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>

                  <span className="rounded-md bg-green-100 px-2 py-1 text-sm font-semibold text-green-700">
                    {Math.round(
                      ((product.mrp - product.price) / product.mrp) * 100
                    )}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <p className={`mt-4 text-sm font-semibold ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}>
              {product.stock > 0
                ? `In Stock (${product.stock} available)`
                : "Out of Stock"}
            </p>

            {/* Product Features */}
            <div className="mt-7 grid grid-cols-2 gap-4 border-y py-6">
              <div>
                <p className="text-sm text-gray-500">Power</p>
                <p className="mt-1 font-bold">
                  {specifications.power} W
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="mt-1 font-bold">
                  {specifications.capacity} {specifications.capacityUnit}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Warranty</p>
                <p className="mt-1 font-bold">
                  {product.warrantyMonths} Months
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Auto Shut-Off</p>
                <p className="mt-1 font-bold">
                  {hasAutoShutOff ? "Yes" : "Not specified"}
                </p>
              </div>
            </div>

            {/* Add to Cart */}
           <button
    onClick={handleAddToCart}
    disabled={adding || product.stock <= 0}
    className="rounded-lg bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
>
    {adding ? "Adding..." : "Add to Cart"}
</button>

{message && (
    <p className="mt-3 text-sm" role="status">
        {message}
    </p>
)}

            {/* Service Highlights */}
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-600" />
                <span className="text-sm text-gray-600">
                  Product Safety Information
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Truck className="text-orange-600" />
                <span className="text-sm text-gray-600">
                  Delivery Information
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Technical Specifications</h2>

          <div className="mt-5 divide-y">
            <div className="flex justify-between gap-4 py-4">
              <span className="text-gray-500">Brand</span>
              <span className="font-medium">{product.brand}</span>
            </div>

            <div className="flex justify-between gap-4 py-4">
              <span className="text-gray-500">Power</span>
              <span className="font-medium">{specifications.power} W</span>
            </div>

            <div className="flex justify-between gap-4 py-4">
              <span className="text-gray-500">Capacity</span>
              <span className="font-medium">
                {specifications.capacity} {specifications.capacityUnit}
              </span>
            </div>

            <div className="flex justify-between gap-4 py-4">
              <span className="text-gray-500">Warranty</span>
              <span className="font-medium">
                {product.warrantyMonths} Months
              </span>
            </div>
          </div>
        </section>

        {/* Safety Features */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-600" size={25} />
            <h2 className="text-2xl font-bold">Safety Features</h2>
          </div>

          {specifications.safetyFeatures?.length > 0 ? (
            <ul className="mt-5 list-inside list-disc space-y-3 text-gray-600">
              {specifications.safetyFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">
              No safety features listed.
            </p>
          )}

          <h3 className="mt-7 font-bold">Safety Certifications</h3>

          {specifications.certifications?.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {specifications.certifications.map((certification, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700"
                >
                  <Award size={16} />
                  {certification}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No certifications listed.
            </p>
          )}
        </section>

        {/* Safety Precautions */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Safety Precautions</h2>

          {product.safetyPrecautions?.length > 0 ? (
            <ul className="mt-5 list-inside list-disc space-y-3 text-gray-600">
              {product.safetyPrecautions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">
              No safety precautions listed.
            </p>
          )}
        </section>

        {/* Usage Instructions */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">How to Use</h2>

          {product.usageInstructions?.length > 0 ? (
            <div className="mt-6 space-y-5">
              {product.usageInstructions
                .slice()
                .sort((a, b) => a.step - b.step)
                .map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                      {item.step}
                    </span>

                    <p className="pt-2 text-gray-600">
                      {item.instruction}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              Usage instructions are not available.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
