import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {RouteComponentProps} from 'react-router-dom'
import {observable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'
import moment from 'moment'

import AthleteGeneral from './settings-athlete-general'
//import PaymentInfo from './settings-athlete-payment'
import ManageCoach from './settings-athlete-manage-coach'
import Api from '../api'
import { User, CreditCard } from '../data-types';
import SaveConfirmation from '../components-new/save-confirmation';
import styled from '../styled/styled-components'
import config from '../../../config'
import CancelMembershipConfirmation from '../components/cancel-membership-confirmation'
import viewAllLinkDownArrow from '../../images/view-all-links-down-arrow.png'

import { Provinces, States } from '../utils/provinces'
import {
  PenEditLink,
  ButtonRow,
  CancelBtn,
  PanelContainer,
  PanelTitle,
  PanelMain,
  GradientBtn,
  PanelRowTitle,
  PanelRowValue,
  CheckBox,
  PanelHR,
  PanelField,
  PanelRowSubTitle,
  PanelRowLinkText, PanelP,
} from '../styled/components'

import { MainContentSection } from '../components-new/section'

const PanelMainLeft = styled.div`
  flex: 1;`

const StyledPanelRow = styled.div`
  display: flex;
  font-size: 1.1rem;
  line-height: 2.8rem;`

const DivForStripe = styled.div`
  width: 40%;
  background-color: white;`

const LinkButton = styled.a`
  display: block;
  text-decoration: underline`

const CoachList = styled.div`
  width: 35%;
  margin-left: auto;
  margin-right: auto;`;

const ViewAllLinksButton = styled(PanelRowLinkText)`
  line-height: 1.5rem;
  height: 50px;`;

const ViewAllLinkContainer = styled.div`
  width: 40%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  text-align: center;
  background: url(${viewAllLinkDownArrow}) center center no-repeat;
  background-size: contain;`;

const LinkedAccountEditBackBtn = styled.p`
  cursor: pointer;
  display: table;
  color: #17A6F2;
  font-size: 1.1rem;
  margin-top: 10px;
  margin-bottom: 10px;`;

export const CoachEditHR = styled.hr`
  margin: 2rem auto 2.5rem auto;`;

const CoachEditRootContainer = styled.div``;

const RadioButton = (props: {name: string,
                             isChecked: boolean,
                             value: string,
                             valueId: number,
                             onChange: (e: React.ChangeEvent<HTMLInputElement>, id: number) => void}) =>
  <label className="custom-radio">
    <input type="checkbox" name="permission"
            checked={props.isChecked}
            value={props.value}
            onChange={(e) => props.onChange(e, props.valueId)}/>
    <span className="radio-indicator"></span><span>{props.value}</span>
  </label>



const PanelRow = (props: { title: string, value: string}) =>
  <StyledPanelRow>
    <PanelRowTitle>{props.title}</PanelRowTitle>
    <PanelRowValue>{props.value}</PanelRowValue>
  </StyledPanelRow>

interface PanelProps {
  title: string
  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  noButtons?: boolean
  editing: boolean
  readOnly?: boolean
}

const ButtonRowComponent = (props: any) => (
  <ButtonRow>
    <CancelBtn onClick={props.onCancel}>Cancel</CancelBtn>
    <GradientBtn onClick={props.onSave}
                 data-open="save-confirmation">Save</GradientBtn>
  </ButtonRow>
);

@observer
class Panel extends Component<PanelProps, {}> {
  render() {
    return <PanelContainer>
      <PanelTitle>{this.props.title}</PanelTitle>
      <PanelHR/>
      <PanelMain>
        <PanelMainLeft>
          {this.props.children}
        </PanelMainLeft>
        {this.props.readOnly || this.props.editing ? null : <PenEditLink link='#' onEdit={this.props.onEdit}/>}
      </PanelMain>
      {!this.props.noButtons && this.props.editing ? <ButtonRowComponent {...this.props}/> : null}
    </PanelContainer>
  }
}

interface AccountEditProps {
  user: User
}

@observer
class AccountEdit extends Component<AccountEditProps, {}> {

  @observable nameEdit = this.props.user.first_name + ' ' + this.props.user.last_name
  @observable countryEdit = this.props.user.country
  @observable provinceEdit = this.props.user.province_or_state
  @observable cityEdit = this.props.user.city
  @computed get provinceStateSelection() {
    return 'ca' == this.countryEdit ? Provinces : States;
  }
  onUserNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.nameEdit = ev.target.value;
  }

  onCountryChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    this.countryEdit = ev.target.value;
  }

  onProvinceChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    this.provinceEdit = ev.target.value;
  }

  onCityChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.cityEdit = ev.target.value;
  }

  saveAccountInfo = () => {
    const names = this.nameEdit.split(' ');
    this.props.user.first_name = names[0];
    this.props.user.last_name = names.slice(1).join(' ');
    this.props.user.country = this.countryEdit;
    this.props.user.province_or_state = this.provinceEdit;
    this.props.user.city = this.cityEdit;

    return Api.updateUser(this.props.user);
  }

  render() {
    return <div>
      <PanelField title="Name"
                  value={this.nameEdit}
                  type="text"
                  onChange={this.onUserNameChange} />
      <PanelField title="Country"
                  value={this.countryEdit}
                  type="select"
                  selection={[['ca', 'Canada'], ['us', 'US']]}
                  onChange={this.onCountryChange} />
      <PanelField title="Province / State"
                  value={this.nameEdit}
                  type="select"
                  selection={this.provinceStateSelection}
                  onChange={this.onProvinceChange} />
      <PanelField title="City"
                  value={this.cityEdit}
                  type="text"
                  onChange={this.onCityChange} />
    </div>
  }
}

