'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';

const FloatingCartButton = () => {
    const pathname = usePathname();

    if (pathname.startsWith("/dashboard")) return null;
  const { getCartItemCount, getCartTotal, toggleCart } = useCart();
  const itemCount = getCartItemCount();
  const total = getCartTotal();

  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={toggleCart}
        className="fixed right-4 bottom-28 z-40 bg-red-600 text-white rounded-full shadow-2xl hover:shadow-red-400/40 transition-all duration-300 hover:scale-105 p-1 flex items-center justify-center w-10 h-10 md:hidden"
        aria-label="Open Cart"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-300 text-slate-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {itemCount}
            </span>
          )}
        </div>
      </button>

      <button
        onClick={toggleCart}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white rounded-l-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 pt-3 flex flex-col items-center gap-1 min-w-[70px]"
        aria-label="Open Cart"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {itemCount}
            </span>
          )}
        </div>
        <div className="text-[10px] font-semibold leading-tight text-center">
          <div>{itemCount} Items</div>
        </div>
        <div className="w-full bg-blue-700 text-yellow-300 text-sm text-center font-semibold leading-none py-1.5">
          ${total.toFixed(2)}
        </div>
      </button>
    </>
  );
};

export default FloatingCartButton;
