import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import Select from '../components/select'

//import CountryProvince from '../components/country-province'
import Api from '../api'
import Terms from './terms'

class SignupPersonalInfo extends Component {

  constructor() {
    super();
    this.appState = extendObservable(this,
      {
        sports: [''],
        extraFields: [],
        numExtra: computed(() => {
          return this.extraFields.length;
        }),
        termsCondsAccepted: false,
        duplicatedEmail: false,
        clTermsConds: '',
        user: {
          user_type: '',
          organisation_name: '',//org_name
          size: null,
          first_name: '',//contact_name
          email: '',
          phone: '',//need
          description: '',//need
          country: 'ca',
          //province_or_state: '',
          //city: '',
          sports: '',//csv text string
          newsletter: false,
          terms_conditions: false
        },
        termsResolver: null,
        curSize: '',
        curSizeIndex: computed(() => {
          return this.sizeChoices.findIndex(c => c == this.curSize)
        }),
      });

    this.sizeChoices = ['1-5', '6-50', '51-500', '501-1000', '1001+'];

    this.onTermsConditionsAccepted = this.onTermsConditionsAccepted.bind(this);
    this.proceedToNext = this.proceedToNext.bind(this);
  }

  componentDidMount() {
    this.user.user_type = this.props.userType;

    $(ReactDOM.findDOMNode(this.refs.me)).foundation();


    $(ReactDOM.findDOMNode(this.refs.info_form))
      .on("forminvalid.zf.abide", (ev, frm) => {
        console.log('forminvalid');
        //this.refs.countryProvince.validate();
        if (!this.appState.termsCondsAccepted) {
          this.clTermsConds = ' is-visible';
        }
        this.scrollToError();
      })
      .on("formvalid.zf.abide", (ev, frm) => {
        console.log('formvalid');
        /*
        if(this.dobText == 'm/d/yyyy') {
          this.dobValid = false;
        }*/

        //if (this.dobValid && this.refs.countryProvince.validate()) {
        if (this.termsCondsAccepted) {

          this.proceedToNext();
        } else {
          this.openTermsCondidtion()
            .then(this.proceedToNext);
        }
        //}
      })
      .on("submit", ev => {
        console.log('submit');
        ev.preventDefault();
      });
  }

  scrollToError = () => {
    const errorField = $('.form-error.is-visible, .api-error.is-visible')[0];

    let scrollContainer;
    if ($(window).width() >= 1024) {
      scrollContainer = $('.transition-container');
    } else {
      scrollContainer = $('.content');
    }
  };

  onTermsConditionsAccepted() {

    this.appState.termsCondsAccepted = true;
    this.user.terms_conditions = true;
    this.appState.clTermsConds = '';
    if (this.termsResolver) this.termsResolver();
  }

  openTermsCondidtion() {

    $("#terms").foundation('open');
    return new Promise((res, rej) => {
      this.termsResolver = res;
    });
  }

  proceedToNext() {
    console.log('proceed to next');
    Api.createUser(this.user)
      .then(user => {
        if (user.id) {
          this.props.onNext(user);
        }
        this.props.setUser(null);
        this.duplicatedEmail = false;
      })
      .catch(e => {
        const errObj = JSON.parse(e.responseText);

        if (errObj && errObj.email) {
          this.duplicatedEmail = true;
          this.scrollToError();
        }
        // console.log('error', e);
      });
  }

  show() {
    $(ReactDOM.findDOMNode(this.refs.me)).addClass('active').outerWidth();
    $(ReactDOM.findDOMNode(this.refs.me)).addClass('fade-in');
  }

  hide() {
    const self = $(ReactDOM.findDOMNode(this.refs.me));
    self.removeClass('fade-in').one('transitionend', () => self.removeClass('active'))
  }

  setOrganisationSize = size => {

    //set the size displayed in the fake select
    this.curSize = size;

    console.log(this.curSize);
    /* set the value to be sent to the api
    ORGANISATION SIZES OPTIONS
        0 - '1-5'
        1 - '6-50'
        2 - '51-500'
        3 - '501-1000'
        4 - '1001+'
        */
    this.user.size = this.curSizeIndex;
  };

  setCountry = country => {
    this.user.country = 'Canada' == country ? 'ca' : 'us';
  };

  /*
    setProvince = province => {

      this.user.province_or_state = province;
    }

    setCity = e => {

      this.user.city = e.target.value;
    }
  */
  updateSport = (sport, index) => {
    this.sports[index] = sport;

    if (index > 1) {
      this.refs['sport' + index].value = sport;

    }

    this.user.sports = this.sports;
  };

