"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function AffiliateBanner() {
  const settings = useSiteSettings();
  const affiliate = settings.home.affiliate;

  return (
    <section className="py-6">
      <div className="container">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">
                {affiliate.title ||
                  "Chương trình Affiliate - Xây dựng nguồn thu nhập thứ 2!"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {affiliate.description ||
                  "Nhận hoa hồng lên đến 85% khi giới thiệu khách hàng mua khóa học"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20 whitespace-nowrap"
            asChild
          >
            <Link href="/affiliate">
              {affiliate.button_text || "Tìm hiểu thêm"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
