// components/common/BulkListEditor.jsx
// Usage: replaces the old array field section in JobResponsibilitiesTab
import React, { useState, useRef } from 'react';
import { List, AlignLeft, Plus, X, ClipboardPaste } from 'lucide-react';

/**
 * BulkListEditor
 * 
 * Two modes:
 *  - "list"  → classic one-by-one inputs (existing behaviour)
 *  - "bulk"  → single textarea, one item per line (new)
 * 
 * Props:
 *  fieldName   string
 *  title       string
 *  required    bool
 *  items       string[]          (formData[fieldName])
 *  onChange    (fieldName, items) => void
 *  error       string | undefined
 *  darkMode    bool
 *  placeholder string (optional)
 */
const BulkListEditor = ({
  fieldName,
  title,
  required = false,
  items = [''],
  onChange,
  error,
  darkMode,
  placeholder
}) => {
  const [mode, setMode] = useState('list'); // 'list' | 'bulk'
  const textareaRef = useRef(null);

  const bgCard    = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const bgAccent  = darkMode ? 'bg-almet-comet'       : 'bg-almet-mystic';
  const textPri   = darkMode ? 'text-white'            : 'text-almet-cloud-burst';
  const textSec   = darkMode ? 'text-almet-bali-hai'  : 'text-gray-700';
  const textMuted = darkMode ? 'text-gray-400'         : 'text-almet-waterloo';
  const border    = darkMode ? 'border-almet-comet'    : 'border-gray-200';

  // ─── list mode helpers ──────────────────────────────────────────
  const handleItemChange = (index, value) => {
    const next = items.map((it, i) => (i === index ? value : it));
    onChange(fieldName, next);
  };

  const addItem = () => onChange(fieldName, [...items, '']);

  const removeItem = (index) => {
    if (items.length > 1) {
      onChange(fieldName, items.filter((_, i) => i !== index));
    }
  };

  // ─── bulk mode helpers ──────────────────────────────────────────
  const bulkValue = items.filter(Boolean).join('\n');

  const handleBulkChange = (raw) => {
    const lines = raw.split('\n'); // keep empty lines while typing
    onChange(fieldName, lines.length > 0 ? lines : ['']);
  };

  // switch TO bulk → join current list
  const switchToBulk = () => {
    setMode('bulk');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // switch TO list → split bulk textarea by newline, filter empties
  const switchToList = () => {
    const lines = bulkValue
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    onChange(fieldName, lines.length > 0 ? lines : ['']);
    setMode('list');
  };

  const validCount = items.filter(s => s && s.trim()).length;

  return (
    <div>
      {/* ── header row ── */}
      <div className="flex items-center justify-between mb-2">
        <label className={`text-sm font-medium ${textSec}`}>
          {title}{required && <span className="text-red-500 ml-0.5">*</span>}
          {validCount > 0 && (
            <span className={`ml-2 text-xs font-normal ${textMuted}`}>({validCount} item{validCount !== 1 ? 's' : ''})</span>
          )}
        </label>

        {/* mode toggle */}
        <div className={`flex items-center rounded-lg overflow-hidden border ${border} text-xs`}>
          <button
            type="button"
            onClick={switchToList}
            className={`flex items-center gap-1 px-2.5 py-1 transition-colors
              ${mode === 'list'
                ? 'bg-almet-sapphire text-white'
                : `${bgAccent} ${textMuted} hover:${textSec}`}`}
            title="One-by-one mode"
          >
            <List size={11} /> List
          </button>
          <button
            type="button"
            onClick={switchToBulk}
            className={`flex items-center gap-1 px-2.5 py-1 transition-colors border-l ${border}
              ${mode === 'bulk'
                ? 'bg-almet-sapphire text-white'
                : `${bgAccent} ${textMuted} hover:${textSec}`}`}
            title="Bulk paste mode"
          >
            <AlignLeft size={11} /> Bulk
          </button>
        </div>
      </div>

      {/* ── list mode ── */}
      {mode === 'list' && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className={`flex-shrink-0 w-5 h-5 mt-2.5 rounded-full bg-almet-sapphire/10
                text-almet-sapphire text-[10px] font-bold flex items-center justify-center`}>
                {index + 1}
              </div>
              <textarea
                value={item}
                onChange={e => handleItemChange(index, e.target.value)}
                className={`flex-1 px-3 py-2 border ${border} rounded-lg ${bgCard} ${textPri}
                  focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm resize-none
                  ${error ? 'border-red-500' : ''}`}
                rows={2}
                placeholder={placeholder || `Enter ${title.toLowerCase()}...`}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1.5 mt-1 text-red-400 hover:text-red-600 hover:bg-red-50
                    dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-almet-sapphire hover:text-almet-astral
              font-medium text-xs mt-1 transition-colors"
          >
            <Plus size={13} />
            Add item
          </button>
        </div>
      )}

      {/* ── bulk mode ── */}
      {mode === 'bulk' && (
        <div>
          <div className={`flex items-center gap-1.5 mb-1.5 text-xs ${textMuted}`}>
            <ClipboardPaste size={11} />
            <span>Each line = one item. Paste a numbered list and it will be cleaned automatically.</span>
          </div>
          <textarea
            ref={textareaRef}
            value={bulkValue}
            onChange={e => handleBulkChange(e.target.value)}
            onBlur={() => {
              // clean up on blur: strip leading numbers/bullets
              const cleaned = bulkValue
                .split('\n')
                .map(l => l.replace(/^[\d]+[.)]\s*/, '').replace(/^[•\-\*]\s*/, '').trim())
                .filter(Boolean);
              onChange(fieldName, cleaned.length > 0 ? cleaned : ['']);
            }}
            className={`w-full px-3 py-2.5 border ${border} rounded-lg ${bgCard} ${textPri}
              focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm font-mono
              resize-y leading-6 ${error ? 'border-red-500' : ''}`}
            rows={Math.max(6, items.filter(Boolean).length + 2)}
            placeholder={`Paste or type items here, one per line:\n\nAnalyze business requirements\nCoordinate with stakeholders\nPrepare monthly reports`}
            spellCheck
          />
          <p className={`mt-1 text-xs ${textMuted}`}>
            {validCount} item{validCount !== 1 ? 's' : ''} detected
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default BulkListEditor;