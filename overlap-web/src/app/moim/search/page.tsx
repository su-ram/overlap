"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui/Loader";
import type { MoimResponse } from "@/types/api";

export default function MoimSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MoimResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 검색 실행
  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    const startTime = Date.now();

    try {
      const query = searchQuery.trim();
      const url = query 
        ? `/api/moim/search?name=${encodeURIComponent(query)}`
        : `/api/moim/search`;
      
      // 최소 2초 대기와 API 호출을 동시에 실행
      const [response] = await Promise.all([
        fetch(url),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "검색에 실패했습니다.");
      }

      const data = await response.json();
      
      // 최소 2초가 지났는지 확인하고, 안 지났으면 남은 시간만큼 대기
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
      }
      
      setSearchResults(data || []);
    } catch (error) {
      // 에러 발생 시에도 최소 2초 대기
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
      }
      console.error("Error searching moim:", error);
      setSearchResults([]);
      alert(error instanceof Error ? error.message : "검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };

  // 모임 클릭 시 해당 모임 페이지로 이동
  const handleMoimClick = (moimId: string) => {
    router.push(`/moim/${moimId}`);
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 및 검색 입력 */}
        <div className="mb-8 pt-0">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">모임 검색</h1>
              <button
                onClick={handleRefresh}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
                aria-label="새로고침"
                title="새로고침"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-1 flex-1 min-w-0">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="모임명 또는 참여자명으로 조회할 수 있어요"
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-sm focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-1.5 bg-[#4CAF50]/80 text-black border-[1px] border-[#4CAF50] rounded-sm hover:bg-[#4CAF50]/90 hover:border-black disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium text-sm"
            >
              검색
            </button>
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        {isSearching && (
          <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
            <Loader size="lg" />
          </div>
        )}
        {hasSearched && !isSearching && (
          <div className="space-y-4">
            {!isSearching && searchResults.length > 0 ? (
              <>
                <div className="text-xs text-gray-600 mb-4">
                  {searchResults.length}개의 모임
                </div>
                <div className="grid gap-2">
                  {searchResults.map((moim, index) => (
                    <motion.div
                      key={moim.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      onClick={() => handleMoimClick(moim.id)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-black cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-sm font-bold text-gray-900 mb-1">
                            {moim.moim_name || "이름 없음"}
                          </h2>
                          {moim.created_at && (
                            <p className="text-xs text-gray-500">
                              생성일: {formatDate(moim.created_at)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">
                            참여자: {moim.buddies?.length || 0}명
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>ID: {moim.id ? (moim.id.split('-').pop() || moim.id) : ''}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
