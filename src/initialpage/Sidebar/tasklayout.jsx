// /**
//  * App Routes
//  */
//  import React, {useEffect,useState } from 'react';
// import { Route, withRouter } from 'react-router-dom';

// // router service
// import taskservice from "../../router_service/taskservice";

// import Header from './header';
// import SidebarContent from './tasksidebar';

// const Tasklayout = (props) => {

// 	const [menu, setMenu] = useState(false)

// 	const toggleMobileMenu = () => {
// 		setMenu(!menu)
// 	  }
// 		const { match } = props;
// 		return (
// 			<>
// 			 <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
          
// 		 		 <Header onMenuClick={(value) => toggleMobileMenu()} />
// 				{/* <div> */}
// 					{taskservice && taskservice.map((route,key)=>
// 						<Route key={key} path={`${match.url}/${route.path}`} component={route.component} />
// 					)}
// 				{/* </div>				 */}
// 				<SidebarContent/>
// 			</div>	
// 			</>
// 		);
	
// }
// export default withRouter(Tasklayout);


import React, { useState } from 'react';
import { Route, useLocation } from 'react-router-dom';

// router service
import taskservice from "../../router_service/taskservice";

import Header from './header';
import SidebarContent from './tasksidebar';

const Tasklayout = () => {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const { pathname } = location;

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  return (
    <>
      <div className={`main-wrapper ${menu ? 'slide-nav' : ''}`}>
        {/* <Header onMenuClick={toggleMobileMenu} /> */}
        {taskservice &&
          taskservice.map((route, key) => (
            <Route key={key} path={`${pathname}/${route.path}`} element={<route.component />} />
          ))}
        <SidebarContent />
      </div>
    </>
  );
};

export default Tasklayout;
