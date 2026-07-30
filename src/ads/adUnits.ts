import { TestIds } from 'react-native-google-mobile-ads';

const REWARDED_INTERSTITIAL_ID = 'ca-app-pub-2173298418951684/5870291819';
const BANNER_ID = 'ca-app-pub-2173298418951684/1902438280';

export const AD_UNIT_IDS = __DEV__
  ? {
      rewardedInterstitial: TestIds.REWARDED_INTERSTITIAL,
      banner: TestIds.BANNER,
    }
  : {
      rewardedInterstitial: REWARDED_INTERSTITIAL_ID,
      banner: BANNER_ID,
    };
