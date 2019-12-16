import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router-dom';
import {computed, extendObservable} from 'mobx';
import {inject, observer} from 'mobx-react';
import Api from '../api';

class SportsPopup extends Component {

  constructor() {
    super();

    const comingSoonSports = [
      'Alpine',
      'Archery',
      'Badminton',
      'Biathlon',
      'Bowling',
      'Broomball',
      'Canoe & Kayak (Sprint)',
      'Canoe & Kayak (Whitewater)',
      'Cross Country skiing',
      'Curling',
      'Cycking',
      'Freestyle Skiing',
      'Goalbal',
      'Golf',
      'Gymnastics',
      'Judo',
      'Lacrosse',
      'Racquetball',
      'Ringette',
      'Rowing',
      'Sailing',
      'Shooting',
      'Skating',
      'Snowboarding',
      'Softball',
      'Special Olympics',
      'Squash',
      'Swimming',
      'Synchronized Swimming',
      'Table Tennis',
      'Triathlon',
      'Water Polo',
      'Waterski & Wakeboard',
      'Wheelchair Basketball',
      'Wheelchair Rugby'
    ];

    extendObservable(
        this,
        {
          sportsPopupTab: computed(() => this.props.sportsPopupTab),
          comingSoonSports,
        },
    );
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.profileForm)).foundation();

    $(ReactDOM.findDOMNode(this.refs.profileForm))
      .on("formvalid.zf.abide", (ev,frm) => {
        this.submitChange();
      })
      .on("submit", ev => {
        ev.preventDefault();
      });
  }

  updateChosen = e => {

    this.props.user.chosen_sports.map(s => {
      if (0 == e.target.name.indexOf(s.sport)) s.is_chosen = e.target.checked;
    });
  }

  showApiError = () => {
    this.refs.saveConfirmation.showApiError();
  };

  showConfirmation = () => {
    this.refs.saveConfirmation.showConfirmation();
  };

  onCurrentTabClick = () => {
    this.props.onTabClick('CURRENT');
  };

  onComingSoonTabClick = () => {
    this.props.onTabClick('COMING SOON');
  };

  onComingSoonSportClick = () => {
    alert('Ooops. We are still working with your sport organization to input ' +
        'the appropriate technical tactical pathway. Until it is complete, ' +
        'please feel free to use the rest of the assessments in ' +
        'Personal Sport Record.')
  };

  submitChange = () => {
    if(this.props.onSubmit) this.props.onSubmit();

    let forSubmit = Object.assign({}, this.props.user);
    delete forSubmit['profile_picture_url'];

    Api.updateUser(forSubmit)
      .then(result => {
        if (this.profileImgChanged) {
          const formData = new FormData();

          Api.uploadUserProfilePic(formData)
            .then(result => {
              this.props.user.profile_picture_url = result.profile_picture_url;
              this.props.onSuccess();
            })
            .catch(err => console.log(err));
        } else {
          this.props.onSuccess();
        }
      })
      .catch(err => console.log(err));
  }

  render() {
    const tabCurrentActiveCls = this.sportsPopupTab === 'CURRENT' ? 'active' : '';
    const tabComingSoonActiveCls = this.sportsPopupTab === 'COMING SOON' ? 'active' : '';

    return (
        <div className={"card content-card popup"}>
          <a className="close-btn" onClick={this.props.onClose}>
            <span className="psr-icons icon-x"/>
          </a>

          <div className="row">
            <h3 className="group-heading text-center">PSR Full Sports List</h3>
          </div>

          <div className="row content-row">
            <div className="column col-left text-center sport-header">
              <h3 className={`group-heading ${tabCurrentActiveCls}`} onClick={this.onCurrentTabClick}>
                CURRENT
              </h3>
            </div>

            <div className="column col-right text-center sport-header">
              <h3 className={`group-heading ${tabComingSoonActiveCls}`} onClick={this.onComingSoonTabClick}>
                COMING SOON
              </h3>
            </div>
          </div>

          {/* CURRENT list */}
          {tabCurrentActiveCls && <form data-abide noValidate id="profile-form" ref="profileForm">
            <fieldset className="sport-list">
              {this.props.user && this.props.user.chosen_sports ?
                this.props.user.chosen_sports.map(s => (
                  <div className="switch-container" key={s.sport}>
                    <div className="switch-label">{s.sport}</div>
                    <div className="switch small">
                      <input className="switch-input"
                             type="checkbox" checked={s.is_chosen}
                             id={s.sport + 'chosen'}
                             name={s.sport + 'chosen'}
                             onChange={this.updateChosen} />
                      <label className="switch-paddle" htmlFor={s.sport + 'chosen'}>
                        <span className="show-for-sr">{s.sport + 'chosen'}</span>
                      </label>
                    </div>
                  </div>)) : null}
            </fieldset>

              <button type="submit"
                      className="button expanded theme"
                      value="Save">Save</button>
          </form>}

          {/* COMING SOON list */}
          {tabComingSoonActiveCls && <form data-abide noValidate>
            <fieldset className="sport-list">
              {this.comingSoonSports ?
                this.comingSoonSports.map(s => (
                  <div className="switch-container" key={s} onClick={this.onComingSoonSportClick}>
                    <div className="switch-label">{s}</div>
                    <div className="switch small">
                    </div>
                  </div>)) : null}
            </fieldset>
          </form>}

        </div>
    );
  }
}

export default inject('user')(observer(SportsPopup));
