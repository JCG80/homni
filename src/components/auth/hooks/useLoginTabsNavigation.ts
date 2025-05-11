
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useLoginTabsNavigation = (defaultTab = 'private') => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : defaultTab);

  useEffect(() => {
    if (typeParam === 'business') {
      setActiveTab('business');
    } else {
      setActiveTab('private');
    }
  }, [typeParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/login${value === 'business' ? '?type=business' : ''}`, { replace: true });
  };

  return {
    activeTab,
    handleTabChange
  };
};
