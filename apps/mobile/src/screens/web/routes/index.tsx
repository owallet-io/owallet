import { SceneMap } from "react-native-tab-view";
import { AllRoute } from "@src/screens/web/routes/all-route-screen";
import { DefiRoute } from "@src/screens/web/routes/defi-route-screen";
// import { AiRoute } from "@src/screens/web/routes/ai-route-screen";
import { ExplorerRoute } from "@src/screens/web/routes/explorer-route-screen";

export const renderScene = SceneMap({
  all: AllRoute,
  defi: DefiRoute,
  // ai: AiRoute,
  explorer: ExplorerRoute,
});
