import React, { useMemo } from 'react';
// import BN from 'bn.js';

import { useOwnStashInfos, useFavorites } from '@polkadot/react-hooks';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';
import Targets from '@polkadot/app-staking/Targets';
// import { useTranslation } from '@polkadot/react-params/translate';

export const STORE_FAVS_BASE = 'staking:favorites';

interface Props {
  whitelist: string[];
}

function Participate({whitelist}: Props): React.ReactElement<Props> {
  // const { t } = useTranslation();
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

  // const [ addPhala, setAddPhala ] = useState(true);
  // function toggleAddPhala () {
  //   setAddPhala(!addPhala);
  // }

  // const preferredValidator = useMemo(() => addPhala ? ['GvHQrW6ekMU71ev5mZTaXZgochiyK4mK3CKdN5wdGUqubMf'] : undefined, [addPhala]);

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