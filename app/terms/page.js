"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  FaFileContract, 
  FaDollarSign, 
  FaTruck, 
  FaTrademark, 
  FaShieldAlt, 
  FaHandshake, 
  FaGavel, 
  FaChartLine, 
  FaBalanceScale, 
  FaLock, 
  FaExchangeAlt, 
  FaExclamationTriangle, 
  FaClipboardList,
  FaBan,
  FaGlobe
} from "react-icons/fa";

const Highlight = ({ children }) => (
  <span className="relative inline-block">
    <span className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 rounded-md" />
    <span className="relative font-semibold text-amber-700 px-1">
      {children}
    </span>
  </span>
);

const TermsSection = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-500 rounded-lg flex items-center justify-center">
        <Icon className="text-white text-sm" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
      {children}
    </div>
  </motion.div>
);

const HighlightBox = ({ children, variant = "amber" }) => {
  const gradients = {
    amber: "from-amber-50 to-amber-100 border-amber-200",
    amber: "from-amber-50 to-amber-100 border-amber-200",
    red: "from-red-50 to-red-100 border-red-200",
  };
  return (
    <div className={`bg-gradient-to-r ${gradients[variant]} p-4 rounded-lg border-l-4 ${variant === 'amber' ? 'border-amber-500' : variant === 'amber' ? 'border-amber-500' : 'border-red-500'} my-3`}>
      {children}
    </div>
  );
};

