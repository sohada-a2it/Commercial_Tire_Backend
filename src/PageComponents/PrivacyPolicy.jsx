"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaCookie, FaImage, FaComment, FaShareAlt, FaDatabase, FaUserShield, FaGlobe } from "react-icons/fa";

const Highlight = ({ children }) => (
  <span className="relative inline-block">
    <span className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 rounded-md" />
    <span className="relative font-semibold text-amber-700 px-1">
      {children}
    </span>
  </span>
);

const PolicySection = ({ title, icon: Icon, children, delay = 0 }) => (
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

export default function PrivacyPolicy() {
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
            <FaShieldAlt className="text-amber-500 text-xs" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Legal Information
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Privacy <span className="text-amber-600">& Policy</span>
          </h1>
          
          <div className="flex justify-center gap-1.5 mb-4">
            <div className="w-12 h-0.5 bg-amber-500 rounded-full"></div>
            <div className="w-6 h-0.5 bg-amber-500 rounded-full"></div>
          </div>
          
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            Last updated: January 2024. This policy describes how we collect, use, and protect your personal information.
          </p>
        </motion.div>

        {/* Comments Section */}
       {/* Comments Section - Updated for E-commerce */}
<PolicySection title="Customer Reviews & Inquiries" icon={FaComment} delay={0.1}>
  <p>
    When you leave product reviews or submit inquiries through our contact forms, we collect the information you provide (such as name, email address, and review content) along with your IP address to verify identity and prevent spam. This helps us ensure authentic feedback for our products.
  </p>
  <p>
    If you use a third-party service to post a review (e.g., Google or social media), that service's privacy policy applies to your data during transmission. Once received by Double Coin, your information is handled according to this policy.
  </p>
</PolicySection>

{/* Media Section - Updated for Products */}
<PolicySection title="Product Images & Uploads" icon={FaImage} delay={0.2}>
  <p>
    When uploading images to our platform (such as for warranty claims or return requests), please ensure they do not contain embedded location data (EXIF GPS). Double Coin respects your visual privacy; however, please be aware that visitors to the site could potentially download and extract any location data from uploaded images.
  </p>
</PolicySection>

{/* Cookies Section - Updated */}
<PolicySection title="Cookies & Browsing Data" icon={FaCookie} delay={0.3}>
  <p>
    To enhance your shopping experience, we use cookies. If you leave a review or add items to your cart, cookies save your preferences so you don't have to re-enter details. These shopping cart cookies expire after one week, while preference cookies last for one year.
  </p>
  <p>
    When you log into your Double Coin account, we set cookies to save your login information and screen display preferences. Login cookies last for two days; if you select "Remember Me", your login persists for two weeks. Logging out removes these cookies.
  </p>
  <p>
    Double Coin handles customer personal information with discretion and does not sell cookie data to third parties.
  </p>
</PolicySection>

{/* Embedded Content - Updated */}
<PolicySection title="External Links & Embedded Content" icon={FaShareAlt} delay={0.4}>
  <p>
    Our site may contain links to affiliated companies, distributors, or embedded content (e.g., tire specification videos from YouTube). Please note: This privacy policy applies <strong>only to the Double Coin website</strong>. It does not apply to domestic or overseas affiliated companies or external links.
  </p>
  <p>
    If you interact with embedded content from other websites, those sites may collect data about you, use cookies, and track your interaction. We ask that you contact those companies directly concerning their privacy policies.
  </p>
</PolicySection>

{/* Data Sharing - Updated with "Non-disclosure" clause */}
<PolicySection title="Non-Disclosure to Third Parties" icon={FaDatabase} delay={0.5}>
  <p>
    <Highlight>Double Coin does not disclose or provide personal information to any third parties</Highlight> except in the following circumstances:
  </p>
  <ul className="list-disc pl-5 space-y-1 mt-2">
    <li>When you (the customer) have given explicit consent.</li>
    <li>When disclosure to business contractors (e.g., shipping carriers) is required to deliver your order. In this event, we require them to handle your data appropriately.</li>
    <li>When disclosure is required by law and we must provide information to relevant government agencies only.</li>
  </ul>
</PolicySection>

{/* Data Retention - Updated */}
<PolicySection title="Data Retention & Alteration" icon={FaDatabase} delay={0.6}>
  <p>
    We retain customer account data and order history indefinitely for administrative and legal purposes. If you leave a product review, the review and its metadata are retained to recognize you as a verified purchaser automatically.
  </p>
  <p>
    <Highlight>Your rights:</Highlight> When you request alteration, confirmation, correction, or deletion of your registered personal information, Double Coin will use appropriate methods to make the changes only after confirming your identity. All users can see, edit, or delete their personal information in their profile (except usernames).
  </p>
</PolicySection>

{/* User Rights - Updated with Security */}
<PolicySection title="Your Rights & Security" icon={FaUserShield} delay={0.7}>
  <p>
    You have the right to request an exported file of the personal data we hold about you. You may also request erasure of your data, excluding data we must keep for legal or security purposes.
  </p>
  <p>
    <Highlight>Security:</Highlight> Double Coin takes reasonable security measures to prevent illegal access, loss, destruction, or leakage of personal information. Each division handling data appoints an information manager and enforces strict internal regulations.
  </p>
</PolicySection>

{/* Data Processing - Updated Final */}
<PolicySection title="Policy Changes & Processing" icon={FaGlobe} delay={0.8}>
  <p>
    Visitor comments and transactions may be checked through automated security and spam detection services.
  </p>
  <p>
    Double Coin reserves the right to review and amend this privacy policy in accordance with relevant legislative amendments. Changes will be posted on this page. We use personal information in principle to provide goods, services, and information to customers. If you do not wish to receive marketing information, please contact us to opt out.
  </p>
</PolicySection>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-gradient-to-r from-amber-600 to-amber-600 rounded-xl p-6 text-white text-center"
        >
          <FaShieldAlt className="text-2xl mx-auto mb-2" />
          <h3 className="text-base font-bold mb-1">Questions About Privacy?</h3>
          <p className="text-amber-100 text-sm mb-3">
            If you have any questions about this privacy policy, please contact us.
          </p>
          <a 
            href="/contact" 
            className="inline-block px-4 py-1.5 bg-white text-amber-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
          >
            Contact Us
          </a>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="text-center text-gray-400 text-xs pt-4 border-t border-gray-200"
        >
          © {new Date().getFullYear()} DoubleCoin, LTD. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}