const AccountInfo = (props: {user: User}) =>
  <div>
    <PanelRow title="Name" value={props.user.first_name + ' ' + props.user.last_name}/>
    <PanelRow title="Country" value={props.user.country}/>
    <PanelRow title="Province / State" value={props.user.province_or_state}/>
    <PanelRow title="City" value={props.user.city}/>
  </div>

interface CoachEditProps {
  coach: any
  cancelEdit: () => void
}

@observer
class CoachEdit extends Component<CoachEditProps, {}> {

  @observable permissions = [] as any[]
  @observable coachLinked = true

  componentDidMount() {
    Api.getPermissionSetting(this.props.coach.id)
        .then(result => {
          this.permissions = result;
        })
        .catch(err => console.log(err));
  }

  setPermission = (evt: React.ChangeEvent<HTMLInputElement>, i?: number) => {

    const permission = this.permissions.find(p => p.assessment_top_category_id == i);

    permission.assessor_has_access = evt.target.checked;
  }

  saveCoach = () => {
    Api.updatePermissions(this.props.coach.id, this.permissions)
      .then(_ => {

      })
      .catch((err: any) => {
        console.log('err: ', err);
      });
  }

  unlinkCoach = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    Api.unlinkUser(this.props.coach.email)
      .then(() => {
        this.cancelEdit();
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  cancelEdit = () => {
    this.props.cancelEdit();
  }

  render() {
    const subTitle = this.props.coach.first_name + ' ' + this.props.coach.last_name;
    const permissions = this.permissions.map(p =>
      <CheckBox title={p.assessment_top_category_name}
                checked={p.assessor_has_access}
                valueId={p.assessment_top_category_id}
                key={p.id}
                onChange={this.setPermission} />);

    return <CoachEditRootContainer>
        <LinkedAccountEditBackBtn onClick={this.cancelEdit}>
          {'< back'}
        </LinkedAccountEditBackBtn>
        <PanelRowSubTitle>{subTitle}:</PanelRowSubTitle>
        <form>
          <fieldset>
            <PanelP>
              Manage Permissions
              <br/>
              This coach is currently linked to the following features of your PSR account.
              You can edit what they can control here.
            </PanelP>
            {permissions}
          </fieldset>
          <ButtonRowComponent {...this.props}/>
          <CoachEditHR/>
          <PanelRowSubTitle>
            Unlink coach account
          </PanelRowSubTitle>
          <PanelP className="dark-text">Unlinking a coach's account will remove them from your PSR account. You will however keep all assessments done by them.</PanelP>
          <div style={{ display: 'table', float: 'right'}}>
            <PanelRowLinkText href='#' onClick={this.unlinkCoach}>
              Unlink account
            </PanelRowLinkText>
          </div>
        </form>
      </CoachEditRootContainer>
  }
}

interface ManageLinkedAccountProps {
  user: User
}

@observer
class ManageLinkedAccount extends Component<ManageLinkedAccountProps, {}> {

  @observable curCoach: any = undefined

  editCoach = (e: any, c: any) => {
    e.preventDefault();
    this.curCoach = c;
  }

  cancelEdit = () => {
    this.curCoach = undefined;
  }

  saveCoach = () => {
    this.curCoach = undefined;
  }

  renderCoachList = (coaches: any, organisations: any[]) => (
    <div>
      <p>Click on each individual account to edit permissions and/or unlink from them</p>
      <PanelRowSubTitle>Coaches:</PanelRowSubTitle>
      <CoachList>
        {coaches.map((c: any, i: number) =>
          <PanelRowLinkText
            href='#'
            onClick={(e) => this.editCoach(e, c)}
            key={i}>
            {c.first_name + ' ' + c.last_name}
          </PanelRowLinkText>)}
      </CoachList>
      <PanelRowSubTitle>Organisations:</PanelRowSubTitle>
      <CoachList>
        {organisations.map((c, i) =>
          <PanelRowLinkText href='#'
                            onClick={(e) => this.editCoach(e, c)}
                            key={i}>
            {c.name}
          </PanelRowLinkText>)}
      </CoachList>
      <ViewAllLinkContainer>
        <ViewAllLinksButton>View All Linked Accounts</ViewAllLinksButton>
      </ViewAllLinkContainer>
    </div>
  );

  render() {
    const coaches = this.props.user.linked_users;
    const { organisations } = this.props.user;

    return <Panel title='Manage Linked Accounts'
                  onSave={this.saveCoach}
                  noButtons={true}
                  readOnly={true}
                  editing={this.curCoach != undefined}>
      {this.curCoach ?
        <CoachEdit coach={this.curCoach}
                   cancelEdit={this.cancelEdit}/>
        : 
        <div>
          <p>Click on each individual account to edit permissions and/or unlink from them</p>
          <h6>Coaches:</h6>
            <CoachList>
              {coaches.map((c, i) =>
                <LinkButton href='#'
                            onClick={(e) => this.editCoach(e, c)}
                            key={i}>
                  {c.first_name + ' ' + c.last_name}
                </LinkButton>)}
            </CoachList>
          <h6>Organizations:</h6>
          <CoachList>
              {organisations.map((c, i) =>
                <LinkButton href='#'
                            onClick={(e) => this.editCoach(e, c)}
                            key={i}>
                  {c.name}
                </LinkButton>)}
            </CoachList>
          <ViewAllLinkContainer>
            <ViewAllLinksButton>View All Linked Accounts</ViewAllLinksButton>
          </ViewAllLinkContainer>
        </div>}
    </Panel>
  }
}

interface PaymentEditProps {
  card: CreditCard
}

@observer
class PaymentEdit extends Component<PaymentEditProps, {}> {

  stripe: any
  elemCardNumber: any
  elemCardExpiry: any
  elemCardPostalCode: any
  @observable creditCardEdit = {nameOnCard: this.props.card.cardholder_name || '',
                                cardNumber: "●".repeat(12) + this.props.card.last4,
                                expiryMonth: this.props.card.exp_month,
                                expiryYear: this.props.card.exp_year,
                                billingAddress: this.props.card.address_line1 || '',
                                billingCity: this.props.card.address_city || '',
                                billingProvince: this.props.card.address_state || '',
                                billingPostalCode: this.props.card.address_zip}

  @computed get yearOptions() {
    const ret = [];
    for (let i = 0; i < 20; i++) {
      ret.push(moment().year(moment().year() + i).format('YY'));
    }
    return ret;
  }

  componentDidMount() {
    const Stripe:any = (window as any).Stripe;
    this.stripe = Stripe(config.stripe_key);
    const elements = this.stripe.elements();
    const options = {
      placeholder: this.creditCardEdit.cardNumber,
      style: {
        base: {
          fontSize: '1.15rem',
          color: '#003059',
          lineHeight: '39px',
          '::placeholder': {
            color: '#cacaca',
            fontWeight: 300
          },
        }
      }
    }
    this.elemCardNumber = elements.create('cardNumber', options);
    this.elemCardNumber.mount('#card-number');
    this.elemCardExpiry = elements.create('cardExpiry', options);
    this.elemCardExpiry.mount('#card-expiry');
    this.elemCardExpiry.update({placeholder: this.props.card.exp_month + '/' +
                                             this.props.card.exp_year.substring(2) });
    this.elemCardPostalCode = elements.create('postalCode', options);
    this.elemCardPostalCode.mount('#card-zip');
    this.elemCardPostalCode.update({placeholder: this.props.card.address_zip})
  }

  nameOnCardChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.creditCardEdit.nameOnCard = evt.target.value;
  }

  cardNumberChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.creditCardEdit.cardNumber = evt.target.value;
  }

  expiryMonthChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.creditCardEdit.expiryMonth = evt.target.value;
  }

  expiryYearChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.creditCardEdit.expiryYear = evt.target.value;
  }

  billingProvinceChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.creditCardEdit.billingProvince = evt.target.value;
  }

  billingAddressChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.creditCardEdit.billingAddress = evt.target.value;
  }

  billingCityChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.creditCardEdit.billingCity = evt.target.value;
  }

  billingPostalCodeChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.creditCardEdit.billingPostalCode = evt.target.value;
  }

  submitPaymentInfo = (plan: string) => {
    return this.stripe.createToken(this.elemCardNumber,
                                   { name: this.creditCardEdit.nameOnCard })
             .then((result: any) => {
               if (!result.error) {
                 return Api.sendPaymentInfo(result.token.id, plan);
               } else {
                 throw result.error;
               }
             })
             .then((result: any) => {
               console.log(result);
             })
             .catch((e: any) => console.log(e));
  }

  render() {
    return <div>
      <p>Credit Card Information</p>
      <PanelField title='Name on card'
                  type='text'
                  value={this.creditCardEdit.nameOnCard}
                  onChange={this.nameOnCardChange}/>
      <PanelRowTitle>Card Number:</PanelRowTitle>
      <DivForStripe id='card-number'
                    style={{borderBottomWidth: 0}}/>
      <PanelRowTitle>Expiry month / year:</PanelRowTitle>
      <DivForStripe id='card-expiry'
                    style={{borderBottomWidth: 0}}/>
      <p>Billing Information</p>
      <PanelField title='Address'
                  type='text'
                  value={this.creditCardEdit.billingAddress}
                  onChange={this.billingAddressChange}/>
      <PanelField title='City'
                  type='text'
                  value={this.creditCardEdit.billingCity}
                  onChange={this.billingCityChange}/>
      <PanelField title='Province'
                  value={this.creditCardEdit.billingProvince}
                  type='select'
                  selection={Provinces.concat(States)}
                  onChange={this.billingProvinceChange}/>
      <PanelRowTitle>Zip / Postal Code:</PanelRowTitle>
      <DivForStripe id='card-zip'
                    style={{borderBottomWidth: 0}}/>
    </div>
  }
}

