'use client';

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'list' | 'grid' | 'detail';
}

export default function LoadingSkeleton({ rows = 10, type = 'list' }: LoadingSkeletonProps) {
  if (type === 'grid') {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded border border-gray-200 p-6 shadow-sm"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-3/4 mb-2 animate-shimmer"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/2 animate-shimmer" style={{ animationDelay: '100ms' }}></div>
                </div>
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-16 animate-shimmer" style={{ animationDelay: '200ms' }}></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/3 animate-shimmer" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/4 animate-shimmer" style={{ animationDelay: '200ms' }}></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/3 animate-shimmer" style={{ animationDelay: '250ms' }}></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/4 animate-shimmer" style={{ animationDelay: '300ms' }}></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/3 animate-shimmer" style={{ animationDelay: '350ms' }}></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/4 animate-shimmer" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-2/3 animate-shimmer" style={{ animationDelay: '450ms' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="p-6">
        <div className="max-w-4xl space-y-6">
          {/* Card skeleton */}
          <div className="bg-white rounded border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/4 animate-shimmer"></div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/3 mb-2 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }}></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-2/3 animate-shimmer" style={{ animationDelay: `${i * 100 + 50}ms` }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Second card skeleton */}
          <div className="bg-white rounded border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/4 animate-shimmer" style={{ animationDelay: '100ms' }}></div>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-1/3 mb-2 animate-shimmer" style={{ animationDelay: `${i * 100 + 200}ms` }}></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-full animate-shimmer" style={{ animationDelay: `${i * 100 + 250}ms` }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: list type
  return (
    <div className="bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#f3f3f3]">
          <tr>
            <th className="w-12 px-6 py-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-4 animate-shimmer"></div>
            </th>
            {Array.from({ length: 5 }).map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-24 animate-shimmer" style={{ animationDelay: `${i * 50}ms` }}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              <td className="w-12 px-6 py-4">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded w-4 animate-shimmer" style={{ animationDelay: `${rowIndex * 30}ms` }}></div>
              </td>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer ${colIndex === 0 ? 'w-32' : 'w-24'}`}
                    style={{ animationDelay: `${rowIndex * 30 + colIndex * 20}ms` }}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
