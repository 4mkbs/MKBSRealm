import React from "react";

const Skeleton = ({ width = "100%", height = "20px", className = "" }) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={{ width, height }}
  />
);

const PostSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton width="40px" height="40px" className="rounded-full" />
      <div className="flex-1">
        <Skeleton width="150px" height="16px" className="mb-2" />
        <Skeleton width="100px" height="12px" />
      </div>
    </div>
    <Skeleton width="100%" height="80px" className="mb-4" />
    <Skeleton width="100%" height="200px" className="mb-4" />
    <div className="flex justify-between">
      <Skeleton width="60px" height="14px" />
      <Skeleton width="60px" height="14px" />
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto py-8">
    <div className="bg-white p-6 rounded-lg shadow">
      <Skeleton width="100%" height="200px" className="mb-4 rounded-lg" />
      <div className="flex flex-col items-center -mt-16">
        <Skeleton
          width="96px"
          height="96px"
          className="rounded-full border-4 border-white mb-4"
        />
        <Skeleton width="200px" height="24px" className="mb-2" />
        <Skeleton width="300px" height="16px" className="mb-2" />
        <Skeleton width="150px" height="14px" />
      </div>
    </div>
  </div>
);

export { Skeleton, PostSkeleton, ProfileSkeleton };
