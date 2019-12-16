import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { observable, computed } from 'mobx'
import { inject, observer } from 'mobx-react'
import AvatarRed from '../../images/avatar-red.png'
import AvatarBlue from '../../images/avatar-blue.png'
import AvatarTeam from '../../images/avatar-team.png'
import ToggleIcon from '../../images/arrow-sidebar.svg'

import styled from '../styled/styled-components'
import { User } from '../data-types';

const RootContainer = styled.div`
  border-left: 1px solid #bdc5d0;
  width: 24%;
  min-height: 100%;
  position: fixed;
  right: 0;
  top: 102px;
  z-index: 110;
  transform: translateX(${(props: any) => props['data-expanded'] ? '0' : '96%'});`;

const SearchBar = styled.label`
  position: relative;
  margin-bottom: 1.5rem;
  height: 50px;
  color: black;
  :before {
    content: "\\E911";
    font-family: "psr-icons";
    font-size: 16px;
    position: absolute;
    left: 14px;
    bottom: 12px;
  }`;

const SearchInput = styled.input`
  padding-left: 40px;
  font-size: 16px;
  height: 100%;
  color: black;
  ::placeholder {
    color: black;
  }`;

const SectionHeader = styled.h3`
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  font-size: 14px;
  padding: 0 0 0.75rem 0;
  color: black;
  margin-bottom: 0;`;

const EntityName = styled.span`
  font-size: 0.75rem;
  color: black;`;

const ToggleButton = styled.span`
  transform: translateY(50vh);
  position: absolute;
  display: inline-block;
  width: 2.7em;
  height: 2.7em;
  border: 0.05em solid #dcdcdc;
  border-radius: 50%;
  margin-left: -1.5rem;
  background: white;
  cursor: pointer;`;

const ToggleButtonIcon = styled.img`
  display: inline-block;
  vertical-align: middle;
  max-width: 100%;
  height: auto;
  margin-left: ${(props: { expanded: boolean }) => props.expanded ? '1.05rem' : '0.85rem'};
  margin-top: 0.5rem;
  transform: rotate(${(props: { expanded: boolean }) => props.expanded ? '180deg' : '0'});
`;

const AvatarIcon = styled.div`
  box-shadow: 0 3px 4px rgba(0,0,0,0.2);
`;

const SearchResult = styled.div`
  overflow: hidden;
  max-height: ${(props: { height?: Number }) => `${props.height}px;`};
`;

const EntitySection = (props: any) => (
    <div key={props.group}>
        <SectionHeader>
            {`${props.group} (${props.groupSize})`}
        </SectionHeader>
        <ul className="no-bullet">
            {
                props.groupItems
                    .sort((a: any, b: any) => {
                        const nameA = typeof a.name === 'undefined' ? a.first_name : a.name;
                        const nameB = typeof b.name === 'undefined' ? b.first_name : b.name;
                        return nameA > nameB
                    })
                    .map((entity: any, i: number) => {
                            let entName, linkRoot, linkTail, pictureUrl;

                            if ('ATHLETES' === props.entType) {
                                entName = entity.first_name + ' ' + entity.last_name;
                                linkRoot = '/dashboard/directory/athlete-management/';
                                linkTail = '/overview';
                                pictureUrl = entity.profile_picture_url || AvatarRed;
                            } else if ('COACHES' === props.entType) {
                                entName = entity.first_name + ' ' + entity.last_name;
                                linkRoot = '/dashboard/directory/athlete-management/';
                                linkTail = '/overview';
                                pictureUrl = entity.profile_picture_url || AvatarBlue;
                            } else {
                                entName = entity.name;
                                linkRoot = '/dashboard/directory/team-management/';
                                linkTail = '/team-directory';
                                pictureUrl = entity.team_picture_url || AvatarTeam;
                            }

                            return (
                                <li className={"profile-pic-wrap link " + (props.activeId === entity.id ? 'active': '')} key={i}>
                                    <Link to={`${linkRoot}${entity.id}${linkTail}`}>
                                        <AvatarIcon className="profile-thumb"
                                                    style={{ background: `url(${pictureUrl}) #fff no-repeat center center` }}>
                                        </AvatarIcon>
                                        <EntityName>{entName}</EntityName>
                                    </Link>
                                </li>
                            )
                        }
                    )}
        </ul>
    </div>
);

interface TeamsUsersSideBarProps {
    user?: User
    sidebarStatus?: { expanded: boolean }
}

interface TeamsUsersSideBarState {
    height?: number;
    activeId: number;
}

@inject('user', 'sidebarStatus')
@observer
class TeamsUsersSideBar extends Component<TeamsUsersSideBarProps, TeamsUsersSideBarState> {
    checkPathInterval: any;
    mounted: boolean;

