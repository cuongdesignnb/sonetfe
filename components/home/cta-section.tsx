"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function CTASection() {
  const settings = useSiteSettings();
  const cta = settings.home.cta;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-orange-500" />

      <div className="container relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {cta.title_prefix} {cta.title_highlight} {cta.title_suffix}
          </h2>

          <div
            className="text-white/80 text-base md:text-lg mb-8 max-w-xl mx-auto"
            dangerouslySetInnerHTML={{
              __html:
                cta.subtitle ||
                "Tham gia cùng hàng nghìn học viên đã thành công trong lĩnh vực Marketing",
            }}
          />

          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 rounded-full group transition-all"
            asChild
          >
            <Link href="/courses">
              {cta.primary_cta || "Khám phá khóa học ngay"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
