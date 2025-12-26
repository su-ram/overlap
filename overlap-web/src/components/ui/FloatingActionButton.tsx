"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, Home, Mail } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

interface SubButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface FloatingActionButtonProps {
  subButtons?: SubButton[];
}

export function FloatingActionButton({ subButtons = [] }: FloatingActionButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isLoading } = useLoading();

  // 로더 화면과 API 문서 화면에서는 플로팅 버튼 숨김
  const shouldHide = pathname === "/api-docs" || isLoading;

  if (shouldHide) {
    return null;
  }

  const defaultSubButtons: SubButton[] = [
    {
      icon: <Search className="w-6 h-6" />,
      label: "모임 검색",
      onClick: () => {
        router.push("/moim/search");
        setIsExpanded(false);
      },
    },
    {
      icon: <Mail className="w-6 h-6" />,
      label: "우편함",
      onClick: () => {
        router.push("/inbox");
        setIsExpanded(false);
      },
    },
    {
      icon: <Home className="w-6 h-6" />,
      label: "새 모임",
      onClick: () => {
        router.push("/enter");
        setIsExpanded(false);
      },
    },
  ];

  const buttons = subButtons.length > 0 ? subButtons : defaultSubButtons;

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* 서브 버튼들 (위로 확장, 플로팅 버튼 위에) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-[52px] right-0 flex flex-col-reverse gap-3"
          >
            {buttons.map((button, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  delay: index * 0.05,
                }}
                onClick={button.onClick}
                className="px-3 py-2 bg-transparent text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium whitespace-nowrap"
                aria-label={button.label}
              >
                {button.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 FAB 버튼 (고정 위치, 크기 축소) */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center relative cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isExpanded ? "메뉴 닫기" : "메뉴 열기"}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ opacity: 1 }}
          initial={{ opacity: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/floattingLogo.svg"
            alt="메뉴"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
