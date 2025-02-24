interface CommentSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommentSettings = ({ isOpen, onClose }: CommentSettingsProps) => {
    return (
        <>
            {isOpen && (
                <div className="absolute right-0 top-0 w-[200px] bg-[#363636] rounded-md shadow-lg border border-[#3c3c3c] p-2 mt-8 mr-2">
                    <div className="flex flex-col gap-2">
                        <div className="text-sm text-gray-300 font-medium px-2 py-1">
                            Filters
                        </div>
                        <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#3c3c3c] rounded cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox bg-[#2c2c2c] border-[#4c4c4c] rounded"
                            />
                            <span className="text-sm text-gray-300">
                                Show resolved
                            </span>
                        </label>
                        <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#3c3c3c] rounded cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox bg-[#2c2c2c] border-[#4c4c4c] rounded"
                            />
                            <span className="text-sm text-gray-300">
                                Only this page
                            </span>
                        </label>
                        <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#3c3c3c] rounded cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-checkbox bg-[#2c2c2c] border-[#4c4c4c] rounded"
                            />
                            <span className="text-sm text-gray-300">
                                Entire project
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommentSettings;
