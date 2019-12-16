import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'

import LineChart from './line-chart'
import DP from '../../utils/data-proc'
import InfoPopupLeadership from './info-popup-leadership'
import HistoryBtn from '../../components/history-btn'
import {userIsOrganisation} from "../../utils/utils";

export default inject('user')(observer(class MentalInfo extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { curSubCat: 0,
                       curSubCatId: computed(() => {
                                      if (!this.props.subCats.length) return 0;
                                      return this.props.subCats[this.curSubCat].id;
                                    }),
                       assessmentDates: computed(() => {
                                          const allAss = this.props.skillsA.concat(this.props.skillsC);
                                          //console.log('allAss',allAss);
                                          const allDates = allAss.reduce((acc, ass) => {
                                                               acc = acc.concat(ass.history);
                                                               return acc;
                                                             }, [])
                                                             .map(a => a.date_assessed.substr(0, 10));
                                          return Array.from(new Set(allDates));
                                        }) })
  }

  componentDidMount() {

    $(ReactDOM.findDOMNode(this.refs.me)).foundation();
  }

  popupLeadership = (ev) => {
    $('#info-popup-leadership').foundation('open');

    //is there a better way to find selected in dropdown??
    let selectedName = $(ev.target).parents('.graph-card').find('.custom-select .selected').text();
    let selectedDescription = this.props.skillsC.filter(s => s.name == selectedName)[0].description;
//console.log(selectedName,selectedDescription);
//console.log($(ev.target).parents('.graph-card').find('.custom-select .selected').text());
    
//console.log(this.props.skillsC.filter(s => s.name == selectedName));
    $('#info-popup-title-content').html(selectedName);
    $('#info-popup-description-content').html('<p>' + selectedDescription + '</p>');

    $("#info-popup-default-title").hide();
    $('#info-popup-title-content').show();
    $('#info-popup-description-content').show();

  }

  setSubCat = (ev, i) => {
    this.curSubCat = i;
    this.props.setSubCat(ev, i);
  }

  newAssUrl = () => {

    if (this.props.teamId) {

      return `/dashboard/directory/team-management/${this.props.teamId}/leadership/new-assessment/${this.props.athleteId}/${this.curSubCatId}`
    } else {
      if (this.props.isCoach) {
        return `/dashboard/leadership/new-assessment/${this.curSubCat}/${this.props.athleteId}`
      } else {
        return `/dashboard/leadership/new-assessment/${this.curSubCat}`;
      }
    }
  }

  render() {

    return (
      <div>
        {!userIsOrganisation(this.props.user) && <div className="group-section">
          <div className="group-heading-wrap">
            <h3 className="group-heading">Create a New Assessment</h3>
            <div className="button-group">
              <HistoryBtn history={this.props.history}
                          user={this.props.user}
                          link={`leadership/${this.curSubCat}`}
                          dates={this.assessmentDates}/>
              <Link to={this.newAssUrl()}
                    className="button border responsive add">
                <span className="psr-icons icon-plus"></span>
                <span className="show-for-large">Add new</span>
              </Link>
            </div>
          </div>
          <hr className="divider show-for-large"/>
        </div>}

        <div className="group-section" ref="me">
          <div className="group-heading-wrap">
            <h3 className="group-heading">Select Your Assessment to View</h3>
          </div>
          <div className="pill-nav-container">
            <div className="pill-nav">
              {this.props.subCats.map((sc, i) => <div className={"nav-item " + (0 == i ? "active" : "")}
                                                      key={sc.id}
                                                      onClick={ev => {this.setSubCat(ev, i)}}>{sc.name}</div>)}
            </div>
          </div>
          <LineChart title="Athlete Progress"
                     subTitle=""
                     color="red"
                     singleLine={true}
                     unit="stars"
                     onInfoPopup={this.popupLeadership}
                     histories={this.props.skillsA.map(s => ({ name: s.name,
                                                               values: s.history }))} />

          <LineChart title="Coach Progress"
                     subTitle=""
                     color="blue"
                     singleLine={true}
                     unit="stars"
                     onInfoPopup={this.popupLeadership}
                     histories={this.props.skillsC.map(s => ({ name: s.name,
                                                               values: s.history }))} />

        <InfoPopupLeadership />
        </div>
      </div>

    )
  }
}))
