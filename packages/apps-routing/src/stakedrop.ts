// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Route } from './types';

import Stakedrop from '@polkadot/app-stakedrop';

export default function create (t: (key: string, text: string, options: { ns: string }) => string): Route {
  return {
    Component: Stakedrop,
    display: {
      needsApi: [
        ['tx.staking.bond']
      ]
    },
    icon: 'star',
    name: 'stakedrop',
    text: t('nav.stakedrop', 'Stakedrop', { ns: 'apps-stakedrop' })
  };
}
