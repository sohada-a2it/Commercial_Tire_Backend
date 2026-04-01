import React from "react";
import Link from "next/link";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTruck, FaClock } from "react-icons/fa";

export const metadata = {
  title: "Return Policy | Asian Import & Export Co.",
  description: "Learn about our return policy and how to process returns for defective or damaged goods.",
};

const ReturnPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center text-teal-600 hover:text-teal-700 mb-6">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Return Policy</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Return Overview</h2>
            <p className="text-gray-700 mb-4">
              At Asian Import & Export Co., we stand behind the quality of our products. If you receive defective, damaged, or incorrect items, we offer a hassle-free return process to ensure your satisfaction.
            </p>
            <div className="bg-teal-50 border-l-4 border-teal-600 p-4">
              <p className="text-teal-900">
                <strong>Important:</strong> Returns must be initiated within 30 days from the date of delivery.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Return Eligibility</h2>
            <p className="text-gray-700 mb-4">Items are eligible for return if they meet the following criteria:</p>

            <div className="space-y-3">
              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Defective or Damaged</p>
                  <p className="text-gray-600 text-sm">Items damaged during shipping or manufacturing defects</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Incorrect Item</p>
                  <p className="text-gray-600 text-sm">Order received does not match the purchase order</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Quantity Mismatch</p>
                  <p className="text-gray-600 text-sm">Received quantity differs from ordered quantity</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Within 30 Days</p>
                  <p className="text-gray-600 text-sm">Return request submitted within 30 days of delivery</p>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Returnable */}
          <section>
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Non-Returnable Items</h2>
            <p className="text-gray-700 mb-4">The following items cannot be returned:</p>

            <div className="space-y-3">
              <div className="flex items-start">
                <FaTimesCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Items purchased as <strong>final sale</strong></p>
              </div>

              <div className="flex items-start">
                <FaTimesCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Items with <strong>visible signs of use or wear</strong> (except for manufacturing defects)</p>
              </div>

              <div className="flex items-start">
                <FaTimesCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Items <strong>opened and modified</strong> beyond original condition</p>
              </div>

              <div className="flex items-start">
                <FaTimesCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Custom or <strong>bespoke ordered items</strong> (non-standard specifications)</p>
              </div>

              <div className="flex items-start">
                <FaTimesCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">Items <strong>returned after 30 days</strong> from delivery date</p>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section>
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">How to Return an Item</h2>
            <p className="text-gray-700 mb-6">Follow these steps to initiate a return:</p>

            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white font-semibold mr-4 flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Contact Us</p>
                  <p className="text-gray-600">Write to our sales team via email or WhatsApp with your order number and reason for return</p>
                  <p className="text-sm text-teal-600 mt-1">Email: info@asianimportexport.com | WhatsApp: +1 (437) 900-3996</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white font-semibold mr-4 flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Provide Documentation</p>
                  <p className="text-gray-600">Include photos of the defective/damaged item, invoice, and a clear description of the issue</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white font-semibold mr-4 flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Receive Authorization</p>
                  <p className="text-gray-600">Our team will review your request and provide a Return Authorization (RA) number within 2-3 business days</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white font-semibold mr-4 flex-shrink-0">
                  4
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Ship the Item Back</p>
                  <p className="text-gray-600">Pack the item securely and include the RA number. We will provide shipping instructions</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white font-semibold mr-4 flex-shrink-0">
                  5
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Processing & Resolution</p>
                  <p className="text-gray-600">Once received, we will inspect the item and process your replacement or refund within 10 business days</p>
                </div>
              </li>
            </ol>
          </section>

          {/* Shipping & Costs */}
          <section>
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Shipping & Associated Costs</h2>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center mb-2">
                  <FaTruck className="text-teal-600 mr-2" />
                  <p className="font-semibold text-gray-900">Return Shipping</p>
                </div>
                <p className="text-gray-700">
                  For defective or damaged items, <strong>we cover the return shipping cost</strong>. We will provide prepaid shipping labels or arrange collection.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center mb-2">
                  <FaClock className="text-teal-600 mr-2" />
                  <p className="font-semibold text-gray-900">Customer-Initiated Returns</p>
                </div>
                <p className="text-gray-700">
                  If you wish to return an item for reasons other than defect/damage (e.g., change of mind), <strong>return shipping cost will be borne by the customer</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Refunds & Replacements */}
          <section>
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Refunds & Replacements</h2>
            <p className="text-gray-700 mb-4">Once your return is approved and received:</p>

            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 mt-2"></span>
                <div>
                  <p className="font-semibold text-gray-900">Replacement Option (Preferred)</p>
                  <p className="text-gray-600">We will send a replacement item at no additional cost. This is our preferred resolution.</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 mt-2"></span>
                <div>
                  <p className="font-semibold text-gray-900">Partial Refund</p>
                  <p className="text-gray-600">If replacement is not available, we offer a partial refund (minus restocking and inspection fees).</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 mt-2"></span>
                <div>
                  <p className="font-semibold text-gray-900">Full Refund</p>
                  <p className="text-gray-600">For significant defects or if item cannot be repaired, a full refund will be issued minus original shipping cost.</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 mt-2"></span>
                <div>
                  <p className="font-semibold text-gray-900">Timeline</p>
                  <p className="text-gray-600">Refunds are processed within 10-15 business days after approval and will be credited to the original payment method.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Inspection & Quality */}
          <section>
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Inspection Upon Receipt</h2>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> We recommend inspecting all items immediately upon delivery. Document any damage with photographs and report issues within 7 days of receipt. This helps expedite the return process.
            </p>
            <p className="text-gray-700">
              Items should be returned in their original condition and packaging to facilitate inspection and resale, where applicable.
            </p>
          </section>

          {/* Contact Support */}
          <section className="bg-teal-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Questions About Returns?</h2>
            <p className="text-gray-700 mb-4">
              Our customer support team is here to help! Get in touch with us:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a href="mailto:info@asianimportexport.com" className="text-teal-600 hover:text-teal-700">
                  info@asianimportexport.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>WhatsApp:</strong>{" "}
                <a href="https://wa.me/14379003996" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700">
                  +1 (437) 900-3996
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (EST)
              </p>
            </div>
          </section>

          {/* Footer Note */}
          <section className="border-t pt-6">
            <p className="text-sm text-gray-600">
              This Return Policy is subject to change at any time. Changes will be effective immediately upon posting to the website. Your continued use of our services constitutes acceptance of any updated terms.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Last Updated: April 1, 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
