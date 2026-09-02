import { startTransition, useEffect, useState } from "react";

import { Database, Download, Settings2, Trash2, Upload, User } from "lucide-react";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { resetColorIndex } from "../../Services/functionServices";
import { useThemeStore } from "../../Services/themeStore";
import { usePineappleStore } from "../../Services/zustand";

const Settings = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState<string>("Calculating...");

  const {
    annotatorName,
    setAnnotatorName,
    crosshairCursor,
    setCrosshairCursor,
    clearSessionDb,
    showToast,
  } = usePineappleStore();

  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setShowContent(true);

    // Calculate storage
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const usage = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(2) : "0.00";
        const quota = estimate.quota ? (estimate.quota / (1024 * 1024 * 1024)).toFixed(2) : "Unknown ";
        setStorageUsage(`${usage} MB of ~${quota} GB available`);
      });
    } else {
      setStorageUsage("Storage API not supported");
    }
  }, []);

  const themeOptions = [
    { label: "System", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

  const handleExport = () => {
    showToast("info", "Info", "Export backup feature coming soon!");
  };

  const handleImport = () => {
    showToast("info", "Info", "Import backup feature coming soon!");
  };

  const confirmReset = () => {
    confirmDialog({
      message: "Are you sure you want to completely reset the app? This deletes all sessions, preferences, and images. This action cannot be undone.",
      header: "Reset Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "!bg-red-600 !border-red-600 hover:!bg-red-700",
      rejectClassName: "!bg-transparent !border-stone-300 !text-stone-700 dark:!text-stone-300",
      accept: async () => {
        try {
          await clearSessionDb();
          resetColorIndex();
          localStorage.removeItem("pineapple-preferences");
          showToast("success", "Success", "App has been reset successfully");
          startTransition(() => {
            navigate("/");
          });
        } catch (error) {
          console.error("Error resetting app:", error);
          showToast("error", "Error", "Failed to reset app. See console.");
        }
      },
    });
  };

  return (
    <Layout>
      <div
        className={`h-full p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto flex flex-col bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl lg:rounded-3xl transition-all duration-1000 transform ${showContent ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        <div className="w-full max-w-3xl flex flex-col h-full">
          <div className="shrink-0 mb-6 lg:mb-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-amber-700 dark:text-amber-300 font-bold">
                Settings
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-content text-amber-600 dark:text-amber-400 font-medium">
                Manage your profile, preferences, and application data.
              </p>
            </div>
          </div>

          <div className="grow w-full flex flex-col gap-6 lg:gap-8 pb-10">

            {/* Profile Section */}
            <div className="bg-white/40 dark:bg-black/40 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-amber-200/50 dark:border-amber-800/50 flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-heading text-lg sm:text-xl">
                <User size={20} />
                <h2>Profile</h2>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-content font-bold text-stone-700 dark:text-stone-300 text-sm sm:text-base">Annotator Name</span>
                  <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400">Used as the author label when exporting annotation data.</span>
                </div>
                <InputText
                  value={annotatorName}
                  onChange={(e) => setAnnotatorName(e.target.value)}
                  placeholder="Your name"
                  className="w-full sm:w-64 font-content text-sm bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-700 !rounded-xl p-3 text-stone-700 dark:text-stone-300"
                />
              </div>
            </div>

            {/* General Section */}
            <div className="bg-white/40 dark:bg-black/40 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-amber-200/50 dark:border-amber-800/50 flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-heading text-lg sm:text-xl">
                <Settings2 size={20} />
                <h2>General</h2>
              </div>

              {/* Theme */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-200/50 dark:border-amber-800/50 pb-4 sm:pb-6">
                <div className="flex flex-col">
                  <span className="font-content font-bold text-stone-700 dark:text-stone-300 text-sm sm:text-base">Theme</span>
                  <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400">Select light or dark mode.</span>
                </div>
                <Dropdown
                  value={theme}
                  onChange={(e) => setTheme(e.value)}
                  options={themeOptions}
                  className="w-full sm:w-48 font-content text-sm bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-700 !rounded-xl text-stone-700 dark:text-stone-300"
                />
              </div>

              {/* Crosshair Cursor */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-content font-bold text-stone-700 dark:text-stone-300 text-sm sm:text-base">Crosshair Cursor</span>
                  <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400">Show precision crosshairs instead of default pointer while drawing.</span>
                </div>
                <InputSwitch
                  checked={crosshairCursor}
                  onChange={(e) => setCrosshairCursor(e.value)}
                />
              </div>
            </div>

            {/* Data & Storage Section */}
            <div className="bg-white/40 dark:bg-black/40 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-amber-200/50 dark:border-amber-800/50 flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-heading text-lg sm:text-xl">
                <Database size={20} />
                <h2>Data & Storage</h2>
              </div>

              {/* Storage Used */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-200/50 dark:border-amber-800/50 pb-4 sm:pb-6">
                <div className="flex flex-col">
                  <span className="font-content font-bold text-stone-700 dark:text-stone-300 text-sm sm:text-base">Storage used</span>
                  <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400">Everything is stored entirely on this device.</span>
                </div>
                <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400 tracking-wide font-semibold text-right">
                  {storageUsage}
                </span>
              </div>

              {/* Export Data */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-200/50 dark:border-amber-800/50 pb-4 sm:pb-6">
                <div className="flex flex-col">
                  <span className="font-content font-bold text-stone-700 dark:text-stone-300 text-sm sm:text-base">Export session</span>
                  <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400">Download a full backup of the current app session.</span>
                </div>
                <Button
                  onClick={handleExport}
                  className="w-full sm:w-auto p-button-outlined p-button-secondary !border-stone-300 dark:!border-stone-600 !text-stone-700 dark:!text-stone-300 font-content text-sm !rounded-xl"
                >
                  <Download size={16} className="mr-2" />
                  Export...
                </Button>
              </div>

              {/* Import Data */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-200/50 dark:border-amber-800/50 pb-4 sm:pb-6">
                <div className="flex flex-col">
                  <span className="font-content font-bold text-stone-700 dark:text-stone-300 text-sm sm:text-base">Import session</span>
                  <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400">Restore from a previously exported backup file.</span>
                </div>
                <Button
                  onClick={handleImport}
                  className="w-full sm:w-auto p-button-outlined p-button-secondary !border-stone-300 dark:!border-stone-600 !text-stone-700 dark:!text-stone-300 font-content text-sm !rounded-xl"
                >
                  <Upload size={16} className="mr-2" />
                  Import...
                </Button>
              </div>

              {/* Reset App */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-content font-bold text-stone-700 dark:text-stone-300 text-sm sm:text-base">Reset app completely</span>
                  <span className="font-content text-xs sm:text-sm text-stone-500 dark:text-stone-400">Deletes everything, including your profile and preferences.</span>
                </div>
                <Button
                  onClick={confirmReset}
                  className="w-full sm:w-auto p-button-danger p-button-outlined !border-red-500/50 hover:!bg-red-500/10 font-content text-sm transition-colors !rounded-xl"
                >
                  <Trash2 size={16} className="mr-2" />
                  Reset app
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
