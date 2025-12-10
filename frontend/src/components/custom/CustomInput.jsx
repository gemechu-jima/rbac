import React, { forwardRef } from "react";


export const TextInput = forwardRef(({ label, error, ...rest }, ref) => {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label >{label}</label>}
      <input
        ref={ref}
        {...rest}
         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
      {error && <p >{error.message}</p>}
    </div>
  );
});

TextInput.displayName = "TextInput";


export const SelectInput = forwardRef(({ label, options = [], error, ...rest }, ref) => {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label >{label}</label>}
      <select
        ref={ref}
        {...rest}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p >{error.message}</p>}
    </div>
  );
});

SelectInput.displayName = "SelectInput";


export const Checkbox = forwardRef(({ label, error, ...rest }, ref) => {
  return (
    <div style={{ marginBottom: 12 }}>
      <label >
        <input ref={ref} type="checkbox" {...rest} />
        <span>{label}</span>
      </label>
      {error && <p >{error.message}</p>}
    </div>
  );
});

Checkbox.displayName = "Checkbox";
