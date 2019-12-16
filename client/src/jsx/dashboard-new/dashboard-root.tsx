import React, {Component} from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { observer, inject } from 'mobx-react'

import { User } from '../data-types'

interface DashboardRootProps extends RouteComponentProps<{}>{
  user: User
}

@inject('user')
@observer
class DashboardRoot extends Component<DashboardRootProps, {}> {

  componentDidMount() {
    if ('athlete' === this.props.user.user_type) {
      this.props.history.push('/dashboard/my-status');
    } else if ('organisation' === this.props.user.user_type) {
      this.props.history.push('/dashboard/organisation-teams');
    } else {
      this.props.history.push('/dashboard/directory');
    }
  }

  render() {
    return null;
  }
}
export default DashboardRoot;