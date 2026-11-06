import { styled } from '#shared/components/styled';

export const Wrapper = styled.div`
  height: 600px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;
