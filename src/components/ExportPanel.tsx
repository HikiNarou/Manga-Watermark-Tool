/**
 * ExportPanel Component
 * Export settings and batch processing controls
 * Requirements: 7.1, 7.2, 7.4, 7.6, 6.2
 */

import { useState, useCallback } from 'react';
import { useExport, useImages } from '@/hooks';
import type { ExportFormat, ProcessingResult } from '@/types';

export interface ExportPanelProps {
  className?: string;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'jpg', label: 'JPG', description: 'Best for photos, smaller file size' },
  { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern format, best compression' },
];

export function ExportPanel({ className = '' }: ExportPanelProps) {
  const {
    exportSettings,
    isProcessing,
    processingProgress,
    setFormat,
    setQuality,
    setFilenamePrefix,
    setFilenameSuffix,
    processAllImages,
    processSelectedImage,
    cancelProcessing,
    downloadAsZip,
    downloadSingleImage,
    getProgressPercentage,
    getProgressText,
  } = useExport();
  
  const { selectedImage, hasImages, imageCount } = useImages();
  
  // Local state for results
  const [lastResults, setLastResults] = useState<ProcessingResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Handle process all images - Requirement 6.1
  const handleProcessAll = useCallback(async () => {
    setLastResults(null);
    setShowResults(false);
    
    const results = await processAllImages();
    setLastResults(results);
    setShowResults(true);
  }, [processAllImages]);

  // Handle process selected image
  const handleProcessSelected = useCallback(async () => {
    setLastResults(null);
    setShowResults(false);
    
    const result = await processSelectedImage();
    if (result) {
      setLastResults([result]);
      setShowResults(true);
    }
  }, [processSelectedImage]);


  // Handle download as ZIP - Requirement 7.6
  const handleDownloadZip = useCallback(async () => {
    if (!lastResults) return;
    await downloadAsZip(lastResults, 'watermarked_images');
  }, [lastResults, downloadAsZip]);

  // Handle download single result
  const handleDownloadSingle = useCallback((result: ProcessingResult) => {
    downloadSingleImage(result);
  }, [downloadSingleImage]);

  // Calculate success/failure counts
  const successCount = lastResults?.filter(r => r.success).length ?? 0;
  const failureCount = lastResults?.filter(r => !r.success).length ?? 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Format selector - Requirement 7.1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Format
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormat(option.value)}
              className={`p-2 text-center rounded-lg border transition-colors ${
                exportSettings.format === option.value
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {FORMAT_OPTIONS.find(o => o.value === exportSettings.format)?.description}
        </p>
      </div>

      {/* Quality slider - Requirement 7.2 */}
      <div>
        <label htmlFor="export-quality" className="block text-sm font-medium text-gray-700 mb-1">
          Quality: {exportSettings.quality}%
        </label>
        <input
          id="export-quality"
          type="range"
          min="10"
          max="100"
          value={exportSettings.quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low (10%)</span>
          <span>High (100%)</span>
        </div>
      </div>

      {/* Filename prefix/suffix - Requirement 7.4 */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filename Options
        </label>
        <div className="space-y-2">
          <div>
            <label htmlFor="filename-prefix" className="block text-xs text-gray-500 mb-1">
              Prefix
            </label>
            <input
              id="filename-prefix"
              type="text"
              value={exportSettings.filenamePrefix}
              onChange={(e) => setFilenamePrefix(e.target.value)}
              placeholder="e.g., watermarked_"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="filename-suffix" className="block text-xs text-gray-500 mb-1">
              Suffix
            </label>
            <input
              id="filename-suffix"
              type="text"
              value={exportSettings.filenameSuffix}
              onChange={(e) => setFilenameSuffix(e.target.value)}
              placeholder="e.g., _wm"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500">
            Preview: {exportSettings.filenamePrefix}filename{exportSettings.filenameSuffix}.{exportSettings.format}
          </p>
        </div>
      </div>


      {/* Processing progress - Requirement 6.2 */}
      {isProcessing && processingProgress && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Processing...</span>
            <button
              type="button"
              onClick={cancelProcessing}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Cancel
            </button>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <p className="text-xs text-blue-600">{getProgressText()}</p>
        </div>
      )}

      {/* Results summary */}
      {showResults && lastResults && !isProcessing && (
        <div className={`p-3 rounded-lg border ${
          failureCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              failureCount > 0 ? 'text-yellow-700' : 'text-green-700'
            }`}>
              Processing Complete
            </span>
            <button
              type="button"
              onClick={() => setShowResults(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {successCount} successful, {failureCount} failed
          </p>
          
          {/* Download buttons */}
          <div className="flex gap-2">
            {successCount > 1 && (
              <button
                type="button"
                onClick={handleDownloadZip}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download ZIP
              </button>
            )}
            {successCount === 1 && lastResults[0]?.success && lastResults[0] && (
              <button
                type="button"
                onClick={() => handleDownloadSingle(lastResults[0] as ProcessingResult)}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            )}
          </div>
          
          {/* Failed items list */}
          {failureCount > 0 && (
            <div className="mt-2 pt-2 border-t border-yellow-200">
              <p className="text-xs font-medium text-yellow-700 mb-1">Failed:</p>
              <ul className="text-xs text-yellow-600 space-y-0.5">
                {lastResults.filter(r => !r.success).map((result) => (
                  <li key={result.imageId} className="truncate">
                    • {result.error || 'Unknown error'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}


      {/* Action buttons */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        {/* Apply to selected */}
        <button
          type="button"
          onClick={handleProcessSelected}
          disabled={!selectedImage || isProcessing}
          className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Apply to Selected
        </button>

        {/* Apply to all */}
        <button
          type="button"
          onClick={handleProcessAll}
          disabled={!hasImages || isProcessing}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Apply to All ({imageCount} images)
        </button>

        {/* Download as ZIP - Requirement 7.6 */}
        {lastResults && successCount > 1 && !isProcessing && (
          <button
            type="button"
            onClick={handleDownloadZip}
            className="w-full px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Download as ZIP ({successCount} files)
          </button>
        )}
      </div>

      {/* Info text */}
      {!hasImages && (
        <p className="text-xs text-gray-500 text-center">
          Upload images to enable export
        </p>
      )}
    </div>
  );
}

export default ExportPanel;
