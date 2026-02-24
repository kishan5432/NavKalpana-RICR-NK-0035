import * as React from "react";

const Tabs = ({ defaultValue, value, onValueChange, children, className = "" }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        child ? React.cloneElement(child, { activeTab, onTabChange: handleTabChange }) : null
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange, className = "" }) => (
  <div className={`flex border-b border-gray-200 ${className}`}>
    {React.Children.map(children, (child) =>
      child ? React.cloneElement(child, { activeTab, onTabChange }) : null
    )}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, onTabChange, className = "" }) => (
  <button
    onClick={() => onTabChange(value)}
    className={`px-4 py-2 font-medium text-sm transition-colors ${
      activeTab === value
        ? "border-b-2 border-blue-600 text-blue-600"
        : "text-gray-600 hover:text-gray-900"
    } ${className}`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab, className = "" }) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
