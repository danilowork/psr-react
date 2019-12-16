import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link, RouteComponentProps} from 'react-router-dom'
import {observable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import Api from './api'
import {User} from './data-types'

interface HomeProps extends RouteComponentProps<{}> {
  user: User
}

@observer
class Home extends Component<HomeProps, {}> {

  componentDidMount() {
    if ('athlete' == this.props.user.user_type) {
      this.props.history.push('/profile');
    } else {
      this.props.history.push('/dashboard/directory');
    }
  }

  render() {
    return null;
  }
}

export default inject('user')(Home)
