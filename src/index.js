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
import { registerServiceWorker } from "./Services/pushNotifications";

const tagManagerArgs = {
  gtmId: 'AW-17408581772', 
};

TagManager.initialize(tagManagerArgs);

const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<Main/>);

if (typeof window !== "undefined") {
  registerServiceWorker()
    ?.then(() => {
      console.log("Service worker registered");
    })
    .catch((error) => {
      console.log("Service worker registration failed", error);
    });
}
