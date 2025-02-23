import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

const ProjectDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const project = useSelector((state: RootState) =>
        state.project.currentProject
    );
    const pages = useSelector((state: RootState) => state.pages.pages);

    if (!project) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-[35px] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors border-r border-[#3c3c3c]"
                title="Menu"
            >
                <span className="material-icons text-[20px]">menu</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[#2c2c2c] border border-[#3c3c3c] rounded shadow-lg z-30">
                        <div className="py-1">
                            <div className="px-3 py-2 text-sm text-gray-400">
                                {project.name}
                            </div>
                            <div className="h-px bg-[#3c3c3c]" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectDropdown;
