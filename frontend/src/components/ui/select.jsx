import * as React from "react";
import { ChevronDown } from "lucide-react";

export const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trigger = React.Children.toArray(children).find(
    child => child.type === SelectTrigger
  );
  const content = React.Children.toArray(children).find(
    child => child.type === SelectContent
  );

  // Extract items to find the label for current value
  const items = content ? React.Children.toArray(content.props.children) : [];
  const selectedItem = items.find(item => item.props.value === value);
  const selectedLabel = selectedItem ? selectedItem.props.children : value;

  return (
    <div ref={selectRef} className="relative">
      {React.cloneElement(trigger, {
        onClick: () => setIsOpen(!isOpen),
        isOpen,
        selectedLabel
      })}
      {isOpen && React.cloneElement(content, {
        onValueChange: (newValue) => {
          onValueChange(newValue);
          setIsOpen(false);
        }
      })}
    </div>
  );
};

export const SelectTrigger = ({ onClick, isOpen, selectedLabel, children, className = "" }) => {
  // Extract the placeholder from SelectValue child
  const selectValue = React.Children.toArray(children).find(
    child => child.type === SelectValue
  );
  const placeholder = selectValue?.props?.placeholder || "Select...";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    >
      <span className="text-gray-900 font-medium">{selectedLabel || placeholder}</span>
      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

export const SelectValue = ({ placeholder, value }) => null;

export const SelectContent = ({ children, onValueChange }) => (
  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
    {React.Children.map(children, child =>
      React.cloneElement(child, { onValueChange })
    )}
  </div>
);

export const SelectItem = ({ value, children, onValueChange }) => (
  <div
    onClick={() => onValueChange && onValueChange(value)}
    className="relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 font-medium"
  >
    {children}
  </div>
);
