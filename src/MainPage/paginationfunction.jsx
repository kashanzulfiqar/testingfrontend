import React from 'react';
import { useTranslation } from 'react-i18next';

export function itemRender(current, type, originalElement, t) {
  if (type === "prev") {
    return <a>{t('pageprev')}</a>;
  }
  if (type === "next") {
    return <a>{t('pagenext')}</a>;
  }
  return originalElement;
}

export function onShowSizeChange(current, pageSize) {
  // console.log(current, pageSize);
}