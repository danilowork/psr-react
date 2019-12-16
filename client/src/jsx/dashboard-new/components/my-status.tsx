import React, {Component} from 'react'
import {observable, computed} from 'mobx'
import {observer, inject} from 'mobx-react'
import styled from 'styled-components'
import moment from 'moment'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

import Api from '../../api'
import { User, SingleAss, AssCategory, AssSubcategory } from '../../data-types'

import StatusBG from '../../../images/bg-my-status.jpg'
import IconGoal from '../../../images/goal.png'
import IconEvent from '../../../images/event.png'

const MainContainer = styled.div`
  `

const HeaderContainer = styled.div`
  width: ${(props: {expanded: boolean}) => props.expanded ? '99.0%' : '76%'};
  height: 300px;
  margin-top: 50px;
  background: url(${StatusBG}) #fff no-repeat center center;
  background-size: cover;`

const MainTitle = styled.h3`
  margin-left: 15%;
  padding-top: 1.5%;
  font-size: 1.8rem;
  color: white;`

const StatusDate = styled.div`
  margin-left: 15%;
  color: white;
  font-size: 0.9rem;
  font-weight: bold;`

enum StatusType { Nutrition = 'Nutrition',
                  Sleep = 'Sleep',
                  Soreness = 'Soreness',
                  Energy = 'Energy',
                  Hydration = 'Hydration' }
type StatusLevel = { [id in StatusType]: number }

const StatusBlockContainer = styled.div`
  display: flex;
  flex-direction: column;`

const StatusCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 2px solid ${(props: {color: string}) => props.color};`

const LevelText = styled.div`
  color: ${(props: {color: string}) => props.color};
  font-size: 0.9rem;`

const StatusName = styled.div`
  color: white;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 0.4rem;`

const StatusBlocksContainter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 15%;
  margin-right: 15%;
  margin-top: 1rem;`

const GoalEventBar = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 25px;`

const StyledGoalEvent = styled.div`
  padding: 15px;
  flex: 1;
  ${(props: {side: 'left' | 'right'}) => props.side == 'left' ?
    'text-align: right; padding-right: 8%;' : 'padding-left: 5%;'}
  background: rgba(255, 255, 255, 0.3);`

const GoalEventImg = styled.img`
  width: 30px;
  height: 30px;
  margin-right: 20px;`

const GoalEventContent = styled.span`
  color: white;
  font-size: 0.9rem;`

const GoalEventTitle = GoalEventContent.extend`
  font-weight: bold;`

const GoalEventSeparator = styled.div`
  width: 2px;`

const GoalEvent = (props: {side: 'left' | 'right',
                           img: string,
                           contentTitle: string,
                           content: string}) =>
  <StyledGoalEvent side={props.side}>
    <GoalEventImg src={props.img}/>
    <GoalEventTitle>{props.contentTitle} </GoalEventTitle>
    <GoalEventContent>{props.content}</GoalEventContent>
  </StyledGoalEvent>

const StatusBlock = (props: {status: string, level: number}) => {
  const idx = props.level - 1;
  const statusName = ['Low', 'Low-med', 'Med-high', 'High'];
  let colors = ['#FF4F52', '#FF7E00', '#F8E71C', '#0EB919'];
  if (props.status === StatusType.Soreness) colors = colors.reverse();
  const color = colors[idx];

  return <StatusBlockContainer>
      <StatusCircle color={color}>
        <LevelText color={color}>
          {statusName[idx]}
        </LevelText>
      </StatusCircle>
      <StatusName>{props.status}</StatusName>
    </StatusBlockContainer>
  }

interface MyStatusProps {
  user?: User
  sidebarStatus?: {expanded: boolean}
  assessments?: AssCategory[]
}

@inject('user', 'sidebarStatus', 'assessments')
@observer
class MyStatus extends Component<MyStatusProps, {}> {

  @observable statusLevels: StatusLevel = { Nutrition: 0,
                                            Sleep: 0,
                                            Soreness: 0,
                                            Energy: 0,
                                            Hydration: 0 }
  @observable compititionDate = moment()
  @observable compititionTitle = ''
  @observable compititionGoal = ''
  @computed get assPhysical() {
    return this.props.assessments!.find(cat => cat.id == 10000)!;
  }

  componentDidMount() {

    Api.getPreCompitionAss()
      .then(preCompitions => {

        if (!preCompitions.length) return;

        const preCompete = preCompitions[0];
        this.compititionTitle = preCompete.title;
        this.compititionDate = moment(preCompete.date);
        this.statusLevels.Nutrition = preCompete.stress;
        this.statusLevels.Sleep = preCompete.fatigue;
        this.statusLevels.Hydration = preCompete.hydration;
        this.statusLevels.Soreness = preCompete.injury;
        this.statusLevels.Energy = preCompete.weekly_load;
        this.compititionGoal = preCompete.goal;
      })
      .catch(err => console.log(err));
  }

  render() {
    const data = this.assPhysical!.childs[0].childs[0] as any;
    return <MainContainer>
        <HeaderContainer expanded={!this.props.sidebarStatus!.expanded}>
          <MainTitle>My Status</MainTitle>
          <StatusDate>
            {this.compititionDate.format('MMMM DD, YYYY')}
          </StatusDate>
          <StatusBlocksContainter>
            { Object.keys(StatusType).map(s =>
                <StatusBlock status={s}
                             key={s}
                             level={this.statusLevels[s]} />) }
          </StatusBlocksContainter>
          <GoalEventBar>
            <GoalEvent side='left'
                       img={IconGoal}
                       contentTitle="Individual goal:"
                       content={this.compititionGoal}/>
            <GoalEventSeparator/>
            <GoalEvent side='right'
                       img={IconEvent}
                       contentTitle="Next event:"
                       content={this.compititionTitle}/>
          </GoalEventBar>
        </HeaderContainer>
        <LineChart width={600} height={300} data={data}
              margin={{top: 5, right: 30, left: 20, bottom: 5}}
              >
          <XAxis dataKey="name" interval={data.length - 2}/>
          <CartesianGrid vertical={false}/>
          <Line type="linear"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}/>
        </LineChart>
      </MainContainer>
  }
}

export default MyStatus;
