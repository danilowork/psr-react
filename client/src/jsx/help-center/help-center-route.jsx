import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Route, Switch, Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'
import { CSSTransitionGroup } from 'react-transition-group'

import Api from '../api'

import HelpCenterInfo from './help-center-info'
import HelpCenterForm from './help-center'

import Header from '../components/header'
import Sidebar from '../components/sidebar'
import Footer from '../components/footer'



export default inject('user', 'setUser')(observer(class extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { user: computed(() => this.props.user) });
  }

  componentWillMount() {
    $('.reveal-overlay').remove();

    //this.checkRoute();
    this.props.history.push('/help-center');
  }

  componentDidMount() {
    if(!this.props.user) {
      Api.getUser()
        .then(user => {
          this.props.setUser(user);
        })
        .catch(err => this.props.history.push('/login'));
    } else {

    }

  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  render() {

    return (
      <div className={"content-container help-center " + (this.user ? this.user.user_type : "")}>
        <div className="row expanded">
          <div className="column show-for-large sidebar-container">
            <Sidebar curActive="HelpCenter" history={this.props.history}/>
          </div>

          <div className="column content-right">
            <Header pageTitle="Help Center" curActive="HelpCenter" history={this.props.history} showProfile={true}/>

            
              <Route render={({location}) => {

                console.log(location);
                  return (


                    <CSSTransitionGroup className="transition-container"
                                        transitionName='dashboard-transition'
                                        transitionEnterTimeout={500}
                                        transitionLeaveTimeout={300} >
                      <Switch key={location.pathname} location={location}>
                        <Route exact path='/help-center' component={HelpCenterInfo} />
                        <Route exact path='/help-center/form' component={HelpCenterForm} />
                       </Switch>
                     </CSSTransitionGroup>
                  )}} />

          

          </div>

        </div>
        <Footer />
      </div>
    )
  }
}))
