
import {
    BadgeCheck,
    Headset,
    ShieldCheck,
    Truck,
} from "lucide-react";

const supportItems = [
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Convenient delivery for your orders.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description: "A safer and more secure shopping experience.",
  },
  {
    icon: BadgeCheck,
    title: "Product Warranty",
    description: "Warranty information with every appliance.",
  },
  {
    icon: Headset,
    title: "Customer Support",
    description: "We're here to help when you need us.",
  },
];

const SupportSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {supportItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-3xl border border-slate-200/70 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon size={26} />
              </div>

              <h3 className="font-bold text-slate-900 mt-4">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                {item.description}
              </p>
            </div>
          );
        })}

      </div>
    </section>
  );
};

export default SupportSection;
