import styled from '../styled/styled-components'

export const MainSection = styled.div`
  width: 70%;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 640px) {
    width: 73%;
    margin: 0;
    padding-left: 87px;
  }
`;

export const MainContentSection = styled.div`
  padding: 50px 0;`;

export const MainContentSectionWithSidebar = styled(MainContentSection)`
  padding-left: 87px;
  margin: 0;
  width: ${(props: {expanded: boolean}) => props.expanded ? '90%' : '73%'};`
;