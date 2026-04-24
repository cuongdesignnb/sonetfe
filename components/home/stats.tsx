"use client";

import { useEffect, useState, useRef } from "react";
import { BookOpen, Users, Award, Globe, TrendingUp } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface StatItem {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  gradient: string;
}

function buildStats(values: {
  courses: number;
  students: number;
  certificates: number;
  countries: number;
}): StatItem[] {
  return [
    {
      icon: BookOpen,
      label: "Khóa học",
      value: values.courses,
      suffix: "+",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      label: "Học viên",
      value: values.students,
      suffix: "+",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Award,
      label: "Chứng chỉ đã cấp",
      value: values.certificates,
      suffix: "+",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Globe,
      label: "Quốc gia",
      value: values.countries,
      suffix: "+",
      gradient: "from-green-500 to-emerald-500",
    },
  ];
}

function AnimatedNumber({
  value,
  duration = 2000,
  inView,
}: {
  value: number;
  duration?: number;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    let startTime = Date.now();
    let animationFrame: number;

    const updateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, inView]);

  return <span>{count.toLocaleString()}</span>;
}

export function Stats() {
  const settings = useSiteSettings();
  const stats = buildStats(settings.home.stats);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600" />
      
      {/* Animated Background Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-4 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4" />
            Số liệu ấn tượng
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Con số biết nói
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Hàng ngàn học viên tin tưởng và lựa chọn chúng tôi cho hành trình phát triển của họ
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="relative text-center p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
                  {/* Icon */}
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-6 shadow-lg`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Number */}
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
                    <AnimatedNumber value={stat.value} inView={isInView} />
                    <span className="text-white/80">{stat.suffix}</span>
                  </div>

                  {/* Label */}
                  <div className="text-white/80 font-medium text-lg">
                    {stat.label}
                  </div>

                  {/* Decorative line */}
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${stat.gradient} rounded-full group-hover:w-1/2 transition-all duration-300`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Trust Badges */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/60"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Được tin tưởng bởi các doanh nghiệp hàng đầu</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Đánh giá 4.9/5 trên Trustpilot</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