  addSportFields = () => {
    const curIndex = this.numExtra + 1;

    this.sports.push('');
    this.extraFields.push(<label key={curIndex}>Sport
      <input type="text" placeholder=""
             ref={i => {
               this.refs['sport' + curIndex] = i;
             }}
             onChange={e => {
               this.updateSport(e.target.value, curIndex)
             }}/>
      <span className="form-error">Please enter a valid email address.</span>
    </label>);
  };

  render() {
    return (
      <div className="tab-content" ref="me">
        <div className="row align-center main-content-container">
          <div className="column large-6 content-box">
            <p>
              Signing up for an organisation is a great way of overseeing the teams and athletes that are part of it. It
              is also a great way of keeping everything in one place, making it easier to manage. Oh, and did we mention
              you can have assessments that are unique to the sport your organisation supports? Yep, you can.
            </p>

            <form data-abide noValidate ref='info_form'>
              <h2 className="section-heading">Application Form</h2>
              <p className="api-error label">There is error in your form.</p>

              <label>Organisation Name
                <input type="text" placeholder="Organisation Name" required tabIndex="1"
                       onChange={e => {
                         this.appState.user.organisation_name = e.target.value
                       }}/>
                <span className="form-error">This field is required.</span>
              </label>

              <Select placeholder="select"
                      title="Organisation size"
                      choices={this.sizeChoices}
                      ref={r => this.sizeSelect = r}
                      onSelected={this.setOrganisationSize}
                      index={this.curSizeIndex}
              />


              <label>Contact Name
                <input type="text" placeholder="Contact Name" required tabIndex="2"
                       onChange={e => {
                         this.appState.user.first_name = e.target.value
                       }}/>
                <span className="form-error">This field is required.</span>
              </label>

              <label>Contact Email
                <input type="email" placeholder="name@mail.com" required tabIndex="3"
                       onChange={e => {
                         this.appState.user.email = e.target.value
                       }}/>
                <span className="form-error">Please enter a valid email.</span>
                <span
                  className={"api-error " + (this.duplicatedEmail ? "is-visible" : "")}>This email already exists.</span>
              </label>

              <label>Contact Phone
                <input type="text" placeholder="" required tabIndex="4"
                       onChange={e => {
                         this.appState.user.phone = e.target.value
                       }}/>
                <span className="form-error">Please enter a valid phone number.</span>
              </label>


              <Select placeholder="select"
                      title="Country"
                      choices={['Canada', 'US']}
                      ref={r => this.countrySelect = r}
                      onSelected={this.setCountry}
                      index={this.user.country == 'ca' ? 0 : 1}
                      tabIndex="5"
              />


              <label>Tell us a little bit about your organisation
                <textarea placeholder="Start typing..." required tabIndex="6"
                          rows="6" onChange={e => {
                  this.appState.user.description = e.target.value
                }}></textarea>
              </label>


              {/*
              <label>City
                <input type="text" tabIndex="7"
                       placeholder="vancouver"
                       onChange={this.setCity} required/>
                <span className="form-error"> This field is required.</span>
              </label>
            */}
              <label>Which sport will your organisation support?
                <input type="text"
                       placeholder=""
                       required
                       value={this.sports[0]}
                       onChange={e => {
                         this.updateSport(e.target.value, 0)
                       }}/>
                <span className="form-error">Please enter a sport.</span>
              </label>
              {this.extraFields}
              <div className="add-wrap signup-organisation-add-sport" onClick={this.addSportFields}>
                <span className="psr-icons icon-add"></span>
                <span>Add another sport</span>
              </div>


              <label className="custom-checkbox">
                <input type="checkbox" tabIndex="8"
                       onChange={e => {
                         this.appState.user.newsletter = 'on' == e.target.value ? true : false
                       }}/>
                <span className="checkbox-indicator"></span>
                <span>Sign up to our newsletter</span>
              </label>
              <label className="custom-checkbox">
                <span className="label-text">I agree to the <Link to="#" className="link-text" data-open="terms">Terms & Conditions</Link></span>
                <span className={"form-error" + this.appState.clTermsConds}>
                  Please read and accept the Terms and Conditions.
                </span>
              </label>
              <button type="submit" className="button expanded theme" value="Next" tabIndex="9">
                Next
              </button>
            </form>
            <p className="page-link">Already have an account? <Link to="/login" className="link-text">Log in</Link></p>
          </div>
          <Terms userType={this.user.user_type} onAccept={this.onTermsConditionsAccepted}/>
        </div>
      </div>
    )
  }
}

export default inject('user', 'setUser')(observer(SignupPersonalInfo))
