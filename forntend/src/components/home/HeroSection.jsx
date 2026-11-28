import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
// import heroimage from "../../assets/heroimage.png";

const perks = [
	{ icon: Truck, label: "Free delivery" },
	{ icon: ShieldCheck, label: "Warranty included" },
	{ icon: Zap, label: "Energy efficient" },
];

const HeroSection = () => (
	// bg-ink
	<section className="relative h-[680px] w-full overflow-hidden bg-gray-200 text-white bg-[url('./assets/heroimage.png')] bg-[position:62%_center] bg-cover bg-no-repeat sm:h-[720px] md:h-screen md:bg-center">
		{/* <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" /> */}
		<div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

		<div className="relative mx-auto flex h-full max-w-7xl items-center px-5 py-12 sm:px-6 md:grid md:grid-cols-2 md:gap-16 md:py-24">
			<div>
				<span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-400">
					<span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_10px_currentColor]" />
					Smart living starts here
				</span>
				<h1 className="mt-5 max-w-2xl text-[2.15rem] font-extrabold leading-[1.08] tracking-tight text-[#7c2d12] sm:text-5xl md:text-6xl">
					Upgrade your kitchen with{" "}
					<span className="bg-gradient-to-r from-brand-400 to-amber-300 bg-clip-text text-transparent">
						smarter appliances
					</span>
				</h1>
				<p className="mt-5 max-w-md text-sm leading-7 text-slate-700 sm:text-base sm:leading-8 md:text-md">
					Modern kitchen appliances designed to make everyday cooking easier,
					faster and smarter.
				</p>

				<div className="mt-7 flex flex-col gap-3 min-[390px]:flex-row">
					<Link
						to="/products"
						className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 hover:bg-brand-600"
					>
						Shop now <ArrowRight size={18} />
					</Link>
					<Link
						to="/track-order"
						className="inline-flex bg-gray-800 items-center rounded-full border border-white/50 px-7 py-2.5 font-semibold hover:border-white/40 hover:bg-white/20 hover:text-gray-400 transition-colors duration-200"
					>
						Track order
					</Link>
				</div>

				<ul className="mt-14 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
					{perks.map(({ icon: Icon, label }) => (
						<li key={label} className="flex items-center gap-2">
							<Icon size={18} className="text-brand-400" /> {label}
						</li>
					))}
				</ul>
			</div>

			<div className="relative hidden md:block">
				<div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/30 to-indigo-500/20 blur-2xl" />
				{/* <img
        src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=85"
          alt="Smart kitchen appliances"
        className="relative aspect-[4/3] w-full rounded-[1.75rem] border border-white/10 object-cover shadow-2xl"
        /> */}
				<div className="absolute -bottom-5 left-4 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 shadow-xl backdrop-blur sm:left-8">
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						Made for everyday
					</p>
					<p className="mt-1 text-sm font-semibold text-white">
						A smarter kind of home
					</p>
				</div>
			</div>
		</div>
	</section>
);

export default HeroSection;
