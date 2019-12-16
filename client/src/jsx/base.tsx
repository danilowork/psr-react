import React, {Component} from 'react';
import {Link, withRouter, RouteComponentProps} from 'react-router-dom';
import {computed, extendObservable} from 'mobx';
import {inject, observer} from 'mobx-react';

import {stringStartsWith} from './utils/utils';

interface BaseProps extends RouteComponentProps<{}>{
  user?: any
}

@observer
class Base extends Component<BaseProps, {}> {

  @computed get user() { return this.props.user; }

  componentDidUpdate() {
    this.checkAthleteCreditCard(this.user);
  }

  checkAthleteCreditCard(user: any) {
    const pathname = this.props.location.pathname;

    if (user &&
        user.user_type === 'athlete' &&
        user.payment_status === 'no_card' &&
        !stringStartsWith(pathname, '/signup/') &&
        !stringStartsWith(pathname, '/login') &&
        !stringStartsWith(pathname, '/logout')) {
      this.props.history!.push('/logout');
    }
  }

  render() {
    return this.props.children || null;
  }
}

export default inject('user')(Base)