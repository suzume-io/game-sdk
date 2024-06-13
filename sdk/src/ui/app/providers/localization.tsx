import React, { createContext, useState, useContext } from 'react';
import viDictionary from '@res/locales/vi.json'
import enDictionary from '@res/locales/en.json'

const LocalizationContext = createContext<any>({
  locale: 'en'
});
const translations: any = { vi: viDictionary, en: enDictionary };

export const LocalizationProvider = ({ children }: any) => {
  const [locale, setLocale] = useState('en');
  const [isInit, setIsInit] = useState(false);
  
  const translate = (key: string) => {
    return translations?.[locale]?.[key] || key;
  };

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
  };

  const init = () => {
    console.log('--- Init LocalizationContext --- ')
    setIsInit(true);
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <LocalizationContext.Provider value={{ translate, changeLocale, locale }}>
      {isInit && children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
