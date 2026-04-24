import { Suspense } from "react";
import CoursesClient from "./CoursesClient";

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-10 text-muted-foreground">Đang tải…</div>
      }
    >
      <CoursesClient />
    </Suspense>
  );
}
