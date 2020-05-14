// Copyright 2017-2020 @polkadot/app-stakedrop authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AppProps as Props } from '@polkadot/react-components/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { useApi, useCall, useStashIds } from '@polkadot/react-hooks';
import Tabs from '@polkadot/react-components/Tabs';
import { Route, Switch } from 'react-router';

import React, { useState, useEffect, useMemo } from 'react';

import whitelist from './static/whitelist';
import { useTranslation } from './translate';
import Countdown from './components/Countdown';
import Overview from './Overview';
import Participate from './Participate';

interface Validators {
  next?: string[];
  validators?: string[];
}

function loadWhitelist(): string[] {
  return whitelist.result.map((r: {stash: string}) => r.stash);
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

  const whitelist = useMemo(loadWhitelist, []);

  const tabItems = [
    {
      isRoot: true,
      name: 'overview',
      text: t('Overview')
    },
    {
      name: 'calculator',
      text: t('Calculator')
    },
    {
      name: 'stake',
      text: t('Participate')
    },
    {
      name: 'nomination',
      text: t('My Nomination')
    },
  ];

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
        <Route path={`${basePath}/calculator`}>
          Calculator will be ready soon.
        </Route>
        <Route path={`${basePath}/stake`}>
          <Participate
            whitelist={whitelist}
          />
        </Route>
        <Route path={`${basePath}/nomination`}>
          Nomination page will be ready soon.
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
