import { SceneMap } from 'react-native-tab-view';
import { AllRoute } from '@src/screens/web/routes/all-route-screen';
import { DefiRoute } from '@src/screens/web/routes/defi-route-screen';
// import { AiRoute } from "@src/screens/web/routes/ai-route-screen";
import { ExplorerRoute } from '@src/screens/web/routes/explorer-route-screen';
import { OsmoRoute } from './osmo-route-screen';
import { InjRoute } from './inj-route-screen';

export const renderScene = SceneMap({
  all: AllRoute,
  defi: DefiRoute,
  // ai: AiRoute,
  explorer: ExplorerRoute
});

export const renderDApps = SceneMap({
  oraichain: AllRoute,
  osmosis: OsmoRoute,
  injective: InjRoute
});
