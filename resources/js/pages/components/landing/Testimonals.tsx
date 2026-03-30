import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Before CONSUMO, residents had to visit our office for every concern. Now they report leaks with photos, and we get AI-sorted tickets instantly.",
    author: "MEEDO Staff",
    role: "Cagwait Water System",
    avatar: "👩‍💼",
  },
  {
    quote: "The billing inquiries alone used to take hours of phone calls. Now consumers check updates directly and get notifications.",
    author: "Frontline Officer",
    role: "Consumer Services",
    avatar: "👨‍💼",
  },
  {
    quote: "As a consumer, I just snap a photo of a leak and it's logged. No waiting, no follow-up calls. Response time improved dramatically.",
    author: "Resident",
    role: "Barangay Toledo",
    avatar: "👵",
  },
];

const Testimonials = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            What Our{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
              Users Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real feedback from Cagwait Water System staff and consumers
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ y: -10, rotate: index % 2 === 0 ? 1 : -1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl transform rotate-2 scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <Quote className="w-10 h-10 text-blue-200 mb-4" />

                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Quote Mark Background */}
                <Quote className="absolute bottom-4 right-4 w-16 h-16 text-blue-50 -z-10" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Impact Metric */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-6 py-3 border border-blue-200">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-blue-600">
              Based on initial testing with Cagwait Water System staff
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
