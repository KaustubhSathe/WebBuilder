interface CommentBubbleProps {
  position: { x: number; y: number };
  userInitials: string;
  onClick?: (e: React.MouseEvent) => void;
}

const CommentBubble = ({
  position,
  userInitials,
  onClick,
}: CommentBubbleProps) => {
  return (
    <div
      className="absolute z-[1000] cursor-pointer flex items-center 
            justify-center w-6 h-6 bg-blue-500 rounded-full
            hover:scale-110 transition-all duration-300
             text-white text-xs font-medium hover:bg-blue-600 transition-colors comment-bubble"
      style={{
        left: position.x - 12,
        top: position.y - 12,
      }}
      onClick={onClick}
    >
      {userInitials}
    </div>
  );
};

export default CommentBubble;
