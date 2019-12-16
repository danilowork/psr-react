import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { RouteComponentProps } from 'react-router-dom'
import {extendObservable, computed, observable} from 'mobx'
import {observer, inject} from 'mobx-react'

import UtilBar from '../components/util-bar'
import ProfileForm from '../components-new/profile-form'
import SaveConfirmation from '../components-new/save-confirmation'
import { User } from '../data-types';

interface EditProfileProps extends RouteComponentProps<{}> {
  user?: User
}

@inject('user')
@observer
class EditProfile extends Component<EditProfileProps, {}> {

  private saveConfirmation: any;

  constructor(props: any) {
    super(props);
    this.saveConfirmation = null;
  }

  @observable goal: any

  componentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)!).foundation();
  }

  onSave = () => {
    $('#profile-form').submit();
  }

  onCancel = () => {
    this.props.history.push('/profile')
  }

  showPopup = () => {
    $('#save-confirmation').foundation('open');
  }

  showSaveConfirmation = () => {
    if (this.saveConfirmation) this.saveConfirmation.showConfirmation();
  }

  componentWillUnmount(){
    $('body').scrollTop(0);
  }

  render() {

    return (
      <div>
        <UtilBar title="Edit Profile"
                 onCancel={this.onCancel}
                 onSave={this.onSave}
                 noAutoPopup={true} />
        <div className="row align-center main-content-container">
          <div className="column content-column">
            <ProfileForm ref="profileForm"
                         history={this.props.history}
                         forProfile={true}
                         onSubmit={this.showPopup}
                         onSuccess={this.showSaveConfirmation}/>
          </div>
        </div>

        <SaveConfirmation userType={this.props.user!.user_type}
            msg="Your change has been saved successfully."
            onClose={this.onCancel}
            ref={(r) => this.saveConfirmation = r}/>
      </div>
    )
  }
}

export default EditProfile;