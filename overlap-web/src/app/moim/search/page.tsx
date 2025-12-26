"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import type { MoimResponse } from "@/types/api";

export default function MoimSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MoimResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/moim/search?name=${encodeURIComponent(searchQuery.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "검색에 실패했습니다.");
      }

      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
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
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">모임 검색</h1>
          <p className="text-gray-600">모임명으로 모임을 검색할 수 있습니다.</p>
        </div>

        {/* 검색 입력 */}
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="모임명을 입력하세요"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  검색 중...
                </>
              ) : (
                "검색"
              )}
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        {hasSearched && (
          <div className="space-y-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  {searchResults.length}개의 모임을 찾았습니다.
                </div>
                <div className="grid gap-4">
                  {searchResults.map((moim) => (
                    <div
                      key={moim.id}
                      onClick={() => handleMoimClick(moim.id)}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {moim.moim_name || "이름 없음"}
                          </h2>
                          {moim.created_at && (
                            <p className="text-sm text-gray-500">
                              생성일: {formatDate(moim.created_at)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            참여자: {moim.buddies?.length || 0}명
                          </div>
                          <div className="text-sm text-gray-600">
                            투표: {moim.slots?.length || 0}개
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>ID: {moim.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-2">검색 결과가 없습니다.</p>
                <p className="text-sm text-gray-500">
                  다른 검색어로 시도해보세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 초기 상태 안내 */}
        {!hasSearched && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">모임을 검색해보세요.</p>
            <p className="text-sm text-gray-500">
              모임명의 일부를 입력하면 관련 모임을 찾을 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
