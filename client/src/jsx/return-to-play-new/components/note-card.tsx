import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'

import styled from '../../styled/styled-components'

const Container = styled.div`
  border: 1px solid #bdc5d0`;

const LinksContainer = styled.div.attrs({ className: "column shrink col-right" })`
  display: flex;
  font-size: 0.85rem;
  flex-direction: column;
  align-items: flex-end;`;

const UpperContainer = styled.div`
  display: flex;
  justify-content: space-between;`;

const UpperLeft = styled.div`
  color: black;
  font-size: 0.85rem;`;

const LinkText = styled.span`
  font-size: 1rem;
  color: #17A6F2;
  text-decoration: underline;`;

const Icon = styled.span`
  color: #17A6F2;`;

const ContentText = styled.div`
  color: black;
  font-size: 1.1rem;`;

const Hr = styled.hr`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;`;

const NoteH = styled.h4`
  color: black;
  font-size: 1rem;`;


type ReMouseEvt = React.MouseEvent<HTMLElement>

interface NoteCardProps {
  noteId: number
  title: string
  deleteNote: (id: number) => void
  viewLink?: string
  doctor?: string
  doctorType?: string
  recipient?: string
  creator?: string
  createdDate: string
  editLink?: string
}

const Links = (props: {
  onDelete: (e: React.MouseEvent<HTMLElement>) => void,
  editLink: string
}) =>
  <LinksContainer>
    <Link to={props.editLink} className="edit-btn">
      <LinkText>edit</LinkText>&nbsp;
      <Icon className="psr-icons icon-pen theme"/>
    </Link>
    <Link to="/athlete-log/delete-note">
      <LinkText>delete</LinkText>&nbsp;
      <Icon className="psr-icons icon-trash theme"
            onClick={props.onDelete}/>
    </Link>
  </LinksContainer>;

const Content = (props: {
  title: string,
  doctor?: string,
  doctorType?: string,
  recipient?: string,
  creator?: string,
  editLink?: string,
  createdDate: string,
  onDelete?: ((e: ReMouseEvt) => void)
}) =>
  <div>
    <UpperContainer>
      <UpperLeft>
        <NoteH className="group-title">{props.title}</NoteH>
        <ContentText>
          {props.doctor ? props.doctor : ''}
          {props.doctor && props.doctorType ? ', ' : ''}
          {props.doctorType ? props.doctorType : ''}
        </ContentText>
        {props.recipient && <ContentText>{props.recipient}</ContentText>}
        {props.creator &&
        <ContentText>Created by: {props.creator}</ContentText>}
      </UpperLeft>
      {props.editLink && <Links onDelete={props.onDelete!}
                                editLink={props.editLink}/>}
    </UpperContainer>
    <Hr/>
    <ContentText>{props.createdDate}</ContentText>
  </div>;

@observer
class NoteCard extends Component<NoteCardProps, {}> {

  onDelete = (evt: ReMouseEvt) => {
    evt.preventDefault();
    this.props.deleteNote(this.props.noteId)
  };

  render() {
    const content = <Content title={this.props.title}
                             doctor={this.props.doctor}
                             doctorType={this.props.doctorType}
                             recipient={this.props.recipient}
                             creator={this.props.creator}
                             editLink={this.props.editLink}
                             createdDate={this.props.createdDate}
                             onDelete={this.onDelete}/>;
    return (
      <Container className="card">
        <div className="row">
          {this.props.viewLink ?
            <Link to={this.props.viewLink} className="column view-link">
              {content}
            </Link> :
            <div className="column view-link">{content}</div>}
        </div>
      </Container>
    )
  }
}

export default NoteCard
