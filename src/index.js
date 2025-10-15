import React from "react";
import ReactDOM from "react-dom";
import Main from "./Entryfile/Main";
// window.Popper = require("popper.js").default;

// // ReactDOM.render(<Main/>, document.getElementById('app'));

// if (module.hot) { // enables hot module replacement if plugin is installed
//  module.hot.accept();
// }
import { createRoot } from 'react-dom/client';
import TagManager from 'react-gtm-module';

const tagManagerArgs = {
  gtmId: 'AW-17408581772', 
};

if ('requestIdleCallback' in window) {
  // @ts-ignore
  requestIdleCallback(() => TagManager.initialize(tagManagerArgs));
} else {
  setTimeout(() => TagManager.initialize(tagManagerArgs), 1200);
}

const container = document.getElementById('app');
if (container && !container._reactRootContainer) {
  const root = createRoot(container); // createRoot(container!) if you use TypeScript
  container._reactRootContainer = root;
  root.render(<Main />);
}
