import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'product-card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'product-card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-thumb shimmer" />
            <div className="skeleton-body">
              <div className="skeleton-brand shimmer" />
              <div className="skeleton-title shimmer" />
              <div className="skeleton-meta shimmer" />
              <div className="skeleton-price shimmer" />
            </div>
          </div>
        );

      case 'product-detail':
        return (
          <div className="skeleton-detail-grid">
            <div className="skeleton-detail-gallery shimmer" />
            <div className="skeleton-detail-content">
              <div className="skeleton-detail-brand shimmer" />
              <div className="skeleton-detail-title shimmer" />
              <div className="skeleton-detail-meta shimmer" />
              <div className="skeleton-detail-price shimmer" />
              <div className="skeleton-detail-desc shimmer" />
              <div className="skeleton-detail-actions shimmer" />
            </div>
          </div>
        );

      case 'shop-sidebar':
        return (
          <div className="skeleton-sidebar">
            <div className="skeleton-sidebar-header shimmer" />
            {[...Array(5)].map((_, idx) => (
              <div className="skeleton-sidebar-group" key={idx}>
                <div className="skeleton-sidebar-title shimmer" />
                <div className="skeleton-sidebar-item shimmer" />
                <div className="skeleton-sidebar-item shimmer" />
                <div className="skeleton-sidebar-item shimmer" />
              </div>
            ))}
          </div>
        );

      default:
        return <div className="skeleton-box shimmer" />;
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader;
