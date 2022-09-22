import { format } from 'date-fns';
import { de, enGB } from 'date-fns/locale';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const locales: Record<string, Locale> = { de, en: enGB };

export const useFormatDate = () => {
  const { i18n } = useTranslation();

  const formatDate = useCallback(
    (date: Date | string | undefined, f = 'P'): string => {
      if (typeof date === 'string') {
        date = new Date(date);
      }

      let formatted = '';

      if (date) {
        const locale = locales[i18n.resolvedLanguage] ?? enGB;
        formatted = format(date, f, { locale });
      }

      return formatted;
    },
    [i18n.resolvedLanguage]
  );

  return formatDate;
};
