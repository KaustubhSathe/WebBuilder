import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const SaveIndicator = () => {
  const { hasUnsavedChanges, isSaving } = useSelector(
    (state: RootState) => state.saveState
  );

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#2c2c2c]">
      {isSaving ? (
        <span className="material-icons animate-spin text-gray-400 text-[18px]">
          sync
        </span>
      ) : hasUnsavedChanges ? (
        <span className="material-icons text-red-400 text-[18px]">close</span>
      ) : (
        <span className="material-icons text-green-400 text-[18px]">check</span>
      )}
      <span className="text-sm text-gray-400">
        {isSaving
          ? "Saving..."
          : hasUnsavedChanges
            ? "Unsaved changes"
            : "All changes saved"}
      </span>
    </div>
  );
};

export default SaveIndicator;
