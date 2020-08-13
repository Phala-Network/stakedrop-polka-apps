import React from 'react';
import styled from 'styled-components';
import Countdown, {CountdownRenderProps} from 'react-countdown';

import { Container } from 'semantic-ui-react'
import { SummaryBox, CardSummary } from '@polkadot/react-components';

import { useTranslation } from './../translate';
import { startDate, endDate } from './../api';

const Headline = styled.div`
  margin-top: 37px;
  padding: 12px 1em 6px 1em;
  font-size: 36px;
  font-weight: 300;
  text-align: center;
  line-height: 42px;
  min-height: 90px;
`;

const Subtitle = styled.div`
  font-size: 12px;
  text-align: center;
`;

const SmallerContainer = styled(Container)`
  @media only screen and (min-width: 1200px) {
    width: 400px !important;
  }
`;

function _StakedropCountdown () {
  const { t } = useTranslation();
  const now = new Date();

  function renderCountdown (props :CountdownRenderProps): React.ReactNode {
    return (
      <>
        {['days', 'hours', 'minutes', 'seconds'].map((p, idx) => {
          const value = (props as unknown as {[key: string]: number})[p].toString();
          return (
          <CardSummary label={t(p)} key={idx}>
            {value.padStart(2, '0')}
          </CardSummary>
        )})}
      </>
    );
  }

  return (
    <section>
      <Headline>{
        now < startDate ? t('KSM x PHA Stakedrop will start in')
        : now < endDate ? t('KSM x PHA Stakedrop will end in')
        : t('KSM x PHA Stakedrop has ended')
      }:</Headline>
      <SmallerContainer>
        <SummaryBox>
          <Countdown date={now < startDate ? startDate : endDate} renderer={renderCountdown} />
        </SummaryBox>
      </SmallerContainer>
      { now >= endDate && (
        <Subtitle>
          {t('The Ethereum PHA claiming DApp will be available shortly')}
        </Subtitle>
      )}
    </section>
  );
}

const StakedropCountdown = _StakedropCountdown;
// const StakedropCountdown = styled(_StakedropCountdown)`
//   margin-bottom: 12px;
// `;

export default React.memo(StakedropCountdown);
