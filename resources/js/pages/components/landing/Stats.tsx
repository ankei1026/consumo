import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Clock, FileText, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "8-19",
    label: "Registered Households",
    sublabel: "Across multiple barangays",
    color: "from-blue-600 to-cyan-600",
  },
  {
    icon: Clock,
    value: "60%",
    label: "Faster Response",
    sublabel: "vs. manual processing",
    color: "from-purple-600 to-pink-600",
  },
  {
    icon: FileText,
    value: "100%",
    label: "Digital Records",
    sublabel: "No more paper-based",
    color: "from-green-600 to-emerald-600",
  },
  {
    icon: TrendingUp,
    value: "24/7",
    label: "Real-time Updates",
    sublabel: "Service interruptions & billing",
    color: "from-orange-600 to-red-600",
  },
];

const Stats = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <section ref={ref} className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  rotate: 1,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl transform rotate-1 scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} p-2 mb-4`}>
                    <Icon className="w-full h-full text-white" />
                  </div>

                  <div className="space-y-1">
                    <motion.div
                      className="text-3xl font-black text-gray-900"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {stat.value}
                    </motion.div>

                    <div className="font-bold text-gray-700">{stat.label}</div>
                    <div className="text-sm text-gray-500">{stat.sublabel}</div>
                  </div>

                  {/* Progress Bar */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "100%" } : {}}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
