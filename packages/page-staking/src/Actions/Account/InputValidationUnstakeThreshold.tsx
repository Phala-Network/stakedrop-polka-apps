// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { Icon } from '@polkadot/react-components';

import { useTranslation } from '../../translate';

interface Props {
  unstakeThreshold: BN | undefined;
  onError: (error: string | null) => void;
}

function InputValidationUnstakeThreshold ({ onError, unstakeThreshold }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    if (unstakeThreshold) {
      let newError: string | null = null;

      if (unstakeThreshold.ltn(0)) {
        newError = t<string>('The Threshold must be a positive number');
      } else if (unstakeThreshold.gtn(10)) {
        newError = t<string>('The Threshold must lower than 11');
      }

      onError(newError);
      setError((error) => error !== newError ? newError : error);
    }
  }, [onError, t, unstakeThreshold]);

  if (!error) {
    return null;
  }

  return (
    <article className='warning'>
      <div><Icon icon='exclamation-triangle' />{error}</div>
    </article>
  );
}

export default React.memo(InputValidationUnstakeThreshold);
