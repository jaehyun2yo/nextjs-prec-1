
export default function Loading() {
  // 간단한 스켈레톤 UI를 만듭니다.
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 bg-gray-200 rounded-md w-32 h-9 animate-pulse"></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 배열을 만들어 6개의 스켈레톤 아이템을 렌더링합니다. */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border p-6 rounded-lg shadow-md">
            <div className="h-14 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
