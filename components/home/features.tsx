"use client";

import { Badge } from "@/components/ui/badge";
import { Play, Download, Award, Users, Clock, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Play,
    title: "Video chất lượng cao",
    description:
      "Streaming video HD/4K mượt mà với công nghệ Bunny CDN toàn cầu",
    gradient: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-500/10",
  },
  {
    icon: Download,
    title: "Học offline",
    description:
      "Tải bài học về máy để học mọi lúc mọi nơi khi không có internet",
    gradient: "from-green-500 to-emerald-500",
    lightBg: "bg-green-500/10",
  },
  {
    icon: Award,
    title: "Chứng chỉ uy tín",
    description:
      "Nhận chứng chỉ được công nhận khi hoàn thành khóa học",
    gradient: "from-yellow-500 to-orange-500",
    lightBg: "bg-yellow-500/10",
  },
  {
    icon: Users,
    title: "Cộng đồng học tập",
    description:
      "Kết nối với hàng ngàn học viên khác, thảo luận và chia sẻ",
    gradient: "from-purple-500 to-indigo-500",
    lightBg: "bg-purple-500/10",
  },
  {
    icon: Clock,
    title: "Học theo tiến độ",
    description:
      "Theo dõi tiến độ chi tiết và tiếp tục từ nơi bạn đã dừng lại",
    gradient: "from-pink-500 to-rose-500",
    lightBg: "bg-pink-500/10",
  },
  {
    icon: Shield,
    title: "Bảo mật tuyệt đối",
    description:
      "Hệ thống bảo mật tiên tiến và thanh toán an toàn SSL 256-bit",
    gradient: "from-slate-500 to-zinc-500",
    lightBg: "bg-slate-500/10",
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
            Tính năng nổi bật
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Nền tảng học trực tuyến hàng đầu với công nghệ tiên tiến và trải nghiệm học tập tốt nhất
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Glow */}
                  <div className={`absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 mb-4">
            Và còn nhiều tính năng tuyệt vời khác đang chờ bạn khám phá
          </p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Cập nhật liên tục
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              Hỗ trợ 24/7
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Miễn phí dùng thử
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
