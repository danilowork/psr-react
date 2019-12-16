import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'
import moment from 'moment'

import Api from '../../api'
import StatusForm from './status-form'
import PreCompeteLevel from './precompete-level'
import InfoPopupDescription from './info-popup-description'

export default inject('user')(observer(class extends Component {

  constructor(props) {

    super(props);
    extendObservable(this,
                     { preCompeteStatus: {},
                       teamName: computed(() => {
                                   if (this.user && this.preCompeteStatus.team_id) {
                                     const allTeams = this.user.team_ownerships.concat(this.user.team_memberships);
                                     const teamThisStatus = allTeams.find(t => t.id == this.preCompeteStatus.team_id);

                                     if (teamThisStatus) {
                                       return teamThisStatus.name;
                                     }
                                     return '';
                                   }
                                 }),
                       user: computed(() => this.props.user) });
  }

  componentDidMount() {

    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    Api.getPreCompitionAss(this.props.match.params.a_id)
      .then(status => {
        if (status.length) {
          this.preCompeteStatus = status[0];
        }
      })
      .catch(err => console.log(err));
  }

  render() {

    return (
      <div ref="me">
        <div className="group-section">
          <hr className="divider full-width theme" />
          <div className="group-heading-wrap">
            <div>
              <h3 className="group-heading">{this.preCompeteStatus.title}</h3>
              <div className="small-text">
                {this.preCompeteStatus.date}<br />{this.teamName}
              </div>
            </div>
          </div>
        </div>
        <div className="group-section">
          <h3 className="group-heading">Assessment</h3>
          <ul className="no-bullet">
              {/*  changes:
                Stress = Nutrition
                Fatigue = Sleep
                Injury = Soreness
                Weekly load = Energy
                Hydration = Hydration
              */}
                <PreCompeteLevel title='Nutrition'
                                 description='Rate your nutrition, taking into account both appropriate amount and quality<br />
                                              High: Appropriate amounts of well-balanced foods<br />
                                              Low: Too little/too much, mostly junk food'
                                 infoDescription={true}
                                 level={this.preCompeteStatus.stress} />
                <PreCompeteLevel title='Sleep'
                                 description='Rate your sleep, taking into account both duration and quality<br />
                                              High: 8+ hours of restful sleep<br />
                                              Low: Less than 5 hours of restless sleep'
                                 infoDescription={true}
                                 level={this.preCompeteStatus.fatigue} />
                <PreCompeteLevel title='Soreness'
                                 description='Rate your level of overall body soreness<br />
                                              Positive: No soreness or tightness<br />
                                              Negative: Very sore and tight'
                                 infoDescription={true}
                                 level={this.preCompeteStatus.injury} />
                <PreCompeteLevel title='Energy'
                                 description='Rate your level of energy and focus<br />
                                              High: Energetic and focused<br />
                                              Low: Lethargic and scattered'
                                 infoDescription={true}
                                 level={this.preCompeteStatus.weekly_load} />
                <PreCompeteLevel title='Hydration'
                                 description='Rate your hydration, taking into account both appropriate amount and quality<br />
                                              High: Well hydrated, quality fluids<br />
                                              Low: Very dehydrated, only drinking sugary drinks'
                                 infoDescription={true}
                                 level={this.preCompeteStatus.hydration} />
          </ul>

          
        </div>

        {this.preCompeteStatus.goal ?
          <div className="group-section">
            <h3 className="group-heading">Goal</h3>
            <p className="dark-text">{this.preCompeteStatus.goal}</p>
          </div>
        : null }

        <InfoPopupDescription />
      </div>
    )
  }
}));
