import { TestIds } from 'react-native-google-mobile-ads';

const REWARDED_ID = 'ca-app-pub-2173298418951684/5870291819';
const BANNER_ID = 'ca-app-pub-2173298418951684/1902438280';
const INTERSTITIAL_ID = 'ca-app-pub-2173298418951684/5870291819'; // Fallback a rewarded o interstitial AdMob

export const AD_UNIT_IDS = __DEV__
  ? {
      rewarded: TestIds.REWARDED,
      rewardedInterstitial: TestIds.REWARDED_INTERSTITIAL,
      interstitial: TestIds.INTERSTITIAL,
      banner: TestIds.BANNER,
    }
  : {
      rewarded: REWARDED_ID,
      rewardedInterstitial: REWARDED_ID,
      interstitial: INTERSTITIAL_ID,
      banner: BANNER_ID,
    };
