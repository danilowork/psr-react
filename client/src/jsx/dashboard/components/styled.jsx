import styled from 'styled-components'

import { AssessmentButtonGroup } from '../../dashboard-new/components/buttons';

export const Column = styled.div`
  padding: ${props => props.isNewDashboard ? '0' : ''};`;

export const Header = styled.div`
  padding: ${props => props.isNewDashboard ? '0 3rem' : '0'};`;

export const HeaderH1 = styled.h1`
  font-size: ${p => p.isNewDashboard ? '2.3rem' : '1.25rem'} !important;
  color: ${p => p.isNewDashboard ? 'black' : '#003059'} !important;`;

export const HeaderP = styled.p`
  font-size: ${p => p.isNewDashboard ? '1.1rem' : '1rem'} !important;
  color: ${p => p.isNewDashboard ? 'black' : '#003059'} !important;`;

export const ButtonGroup = styled(AssessmentButtonGroup)`
  padding: ${props => props.isNewDashboard ? '0 92px' : '0'};`;

export const AssLegend = styled.h3`
  color: ${p => p.isNewDashboard ? 'black' : '#003059'} !important;
  padding: ${props => props.isNewDashboard ? '0 92px 0 3rem' : '0'};`;

export const Legend = styled.legend`
  font-size: ${p => p.isNewDashboard ? '1.05rem' : '0.875rem'} !important;
  color: ${p => p.isNewDashboard ? 'black' : '#003059'} !important;;
  border-bottom: ${p => p.isNewDashboard ? 'none' : '1px solid #BDC5D0'} !important;
  padding: ${p => p.isNewDashboard ? '0 5rem 5px 3rem' : '0.8rem 0'} !important;`;

export const Label = styled.label`
  font-weight: ${p => p.isNewDashboard ? 'normal' : 'bold'} !important;
  font-size: ${p => p.isNewDashboard ? '1.05rem' : '0.9375rem;'} !important;
  color: ${p => p.isNewDashboard ? 'black' : '#5c6b7f'} !important;`;

export const RatingRow = styled.li`
  border-bottom: ${p => p.isNewDashboard ? 'none' : '1px solid #BDC5D0'} !important;
  background-color: ${p => p.isNewDashboard && p.idx % 2 === 0 ? '#F9F9F9' : 'white'} !important;
  padding: ${p => p.isNewDashboard ? '0.6rem 5rem 0.6rem 3rem' : '0.6rem 0'} !important;
`;
