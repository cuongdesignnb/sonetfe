"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Palette,
  BarChart,
  Camera,
  Globe,
  Smartphone,
  ArrowRight,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  courses_count?: number;
};

const ICONS = [Code, Palette, BarChart, Camera, Globe, Smartphone];
const GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-indigo-500",
  "from-orange-500 to-amber-500",
  "from-violet-500 to-purple-500",
];

const LIGHT_BG = [
  "bg-blue-50 dark:bg-blue-950/30",
  "bg-pink-50 dark:bg-pink-950/30",
  "bg-green-50 dark:bg-green-950/30",
  "bg-purple-50 dark:bg-purple-950/30",
  "bg-orange-50 dark:bg-orange-950/30",
  "bg-violet-50 dark:bg-violet-950/30",
];

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://admin.phamanhchien.vn/api";
      try {
        const res = await fetch(`${apiUrl}/categories?flat=1`, {
          cache: "no-store",
        });
        const json = (await res.json()) as Category[];
        if (cancelled) return;
        setCategories(json || []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 px-4 py-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
            <Layers className="w-4 h-4 mr-2" />
            Danh mục
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Khám phá theo lĩnh vực
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Chọn lĩnh vực bạn quan tâm và bắt đầu hành trình phát triển kỹ năng
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            const gradient = GRADIENTS[idx % GRADIENTS.length];
            const lightBg = LIGHT_BG[idx % LIGHT_BG.length];

            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  href={`/categories/${category.id}`}
                  className={`group flex flex-col p-6 rounded-2xl ${lightBg} border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 h-full`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Course Count Badge */}
                    <Badge className="ml-auto bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {category.courses_count ?? 0} khóa học
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 mb-4 line-clamp-2">
                    {category.description ||
                      "Khám phá các khóa học chất lượng trong lĩnh vực này"}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:gap-2 transition-all">
                    <span>Khám phá ngay</span>
                    <ArrowRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            size="lg"
            asChild
            className="px-8 py-6 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <Link href="/categories">
              Xem tất cả danh mục
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
