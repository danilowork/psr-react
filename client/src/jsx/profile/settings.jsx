import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import Api from '../api'

export default inject('user', 'setUser')(observer(class extends Component {

  constructor() {
    super();
    extendObservable(this, {
      user: computed(() => this.props.user),
    });
  }

  componentDidMount() {
    if (!this.props.user) {
      Api.getUser()
        .then(user => {
          this.props.setUser(user);
          this.props.history.push(`/settings/${this.user.user_type}`);
        })
        .catch(err => this.props.history.push('/login'));
    } else {
      this.props.history.push(`/settings/${this.user.user_type}`);
    }
  }

  render() {
    return null;
  }
}))
