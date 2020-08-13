import React from 'react';

import styled from 'styled-components';

import logo from './images/phala-logo.png';

const Bar = styled.nav`
  height: 60px;
  background-color: #262b2d;
  color: white;
  padding: 0 20px;
  font-size: 16px;
  overflow-x: auto;
  overflow-y: hidden;

  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
  -webkit-justify-content: flex-start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  -webkit-align-content: stretch;
  -ms-flex-line-pack: stretch;
  align-content: stretch;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;

  .item {
    -webkit-flex: 0 1 auto;
    -ms-flex: 0 1 auto;
    flex: 0 1 auto;
    -webkit-align-self: auto;
    -ms-flex-item-align: auto;
    align-self: auto;
  }

  div.space {
    margin: 0 1em;
  }
  div.tiny-space {
    margin: 0 0.5em;
  }
  div.expand-space {
    flex: 1 1 auto;
  }

  img.logo {
    height: 50px;
  }

  a {
    font-weight: 400;
  }
  a:link, a:visited, a:active {
    color: white;
  }
  a:hover {
    color: #7eca7a;
  }
  a.no-color:hover {
    color: white;
  }
`;

import {useTranslation} from '@polkadot/app-stakedrop/translate';

function toHome(element: any, index: number) {
  return (
    <a key={index} href='https://phala.network/' className='no-color'>
      {element}
    </a>
  )
}

export default function Navbar () {
  const { t } = useTranslation();

  return (
    <Bar>
      {[(
      <div className='item'>
        <img className='logo' src={logo} />
      </div>),
      (<div className='item phala space'>
        Phala Network
      </div>),
      (<div className='item'>|</div>),
      (<div className='item stakedrop space'>
        <strong>Stakedrop</strong>
      </div>)].map(toHome)
      }

      <div className='expand-space' />

      <div className='item space'>
        <a href='https://medium.com/phala-network/phala-airdrop-program-wave-i-94bc418d384a'>{t('Stakedrop Intro')}</a>
      </div>
      <div className='item space'>
        <a href='https://github.com/Phala-Network/phala-docs/wiki/2.-KSM-Stakedrop-Guide'>{t('Guide')}</a>
      </div>
      <div className='item space'>
        <a href='https://medium.com/phala-network/ksm-stakedrop-faq-1ee90c6def4e'>{t('FAQ')}</a>
      </div>

      <div className='item space'>
        <a href='https://t.me/phalanetwork'>{t('Community')}</a>
      </div>
      <div className='item space'>
        <a href='https://github.com/Phala-Network'>{t('Github')}</a>
      </div>
      <div className='item space'>
        <a href={t('https://files.phala.network/phala-token-economics-en.pdf')}>{t('Token Economic')}</a>
      </div>
      
    </Bar>
  );
}