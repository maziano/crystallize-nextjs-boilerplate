import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Cmp, { getData } from 'page-components/folder';
import { getLocaleFromContext } from 'lib/app-config';

export async function getStaticProps(context) {
  const { preview } = context;
  const locale = getLocaleFromContext(context);

  const data = await getData({
    asPath: '/frontpage-2021',
    language: locale.crystallizeCatalogueLanguage,
    preview
  });

  return {
    props: {
      ...data,
      hidePageHeader: true,
      ...(await serverSideTranslations(context.locale, ['common', 'basket']))
    },
    revalidate: 1
  };
}

export default Cmp;
