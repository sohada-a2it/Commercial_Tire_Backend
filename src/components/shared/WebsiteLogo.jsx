"use client";

import React from "react";
import { Link } from "@/lib/navigation";

const WebsiteLogo = () => {
  return (
    <Link to="/">
              <div className="lg:col-span-2">
          <div className="flex items-center mb-6">

          <img
            src="/logo.png"
            alt="Asian Import and Export"
            className="h-16 mb-0"
          />
          <div className="ml-1 ">
              <p className="font-semibold text-lg text-black">ASIAN IMPORT & EXPORT Co. LTD</p>
              <p className="text-sm text-yellow-500 text-start">Manufacturer & Wholesaler</p>
            </div>
          </div>
        </div>
    </Link>
  );
};

export default WebsiteLogo;
