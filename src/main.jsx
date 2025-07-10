import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import * as zebar from "zebar";
import SpotifyWidget from "./components/SpotifyWidget.jsx";
import GoogleSearch from "./components/GoogleSearch.jsx";
import Settings from "./components/Settings.jsx";
import Shortcut from "./components/Shortcut";
import ActiveApp from "./components/ActiveApp.jsx";
import config from "./config.js";
import moment from "moment";

const providers = zebar.createProviderGroup({
  keyboard: { type: "keyboard" },
  glazewm: { type: "glazewm" },
  cpu: { type: "cpu" },
  date: { type: "date", formatting: "EEE d MMM t" },
  battery: { type: "battery" },
  memory: { type: "memory" },
  weather: { type: "weather" },
  host: { type: "host" },
  network: { type: "network" },
  audio: { type: "audio" },
});

createRoot(document.getElementById("root")).render(<App />);

function App() {
  const [output, setOutput] = useState(providers.outputMap);
  const [showGoogleSearch, setShowGoogleSearch] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showActiveApp, setShowActiveApp] = useState(true);

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));
  }, []);

  function getBatteryIcon(batteryOutput) {
    if (batteryOutput.chargePercent > 90)
      return <i className="nf nf-fa-battery_4"></i>;
    if (batteryOutput.chargePercent > 70)
      return <i className="nf nf-fa-battery_3"></i>;
    if (batteryOutput.chargePercent > 40)
      return <i className="nf nf-fa-battery_2"></i>;
    if (batteryOutput.chargePercent > 20)
      return <i className="nf nf-fa-battery_1"></i>;
    return <i className="nf nf-fa-battery_0"></i>;
  }

  function getWeatherIcon(weatherOutput) {
    switch (weatherOutput.status) {
      case "clear_day":
        return <i className="nf nf-weather-day_sunny"></i>;
      case "clear_night":
        return <i className="nf nf-weather-night_clear"></i>;
      case "cloudy_day":
        return <i className="nf nf-weather-day_cloudy"></i>;
      case "cloudy_night":
        return <i className="nf nf-weather-night_alt_cloudy"></i>;
      case "light_rain_day":
        return <i className="nf nf-weather-day_sprinkle"></i>;
      case "light_rain_night":
        return <i className="nf nf-weather-night_alt_sprinkle"></i>;
      case "heavy_rain_day":
        return <i className="nf nf-weather-day_rain"></i>;
      case "heavy_rain_night":
        return <i className="nf nf-weather-night_alt_rain"></i>;
      case "snow_day":
        return <i className="nf nf-weather-day_snow"></i>;
      case "snow_night":
        return <i className="nf nf-weather-night_alt_snow"></i>;
      case "thunder_day":
        return <i className="nf nf-weather-day_lightning"></i>;
      case "thunder_night":
        return <i className="nf nf-weather-night_alt_lightning"></i>;
    }
  }

  function formatNetworkSpeed(speed) {
    return (speed / 1000000).toFixed(2); // Convert bytes/s to Mbps
  }

  return (
    <div className="app">
      <div className="left">
        <div className="box">
          <span className="date">
            {moment(output.date?.now).format("ddd DD MMM hh:mm A")}
          </span>
        </div>
        {showActiveApp &&
        output.glazewm &&
        output.glazewm.focusedWorkspace &&
        output.glazewm.focusedWorkspace.children.length > 0 ? (
          <div className="box" style={{ marginLeft: "5px" }}>
            <div>
              <ActiveApp output={output} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="center">
        <div className="box">
          <div className="logo">
            <i className="nf nf-custom-windows"></i>
            {output.host?.hostname} |
          </div>
          {output.glazewm && (
            <div className="workspaces">
              {output.glazewm.currentWorkspaces.map((workspace) => (
                <button
                  className={`workspace ${workspace.hasFocus && "focused"} ${
                    workspace.isDisplayed && "displayed"
                  }`}
                  onClick={() =>
                    output.glazewm.runCommand(
                      `focus --workspace ${workspace.name}`
                    )
                  }
                  key={workspace.name}
                >
                  {workspace.displayName ?? workspace.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {showShortcuts && output.glazewm ? (
          <div className="workspaces">
            <Shortcut
              commandRunner={output.glazewm.runCommand}
              commands={[`shell-exec wt`]}
              iconClass="nf-cod-terminal_powershell"
              name=""
            />
            <Shortcut
              commandRunner={output.glazewm.runCommand}
              commands={[`shell-exec wt -d . wsl -d archlinux`]}
              iconClass="nf-md-arch"
              name=""
            />
          </div>
        ) : null}
      </div>

      <div className="right">
        {showGoogleSearch && output.glazewm ? (
          <GoogleSearch
            commandRunner={output.glazewm.runCommand}
            explorerPath={config.explorerPath}
          />
        ) : null}
        <div className="box">
          {output.glazewm && (
            <>
              {output.glazewm.bindingModes.map((bindingMode) => (
                <button className="binding-mode" key={bindingMode.name}>
                  {bindingMode.displayName ?? bindingMode.name}
                </button>
              ))}

              <button
                className={`tiling-direction nf ${
                  output.glazewm.tilingDirection === "horizontal"
                    ? "nf-md-swap_horizontal"
                    : "nf-md-swap_vertical"
                }`}
                onClick={() =>
                  output.glazewm.runCommand("toggle-tiling-direction")
                }
              ></button>
            </>
          )}

          <Settings
            widgetObj={[
              { name: "Google", changeState: setShowGoogleSearch },
              { name: "Shortcuts", changeState: setShowShortcuts },
              { name: "App", changeState: setShowActiveApp },
            ]}
            output={output}
            additionalContent={
              <>
                {/* network */}
                {output.network && (
                  <div className="network">
                    <span title="Download Speed">
                      ↓{" "}
                      {formatNetworkSpeed(
                        output.network.traffic.received.bytes
                      )}{" "}
                      ↑{" "}
                      {formatNetworkSpeed(
                        output.network.traffic.transmitted.bytes
                      )}{" "}
                      Mbps
                    </span>
                  </div>
                )}

                {/* memory */}
                {output.memory && (
                  <button
                    className="memory clean-button"
                    onClick={() =>
                      output.glazewm.runCommand("shell-exec taskmgr")
                    }
                  >
                    <i className="nf nf-fae-chip"></i>
                    {Math.round(output.memory.usage)}%
                  </button>
                )}

                {/* cpu */}
                {output.cpu && (
                  <button
                    className="cpu clean-button"
                    onClick={() =>
                      output.glazewm.runCommand("shell-exec taskmgr")
                    }
                  >
                    <i className="nf nf-oct-cpu"></i>
                    <span className={output.cpu.usage > 85 ? "high-usage" : ""}>
                      {Math.round(output.cpu.usage)}%
                    </span>
                  </button>
                )}

                {/* battery */}
                {output.battery && (
                  <div className="battery">
                    {output.battery.isCharging && (
                      <i className="nf nf-md-power_plug charging-icon"></i>
                    )}
                    {getBatteryIcon(output.battery)}
                    {Math.round(output.battery.chargePercent)}%
                  </div>
                )}

                {/* weather */}
                {output.weather && (
                  <div className="weather">
                    {getWeatherIcon(output.weather)}
                    {Math.round(output.weather.celsiusTemp)}°C
                  </div>
                )}

                {/* volume */}
                {output.audio?.defaultPlaybackDevice && (
                  <div className="volume-control">
                    <i className="nf nf-md-volume_high"></i>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="2"
                      value={output.audio.defaultPlaybackDevice.volume}
                      onChange={(e) =>
                        output.audio.setVolume(e.target.valueAsNumber)
                      }
                      className="volume-slider"
                    />
                    <span>{output.audio.defaultPlaybackDevice.volume}%</span>
                  </div>
                )}
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
