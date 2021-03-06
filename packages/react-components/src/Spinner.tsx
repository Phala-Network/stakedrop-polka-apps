// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

import { useTranslation } from './translate';
import spinnerSrc from './Spinner.png';

interface Props {
  className?: string;
  label?: React.ReactNode;
  variant?: 'app' | 'push' | 'mini';
}

function Spinner ({ className = '', label, variant = 'app' }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const isApp = variant === 'app';

  return (
    <div className={`${className} ui--Spinner ${variant}`}>
      <img
        className={variant === 'push' ? '' : 'ui--highlight--bg'}
        src={spinnerSrc as unknown as string}
      />
      {isApp && <div className='text'>{label || t('Retrieving data')}</div>}
    </div>
  );
}

export default React.memo(styled(Spinner)`
  display: block;
  margin: 0 auto;
  text-align: center;

  img {
    border-radius: 10rem;
    opacity: 0.75;
  }

  &.mini img {
    height: 1.75rem;
    width: 1.75rem;
  }

  .text {
    color: inherit !important;
    margin: 0 auto 1.5rem auto;
    opacity: 0.6;
  }
`);
