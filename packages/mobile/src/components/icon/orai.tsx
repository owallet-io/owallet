import React, { FunctionComponent } from 'react';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

export const BnbIcon: FunctionComponent<{
  color?: string;
  size?: number;
  onPress?: () => void;
}> = ({ color = '#AEAEB2', size = 20, onPress }) => {
  return (
    <Svg width="44" height="44" viewBox="0 0 32 33" fill="none">
      <G clip-path="url(#clip0_323_8004)">
        <G clip-path="url(#clip1_323_8004)">
          <Path
            d="M13.2528 14.1654L14.2668 17.1603H11.9794L13.0523 14.1654H13.2528ZM18.7237 18.7638H17.0494V19.3534H21.1761V18.7638H19.5254V14.0475H21.1761V13.458H17.0494V14.0475H18.7237V18.7638ZM11.1894 19.3534L11.7553 17.7734H14.479L15.0096 19.3534H15.8821L13.7598 13.458H12.5571L10.3994 19.3534H11.1894ZM24.4657 24.9657H7.53427V8.03427H24.4657V24.9657Z"
            fill="white"
          />
          <Path
            d="M17.6507 32.5C25.2086 31.7218 31.2219 25.7085 32.0001 18.1507H30.0074C29.3 24.7063 24.3361 29.9296 17.6507 30.6724V32.5Z"
            fill="white"
          />
          <Path
            d="M0 18.1507C0.778187 25.7085 6.79145 31.7218 14.3493 32.5V30.6724C7.66396 29.9296 2.71186 24.6945 1.99263 18.1507H0Z"
            fill="white"
          />
          <Path
            d="M32.0001 14.8493C31.2219 7.29145 25.2086 1.27819 17.6507 0.5V2.32756C24.3361 3.07038 29.2882 8.30545 30.0074 14.8493H32.0001Z"
            fill="white"
          />
          <Path
            d="M14.3493 0.5C6.79145 1.27819 0.778187 7.29145 0 14.8493H1.99263C2.70007 8.29367 7.66397 3.07038 14.3493 2.32756V0.5Z"
            fill="white"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_323_8004">
          <Rect
            width="44"
            height="44"
            fill="white"
            transform="translate(0 0.5)"
          />
        </ClipPath>
        <ClipPath id="clip1_323_8004">
          <Rect
            width="44"
            height="44"
            fill="white"
            transform="translate(0 0.5)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
