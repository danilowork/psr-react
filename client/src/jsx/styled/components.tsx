import React from 'react'
import { Link } from 'react-router-dom'
import { CSSTransitionGroup } from 'react-transition-group'

import styled from './styled-components'
import blueDownArrow from '../../images/blue-down-arrow.png'

type ReChangeEvtInput = React.ChangeEvent<HTMLInputElement>

export const ContentContainer = styled.div`
  width: 100%;`;

export const RootContainer = styled.div`
  padding-top: 50px;`;

export const PanelContainer = styled.div`
  color: #000;
  background-color: #f9f9f9;
  margin-top: 30px;
  width: 86%;
  margin-left: auto;
  margin-right: auto;
  padding: 25px 42px;`;

export const PanelTitle = styled.h4`
  color: black;
  font-size: 2.3rem;
  font-weight: bold;`;

export const PanelHR = styled.hr`
  margin: 0.5rem auto 1.5rem auto;`;

export const PanelMain = styled.div`
  display: flex;`;

export const GradientBtn = styled.button`
  cursor: pointer;
  border-radius: 3px;
  color: white;
  width: 138px;
  height: 40px;
  font-size: 1.1rem;
  font-weight: bold;
  background-image: linear-gradient(to bottom, #32D2FA, #17A6F2);`;

export const CancelBtn = styled.div`
  cursor: pointer;
  font-size: 16px;
  font-family: Poppins, "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  color: black;
  margin-right: 40px;`

export const ButtonRow = styled.div`
  clear: both;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;`;

export const PanelRowTitle = styled.div`
  flex: 3;
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 6px;
  color: black;`;

export const PanelRowSubTitle = styled.h6`
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  font-weight: bold;
  font-size: 1.3rem;
  color: black;`;

export const PanelP = styled.p`
  font-size: 1.2rem;
  padding-top: 10px;`;

export const PanelRowLinkText = styled.a`
  font-weight: normal;
  font-size: 1.24rem;
  color: #17A6F2;
  display: block;
  line-height: 2.75rem;
  text-decoration: underline;`;

export const PanelRowValue = styled.div`
  flex: 7;`;

const TextInput = styled.input.attrs({ type: 'text' })`
  padding: 0.8rem;
  font-size: 1.15rem;
  background-color: white;
  border-width: 0;
  width: 550px;
  :focus {
    background-color: white;
    border-width: 0;
  }`;

const Select = styled.select`
  padding-left: 0.8rem;
  font-size: 1.15rem;
  width: 550px;
  background: url(${blueDownArrow}) white no-repeat;
  background-position: right;
  background-size: auto 100%;
  border-width: 0;
  :focus {
    background: url(${blueDownArrow}) white no-repeat;
    border-width: 0;
    background-position: right;
    background-size: auto 100%;
  }`;

export const LabelForRadio = styled.label.attrs({className: 'custom-radio'})`
  cursor: pointer;
  width: 100px;`

export const PanelField = (props: {
  title: string,
  type: 'text' | 'select' | 'radio',
  value: any,
  selection?: any[],
  placeholder?: string,
  onChange: (ev: any) => void,
}) =>
  <div>
    <PanelRowTitle>{props.title}:</PanelRowTitle>
    {'text' == props.type ?
      <TextInput value={props.value} onChange={props.onChange} placeholder={props.placeholder} /> :
      ('radio' == props.type ?
        <fieldset>
          {props.selection!.map((s, i) =>
            <LabelForRadio key={i}>
              <input type="radio"
                     name="measuring_system"
                     value={s[0]}
                     required
                     checked={props.value == s[0]}
                     onChange={props.onChange}/>
              <span className="radio-indicator"/><span>{s[1]}</span>
            </LabelForRadio>)}
        </fieldset> :
        <Select onChange={props.onChange}>
          {props.selection!.map((s, i) =>
            <option key={i} value={s[0]}>{s[1]}</option>)}
        </Select>)}
  </div>;

export const TransitionGroupContainer = styled(CSSTransitionGroup).attrs({
  className: "transition-container"
})`

width: ${(props: { expanded: boolean }) =>
  props.expanded ? '99.5%' : '76%'};`;
export const AwardCardRoot = styled.div.attrs({ className: "card award-card" })`
  border: 1px solid #d7dee6`;

const PenIcon = styled.span.attrs({ className: 'psr-icons icon-pen' })`
  color: #17A6F2;`;

const LinkText = styled.span`
  font-size: 1rem;
  color: #17A6F2;
  text-decoration: underline;`;

export const PenEditLink = (props: { link: string, onEdit?: () => void }) =>
  <Link to={props.link}
        onClick={props.onEdit || (() => {
        })}
        className="edit-btn">
    <LinkText>edit</LinkText>&nbsp;<PenIcon/>
  </Link>;

export const AwardCardContent = styled.div`
  padding-top: 5px;
  color: #000;
  font-size: 1.3rem;`;

export const AwardCardFooter = styled.div`
  color: #000;
  font-size: 1.1rem;`;

const CheckboxIndicator = styled.span.attrs({ className: 'checkbox-indicator' })`
  && { width: 20px;
       height: 20px;
       border-radius: 0;
       :before {
         content: '';
         width: 12px;
         height: 12px;
         left: 3px;
         top: 3px;
         background-color: #17A6F2;
       }
     }`;

const CheckBoxContainer = styled.label`
  line-height: 3.2rem;`;

const CheckBoxLabel = styled.span`
  cursor: pointer;
  padding-left: 10px;
  font-size: 1.2rem !important;
  color: black;`;

export const CheckBox = (props: {
  title: string,
  checked: boolean,
  valueId?: number,
  onChange: (evt: ReChangeEvtInput, _?: number) => void
}) =>
  <CheckBoxContainer className="custom-checkbox">
    <input type="checkbox"
           name="visibility"
           value={props.title}
           onChange={e => props.onChange(e, props.valueId)}
           checked={props.checked}/>
    <CheckboxIndicator/>
    <CheckBoxLabel>{props.title}</CheckBoxLabel>
  </CheckBoxContainer>;

export const H = styled.h3`
  font-size: 2.3rem;
  color: black;`;

export const FormButton = styled(Link)`
  float: right;
  margin: -42px 0 0 !important;
  z-index: 101;
  padding-right: 21px;
  position: fixed;
  right: 25%;
  height: 33px;
  line-height: 7px;
  font-size: 0.9rem;
  background: white;
  color: black;
  border-radius: 4px;`;

export const PlusIcon = styled.span`
  font-size: 0.7rem;
  font-family: 'psr-icons', serif !important;
  margin-right: 0.4rem;
  margin-left: 0.4rem;
  font-weight: bold;
  :before {
    content: "\\E90E";
  }`;