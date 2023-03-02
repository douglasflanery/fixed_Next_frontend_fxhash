import style from "./StepExtraSettings.module.scss"
import layout from "../../../styles/Layout.module.scss"
import cs from "classnames"
import { StepComponent } from "../../../types/Steps"
import {
  useMemo,
  useRef,
  useState,
  useCallback,
  ElementType,
  useEffect,
} from "react"
import { cloneDeep } from "@apollo/client/utilities"
import { GenTokenSettings } from "../../../types/Mint"
import { Form } from "../../../components/Form/Form"
import { Spacing } from "../../../components/Layout/Spacing"
import { Button } from "../../../components/Button"
import { HashTest } from "../../../components/Testing/HashTest"
import {
  ArtworkIframe,
  ArtworkIframeRef,
} from "../../../components/Artwork/PreviewIframe"
import { SquareContainer } from "../../../components/Layout/SquareContainer"
import { generateFxHash } from "../../../utils/hash"
import { ipfsUrlWithHashAndParams } from "../../../utils/ipfs"
import { LinkGuide } from "../../../components/Link/LinkGuide"
import {
  checkIsTabKeyActive,
  Tabs,
  TabDefinition,
} from "components/Layout/Tabs"
import { deserializeParams, serializeParams } from "components/FxParams/utils"
import { ControlsTest, ControlsTestRef } from "components/Testing/ControlsTest"
import { ArtworkFrame } from "components/Artwork/ArtworkFrame"
import { VariantForm } from "./VariantForm"

const variantSettingsTabs = ["preMint", "postMint"] as const

export type VariantSettingsTabKey = typeof variantSettingsTabs[number]

interface TabComponentProps {}

interface PressKitTabData {
  component: ElementType<TabComponentProps>
}
const tabsDefinitions: TabDefinition[] = [
  { key: "preMint", name: "Pre-mint" },
  { key: "postMint", name: "Post-mint" },
]
const initialSettings: Partial<GenTokenSettings> = {
  exploration: {
    preMint: {
      enabled: true,
      hashConstraints: null,
      paramsConstraints: null,
    },
    postMint: {
      enabled: true,
      hashConstraints: null,
      paramsConstraints: null,
    },
  },
}

const ExploreOptions = [
  {
    label: "Infinite",
    value: "infinite",
  },
  {
    label: "Constrained to a list of hashes",
    value: "constrained",
  },
]

