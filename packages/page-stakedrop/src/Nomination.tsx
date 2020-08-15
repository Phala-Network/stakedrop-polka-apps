import React, { useEffect, useState, useMemo } from 'react';
import { Container, Grid } from 'semantic-ui-react'
import styled from 'styled-components';

import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { SummaryBox, CardSummary } from '@polkadot/react-components';
import { formatBalance } from '@polkadot/util';
import { useAccounts, useApi, useCall } from '@polkadot/react-hooks';
import { Option } from '@polkadot/types';


import ReactEcharts from 'echarts-for-react';

import * as StakedropAPI from './api';
import { useTranslation } from './translate';

interface Props {
}

interface NominatorStash {
  nominator: string;
  stash: StakedropAPI.StakeAmountResult;
};

const StashCard = styled(Grid.Column)`
  background-color: #fff;
  box-shadow: 0 5px 20px #bbb;
  margin: 20px;
  padding: 2rem 1rem 0 2rem !important;
`;

function Nomination ({} :Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { hasAccounts, allAccounts } = useAccounts();
  const activeEra = useCall<EraIndex | undefined>(api.query.staking?.activeEra, [], {
    transform: (activeEra: Option<ActiveEraInfo>) => activeEra.unwrapOr({ index: undefined }).index
  });
  // const [{ bondedTotal, foundStashes }, setState] = useState<State>({});
  const [stashes, setStashes] = useState<NominatorStash[]>([]);
  const [rewardResult, setRewardResult] = useState<StakedropAPI.StakedropReward[]>([]);
  const [nominatorReward, setNominatorReward] = useState<{[key: string]: number}>({});

  useEffect(()=> {
    if (!hasAccounts || !activeEra) {
      return;
    }

    const currentEra = activeEra?.toNumber();
    (async () => {
      const stakingInfo = await StakedropAPI.getStakingInfo(currentEra);
      if (stakingInfo.status != 'ok') {
        return;
      }
      const myStake = stakingInfo.result.filter(({nominator}) => allAccounts.includes(nominator));
      const totalStaked = myStake.reduce((sum, stake) => sum + stake.amount, 0) / 1000;
      setNowParticipated(totalStaked)

      const stashes = allAccounts;
      let allStashes = await Promise.all(stashes.map(async (nominator) => {
        return {
          nominator, 
          stash: (await StakedropAPI.getStakeAmount(nominator)).result,
        };
      }))
      allStashes = allStashes.filter(({stash}) => stash.length > 0);
      setStashes(allStashes);
    })();

    (async () => {
      const r = await StakedropAPI.getStakedropRewards();
      setRewardResult(r);
      const map: {[key: string]: number} = {};
      for (const x of r) {
        map[x.nominator] = parseInt(x.pha);
      }
      setNominatorReward(map);
    })();
  }, [allAccounts, activeEra])

  const [nowParticipated, setNowParticipated] = useState(0);

  const participated = useMemo((): number => {
    if (stashes.length == 0) {
      return nowParticipated;
    }
    const stashesMax = stashes
      .map(({stash}) => {
        const amounts = stash
          .filter(s => s.era >= StakedropAPI.startEra && s.amount >= 10)
          .map(s => s.amount / 1000);
        return amounts.reduce((x, a) => x + a, 0) / amounts.length;
      });
    return stashesMax.reduce((x, a) => x + a, 0);
  }, [nowParticipated, stashes]);

  const totalPHA = useMemo((): number => {
    if (rewardResult.length == 0 || allAccounts.length == 0) {
      console.log('early return', rewardResult.length, allAccounts.length)
      return 0;
    }
    const myRewards = rewardResult.filter(r => allAccounts.includes(r.nominator));
    return myRewards.map(r => parseInt(r.pha)).reduce((x, a) => x + a, 0);
  }, [allAccounts, rewardResult]);

  const participatedPeriod = useMemo((): number => {
    const days= stashes
      .map(({stash}) =>
        stash.filter(s => s.era >= StakedropAPI.startEra && s.amount >= 10).length / 4)
      .map(v => {console.log(v); return v});
    return Math.max(0, ...days);
  }, [stashes]);

  const stashCharts = useMemo((): JSX.Element[] => {
    const eraNames: string[] = [];
    const erasToShow = StakedropAPI.daysSinceStart * 4;
    for (let i = 0; i < erasToShow; i++) {
      const day = 1 + ((i/4)|0);
      const era = 1 + i % 4;
      eraNames.push(`${day}-${era}`);
    }

    return stashes.map((stash, idx) => {
      const amounts: number[] = new Array(eraNames.length);
      stash.stash.forEach(({era, amount}) => {
        const i = era - StakedropAPI.startEra;
        if (i >= 0 && i < eraNames.length) {
          amounts[i] = amount / 1000;
        }
      });
      const pha = nominatorReward[stash.nominator] || 0;
      
      const chartOptions = {
        color: '#d32e79',
        xAxis: {
          type: 'category',
          data: eraNames,
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {},
        series: [{
          data: amounts,
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.8)'
          }
        }]
      };
      return (
        <StashCard key={stash.nominator}>
          <h1>{t('Stash')} #{idx+1}</h1>
          <p>
            {stash.nominator} <br/> {formatBalance(pha, {withUnit: 'PHA'}, 0)}
          </p>
          <ReactEcharts option={chartOptions} />
        </StashCard>
      )
    })

  }, [stashes, nominatorReward]);

  return (
    <>
      <SummaryBox>
        <CardSummary label={t('My stashes')}>
          {formatBalance(participated < 10 ? 0 : participated, undefined, 0)}
        </CardSummary>
        <CardSummary label={t('participated period')}>
          {participatedPeriod} days
        </CardSummary>
        <CardSummary label={t('Total PHA')}>
          {formatBalance(totalPHA, {withUnit: 'PHA'}, 0)}
        </CardSummary>
      </SummaryBox>
      <section>
        <Container>
          <Grid centered columns={2}>
            {stashCharts}
          </Grid>
        </Container>
      </section>
      {participated > 0 && participated < 10 && (<p>{t('Warning: you have staked {{val}} KSM, less than the minimal requirement of 10 KSM.', {replace: {val: participated}})}</p>)}
      <ul>
        <li>{t('You can find the ongoing stakedrop status and historical data in this page. Reward stats and charts are coming soon.')}</li>
        <li>{t('You may not see your stake right after nominated the whitelisted validators becuae it takes 2 eras to take effect (6 hours per era in Kusama Network).')}</li>
        <li>{t('From Polkadot.js: "Once transmitted the new selection will only take effect in 2 eras since the selection criteria for the next era was done at the end of the previous era. Until then, the nominations will show as inactive."')}</li>
      </ul>
    </>
  )
}

export default Nomination;