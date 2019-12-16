import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import AvatarRed from '../../../images/avatar-red.png'
import AvatarBlue from '../../../images/avatar-blue.png'
import AvatarTeam from '../../../images/avatar-team.png'

const SPORTS_TO_SHOW = 4;

class ContentCard extends Component {

  constructor() {
    super();

    extendObservable(this, {
      user: computed(() => this.props.user),
      allSportsShown: (this.props && this.props.user && this.props.user.user_type !== 'athlete'),
    });
  }

  renderSports() {
    const sports = this.props.sports;
    if (!sports.length) return '';

    const showMoreNum = sports.length > SPORTS_TO_SHOW ? sports.length - SPORTS_TO_SHOW : 0;
    const sports_ = this.allSportsShown ? sports : sports.slice(0, SPORTS_TO_SHOW);

    const showMoreText = !this.allSportsShown ? `${showMoreNum} more ${showMoreNum !== 1 ? 'sports' : 'sport'}`
        : 'show less sports';

    return <div>
      <div className="small-heading stats-sport-list">{sports_.join(', ')}</div>

      {showMoreNum > 0 &&
      <span>
        &nbsp;-&nbsp;
        <span className="link-text"
              role="button"
              onClick={this.toggleShowAllSports}>
          {showMoreText}
        </span>
      </span>}
    </div>
  }

  toggleShowAllSports = () => {
    this.allSportsShown = !this.allSportsShown
  };

  render() {

    return (
      <div className={`card content-card ${this.props.themeColor}`}>
        <div className="header-img"></div>
        <div className="row content-row">
          <div className="column shrink col-left">
            <div className="team-logo-wrap"
              style={{background: `url(${this.props.avatar}) #fff no-repeat center center`}}>
            </div>
          </div>
          <div className="column col-right">
            <div className="title-wrap">
              <h4 className="group-title">{this.props.name || ''}</h4>
              { this.props.tagline ? <div>{`"${this.props.tagline}"`}</div> : null }
              {this.props.link ?
                <Link to={this.props.link} className="edit-btn">
                  <span className="psr-icons icon-pen"></span>
                </Link> : null}
            </div>
            <hr className="divider" />
            <div className="stats">
              {this.renderSports()}

              {this.props.season ?
                <div className="small-heading ">{this.props.season}</div>
              : ''}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default inject('user')(observer(ContentCard))
