/*********************************************************************
* Copyright (c) Intel Corporation 2020
* SPDX-License-Identifier: Apache-2.0
**********************************************************************/
import React, { useState, useCallback, useEffect } from 'react';
import { AjaxError, Btn, FormSection, SectionHeader, FormControl, FormGroup } from 'components/shared';
import './login.scss';
import { useTranslation } from 'react-i18next';
import { LinkedComponent, Validator } from 'utilities';
import LogoPath from 'assets/images/react-logo.png';
import { Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { epics as authEpics, getLoggedInStatus, getLoginError } from 'store/reducers/authReducer'

export function Login(props) {
  const { t } = useTranslation();
  const [userName, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const isLoggedIn = useSelector((state) => getLoggedInStatus(state) || JSON.parse(window.sessionStorage.getItem('loggedIn')))
  const error = useSelector((state) => getLoginError(state))
  const userLogin = useCallback(
    formValues => dispatch(authEpics.actions.userLogin(formValues)),
    [dispatch]
  )

  // constructor(props) {

  //useEffect(() => {
    this.userNameLink = this.linkTo('userName')
      .check(Validator.notEmpty, () => 'Please enter your user name');
  //})


    this.passwordLink = this.linkTo('password')
      .check(Validator.notEmpty, () => 'Please enter your password');
  //}

  // componentDidUpdate = (prevProps, prevState) => {
  //   if (this.props.isLoggedIn !== prevProps.isLoggedIn) {
  //     this.props.history.push('/landing');
  //   }
  // }

  const handleSubmit = event => {
    event.preventDefault();
    this.props.userLogin(this.state);
  }

  const handleChange = event => {
    event.preventDefault();
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  const formIsValid = () => {
    return [this.userNameLink, this.passwordLink].every(link => !link.error)
  }

  const clearAll = () => {
    setUsername('')
    setPassword('')
  }

  return (<React.Fragment>
    {isLoggedIn && <Redirect to='/landing' />}
    <form className="login-form-container" onSubmit={handleSubmit}>
      <div className="logo-container">
        <img src={LogoPath} alt="not avaliable" />
      </div>
      {error && <AjaxError error={error} t={t} />}
      <FormSection>

        <SectionHeader>{t('user.login.heading')}</SectionHeader>
        <FormGroup>
          <FormControl id="userName" type="text" className="long login-input" link={this.userNameLink}
            placeholder={t('user.login.userName')} value={userName} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <FormControl
            id='password'
            type="password"
            className="long login-input"
            placeholder={t('user.login.password')}
            link={this.passwordLink}
            value={password}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup className='btn-display'>
          <Btn className="login-btn" primary={true} disabled={!formIsValid()} type='submit' >{t('user.login.signIn')} </Btn>
          <Btn className='login-btn' primary={true} onClick={clearAll}>
            {t('user.login.cancel')}
          </Btn>
        </FormGroup>
      </FormSection></form>
  </React.Fragment>)

}
