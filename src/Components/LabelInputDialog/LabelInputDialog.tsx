// src/Components/LabelInputDialog/LabelInputDialog.tsx
//
// Shown when the user completes a polygon. Lets them:
//   • type a custom label
//   • pick from saved presets (stored in localStorage)
//   • save a new preset for future sessions
//   • delete an existing preset
//
// Design decisions:
//   • Dialog, not a sidebar — it's a short focused action, not a panel.
//   • Presets are just strings in localStorage under PRESET_STORAGE_KEY.
//   • The dialog is uncontrolled re: the preset list — it loads on open and
//     saves immediately on add/delete, so state is always in sync.

import { useEffect, useRef, useState } from "react";

import { Tag, Trash2 } from "lucide-react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

import {
  addLabelPreset,
  getLabelPresets,
  removeLabelPreset,
} from "../../Services/functionServices";

interface LabelInputDialogProps {
  visible: boolean;
  // Called with the confirmed label string, or null if the user cancels
  onConfirm: (label: string) => void;
  onCancel: () => void;
  // Suggested default label, e.g. "Polygon 3"
  defaultLabel: string;
}

const LabelInputDialog = ({
  visible,
  onConfirm,
  onCancel,
  defaultLabel,
}: LabelInputDialogProps) => {
  const [label, setLabel] = useState("");
  const [presets, setPresets] = useState<string[]>([]);
  const [newPreset, setNewPreset] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset and load presets every time the dialog opens
  useEffect(() => {
    if (visible) {
      setLabel(defaultLabel);
      setNewPreset("");
      setPresets(getLabelPresets());
      // Auto-focus the label input and select all so the user can type immediately
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [visible, defaultLabel]);

  const handleConfirm = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handlePickPreset = (preset: string) => {
    setLabel(preset);
    inputRef.current?.focus();
  };

  const handleAddPreset = () => {
    const trimmed = newPreset.trim();
    if (!trimmed || presets.includes(trimmed)) return;
    const updated = addLabelPreset(trimmed);
    setPresets(updated);
    setNewPreset("");
  };

  const handleRemovePreset = (preset: string) => {
    const updated = removeLabelPreset(preset);
    setPresets(updated);
  };

  const header = (
    <div className="flex items-center gap-2">
      <Tag size={18} className="text-amber-600 dark:text-amber-400" />
      <span className="font-heading text-lg text-amber-700 dark:text-amber-300">
        Name this polygon
      </span>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onCancel}
      header={header}
      draggable={false}
      resizable={false}
      className="w-[92vw] max-w-md"
      pt={{
        root: { className: "!rounded-2xl overflow-hidden" },
        header: {
          className:
            "bg-amber-50 dark:bg-stone-900 border-b border-amber-200 dark:border-amber-800 px-5 py-4",
        },
        content: {
          className: "bg-amber-50 dark:bg-stone-900 px-5 py-4",
        },
        footer: {
          className:
            "bg-amber-50 dark:bg-stone-900 border-t border-amber-200 dark:border-amber-800 px-5 py-3",
        },
      }}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            label="Cancel"
            onClick={onCancel}
            className="!bg-transparent !text-stone-600 dark:!text-stone-400 border! !border-stone-300 dark:!border-stone-600 !rounded-xl px-4 py-2 text-sm"
          />
          <Button
            label="Add Polygon"
            icon="pi pi-check"
            disabled={!label.trim()}
            onClick={handleConfirm}
            className="!bg-amber-700 dark:!bg-amber-800 !text-white !border-amber-700 !rounded-xl px-4 py-2 text-sm"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Label input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-content text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Label
          </label>
          <InputText
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. person, car, tree..."
            className="w-full !rounded-xl px-4 py-2 font-content bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-stone-800 dark:text-stone-200 focus:border-amber-500"
          />
        </div>

        {/* Preset chips */}
        {presets.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-content text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Saved presets — click to use
            </p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <div
                  key={preset}
                  className="flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/40 group"
                >
                  <button
                    onClick={() => handlePickPreset(preset)}
                    className="text-sm font-content text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-200 transition-colors"
                  >
                    {preset}
                  </button>
                  <button
                    onClick={() => handleRemovePreset(preset)}
                    aria-label={`Remove preset ${preset}`}
                    className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new preset */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-content text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Save a new preset
          </p>
          <div className="flex gap-2">
            <InputText
              value={newPreset}
              onChange={(e) => setNewPreset(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPreset();
                }
              }}
              placeholder="New preset label..."
              className="flex-1 !rounded-xl px-4 py-2 text-sm font-content bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-stone-800 dark:text-stone-200"
            />
            <Button
              icon="pi pi-plus"
              disabled={!newPreset.trim() || presets.includes(newPreset.trim())}
              onClick={handleAddPreset}
              className="!bg-lime-700 dark:!bg-lime-800 !text-white !border-lime-700 !rounded-xl px-3"
              aria-label="Save preset"
            />
          </div>
          {presets.includes(newPreset.trim()) && newPreset.trim() !== "" && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-content">
              This preset already exists.
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default LabelInputDialog;
