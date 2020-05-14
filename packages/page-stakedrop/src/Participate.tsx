import React, { useMemo } from 'react';

import { useOwnStashInfos, useFavorites } from '@polkadot/react-hooks';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';
import Targets from '@polkadot/app-staking/Targets';

export const STORE_FAVS_BASE = 'staking:favorites';

interface Props {
  whitelist: string[];
}

function Participate({whitelist}: Props): React.ReactElement<Props> {
  const ownStashes = useOwnStashInfos();
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS_BASE);
  const targets = useSortedTargets(favorites);

  const whitelistedTargets = useMemo(() => {
    const validators = targets.validators?.filter(v => whitelist.includes(v.accountId.toString()));
    return {
      ...targets,
      validators
    };
  }, [targets])

  return (
    <Targets
      hideSummary
      ownStashes={ownStashes}
      targets={whitelistedTargets}
      favorites={favorites}
      toggleFavorite={toggleFavorite}
    />
  )
}

export default Participate;