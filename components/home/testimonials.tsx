"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Quote, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị Minh",
    role: "Frontend Developer",
    company: "TechViet Co.",
    avatar: "/placeholder-avatar.jpg",
    rating: 5,
    content:
      "Các khóa học ở đây rất chất lượng và thực tế. Tôi đã học được rất nhiều kỹ năng mới và áp dụng ngay vào công việc. Video streaming rất mượt, không bị giật lag.",
  },
  {
    id: 2,
    name: "Trần Văn Quân",
    role: "Freelance Designer",
    company: "Tự do",
    avatar: "/placeholder-avatar.jpg",
    rating: 5,
    content:
      "Giảng viên giảng dạy rất dễ hiểu, có nhiều ví dụ thực tế. Hệ thống theo dõi tiến độ giúp tôi biết rõ mình đang ở đâu và cần học gì tiếp theo.",
  },
  {
    id: 3,
    name: "Lê Thị Hạnh",
    role: "Marketing Manager",
    company: "StartupXYZ",
    avatar: "/placeholder-avatar.jpg",
    rating: 5,
    content:
      "Các khóa học Marketing Digital rất ấn tượng! Tôi đã áp dụng được nhiều chiến lược vào công việc và thấy kết quả rõ rệt. Nền tảng học rất tiện lợi.",
  },
  {
    id: 4,
    name: "Phạm Minh Tuấn",
    role: "Full-stack Developer",
    company: "DevCorp",
    avatar: "/placeholder-avatar.jpg",
    rating: 5,
    content:
      "Chất lượng video rất tuyệt vời, có thể xem ở nhiều tốc độ khác nhau. Bài tập thực hành phong phú giúp tôi nắm vững kiến thức. Hỗ trợ 24/7 rất nhanh chóng.",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            <MessageCircle className="w-4 h-4 mr-2" />
            Đánh giá từ học viên
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Học viên nói gì về chúng tôi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Những phản hồi chân thật từ cộng đồng hơn 50,000+ học viên
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Card */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              {/* Quote icon */}
              <div className="absolute top-8 right-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                  <Quote className="h-8 w-8 text-orange-500" />
                </div>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative z-10"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed mb-8 font-medium">
                    "{currentTestimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {currentTestimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-lg">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {currentTestimonial.role} • {currentTestimonial.company}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full w-12 h-12 border-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? "w-8 h-3 bg-gradient-to-r from-orange-500 to-red-500"
                        : "w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full w-12 h-12 border-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="ml-2">
                <span className="font-semibold text-gray-900 dark:text-white">50,000+</span> học viên hài lòng
              </span>
            </div>
            
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
            
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span> trung bình đánh giá
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
