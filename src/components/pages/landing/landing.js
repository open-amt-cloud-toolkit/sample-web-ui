/*********************************************************************
* Copyright (c) Intel Corporation 2020
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React, { useCallback, useEffect } from 'react';
import { Btn } from 'components/shared';
import Config from 'app.config';
import { Redirect } from 'react-router-dom'
import { useHistory } from "react-router-dom";
import { getLoggedInStatus } from 'store/reducers/authReducer';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { redux as appRedux } from 'store/reducers/appReducer'

import './landing.scss'


export function Landing() {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const isLoggedIn = useSelector((state) => getLoggedInStatus(state) || JSON.parse(window.sessionStorage.getItem('loggedIn')))

  const dispatch = useDispatch()
  const setRPSStatus = useCallback(
    isRps => dispatch(appRedux.actions.updateRpsStatus(isRps)),
    [dispatch]
  )
  useEffect(() => {
    setRPSStatus('')
  })
  const navigateUser = isRps => {
    setRPSStatus(isRps)
    if (isRps === 'RPS') {
      history.push('/rps/profiles');
    } else if (isRps === 'MPS') {
      history.push('/mps/dashboard')
    }
  }

  return (
    <React.Fragment>
      {!isLoggedIn && <Redirect to='/login' />}
      <div>
        <Btn className='domain-buttons mps-button' onClick={() => navigateUser('MPS')}>{t('landing.mps')}</Btn>

      </div>
      <div> {Config.rpsEnabled && <Btn className='domain-buttons rps-button' onClick={() => navigateUser('RPS')}>{t('landing.rps')}</Btn>}</div>
    </React.Fragment>)

}
