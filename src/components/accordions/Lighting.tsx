import { useAppContext } from "@/context/AppContext";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Image as ImageIco, Upload } from "lucide-react";
import { ENV_MAPS } from "@/constants";

export const Lighting = () => {
  const { lightSettings, setLightSettings, resetLightSettings } =
    useAppContext();

  const handleHDRUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".hdr";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setLightSettings((prev) => ({
          ...prev,
          customHDR: file,
          environmentMap: "custom",
          useSkybox: true,
        }));
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Environment Map Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Environment Map</Label>

        <div className="flex gap-2">
          <Select
            value={lightSettings.environmentMap}
            onValueChange={(value) =>
              setLightSettings((prev) => ({
                ...prev,
                environmentMap: value,
                customHDR: null,
              }))
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {ENV_MAPS.map((env) => (
                <SelectItem value={env.value} key={env.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full border ${env.style}`}
                    ></div>
                    {env.name}
                  </div>
                </SelectItem>
              ))}

              {lightSettings.customHDR && (
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <ImageIco className="w-3 h-3" />
                    Custom HDR
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="outline"
            onClick={handleHDRUpload}
            className="shrink-0"
          >
            <Upload className="w-4 h-4 mr-1" />
            HDR
          </Button>
        </div>

        {lightSettings.customHDR && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            {`Loaded: ${lightSettings.customHDR.name}`}
          </div>
        )}
      </div>

      {/* Blurriness Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Environment Blurriness</Label>
          <span className="text-sm text-muted-foreground">
            {lightSettings.blurriness.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[lightSettings.blurriness]}
          onValueChange={(value) => {
            const blurValue = value[0];
            setLightSettings((prev) => ({
              ...prev,
              blurriness: blurValue,
            }));
          }}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Skybox Toggle */}
      <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
        <Checkbox
          id="skybox"
          checked={lightSettings.useSkybox}
          onCheckedChange={(checked: boolean) => {
            setLightSettings((prev) => ({
              ...prev,
              useSkybox: checked,
            }));
          }}
        />
        <div className="flex-1">
          <Label
            htmlFor="skybox"
            className="text-sm font-medium cursor-pointer"
          >
            Use Environment as Skybox
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Display the environment map as the scene background
          </p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="border-t pt-4 space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={resetLightSettings}
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
