// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';

import React from 'react';

import CurrentList from './CurrentList';

interface Props {
  className?: string;
  favorites: string[];
  hasQueries: boolean;
  showType: 'validators' | 'intentions' | 'both';
  next?: string[];
  stakingOverview?: DeriveStakingOverview;
  toggleFavorite: (address: string) => void;
  whitelist?: string[];
}

function Overview ({ className = '', favorites, hasQueries, showType, next, stakingOverview, toggleFavorite, whitelist }: Props): React.ReactElement<Props> {
  return (
    <div className={`staking--Overview ${className}`}>
      <CurrentList
        favorites={favorites}
        hasQueries={hasQueries}
        showType={showType}
        next={next}
        stakingOverview={stakingOverview}
        toggleFavorite={toggleFavorite}
        whitelist={whitelist}
      />
    </div>
  );
}

export default React.memo(Overview);
