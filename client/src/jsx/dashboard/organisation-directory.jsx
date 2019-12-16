import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router-dom'
import {extendObservable, computed, observe} from 'mobx'
import {observer, inject} from 'mobx-react'

import EmptyPopup from './components/empty-popup'
import Select from '../components/select'
import {userIsOrganisation} from '../utils/utils'
import {getAvatar} from '../utils/utils'


class EntitySection extends Component {
  gotoTeam = (all_teams, history, team_name) => {
    const team = all_teams.find(t => t.team_name === team_name);
    history.push(`/dashboard/directory/team-management/${team.team_id}/team-directory`);
  };

  renderUserTeams = (user) => {
    if (!user.all_teams || user.all_teams.length === 0) return;
    // Single team
    if (user.all_teams.length === 1) {
      const team = user.all_teams[0];
      const action = team.is_coaching ? 'Coaches the ' : 'Plays for the ';
      const link = `/dashboard/directory/team-management/${team.team_id}/team-directory`;
      return <span className={'user-team'}>{action}<Link className={"link-text"}
                                                         to={link}>{team.team_name}</Link></span>
    }
    // Multiple teams
    const action = user.all_teams[0].is_coaching ? 'Coaches Multiple teams ' : 'Plays for Multiple teams ';
    const choices = [action].concat(user.all_teams.map(x => x.team_name));
    return <Select placeholder={action}
                   choices={choices}
                   onSelected={this.gotoTeam.bind(this, user.all_teams, this.props.history)}
                   customClass={'user-team-select'}
                   index={0}/>
  };

  render() {
    return <div key={this.props.letter}>
      <h3 className="letter-heading">{this.props.letter}</h3>
      <ul className="no-bullet">
        {
          this.props.entities
            .sort((a, b) => a.first_name > b.first_name)
            .map((entity, i) => {
                let entName, linkRoot, linkTail, pictureUrl;
                entName = entity.first_name + ' ' + entity.last_name;
                linkRoot = '/dashboard/directory/athlete-management/';
                linkTail = '/overview';
                pictureUrl = entity.profile_picture_url || getAvatar(entity);

                return (
                  <li className="profile-pic-wrap link" key={i}>
                    <Link to={`${linkRoot}${entity.id}${linkTail}`}>
                      <div className="profile-thumb"
                           style={{background: `url(${pictureUrl}) #fff no-repeat center center`}}>
                      </div>
                      <span>{entName}</span>
                    </Link>
                    {this.renderUserTeams(entity)}
                  </li>)
              }
            )}
      </ul>
    </div>
  }
}

export default inject('user', 'setUser')(observer(class OrganisationDirectory extends Component {

  constructor() {

    super();
    extendObservable(this,
      {
        user: computed(() => this.props.user),
        curType: null,
        searchStr: '',
        actionLink: '',
        emptyType: '',
        editMode: false,
        filtered: computed(() => this.getFiltered()),
        sections: computed(() => {

          this.filtered.sort((a, b) => {
            const textA = a.first_name;
            const textB = b.first_name;
            return (textA.toUpperCase() < textB.toUpperCase()) ? -1 : (textA > textB) ? 1 : 0;
          });

          return this.filtered.reduce((acc, item) => {
            const name = item.first_name;

            if (!acc.find(letter => letter === name[0].toUpperCase())) {
              acc.push(name[0].toUpperCase());
            }
            return acc;
          }, [])
            .map(letter => {
              const entities = this.filtered
                .filter(e => {
                  const name = e.first_name;
                  return name[0].toUpperCase() === letter;
                });
              return {letter, entities}
            });
        })
      });
  }

  getFiltered() {
    if (!this.user) return [];
    const items = this.user.linked_users;
    if (!items) return [];

    const searchStrU = this.searchStr.toUpperCase();
    return items.filter(u =>
      u.user_type === (this.curType || u.user_type) && (
      u.first_name.toUpperCase().indexOf(searchStrU) >= 0 || u.last_name.toUpperCase().indexOf(searchStrU) >= 0)
    )
  }

  compoentWillMount() {
    $('.reveal-overlay').remove();
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.me)).foundation();

    observe(this,
      'user',
      change => {
        if (change.newValue) {
          if (!this.user.linked_users.length) {
            this.showEmptyPopup();
          }
        }
      });
    if (!this.user) return;
    if (!this.user.linked_users.length && !window.emptyConnectionPopupShown) {

      this.showEmptyPopup();
      window.emptyConnectionPopupShown = true;
    }
  }

  componentWillUnmount() {
    $('body').scrollTop(0);
  }

  showEmptyPopup = () => {
    if (userIsOrganisation(this.props.user)) return;

    this.emptyMsg = "Looks like you haven't connected to any athletes yet. Don't worry, you can invite athletes now.",
      this.actionLink = "/dashboard/invite";
    this.emptyType = "link";

    const popup = new Foundation.Reveal($('#empty-popup'));
    popup.open();
  };

  changeFilter = (type) => {
    this.curType = type.toLowerCase();
  };

  render() {
    const placeholder = {'coach': 'a coach', 'athlete': 'an athlete'}[this.curType] || 'an athlete or a coach';

    return (
      <div className="directory" ref="me">
        <div className="row align-center main-content-container">
          <div className="column content-column">
            <h2 className="content-heading">Search for athletes and coaches in the organisation.</h2>

            <div className="sports-filter">
              <Select choices={['Athlete', 'Coach']}
                      onSelected={this.changeFilter}
                      index={['Athlete', 'Coach'].findIndex(c => c.toLowerCase() === this.curType)}/>
            </div>

            <label className="search">
              search
              <input type="text"
                     placeholder={`Search for ${placeholder}`}
                     value={this.searchStr}
                     onChange={e => this.searchStr = e.target.value}/>
            </label>

            <div className="search-result">
              {this.sections
                .map(section => <EntitySection {...section}
                                               entType={this.curType}
                                               key={section.letter}
                                               history={this.props.history}
                                               unlinkUser={this.unlinkUser}/>)
              }
            </div>
          </div>
        </div>

        <EmptyPopup ref="emptyPopup" userType={this.user && this.user.user_type}
                    msg={this.emptyMsg} actionLink={this.actionLink}
                    emptyType={this.emptyType}
        />
      </div>
    )
  }
}))
