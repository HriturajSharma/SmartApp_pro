import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/heroimage.png";

const perks = [
	{ icon: Truck, label: "Free delivery" },
	{ icon: ShieldCheck, label: "Warranty included" },
	{ icon: Zap, label: "Energy efficient" },
];

const HeroSection = () => (
	<section
		className="relative min-h-[680px] w-full overflow-hidden bg-[#f8f0e5] text-white sm:min-h-[720px] md:h-[min(100svh,900px)] md:min-h-[720px]"
	>
		<img
			src={heroImage}
			alt=""
			aria-hidden="true"
			className="absolute inset-0 h-full w-full object-cover object-[72%_center] md:object-center"
		/>
		<div className="absolute inset-0 bg-gradient-to-b from-[#fff8ee]/55 via-[#fff8ee]/10 to-slate-950/25 md:bg-gradient-to-r md:from-white/35 md:via-white/5 md:to-transparent" />

		<div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-start px-5 py-9 sm:px-6 sm:py-12 md:grid md:h-full md:grid-cols-2 md:items-center md:gap-16 md:py-24">
			<div className="max-w-xl">
				<span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-600 backdrop-blur-sm sm:px-4 sm:py-2 sm:text-xs">
					<span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_10px_currentColor]" />
					Smart living starts here
				</span>
				<h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#7c2d12] drop-shadow-[0_0_12px_rgba(124,45,18,0.45)] sm:mt-5 sm:text-5xl md:text-6xl">
					Upgrade your kitchen with{" "}
					<span className="bg-gradient-to-r from-brand-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">
						smarter appliances
					</span>
				</h1>
				<p className="mt-4 max-w-md text-sm leading-6 text-slate-800 drop-shadow-[0_0_9px_rgba(15,23,42,0.4)] sm:mt-5 sm:text-base sm:leading-8">
					Modern kitchen appliances designed to make everyday cooking easier,
					faster and smarter.
				</p>

				<div className="mt-6 flex w-full flex-col gap-3 sm:mt-7 sm:w-auto sm:flex-row">
					<Link
						to="/products"
						className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 hover:bg-brand-600 sm:w-auto sm:px-7"
					>
						Shop now <ArrowRight size={18} />
					</Link>
					<Link
						to="/track-order"
						className="inline-flex w-full items-center justify-center rounded-full border border-white/50 bg-gray-800/95 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:border-white/40 hover:bg-gray-700 sm:w-auto sm:px-7"
					>
						Track order
					</Link>
				</div>

				<ul className="hidden flex-wrap gap-x-5 gap-y-3 text-xs text-slate-700 sm:mt-12 sm:flex sm:gap-x-6 sm:text-sm md:text-white">
					{perks.map(({ icon: Icon, label }) => (
						<li key={label} className="flex items-center gap-2">
							<Icon size={18} className="text-brand-400" /> {label}
						</li>
					))}
				</ul>
			</div>

			<div className="relative hidden md:block">
				<div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/30 to-indigo-500/20 blur-2xl" />
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
