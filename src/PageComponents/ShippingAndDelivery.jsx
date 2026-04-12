"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ShieldCheck,
  Truck,
  Banknote,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Anchor,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/lib/navigation";

// --- Component Library (Professional Light Theme) ---
const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "group inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-300 shadow-sm px-5 py-2.5 text-sm";
  const styles =
    variant === "secondary"
      ? "bg-white text-teal-700 border border-gray-300 hover:bg-gray-50 hover:border-teal-300"
      : "bg-teal-700 text-white hover:bg-teal-800";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4 }}
    className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const CardHeader = ({ children }) => (
  <div className="mb-3 flex items-center gap-3 border-b border-gray-200 pb-3">
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children }) => (
  <div className="space-y-2.5 text-sm text-gray-600">{children}</div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
    {children}
  </span>
);

const Accordion = ({ children }) => (
  <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
    {children}
  </div>
);

const AccordionItem = ({ children }) => (
  <div className="group">{children}</div>
);

const AccordionTrigger = ({ children, onClick, isOpen }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 transition-all ${
      isOpen ? "bg-gray-50 text-teal-700" : "hover:bg-gray-50"
    }`}
  >
    <span>{children}</span>
    <ChevronRight
      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
        isOpen ? "rotate-90 text-teal-600" : ""
      }`}
    />
  </button>
);

const AccordionContent = ({ children, isOpen }) => (
  <div
    className={`overflow-hidden border-t border-gray-200 bg-gray-50/50 px-5 text-sm text-gray-600 transition-all duration-200 ${
      isOpen ? "py-4 max-h-40" : "py-0 max-h-0"
    }`}
  >
    {isOpen ? <div>{children}</div> : null}
  </div>
);

// --- Data ---
const paymentModes = [
  {
    range: "1–5 Containers",
    bullets: [
      "50% advance payment via bank wire against invoice",
      "50% balance upon submission of shipping docs",
    ],
  },
  {
    range: "6–10 Containers",
    bullets: [
      "30% advance payment via bank wire",
      "30% upon submission of shipping docs",
      "40% upon arrival at destination port",
    ],
  },
  {
    range: "11–19 Containers",
    bullets: [
      "25% advance payment via bank wire",
      "25% upon submission of shipping docs",
      "50% upon arrival at destination port",
    ],
  },
  {
    range: "20+ Containers",
    bullets: [
      "25% advance payment via bank wire",
      "75% via CAD or confirmed Letter of Credit (L/C)",
    ],
    note: "Terms negotiable for enterprise volumes.",
  },
];

const steps = [
  {
    title: "Order Confirmation",
    desc: "Receive proforma invoice with order specifications and terms.",
    icon: <FileText className="h-5 w-5" />,
    accent: "text-blue-600",
    bgAccent: "bg-blue-50",
  },
  {
    title: "Secure Advance",
    desc: "Initiate advance via traceable bank-to-bank wire transfer.",
    icon: <Banknote className="h-5 w-5" />,
    accent: "text-amber-600",
    bgAccent: "bg-amber-50",
  },
  {
    title: "Allocation & Prep",
    desc: "Stock reserved; inspection windows coordinated with logistics.",
    icon: <Clock className="h-5 w-5" />,
    accent: "text-teal-600",
    bgAccent: "bg-teal-50",
  },
  {
    title: "Inspection & Loading",
    desc: "Buyer attendance welcomed during verified loading window.",
    icon: <ShieldCheck className="h-5 w-5" />,
    accent: "text-emerald-600",
    bgAccent: "bg-emerald-50",
  },
  {
    title: "Docs & Shipment",
    desc: "Documents released per agreed staged payment schedule.",
    icon: <Truck className="h-5 w-5" />,
    accent: "text-orange-600",
    bgAccent: "bg-orange-50",
  },
];

