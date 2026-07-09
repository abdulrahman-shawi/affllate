"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";

const navItems = [
	{ label: "الرئيسية", href: "/" },
	{ label: "منتجاتنا", href: "/#products" },
	{ label: "الفئات", href: "/#categories" },
	{ label: "العروض", href: "/#offers" },
	{ label: "من نحن", href: "/من-نحن" },
];

export default function Header() {
	const router = useRouter();
	const { totalItems, setIsOpen } = useCart();
	const { siteName, logo } = useSettings();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = () => {
		const trimmed = searchQuery.trim();
		if (!trimmed) {
			return;
		}

		router.push(`/search?q=${encodeURIComponent(trimmed)}`);
		setSearchQuery("");
		setMobileMenuOpen(false);
	};

	const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
			<div className="max-w-7xl mx-auto px-4">
				<div className="h-20 flex items-center justify-between gap-4">
					<div className="flex items-center gap-2 lg:hidden">
						<button
							type="button"
							onClick={() => setMobileMenuOpen((current) => !current)}
							className="p-2 rounded-full hover:bg-gray-100 transition-colors"
							aria-label="فتح القائمة"
						>
							{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
						</button>
					</div>

					<Link href="/" className="flex items-center shrink-0">
						{logo ? (
							<Image
								src={logo}
								alt={siteName || "SKYNOVA"}
								width={140}
								height={48}
								className="h-12 w-auto object-contain"
							/>
						) : (
							<span className="text-3xl font-bold text-pink font-tajawal tracking-tight">
								{siteName || "SKYNOVA"}
							</span>
						)}
					</Link>

					<nav className="hidden lg:flex items-center gap-6">
						{navItems.map((item) => (
							<Link
								key={item.label}
								href={item.href}
								className="text-gray-dark hover:text-pink font-medium transition-colors font-tajawal"
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="hidden md:flex flex-1 max-w-md">
						<div className="relative w-full">
							<input
								type="text"
								placeholder="ابحثي عن منتج..."
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								onKeyDown={handleSearchKeyDown}
								className="w-full h-11 pr-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
							/>
							<button
								type="button"
								onClick={handleSearch}
								className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-pink text-white p-2 rounded-full hover:bg-pink-dark transition-colors"
								aria-label="بحث"
							>
								<Search size={16} />
							</button>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="relative p-2 hover:text-pink transition-colors"
						aria-label="فتح السلة"
					>
						<ShoppingCart size={22} />
						{totalItems > 0 && (
							<span className="absolute -top-0.5 -right-0.5 bg-pink-dark text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
								{totalItems}
							</span>
						)}
					</button>
				</div>

				{mobileMenuOpen && (
					<div className="lg:hidden border-t border-gray-100 py-4 space-y-4">
						<div className="relative">
							<input
								type="text"
								placeholder="ابحثي عن منتج..."
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								onKeyDown={handleSearchKeyDown}
								className="w-full h-11 pr-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
							/>
							<button
								type="button"
								onClick={handleSearch}
								className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-pink text-white p-2 rounded-full"
								aria-label="بحث"
							>
								<Search size={16} />
							</button>
						</div>

						<nav className="flex flex-col">
							{navItems.map((item) => (
								<Link
									key={item.label}
									href={item.href}
									onClick={() => setMobileMenuOpen(false)}
									className="py-3 px-2 text-right hover:bg-pink-50 hover:text-pink rounded-xl transition-colors font-tajawal font-medium"
								>
									{item.label}
								</Link>
							))}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
