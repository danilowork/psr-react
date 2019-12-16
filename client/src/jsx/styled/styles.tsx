import styled from './styled-components'

export const RouteIndicatorBar = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  top: 102px;
  width: ${(props: {expanded: boolean, fullWidth?: boolean}) => 
           props.fullWidth ? '100%' : (props.expanded ? '99.5%' : '76%')};
  line-height: 50px;
  color: white;
  padding-left: 87px;
  font-family: "Poppins", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  font-size: 1.4rem;
  background: linear-gradient(to right, #32D2FA, #17A6F2);`;