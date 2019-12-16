import styled from "styled-components";
import { GradientButton } from "../../components-new/header";

export const ButtonGroup = styled.div`
  margin-top: 25px;`

export const Button = styled(GradientButton)`
  margin: 0 10px 10px 0;
  padding: 0 5px;
  width: 220px;
  height: 44px;
  background: none;
  border: #26a7ef solid 2px;
  border-radius: 3px;
  vertical-align: top;
  color: black;
  &:hover, &.active {
    background: linear-gradient(#00C0EE, #008CD8);
    border: none;
    color: white;
  }`

export const AssessmentButtonGroup = styled.div`
   text-align: right;
   margin: 20px -10px 0 0;`

export const AssessmentButton = styled(Button)`
   width: 150px;`

export const CancelButton = styled(AssessmentButton)`
  &:hover {
    background: none;
    border: #26a7ef solid 2px;
    color: black;
  };
  border: none;`;