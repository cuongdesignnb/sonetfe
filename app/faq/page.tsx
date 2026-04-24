import { fetchFaqs, fetchPagesSettings } from "@/lib/page-settings";

export default async function FaqPage() {
  const pages = await fetchPagesSettings();
  const page = pages.faq;
  const faqs = await fetchFaqs(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      <div className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {page.title}
          </h1>
          {page.subtitle ? (
            <p className="mt-4 text-lg text-slate-600">{page.subtitle}</p>
          ) : null}
        </div>

        {page.content ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-6 shadow-sm md:p-10">
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        ) : null}

        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {faqs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
              Chưa có câu hỏi thường gặp. Vui lòng quay lại sau.
            </div>
          ) : (
            faqs
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
              .map((f) => (
                <details
                  key={f.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
                    {f.question}
                    <span className="text-slate-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div
                    className="prose prose-slate mt-4 max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: f.answer }}
                  />
                </details>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