    constructor(props: any) {
        super(props);
        this.state = {
            height: 0,
            activeId: 0
        };
        this.mounted = false;
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.checkLocationPath = this.checkLocationPath.bind(this);
        this.setActiveId = this.setActiveId.bind(this);
    }

    @computed get user() {
        return this.props.user;
    }

    @observable curType = 'Athlete';
    @observable searchStr = '';

    @computed get filtered() {
        return this.getFiltered();
    }

    @computed get sections() {
        return this.getSections();
    }

    @computed get isExpanded() {
        return this.props.sidebarStatus!.expanded;
    }

    componentDidMount() {
        this.updateWindowDimensions();
        this.mounted = true;
        this.checkPathInterval = this.checkLocationPath();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        this.mounted = false;
        clearInterval(this.checkPathInterval);
    }

    checkLocationPath() {
        // sorry, but we have no router state, so we can't handle router hooks
        return setInterval(() => {
            let path = window.location.pathname;
            if (!path.includes('dashboard/directory')) {
                return this.setActiveId(0);
            }

            try {
                const urlParams = path.split('/');
                const activeId = parseInt(urlParams[urlParams.length - 2]);
                this.setActiveId(activeId);
            } catch (e) {
                this.setActiveId(0);
            }

        }, 100);
    }

    setActiveId(id: number) {
        if (this.mounted &&  !isNaN(id) && (this.state.activeId !== id)) {
            this.setState({
                activeId: id
            })
        }
    }

    updateWindowDimensions() {
        this.setState({ height: window.outerHeight } as TeamsUsersSideBarState);
    }

    getFiltered() {
        const items = Array.from(this.user!.team_ownerships || [])
            .concat(Array.from(this.user!.team_memberships || []))
            .concat(Array.from(this.user!.linked_users || []));
        if (!items) return [];
        const searchStrU = this.searchStr.toUpperCase();

        const filtered = items.filter((t: any) => {
            // Teams
            if (typeof t.name !== 'undefined') {
                return t.name.toUpperCase().indexOf(searchStrU) >= 0
            }
            // Athletes and coaches
            return t.first_name.toUpperCase().indexOf(searchStrU) >= 0 || t.last_name.toUpperCase().indexOf(searchStrU) >= 0
        });
        // Deduplicate
        return filtered.filter((obj: any, pos, arr) =>
            arr.map((mapObj: any) => mapObj.id).indexOf(obj.id) === pos);
    }

    getSections() {
        // Sort items
        this.filtered.sort((a, b) => {
            const textA = this.getName(a);
            const textB = this.getName(b);
            return (textA.toUpperCase() < textB.toUpperCase()) ? -1 : (textA > textB) ? 1 : 0;
        });

        // Calculate groups from items => unique user types
        const groups = [...new Set(this.filtered.map(this.getGroup))];

        const mapGroupToGroupLabel = {
            'athlete': 'ATHLETES',
            'coach': 'COACHES',
            'team': 'TEAMS',
        };

        // Get items by group
        return groups.map(group => {
            const groupItems = this.filtered.filter(item => this.getGroup(item) === group);
            return {
                group: mapGroupToGroupLabel[group],
                groupItems,
                groupSize: groupItems.length
            }
        });
    }

    getName = (item: any) =>
        typeof item.name === 'undefined' ? item.first_name : item.name;

    getGroup = (item: any) =>
        typeof item.name === 'undefined' ? item.user_type : 'team';

    toggle = () => {
        this.props.sidebarStatus!.expanded = !this.props.sidebarStatus!.expanded;
    };

    render() {
        const height = (this.state.height || 0) - 270;
        return (
            <RootContainer className="teams-users-sidebar"
                           data-height={height}
                           data-expanded={this.isExpanded}>
                <nav className="side-nav desktop">
                    <ToggleButton title="Toggle the sidebar"
                                  onClick={this.toggle}>
                        <ToggleButtonIcon src={ToggleIcon}
                                          expanded={this.isExpanded} />
                    </ToggleButton>
                    <ul className="nav no-bullet">
                        <li>
                            <SearchBar>
                                <SearchInput type="text"
                                             placeholder={`Search`}
                                             value={this.searchStr}
                                             onChange={e => this.searchStr = e.target.value}/>
                            </SearchBar>
                        </li>
                        <li>
                            <SearchResult className="search-result"
                                          height={height}>
                                {this.sections
                                    .map(section =>
                                        <EntitySection {...section}
                                                       entType={section.group}
                                                       activeId={this.state.activeId}
                                                       key={section.group}/>)
                                }
                            </SearchResult>
                        </li>
                    </ul>
                </nav>
            </RootContainer>
        )
    }
}

export default TeamsUsersSideBar;
