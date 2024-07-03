import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Offcanvas from "../../../Entryfile/offcanvance";
import favicon from "../../../files/Icons/DaftarProIcon.svg";

import { useTranslation } from "react-i18next";

const GitBook = () => {

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });
  
  return (
    <div>
      <div className="page-wrapper">
        <Helmet>
          <title>Documentation - {t('header.daftarPro')}</title>
          <meta name="description" content="Login page" />
          <link rel="icon" type="image/x-icon" href={favicon} />
        </Helmet>
        {/* Page Content */}
        <iframe 
          src="https://devgate.gitbook.io/daftarpro"
          style={{ width: '100%', height: '88vh', border: 'none' }}
          title="Documentation"
        />
      </div>
      <Offcanvas />
    </div>
  );
};

export default GitBook;
