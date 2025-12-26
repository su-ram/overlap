"use client";

import { useEffect, useState } from "react";
import { ApiDocsViewer } from "@/components/api-docs/ApiDocsViewer";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // OpenAPI 스키마 로드
    fetch("/openapi.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load OpenAPI spec:", err);
        // 기본 스키마 제공
        setSpec({
          openapi: "3.0.0",
          info: {
            title: "Overlap API",
            version: "1.0.0",
            description: "OpenAPI 스키마를 불러오지 못했습니다. 'npm run docs:openapi'를 실행하여 스키마를 생성해주세요.",
          },
          paths: {},
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">API 문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <ApiDocsViewer spec={spec} />
      </div>
    </div>
  );
}
