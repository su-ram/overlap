"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MoimPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      // 쿼리 파라미터로 받은 id를 동적 라우트로 리다이렉트
      router.replace(`/moim/${id}`);
    }
  }, [id, router]);

  // id가 없으면 에러 메시지 표시
  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">모임 ID가 필요합니다</h1>
          <p className="mt-2 text-slate-600">URL에 id 파라미터를 포함해주세요.</p>
        </div>
      </div>
    );
  }

  // 리다이렉트 중 표시
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
      <div className="text-center">
        <p className="text-slate-600">로딩 중...</p>
      </div>
    </div>
  );
}

export default function MoimPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
          <div className="text-center">
            <p className="text-slate-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <MoimPageContent />
    </Suspense>
  );
}
