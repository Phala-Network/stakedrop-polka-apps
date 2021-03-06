// Copyright 2017-2020 @polkadot/app-stakedrop authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AppProps as Props } from '@polkadot/react-components/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { useApi, useCall, useStashIds } from '@polkadot/react-hooks';
import _Tabs from '@polkadot/react-components/Tabs';
import { Route, Switch } from 'react-router';

import React, { useState, useEffect, useMemo } from 'react';

import hardcodedWhitelist from './static/whitelist';
import { useTranslation } from './translate';
import Countdown from './components/Countdown';
import Overview from './Overview';
import Nomination from './Nomination';
import SetEthAddress from './SetEthAddress';
import * as StakedropApi from './api';
import styled from 'styled-components';

interface Validators {
  next?: string[];
  validators?: string[];
}

function loadWhitelist(input = hardcodedWhitelist): string[] {
  return input.result.map((r: {stash: string}) => r.stash);
}

function StakedropApp ({ className, basePath }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();

  const [{ next }, setValidators] = useState<Validators>({});
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview, []);
  const allStashes = useStashIds();

  useEffect((): void => {
    allStashes && stakingOverview && setValidators({
      next: allStashes.filter((address) => !stakingOverview.validators.includes(address as any)),
      validators: stakingOverview.validators.map((a) => a.toString())
    });
  }, [allStashes, stakingOverview]);

  const staticWhitelist = useMemo(loadWhitelist, []);
  const [whitelist, setWhitelist] = useState(staticWhitelist);
  useEffect(() => {
    (async () => {
      const r = await StakedropApi.getWhitelist();
      if (r.status == 'ok') {
        setWhitelist(loadWhitelist(r));
      }
    })();
  }, []);


  const tabItems = [
    {
      isRoot: true,
      name: 'overview',
      text: t('Overview')
    },
    {
      name: 'nomination',
      text: t('My Nomination')
    },
    {
      name: 'setethaddress',
      text: t('Set Ethereum Address')
    },
  ];

  const Tabs = styled(_Tabs)`
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  `

  return (
    <main className={className}>
      <Countdown />
      <header>
        <Tabs
          basePath={basePath}
          items={tabItems}
        />
      </header>
      
      <Switch>
        <Route path={`${basePath}/nomination`}>
          <Nomination/>
        </Route>
        <Route path={`${basePath}/setethaddress`}>
          <SetEthAddress/>
        </Route>
        <Route>
          <Overview
            next={next}
            stakingOverview={stakingOverview}
            whitelist={whitelist}
          />
        </Route>
      </Switch>

    </main>
  );
}

export default React.memo(StakedropApp);
