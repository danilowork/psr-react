import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, toJS, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import Api from '../api'

export default inject('user', 'setUser')(observer(class extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { testing:''

                     });
  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  render() {


    //console.log(this.age + ' yrs old');
    return (

            <div className="row align-center main-content-container">
              <div className="column content-column">
             

                <div className="group-section">
                   
 
                  <h2 className="group-heading">Tell Someone.</h2>
                    <p>Your safety is our #1 priority. If there is ever a time when a team mate, support staff or coach verbally (uses words), physically (uses 
                    force or contact) or sexually (using inappropriate contact) hurts you, we want you to tell us so we can help 
                    you. Simply fill in this form describing what has happened and we will take it from there. You don’t even have 
                    to include your name. The form can be completely anonymous. We do need a description of the events and the 
                    names of the personal / people so we may bring your hurt to a quick end.</p>

                  <Link to="/help-center/form" className="button theme">
                    <span className="btn-text">Complete Form</span>
                  </Link>

                </div>
                <div className="group-section">
                    <h2 className="group-heading">Need Help?</h2>


                    <div className="help-contacts">
                      <div>
                        <Link to="http://personalsportrecord.com/wp/faq" target="_blank">
                            <span className="icon-visit"></span> Visit our FAQ’s</Link>
                      </div>
                      <div>
                        <Link to="tel:16042181716">
                            <span className="icon-phone"></span> 1 604 218 1716</Link>
                      </div>
                      <div>
                        <Link to="mailto:support@personalsportrecord.com">
                            <span className="icon-mail"></span> support@personalsportrecord.com</Link>
                      </div>
                    </div>
              

                </div>


              
              </div>
            </div>

    )
  }
}))