export default function TermsConditions() {
  return (
    <div className="min-h-screen w-full bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4">
            <FaFileContract className="text-amber-500 text-xs" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Legal Agreement
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Terms <span className="text-amber-600">& Conditions</span>
          </h1>
          
          <div className="flex justify-center gap-1.5 mb-4">
            <div className="w-12 h-0.5 bg-amber-500 rounded-full"></div>
            <div className="w-6 h-0.5 bg-amber-500 rounded-full"></div>
          </div>
          
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            These Standard Terms and Conditions of Sale apply to all sales by China Manufacturers Alliance LLC ("CMA") 
            to Customer of Double Coin tires and related products in the U.S. and Canada.
          </p>
        </motion.div>

        {/* Overview / Products Section */}
        <TermsSection title="Products & Acceptance" icon={FaTruck} delay={0.05}>
          <p>
            These Terms override and replace any conflicting terms included in any order or other document unless 
            CMA has expressly accepted such terms in writing. Products are intended solely for resale by Customer 
            in the United States or Canada.
          </p>
          <HighlightBox variant="amber">
            <p className="font-semibold text-amber-800 text-sm">⚠ Important:</p>
            <p className="text-amber-700 text-sm">All orders are subject to acceptance by CMA. Customer agrees to pay for all goods delivered as ordered, even if Customer's representative is not present to acknowledge delivery.</p>
          </HighlightBox>
        </TermsSection>

        {/* Payment Section */}
        <TermsSection title="Payment Terms" icon={FaDollarSign} delay={0.1}>
          <p>
            Customer shall pay prices and associated charges applicable at the time an order is accepted. 
            Unless otherwise agreed in writing, <Highlight>payment in full is due upon delivery</Highlight>.
          </p>
          <p>
            For credit customers, payments are due Net 30 days from invoice date. No discounts for early payment. 
            Any invoiced amounts not paid when due will be subject to a finance charge of 1.5% per month (18% per annum).
          </p>
          <p>
            Customer represents that credit accounts shall be used only for commercial purposes, not for personal, 
            family, or household purposes.
          </p>
        </TermsSection>

        {/* Title & Security Interest */}
        <TermsSection title="Title & Security Interest" icon={FaGavel} delay={0.15}>
          <p>
            Title to Products passes to Customer upon delivery. However, until CMA has received <Highlight>payment in full</Highlight>, 
            CMA retains a purchase money security interest in the Products under the California Uniform Commercial Code.
          </p>
          <p>
            Customer agrees to keep Products separate from other products, properly stored, protected, insured, and identified 
            until full payment is received by CMA.
          </p>
        </TermsSection>

        {/* Trademarks & Copyrights */}
        <TermsSection title="Trademarks & Copyrights" icon={FaTrademark} delay={0.2}>
          <p>
            CMA grants Customer a limited, non-exclusive license to use CMA Trademarks and Copyrights to market, promote, 
            distribute, and sell Double Coin tires.
          </p>
          <HighlightBox variant="amber">
            <p className="font-semibold text-amber-800 text-sm">✓ Permitted Use:</p>
            <p className="text-amber-700 text-sm">Resale to regional and local tire dealers and end-users only.</p>
          </HighlightBox>
          <p>
            Customer <Highlight>may not</Highlight> sell through unauthorized third-party websites, e-commerce sites, or internet sales channels 
            without prior written approval from CMA.
          </p>
        </TermsSection>

        {/* Product Warranty */}
        <TermsSection title="Product Warranty & Limitations" icon={FaShieldAlt} delay={0.25}>
          <p>
            All Products are subject to applicable standard manufacturer's warranties or CMA's written warranty then in effect.
          </p>
          <HighlightBox variant="red">
            <p className="font-semibold text-red-800 text-sm">⚠ Disclaimer:</p>
            <p className="text-red-700 text-sm">CMA expressly disclaims all implied warranties, including merchantability and fitness for a particular purpose. CMA is not liable for incidental, special, or consequential damages including lost profits.</p>
          </HighlightBox>
          <p>
            If Customer sells Products through <Highlight>unauthorized sales channels</Highlight> (including third-party websites or e-commerce), 
            such sale shall void applicable warranties.
          </p>
        </TermsSection>

        {/* Customer Representations */}
        <TermsSection title="Customer Representations" icon={FaHandshake} delay={0.3}>
          <p>
            By ordering Products, Customer represents and warrants that:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Customer is authorized to do business in its state of incorporation</li>
            <li>Products are for resale in the U.S. or Canada <Highlight>only</Highlight></li>
            <li>Customer will <Highlight>not</Highlight> sell to national dealers, chains, or third-party internet sellers</li>
            <li>Customer will comply with all applicable federal, state, and municipal laws</li>
          </ul>
        </TermsSection>

        {/* Indemnification */}
        <TermsSection title="Indemnification" icon={FaBalanceScale} delay={0.35}>
          <p>
            Customer agrees to indemnify CMA against all losses, damages, costs, expenses, collection charges, and attorney's fees incurred by CMA:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>In endeavoring to collect any amount payable hereunder</li>
            <li>In connection with returned checks (NSF)</li>
            <li>As a result of Customer's breach of representations and warranties</li>
            <li>As a result of negligent or willful actions of Customer</li>
          </ul>
        </TermsSection>

        {/* Force Majeure */}
        <TermsSection title="Force Majeure" icon={FaExclamationTriangle} delay={0.4}>
          <p>
            CMA shall not be liable for any delay, damage, or non-performance resulting from causes beyond CMA's reasonable control, including:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            <span className="bg-gray-100 px-2 py-1 rounded">• Natural disasters</span>
            <span className="bg-gray-100 px-2 py-1 rounded">• Labor disputes</span>
            <span className="bg-gray-100 px-2 py-1 rounded">• Supply chain interruptions</span>
            <span className="bg-gray-100 px-2 py-1 rounded">• Government regulations</span>
            <span className="bg-gray-100 px-2 py-1 rounded">• War or civil commotion</span>
            <span className="bg-gray-100 px-2 py-1 rounded">• Equipment failures</span>
          </div>
        </TermsSection>

        {/* Term & Termination */}
        <TermsSection title="Term & Termination" icon={FaClipboardList} delay={0.45}>
          <p>
            These Terms become binding when Customer places its next order and remain in effect until modified or 
            terminated by CMA in writing.
          </p>
          <HighlightBox variant="amber">
            <p className="font-semibold text-amber-800 text-sm">⚠ Termination Rights:</p>
            <p className="text-amber-700 text-sm">If Customer fails to make any payment when due, CMA may declare all indebtedness immediately due and payable and terminate these Terms.</p>
          </HighlightBox>
        </TermsSection>

        {/* Confidentiality & Trade Secrets */}
        <TermsSection title="Confidentiality" icon={FaLock} delay={0.5}>
          <p>
            Customer will maintain the confidentiality of all Trade Secrets relating to CMA's Products and business, 
            including marketing and operating methods.
          </p>
          <p>
            Customer agrees that a breach of this provision causes <Highlight>irreparable harm</Highlight> to CMA, 
            and CMA is entitled to seek injunctive relief.
          </p>
        </TermsSection>

        {/* Assignment, Waiver, Severability */}
        <TermsSection title="Assignment & General Provisions" icon={FaExchangeAlt} delay={0.55}>
          <p>
            Customer may not assign any rights or obligations without prior written consent of CMA. 
            Failure to enforce any provision is not a waiver. If any provision is deemed invalid, 
            it shall be modified or severed, and the remainder remains in full force.
          </p>
        </TermsSection>

        {/* Governing Law & Jurisdiction */}
        <TermsSection title="Governing Law" icon={FaGlobe} delay={0.6}>
          <p>
            The laws of the <Highlight>State of California, U.S.A.</Highlight> govern all matters arising out of these Terms. 
            All claims shall be brought exclusively in the State or Federal courts of Los Angeles County, California.
          </p>
          <p>
            Customer hereby submits to the jurisdiction of California courts and waives any objection to venue.
          </p>
        </TermsSection>

        {/* Arbitration */}
        <TermsSection title="Arbitration" icon={FaBan} delay={0.65}>
          <p>
            At the election of either party, any disputes arising out of these Terms may be settled by arbitration 
            in Los Angeles County, California, in accordance with the California Arbitration Act.
          </p>
          <p>
            Nothing in this provision precludes CMA from seeking injunctive relief in a California court to enforce 
            its rights.
          </p>
        </TermsSection>

        {/* Attorney Fees & Notice */}
        <TermsSection title="Attorney Fees & Notice" icon={FaChartLine} delay={0.7}>
          <p>
            In any suit arising out of these Terms, the <Highlight>prevailing party</Highlight> shall be entitled to reasonable 
            costs and attorneys' fees.
          </p>
          <p>
            Notices from CMA of changes to these Terms will be sent by email or U.S. mail. Notices to CMA should be 
            sent to: <strong>CMA Legal, 406 E. Huntington Drive, Suite 200, Monrovia, California 91016</strong>.
          </p>
        </TermsSection>

        {/* Effective Date & Acceptance */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="bg-gradient-to-r from-amber-600 to-amber-600 rounded-xl p-6 text-white text-center"
        >
          <FaFileContract className="text-2xl mx-auto mb-2" />
          <h3 className="text-base font-bold mb-1">Effective & Acceptance</h3>
          <p className="text-amber-100 text-sm mb-3">
            Customer's purchase of Products after the date of these Terms constitutes Customer's acceptance of these Terms.
            An electronic signature has the same validity and binding effect as a handwritten signature.
          </p>
          <div className="flex justify-center gap-3">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-mono">
              Last Updated: January 2024
            </span>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-mono">
              Version: 2.0 (U.S. & Canada)
            </span>
          </div>
        </motion.div> */}

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-gray-400 text-xs pt-4 border-t border-gray-200"
        >
          © {new Date().getFullYear()}  Double Coin. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}