const PaymentInfo = (props: {card: CreditCard}) =>
  <div>
    <PanelRow title='Name on card'
              value={props.card.cardholder_name}/>
    <PanelRow title='Type'
              value={(props.card.brand || 'Unknow card type') + ' - ' +
                     props.card.last4}/>
    <PanelRow title='Expiry date'
              value={props.card.exp_month + '/' +
                     props.card.exp_year.substr(2)}/>
  </div>

interface SettingsProps extends RouteComponentProps<{}>{
  user: User
  setUser: (user: User) => void
}

@inject('user', 'setUser')
@observer
class SettingsAthlete extends Component<SettingsProps, {}> {

  paymentEdit: any
  accountEdit: any
  @observable curComp: React.ReactInstance | undefined
  @computed get athlete() { return this.props.user; }
  @observable curCoach: User | undefined
  @observable creditCard: CreditCard = {cardholder_name: '',
                                        exp_month: '',
                                        exp_year: '',
                                        last4: '0000'}
  @observable permissions = []
  @observable editingAccount = false
  @observable editingMeasuringUnit = false
  @observable measuringUnitEdit = this.athlete.measuring_system
  @observable editingPaymentInfo = false


  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();

    this.curComp = this.refs.general;

    this.getCreditCardInfo();
  }

  getCreditCardInfo = () => {

    Api.getCreditCardInfo()
      .then(creditCard => {
        this.creditCard = creditCard;
      })
      .catch(err => console.log(err));

    Api.getPaymentPlan()
      .then(plan => {
        this.props.user.paymentPlan = plan.plan;
      })
      .catch(err => console.log(err));
  }

  showComp(comp: string, coach?: User) {

    this.curComp = this.refs[comp];
    $('body').scrollTop(0);

    if ('manageCoach' == comp) {
      Api.getPermissionSetting(coach!.id)
        .then(result => {
          this.permissions = result;
        })
        .catch(err => console.log(err));
    }
  }

  saveConfirmation = () => {
    const sc = this.refs.saveConfirmation as SaveConfirmation;
    sc.showConfirmation();
  }

  showApiError = () => {
    const sc = this.refs.saveConfirmation as SaveConfirmation;
    sc.showApiError();
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  editAccount = () => {
    this.editingAccount = true;
  }


  onMeasuringUnitChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.measuringUnitEdit = evt.target.value;
  }

  saveMeasuringUnit = () => {
    this.props.user.measuring_system = this.measuringUnitEdit;
    Api.updateUser(this.props.user)
      .then(_ => {
        this.saveConfirmation();
      })
      .catch(err => {
        console.log(err);
      });
    this.editingMeasuringUnit = false;
  }

  saveAccountInfo = () => {
    this.accountEdit.saveAccountInfo()
      .then(() => {
        this.editingAccount = false;
        this.saveConfirmation();
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  savePaymentInfo = () => {
    this.paymentEdit.submitPaymentInfo(this.props.user.paymentPlan)
      .then((result: any) => {
        console.log(result);
        this.saveConfirmation();
        this.editingPaymentInfo = false;
        this.getCreditCardInfo();
      })
      .catch((err: any) => {
        console.log(err);
        this.showApiError();
      })
  }

  showConfirmCancelMembership = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    $('#cancel-membership-confirmation').foundation('open');
  }

  render() {
    const {first_name, last_name, country, province_or_state, city } = this.props.user;
    return (
      <MainContentSection className='coach'>
        <Panel title="Account Information"
               editing={this.editingAccount}
               onSave={this.saveAccountInfo}
               onCancel={() => this.editingAccount = false}
               onEdit={this.editAccount}>
          {this.editingAccount ?
            <AccountEdit ref={r => this.accountEdit = r}
                         user={this.props.user}/>
            :
            <AccountInfo user={this.props.user}/>}
        </Panel>
        <Panel title="Preferences"
               editing={this.editingMeasuringUnit}
               onSave={this.saveMeasuringUnit}
               onCancel={() => this.editingMeasuringUnit = false}
               onEdit={() => this.editingMeasuringUnit = true}>
          {this.editingMeasuringUnit ?
            <PanelField title="Measuring system"
                        value={this.measuringUnitEdit}
                        type="radio"
                        selection={[['metric', 'Metric'], ['imperial', 'Imperial']]}
                        onChange={this.onMeasuringUnitChange}/>
            :
            <PanelRow title="Measuring system"
                      value={this.props.user.measuring_system}/>}
        </Panel>
        <ManageLinkedAccount user={this.props.user}/>
        <Panel title="Payment Information"
               editing={this.editingPaymentInfo}
               onSave={this.savePaymentInfo}
               onCancel={() => this.editingPaymentInfo = false}
               onEdit={() => this.editingPaymentInfo = true}>
          {this.editingPaymentInfo ?
            <PaymentEdit card={this.creditCard}
                         ref={r => this.paymentEdit = r}/>
            :
            <PaymentInfo card={this.creditCard}/>
          }
        </Panel>
        <PanelContainer>
          <PanelTitle>Cancel Membership</PanelTitle>
          <PanelHR/>
          <PanelMain>
            <PanelMainLeft>
              <p>If you wish to cancel your memebership click cancel on the right</p>
            </PanelMainLeft>
            <LinkButton href='#' onClick={this.showConfirmCancelMembership}>
              cancel
            </LinkButton>
          </PanelMain>
        </PanelContainer>
        <SaveConfirmation userType="athlete"
          msg="Your change has been saved successfully."
          apiMsg="Sorry we have problem handling your request, please try again later."
          ref="saveConfirmation"/>
        <CancelMembershipConfirmation userType={this.props.user.user_type}
                                      history={this.props.history}/>
      </MainContentSection>
    )
  }
}

export default SettingsAthlete
