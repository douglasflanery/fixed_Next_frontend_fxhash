import style from "./CaptureSettings.module.scss"
import cs from "classnames"
import { FunctionComponent } from "react"
import { CaptureMode, CaptureSettings, CaptureTriggerMode } from "../../types/Mint"
import { Select } from "./Select"
import Link from "next/link"
import { SliderWithText } from "./SliderWithText"
import { Spacing } from "../Layout/Spacing"
import { InputResolution } from "./Resolution"
import { InputText } from "./InputText"


const modeOptions = [
  {
    value: CaptureMode.CANVAS,
    label: "From <canvas>"
  },
  {
    value: CaptureMode.VIEWPORT,
    label: "Viewport capture"
  },
  {
    value: CaptureMode.CUSTOM,
    label: "Custom export function",
    disabled: true
  },
]

const triggerModeOptions = [
  {
    value: CaptureTriggerMode.DELAY,
    label: "Fixed delay"
  },
  {
    value: CaptureTriggerMode.FN_TRIGGER,
    label: "Programmatic trigger using fxpreview()"
  },
]

function getModeDescription(mode: CaptureMode) {
  switch(mode) {
    case CaptureMode.CANVAS:
      return "The preview will be generated by using canvas.toDataURL() on the canvas selected with the CSS selector you provide"
    case CaptureMode.CUSTOM:
      return "You are responsible for providing the image preview by implementing a function (see guide)"
    case CaptureMode.VIEWPORT:
      return "The preview will be generated by capturing the full viewport at the resolution you provide"
  }
}

interface Props {
  settings: CaptureSettings
  onChange: (v: CaptureSettings) => void
}

export const InputCaptureSettings: FunctionComponent<Props> = ({
  settings,
  onChange
}) => {
  const update = (key: string, value: any) => {
    onChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className={cs(style.container)}>

      <h5>Trigger</h5>
      <p>When will the capture module trigger ?</p>
      <Select
        id="trigger-mode"
        placeholder="Select the type of trigger"
        value={settings.triggerMode ?? ""}
        options={triggerModeOptions}
        onChange={value => update("triggerMode", value)}
        className={cs(style.select)}
      />
      {settings.triggerMode === CaptureTriggerMode.DELAY && (
        <>
          <Spacing size="3x-large"/>
          <h5>Time before capture is taken</h5>
          <p>Remember: better safe than sorry</p>
          <SliderWithText
            min={0.1}
            max={300}
            step={0.1}
            value={settings.delay}
            onChange={val => update("delay", val)}
          />
        </>
      )}

      <Spacing size="3x-large"/>
      
      <h5>Target</h5>
      <p>
        <span>What will be the target of the capture module ?</span>
      </p>
      <Select
        id="mode"
        placeholder="Select capture mode"
        value={!settings.mode ? "" : settings.mode}
        options={modeOptions}
        onChange={value => update("mode", value)}
        className={cs(style.select)}
      />
      {settings.mode && <em>{ getModeDescription(settings.mode) }</em>}

      {settings.mode === CaptureMode.VIEWPORT && (
        <>
          <Spacing size="3x-large"/>

          <h5>Capture resolution</h5>
          <p>A browser with this resolution will be spawned to take a fullscreen capture. [256; 2048]</p>
          <InputResolution
            value={{ x: settings.resX!, y: settings.resY! }}
            onChange={val => {
              onChange({
                ...settings,
                resX: val.x,
                resY: val.y
              })
            }}
            min={256}
            max={2048}
            className={cs(style.resolution)}
          />
        </>
      )}

      {settings.mode === CaptureMode.CANVAS && (
        <>
          <Spacing size="3x-large"/>

          <h5>Canvas CSS selector</h5>
          <p>A CSS selector that targets the canvas on which your graphics are rendered</p>
          <InputText
            placeholder="canvas#my-canvas"
            value={settings.canvasSelector || ""}
            onChange={val => update("canvasSelector", val.target.value)}
          />
        </>
      )}
    </div>
  )
}