const faqs = [
  {
    q: "Can I inspect goods before advance payment?",
    a: "To ensure supply chain integrity, buyer visitation is scheduled after order confirmation and receipt of initial advance payment.",
  },
  {
    q: "Which shipping lines do you utilize?",
    a: "We partner with premier global carriers including Maersk, MSC, CMA CGM, and COSCO for competitive transit times and equipment availability.",
  },
  {
    q: "How are LC transactions handled?",
    a: "Our trade finance team works directly with your issuing bank to ensure compliance with UCP 600 and ISBP guidelines.",
  },
];

// --- Highlight Component ---
const Highlight = ({ children }) => (
  <span className="relative inline-block">
    <span className="absolute -inset-0.5 block -skew-y-1 bg-gradient-to-r from-teal-200/40 to-amber-200/40 blur-sm" />
    <span className="relative font-semibold text-teal-700">{children}</span>
  </span>
);

export default function ShippingAndDelivery() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="min-h-screen w-full bg-white selection:bg-teal-100 selection:text-teal-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1974&auto=format&fit=crop')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/95 to-white" />
        
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-24 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge>Global Logistics & Trade Finance</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
              Precision <Highlight>Shipping</Highlight>
              <span className="block text-teal-700 lg:inline"> · Unmatched Reliability</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              Navigate complex international logistics with structured payment milestones, 
              transparent documentation, and dedicated trade support.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/contact">
                <Button>
                  Request Lane Assessment <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <a
                href="https://wa.me/14379003996"
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button variant="secondary">
                  <Phone className="h-3.5 w-3.5" /> Contact Trade Desk
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Modes Grid */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Tiered Payment <span className="text-teal-700">Structures</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Flexible terms aligned with order volume to optimize working capital.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {paymentModes.map((mode, idx) => (
            <Card key={idx} className="flex h-full flex-col">
              <CardHeader>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                  <Anchor className="h-4 w-4 text-teal-600" />
                </div>
                <CardTitle>{mode.range}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mode.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {mode.note && (
                  <div className="mt-3 rounded-md bg-amber-50 p-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                    {mode.note}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process Timeline */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            From Order to <span className="text-teal-700">Delivery</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Streamlined workflow designed for transparency and efficiency.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-7 top-0 hidden h-full w-px bg-gradient-to-b from-teal-300 via-amber-300 to-teal-300 lg:block" />
          
          <div className="space-y-6 lg:ml-14">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                <div className="absolute -left-10 top-3 hidden h-6 w-6 items-center justify-center rounded-full border-3 border-white bg-teal-100 shadow-sm lg:flex">
                  <div className={`h-2.5 w-2.5 rounded-full ${s.accent} bg-current`} />
                </div>
                
                <Card className="overflow-hidden border-l-2 border-l-teal-500">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className={`flex items-center gap-3 ${s.accent}`}>
                      <div className={`rounded-lg p-2 ${s.bgAccent}`}>
                        {s.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {s.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-600">{s.desc}</p>
                    </div>
                    
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Frequently Asked <span className="text-teal-700">Questions</span>
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Clarity on operational procedures and trade compliance.
            </p>
          </div>
          <Link to="/contact">
            <Button variant="secondary" className="whitespace-nowrap">
              <Mail className="h-3.5 w-3.5" /> Ask a Question
            </Button>
          </Link>
        </div>

        <Accordion>
          {faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger
                  onClick={() => setOpenFaqIndex(i)}
                  isOpen={isOpen}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent isOpen={isOpen}>{faq.a}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>

      {/* CTA Footer */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20">
        <Card className="relative overflow-hidden border-teal-200 bg-gradient-to-r from-teal-50 to-white p-7 shadow-sm">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-100/30 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-amber-100/30 blur-2xl" />
          
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Ready to execute your next shipment?
              </h3>
              <p className="mt-2 max-w-xl text-sm text-gray-600">
                Provide destination port and volume for detailed ETA, freight indication, and document checklist.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link to="/contact">
                <Button>
                  Get Freight Estimate <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}