interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange, className = '' }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] text-gray-400 uppercase">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-[#1a1a1a] text-gray-300 text-xs rounded border border-[#3c3c3c] px-2 py-1.5 focus:outline-none focus:border-blue-500 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select; 