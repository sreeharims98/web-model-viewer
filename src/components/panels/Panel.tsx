import { MaterialPanel } from "./MaterialPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TABS } from "@/constants";
import { LightPanel } from "./LightPanel";

export const Panel = () => {
  return (
    <div className="w-[300px] flex flex-col p-2 bg-panel border-l border-panel-border">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold text-3xl bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 bg-clip-text text-transparent drop-shadow">
          ModViz
        </span>
      </div>
      <Tabs defaultValue={TABS.MATERIALS} className="w-full flex-1 ">
        <TabsList>
          {Object.values(TABS).map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={TABS.MATERIALS}>
          <MaterialPanel />
        </TabsContent>
        <TabsContent value={TABS.LIGHTS}>
          <LightPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
