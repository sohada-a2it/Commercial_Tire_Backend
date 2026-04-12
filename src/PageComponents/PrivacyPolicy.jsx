"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaCookie, FaImage, FaComment, FaShareAlt, FaDatabase, FaUserShield, FaGlobe } from "react-icons/fa";

const Highlight = ({ children }) => (
  <span className="relative inline-block">
    <span className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-teal-500/20 via-teal-600/20 to-amber-500/20 rounded-md" />
    <span className="relative font-semibold text-teal-700 px-1">
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
      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-amber-500 rounded-lg flex items-center justify-center">
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 mb-4">
            <FaShieldAlt className="text-teal-500 text-xs" />
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              Legal Information
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Privacy <span className="text-teal-600">& Policy</span>
          </h1>
          
          <div className="flex justify-center gap-1.5 mb-4">
            <div className="w-12 h-0.5 bg-teal-500 rounded-full"></div>
            <div className="w-6 h-0.5 bg-amber-500 rounded-full"></div>
          </div>
          
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            Last updated: January 2024. This policy describes how we collect, use, and protect your personal information.
          </p>
        </motion.div>

        {/* Comments Section */}
        <PolicySection title="Comments" icon={FaComment} delay={0.1}>
          <p>
            When visitors leave comments on the site, we collect the data shown in the comments form, 
            along with the visitor's IP address and browser user agent string to help with spam detection.
          </p>
          <p>
            An anonymized string created from your email address (also called a hash) may be provided 
            to the Gravatar service to verify if you are using it. The Gravatar service privacy policy 
            is available{" "}
            <a
              href="https://automattic.com/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 underline font-medium"
            >
              here
            </a>
            . After approval of your comment, your profile picture becomes visible to the public.
          </p>
        </PolicySection>

        {/* Media Section */}
        <PolicySection title="Media" icon={FaImage} delay={0.2}>
          <p>
            When uploading images to the website, please avoid uploading images with embedded location 
            data (EXIF GPS) included. Visitors to the website can download and extract any location 
            data from images on the website.
          </p>
        </PolicySection>

        {/* Cookies Section */}
        <PolicySection title="Cookies" icon={FaCookie} delay={0.3}>
          <p>
            If you leave a comment on our site, you may opt-in to saving your name, email address, 
            and website in cookies. These are for your convenience so that you don't have to fill in 
            your details again when leaving another comment. These cookies will last for one year.
          </p>
          <p>
            When you visit our login page, we set a temporary cookie to determine if your browser 
            accepts cookies. This cookie contains no personal data and is discarded when you close 
            your browser.
          </p>
          <p>
            When you log in, we set up several cookies to save your login information and screen 
            display preferences. Login cookies last for two days, and screen options cookies last 
            for a year. If you select "Remember Me", your login persists for two weeks. When you 
            log out, the login cookies are removed.
          </p>
          <p>
            When you edit or publish an article, an additional cookie is saved in your browser. 
            This cookie contains no personal data and expires after 1 day.
          </p>
        </PolicySection>

        {/* Embedded Content Section */}
        <PolicySection title="Embedded Content" icon={FaShareAlt} delay={0.4}>
          <p>
            Articles on this site may include embedded content (e.g., videos, images, articles, etc.). 
            Embedded content from other websites behaves exactly as if you had visited the other website.
          </p>
          <p>
            These websites may collect data about you, use cookies, embed additional third-party tracking, 
            and monitor your interaction with that embedded content, including tracking your interaction 
            if you have an account and are logged in to that website.
          </p>
        </PolicySection>

        {/* Data Sharing Section */}
        <PolicySection title="Data Sharing" icon={FaDatabase} delay={0.5}>
          <p>
            If you request a password reset, your IP address will be included in the reset email. 
            We do not sell, trade, or otherwise transfer your personal information to outside parties 
            except as described in this policy.
          </p>
        </PolicySection>

        {/* Data Retention Section */}
        <PolicySection title="Data Retention" icon={FaDatabase} delay={0.6}>
          <p>
            If you leave a comment, the comment and its metadata are retained indefinitely. This allows 
            us to recognize and approve follow-up comments automatically instead of holding them in a 
            moderation queue.
          </p>
          <p>
            For users who register on our website, we store the personal information they provide in 
            their user profile. All users can see, edit, or delete their personal information at any time 
            (except they cannot change their username). Website administrators can also see and edit that 
            information.
          </p>
        </PolicySection>

        {/* User Rights Section */}
        <PolicySection title="Your Rights" icon={FaUserShield} delay={0.7}>
          <p>
            If you have an account on this site or have left comments, you can request to receive an 
            exported file of the personal data we hold about you, including any data you have provided 
            to us. You can also request that we erase any personal data we hold about you. This does 
            not include any data we are obliged to keep for administrative, legal, or security purposes.
          </p>
        </PolicySection>

        {/* Data Destination Section */}
        <PolicySection title="Data Processing" icon={FaGlobe} delay={0.8}>
          <p>
            Visitor comments may be checked through an automated spam detection service. Your data 
            is processed in accordance with applicable data protection laws and regulations.
          </p>
        </PolicySection>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-gradient-to-r from-teal-600 to-amber-600 rounded-xl p-6 text-white text-center"
        >
          <FaShieldAlt className="text-2xl mx-auto mb-2" />
          <h3 className="text-base font-bold mb-1">Questions About Privacy?</h3>
          <p className="text-teal-100 text-sm mb-3">
            If you have any questions about this privacy policy, please contact us.
          </p>
          <a 
            href="/contact" 
            className="inline-block px-4 py-1.5 bg-white text-teal-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
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
          © {new Date().getFullYear()} Asian Import & Export Co., LTD. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}