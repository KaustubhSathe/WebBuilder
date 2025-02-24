interface CommentBubbleProps {
    position: { x: number; y: number };
    userInitials: string;
}

const CommentBubble = ({ position, userInitials }: CommentBubbleProps) => {
    return (
        <div
            className="absolute flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full text-white text-xs font-medium cursor-pointer hover:bg-blue-600 transition-colors"
            style={{
                left: position.x - 12,
                top: position.y - 12,
            }}
        >
            {userInitials}
        </div>
    );
};

export default CommentBubble;
