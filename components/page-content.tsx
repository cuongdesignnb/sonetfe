type PageContentProps = {
  title: string;
  subtitle?: string;
  content?: string;
};

export function PageContent({ title, subtitle, content }: PageContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      <div className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-lg text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-6 shadow-sm md:p-10">
          {content ? (
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-slate-500">
              Nội dung đang được cập nhật. Vui lòng quay lại sau.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
