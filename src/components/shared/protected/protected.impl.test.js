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

import { Protected } from './protected.impl'
import { Profiles } from '../../pages/profiles/profiles'

function testRender(jsx, { store, ...otherOpts }) {
    return mount(<MemoryRouter><Provider store={store}>{jsx}</Provider></MemoryRouter>, otherOpts);
}
describe('Test Protected component', () => {
    it('should render the component without crashing', () => {
        const store = cs()
        const wrapper = testRender(<Protected />, { store });
        console.log(wrapper.debug())
        expect(wrapper.find('Redirect')).toHaveLength(1)
    })

    // it('should render the RPS component when rps flag is enabled', () => {
    //     const store = cs()
    //     const protectedProps = {
    //         component: Profiles
    //     }
    //     const wrapper = testRender(<Protected {...protectedProps} />, { store });
    //     expect(wrapper.find('Profiles')).toHaveLength(1)
    // })

})