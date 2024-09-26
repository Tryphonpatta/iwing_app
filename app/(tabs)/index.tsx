import React from "react";
import {
  ApplicationProvider,
  Button,
  Layout,
  Text,
} from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { useModuleContext } from "./context/context";

export default function App() {
  const { module, setModule } = useModuleContext();
  console.log("app : ", module);
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Welcome to UI Kitten</Text>
        {/* <Button
          onPress={() => {
            console.log(module);
          }}
        >
          Print Module
        </Button> */}
        {module.map((item, index) => {
          return <Text key={index}>{item.deviceId}</Text>;
        })}
        <Button
          onPress={() => {
            setModule([]);
          }}
        >
          Clear
        </Button>
      </Layout>
    </ApplicationProvider>
  );
}
