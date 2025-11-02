import React from 'react';

function InputField({ value, type, placeholder, handleFunction }) {
  return (
    <input
      className="auth-input w-100 p-2 rounded"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleFunction}
    />
  );
}

export default InputField;