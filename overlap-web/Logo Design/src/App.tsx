import { Logo } from './components/Logo';

export default function App() {
  return (
    <div className="min-h-screen bg-[#fdfcf8] flex items-center justify-center p-8">
      <div className="space-y-20">
        {/* Main Title */}
        <div className="text-center">
          <h1 className="text-gray-800 mb-4">Overlap 로고 색상 상세 비교</h1>
          <p className="text-gray-600">Green, Ivory, Gray 각 색상의 명도/채도 변화</p>
        </div>

        {/* Green Variations */}
        <div>
          <h2 className="text-center mb-8 text-gray-700">Green 버전</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
              <Logo size={140} showText={false} colorScheme="green1" />
              <p className="mt-6 text-sm text-gray-600">밝고 연한 그린</p>
              <p className="mt-2 text-xs text-gray-400">높은 명도, 낮은 채도</p>
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
              <Logo size={140} showText={false} colorScheme="green2" />
              <p className="mt-6 text-sm text-gray-600">중간 그린</p>
              <p className="mt-2 text-xs text-gray-400">중간 명도, 중간 채도</p>
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
              <Logo size={140} showText={false} colorScheme="green3" />
              <p className="mt-6 text-sm text-gray-600">진하고 선명한 그린</p>
              <p className="mt-2 text-xs text-gray-400">낮은 명도, 높은 채도</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 w-full max-w-4xl mx-auto"></div>

        {/* Ivory Variations */}
        <div>
          <h2 className="text-center mb-8 text-gray-700">Ivory 버전</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm border border-gray-100">
              <Logo size={140} showText={false} colorScheme="ivory1" />
              <p className="mt-6 text-sm text-gray-600">아주 밝은 아이보리</p>
              <p className="mt-2 text-xs text-gray-400">매우 높은 명도</p>
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm border border-gray-100">
              <Logo size={140} showText={false} colorScheme="ivory2" />
              <p className="mt-6 text-sm text-gray-600">중간 아이보리</p>
              <p className="mt-2 text-xs text-gray-400">중간 명도</p>
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm border border-gray-100">
              <Logo size={140} showText={false} colorScheme="ivory3" />
              <p className="mt-6 text-sm text-gray-600">진한 아이보리</p>
              <p className="mt-2 text-xs text-gray-400">낮은 명도</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 w-full max-w-4xl mx-auto"></div>

        {/* Gray Variations */}
        <div>
          <h2 className="text-center mb-8 text-gray-700">Gray 버전</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm border border-gray-100">
              <Logo size={140} showText={false} colorScheme="gray1" />
              <p className="mt-6 text-sm text-gray-600">밝은 그레이</p>
              <p className="mt-2 text-xs text-gray-400">높은 명도</p>
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
              <Logo size={140} showText={false} colorScheme="gray2" />
              <p className="mt-6 text-sm text-gray-600">중간 그레이</p>
              <p className="mt-2 text-xs text-gray-400">중간 명도</p>
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
              <Logo size={140} showText={false} colorScheme="gray3" />
              <p className="mt-6 text-sm text-gray-600">진한 그레이</p>
              <p className="mt-2 text-xs text-gray-400">낮은 명도</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 w-full max-w-4xl mx-auto"></div>

        {/* Comparison with Text */}
        <div>
          <h2 className="text-center mb-8 text-gray-700">텍스트 포함 버전 비교</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
              <Logo size={140} showText={true} colorScheme="green2" />
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm border border-gray-100">
              <Logo size={140} showText={true} colorScheme="ivory2" />
            </div>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-sm">
              <Logo size={140} showText={true} colorScheme="gray2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}