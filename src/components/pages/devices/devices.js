/*********************************************************************
* Copyright (c) Intel Corporation 2020
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React, { useState, useCallback } from 'react';
import { DeviceGrid, MpsProvider } from 'ui-toolkit';
import { options, selectOptions } from './flyouts/options';
import { FlyoutContainer } from './flyouts/deviceActionsFlyout.container';
import Config from 'app.config';
import { mpsConstants } from 'utilities'
import { useHistory, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { epics as deviceEpics, redux as appRedux, getSelectedDevices } from 'store/reducers/deviceReducer';


export function Devices() {
    const [openFlyout, setopenFlyout] = useState('')
    const dispatch = useDispatch()
    const sendPowerAction = useCallback(
        requestParams => dispatch(deviceEpics.actions.sendPowerAction(requestParams)),
        [dispatch]
    )
    const setSelectedDevices = useCallback(
        selectedDevices => dispatch(appRedux.actions.updateSelectedDevices(selectedDevices)),
        [dispatch]
    )
    const selectedDevices = useSelector((state) => getSelectedDevices(state))

    const location = useLocation();
    const history = useHistory();
    const data = {
        mpsKey: Config.mpsApiKey
    }

    const getSelected = (selectedDevices) => {
        setSelectedDevices(selectedDevices)
        setopenFlyout(selectedDevices?.length > 0 ? 'open' : '')
    }

    const closeFlyout = () => setopenFlyout('')

    const handleSelectedAction = (item) => {
        const payload = {
            guid: selectedDevices[0].host,
            action: item.action
        }
        if (item.action === mpsConstants.kvm || item.action === mpsConstants.sol) {
            history.push(`/${payload.action}/${payload.guid}`, payload)
        } else {
            selectedDevices.forEach(selectedDevice => {
                sendPowerAction({ guid: selectedDevice.host, action: item.action });
            })
        }
    }

    const handleSelectItem = (item) => {
        const payload = {
            guid:selectedDevices[0].host,
            action: item.action
        }
        if (item.action === mpsConstants.auditlog) {
           history.push(`/${payload.action}/${payload.guid}`, payload)
        } else {
            sendPowerAction(payload)
        }
    }

    const getOpenFlyout = () => {
        switch (openFlyout) {
            case 'open':
                const flyoutProps = {
                    options,
                    selectOptions,
                    handleSelectedAction: handleSelectedAction,
                    handleSelectItem: handleSelectItem,
                    onClose: closeFlyout,
                    selectedDevices: selectedDevices,
                    className: 'rightnavpadding'
                }
                return <FlyoutContainer {...flyoutProps} />;
            default:
                return null;
        }
    }


    return (
        <React.Fragment>
            <MpsProvider data={data}>
                <DeviceGrid mpsServer={Config.mpsServer}
                    getSelectedDevices={(items) => getSelected(items)}
                    filter={location.filter}
                    selectedDevices={selectedDevices} />
            </MpsProvider>
            { getOpenFlyout()}
        </React.Fragment>
    )

}