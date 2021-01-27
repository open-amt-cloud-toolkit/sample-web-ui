// Copyright (c) Microsoft. All rights reserved.
/*********************************************************************
* Copyright (c) Intel Corporation 2020
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React from 'react';
import { Redirect } from 'react-router-dom';
import { getLoggedInStatus } from 'store/reducers/authReducer';
import { getRpsEnabledStatus } from 'store/reducers/appReducer';
import { useSelector } from 'react-redux';

export function Protected(props) {
  const isLoggedIn = useSelector((state) => getLoggedInStatus(state) || JSON.parse(window.sessionStorage.getItem('loggedIn')))
  const isRpsEnabled = useSelector((state) => getRpsEnabledStatus(state))
  
  const currentURL = window.location.href
  const isMpsRoute = currentURL.includes('/#/mps/');
  const Component = props.component;
  
  return <>{
  ((isRpsEnabled | isMpsRoute) && isLoggedIn) ? 
  <Component /> : 
  !isLoggedIn ? <Redirect to='/login' /> : <Redirect to='/landing' />}
  </>

}
