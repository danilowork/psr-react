import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import Api from '../api'
import PreCompeteLevel from './components/precompete-level'
import Select from '../components/select'
import InfoPopupDescription from './components/info-popup-description'
import AvatarRed from '../../images/avatar-red.png'


const AthletePreCompete = (props) => (

  <li>
    <div className="profile-pic-wrap theme link">
      <Link to={`/dashboard/directory/team-management/${props.team.id}/athlete/${props.athlete.id}/status`}>
        <div className="profile-thumb"
             style={{background: "url(" + AvatarRed
                + ") #fff no-repeat center center"}}>
        </div>
        <span>{`${props.athlete.first_name} ${props.athlete.last_name}`}</span>
      </Link>
    </div>
    <div className="group-section status-info">
      <h4 className="comp-title">{props.title}</h4>
      <div>{props.date}<br/>{props.team && props.team.name}</div>
    </div>
    <hr className="divider full-width"/>

    <div className="group-section">
      <h4 className="group-heading">Self-assessment</h4>
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
                             level={props.stress}
                             readOnly={true} />
            <PreCompeteLevel title='Sleep'
                             description='Rate your sleep, taking into account both duration and quality<br />
                                          High: 8+ hours of restful sleep<br />
                                          Low: Less than 5 hours of restless sleep'
                             infoDescription={true}
                             level={props.fatigue}
                             readOnly={true} />
            <PreCompeteLevel title='Soreness'
                             description='Rate your level of overall body soreness<br />
                                          Positive: No soreness or tightness<br />
                                          Negative: Very sore and tight'
                             infoDescription={true}
                             level={props.injury}
                             readOnly={true} />
            <PreCompeteLevel title='Energy'
                             description='Rate your level of energy and focus<br />
                                          High: Energetic and focused<br />
                                          Low: Lethargic and scattered'
                             infoDescription={true}
                             level={props.weekly_load}
                             readOnly={true} />
            <PreCompeteLevel title='Hydration'
                             description='Rate your hydration, taking into account both appropriate amount and quality<br />
                                          High: Well hydrated, quality fluids<br />
                                          Low: Very dehydrated, only drinking sugary drinks'
                             infoDescription={true}
                             level={props.hydration}
                             readOnly={true} />
      </ul>
    </div>
    <div className="group-section">
      <h3 className="group-heading">Goal</h3>
      <p className="dark-text">{props.goal}</p>
    </div>
    <hr className="divider" />
  </li>
)

export default inject('user', 'team')(observer(class extends Component {

  constructor() {

    super();
    extendObservable(this,
                     {
                       searchStr: '',
                       allPreCompetes: [],
                       sections: computed(() => {

                                   const filterFunc = status => {
                                           const lowerFirst = status.athlete.first_name.toLowerCase();
                                           const lowerLast = status.athlete.last_name.toLowerCase();
                                           const lowerSearch = this.searchStr.toLowerCase();

                                           return lowerFirst.indexOf(lowerSearch) >= 0 ||
                                                  lowerLast.indexOf(lowerSearch) >= 0;
                                         };
                                   const filtered = this.allPreCompetes.filter(filterFunc);

                                   return filtered.reduce((acc, status) => {

                                            const letter = status.athlete.first_name[0].toUpperCase();
                                            const section = acc.find(s => s.letter == letter);

                                            if (section) {
                                              section.athletes.push(status);
                                            } else {
                                              acc.push({letter, athletes: [status]});
                                            }
                                            return acc;
                                          }, []);
                                 })
                     });
  }

  componentDidMount() {

    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    Api.getTeamPreCompeteStatus(this.props.match.params.t_id)
      .then(preCompeteStatuses => {

        this.allPreCompetes = preCompeteStatuses;
      })
      .catch(err => {

      });
  }


  render() {

    return (
      <div ref="me" className="team-management-content">
        <label className="search" >
          search
          <input type="text"
                 placeholder="Search for an athlete"
                 value={this.searchStr}
                 onChange={e => this.searchStr = e.target.value}/>
        </label>
        <div className="search-result">
          {this.sections
            .sort((a, b) => a.letter > b.letter)
            .map(section =>
            <div key={section.letter}>
              <h3 className="letter-heading">{section.letter}</h3>
              <ul className="no-bullet">
                {section.athletes
                  .sort((a, b) => a.first_name > b.first_name)
                  .map(athlete => <AthletePreCompete {...athlete} team={this.props.team}/>)}
              </ul>
            </div>)}
        </div>

        <InfoPopupDescription />
      </div>
    )
  }
}))
