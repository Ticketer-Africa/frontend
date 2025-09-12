"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  Company: ["About", "Careers", "Press", "Blog"],
  Support: ["Help Center", "Contact", "Safety", "Community"],
  Legal: [
    "Terms of Service",
    "Privacy Policy",
    "Cookie Policy",
    "Refund Policy",,
  ],
  Organizers: ["Sell Tickets", "Event Planning", "Pricing", "Resources"],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Stay in the loop
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Get notified about the hottest events and exclusive deals before
            anyone else.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
  <Input
    type="email"
    placeholder="Enter your email"
    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full px-6 py-3"
  />
  <Button className="bg-[#1E88E5] hover:bg-blue-500 rounded-full px-8 py-3 font-semibold">
    Subscribe
  </Button>
</div>

        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center mb-4"
            >
              <Sparkles className="w-8 h-8 text-blue-500 mr-3" />
              <span className="text-2xl font-bold">Ticketer</span>
            </motion.div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The ultimate platform for discovering, buying, and selling event
              tickets. Making unforgettable experiences accessible to everyone.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(
            ([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          )}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm mb-4 sm:mb-0">
            © {new Date().getFullYear()} Ticketer. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>🌍 Available worldwide</span>
            <span>🔒 Secure payments</span>
            <span>⚡ Instant delivery</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

