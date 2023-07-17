
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Category from './category';
import Budget from './budget';
import BudgetExpense from './budgetexpense';
import BudgetRevenus from './budgetrevenus';
import SubCategory from './subcategory';

const AccountsRoute = ({ match }) => (
   <Routes>
      <Navigate exact from={`${match.url}/`} to={`${match.url}/categories`} />
      <Route path={`${match.url}/categories`} component={Category} />
      <Route path={`${match.url}/sub-category`} component={SubCategory} />
      <Route path={`${match.url}/budgets`} component={Budget} />
      <Route path={`${match.url}/budget-expenses`} component={BudgetExpense} />
      <Route path={`${match.url}/budget-revenues`} component={BudgetRevenus} />
   </Routes>
);

export default AccountsRoute;
