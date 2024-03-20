import * as react from "react";
import { View } from "react-native";
import OWText from "@src/components/text/ow-text";
import { observer } from "mobx-react-lite";
import { OWButton } from "@src/components/button";
import { PageWithView } from "@src/components/page";

const HomeBrowserScreen = observer(() => {
  return (
    <PageWithView>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <OWText>History</OWText>
          <OWButton label={"View all"} type={"link"} fullWidth={false} />
        </View>
      </View>
    </PageWithView>
  );
});

export default HomeBrowserScreen;
