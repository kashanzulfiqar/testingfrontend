import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AssetsCategory from './AssetsCategory';
import AssetsSubCategory from './AssetsSubCategory';
import AssetsTag from './AssetsTag';
import AssetsCounter from './AssetsCounter';

const AssetsManagement = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('Assets Category');

  // Get initial tab from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subTab = params.get('subTab');
    if (subTab && ['Assets Category', 'Assets Sub-Category', 'Assets Tag', 'Assets Counter'].includes(decodeURIComponent(subTab))) {
      setActiveTab(decodeURIComponent(subTab));
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Update URL with subTab parameter
    const url = new URL(window.location);
    url.searchParams.set('subTab', encodeURIComponent(tab));
    window.history.pushState({}, '', url);
  };

  const tabs = [
    { key: 'Assets Category', label: 'Assets Category', icon: 'fa-cubes' },
    { key: 'Assets Sub-Category', label: 'Assets Sub-Category', icon: 'fa-cube' },
    { key: 'Assets Tag', label: 'Assets Tag', icon: 'fa-tags' },
    { key: 'Assets Counter', label: 'Assets Counter', icon: 'fa-calculator' }
  ];

  return (
    <div>
      {/* Horizontal Tab List */}
      <div style={{ 
        marginBottom: '20px', 
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '10px'
      }}>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0, 
          display: 'flex', 
          flexDirection: i18n.dir() === 'rtl' ? 'row-reverse' : 'row',
          gap: '10px'
        }}>
          {tabs.map((tab) => (
            <li key={tab.key} style={{ margin: 0 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick(tab.key);
                }}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: activeTab === tab.key ? '#007bff' : '#666',
                  borderBottom: activeTab === tab.key ? '2px solid #007bff' : '2px solid transparent',
                  fontWeight: activeTab === tab.key ? '600' : '400',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.color = '#007bff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.target.style.color = '#666';
                  }
                }}
              >
                <i 
                  className={`fa fa-fw ${tab.icon}`} 
                  style={{ 
                    marginLeft: i18n.dir() === 'rtl' ? '8px' : undefined, 
                    marginRight: i18n.dir() === 'rtl' ? undefined : '8px'
                  }}
                />
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'Assets Category' && <AssetsCategory />}
        {activeTab === 'Assets Sub-Category' && <AssetsSubCategory />}
        {activeTab === 'Assets Tag' && <AssetsTag />}
        {activeTab === 'Assets Counter' && <AssetsCounter />}
      </div>
    </div>
  );
};

export default AssetsManagement;

