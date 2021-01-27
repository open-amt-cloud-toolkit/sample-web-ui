/*********************************************************************
* Copyright (c) Intel Corporation 2020
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React from 'react';
import { mount, shallow } from 'enzyme';
import 'polyfills';
import { Devices } from './devices';
import { DeviceActions } from './flyouts/deviceActionsFlyout';
import { options } from './flyouts/options';
import { Provider } from "react-redux";
import { MemoryRouter } from 'react-router-dom';

import cs from '../../../store/configureStore'
function testRender(jsx, { store, ...otherOpts }) {
    return mount(<MemoryRouter><Provider store={store}>{jsx}</Provider></MemoryRouter>, otherOpts);
}
const fakeProps = {
    sendPowerAction: (params) => { },
    setselectedDevies: (params) => { },
    selectedDevices: [],
    location: {},
    mpsServer: "localhost:9300",
    t: () => { },
    powerActionStatus: []
};

describe('Devices Component', () => {

    const setState = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation((init) => [init, setState]);

    it('Renders without crashing', () => {
        const store = cs()
        // const mockDispatch = jest.fn();
        // jest.mock('react-redux', () => ({
        //     useSelector: jest.fn(),
        //     useDispatch: () => mockDispatch
        // }));

        const wrapper = testRender(<Devices {...fakeProps} />, { store });
    });
    it('test getSelectedDevices() in devices page', () => {
        const store = cs()
        var expectedObj = [{
            host: "777cae70-2c7b-4954-b867-54b2038d3e74",
            amtuser: "admin",
            mpsuser: "xenial",
            icon: 1,
            conn: 1,
            name: "NewNUC2"

        }]

        const wrapper = testRender(<Devices  {...fakeProps} />, { store })
        wrapper.setState({
            selectedDevices: expectedObj
        })
        expect(wrapper.state('selectedDevices').length).toBe(1)
    });

    it('test getOpenFlyout() in devices page', () => {
        const store = cs()
        const wrapper = testRender(<Devices  {...fakeProps} />, { store })
        //wrapper.instance().setopenFlyout('open')

        //expect(wrapper.state('openFlyout')).toEqual('open');
    });

    it('test closeFlyout() in devices page', () => {
        const store = cs()
        const wrapper = testRender(<Devices {...fakeProps} />, { store })
        // wrapper.closeFlyout()
        // expect(setState).toHaveBeenCalled()
        //expect(wrapper.state('openFlyout')).toEqual('');
    });

    it('test methods in devices page', () => {
        const store = cs()
        const wrapper = testRender(<Devices {...fakeProps} />, { store })
        var expectedObj = [{
            host: "777cae70-2c7b-4954-b867-54b2038d3e74",
            amtuser: "admin",
            mpsuser: "xenial",
            icon: 1,
            conn: 1,
            name: "NewNUC2"

        }]
        wrapper.setState({
            selectedDevices: expectedObj
        })
        // expect(typeof wrapper.instance().getSelectedDevices).toBe('function');
        // expect(typeof wrapper.instance().closeFlyout).toBe('function');
        // expect(typeof wrapper.instance().handleSelectedAction).toBe('function');
        // expect(typeof wrapper.instance().handleSelectItem).toBe('function');
        // expect(typeof wrapper.instance().getOpenFlyout).toBe('function');
        // expect(typeof wrapper.state('selectedDevices')).toBe('object');
        // expect(typeof wrapper.state('openFlyout')).toBe('string');
    });

    it('render flyout component without crashing', () => {
        const props = {
            ...fakeProps,
            options
        }
        const wrapper = shallow(<DeviceActions {...props} />)
    })
    it('test selected action', () => {
        const props = {
            ...fakeProps,
            options
        }
        const wrapper = shallow(<DeviceActions {...props} />)
        wrapper.setState({
            selectedAction: 'Power Cycle'
        })
        expect(wrapper.state('selectedAction')).toEqual('Power Cycle')
    })

});
