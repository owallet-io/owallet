import React, { FunctionComponent } from 'react';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

export const OraiLightIcon: FunctionComponent<{
  color?: string;
  size?: number;
  onPress?: () => void;
}> = ({ color = '#AEAEB2', size = 20, onPress }) => {
  return (
    <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <G clip-path="url(#clip0_3889_52562)">
        <G clip-path="url(#clip1_3889_52562)">
          <Path
            d="M19.8795 20.4975L21.4005 24.9898H17.9694L19.5788 20.4975H19.8795ZM28.0858 27.3951H25.5744V28.2794H31.7645V27.3951H29.2885V20.3207H31.7645V19.4364H25.5744V20.3207H28.0858V27.3951ZM16.7844 28.2794L17.6334 25.9095H21.7189L22.5147 28.2794H23.8235L20.64 19.4364H18.836L15.5995 28.2794H16.7844ZM36.6989 36.698H11.3018V11.3008H36.6989V36.698Z"
            fill="#1A1D1F"
          />
          <Path
            d="M26.4756 48.0005C37.8124 46.8332 46.8323 37.8133 47.9996 26.4766H45.0107C43.9495 36.31 36.5036 44.1449 26.4756 45.2592V48.0005Z"
            fill="#1A1D1F"
          />
          <Path
            d="M0 26.4766C1.16728 37.8133 10.1872 46.8332 21.5239 48.0005V45.2592C11.4959 44.1449 4.0678 36.2923 2.98895 26.4766H0Z"
            fill="#1A1D1F"
          />
          <Path
            d="M47.9996 21.5239C46.8323 10.1872 37.8124 1.16728 26.4756 0V2.74134C36.5036 3.85556 43.9318 11.7082 45.0107 21.5239H47.9996Z"
            fill="#1A1D1F"
          />
          <Path
            d="M21.524 0C10.1872 1.16728 1.16728 10.1872 0 21.524H2.98895C4.05011 11.6905 11.4959 3.85557 21.524 2.74134V0Z"
            fill="#1A1D1F"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_3889_52562">
          <Rect width="48" height="48" rx="24" fill="white" />
        </ClipPath>
        <ClipPath id="clip1_3889_52562">
          <Rect width="48" height="48" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
