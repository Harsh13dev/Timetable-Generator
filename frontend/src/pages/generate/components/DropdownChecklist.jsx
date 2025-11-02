import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const DropdownChecklist = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const filteredOptions = options.filter(option => option.trim() !== '');

  return (
    <div className="dropdown form-input-ge position-relative" ref={dropdownRef} style={{cursor:"pointer"}}>
      <div
        className="d-flex justify-content-between"
        onClick={() => setIsOpen(!isOpen)}
        // type="button"
        // className="btn btn-outline-secondary dropdown-toggle w-100 d-flex justify-content-between align-items-center"
        // onClick={() => setIsOpen(!isOpen)}
        // style={{ height: '40px' }}
      >
        <span>
          {selected.length > 0 
            ? `${selected.join(", ")}` 
            : 'Select subjects'
          }
        </span>
        <ChevronDown size={16} />
      </div>
      
      {isOpen && (
        <div className="dropdown-menu show w-100 p-0 position-absolute" style={{ maxHeight: '200px', overflowY: 'auto',bottom:-30,right:0 }}>
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className={`dropdown-item d-flex align-items-center`}
              onClick={() => {
                handleToggle(option)
                
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="me-2" style={{ width: '16px', height: '16px' }}>
                {selected.includes(option) && <Check size={16} color="green" />}
              </div>
              <span>{option}</span>
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="dropdown-item text-muted">No subjects available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownChecklist;