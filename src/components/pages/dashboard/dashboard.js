/*********************************************************************
* Copyright (c) Intel Corporation 2020
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React, { useEffect, useRef, useCallback } from 'react';
import { useHistory } from "react-router-dom";

import Config from 'app.config'
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { epics as deviceEpics,  getConnectedDevicesCount, getDisconnectedDevicesCount, getDevicesError } from 'store/reducers/deviceReducer'

import { PageContent, AjaxError, Grid, Cell } from 'components/shared';

import './dashboard.scss';

export function Dashboard(props) {
  const { t } = useTranslation();
  const ws = useRef(null);
  const dispatch = useDispatch()
  const fetchDevices = useCallback(
    () => dispatch(deviceEpics.actions.fetchDevices()),
    [dispatch]
  )
  useEffect(() => {
    fetchDevices()
  })
  useEffect(() => {
    let retry_timer = 0;
    ws.current = new WebSocket(`wss://${Config.mpsServer}/notifications/control.ashx`)
    ws.current.onopen = () => {
      console.log("opened")
      if (retry_timer !== 0) {
        clearInterval(retry_timer);
        retry_timer = 0;
      }
    }
    ws.current.onclose = () => {
      retry_timer = setInterval(() => {
        ws.current = null;
        //this.connectionStatusControl();
      }, 5000);
    }
    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = () => {
      setTimeout(() => { 
        fetchDevices() 
      }, 200);
    }
  })

  const history = useHistory();
  const navigateUser = (filterString) => {
    history.push({
      pathname: '/mps/devices',
      filter: filterString
    })
  }

  const connected = useSelector((state) => getConnectedDevicesCount(state))
  const disconnected = useSelector((state) => getDisconnectedDevicesCount(state))
  const error = useSelector((state) => getDevicesError(state))
  const totalDevices = (connected + disconnected) || 0;
  return (
    <React.Fragment>
      <PageContent className='dashboard-page-container' key="page-content">
        <h1 style={{ display: 'block', textAlign: 'center' }}>{t('dashboard.header')} </h1>
        {error && <AjaxError error={error} t={t} />}
        <Grid>
          <Cell className='col-2'>
            <div className={`stat-cell total ${totalDevices === connected ? 'allConnected' : 'fewConnected'}`} id="total" onClick={e => navigateUser()}>
              <div className='stat-text'>{t('dashboard.totalDevices')} </div>
              <div className='stat-value'><b> {totalDevices}</b></div>
            </div>
            <div className='stat-cell connected' id="connected" onClick={e => navigateUser('connected')}>
              <div className='stat-text' > {t('dashboard.connectedDevices')} </div>
              <div className='stat-value'><b> {connected}</b></div>
            </div>
            <div className='stat-cell disconnected' id="disconnected" onClick={e => navigateUser('disconnected')}>
              <div className='stat-text' >{t('dashboard.disconnectedDevices')}</div>
              <div className='stat-value'><b>{disconnected}</b></div>
            </div>
          </Cell>
        </Grid>
      </PageContent>
    </React.Fragment>)

}
