/*********************************************************************
* Copyright (c) Intel Corporation 2020
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React from 'react';
import { mount } from 'enzyme';
import 'polyfills';
import { Provider } from "react-redux";
import cs from '../../../store/configureStore'
import { MemoryRouter } from 'react-router-dom';

import { Dashboard } from './dashboard'
const mockHistoryPush = jest.fn();

function testRender(jsx, { store, ...otherOpts }) {
    return mount(<MemoryRouter><Provider store={store}>{jsx}</Provider></MemoryRouter>, otherOpts);
}
global.WebSocket = jest.fn();
const dashboardProps = {
    devices: () => { },
    connected: 0,
    disconnected: 3,
    error: () => { },
    logout: () => { },
    fetchDevices: () => { },
    t: () => { },
    history: { push: jest.fn() }
}
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));
jest.mock('react-i18next', () => ({
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        t: (str) => str,
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      };
    },
  }));
describe('Landing component', () => {
    it('should load the component without crashing', () => {
        const store = cs()
        const wrapper = testRender(<Dashboard {...dashboardProps} />, { store })
    })

    it('should call the navigate user on click of device counts', () => {
        const store = cs()
        const wrapper = testRender(<Dashboard {...dashboardProps} />, { store })
        wrapper.find('#total').props().onClick();
        const expectedPath = '/mps/devices'

        expect(mockHistoryPush).toHaveBeenCalledWith({ pathname: expectedPath, filter: undefined })

        wrapper.find('#connected').props().onClick();
        expect(mockHistoryPush).toHaveBeenCalledWith({ pathname: expectedPath, filter: 'connected' })


        wrapper.find('#disconnected').props().onClick();
        expect(mockHistoryPush).toHaveBeenCalledWith({ pathname: expectedPath, filter: 'disconnected' })
    })
    afterEach(() => {
        jest.clearAllMocks();
    });
})