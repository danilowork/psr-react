import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'

class SignupConfirmation extends Component {

  constructor() {
    super();
    this.onClose = this.onClose.bind(this);
  }

  openModal() {
    $(ReactDOM.findDOMNode(this.refs.signupConfirmation)).css("display", "flex").hide().fadeIn();
  }

  showConfirmation() {
    $(ReactDOM.findDOMNode(this.refs.spinner)).fadeOut(() =>
      $(ReactDOM.findDOMNode(this.refs.confirmationContent)).fadeIn())
  }

  onClose(e) {
    e.preventDefault();
    this.props.onNext();
  }

  renderMessage = () => {
    if (this.props.userType !== 'organisation') {
      return <p>Now that you’ve scored that first goal, give 100% finishing up your profile.</p>;
    }
    return (
      <div>
        <p>You have successfully applied to be a Personal Sport Record organisation. We will email you to the email
            provided a set of instructions with next steps.</p>
        <p>Thank you for your interest in being a part of the Personal Sport Record family.</p>
      </div>
    );
  };

  render() {
    const nextUrl = this.props.userType === 'organisation' ? '/' : '/profile';
    const btnTxt = this.props.userType === 'organisation' ? 'Ok' : "Let's go";
    const title = {
      'athlete': 'Thank you',
      'coach': 'Account Created!',
      'organisation': 'Success!',
    }[this.props.userType];

    return (
      <div className="confirmation confirmation-lg signup-confirmation text-center align-center"
           ref="signupConfirmation">
        <div className="content-box">
          <div className="spinner" ref="spinner">
            <span className="psr-icons icon-spinner"/>
          </div>
          <div className="confirmation-content" ref="confirmationContent">
            <Link to={nextUrl}
                  className="close-button"
                  aria-label="Close" >
              <span aria-hidden="true" className="psr-icons icon-x"/>
            </Link>
            <div className="tick-wrap"><span className="psr-icons icon-tick-thin"/></div>
            <h5>{title}</h5>

            {'athlete' === this.props.userType && this.props.user && this.props.user.payment_status !== 'not_needed' ?
              <p>Your payment has been completed and your receipt has been emailed to you.</p> : null
            }

            {this.renderMessage()}
            <Link to={nextUrl}
                  className="button theme"
                  >{btnTxt}</Link>
          </div>
        </div>
      </div>
    )
  }
}

export default SignupConfirmation