export const StepExtraSettings: StepComponent = ({ state, onNext }) => {
  const usesParams = !!state.previewInputBytes
  const controlsTestRef = useRef<ControlsTestRef>(null)
  // STATES
  // form state (since not much data its ok to store there)
  const [settings, setSettings] = useState(
    state.settings ? cloneDeep(state.settings) : initialSettings
  )
  // current hash
  const [hash, setHash] = useState<string>(
    state.previewHash || generateFxHash()
  )
  const [params, setParams] = useState<any | null>([])
  const [data, setData] = useState<Record<string, any> | null>(null)
  // the explore options
  const [preExploreOptions, setPreExploreOptions] = useState<string>("infinite")
  const [postExploreOptions, setPostExploreOptions] =
    useState<string>("infinite")

  // REFERENCES
  const iframeRef = useRef<ArtworkIframeRef>(null)

  const inputBytes =
    useMemo<string | null>(() => {
      if (!data) return null
      return serializeParams(data, params)
    }, [data, params]) || state.previewInputBytes

  // DERIVED FROM STATE
  // the url to display in the iframe
  const iframeUrl = useMemo<string>(() => {
    return ipfsUrlWithHashAndParams(state.cidUrlParams!, hash, inputBytes)
  }, [hash, inputBytes])

  // FUNCTIONS
  // some setters to update the settings easily
  const updateExplorationSetting = (
    target: VariantSettingsTabKey,
    setting: "enabled" | "hashConstraints" | "paramsConstraints",
    value: any
  ) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      exploration: {
        ...currentSettings.exploration,
        [target]: {
          ...currentSettings.exploration![target],
          [setting]: value,
        },
      },
    }))
  }

  // add the current hash to the list of hashes of a mint category
  const addCurrentVariant = (target: VariantSettingsTabKey) => {
    const currentHashConstraints =
      settings.exploration?.[target]?.hashConstraints || []
    if (!currentHashConstraints.includes(hash)) {
      currentHashConstraints.push(hash)
      updateExplorationSetting(
        target,
        "hashConstraints",
        currentHashConstraints
      )
      if (usesParams && inputBytes) {
        const currentParamConstraints =
          settings.exploration?.[target]?.paramsConstraints || []
        currentParamConstraints.push(inputBytes)
        updateExplorationSetting(
          target,
          "paramsConstraints",
          currentParamConstraints
        )
      }
    }
  }

  // process the user input and turn inputs into a proper settings
  const onSubmit = (evt: any) => {
    evt.preventDefault()

    const cloned = cloneDeep(settings)
    // if explore options are set to infinite, we force hash list to be null
    if (
      preExploreOptions === "infinite" &&
      cloned.exploration?.preMint?.hashConstraints
    ) {
      cloned.exploration.preMint.hashConstraints = null
    }
    if (
      preExploreOptions === "infinite" &&
      cloned.exploration?.preMint?.paramsConstraints
    ) {
      cloned.exploration.preMint.paramsConstraints = null
    }
    if (
      postExploreOptions === "infinite" &&
      cloned.exploration?.postMint?.hashConstraints
    ) {
      cloned.exploration.postMint.hashConstraints = null
    }
    if (
      postExploreOptions === "infinite" &&
      cloned.exploration?.postMint?.paramsConstraints
    ) {
      cloned.exploration.postMint.paramsConstraints = null
    }
    // we can send the update of the settings to the next component in the tree
    onNext({ settings })
  }

  const [activeTab, setActiveTab] = useState<VariantSettingsTabKey>("preMint")

  const handleClickTab = useCallback(
    (newIdx, newDef) => {
      setActiveTab(newDef.key)
    },
    [setActiveTab]
  )

  // ALIASES
  const preMintSettings = settings.exploration?.preMint
  const postMintSettings = settings.exploration?.postMint

  useEffect(() => {
    const listener = (e: any) => {
      if (e.data) {
        if (e.data.id === "fxhash_getParams") {
          if (e.data.data) {
            setParams(e.data.data)
          } else {
            setParams(null)
          }
        }
      }
    }
    window.addEventListener("message", listener, false)

    return () => {
      window.removeEventListener("message", listener, false)
    }
  }, [])

  const handleOnIframeLoad = useCallback(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current.getHtmlIframe()
      if (iframe) {
        iframe.contentWindow?.postMessage("fxhash_getParams", "*")
      }
    }
  }, [iframeRef.current])

  const setVariant = (hash: string, paramBytes?: string) => {
    setHash(hash)
    if (paramBytes) {
      const data = deserializeParams(paramBytes, params, {
        withTransform: true,
      })
      setData(data)
      controlsTestRef?.current?.setData(data)
    }
  }

  const handleSubmitParams = (data: any) => {
    setData(data)
  }

  return (
    <div className={cs(style.container)}>
      <h3>Explore variations settings</h3>

      <p>
        These settings will help you define how much freedom users will have in
        exploring the variety of your Generative Token. When they land on the
        page of your Generative Token, a <strong>variations</strong> button can
        give them the ability to see more variations than the one you provided
        for the preview. These settings are independent from the random outputs
        collectors will generate when minting.
      </p>

      <p>
        If exploration is <strong>disabled</strong>, the variations buttons will
        be disabled on the Generative Token page.
      </p>

      <LinkGuide href="/doc/artist/explore-variation-settings" newTab>
        read more on the explore variation settings
      </LinkGuide>

      <Spacing size="x-large" />

      <Form onSubmit={onSubmit}>
        <div className={cs(layout.cols2)}>
          <div>
            <Tabs
              onClickTab={handleClickTab}
              checkIsTabActive={checkIsTabKeyActive}
              tabDefinitions={tabsDefinitions}
              activeIdx={activeTab}
            />
            <Spacing size="x-large" />
            {activeTab === "preMint" && (
              <VariantForm
                withParams={usesParams}
                target="preMint"
                settings={preMintSettings}
                exploreOption={preExploreOptions}
                onChangeExploreOption={setPreExploreOptions}
                onChangeExplorationSettings={updateExplorationSetting}
                activeHash={hash}
                onClickVariant={setVariant}
                onAdd={addCurrentVariant}
              />
            )}
            {activeTab === "postMint" && (
              <VariantForm
                withParams={usesParams}
                target="postMint"
                settings={postMintSettings}
                exploreOption={postExploreOptions}
                onChangeExploreOption={setPostExploreOptions}
                onChangeExplorationSettings={updateExplorationSetting}
                activeHash={hash}
                onClickVariant={setVariant}
                onAdd={addCurrentVariant}
              />
            )}
            <Spacing size="x-large" />
            <h4>Variant Configuration</h4>
            <Spacing size="regular" />
            <HashTest
              autoGenerate={false}
              value={hash}
              onHashUpdate={setHash}
              onRetry={() => {
                iframeRef.current?.reloadIframe()
              }}
            />
            {usesParams && (
              <>
                <Spacing size="x-large" />
                <ControlsTest
                  ref={controlsTestRef}
                  params={params}
                  onSubmit={handleSubmitParams}
                />
              </>
            )}
          </div>

          <div>
            <Spacing size="regular" />
            <div className={style.artworkWrapper}>
              <ArtworkFrame>
                <SquareContainer>
                  <ArtworkIframe
                    ref={iframeRef}
                    url={iframeUrl}
                    textWaiting="looking for content on IPFS"
                    onLoaded={handleOnIframeLoad}
                  />
                </SquareContainer>
              </ArtworkFrame>
            </div>
          </div>
        </div>

        <Spacing size="3x-large" sm="x-large" />

        <div className={cs(layout.y_centered)}>
          <Button
            type="submit"
            size="large"
            color="secondary"
            iconComp={<i aria-hidden className="fas fa-arrow-right" />}
            iconSide="right"
            className={style.button}
          >
            next step
          </Button>
        </div>
      </Form>

      <Spacing size="3x-large" />
      <Spacing size="3x-large" sm="none" />
      <Spacing size="3x-large" sm="none" />
    </div>
  )
}
