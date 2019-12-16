import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import Api from '../api'
import Select from '../components/select'
import DP from '../utils/data-proc'
import AvatarRed from '../../images/avatar-red.png'
import AvatarBlue from '../../images/avatar-blue.png'


const EntitySection = (props) => (
  <div key={props.letter}>
    <h3 className="letter-heading">{props.letter}</h3>
      <ul className="no-bullet">
        { props.entities.map((entity, i) =>
          <li className="profile-pic-wrap" key={i}>

            {props.editMode && entity.email ? <div className="remove-icon" onClick={(e) => { props.unlinkUser(e, props.teamId, entity.id); }}></div> : ''}
            {'Athlete' == props.type ?
              <Link to={"/dashboard/directory/team-management/" + props.teamId + "/athlete/" +
                        entity.id + '/overview'}>
                <div className="profile-thumb"
                     style={{background: "url(" + (entity.profile_picture_url ? entity.profile_picture_url : AvatarRed)
                             + ") #fff no-repeat center center"}}>
                </div>
                <span>{entity.first_name + ' ' + entity.last_name}</span>
              </Link> :
              <div>
                <div className="profile-thumb"
                  style={{background: "url(" + (entity.profile_picture_url ? entity.profile_picture_url : AvatarBlue)
                  + ") #fff no-repeat center center"}}>
                </div>
                <span>{entity.first_name + ' ' + entity.last_name}</span>
              </div>}
          </li>
        ) }
    </ul>
  </div>
)

export default inject('user', 'team')(observer(class TeamManagementDirectory extends Component {

  constructor() {

    super();
    extendObservable(this,
                     { curType: 'Athlete',
                       searchStr: '',
                       editMode: false,
                       teamId: computed(() => { return this.props.team ? this.props.team.id : 0 }),
                       sections: computed(() => {

                         if (!this.props.team) return [];

                         const roster = 'Athlete' == this.curType ? this.props.team.athletes :
                                                                    this.props.team.coaches;
                         const searchStrU = this.searchStr.toUpperCase();

                         const filtered = roster.filter(a =>
                                              a.first_name.toUpperCase().indexOf(searchStrU) >= 0 ||
                                              a.last_name.toUpperCase().indexOf(searchStrU) >= 0);

                         return filtered.reduce((acc, a) => {
                                  if (!acc.find(letter => letter == a.first_name[0].toUpperCase())) {
                                    acc.push(a.first_name[0].toUpperCase());
                                  }
                                  return acc;
                                }, [])
                                .sort()//array at this point is just letters ["A", "C", "D"...                                                   
                                .map(letter => {
                                  const entities = filtered
                                  .filter(e => e.first_name[0].toUpperCase() == letter)
                                  .sort((a, b) => a.first_name > b.first_name);

                                  return { letter, entities }
                                }); })
                     });
  }

  componentDidMount() {

  }

  // componentWillUnmount(){
  //   $('body').scrollTop(0);
  // }

  setEditMode = () => {
    this.editMode = this.editMode ? false : true;
  }

  unlinkUser = (ev,teamId,userId) => {
    //console.log(email);
    const $targetObj = $(ev.target).parent();
//console.log(teamId,userId);

    Api.cancelAcceptedInvite(teamId,userId)
        .then(result => {
          //this.props.onSuccess();
          $targetObj.addClass('collapsed');

        })
        .catch(err => {

          console.log(err);
          console.log(err.responseJSON.error[0]);
          //this.props.onApiError();
          $targetObj.removeClass('collapsed').find('.remove-icon').remove();

        })



  }

  changeFilter = (type) => {
    this.curType = type;
  }


  render() {

    return (
          <div className="team-management-content">
            <div className="button-group text-center">
              <Link to={`/dashboard/directory/team-management/${this.teamId}/invite/athlete`}
                    className="button border icon">
                <span className="psr-icons icon-plus"></span><span className="btn-text">Invite an athlete</span>
              </Link>
              <Link to={`/dashboard/directory/team-management/${this.teamId}/invite/coach`}
                    className="button border icon">
                <span className="psr-icons icon-plus"></span><span className="btn-text">Invite a coach</span>
              </Link>

            </div>

            <div className="sports-filter">
              <Select choices={['Athlete', 'Coach']}
                      onSelected={this.changeFilter}
                      index={['Athlete', 'Coach'].findIndex(c => c == this.curType)}/>
            </div>

            <label className="search" >
              search
              <input type="text"
                     placeholder={"Search for " + ('Athlete' == this.curType ? 'an athlete' : 'a coach')}
                     value={this.searchStr}
                     onChange={e => this.searchStr = e.target.value}/>
            </label>

            <div className="edit-row">
              {this.editMode === false ?
              <div className="edit-button" onClick={this.setEditMode}>Edit<span className="icon-pen"></span></div>
                           : <div className="edit-button" onClick={this.setEditMode}>Done<span className="icon-tick"></span></div> }
            </div>

            <div className="search-result">

              {this.sections.map(section => <EntitySection {...section}
                                                           type={this.curType}
                                                           editMode={this.editMode}
                                                           teamId={this.props.match.params.t_id}
                                                           key={section.letter}
                                                           unlinkUser={this.unlinkUser} />)}
            </div>

          </div>

    )
  }
}))
